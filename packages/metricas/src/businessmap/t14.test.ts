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
    outrosPublicavel: extra.outros ?? {},
  }
  return { ctx: criarContextoBM(base, HOJE_TESTE, CALENDARIO_PADRAO), ext }
}
const pub = (id: string, equipe = 'time-azul', g: 'story' | 'frente' = 'story') => ({
  [chaveOutrosPublicavel(id, equipe, g)]: true,
})
const rep = (n: number, t: Time): Time[] => Array.from({ length: n }, () => t)
const story = (r: ReturnType<typeof calcularT14>) =>
  r.porGranularidade.find((g) => g.granularidade === 'story')
const proj = (r: ReturnType<typeof calcularT14>, id: string, g: 'story' | 'frente' = 'story') =>
  r.porGranularidade.find((x) => x.granularidade === g)?.projetos.find((p) => p.projetoId === id)

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

  it('R-1 = B: sem o booleano de publicação (falso ou ausente) "outros times" é null e o resto do projeto sai', () => {
    const demandas = [...rep(10, AZUL), ...rep(15, VERDE), ...rep(5, null)]
    for (const outros of [{}, { [chaveOutrosPublicavel('P1', 'time-azul', 'story')]: false }]) {
      const { ctx, ext } = cenario([{ id: 'P1', sistema: 'SisA', demandas }], { outros })
      const p = proj(calcularT14(ctx, F, ext), 'P1')
      expect(p?.outrosTimes).toBeNull()
      expect(p).toMatchObject({ total: 30, semTime: 5 })
      expect(p?.meuTime).toMatchObject({ k: 10, n: 25 })
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

  it('sem extensão: todo card é "sem time" e nada passa de k = 0 (nunca erro)', () => {
    const { ctx } = cenario([{ id: 'P1', sistema: 'SisA', demandas: rep(22, AZUL) }])
    const r = calcularT14(ctx, F, undefined)
    expect(proj(r, 'P1')).toMatchObject({ total: 22, semTime: 22, outrosTimes: null })
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
      'outrosTimes',
      'projetoId',
      'semTime',
      'titulo',
      'total',
    ])
    expect(resultadoT14.safeParse({ ...r, porEquipe: [] }).success).toBe(false)
  })
})
