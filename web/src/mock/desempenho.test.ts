import { describe, expect, it } from 'vitest'
import { CALENDARIO_PADRAO } from '@/lib/metrics/core'
import { METRICA_IDS } from '@/contracts/comum'
import { METRICAS_SUSTENTACAO } from '@/contracts/metricas'
import { acelerato, businessmap, calcularMetrica } from '@/lib/metrics'
import { diasUteisNoIntervalo, instanteDe, isoDeDia } from '@/lib/metrics/core'
import { estadoEm, serieWip } from '@/lib/metrics/businessmap/estado'
import { gerarBaseMock } from '.'

/** Orçamento da ADR 0003: C3 < 50 ms por métrica (p95, inclusive a frio), C4 < 300 ms por painel. CI: 3x (praticas 4). */
const LIMITE_METRICA_MS = 150
const LIMITE_PAINEL_MS = 900
const LIMITE_GERADOR_MS = 1500
const t0Gerador = performance.now()
const base = gerarBaseMock()
const msGerador = performance.now() - t0Gerador
const ctx = {
  bm: businessmap.criarContextoBM(base.bm, base.config.hoje, CALENDARIO_PADRAO),
  ac: acelerato.criarContextoAC(base.ac, base.config.hoje, CALENDARIO_PADRAO),
}
const filtros = (id: string) =>
  METRICAS_SUSTENTACAO.includes(id as never)
    ? { equipe: [], prioridade: [], periodo: { tipo: '12s' as const } }
    : { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' as const } }

describe('desempenho (ADR 0003)', () => {
  it('o gerador do mock, na escala padrão, cabe no orçamento', () => {
    console.info(`gerador ${msGerador.toFixed(0)}ms (limite ${LIMITE_GERADOR_MS}ms)`)
    expect(msGerador).toBeLessThan(LIMITE_GERADOR_MS)
  })

  it('cada métrica, a frio e p95 de 10 repetições, cabe no orçamento', () => {
    const linhas: string[] = []
    for (const id of METRICA_IDS.filter((m) => m !== 'VISAO_GERAL')) {
      const ts: number[] = []
      for (let i = 0; i < 10; i++) {
        const t0 = performance.now()
        calcularMetrica(id, filtros(id) as never, ctx)
        ts.push(performance.now() - t0)
      }
      const p95 = [...ts].sort((a, b) => a - b)[Math.ceil(ts.length * 0.95) - 1] ?? 0
      linhas.push(
        `${id} frio=${ts[0]?.toFixed(0)}ms 2a=${ts[1]?.toFixed(0)}ms p95=${p95.toFixed(0)}ms`,
      )
      expect(ts[0] ?? 0, `${id} a frio`).toBeLessThan(LIMITE_METRICA_MS)
      expect(ts[1] ?? 0, `${id} na 2a chamada`).toBeLessThan(LIMITE_METRICA_MS)
      expect(p95, `${id} p95`).toBeLessThan(LIMITE_METRICA_MS)
    }
    console.info(linhas.join('\n'))
  }, 60_000)

  it('VISAO_GERAL (painel) cabe no orçamento', () => {
    const t0 = performance.now()
    calcularMetrica('VISAO_GERAL', {}, ctx)
    const ms = performance.now() - t0
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
