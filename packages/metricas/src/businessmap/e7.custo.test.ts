import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { CALENDARIO_PADRAO } from '../core/calendario'
import { calcularE7, custoDoPeriodo, type ConfigCustoDspd } from './index'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, trilhaSimples, umaBase, type EspecCard } from './testing'

/** Setembro de 2026 inteiro: 30 dias corridos. */
const SETEMBRO = { inicio: '2026-09-01', fim: '2026-09-30' }
const F: FiltrosFluxo = {
  equipe: [],
  tipo: [],
  sistema: [],
  periodo: { tipo: 'custom', de: SETEMBRO.inicio, ate: SETEMBRO.fim },
}
const mensal = (valor: number, de: string, ate: string | null = null) => ({
  valor,
  periodicidade: 'mensal' as const,
  vigente_de: de,
  vigente_ate: ate,
})

describe('custoDoPeriodo: pró-rata por dias corridos (Q-E7-1, decidida em 2026-10-16)', () => {
  it('mês cheio: o valor mensal inteiro', () => {
    expect(custoDoPeriodo([mensal(30000, '2026-01-01')], SETEMBRO)).toBeCloseTo(30000, 6)
  })

  it('meio mês: dias cobertos sobre dias do mês', () => {
    expect(
      custoDoPeriodo([mensal(30000, '2026-01-01')], { inicio: '2026-09-16', fim: '2026-09-30' }),
    ).toBeCloseTo(15000, 6)
  })

  it('período que cruza meses de tamanhos diferentes usa os dias de cada mês', () => {
    // 16 a 31/08 = 16 de 31 dias; 01 a 15/09 = 15 de 30 dias
    const esperado = (16 / 31) * 31000 + (15 / 30) * 31000
    expect(
      custoDoPeriodo([mensal(31000, '2026-01-01')], { inicio: '2026-08-16', fim: '2026-09-15' }),
    ).toBeCloseTo(esperado, 6)
  })

  it('vigências que mudam no meio do mês somam cada uma pelos seus dias', () => {
    const v: ConfigCustoDspd = [
      mensal(30000, '2026-01-01', '2026-09-15'),
      mensal(60000, '2026-09-16'),
    ]
    expect(custoDoPeriodo(v, SETEMBRO)).toBeCloseTo((15 / 30) * 30000 + (15 / 30) * 60000, 6)
  })

  it('periodicidade anual: dias cobertos sobre os dias do ano (365 e 366)', () => {
    const anual = (ano: number) => ({
      valor: 365000,
      periodicidade: 'anual' as const,
      vigente_de: `${ano}-01-01`,
      vigente_ate: null,
    })
    expect(custoDoPeriodo([anual(2026)], SETEMBRO)).toBeCloseTo((30 / 365) * 365000, 6)
    expect(custoDoPeriodo([anual(2028)], { inicio: '2028-03-01', fim: '2028-03-31' })).toBeCloseTo(
      (31 / 366) * 365000,
      6,
    )
  })

  it('nenhuma vigência cobre o período (ou não há vigência): null, nunca 0', () => {
    expect(custoDoPeriodo([], SETEMBRO)).toBeNull()
    expect(custoDoPeriodo([mensal(30000, '2026-10-01')], SETEMBRO)).toBeNull()
    expect(custoDoPeriodo([mensal(30000, '2026-01-01', '2026-08-31')], SETEMBRO)).toBeNull()
  })

  it('vigência com início antes do período e fim dentro dele só conta os dias do período', () => {
    expect(custoDoPeriodo([mensal(30000, '2026-01-01', '2026-09-10')], SETEMBRO)).toBeCloseTo(
      (10 / 30) * 30000,
      6,
    )
  })
})

const entregue = (id: string, sistema: string): EspecCard => ({
  id,
  sistema,
  criado: '2026-09-01T08:00:00-03:00',
  trilha: trilhaSimples(
    '2026-09-01T08:00:00-03:00',
    '2026-09-02T08:00:00-03:00',
    '2026-09-03T08:00:00-03:00',
    '2026-09-30T10:00:00-03:00',
  ),
})
const varios = (n: number, sistema: string) =>
  Array.from({ length: n }, (_, i) => entregue(`${sistema}-${i}`, sistema))
const ctxDe = (cards: EspecCard[]) => criarContextoBM(umaBase(cards), HOJE_TESTE, CALENDARIO_PADRAO)
const sistema = (r: ReturnType<typeof calcularE7>, nome: string) =>
  r.sistemas.find((s) => s.sistema === nome)

describe("E7 com R$ por fixture (D-1' = A, CA-35)", () => {
  const cards = [...varios(50, 'Fluig'), ...varios(30, 'Protheus'), ...varios(5, 'Pequeno')]

  it('custo rateado = custo do período x participação; por demanda = rateado / entregas; os dois com 2 casas', () => {
    const r = calcularE7(ctxDe(cards), F, [mensal(85000, '2026-01-01')])
    expect(r.custoConfigurado).toBe(true)
    expect(r.total).toBe(85)
    expect(sistema(r, 'Fluig')).toMatchObject({ custoRateado: 50000, custoPorDemanda: 1000 })
    expect(sistema(r, 'Protheus')).toMatchObject({ custoRateado: 30000, custoPorDemanda: 1000 })
    expect(SCHEMAS_RESULTADO.E7.safeParse(r).success).toBe(true)
  })

  it('sem configuração, ou com a vigência fora do período, não há R$ e custoConfigurado é falso (CA-13)', () => {
    for (const custo of [undefined, [], [mensal(85000, '2026-10-01')]] as (
      ConfigCustoDspd | undefined
    )[]) {
      const r = calcularE7(ctxDe(cards), F, custo)
      expect(r.custoConfigurado).toBe(false)
      for (const s of r.sistemas) {
        expect(s.custoRateado).toBeNull()
        expect(s.custoPorDemanda).toBeNull()
      }
    }
  })

  it('abaixo de 20 entregas no sistema o rateio e o custo por demanda não saem (só "k de n")', () => {
    const r = calcularE7(ctxDe(cards), F, [mensal(85000, '2026-01-01')])
    expect(sistema(r, 'Pequeno')).toMatchObject({
      entregas: 5,
      participacao: null,
      custoRateado: null,
      custoPorDemanda: null,
    })
    const exato = calcularE7(ctxDe([...varios(20, 'A'), ...varios(19, 'B')]), F, [
      mensal(39000, '2026-01-01'),
    ])
    expect(sistema(exato, 'A')?.custoRateado).toBe(20000)
    expect(sistema(exato, 'B')?.custoRateado).toBeNull()
  })

  it('o rateado dos sistemas publicados nunca passa do custo total do período', () => {
    const r = calcularE7(ctxDe([...varios(21, 'A'), ...varios(22, 'B'), ...varios(23, 'C')]), F, [
      mensal(10000, '2026-01-01'),
    ])
    const soma = r.sistemas.reduce((s, x) => s + (x.custoRateado ?? 0), 0)
    expect(soma).toBeLessThanOrEqual(10000.01)
    expect(soma).toBeGreaterThan(9999.9)
  })

  it('só o custo total do DSPD: nenhum campo de equipe, pessoa ou horas apontadas na resposta', () => {
    const r = calcularE7(ctxDe(cards), F, [mensal(85000, '2026-01-01')])
    expect(JSON.stringify(r)).not.toMatch(/equipe|pessoa|horas|apontad/i)
  })
})
