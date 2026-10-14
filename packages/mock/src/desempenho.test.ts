import { describe, expect, it } from 'vitest'
import { CALENDARIO_PADRAO } from '@metricas-dspd/metricas/core'
import { METRICA_IDS } from '@metricas-dspd/contratos'
import { fonteDaMetrica } from '@metricas-dspd/contratos'
import { acelerato, businessmap, calcularMetrica, pesquisa } from '@metricas-dspd/metricas'
import { diasUteisNoIntervalo, instanteDe, isoDeDia } from '@metricas-dspd/metricas/core'
import { estadoEm, serieWip } from '@metricas-dspd/metricas/businessmap'
import { gerarBaseMock, gerarPesquisaMock } from '.'

/**
 * Orçamento da ADR 0003: C3 < 50 ms por métrica, C4 < 300 ms por painel. Limite de CI = 3x (praticas 4).
 * Estabilidade (K-030 r1, b): a frio = MEDIANA de 5 medições, cada uma com contexto recriado sobre a
 * mesma base; 2a chamada = mediana das 5; p95 de 20 repetições a quente. O orçamento de 50 ms é
 * impresso como alerta, sem falhar. O arquivo roda sem paralelismo (vitest.config: fileParallelism false).
 * Tempos em CPU time (não parede), com limite absoluto de 150 ms em máquina ociosa (calibração abaixo).
 *
 * Mede tempo de CPU (user+system, process.cpuUsage), não relógio de parede: quando o pnpm -r roda outros
 * pacotes em paralelo ou a máquina de CI está disputada, o relógio inclui o tempo em que o processo ficou
 * fora da CPU, o que não é lentidão do código. Uma regressão real (mais trabalho) aumenta o CPU time.
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

/**
 * Calibração de CPU na mesma execução: um trabalho fixo (aritmética + alocação + Map + sort, o mesmo perfil
 * do cálculo) é medido em CPU time. REF_OCIOSA_MS é a mediana dele em máquina ociosa; sob contenção de
 * cache/SMT/GC (pnpm -r em paralelo) o CPU time do mesmo trabalho infla, e o limite sobe na mesma proporção:
 * limite = 150 ms x fator, com fator = mediana(ref)/REF_OCIOSA_MS limitado a [1, FATOR_MAX]. Em máquina
 * ociosa o fator é 1 e vale o limite absoluto de 150 ms; o teto do fator impede que uma lentidão real
 * (ex.: +300 ms) seja absorvida pela calibração.
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
const calibrar = (): number => {
  void trabalhoReferencia() // aquecimento do JIT
  const amostras: number[] = []
  for (let i = 0; i < 7; i++) amostras.push(medir(() => void trabalhoReferencia()))
  return mediana(amostras)
}
const LIMITE_BASE_MS = 150
const ORCAMENTO_METRICA_MS = 50
const LIMITE_PAINEL_MS = 900
const LIMITE_GERADOR_MS = 1500
const K_FRIO = 5
const RODADAS = 3
const REPETICOES_QUENTE = 20
const t0Gerador = cpuMs()
const base = gerarBaseMock()
const msGerador = cpuMs() - t0Gerador
const PESQUISA = gerarPesquisaMock(base.config)
const novoContexto = () => ({
  bm: businessmap.criarContextoBM(base.bm, base.config.hoje, CALENDARIO_PADRAO),
  ac: acelerato.criarContextoAC(base.ac, base.config.hoje, CALENDARIO_PADRAO),
  pesq: pesquisa.criarContextoPesquisa(PESQUISA, base.config.hoje),
})
const ctx = novoContexto()
const filtros = (id: string) =>
  fonteDaMetrica(id as never) === 'pesquisa'
    ? {}
    : fonteDaMetrica(id as never) === 'acelerato'
      ? { equipe: [], prioridade: [], periodo: { tipo: '12s' as const } }
      : { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' as const } }
const p95De = (v: number[]): number =>
  [...v].sort((x, y) => x - y)[Math.ceil(v.length * 0.95) - 1] ?? 0
describe('desempenho (ADR 0003)', () => {
  it('o gerador do mock, na escala padrão, cabe no orçamento', () => {
    console.info(`gerador ${msGerador.toFixed(0)}ms (limite ${LIMITE_GERADOR_MS}ms)`)
    const fator = Math.min(FATOR_MAX, Math.max(1, calibrar() / REF_OCIOSA_MS))
    expect(msGerador).toBeLessThan(LIMITE_GERADOR_MS * fator)
  })

  it('cada métrica cabe no limite de CI: mediana a frio (5 contextos), mediana da 2a chamada e p95 de 20', () => {
    const linhas: string[] = []
    let fatorMax = 1
    for (const id of METRICA_IDS.filter((m) => m !== 'VISAO_GERAL')) {
      // Melhor de até RODADAS (ADR 0003, condições de medição; IS-002): cada rodada recalibra e mede de novo,
      // e para na primeira dentro do teto. Pico de contenção infla uma rodada; regressão real infla todas.
      // A rodada escolhida é a de menor razão (pior medida / limite); os tetos não mudam.
      let melhor:
        | { ref: number; fator: number; limite: number; frio: number; segunda: number; p95: number }
        | undefined
      for (let rodada = 0; rodada < RODADAS; rodada++) {
        const ref = calibrar()
        const fator = Math.min(FATOR_MAX, Math.max(1, ref / REF_OCIOSA_MS))
        const limite = LIMITE_BASE_MS * fator
        const frios: number[] = []
        const segundas: number[] = []
        for (let k = 0; k < K_FRIO; k++) {
          const c = novoContexto()
          frios.push(medir(() => calcularMetrica(id, filtros(id) as never, c)))
          segundas.push(medir(() => calcularMetrica(id, filtros(id) as never, c)))
        }
        const quentes: number[] = []
        for (let i = 0; i < REPETICOES_QUENTE; i++)
          quentes.push(medir(() => calcularMetrica(id, filtros(id) as never, ctx)))
        const r = {
          ref,
          fator,
          limite,
          frio: mediana(frios),
          segunda: mediana(segundas),
          p95: p95De(quentes),
        }
        const razao = (x: typeof r) => Math.max(x.frio, x.segunda, x.p95) / x.limite
        if (!melhor || razao(r) < razao(melhor)) melhor = r
        if (razao(r) < 1) break
      }
      const { ref, fator, limite: LIMITE_METRICA_MS, frio, segunda, p95 } = melhor!
      fatorMax = Math.max(fatorMax, fator)
      const alerta = Math.max(frio, segunda, p95) >= ORCAMENTO_METRICA_MS ? ' ALERTA>50ms' : ''
      linhas.push(
        `${id} ref=${ref.toFixed(1)} fator=${fator.toFixed(2)} frio(med)=${frio.toFixed(0)}ms 2a(med)=${segunda.toFixed(0)}ms p95=${p95.toFixed(0)}ms${alerta}`,
      )
      expect(frio, `${id} a frio (mediana de ${K_FRIO})`).toBeLessThan(LIMITE_METRICA_MS)
      expect(segunda, `${id} na 2a chamada (mediana)`).toBeLessThan(LIMITE_METRICA_MS)
      expect(p95, `${id} p95 de ${REPETICOES_QUENTE}`).toBeLessThan(LIMITE_METRICA_MS)
    }
    console.info(
      `orçamento da ADR 0003 (alerta, não falha): ${ORCAMENTO_METRICA_MS} ms; maior fator de calibração ${fatorMax.toFixed(2)}\n${linhas.join('\n')}`,
    )
  }, 120_000)

  it('VISAO_GERAL (painel) cabe no orçamento', () => {
    const ms = medir(() => calcularMetrica('VISAO_GERAL', {}, ctx))
    console.info(`VISAO_GERAL ${ms.toFixed(0)}ms (limite ${LIMITE_PAINEL_MS}ms)`)
    expect(ms).toBeLessThan(LIMITE_PAINEL_MS)
  })
})

describe('serieWip (varredura única) = estadoEm por dia', () => {
  it('dá o mesmo WIP e os mesmos bloqueados em cada dia útil dos últimos 60 dias', () => {
    const cards = ctx.bm.idx.marcos.filter((m) => m.card.granularidade === 'story')
    const fim = ctx.bm.hojeDia
    const dias = diasUteisNoIntervalo(fim - 90, fim, ctx.bm.cal)
    const ts = dias.map((d) => Math.min(ctx.bm.hoje, instanteDe(d, 17 * 60, ctx.bm.cal)))
    const r = serieWip(ctx.bm, cards, ts)
    ts.forEach((t, i) => {
      let w = 0
      let b = 0
      for (const m of cards) {
        const e = estadoEm(ctx.bm, m, t)
        if (e.emWip) {
          w++
          if (e.bloqueioAberto) b++
        }
      }
      expect(r.wip[i], `wip ${isoDeDia(dias[i] ?? 0)}`).toBe(w)
      expect(r.bloqueados[i], `bloq ${isoDeDia(dias[i] ?? 0)}`).toBe(b)
    })
  }, 60_000)
})
