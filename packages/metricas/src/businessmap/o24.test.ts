import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { gerarBaseBusinessMap, gerarBaseMock } from '@metricas-dspd/mock'
import { CALENDARIO_PADRAO } from '../core/calendario'
import { fimDeVidaAberta } from './descartado'
import { calcularO24 } from './index'
import { criarContextoBM, type ContextoBM } from './indice'
import { HOJE_TESTE, umaBase, type EspecCard } from './testing'
import type { DimCard } from './modelo'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const ctxDe = (cards: EspecCard[], ajuste: (c: DimCard) => DimCard = (c) => c): ContextoBM => {
  const base = umaBase(cards)
  return criarContextoBM({ ...base, cards: base.cards.map(ajuste) }, HOJE_TESTE, CALENDARIO_PADRAO)
}
const muitos = <T>(n: number, f: (i: number) => T) => Array.from({ length: n }, (_, i) => f(i))

/** Card iniciado em `ini` (Em desenvolvimento); sem `ini`, fica na fila de priorização. */
const card = (id: string, criado: string, ini: string | null, extra: Partial<EspecCard> = {}) => ({
  id,
  criado,
  trilha: [
    ['Aguardando priorização', criado],
    ...(ini ? [['Em desenvolvimento', ini] as [string, string]] : []),
  ] as [string, string][],
  ...extra,
})
const C1 = '2026-09-01T08:00:00-03:00'
const C2 = '2026-09-02T08:00:00-03:00'
const I1 = '2026-09-14T09:00:00-03:00'
const I2 = '2026-09-21T09:00:00-03:00' // 5 dias úteis depois de I1
/** `n` pares: o mais novo inicia primeiro (I1) e o mais antigo depois (I2). */
const pares = (n: number, extra: Partial<EspecCard> = {}): EspecCard[] =>
  muitos(n, (i) => [
    card(`antigo${i}`, C1, I2, extra),
    card(`novo${i}`, C2, I1, { ...extra, id: `novo${i}` }),
  ]).flat()

describe('O24: ordem de chegada', () => {
  it('um card que inicia com um mais antigo, do mesmo grupo, ainda esperando está fora de ordem (CA-17)', () => {
    const r = calcularO24(ctxDe([card('a', C1, I2), card('b', C2, I1)]), F)
    expect(r.inicios).toEqual({ status: 'insuficiente', k: 1, n: 2, minimo: 20 })
    expect(r.meses).toEqual([
      { mes: '2026-08', emOrdem: 0, foraDeOrdem: 0, emAndamento: false },
      { mes: '2026-09', emOrdem: 1, foraDeOrdem: 1, emAndamento: false },
      { mes: '2026-10', emOrdem: 0, foraDeOrdem: 0, emAndamento: true },
    ])
    expect(r.grupo).toBe('equipe-tipo-padrao')
    expect(r.base).toMatchObject({ n: 2 })
    expect(SCHEMAS_RESULTADO.O24.safeParse(r).success).toBe(true)
  })

  it('o percentual de inícios só sai com 20 ou mais (19/20)', () => {
    const r19 = calcularO24(ctxDe(pares(9).concat([card('so', C1, I2)])), F) // 19 inícios
    expect(r19.inicios).toMatchObject({ status: 'insuficiente', k: 9, n: 19 })
    const r20 = calcularO24(ctxDe(pares(10)), F) // 20 inícios, 10 fora de ordem
    expect(r20.inicios).toEqual({ status: 'ok', k: 10, n: 20, pct: 50 })
  })

  it('custo da ultrapassagem (R-1 = A, CA-37): dias úteis do início do primeiro que passou na frente até o início do ultrapassado', () => {
    // a (criado 01/09) espera; b inicia 14/09 (primeiro que passa), c inicia 16/09 (segundo); a inicia 21/09
    const r = calcularO24(
      ctxDe([
        ...muitos(20, (i) => card(`a${i}`, C1, I2)),
        card('b', C2, I1),
        card('c', '2026-09-03T08:00:00-03:00', '2026-09-16T09:00:00-03:00'),
      ]),
      F,
    )
    const c = r.custo.porTipo[0]!
    expect(c).toMatchObject({ tipo: 'Melhoria', ultrapassados: 20 })
    // 14/09 -> 21/09 = 5 dias úteis (nunca 16/09 -> 21/09 = 3)
    expect(c.estatistica).toMatchObject({ status: 'ok', n: 20, valor: { p50: 5, p85: 5, p95: 5 } })
  })

  it('P50/P85 do custo só com 20 ultrapassados no tipo (19/20)', () => {
    const ok = calcularO24(ctxDe(pares(20)), F).custo.porTipo[0]!
    expect(ok.estatistica).toMatchObject({ status: 'ok', n: 20 })
    const pouco = calcularO24(ctxDe(pares(19)), F).custo.porTipo[0]!
    expect(pouco).toMatchObject({ ultrapassados: 19 })
    expect(pouco.estatistica).toMatchObject({ status: 'insuficiente', n: 19 })
    expect(JSON.stringify(pouco.estatistica)).not.toContain('p50')
  })

  it('regra 7: o custo é por tipo e cada tipo exige 20 (nunca juntos)', () => {
    const r = calcularO24(
      ctxDe([
        ...pares(20),
        ...pares(19, { tipo: 'Incidente' }).map((e) => ({ ...e, id: `i${e.id}` })),
      ]),
      F,
    )
    expect(r.custo.segmentoPor).toBe('tipo')
    expect(r.custo.porTipo.map((t) => t.tipo)).toEqual(['Incidente', 'Melhoria'])
    expect(r.custo.porTipo[0]!.estatistica).toMatchObject({ status: 'insuficiente', n: 19 })
    expect(r.custo.porTipo[1]!.estatistica).toMatchObject({ status: 'ok', n: 20 })
  })

  it('ultrapassado que ainda não iniciou fica fora da estatística (e fora da contagem de ultrapassados)', () => {
    const r = calcularO24(
      ctxDe(muitos(25, (i) => card(`a${i}`, C1, null)).concat([card('b', C2, I1)])),
      F,
    )
    expect(r.inicios).toMatchObject({ k: 1, n: 1 })
    expect(r.custo.porTipo).toEqual([])
  })

  it('Urgente, Prazo fixo e Intangível ficam fora, como quem passa na frente e como quem espera (CA-17)', () => {
    for (const classe of ['Urgente', 'Prazo fixo', 'Intangível'] as const) {
      // o mais novo é da outra classe e passa na frente do Padrão antigo: não é início do O24, e o Padrão fica em ordem
      const passa = calcularO24(ctxDe([card('a', C1, I2), card('b', C2, I1, { classe })]), F)
      expect(passa.base.n, classe).toBe(1)
      expect(passa.inicios, classe).toMatchObject({ k: 0, n: 1 })
      expect(passa.custo.porTipo, classe).toEqual([])
      // o mais antigo é da outra classe e espera: não conta como ultrapassado
      const espera = calcularO24(ctxDe([card('a', C1, I2, { classe }), card('b', C2, I1)]), F)
      expect(espera.inicios, classe).toMatchObject({ k: 0, n: 1 })
      expect(espera.custo.porTipo, classe).toEqual([])
    }
  })

  it('só compara com o mesmo tipo', () => {
    const r = calcularO24(ctxDe([card('a', C1, I2, { tipo: 'Incidente' }), card('b', C2, I1)]), F)
    expect(r.inicios).toMatchObject({ k: 0, n: 2 })
  })

  it('a fila é a de cada equipe: o mais antigo de outra equipe (quadro) não conta; nada compara equipes', () => {
    const outraEquipe = (c: DimCard): DimCard =>
      c.card_id === 'a' ? { ...c, quadro_id: 'quadro-b', equipe: 'Equipe B' } : c
    const r = calcularO24(ctxDe([card('a', C1, I2), card('b', C2, I1)], outraEquipe), F)
    expect(r.inicios).toMatchObject({ k: 0, n: 2 })
    expect(r.custo.porTipo).toEqual([])
    const mesma = calcularO24(ctxDe([card('a', C1, I2), card('b', C2, I1)]), F)
    expect(mesma.inicios).toMatchObject({ k: 1, n: 2 })
  })

  it('R5: nenhuma faixa, grupo ou série do resultado é equipe nem pessoa', () => {
    const outras = (c: DimCard): DimCard =>
      c.card_id.endsWith('1') ? { ...c, quadro_id: 'quadro-b', equipe: 'Equipe B' } : c
    const r = calcularO24(ctxDe(pares(12), outras), F)
    const json = JSON.stringify({ ...r, grupo: undefined }) // `grupo` é o nome do critério, não um valor por equipe
    expect(json).not.toMatch(/equipe|quadro|pessoa|responsave|usuario/i)
    expect(Object.keys(r).sort()).toEqual([
      'base',
      'criterios',
      'custo',
      'grupo',
      'inicios',
      'marcacoes',
      'meses',
    ])
    expect(r.grupo).toBe('equipe-tipo-padrao')
    expect(Object.keys(r.meses[0]!).sort()).toEqual([
      'emAndamento',
      'emOrdem',
      'foraDeOrdem',
      'mes',
    ])
  })

  it('o filtro de equipe escolhe o que é mostrado, não a fila: a soma por equipe é o total', () => {
    const duas = (c: DimCard): DimCard =>
      c.card_id.endsWith('1') || c.card_id.endsWith('3')
        ? { ...c, quadro_id: 'quadro-b', equipe: 'Equipe B' }
        : c
    const ctx = ctxDe(pares(10), duas)
    const todos = calcularO24(ctx, F)
    const a = calcularO24(ctx, { ...F, equipe: ['equipe-a'] })
    const b = calcularO24(ctx, { ...F, equipe: ['equipe-b'] })
    expect(a.base.n + b.base.n).toBe(todos.base.n)
    expect(a.inicios.k + b.inicios.k).toBe(todos.inicios.k)
  })

  it('o filtro de sistema não tira da fila quem espera em outro sistema', () => {
    const ctx = ctxDe([card('a', C1, I2, { sistema: 'Fluig' }), card('b', C2, I1)])
    const r = calcularO24(ctx, { ...F, sistema: ['protheus'] })
    expect(r.inicios).toMatchObject({ k: 1, n: 1 })
  })

  it('descartado ou arquivado antes do instante não esperava; depois, esperava', () => {
    // a é descartado em 10/09, antes do início de b (14/09): não espera mais, b em ordem
    const antes = calcularO24(
      ctxDe([card('a', C1, null, { descarte: '2026-09-10T09:00:00-03:00' }), card('b', C2, I1)]),
      F,
    )
    expect(antes.inicios).toMatchObject({ k: 0, n: 1 })
    // a é descartado em 16/09, depois do início de b: ainda esperava quando b passou na frente
    const depois = calcularO24(
      ctxDe([card('a', C1, null, { descarte: '2026-09-16T09:00:00-03:00' }), card('b', C2, I1)]),
      F,
    )
    expect(depois.inicios).toMatchObject({ k: 1, n: 1 })
    expect(depois.custo.porTipo).toEqual([]) // nunca iniciou
  })

  it('card excluído não está na fila; subtarefa e bug interno ficam fora', () => {
    const exclui = (c: DimCard): DimCard =>
      c.card_id === 'a' ? { ...c, excluido_em: I2 as unknown as number } : c
    expect(
      calcularO24(ctxDe([card('a', C1, null), card('b', C2, I1)], exclui), F).inicios,
    ).toMatchObject({ k: 0, n: 1 })
    expect(
      calcularO24(ctxDe([card('a', C1, I2, { subtarefa: true }), card('b', C2, I1)]), F).inicios,
    ).toMatchObject({ k: 0, n: 1 })
    expect(
      calcularO24(
        ctxDe([
          card('a', C1, I2, { tipo: 'Bug interno' }),
          card('b', C2, I1, { tipo: 'Bug interno' }),
        ]),
        F,
      ).base.n,
    ).toBe(0)
  })

  it('mesmo instante de criação ou de início não é ultrapassagem', () => {
    expect(calcularO24(ctxDe([card('a', C1, I2), card('b', C1, I1)]), F).inicios).toMatchObject({
      k: 0,
      n: 2,
    })
    expect(calcularO24(ctxDe([card('a', C1, I1), card('b', C2, I1)]), F).inicios).toMatchObject({
      k: 0,
      n: 2,
    })
  })

  it('sem nenhum início no período o estado é vazio e válido', () => {
    const r = calcularO24(ctxDe([card('a', C1, null)]), F)
    expect(r.base.n).toBe(0)
    expect(r.inicios).toMatchObject({ k: 0, n: 0 })
    expect(r.custo.porTipo).toEqual([])
    expect(SCHEMAS_RESULTADO.O24.safeParse(r).success).toBe(true)
  })

  it('só entram inícios do período; o início anterior a ele ainda ultrapassou o mais antigo', () => {
    // b inicia em 15/06 e a em 27/07; o período (12 semanas) começa em 18/07
    const r = calcularO24(
      ctxDe([
        card('a', '2026-06-01T08:00:00-03:00', '2026-07-27T09:00:00-03:00'),
        card('b', '2026-06-02T08:00:00-03:00', '2026-06-15T09:00:00-03:00'),
      ]),
      F,
    )
    expect(r.inicios).toMatchObject({ k: 0, n: 1 })
    expect(r.custo.porTipo[0]).toMatchObject({ ultrapassados: 1 })
  })

  it('resultado devolve marcacoes da série (A9) e nenhum campo de pessoa', () => {
    const r = calcularO24(ctxDe([card('a', C1, I2), card('b', C2, I1)]), F)
    expect(r.marcacoes).toEqual(r.criterios.serie)
    expect(JSON.stringify(r)).not.toMatch(/Pessoa|responsave|usuario/)
  })

  describe('no mock (B11a: alvos da fase 1 como asserção)', () => {
    const base = gerarBaseMock()
    const ctx = criarContextoBM(base.bm, base.config.hoje, CALENDARIO_PADRAO)
    const r = calcularO24(ctx, F)

    it('schema válido, só Padrão e sem equipe na saída', () => {
      expect(SCHEMAS_RESULTADO.O24.safeParse(r).success).toBe(true)
      const sem = JSON.stringify(r)
      for (const e of base.bm.config.equipes) expect(sem).not.toContain(e.nome)
    })

    it('20% a 30% dos inícios Padrão fora de ordem, em 12 semanas e em 12 meses', () => {
      for (const f of [F, { ...F, periodo: { tipo: '12m' as const } }]) {
        const x = calcularO24(ctx, f)
        expect(x.inicios.status).toBe('ok')
        expect(x.inicios.k / x.inicios.n).toBeGreaterThanOrEqual(0.2)
        expect(x.inicios.k / x.inicios.n).toBeLessThanOrEqual(0.3)
      }
    })

    it('custo: ao menos 1 tipo publica (20 ultrapassados ou mais) e ao menos 1 tipo é insuficiente', () => {
      const estados = r.custo.porTipo.map((t) => [t.ultrapassados >= 20, t.estatistica.status])
      expect(estados.some(([maior, st]) => maior && st === 'ok')).toBe(true)
      expect(estados.some(([maior, st]) => !maior && st === 'insuficiente')).toBe(true)
    })

    it('as classes Urgente, Prazo fixo e Intangível continuam na base, fora da fila do O24', () => {
      const classes = new Set(base.bm.cards.map((c) => c.classe_servico))
      for (const c of ['Urgente', 'Prazo fixo', 'Intangível'] as const)
        expect(classes.has(c)).toBe(true)
      const sem = gerarBaseBusinessMap(base.config, { omitir: ['ordem'] })
      const antes = new Map(sem.cards.map((c) => [c.card_id, c.criado_em]))
      for (const c of base.bm.cards)
        if (c.classe_servico !== 'Padrão' || c.tipo === 'Defeito em produção')
          expect(c.criado_em).toBe(antes.get(c.card_id))
    })
  })

  it('a varredura dá o mesmo resultado que a comparação ingênua par a par (mock, 12 meses)', () => {
    const base = gerarBaseMock()
    const ctx = criarContextoBM(base.bm, base.config.hoje, CALENDARIO_PADRAO)
    const pool = ctx.idx.marcos.filter(
      (m) =>
        m.card.granularidade === 'story' &&
        m.card.classe_servico === 'Padrão' &&
        m.card.tipo !== 'Bug interno' &&
        !m.card.eh_subtarefa &&
        m.card.excluido_em === null,
    )
    const f12: FiltrosFluxo = { ...F, periodo: { tipo: '12m' } }
    const r = calcularO24(ctx, f12)
    let esperadoFora = 0
    let esperadoN = 0
    const inicioPeriodo = r.base.janela?.inicio ?? ''
    for (const x of pool) {
      if (!x.ativo || x.inicio === null) continue
      const dia = new Date(x.inicio - 3 * 3_600_000).toISOString().slice(0, 10)
      if (dia < inicioPeriodo || dia > (r.base.janela?.fim ?? '')) continue
      esperadoN++
      const t = x.inicio
      const aFrente = pool.filter(
        (y) =>
          y.card.quadro_id === x.card.quadro_id &&
          y.card.tipo === x.card.tipo &&
          y.card.criado_em < x.card.criado_em &&
          (y.inicio ?? Infinity) > t &&
          fimDeVidaAberta(y.card) > t,
      )
      if (aFrente.length > 0) esperadoFora++
    }
    expect(r.base.n).toBe(esperadoN)
    expect(r.inicios.k).toBe(esperadoFora)
  })
})
