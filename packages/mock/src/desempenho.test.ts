import { describe, expect, it } from 'vitest'
import { CALENDARIO_PADRAO } from '@metricas-dspd/metricas/core'
import { METRICA_IDS } from '@metricas-dspd/contratos'
import { METRICAS_SUSTENTACAO } from '@metricas-dspd/contratos'
import { acelerato, businessmap, calcularMetrica } from '@metricas-dspd/metricas'
import { diasUteisNoIntervalo, instanteDe, isoDeDia } from '@metricas-dspd/metricas/core'
import { estadoEm, serieWip } from '@metricas-dspd/metricas/businessmap'
import { gerarBaseMock } from '.'

/**
 * Orçamento da ADR 0003: C3 < 50 ms por métrica, C4 < 300 ms por painel. Limite de CI = 3x (praticas 4).
 * Estabilidade (K-030 r1, b): a frio = MEDIANA de 5 medições, cada uma com contexto recriado sobre a
 * mesma base; 2a chamada = mediana das 5; p95 de 20 repetições a quente. O orçamento de 50 ms é
 * impresso como alerta, sem falhar. O arquivo roda sem paralelismo (vitest.config: fileParallelism false).
 */
const LIMITE_METRICA_MS = 150
const ORCAMENTO_METRICA_MS = 50
const LIMITE_PAINEL_MS = 900
const LIMITE_GERADOR_MS = 1500
const K_FRIO = 5
const REPETICOES_QUENTE = 20
const t0Gerador = performance.now()
const base = gerarBaseMock()
const msGerador = performance.now() - t0Gerador
const novoContexto = () => ({
  bm: businessmap.criarContextoBM(base.bm, base.config.hoje, CALENDARIO_PADRAO),
  ac: acelerato.criarContextoAC(base.ac, base.config.hoje, CALENDARIO_PADRAO),
})
const ctx = novoContexto()
const filtros = (id: string) =>
  METRICAS_SUSTENTACAO.includes(id as never)
    ? { equipe: [], prioridade: [], periodo: { tipo: '12s' as const } }
    : { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' as const } }
const mediana = (v: number[]): number =>
  [...v].sort((x, y) => x - y)[Math.floor((v.length - 1) / 2)] ?? 0
const p95De = (v: number[]): number =>
  [...v].sort((x, y) => x - y)[Math.ceil(v.length * 0.95) - 1] ?? 0
const medir = (fn: () => void): number => {
  const t0 = performance.now()
  fn()
  return performance.now() - t0
}

describe('desempenho (ADR 0003)', () => {
  it('o gerador do mock, na escala padrão, cabe no orçamento', () => {
    console.info(`gerador ${msGerador.toFixed(0)}ms (limite ${LIMITE_GERADOR_MS}ms)`)
    expect(msGerador).toBeLessThan(LIMITE_GERADOR_MS)
  })

  it('cada métrica cabe no limite de CI: mediana a frio (5 contextos), mediana da 2a chamada e p95 de 20', () => {
    const linhas: string[] = []
    for (const id of METRICA_IDS.filter((m) => m !== 'VISAO_GERAL')) {
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
      const frio = mediana(frios)
      const segunda = mediana(segundas)
      const p95 = p95De(quentes)
      const alerta = Math.max(frio, segunda, p95) >= ORCAMENTO_METRICA_MS ? ' ALERTA>50ms' : ''
      linhas.push(
        `${id} frio(med)=${frio.toFixed(0)}ms 2a(med)=${segunda.toFixed(0)}ms p95=${p95.toFixed(0)}ms${alerta}`,
      )
      expect(frio, `${id} a frio (mediana de ${K_FRIO})`).toBeLessThan(LIMITE_METRICA_MS)
      expect(segunda, `${id} na 2a chamada (mediana)`).toBeLessThan(LIMITE_METRICA_MS)
      expect(p95, `${id} p95 de ${REPETICOES_QUENTE}`).toBeLessThan(LIMITE_METRICA_MS)
    }
    console.info(
      `orçamento da ADR 0003 (alerta, não falha): ${ORCAMENTO_METRICA_MS} ms\n${linhas.join('\n')}`,
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
