import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { resultadoT14 } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { CALENDARIO_PADRAO } from '../core/calendario'
import {
  calcularT14,
  chaveOutrosPublicavel,
  EXTENSAO_TAMBEM_BM_VAZIA,
  type ExtensaoTambemBM,
} from './index'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, trilhaSimples, umaBase, type EspecCard } from './testing'

const AZUL = 'Time Azul'
const VERDE = 'Time Verde'
const F: FiltrosFluxo = { equipe: ['time-azul'], tipo: [], sistema: [], periodo: { tipo: '12s' } }

/** Projeto em andamento (iniciado em julho, não concluído), no sistema dado. */
const projeto = (id: string, sistema: string, extra: Partial<EspecCard> = {}): EspecCard => ({
  id,
  gran: 'projeto',
  sistema,
  criado: '2026-06-01T08:00:00-03:00',
  trilha: [
    ['Aguardando priorização', '2026-06-01T08:00:00-03:00'],
    ['Pronto para desenvolver', '2026-06-02T08:00:00-03:00'],
    ['Em desenvolvimento', '2026-07-01T09:00:00-03:00'],
  ],
  ...extra,
})
const frente = (id: string, pai: string): EspecCard => ({
  id,
  gran: 'frente',
  pai,
  criado: '2026-06-10T08:00:00-03:00',
  trilha: trilhaSimples(
    '2026-06-10T08:00:00-03:00',
    '2026-06-11T08:00:00-03:00',
    '2026-06-12T08:00:00-03:00',
    '2026-09-30T10:00:00-03:00',
  ),
})
const demanda = (id: string, pai: string, extra: Partial<EspecCard> = {}): EspecCard => ({
  id,
  pai,
  criado: '2026-08-03T08:00:00-03:00',
  trilha: trilhaSimples(
    '2026-08-03T08:00:00-03:00',
    '2026-08-04T08:00:00-03:00',
    '2026-08-05T08:00:00-03:00',
    '2026-09-30T10:00:00-03:00',
  ),
  ...extra,
})

type Time = string | readonly string[] | null
interface Espec {
  /** Projeto e sua única frente; as demandas penduram na frente. */
  id: string
  sistema?: string
  /** Time de cada demanda, na ordem. */
  demandas: Time[]
}
function cenario(
  especs: Espec[],
  extra: {
    /** Padrão: "outros times" publicável em todos os projetos, nas duas granularidades, para os três "meus times" do teste. */
    outros?: Record<string, boolean>
    equipes?: { nome: string; sistemas: string[] }[]
  } = {},
) {
  const cards: EspecCard[] = []
  const times: Record<string, Time> = {}
  for (const e of especs) {
    cards.push(projeto(e.id, e.sistema ?? 'SisX'), frente(`${e.id}-f`, e.id))
    e.demandas.forEach((t, i) => {
      cards.push(demanda(`${e.id}-d${i}`, `${e.id}-f`))
      times[`${e.id}-d${i}`] = t
    })
  }
  const base = umaBase(cards)
  base.config.equipes = extra.equipes ?? [
    { nome: AZUL, sistemas: ['SisA'] },
    { nome: VERDE, sistemas: ['SisV'] },
  ]
  const ext: ExtensaoTambemBM = {
    ...EXTENSAO_TAMBEM_BM_VAZIA,
    equipeResponsavel: times,
    outrosPublicavel:
      extra.outros ??
      Object.fromEntries(
        especs.flatMap((e) =>
          ['time-azul', 'time-verde', 'time-novo'].flatMap((q) =>
            (['story', 'frente'] as const).map((g) => [chaveOutrosPublicavel(e.id, q, g), true]),
          ),
        ),
      ),
  }
  return { ctx: criarContextoBM(base, HOJE_TESTE, CALENDARIO_PADRAO), ext }
}
const pub = (id: string, equipe = 'time-azul', g: 'story' | 'frente' = 'story') => ({
  [chaveOutrosPublicavel(id, equipe, g)]: true,
})
const rep = (n: number, t: Time): Time[] => Array.from({ length: n }, () => t)
const story = (r: ReturnType<typeof calcularT14>) =>
  r.porGranularidade.find((g) => g.granularidade === 'story')
type Linha = ReturnType<typeof calcularT14>['porGranularidade'][number]['projetos'][number]
const linha = (r: ReturnType<typeof calcularT14>, id: string, g: 'story' | 'frente' = 'story') =>
  r.porGranularidade.find((x) => x.granularidade === g)?.projetos.find((p) => p.projetoId === id)
/** A linha visível do projeto (falha se ele estiver oculto). */
const proj = (r: ReturnType<typeof calcularT14>, id: string, g: 'story' | 'frente' = 'story') => {
  const l: Linha | undefined = linha(r, id, g)
  if (l?.oculto === true) throw new Error(`o projeto ${id} está oculto`)
  return l
}
/** A linha oculta do projeto (falha se ele estiver visível). */
const ocultoDe = (
  r: ReturnType<typeof calcularT14>,
  id: string,
  g: 'story' | 'frente' = 'story',
) => {
  const l = linha(r, id, g)
  if (l?.oculto !== true) throw new Error(`o projeto ${id} não está oculto`)
  return l
}

describe('T14: participação do meu time no projeto (Q-T14-1 = B, Q-T14-5 = D, R-1 = B)', () => {
  it('CA-28: com "Todas" ou mais de uma equipe, semEquipe e nada é calculado', () => {
    const { ctx, ext } = cenario([{ id: 'P1', demandas: rep(30, AZUL) }])
    for (const equipe of [[], ['time-azul', 'time-verde']]) {
      const r = calcularT14(ctx, { ...F, equipe }, ext)
      expect(r).toMatchObject({ semEquipe: true, equipe: null, porGranularidade: [] })
      expect(r.base.n).toBe(0)
      expect(SCHEMAS_RESULTADO.T14.safeParse(r).success).toBe(true)
    }
  })

  it('k + outros = n e n + semTime = total; "outros times" é um inteiro só, sem nome', () => {
    const demandas = [...rep(10, AZUL), ...rep(15, VERDE), ...rep(5, null)]
    const { ctx, ext } = cenario([{ id: 'P1', sistema: 'SisA', demandas }], { outros: pub('P1') })
    const r = calcularT14(ctx, F, ext)
    const p = proj(r, 'P1')
    expect(p).toMatchObject({ total: 30, semTime: 5, outrosTimes: 15 })
    expect(p?.meuTime).toEqual({ status: 'ok', k: 10, n: 25, pct: 40 })
    expect((p?.meuTime.k ?? 0) + (p?.outrosTimes ?? 0)).toBe(p?.meuTime.n)
    expect((p?.meuTime.n ?? 0) + (p?.semTime ?? 0)).toBe(p?.total)
    expect(r.equipe).toBe(AZUL)
    expect(SCHEMAS_RESULTADO.T14.safeParse(r).success).toBe(true)
  })

  it('R-1 = B e K-130: sem o booleano de publicação (falso ou ausente) a linha traz só meuTime.k', () => {
    const demandas = [...rep(10, AZUL), ...rep(15, VERDE), ...rep(5, null)]
    for (const outros of [{}, { [chaveOutrosPublicavel('P1', 'time-azul', 'story')]: false }]) {
      const { ctx, ext } = cenario([{ id: 'P1', sistema: 'SisA', demandas }], { outros })
      const r = calcularT14(ctx, F, ext)
      expect(ocultoDe(r, 'P1')).toEqual({
        oculto: true,
        projetoId: 'P1',
        codigo: 'P1',
        titulo: expect.any(String),
        meuTime: { k: 10 },
      })
      expect(SCHEMAS_RESULTADO.T14.safeParse(r).success).toBe(true)
    }
  })

  it('com um único outro time, "outros times" é publicado mesmo assim (Q-T14-6 = A), sem nome', () => {
    const { ctx, ext } = cenario(
      [{ id: 'P1', sistema: 'SisA', demandas: [...rep(5, AZUL), ...rep(25, VERDE)] }],
      { outros: pub('P1') },
    )
    const r = calcularT14(ctx, F, ext)
    expect(proj(r, 'P1')?.outrosTimes).toBe(25)
    expect(JSON.stringify(r)).not.toContain(VERDE)
  })

  it('CA-31, fronteira 19/20 do n com time informado, inclusive total >= 20 com n < 20', () => {
    const casos: [number, number, string][] = [
      [19, 0, 'insuficiente'],
      [20, 0, 'ok'],
      [19, 6, 'insuficiente'], // total 25, n 19
      [20, 5, 'ok'], // total 25, n 20
    ]
    for (const [comTime, semTime, status] of casos) {
      const demandas = [...rep(comTime - 4, VERDE), ...rep(4, AZUL), ...rep(semTime, null)]
      const { ctx, ext } = cenario([{ id: 'P1', sistema: 'SisA', demandas }])
      const p = proj(calcularT14(ctx, F, ext), 'P1')
      expect(p?.meuTime.status, `n=${comTime} semTime=${semTime}`).toBe(status)
      expect(p?.meuTime).toMatchObject({ k: 4, n: comTime })
      expect(p?.total).toBe(comTime + semTime)
      if (status === 'insuficiente') expect(p?.meuTime).not.toHaveProperty('pct')
    }
  })

  it('Q-T14-5 = D, CA-41: aparece o projeto ligado a sistema do meu time com 0% e o que tem 1 card do meu time; os outros não', () => {
    const { ctx, ext } = cenario([
      { id: 'ligado-zero', sistema: 'SisA', demandas: rep(25, VERDE) },
      { id: 'um-card', sistema: 'SisV', demandas: [AZUL, ...rep(24, VERDE)] },
      { id: 'alheio', sistema: 'SisV', demandas: rep(25, VERDE) },
    ])
    const r = calcularT14(ctx, F, ext)
    expect(
      story(r)
        ?.projetos.map((p) => p.projetoId)
        .sort(),
    ).toEqual(['ligado-zero', 'um-card'])
    expect(proj(r, 'ligado-zero')?.meuTime).toMatchObject({ k: 0, n: 25, pct: 0 })
  })

  it('a configuração de equipe -> sistemas pode vir da extensão (a base lida do banco ainda não a guarda); sem ela vale o ConfigBM', () => {
    const { ctx, ext } = cenario([{ id: 'P1', sistema: 'SisA', demandas: rep(25, VERDE) }], {
      equipes: [
        { nome: AZUL, sistemas: [] },
        { nome: VERDE, sistemas: [] },
      ],
    })
    // base sem sistema ligado ao meu time: o projeto de 0% não aparece
    expect(story(calcularT14(ctx, F, ext))?.projetos).toEqual([])
    const comConfig: ExtensaoTambemBM = {
      ...ext,
      configEquipes: [{ nome: AZUL, sistemas: ['SisA'] }],
    }
    expect(story(calcularT14(ctx, F, comConfig))?.projetos.map((p) => p.projetoId)).toEqual(['P1'])
    expect(calcularT14(ctx, F, comConfig).equipe).toBe(AZUL)
  })

  it('equipe que a configuração não conhece: o nome devolvido é o do filtro e só valem os projetos com card dela', () => {
    const { ctx, ext } = cenario([
      { id: 'P1', sistema: 'SisA', demandas: [...rep(5, 'Time Novo'), ...rep(20, AZUL)] },
      { id: 'P2', sistema: 'SisA', demandas: rep(25, AZUL) },
    ])
    const r = calcularT14(ctx, { ...F, equipe: ['time-novo'] }, ext)
    expect(r.equipe).toBe('time-novo')
    expect(story(r)?.projetos.map((p) => p.projetoId)).toEqual(['P1'])
  })

  it('projeto sem nenhum card da granularidade não entra no bloco (sem frentes, sem demandas)', () => {
    const base = umaBase([projeto('P-vazio', 'SisA')])
    base.config.equipes = [{ nome: AZUL, sistemas: ['SisA'] }]
    const ctx = criarContextoBM(base, HOJE_TESTE, CALENDARIO_PADRAO)
    const r = calcularT14(ctx, F, EXTENSAO_TAMBEM_BM_VAZIA)
    expect(r.porGranularidade.map((g) => g.projetos)).toEqual([[], []])
    expect(story(r)?.total).toMatchObject({ k: 0, n: 0 })
  })

  it('projeto descartado ou ainda não iniciado não é listado, mesmo com cards do meu time', () => {
    const cards: EspecCard[] = [
      projeto('P-ok', 'SisA'),
      frente('P-ok-f', 'P-ok'),
      demanda('P-ok-d', 'P-ok-f'),
      projeto('P-desc', 'SisA'),
      frente('P-desc-f', 'P-desc'),
      demanda('P-desc-d', 'P-desc-f'),
      projeto('P-novo', 'SisA', {
        trilha: [['Aguardando priorização', '2026-06-01T08:00:00-03:00']],
      }),
      frente('P-novo-f', 'P-novo'),
      demanda('P-novo-d', 'P-novo-f'),
    ]
    const base = umaBase(cards)
    base.config.equipes = [{ nome: AZUL, sistemas: ['SisA'] }]
    // descartado de verdade (P-1 = A): card excluído sem entrega
    base.cards = base.cards.map((c) =>
      c.card_id === 'P-desc' ? { ...c, excluido_em: c.criado_em + 86_400_000 } : c,
    )
    const ctx = criarContextoBM(base, HOJE_TESTE, CALENDARIO_PADRAO)
    const todos = Object.fromEntries(cards.map((c) => [c.id, AZUL]))
    const ext: ExtensaoTambemBM = { ...EXTENSAO_TAMBEM_BM_VAZIA, equipeResponsavel: todos }
    expect(story(calcularT14(ctx, F, ext))?.projetos.map((p) => p.projetoId)).toEqual(['P-ok'])
  })

  it('projeto concluído dentro do período é listado; o concluído antes dele não', () => {
    const concluido = (id: string, fim: string): EspecCard =>
      projeto(id, 'SisA', {
        trilha: trilhaSimples(
          '2026-03-01T08:00:00-03:00',
          '2026-03-02T08:00:00-03:00',
          '2026-03-03T09:00:00-03:00',
          fim,
        ),
      })
    const cards: EspecCard[] = [
      concluido('P-dentro', '2026-09-30T10:00:00-03:00'),
      frente('P-dentro-f', 'P-dentro'),
      demanda('P-dentro-d', 'P-dentro-f'),
      concluido('P-antes', '2026-06-30T10:00:00-03:00'),
      frente('P-antes-f', 'P-antes'),
      demanda('P-antes-d', 'P-antes-f'),
    ]
    const base = umaBase(cards)
    base.config.equipes = [{ nome: AZUL, sistemas: ['SisA'] }]
    const ctx = criarContextoBM(base, HOJE_TESTE, CALENDARIO_PADRAO)
    const ext: ExtensaoTambemBM = {
      ...EXTENSAO_TAMBEM_BM_VAZIA,
      equipeResponsavel: Object.fromEntries(cards.map((c) => [c.id, AZUL])),
    }
    expect(story(calcularT14(ctx, F, ext))?.projetos.map((p) => p.projetoId)).toEqual(['P-dentro'])
  })

  it('CA-30: ordena pelo total de demandas do projeto, do maior para o menor, e nunca pela participação', () => {
    const { ctx, ext } = cenario([
      { id: 'A-pequeno-todo-meu', sistema: 'SisA', demandas: rep(22, AZUL) },
      { id: 'B-grande-pouco-meu', sistema: 'SisA', demandas: [AZUL, ...rep(60, VERDE)] },
      { id: 'C-medio', sistema: 'SisA', demandas: [...rep(10, AZUL), ...rep(20, VERDE)] },
    ])
    expect(story(calcularT14(ctx, F, ext))?.projetos.map((p) => p.projetoId)).toEqual([
      'B-grande-pouco-meu',
      'C-medio',
      'A-pequeno-todo-meu',
    ])
  })

  it('o filtro de equipe só diz quem é "meu time": os outros times continuam na conta (não recorta a população)', () => {
    const { ctx, ext } = cenario([
      { id: 'P1', sistema: 'SisA', demandas: [...rep(8, AZUL), ...rep(22, VERDE)] },
    ])
    const azul = proj(calcularT14(ctx, F, ext), 'P1')
    const verde = proj(calcularT14(ctx, { ...F, equipe: ['time-verde'] }, ext), 'P1')
    expect(azul?.meuTime).toMatchObject({ k: 8, n: 30 })
    expect(verde?.meuTime).toMatchObject({ k: 22, n: 30 })
  })

  it('Q-T14-9 = A: com campo de múltipla escolha, conta como meu time se o meu estiver entre os marcados', () => {
    const demandas: Time[] = [
      ...rep(5, [AZUL, VERDE]),
      ...rep(5, [VERDE, 'Time Cinza']),
      ...rep(15, VERDE),
      [],
    ]
    const { ctx, ext } = cenario([{ id: 'P1', sistema: 'SisA', demandas }], { outros: pub('P1') })
    const p = proj(calcularT14(ctx, F, ext), 'P1')
    expect(p?.meuTime).toMatchObject({ k: 5, n: 25 })
    expect(p?.outrosTimes).toBe(20)
    expect(p?.semTime).toBe(1)
  })

  it('CA-32: demanda e frente em blocos separados (nunca juntas); descartado, subtarefa e o próprio projeto não entram', () => {
    const { ctx, ext } = cenario([{ id: 'P1', sistema: 'SisA', demandas: rep(22, AZUL) }])
    const base = ctx.idx.base
    const cards = [
      ...base.cards,
      ...umaBase([
        demanda('descartada', 'P1-f', { descarte: '2026-09-05T08:00:00-03:00' }),
        demanda('subtarefa', 'P1-f', { subtarefa: true }),
      ]).cards,
    ]
    const ctx2 = criarContextoBM({ ...base, cards }, HOJE_TESTE, CALENDARIO_PADRAO)
    const ext2: ExtensaoTambemBM = {
      ...ext,
      equipeResponsavel: {
        ...ext.equipeResponsavel,
        'P1-f': AZUL,
        descartada: AZUL,
        subtarefa: AZUL,
        P1: AZUL,
      },
    }
    const r = calcularT14(ctx2, F, ext2)
    expect(r.porGranularidade.map((g) => g.granularidade)).toEqual(['story', 'frente'])
    expect(proj(r, 'P1')).toMatchObject({ total: 22 })
    expect(proj(r, 'P1', 'frente')).toMatchObject({ total: 1 })
  })

  it('o filtro de sistema escolhe os projetos e o de período mantém só os que estiveram em andamento nele', () => {
    const { ctx, ext } = cenario([
      { id: 'P-A', sistema: 'SisA', demandas: rep(22, AZUL) },
      { id: 'P-V', sistema: 'SisV', demandas: [AZUL, ...rep(21, VERDE)] },
    ])
    expect(
      story(calcularT14(ctx, { ...F, sistema: ['sisa'] }, ext))?.projetos.map((p) => p.projetoId),
    ).toEqual(['P-A'])
    // período inteiro antes do início dos projetos (01/07): nenhum em andamento
    const antes = calcularT14(
      ctx,
      { ...F, periodo: { tipo: 'custom', de: '2026-05-01', ate: '2026-06-15' } },
      ext,
    )
    expect(story(antes)?.projetos).toEqual([])
  })

  it('o total do bloco soma os projetos listados com a mesma regra do mínimo de 20', () => {
    const { ctx, ext } = cenario([
      { id: 'P1', sistema: 'SisA', demandas: [...rep(6, AZUL), ...rep(6, VERDE)] },
      { id: 'P2', sistema: 'SisA', demandas: [...rep(4, AZUL), ...rep(6, VERDE)] },
    ])
    expect(story(calcularT14(ctx, F, ext))?.total).toEqual({
      status: 'ok',
      k: 10,
      n: 22,
      pct: (10 / 22) * 100,
    })
    const so1 = cenario([
      { id: 'P1', sistema: 'SisA', demandas: [...rep(6, AZUL), ...rep(6, VERDE)] },
    ])
    expect(story(calcularT14(so1.ctx, F, so1.ext))?.total).toEqual({
      status: 'insuficiente',
      k: 6,
      n: 12,
      minimo: 20,
    })
  })

  it('sem extensão: nenhum card tem time, todo projeto sai oculto com k = 0 (nunca erro, fail-closed)', () => {
    const { ctx } = cenario([{ id: 'P1', sistema: 'SisA', demandas: rep(22, AZUL) }])
    const r = calcularT14(ctx, F, undefined)
    expect(ocultoDe(r, 'P1').meuTime).toEqual({ k: 0 })
    expect(SCHEMAS_RESULTADO.T14.safeParse(r).success).toBe(true)
  })

  it('nenhuma outra equipe, número de pessoas nem campo de pessoa na saída; o schema é estrito', () => {
    const { ctx, ext } = cenario(
      [
        {
          id: 'P1',
          sistema: 'SisA',
          demandas: [...rep(5, AZUL), ...rep(10, VERDE), ...rep(10, 'Time Cinza')],
        },
      ],
      { outros: pub('P1') },
    )
    const r = calcularT14(ctx, F, ext)
    const txt = JSON.stringify(r)
    expect(txt).not.toContain(VERDE)
    expect(txt).not.toContain('Cinza')
    expect(txt).not.toMatch(/Pessoa|responsave|pessoas/i)
    expect(Object.keys(proj(r, 'P1') ?? {}).sort()).toEqual([
      'codigo',
      'meuTime',
      'oculto',
      'outrosTimes',
      'projetoId',
      'semTime',
      'titulo',
      'total',
    ])
    expect(resultadoT14.safeParse({ ...r, porEquipe: [] }).success).toBe(false)
  })
})

describe('K-130: o projeto com "outros times" oculto não deixa deduzir n - k (T14-M1 = B)', () => {
  const todosPub = (ids: string[], publicar: (id: string) => boolean = () => true) =>
    Object.fromEntries(
      ids.flatMap((id) =>
        (['story', 'frente'] as const).map((g) => [
          chaveOutrosPublicavel(id, 'time-azul', g),
          publicar(id),
        ]),
      ),
    )
  const FORMA_OCULTO = ['codigo', 'meuTime', 'oculto', 'projetoId', 'titulo']

  it('D1, CA-1: a linha oculta traz só projetoId, codigo, titulo e meuTime.k; sentinelas 47, 41 e 213 não saem', () => {
    // 47 do meu time, 213 de outros times, 41 sem time: total 301
    const demandas = [...rep(47, AZUL), ...rep(213, VERDE), ...rep(41, null)]
    const { ctx, ext } = cenario([{ id: 'P1', sistema: 'SisA', demandas }], { outros: {} })
    const r = calcularT14(ctx, F, ext)
    const o = ocultoDe(r, 'P1')
    expect(Object.keys(o).sort()).toEqual(FORMA_OCULTO)
    expect(o.meuTime).toEqual({ k: 47 })
    const numeros = JSON.stringify(story(r)?.projetos).match(/\d+/g) ?? []
    for (const valor of ['213', '41', '260', '301']) expect(numeros).not.toContain(valor)
    expect(SCHEMAS_RESULTADO.T14.safeParse(r).success).toBe(true)
  })

  it('D1: variar o n (outros times e sem time) mantendo k dá a mesma linha oculta', () => {
    const a = cenario(
      [{ id: 'P1', sistema: 'SisA', demandas: [...rep(5, AZUL), ...rep(10, VERDE)] }],
      {
        outros: {},
      },
    )
    const b = cenario(
      [
        {
          id: 'P1',
          sistema: 'SisA',
          demandas: [...rep(5, AZUL), ...rep(90, VERDE), ...rep(7, null)],
        },
      ],
      { outros: {} },
    )
    expect(story(calcularT14(a.ctx, F, a.ext))?.projetos).toEqual(
      story(calcularT14(b.ctx, F, b.ext))?.projetos,
    )
  })

  it('D2, CA-2, CA-3: o total do bloco e a base somam só os visíveis, e o oculto nunca entra em soma', () => {
    const visivel: Espec = {
      id: 'V',
      sistema: 'SisA',
      demandas: [...rep(6, AZUL), ...rep(14, VERDE)],
    }
    const oculto: Espec = {
      id: 'O',
      sistema: 'SisA',
      demandas: [...rep(3, AZUL), ...rep(213, VERDE)],
    }
    const com = cenario([visivel, oculto], { outros: todosPub(['V'], () => true) })
    const sem = cenario([visivel], { outros: todosPub(['V']) })
    const rCom = calcularT14(com.ctx, F, com.ext)
    const rSem = calcularT14(sem.ctx, F, sem.ext)
    expect(ocultoDe(rCom, 'O').meuTime).toEqual({ k: 3 })
    // com e sem o projeto oculto (o filtro de sistema o exclui): totais e base idênticos
    expect(story(rCom)?.total).toEqual(story(rSem)?.total)
    expect(rCom.base).toEqual(rSem.base)
    expect(story(rCom)?.total).toMatchObject({ k: 6, n: 20 })
    expect(rCom.base.n).toBe(20)
    expect(rCom.base.complemento?.n).toBe(rSem.base.complemento?.n)
    expect(JSON.stringify(rCom)).not.toContain('213')
    // com filtro de sistema que exclui o oculto, as duas respostas diferem só pela linha oculta
    const outroSistema = cenario([visivel, { ...oculto, sistema: 'SisZ' }], {
      outros: todosPub(['V']),
    })
    const filtrada = calcularT14(outroSistema.ctx, { ...F, sistema: ['sisa'] }, outroSistema.ext)
    expect(story(filtrada)?.total).toEqual(story(rCom)?.total)
    expect(filtrada.base).toEqual(rCom.base)
  })

  it('D3, CA-4: a ordem dos ocultos é por código e não depende do total; ocultos vêm depois dos visíveis', () => {
    const grande = (n: number): Espec[] => [
      { id: 'Z-oculto', sistema: 'SisA', demandas: [AZUL, ...rep(n, VERDE)] },
      { id: 'B-oculto', sistema: 'SisA', demandas: [AZUL, ...rep(2, VERDE)] },
      { id: 'M-visivel', sistema: 'SisA', demandas: [...rep(5, AZUL), ...rep(5, VERDE)] },
      { id: 'A-visivel', sistema: 'SisA', demandas: [...rep(30, AZUL), ...rep(30, VERDE)] },
    ]
    const ordem = (n: number) => {
      const { ctx, ext } = cenario(grande(n), {
        outros: todosPub(['M-visivel', 'A-visivel']),
      })
      return story(calcularT14(ctx, F, ext))?.projetos.map((p) => `${p.projetoId}:${p.oculto}`)
    }
    expect(ordem(10)).toEqual([
      'A-visivel:false',
      'M-visivel:false',
      'B-oculto:true',
      'Z-oculto:true',
    ])
    // o total do oculto muda (de 11 para 500) e a ordem não muda
    expect(ordem(500)).toEqual(ordem(10))
  })

  it('D5, CA-9: chave de outrosPublicavel ausente oculta o projeto (fail-closed); só `true` publica', () => {
    const { ctx, ext } = cenario([{ id: 'P1', sistema: 'SisA', demandas: rep(25, AZUL) }], {
      outros: {},
    })
    expect(ocultoDe(calcularT14(ctx, F, ext), 'P1').meuTime).toEqual({ k: 25 })
    const naoBooleano = {
      ...ext,
      outrosPublicavel: {
        [chaveOutrosPublicavel('P1', 'time-azul', 'story')]: 1 as unknown as boolean,
      },
    }
    expect(ocultoDe(calcularT14(ctx, F, naoBooleano), 'P1').oculto).toBe(true)
  })

  it('CA-8: nenhum número de pessoas e nenhum nome de outra equipe em visível nem oculto', () => {
    const { ctx, ext } = cenario(
      [
        { id: 'V', sistema: 'SisA', demandas: [...rep(5, AZUL), ...rep(10, VERDE)] },
        { id: 'O', sistema: 'SisA', demandas: [...rep(5, AZUL), ...rep(10, VERDE)] },
      ],
      { outros: todosPub(['V'], () => true) },
    )
    const txt = JSON.stringify(calcularT14(ctx, F, ext))
    expect(txt).not.toMatch(/pessoas|membro|Verde/i)
  })

  it('o contrato é estrito: o oculto não aceita total, semTime, n nem outrosTimes, e o visível não aceita oculto ausente', () => {
    const { ctx, ext } = cenario(
      [
        { id: 'V', sistema: 'SisA', demandas: [...rep(5, AZUL), ...rep(15, VERDE)] },
        { id: 'O', sistema: 'SisA', demandas: [...rep(5, AZUL), ...rep(15, VERDE)] },
      ],
      { outros: todosPub(['V']) },
    )
    const r = calcularT14(ctx, F, ext)
    expect(resultadoT14.safeParse(r).success).toBe(true)
    const troca = (i: number, extra: Record<string, unknown>) => ({
      ...r,
      porGranularidade: r.porGranularidade.map((g) =>
        g.granularidade === 'story'
          ? { ...g, projetos: g.projetos.map((p, j) => (j === i ? { ...p, ...extra } : p)) }
          : g,
      ),
    })
    // índice 0 = visível, 1 = oculto
    for (const extra of [{ total: 20 }, { semTime: 0 }, { outrosTimes: 15 }, { n: 20 }])
      expect(resultadoT14.safeParse(troca(1, extra)).success, JSON.stringify(extra)).toBe(false)
    expect(resultadoT14.safeParse(troca(1, { meuTime: { k: 5, n: 20 } })).success).toBe(false)
    expect(resultadoT14.safeParse(troca(0, { outrosTimes: null })).success).toBe(false)
    expect(resultadoT14.safeParse(troca(0, { oculto: undefined })).success).toBe(false)
    expect(resultadoT14.safeParse(troca(0, { pessoas: 3 })).success).toBe(false)
  })

  describe('propriedades (desenho 048, seção 2) para qualquer base, equipe e cadastro de publicação', () => {
    const projetoArb = fc.record({
      k: fc.integer({ min: 0, max: 30 }),
      v: fc.integer({ min: 0, max: 30 }),
      c: fc.integer({ min: 0, max: 10 }),
      s: fc.integer({ min: 0, max: 10 }),
      pub: fc.boolean(),
    })
    const projetosArb = fc.array(projetoArb, { minLength: 1, maxLength: 5 })
    const monta = (ps: { k: number; v: number; c: number; s: number; pub: boolean }[]) => {
      const especs: Espec[] = ps.map((p, i) => ({
        id: `P${i}`,
        sistema: 'SisA',
        demandas: [
          ...rep(p.k, AZUL),
          ...rep(p.v, VERDE),
          ...rep(p.c, 'Time Cinza'),
          ...rep(p.s, null),
        ],
      }))
      const outros = (ids: string[]) =>
        Object.fromEntries(
          ids.flatMap((id) =>
            (['story', 'frente'] as const).map((g) => [
              chaveOutrosPublicavel(id, 'time-azul', g),
              true,
            ]),
          ),
        )
      return { especs, outros }
    }

    it('(1) a linha oculta não tem total, semTime, n nem outrosTimes; (4) k + outrosTimes = n só nas visíveis', () => {
      fc.assert(
        fc.property(projetosArb, (ps) => {
          const { especs, outros } = monta(ps)
          const ids = especs.filter((_, i) => ps[i]?.pub).map((e) => e.id)
          const { ctx, ext } = cenario(especs, { outros: outros(ids) })
          const r = calcularT14(ctx, F, ext)
          expect(SCHEMAS_RESULTADO.T14.safeParse(r).success).toBe(true)
          for (const g of r.porGranularidade)
            for (const p of g.projetos) {
              if (p.oculto) {
                expect(Object.keys(p).sort()).toEqual(FORMA_OCULTO)
                expect(Object.keys(p.meuTime)).toEqual(['k'])
              } else {
                expect(p.meuTime.k + p.outrosTimes).toBe(p.meuTime.n)
                expect(p.meuTime.n + p.semTime).toBe(p.total)
              }
            }
        }),
        { numRuns: 60 },
      )
    })

    it('(2) total do bloco, base.n e base.complemento.n são a soma só dos visíveis; (3) o n do oculto não sai por subtração', () => {
      fc.assert(
        fc.property(projetosArb, (ps) => {
          const { especs, outros } = monta(ps)
          const ids = especs.filter((_, i) => ps[i]?.pub).map((e) => e.id)
          const completo = cenario(especs, { outros: outros(ids) })
          const r = calcularT14(completo.ctx, F, completo.ext)
          const soma = (g: 'story' | 'frente') => {
            const linhas = r.porGranularidade.find((b) => b.granularidade === g)?.projetos ?? []
            const v = linhas.filter((l) => !l.oculto)
            return {
              k: v.reduce((a, l) => a + l.meuTime.k, 0),
              n: v.reduce((a, l) => a + ('n' in l.meuTime ? l.meuTime.n : 0), 0),
            }
          }
          const bloco = (g: 'story' | 'frente') =>
            r.porGranularidade.find((b) => b.granularidade === g)
          expect(bloco('story')?.total).toMatchObject(soma('story'))
          expect(bloco('frente')?.total).toMatchObject(soma('frente'))
          expect(r.base.n).toBe(soma('story').n)
          expect(r.base.complemento?.n).toBe(soma('frente').n)
          // sem os projetos ocultos (nunca estiveram na soma): total do bloco e base idênticos
          const so = especs.filter((_, i) => ps[i]?.pub)
          const visiveis = cenario(so, { outros: outros(ids) })
          const rv = calcularT14(visiveis.ctx, F, visiveis.ext)
          expect(rv.base).toEqual(r.base)
          expect(rv.porGranularidade.map((b) => b.total)).toEqual(
            r.porGranularidade.map((b) => b.total),
          )
        }),
        { numRuns: 60 },
      )
    })

    it('(1) e D1: variar o n do projeto oculto mantendo k não muda nenhum byte da resposta', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 30 }),
          fc.tuple(fc.integer({ min: 0, max: 80 }), fc.integer({ min: 0, max: 20 })),
          fc.tuple(fc.integer({ min: 0, max: 80 }), fc.integer({ min: 0, max: 20 })),
          (k, [v1, s1], [v2, s2]) => {
            const rodar = (v: number, s: number) => {
              const { ctx, ext } = cenario(
                [
                  {
                    id: 'P1',
                    sistema: 'SisA',
                    demandas: [...rep(k, AZUL), ...rep(v, VERDE), ...rep(s, null)],
                  },
                ],
                { outros: {} },
              )
              const r = calcularT14(ctx, F, ext)
              return story(r)?.projetos.length === 0
                ? []
                : JSON.stringify(story(r)) + JSON.stringify(r.base)
            }
            // a base do projeto oculto fica fora da soma: a base é 0 nos dois casos
            expect(rodar(v1, s1)).toBe(rodar(v2, s2))
          },
        ),
        { numRuns: 60 },
      )
    })
  })
})
