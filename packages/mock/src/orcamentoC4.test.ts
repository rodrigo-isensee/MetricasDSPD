import { beforeAll, describe, expect, it } from 'vitest'
import { idsDoC4, fonteDaMetrica, SCHEMAS_TAMBEM } from '@metricas-dspd/contratos'
import type { CadenciaC4, MetricaId } from '@metricas-dspd/contratos'
import { loadavg } from 'node:os'
import { acelerato, businessmap, calcularMetrica, pesquisa } from '@metricas-dspd/metricas'
import { CALENDARIO_PADRAO } from '@metricas-dspd/metricas/core'
import { gerarBaseMock, gerarExtensaoTambemMock, gerarExtensoesMock, gerarPesquisaMock } from '.'

/**
 * Emenda C4 da ADR 0003 (pedido 011, cartão B12; composição fixada em 2026-10-16). Mede com CPU time e a frio
 * (contexto novo a cada medição; a extensão do 011 e a pesquisa já geradas, porque o gerador lazy é medido
 * à parte), por painel e por cadência (Operacional: diária e semanal):
 *  - C4-fechada: o que a página pede com "Mais métricas" fechada (`idsDoC4`, a partir do catálogo);
 *  - C4-aberta: a fechada mais todas as complementares do painel;
 *  - VISAO_GERAL: painel próprio, medida à parte, fora da soma de qualquer painel.
 * Limite de CI = 3x o orçamento (900 ms) por cadência; o orçamento (300 e 450 ms) é impresso. Cada leitura
 * imprime o load de 1 min e o fator de calibração (leitura de orçamento só vale com fator <= 1,2). Também mede o gerador lazy (orçamento 200 ms, CI 600 ms) e o C3 a frio de cada id novo.
 * Filtros padrão (12s) e o pior filtro conhecido (período máximo, 12m).
 */
const cpuMs = (): number => {
  const u = process.cpuUsage()
  return (u.user + u.system) / 1000
}
const medir = (fn: () => void): number => {
  const t0 = cpuMs()
  fn()
  return cpuMs() - t0
}
const mediana = (v: number[]): number =>
  [...v].sort((x, y) => x - y)[Math.floor((v.length - 1) / 2)] ?? 0

const LIMITE_CI_PAINEL_MS = 900
const LIMITE_CI_GERADOR_MS = 600
const LIMITE_CI_METRICA_MS = 150
const ORC_FECHADA_MS = 300
const ORC_ABERTA_MS = 450
const ORC_GERADOR_MS = 200
const ORC_METRICA_MS = 50
const MEDICOES = 5
const RODADAS = 3

/**
 * Calibração de CPU, a mesma de desempenho.test.ts: o limite de CI sobe na proporção em que o CPU time de um
 * trabalho fixo infla (cobertura v8 e outros processos na máquina), com teto de 2x; e vale a melhor de até
 * RODADAS (regressão real infla todas as rodadas, pico de contenção infla uma).
 */
const REF_OCIOSA_MS = 3.3
const FATOR_MAX = 2
const trabalhoReferencia = (): number => {
  const m = new Map<number, number[]>()
  let acc = 0
  for (let i = 0; i < 60_000; i++) {
    const k = (i * 2654435761) % 5003
    const l = m.get(k) ?? []
    l.push(Math.sqrt(i) * 1.0001)
    m.set(k, l)
    acc += l.length
  }
  for (const l of m.values()) acc += l.sort((a, b) => b - a)[0] ?? 0
  return acc
}
const fatorDeCalibracao = (): number => {
  void trabalhoReferencia()
  const amostras: number[] = []
  for (let i = 0; i < 7; i++) amostras.push(medir(() => void trabalhoReferencia()))
  return Math.min(FATOR_MAX, Math.max(1, mediana(amostras) / REF_OCIOSA_MS))
}

type PainelFluxo = 'operacional' | 'tatico' | 'estrategico'
const PAINEIS: readonly PainelFluxo[] = ['operacional', 'tatico', 'estrategico']
/** Medidas do C4 por painel: o Operacional tem duas cadências; Tático e Estratégico, uma (a semanal, só o núcleo). */
const CADENCIAS: Record<PainelFluxo, readonly CadenciaC4[]> = {
  operacional: ['diaria', 'semanal'],
  tatico: ['semanal'],
  estrategico: ['semanal'],
}
/** Ids do 011 (fases 1 e 2), do contrato. T11, O22, O26, T13 e E6 só calculam com a extensão do 011. */
const TODAS_NOVAS = Object.keys(SCHEMAS_TAMBEM) as MetricaId[]

const base = gerarBaseMock()
const PESQUISA = gerarPesquisaMock(base.config)
const msExtensaoTambem = medir(() => void gerarExtensaoTambemMock(base))
const tambem = gerarExtensaoTambemMock(base)
const ext = gerarExtensoesMock(base)
const novoContexto = () => ({
  bm: businessmap.criarContextoBM(base.bm, base.config.hoje, CALENDARIO_PADRAO),
  ac: acelerato.criarContextoAC(base.ac, base.config.hoje, CALENDARIO_PADRAO),
  pesq: pesquisa.criarContextoPesquisa(PESQUISA, base.config.hoje),
  ext,
  tambem,
})
const filtros = (id: string, periodo: '12s' | '12m') =>
  fonteDaMetrica(id as never) === 'pesquisa'
    ? {}
    : fonteDaMetrica(id as never) === 'acelerato'
      ? { equipe: [], prioridade: [], periodo: { tipo: periodo } }
      : { equipe: [], tipo: [], sistema: [], periodo: { tipo: periodo } }
const calcular = (id: MetricaId, c: ReturnType<typeof novoContexto>, periodo: '12s' | '12m') =>
  calcularMetrica(id, id === 'VISAO_GERAL' ? {} : (filtros(id, periodo) as never), c)

describe('emenda C4 da ADR 0003 (pedido 011)', () => {
  // Aquecimento do JIT: sem ele, o fator de calibração da primeira medição do processo chega ao teto (2,0).
  beforeAll(() => {
    for (let i = 0; i < 5; i++) fatorDeCalibracao()
    const c = novoContexto()
    ;(['O2', 'O3', 'VISAO_GERAL'] as MetricaId[]).forEach((id) => calcular(id, c, '12s'))
  })

  it('gerador lazy da extensão do 011 (primeira abertura) cabe no limite de CI', () => {
    const amostras: number[] = []
    for (let i = 0; i < MEDICOES; i++)
      amostras.push(medir(() => void gerarExtensaoTambemMock(base)))
    const ms = mediana(amostras)
    console.info(
      `gerador lazy mediana ${ms.toFixed(0)}ms (1a ${msExtensaoTambem.toFixed(0)}ms; orçamento ${ORC_GERADOR_MS}, CI ${LIMITE_CI_GERADOR_MS})`,
    )
    expect(ms).toBeLessThan(LIMITE_CI_GERADOR_MS)
  })

  for (const painel of PAINEIS) {
    for (const cadencia of CADENCIAS[painel]) {
      for (const periodo of ['12s', '12m'] as const) {
        it(`C4 do painel ${painel} (${cadencia}), período ${periodo}: fechada e aberta dentro do limite de CI`, () => {
          const fechadaIds = idsDoC4(painel, 'fechada', cadencia)
          const abertaIds = idsDoC4(painel, 'aberta', cadencia)
          const extras = abertaIds.filter((id) => !fechadaIds.includes(id))
          let melhor = { f: Infinity, a: Infinity, fator: 1, load: 0 }
          for (let rodada = 0; rodada < RODADAS; rodada++) {
            const fator = fatorDeCalibracao()
            const load = loadavg()[0] ?? 0
            const fechadas: number[] = []
            const abertas: number[] = []
            for (let i = 0; i < MEDICOES; i++) {
              const c = novoContexto()
              const f = medir(() => fechadaIds.forEach((id) => calcular(id, c, periodo)))
              const n = medir(() => extras.forEach((id) => calcular(id, c, periodo)))
              fechadas.push(f)
              abertas.push(f + n)
            }
            const r = { f: mediana(fechadas), a: mediana(abertas), fator, load }
            const razao = (x: typeof r) => Math.max(x.f, x.a) / (LIMITE_CI_PAINEL_MS * x.fator)
            if (razao(r) < razao(melhor)) melhor = r
            if (razao(r) < 1) break
          }
          const { f, a, fator, load } = melhor
          const limite = LIMITE_CI_PAINEL_MS * fator
          console.info(
            `C4 ${painel} ${cadencia} ${periodo} (${fechadaIds.length} fechada + ${extras.length} complementares): fechada ${f.toFixed(0)}ms (orç ${ORC_FECHADA_MS}) aberta ${a.toFixed(0)}ms (orç ${ORC_ABERTA_MS}); CI ${limite.toFixed(0)}; fator ${fator.toFixed(2)}; load1 ${load.toFixed(2)}`,
          )
          expect(f, `${painel} ${cadencia} ${periodo} fechada`).toBeLessThan(limite)
          expect(a, `${painel} ${cadencia} ${periodo} aberta`).toBeLessThan(limite)
        }, 60_000)
      }
    }
  }

  it('VISAO_GERAL (rota /), medida à parte e a frio, cabe no limite de CI', () => {
    let melhor = { v: Infinity, fator: 1, load: 0 }
    for (let rodada = 0; rodada < RODADAS; rodada++) {
      const fator = fatorDeCalibracao()
      const load = loadavg()[0] ?? 0
      const amostras: number[] = []
      for (let i = 0; i < MEDICOES; i++) {
        const c = novoContexto()
        amostras.push(medir(() => void calcular('VISAO_GERAL', c, '12s')))
      }
      const r = { v: mediana(amostras), fator, load }
      if (r.v / r.fator < melhor.v / melhor.fator) melhor = r
      if (r.v < LIMITE_CI_PAINEL_MS * r.fator) break
    }
    console.info(
      `VISAO_GERAL a frio ${melhor.v.toFixed(0)}ms (orç ${ORC_FECHADA_MS}); CI ${(LIMITE_CI_PAINEL_MS * melhor.fator).toFixed(0)}; fator ${melhor.fator.toFixed(2)}; load1 ${melhor.load.toFixed(2)}`,
    )
    expect(melhor.v).toBeLessThan(LIMITE_CI_PAINEL_MS * melhor.fator)
  }, 60_000)

  it('C3 a frio de cada id novo (mediana de contextos novos) cabe no limite de CI', () => {
    const linhas: string[] = []
    for (const id of TODAS_NOVAS) {
      let melhor = { frio: Infinity, fator: 1 }
      for (let rodada = 0; rodada < RODADAS; rodada++) {
        const fator = fatorDeCalibracao()
        const amostras: number[] = []
        for (let i = 0; i < MEDICOES; i++) {
          const c = novoContexto()
          amostras.push(medir(() => void calcular(id, c, '12s')))
        }
        const r = { frio: mediana(amostras), fator }
        if (r.frio / r.fator < melhor.frio / melhor.fator) melhor = r
        if (r.frio < LIMITE_CI_METRICA_MS * r.fator) break
      }
      const { frio, fator } = melhor
      linhas.push(`${id} ${frio.toFixed(0)}ms${frio >= ORC_METRICA_MS ? ' ALERTA>50ms' : ''}`)
      expect(frio, `${id} a frio`).toBeLessThan(LIMITE_CI_METRICA_MS * fator)
    }
    console.info(`C3 a frio dos ids novos: ${linhas.join('; ')}`)
  }, 60_000)
})
