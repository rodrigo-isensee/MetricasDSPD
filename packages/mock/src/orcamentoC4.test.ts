import { describe, expect, it } from 'vitest'
import { CATALOGO_CARTOES, fonteDaMetrica } from '@metricas-dspd/contratos'
import type { MetricaId } from '@metricas-dspd/contratos'
import { acelerato, businessmap, calcularMetrica, pesquisa } from '@metricas-dspd/metricas'
import { CALENDARIO_PADRAO } from '@metricas-dspd/metricas/core'
import { gerarBaseMock, gerarExtensaoTambemMock, gerarExtensoesMock, gerarPesquisaMock } from '.'

/**
 * Emenda C4 da ADR 0003 (pedido 011, cartão B12). Mede por painel, em duas condições, com CPU time e a frio
 * (contexto novo a cada medição; a extensão do 011 e a pesquisa já geradas, porque o gerador lazy é medido
 * à parte):
 *  - C4-fechada: métricas do painel anteriores ao 011 (catálogo, núcleo e complementares) + VISAO_GERAL;
 *  - C4-aberta: as anteriores + as complementares do 011 já implementadas no painel + VISAO_GERAL.
 * Limite de CI = 3x o orçamento nas duas condições (900 ms); o orçamento (300 e 450 ms) é impresso como
 * alerta. Também mede o gerador lazy (orçamento 200 ms, CI 600 ms) e o C3 a frio de cada id novo.
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
/** Ids do 011 já implementados (fase 1), por painel. T11 só calcula com a extensão do 011. */
const NOVAS: Record<PainelFluxo, readonly MetricaId[]> = {
  operacional: ['O19', 'O20', 'O21', 'O24', 'O25'],
  tatico: ['T10', 'T11', 'T12'],
  estrategico: ['E7', 'E9'],
}
const TODAS_NOVAS = PAINEIS.flatMap((p) => NOVAS[p])
const ANTERIORES = (p: PainelFluxo): MetricaId[] => [
  ...new Set(CATALOGO_CARTOES.filter((c) => c.painel === p).flatMap((c) => [...c.metricas])),
]

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
    for (const periodo of ['12s', '12m'] as const) {
      it(`C4 do painel ${painel}, período ${periodo}: fechada e aberta dentro do limite de CI`, () => {
        const anteriores = [...ANTERIORES(painel), 'VISAO_GERAL' as MetricaId]
        let melhor = { f: Infinity, a: Infinity, fator: 1 }
        for (let rodada = 0; rodada < RODADAS; rodada++) {
          const fator = fatorDeCalibracao()
          const fechadas: number[] = []
          const abertas: number[] = []
          for (let i = 0; i < MEDICOES; i++) {
            const c = novoContexto()
            const f = medir(() => anteriores.forEach((id) => calcular(id, c, periodo)))
            const n = medir(() => NOVAS[painel].forEach((id) => calcular(id, c, periodo)))
            fechadas.push(f)
            abertas.push(f + n)
          }
          const r = { f: mediana(fechadas), a: mediana(abertas), fator }
          const razao = (x: typeof r) => Math.max(x.f, x.a) / (LIMITE_CI_PAINEL_MS * x.fator)
          if (razao(r) < razao(melhor)) melhor = r
          if (razao(r) < 1) break
        }
        const { f, a, fator } = melhor
        const limite = LIMITE_CI_PAINEL_MS * fator
        const linha = `C4 ${painel} ${periodo} (${anteriores.length} anteriores + ${NOVAS[painel].length} novas): fechada ${f.toFixed(0)}ms (orç ${ORC_FECHADA_MS}) aberta ${a.toFixed(0)}ms (orç ${ORC_ABERTA_MS}); CI ${limite.toFixed(0)} (fator ${fator.toFixed(2)})`
        console.info(linha)
        expect(f, `${painel} ${periodo} fechada`).toBeLessThan(limite)
        expect(a, `${painel} ${periodo} aberta`).toBeLessThan(limite)
      }, 60_000)
    }
  }

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
