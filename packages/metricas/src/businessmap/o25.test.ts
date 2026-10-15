import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { gerarBaseMock } from '@metricas-dspd/mock'
import { CALENDARIO_PADRAO } from '../core/calendario'
import {
  descartadoNativo,
  instanteDeExcluido,
  instanteDoDescarte,
  motivoSemDescarte,
} from './descartado'
import { calcularO25 } from './index'
import { criarContextoBM, type ContextoBM } from './indice'
import { HOJE_TESTE, trilhaSimples, umaBase, type EspecCard } from './testing'
import type { DimCard } from './modelo'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const ctxDe = (cards: EspecCard[], ajuste: (c: DimCard) => DimCard = (c) => c): ContextoBM => {
  const base = umaBase(cards)
  return criarContextoBM({ ...base, cards: base.cards.map(ajuste) }, HOJE_TESTE, CALENDARIO_PADRAO)
}

/** Entregue em 22/09 (dentro das 12 semanas até 09/10). */
const entregue = (id: string, extra: Partial<EspecCard> = {}): EspecCard => ({
  id,
  criado: '2026-09-01T08:00:00-03:00',
  trilha: trilhaSimples(
    '2026-09-01T08:00:00-03:00',
    '2026-09-02T08:00:00-03:00',
    '2026-09-14T09:00:00-03:00',
    '2026-09-22T10:00:00-03:00',
  ),
  ...extra,
})
const entregues = (n: number) => Array.from({ length: n }, (_, i) => entregue(`e${i}`))
/** Descartado depois de iniciar: início 14/09 09:00, descarte 16/09 09:00 (2 dias úteis consumidos). */
const descartadoDepois = (id: string, extra: Partial<EspecCard> = {}): EspecCard => ({
  id,
  criado: '2026-09-01T08:00:00-03:00',
  trilha: [
    ['Aguardando priorização', '2026-09-01T08:00:00-03:00'],
    ['Pronto para desenvolver', '2026-09-02T08:00:00-03:00'],
    ['Em desenvolvimento', '2026-09-14T09:00:00-03:00'],
  ],
  descarte: '2026-09-16T09:00:00-03:00',
  ...extra,
})
/** Descartado ainda na fila: nunca iniciou. */
const descartadoAntes = (id: string, extra: Partial<EspecCard> = {}): EspecCard => ({
  id,
  criado: '2026-09-01T08:00:00-03:00',
  trilha: [['Aguardando priorização', '2026-09-01T08:00:00-03:00']],
  descarte: '2026-09-16T09:00:00-03:00',
  ...extra,
})
const muitos = <T>(n: number, f: (i: number) => T) => Array.from({ length: n }, (_, i) => f(i))

describe('O25: descarte', () => {
  it('taxa = descartados / encerrados, só com n >= 20; abaixo, "k de n"', () => {
    const ok = calcularO25(
      ctxDe([
        ...entregues(17),
        ...muitos(2, (i) => descartadoDepois(`d${i}`)),
        descartadoAntes('a1'),
        descartadoAntes('a2'),
        descartadoAntes('a3'),
      ]),
      F,
    )
    expect(ok.encerrados).toMatchObject({ status: 'ok', k: 5, n: 22 })
    expect(ok.encerrados.status === 'ok' && ok.encerrados.pct).toBeCloseTo((5 / 22) * 100, 6)
    const pouco = calcularO25(ctxDe([...entregues(3), descartadoDepois('d1')]), F)
    expect(pouco.encerrados).toEqual({ status: 'insuficiente', k: 1, n: 4, minimo: 20 })
    expect(JSON.stringify(pouco.encerrados)).not.toContain('pct')
    expect(ok.base).toMatchObject({ n: 22 })
    expect(SCHEMAS_RESULTADO.O25.safeParse(ok).success).toBe(true)
  })

  it('tempo consumido (D-13, CA-19): do início ao descarte; descartado antes do início fica à parte, com tempo zero', () => {
    const r = calcularO25(
      ctxDe([
        descartadoDepois('d1'),
        descartadoDepois('d2'),
        descartadoAntes('a1'),
        ...entregues(2),
      ]),
      F,
    )
    expect(r.consumido.antesDoInicio).toEqual({ itens: 1 })
    expect(r.consumido.depoisDoInicio).toMatchObject({ itens: 2, diasUteis: 4 })
    // 2 descartados depois do início no tipo: abaixo de 20, sem percentil
    const mel = r.consumido.depoisDoInicio.porTipo[0]!
    expect(mel).toMatchObject({ tipo: 'Melhoria', itens: 2, diasUteis: 4 })
    expect(mel.estatistica).toMatchObject({ status: 'insuficiente', n: 2 })
    expect(JSON.stringify(mel.estatistica)).not.toContain('p50')
  })

  it('com 20 descartados depois do início publica P50/P85/P95 do consumido; o antes do início não entra', () => {
    const r = calcularO25(
      ctxDe([
        ...muitos(20, (i) => descartadoDepois(`d${i}`)),
        ...muitos(5, (i) => descartadoAntes(`a${i}`)),
      ]),
      F,
    )
    expect(r.consumido.antesDoInicio.itens).toBe(5)
    expect(r.consumido.depoisDoInicio.segmentoPor).toBe('tipo')
    const e = r.consumido.depoisDoInicio.porTipo[0]!.estatistica
    expect(e).toMatchObject({ status: 'ok', n: 20, valor: { p50: 2, p85: 2, p95: 2 } })
    expect(r.consumido.depoisDoInicio.diasUteis).toBe(40)
  })

  it('regra 7: P50/P85 do consumido só dentro do tipo, com mínimo de 20 por tipo (19/20)', () => {
    const r = calcularO25(
      ctxDe([
        ...muitos(20, (i) => descartadoDepois(`m${i}`)),
        ...muitos(19, (i) => descartadoDepois(`i${i}`, { tipo: 'Incidente' })),
      ]),
      F,
    )
    const { porTipo, itens } = r.consumido.depoisDoInicio
    expect(itens).toBe(39) // soma e contagem juntam tipos; percentil nunca
    expect(porTipo.map((t) => t.tipo)).toEqual(['Incidente', 'Melhoria'])
    expect(porTipo[0]!.estatistica).toMatchObject({ status: 'insuficiente', n: 19 })
    expect(porTipo[1]!.estatistica).toMatchObject({ status: 'ok', n: 20 })
    expect(SCHEMAS_RESULTADO.O25.safeParse(r).success).toBe(true)
  })

  it('card excluído conta como descarte no instante da exclusão (o índice o tira dos demais cálculos)', () => {
    const ctx = ctxDe([entregue('e1'), descartadoAntes('x1')], (c) =>
      c.card_id === 'x1'
        ? {
            ...c,
            arquivado_em: null,
            motivo_descarte: null,
            excluido_em: c.criado_em + 2 * 86_400_000,
          }
        : c,
    )
    const r = calcularO25(ctx, F)
    expect(r.encerrados).toMatchObject({ k: 1, n: 2 })
    expect(r.consumido.antesDoInicio.itens).toBe(1)
    expect(r.instanteAproximado.itens).toBe(0)
    expect(r.avisoPreenchimento.itens).toBe(0)
  })

  it('card excluído sem nenhuma transição também conta (a reserva da última revisão cai na criação)', () => {
    const r = calcularO25(
      ctxDe([{ id: 'x1', criado: '2026-09-01T08:00:00-03:00', trilha: [] }], (c) => ({
        ...c,
        excluido_em: c.criado_em + 86_400_000,
      })),
      F,
    )
    expect(r.encerrados).toMatchObject({ k: 1, n: 1 })
    expect(r.consumido.antesDoInicio.itens).toBe(1)
  })

  it('excluído que iniciou conta tempo consumido até a exclusão', () => {
    const r = calcularO25(
      ctxDe([entregue('e1'), descartadoDepois('x1')], (c) =>
        c.card_id === 'x1'
          ? { ...c, arquivado_em: null, motivo_descarte: null, excluido_em: c.arquivado_em }
          : c,
      ),
      F,
    )
    expect(r.consumido.depoisDoInicio).toMatchObject({ itens: 1, diasUteis: 2 })
  })

  it('motivo preenchido sem descarte nem exclusão vira aviso e fica fora da taxa (CA-26)', () => {
    const r = calcularO25(
      ctxDe([entregue('e1'), entregue('e2'), entregue('e3'), descartadoDepois('d1')], (c) =>
        c.card_id === 'e2' || c.card_id === 'e3' ? { ...c, motivo_descarte: 'Duplicado' } : c,
      ),
      F,
    )
    expect(r.avisoPreenchimento).toEqual({ itens: 2 })
    // e2 e e3 não entram nem no numerador nem no denominador: sobram e1 (entregue) e d1 (descartado)
    expect(r.encerrados).toMatchObject({ k: 1, n: 2 })
  })

  it('B6-1: o aviso segue o período: entregues nele e abertos no fim dele; fora disso não conta', () => {
    const comMotivo = new Set(['A', 'B', 'C', 'D', 'E'])
    const trilha = (criado: string, fim: string | null): EspecCard['trilha'] => [
      ['Aguardando priorização', criado],
      ...(fim === null
        ? []
        : ([
            ['Pronto para desenvolver', criado],
            ['Em desenvolvimento', criado],
            ['Entregue', fim],
          ] as EspecCard['trilha'])),
    ]
    const c = (id: string, criado: string, fim: string | null): EspecCard => ({
      id,
      criado,
      trilha: trilha(criado, fim),
    })
    const r = calcularO25(
      ctxDe(
        [
          c('A', '2026-08-03T08:00:00-03:00', '2026-08-20T10:00:00-03:00'), // entregue no período
          c('B', '2026-09-01T08:00:00-03:00', null), // aberto no fim do período
          c('C', '2026-05-04T08:00:00-03:00', '2026-06-10T10:00:00-03:00'), // entregue antes do período
          c('D', '2026-09-20T08:00:00-03:00', null), // criado depois do fim do período
          c('E', '2026-09-01T08:00:00-03:00', '2026-09-22T10:00:00-03:00'), // atravessa o fim: aberto nele
        ],
        (x) => (comMotivo.has(x.card_id) ? { ...x, motivo_descarte: 'Duplicado' } : x),
      ),
      { ...F, periodo: { tipo: 'custom', de: '2026-08-01', ate: '2026-09-10' } },
    )
    expect(r.avisoPreenchimento).toEqual({ itens: 3 })
  })

  it("o card excluído e entregue conta uma vez só, como descarte (R-2': excluído é descartado)", () => {
    const r = calcularO25(
      ctxDe([entregue('x1')], (c) => ({ ...c, excluido_em: c.concluido_em })),
      F,
    )
    expect(r.encerrados).toMatchObject({ k: 1, n: 1 })
  })

  it('porMotivo é nulo (CA-44) e nenhum campo de pessoa, motivo nem comentário sai no resultado', () => {
    const r = calcularO25(ctxDe([descartadoDepois('d1'), entregue('e1')]), F)
    expect(r.porMotivo).toBeNull()
    expect(Object.keys(r).sort()).toEqual([
      'avisoPreenchimento',
      'base',
      'consumido',
      'criterios',
      'encerrados',
      'instanteAproximado',
      'marcacoes',
      'meses',
      'porMotivo',
    ])
    const texto = JSON.stringify(r)
    expect(texto).not.toMatch(/Pessoa 01|Duplicado|discard_comment|responsave|usuario/)
  })

  it('série mensal por mês do instante do encerramento, com o mês corrente em andamento e as marcações do período', () => {
    const r = calcularO25(
      ctxDe([
        entregue('e1'),
        descartadoDepois('d1'),
        {
          ...entregue('e2'),
          criado: '2026-10-01T08:00:00-03:00',
          trilha: trilhaSimples(
            '2026-10-01T08:00:00-03:00',
            '2026-10-01T09:00:00-03:00',
            '2026-10-02T09:00:00-03:00',
            '2026-10-05T10:00:00-03:00',
          ),
        },
      ]),
      F,
    )
    const m = Object.fromEntries(r.meses.map((x) => [x.mes, x]))
    expect(m['2026-09']).toMatchObject({ emAndamento: false, taxa: { k: 1, n: 2 } })
    expect(m['2026-10']).toMatchObject({ emAndamento: true, taxa: { k: 0, n: 1 } })
    expect(r.marcacoes).toEqual([])
  })

  it('só story que é demanda: subtarefa, bug interno, frente e projeto ficam fora; filtros de equipe e tipo atuam', () => {
    const r = calcularO25(
      ctxDe([
        descartadoDepois('d-story'),
        descartadoDepois('d-bug', { tipo: 'Bug interno' }),
        descartadoDepois('d-sub', { subtarefa: true }),
        descartadoDepois('d-frente', { gran: 'frente' }),
        descartadoDepois('d-proj', { gran: 'projeto' }),
        descartadoDepois('d-eq', { equipe: 'Equipe B' }),
        descartadoDepois('d-inc', { tipo: 'Incidente' }),
      ]),
      F,
    )
    expect(r.encerrados).toMatchObject({ k: 3, n: 3 })
    const eq = calcularO25(
      ctxDe([descartadoDepois('d1'), descartadoDepois('d2', { equipe: 'Equipe B' })]),
      { ...F, equipe: ['equipe-b'] },
    )
    expect(eq.encerrados).toMatchObject({ k: 1, n: 1 })
    const ti = calcularO25(
      ctxDe([descartadoDepois('d1'), descartadoDepois('d2', { tipo: 'Incidente' })]),
      { ...F, tipo: ['Incidente'] },
    )
    expect(ti.encerrados).toMatchObject({ k: 1, n: 1 })
  })

  it('sem nenhum card: resultado vazio válido', () => {
    const r = calcularO25(ctxDe([]), F)
    expect(r.encerrados).toMatchObject({ k: 0, n: 0 })
    expect(r.avisoPreenchimento.itens).toBe(0)
    expect(SCHEMAS_RESULTADO.O25.safeParse(r).success).toBe(true)
  })

  it('base do mock: obedece ao schema e a parcela medida é a do docs/api', () => {
    const base = gerarBaseMock({ escala: 0.5 })
    const r = calcularO25(criarContextoBM(base.bm, HOJE_TESTE, CALENDARIO_PADRAO), F)
    expect(SCHEMAS_RESULTADO.O25.safeParse(r).success).toBe(true)
    expect(r.avisoPreenchimento.itens).toBe(0)
    expect(r.porMotivo).toBeNull()
  })
})

describe("descartado.ts: definição nativa do descarte (R-2', P-1)", () => {
  const base = umaBase([entregue('e1')]).cards[0] as DimCard
  const com = (p: Partial<DimCard>): DimCard => ({ ...base, ...p })

  it('descartado = estado nativo (projeção: motivo e arquivamento juntos) ou excluído', () => {
    expect(descartadoNativo(base)).toBe(false)
    expect(descartadoNativo(com({ motivo_descarte: 'X', arquivado_em: 5 }))).toBe(true)
    expect(descartadoNativo(com({ excluido_em: 5 }))).toBe(true)
    // arquivado sem motivo: fim normal de card entregue, não é descarte
    expect(descartadoNativo(com({ arquivado_em: 5 }))).toBe(false)
    expect(descartadoNativo(com({ motivo_descarte: 'X' }))).toBe(false)
  })

  it('motivo sem descarte nem exclusão é aviso', () => {
    expect(motivoSemDescarte(com({ motivo_descarte: 'X' }))).toBe(true)
    expect(motivoSemDescarte(com({ motivo_descarte: 'X', arquivado_em: 5 }))).toBe(false)
    expect(motivoSemDescarte(com({ motivo_descarte: 'X', excluido_em: 5 }))).toBe(false)
    expect(motivoSemDescarte(base)).toBe(false)
  })

  it('instante: exclusão no excluído, arquivamento no descartado, nulo se não descartado', () => {
    expect(
      instanteDoDescarte(com({ excluido_em: 7, arquivado_em: 5, motivo_descarte: 'X' }), 99),
    ).toEqual({ instante: 7, aproximado: false })
    expect(instanteDoDescarte(com({ arquivado_em: 5, motivo_descarte: 'X' }), 99)).toEqual({
      instante: 5,
      aproximado: false,
    })
    expect(instanteDoDescarte(base, 99)).toBeNull()
  })

  it('sem o instante da exclusão, usa a última revisão e marca como aproximado', () => {
    expect(instanteDeExcluido(7, 99)).toEqual({ instante: 7, aproximado: false })
    expect(instanteDeExcluido(null, 99)).toEqual({ instante: 99, aproximado: true })
  })
})
