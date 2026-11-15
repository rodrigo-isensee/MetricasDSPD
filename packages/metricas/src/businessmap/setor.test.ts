import { describe, expect, it } from 'vitest'
import {
  METRICA_IDS,
  fonteDaMetrica,
  type FiltrosFluxo,
  type MetricaId,
} from '@metricas-dspd/contratos'
import { gerarBaseMock } from '@metricas-dspd/mock'
import { CALENDARIO_PADRAO } from '../core/calendario'
import { instanteDeIso } from '../core/calendario'
import { calcularMetrica } from '../calcular'
import { acelerato } from '..'
import { criarContextoBM, type BaseBM } from './index'
import { equipesDoRecorte, selecionar, setoresDe } from './comum'
import { calcularT11, EXTENSAO_TAMBEM_BM_VAZIA, calcularT14, calcularTendenciaFluxo } from './index'
import { HOJE_TESTE, umaBase } from './testing'

/**
 * 097, L10b (E7): o filtro Setor recorta pelo quadro atual do card. Propriedade: a métrica com setor X é igual à métrica
 * sobre a base só com os quadros de X. Setor é recorte; nenhuma resposta ganha bloco por setor.
 */
const SETOR_UM = 'Sistemas Corporativos'
const SETOR_DOIS = 'Plataformas'
const QUADROS_UM = [
  'quadro-erp-protheus',
  'quadro-fluig',
  'quadro-senior',
  'coord-erp-protheus',
  'coord-fluig',
  'coord-senior',
]
const QUADROS_DOIS = [
  'quadro-marketing-e-vendas',
  'quadro-dados',
  'quadro-plataforma-5g',
  'coord-marketing-e-vendas',
  'coord-dados',
  'coord-plataforma-5g',
]
const PERIODO = { tipo: '12s' } as const

const b = gerarBaseMock({})
const comSetores: BaseBM = {
  ...b.bm,
  setores: [
    ...QUADROS_UM.map((q) => ({ quadro_id: q, nome: SETOR_UM })),
    ...QUADROS_DOIS.map((q) => ({ quadro_id: q, nome: SETOR_DOIS })),
  ],
}
const ctxDe = (base: BaseBM) => ({
  bm: criarContextoBM(base, b.config.hoje, CALENDARIO_PADRAO),
  ac: acelerato.criarContextoAC(b.ac, b.config.hoje, CALENDARIO_PADRAO),
})
const ctx = ctxDe(comSetores)

/** Base só com os quadros dados (cards, transições, bloqueios, colunas e equipes deles), sem setores. */
function soOs(quadros: readonly string[]): BaseBM {
  const ids = new Set(
    comSetores.cards.filter((c) => quadros.includes(c.quadro_id)).map((c) => c.card_id),
  )
  const slugsEq = new Set(quadros.map((q) => q.replace(/^(quadro|coord)-/, '')))
  return {
    ...b.bm,
    cards: comSetores.cards.filter((c) => ids.has(c.card_id)),
    transicoes: comSetores.transicoes.filter((t) => ids.has(t.card_id)),
    bloqueios: comSetores.bloqueios.filter((x) => ids.has(x.card_id)),
    colunas: comSetores.colunas.filter((c) => quadros.includes(c.quadro_id)),
    config: {
      ...comSetores.config,
      equipes: comSetores.config.equipes.filter((e) =>
        slugsEq.has(
          e.nome
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''),
        ),
      ),
    },
  }
}

const f = (extra: Partial<FiltrosFluxo> = {}): FiltrosFluxo => ({
  equipe: [],
  tipo: [],
  sistema: [],
  periodo: PERIODO,
  ...extra,
})
const plano = (x: unknown): string => JSON.stringify(x)
const calc = (id: MetricaId, filtros: FiltrosFluxo, c = ctx) =>
  plano(calcularMetrica(id, filtros as never, c as never))

// Métricas do fluxo que se recortam por story pelo quadro do card (as de projeto ficam fora do recorte, abaixo). O T3 fica de fora da
// comparação com a base cortada porque a natureza da story vem do projeto-pai, que a base cortada perde; o recorte dele é o mesmo `selecionar`.
const POR_QUADRO: MetricaId[] = [
  'O1',
  'O2',
  'BLOQUEADOS',
  'O3',
  'O4',
  'O5',
  'O6',
  'O7',
  'O8',
  'O9',
  'O10',
  'O11',
  'O12',
  'O13',
  'O14',
  'O15',
  'O16',
  'O18',
  'O19',
  'O20',
  'O21',
  'T1',
  'T2',
  'T4',
  'T6',
  'T8',
  'T10',
  'T12',
  'EI_FL1',
]

describe('097 L10b: filtro Setor (quadro atual do card)', () => {
  it('setor X = métrica sobre a base só com os quadros de X (nas métricas por story)', () => {
    const violacoes: string[] = []
    for (const [slugSetor, quadros] of [
      ['sistemas-corporativos', QUADROS_UM],
      ['plataformas', QUADROS_DOIS],
    ] as const) {
      const so = ctxDe(soOs(quadros))
      for (const id of POR_QUADRO) {
        const com = calc(id, f({ setor: [slugSetor] }))
        const sem = calc(id, f(), so)
        if (com !== sem) violacoes.push(`${id} ${slugSetor}`)
      }
    }
    expect(violacoes).toEqual([])
  })

  it('setor vazio, ausente e "todos os setores" dão o mesmo número de sempre; setor muda o número', () => {
    for (const id of POR_QUADRO) {
      expect(calc(id, f({ setor: [] })), id).toBe(calc(id, f()))
    }
    expect(calc('O3', f({ setor: ['sistemas-corporativos', 'plataformas'] }))).toBe(calc('O3', f()))
    expect(calc('O3', f({ setor: ['sistemas-corporativos'] }))).not.toBe(calc('O3', f()))
    expect(calc('O1', f({ setor: ['sistemas-corporativos'] }))).not.toBe(calc('O1', f()))
  })

  it('a ordem dos setores não muda o resultado e o setor desconhecido zera, sem erro', () => {
    expect(calc('O3', f({ setor: ['plataformas', 'sistemas-corporativos'] }))).toBe(
      calc('O3', f({ setor: ['sistemas-corporativos', 'plataformas'] })),
    )
    const r = JSON.parse(calc('O4', f({ setor: ['inexistente'] }))) as { base: { n: number } }
    expect(r.base.n).toBe(0)
  })

  it('card de quadro sem setor ("Sem setor") fica fora de qualquer setor e dentro do Todos', () => {
    const base = umaBase([
      {
        id: 'A',
        criado: '2026-09-01T09:00-03:00',
        trilha: [['Aguardando priorização', '2026-09-01T09:00-03:00']],
      },
    ])
    const cx = criarContextoBM(base, HOJE_TESTE, CALENDARIO_PADRAO)
    expect(cx.idx.marcos[0]?.slugSetor).toBe('')
    expect(selecionar(cx, f(), 'story', { incluirInativos: true })).toHaveLength(1)
    expect(
      selecionar(cx, f({ setor: ['qualquer'] }), 'story', { incluirInativos: true }),
    ).toHaveLength(0)
    expect(
      selecionar(cx, f({ setor: ['qualquer'] }), 'story', {
        incluirInativos: true,
        semSetor: true,
      }),
    ).toHaveLength(1)
    // com o setor do quadro no dicionário, o card entra no setor
    const cs = criarContextoBM(
      { ...base, setores: [{ quadro_id: 'quadro-teste', nome: 'Plataformas' }] },
      HOJE_TESTE,
      CALENDARIO_PADRAO,
    )
    expect(cs.idx.marcos[0]?.slugSetor).toBe('plataformas')
    expect(
      selecionar(cs, f({ setor: ['plataformas'] }), 'story', { incluirInativos: true }),
    ).toHaveLength(1)
  })

  it('dois quadros com o mesmo nome de setor viram um setor só (consolidado)', () => {
    expect(ctx.bm.idx.setorDoQuadro.get('quadro-fluig')).toBe('sistemas-corporativos')
    expect(ctx.bm.idx.setorDoQuadro.get('quadro-senior')).toBe('sistemas-corporativos')
    expect(ctx.bm.idx.setorDoQuadro.get('quadro-gerencia')).toBeUndefined()
  })

  it('a memória da seleção separa setores: com e sem setor no mesmo contexto não se misturam', () => {
    const a = selecionar(ctx.bm, f({ setor: ['plataformas'] }), 'story')
    const todos = selecionar(ctx.bm, f(), 'story')
    const um = selecionar(ctx.bm, f({ setor: ['sistemas-corporativos'] }), 'story')
    expect(a.length).toBeGreaterThan(0)
    expect(a.length + um.length).toBe(todos.length)
    expect(a.every((m) => m.slugSetor === 'plataformas')).toBe(true)
  })

  it('projeto não se recorta por setor (decisão do dono: o quadro dos projetos fica fora do filtro) e o FL3 segue igual', () => {
    for (const id of ['E1', 'E3', 'E4', 'E5', 'E6', 'E9', 'E2', 'E7', 'EI_FL3'] as MetricaId[]) {
      expect(calc(id, f({ setor: ['plataformas'] })), id).toBe(calc(id, f()))
    }
    expect(
      selecionar(ctx.bm, f({ setor: ['plataformas'] }), 'projeto', { semSetor: true }).length,
    ).toBeGreaterThan(0)
    expect(selecionar(ctx.bm, f({ setor: ['plataformas'] }), 'projeto')).toHaveLength(0)
  })

  it('frente (FL2) é recortada pelo quadro dela', () => {
    const todas = selecionar(ctx.bm, f(), 'frente')
    const doSetor = selecionar(ctx.bm, f({ setor: ['plataformas'] }), 'frente')
    expect(todas.length).toBeGreaterThan(0)
    expect(doSetor.length).toBeLessThanOrEqual(todas.length)
    expect(doSetor.every((m) => m.slugSetor === 'plataformas')).toBe(true)
  })

  it('setoresDe: ausente = vazio', () => {
    expect(setoresDe(f())).toEqual([])
    expect(setoresDe(f({ setor: ['a'] }))).toEqual(['a'])
  })

  it('equipesDoRecorte: sem setor todas as equipes; com setor só as que têm coluna em quadro do setor', () => {
    expect(equipesDoRecorte(ctx.bm, f())).toBe(comSetores.config.equipes)
    const nomes = equipesDoRecorte(ctx.bm, f({ setor: ['plataformas'] })).map((e) => e.nome)
    expect(nomes.length).toBeGreaterThan(0)
    expect(nomes.length).toBeLessThan(comSetores.config.equipes.length)
    expect(equipesDoRecorte(ctx.bm, f({ setor: ['inexistente'] }))).toEqual([])
    // equipe cujo quadro não tem setor no dicionário fica fora de qualquer recorte por setor
    const semUm = criarContextoBM(
      {
        ...comSetores,
        setores: (comSetores.setores ?? []).filter((x) => x.quadro_id !== 'quadro-fluig'),
      },
      b.config.hoje,
      CALENDARIO_PADRAO,
    )
    expect(
      equipesDoRecorte(semUm, f({ setor: ['sistemas-corporativos'] })).map((e) => e.nome),
    ).not.toContain('Fluig')
    expect(
      equipesDoRecorte(ctx.bm, f({ setor: ['sistemas-corporativos'] })).map((e) => e.nome),
    ).toContain('Fluig')
  })

  it('equipe com colunas em dois quadros entra no recorte se algum deles é do setor', () => {
    const colunaFora = comSetores.colunas.find((c) => c.quadro_id === 'quadro-gerencia')
    expect(colunaFora).toBeDefined()
    const base: BaseBM = {
      ...comSetores,
      colunas: [
        ...comSetores.colunas,
        {
          ...(colunaFora as BaseBM['colunas'][number]),
          quadro_id: 'quadro-gerencia',
          papel: 'trabalho',
          equipe: 'Fluig',
        },
        ...comSetores.colunas
          .filter((c) => c.quadro_id === 'quadro-fluig')
          .map((c) => ({ ...c, equipe: 'Fluig' })),
      ],
    }
    const cx = criarContextoBM(base, b.config.hoje, CALENDARIO_PADRAO)
    expect(
      equipesDoRecorte(cx, f({ setor: ['sistemas-corporativos'] })).map((e) => e.nome),
    ).toContain('Fluig')
  })

  it('O2 e O20: a equipe fora do setor não traz as colunas dela (o detalhe por coluna segue o recorte)', () => {
    const o2 = (filtros: FiltrosFluxo) =>
      JSON.parse(calc('O2', filtros)) as { etapas: string[]; agrupadoPorColuna: boolean }
    expect(o2(f({ equipe: ['fluig'] })).agrupadoPorColuna).toBe(true)
    expect(o2(f({ equipe: ['fluig'], setor: ['sistemas-corporativos'] })).agrupadoPorColuna).toBe(
      true,
    )
    const fora = o2(f({ equipe: ['fluig'], setor: ['plataformas'] }))
    expect(fora.etapas).toEqual(['Fila', 'Execução'])
    const o20 = (filtros: FiltrosFluxo) =>
      JSON.parse(calc('O20', filtros)) as { agrupamento?: string; faixas: unknown[] }
    expect(plano(o20(f({ equipe: ['fluig'], setor: ['plataformas'] })))).not.toBe(
      plano(o20(f({ equipe: ['fluig'] }))),
    )
  })

  it('T9: o projeto fica fora do recorte e só as frentes dele são recortadas pelo setor', () => {
    const t9 = (filtros: FiltrosFluxo) =>
      JSON.parse(calc('T9', filtros)) as { projetos: { totalFrentes: number }[] }
    const todos = t9(f())
    const doSetor = t9(f({ setor: ['plataformas'] }))
    expect(doSetor.projetos.length).toBeGreaterThan(0)
    expect(doSetor.projetos.length).toBeLessThanOrEqual(todos.projetos.length)
    const soma = (r: typeof todos) => r.projetos.reduce((s, p) => s + p.totalFrentes, 0)
    expect(soma(doSetor)).toBeLessThan(soma(todos))
  })

  it('TENDENCIA_FLUXO pelo despacho: o setor chega ao cálculo', () => {
    const t = (setor?: string[]) =>
      plano(
        calcularMetrica(
          'TENDENCIA_FLUXO',
          (setor === undefined ? {} : { setor }) as never,
          ctx as never,
        ),
      )
    expect(t(['plataformas'])).not.toBe(t())
    expect(t([])).toBe(t())
  })

  it('O1: o limite de WIP é o das equipes do setor, não o de todas', () => {
    const lim = (s: string[]) =>
      (JSON.parse(calc('O1', f({ setor: s }))) as { serie: { limite: number }[] }).serie[0]?.limite
    const total = lim([])
    const um = lim(['sistemas-corporativos'])
    const dois = lim(['plataformas'])
    expect(um).toBeLessThan(total as number)
    expect((um as number) + (dois as number)).toBe(total)
  })

  it('T11: a entrada sazonal vale pelo quadro dela; sem quadro, fora de qualquer setor', () => {
    const entrada = (quadro?: string) => ({
      criado_em: instanteDeIso('2026-09-10T10:00:00-03:00', CALENDARIO_PADRAO),
      tipo: 'Melhoria' as const,
      equipe: 'Equipe A',
      sistema: 'Protheus',
      ...(quadro === undefined ? {} : { quadro_id: quadro }),
    })
    const ext = {
      ...EXTENSAO_TAMBEM_BM_VAZIA,
      entradasSazonais: [entrada('quadro-fluig'), entrada('quadro-dados'), entrada()],
    }
    const n = (s: string[]) => calcularT11(ctx.bm, f({ setor: s }), ext).base.n
    expect(n([])).toBe(3)
    expect(n(['sistemas-corporativos'])).toBe(1)
    expect(n(['plataformas'])).toBe(1)
    expect(n(['sistemas-corporativos', 'plataformas'])).toBe(2)
  })

  it('T14: o setor recorta os cards que contam, nunca os projetos', () => {
    const ext = { ...EXTENSAO_TAMBEM_BM_VAZIA }
    const r = (s: string[]) => calcularT14(ctx.bm, f({ equipe: ['fluig'], setor: s }), ext)
    expect(plano(r([]))).not.toBe('')
    expect(r(['inexistente']).porGranularidade.every((g) => g.projetos.length === 0)).toBe(true)
  })

  it('tendência do fluxo: o setor recorta o O3 de cada mês e vazio dá o resultado de sempre', () => {
    const todos = plano(calcularTendenciaFluxo(ctx.bm))
    expect(plano(calcularTendenciaFluxo(ctx.bm, [], []))).toBe(todos)
    const um = calcularTendenciaFluxo(ctx.bm, [], ['sistemas-corporativos'])
    const dois = calcularTendenciaFluxo(ctx.bm, [], ['plataformas'])
    const soma = (r: typeof um) => r.meses.reduce((s, m) => s + m.concluidos, 0)
    expect(soma(um) + soma(dois)).toBe(soma(calcularTendenciaFluxo(ctx.bm)))
    expect(soma(um)).toBeGreaterThan(0)
  })

  it('o Setor é só do BusinessMap: as métricas da sustentação ignoram setor e nenhum resultado traz bloco por setor', () => {
    for (const id of METRICA_IDS.filter((x) => fonteDaMetrica(x) === 'acelerato')) {
      const fs = { equipe: [], prioridade: [], periodo: PERIODO }
      expect(plano(calcularMetrica(id, { ...fs, setor: ['plataformas'] }, ctx as never))).toBe(
        plano(calcularMetrica(id, fs as never, ctx as never)),
      )
    }
    const todos = POR_QUADRO.map((id) => calc(id, f({ setor: ['plataformas'] }))).join('')
    expect(todos).not.toMatch(/porSetor|poSetor|"setor"|sistemas-corporativos/)
  })
})
