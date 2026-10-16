import { describe, expect, it } from 'vitest'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { businessmap, CALENDARIO_PADRAO } from '@metricas-dspd/metricas'
import { EXTENSAO_TAMBEM_BM_VAZIA } from '@metricas-dspd/metricas/businessmap'
import { gerarBaseMock, gerarExtensaoTambemMock, PARAMETROS_SAZONAIS } from '.'
import { hashJson } from './prng'

const base = gerarBaseMock()
const ext = gerarExtensaoTambemMock(base)
const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const ctx = businessmap.criarContextoBM(base.bm, base.config.hoje, CALENDARIO_PADRAO)
const t11 = businessmap.calcularT11(ctx, F, ext)

/**
 * B11b (pedido 011, P-T3 = a): a série de entradas do T11 é extensão só de mock, com hash próprio. A base do BusinessMap
 * e a do Acelerato não mudam um bit, e o gerador roda fora da montagem do contexto (C1 e C2).
 */
describe('B11b: extensão do T11 (entradas sazonais)', () => {
  it('base intacta: hashes do núcleo e do Acelerato iguais aos de antes da extensão', () => {
    expect(hashJson(base)).toBe('68a67741')
    expect(hashJson(base.ac)).toBe('0113e077')
    expect(hashJson(gerarBaseMock({ escala: 0.2 }))).toBe('824092e4')
    expect(hashJson(gerarBaseMock({ escala: 0.2 }).ac)).toBe('39b4b005')
  })

  it('hash próprio e determinístico: igual na repetição, outro com outra semente e com outra escala', () => {
    expect(hashJson(gerarExtensaoTambemMock(base))).toBe(hashJson(ext))
    const outra = gerarBaseMock({ escala: 0.2, semente: 7 })
    expect(hashJson(gerarExtensaoTambemMock(outra))).not.toBe(hashJson(ext))
    expect(hashJson(gerarExtensaoTambemMock(gerarBaseMock({ escala: 0.2 })))).not.toBe(
      hashJson(ext),
    )
    expect(hashJson(ext)).toBe('c02c175a')
    // a série do T11 (fase 1) segue idêntica depois da fase 2: cada campo novo tem a sua stream
    expect(hashJson(ext.entradasSazonais)).toBe('3f86ce75')
    expect(hashJson(gerarExtensaoTambemMock(gerarBaseMock({ escala: 0.2 })).entradasSazonais)).toBe(
      'bdb6cd88',
    )
  })

  it('gerar a extensão não altera a base (a base não é tocada)', () => {
    const antes = hashJson(base)
    gerarExtensaoTambemMock(base)
    expect(hashJson(base)).toBe(antes)
  })

  it('só o necessário para contar: criado_em, tipo, equipe e sistema; nenhum campo de pessoa; ordenada no tempo', () => {
    for (const e of ext.entradasSazonais.slice(0, 500))
      expect(Object.keys(e).sort()).toEqual(['criado_em', 'equipe', 'sistema', 'tipo'])
    const ts = ext.entradasSazonais.map((e) => e.criado_em)
    expect(ts).toEqual([...ts].sort((a, b) => a - b))
    expect(ext.entradasSazonais.every((e) => e.tipo !== 'Bug interno')).toBe(true)
    expect(Math.max(...ts)).toBeLessThanOrEqual(Date.parse(base.config.hoje))
  })

  it('ALVO DO T11: 24 meses fechados mais o corrente, picos em janeiro e julho, mês corrente parcial', () => {
    const meses = t11.anos.flatMap((a) => a.meses.map((m) => ({ ano: a.ano, ...m })))
    const comDado = meses.filter((m) => m.entradas !== null)
    expect(PARAMETROS_SAZONAIS.mesesFechados).toBe(24)
    // 24 fechados + o corrente (out/2026), de out/2024 a out/2026
    expect(comDado).toHaveLength(25)
    expect(`${comDado[0]?.ano}-${comDado[0]?.mes}`).toBe('2024-10')
    expect(t11.mesesComDado).toBe(24)
    expect(t11.historicoCurto).toBe(false)
    const corrente = comDado[comDado.length - 1]
    expect(corrente).toMatchObject({ ano: 2026, mes: 10, emAndamento: true })
    expect(comDado.filter((m) => m.emAndamento)).toHaveLength(1)
    // mês corrente é parcial: bem abaixo de um mês cheio (hoje = 9/10, 7 de 23 dias úteis)
    const fechados = comDado.filter((m) => !m.emAndamento)
    expect(corrente?.entradas as number).toBeLessThan(0.5 * (t11.mediaMensal as number))
    // picos: em cada janeiro e julho FECHADO, pelo menos 25% acima da média mensal; há 4 (jan/25, jul/25, jan/26, jul/26)
    const picos = fechados.filter((m) => m.mes === 1 || m.mes === 7)
    expect(picos.map((m) => `${m.ano}-${m.mes}`)).toEqual(['2025-1', '2025-7', '2026-1', '2026-7'])
    for (const p of picos)
      expect(p.entradas as number).toBeGreaterThanOrEqual(1.25 * (t11.mediaMensal as number))
    // e nenhum outro mês fechado passa de 1,15x a média (o padrão é dos picos, não do acaso)
    for (const m of fechados.filter((x) => x.mes !== 1 && x.mes !== 7))
      expect(m.entradas as number).toBeLessThan(1.15 * (t11.mediaMensal as number))
    expect(SCHEMAS_RESULTADO.T11.safeParse(t11).success).toBe(true)
  })

  it('CA-12: o período do filtro não muda o T11', () => {
    for (const periodo of [
      { tipo: '4s' },
      { tipo: '12m' },
      { tipo: 'custom', de: '2026-09-01', ate: '2026-09-30' },
    ] as const)
      expect(businessmap.calcularT11(ctx, { ...F, periodo }, ext)).toEqual(t11)
  })

  it('gerador próprio e lazy: a montagem do contexto não o executa e ele custa bem menos que a base', () => {
    const t0 = performance.now()
    gerarExtensaoTambemMock(base)
    const gasto = performance.now() - t0
    // orçamento C1 é 500 ms para a montagem inteira; a extensão, fora dela, fica folgada
    expect(gasto).toBeLessThan(500)
  })

  it('divergência documentada entre T11 e O7 no mock: série própria, não os cards da base (P-T3 = a)', () => {
    const mesDaBase = new Map<string, number>()
    for (const c of base.bm.cards) {
      if (c.granularidade !== 'story' || c.tipo === 'Bug interno' || c.eh_subtarefa) continue
      const m = new Date(c.criado_em - 3 * 3600_000).toISOString().slice(0, 7)
      mesDaBase.set(m, (mesDaBase.get(m) ?? 0) + 1)
    }
    const meses = t11.anos.flatMap((a) =>
      a.meses.map((m) => ({ ...m, chave: `${a.ano}-${String(m.mes).padStart(2, '0')}` })),
    )
    const emComum = meses.filter(
      (m) => m.entradas !== null && mesDaBase.has(m.chave) && !m.emAndamento,
    )
    expect(emComum.length).toBeGreaterThan(10)
    expect(emComum.some((m) => m.entradas !== mesDaBase.get(m.chave))).toBe(true)
  })

  it('base sem nenhuma demanda: extensão vazia, sem erro', () => {
    const vazia = { ...base, bm: { ...base.bm, cards: [] } }
    expect(gerarExtensaoTambemMock(vazia)).toEqual(EXTENSAO_TAMBEM_BM_VAZIA)
  })
})
