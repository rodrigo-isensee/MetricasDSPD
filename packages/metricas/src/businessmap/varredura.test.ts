import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { gerarBaseMock } from '@metricas-dspd/mock'
import { CALENDARIO_PADRAO } from '../core/calendario'
import { diasUteisNoIntervalo, instanteDe } from '../core/calendario'
import { calcularO1 } from './o1'
import { criarContextoBM } from './indice'
import { estadoEm, serieWip } from './estado'
import { varreduraPorColuna } from './varredura'

const base = gerarBaseMock({ escala: 0.4 })
const novoCtx = () => criarContextoBM(base.bm, base.config.hoje, CALENDARIO_PADRAO)
const ctx = novoCtx()

const filtro = (p: Partial<FiltrosFluxo> = {}): FiltrosFluxo => ({
  periodo: { tipo: '12s' },
  equipe: [],
  sistema: [],
  tipo: [],
  ...p,
})

const equipes = [...new Set(ctx.idx.marcos.map((m) => m.slugEquipe))].sort()
const FILTROS: FiltrosFluxo[] = [
  filtro(),
  filtro({ periodo: { tipo: '4s' } }),
  filtro({ periodo: { tipo: '12m' } }),
  filtro({ periodo: { tipo: 'custom', de: '2026-03-02', ate: '2026-05-31' } as never }),
  ...equipes.map((e) => filtro({ equipe: [e] })),
  filtro({ equipe: equipes.slice(0, 2) }),
]

describe('B8: varredura por coluna, O1 sem regressão', () => {
  // Impressão digital regravada no B11a (a base do mock mudou de propósito); a refatoração da varredura segue provada pela comparação com o estado ingênuo abaixo.
  it('o resultado do O1 mantém a impressão digital (base do mock do B11a)', () => {
    const h = createHash('sha256')
    for (const f of FILTROS) h.update(JSON.stringify(calcularO1(novoCtx(), f)))
    expect(h.digest('hex')).toBe('a57c2b0ad3da5b1be9b60fd9b514e1715924c3d06c38ba3fbd49d10cb686b9b0')
  })

  it('a soma das colunas é o total, e o total é o estadoEm por dia', () => {
    const cards = ctx.idx.marcos.filter((m) => m.card.granularidade === 'story')
    const fim = ctx.hojeDia
    const dias = diasUteisNoIntervalo(fim - 60, fim, ctx.cal)
    const ts = dias.map((d) => Math.min(ctx.hoje, instanteDe(d, 17 * 60, ctx.cal)))
    const f = filtro()
    const r = varreduraPorColuna(ctx, f, null, ts)
    expect(r.porColuna.size).toBeGreaterThan(1)
    ts.forEach((_t, i) => {
      let w = 0
      let b = 0
      for (const s of r.porColuna.values()) {
        w += s.wip[i] as number
        b += s.bloqueados[i] as number
      }
      expect(w).toBe(r.total.wip[i])
      expect(b).toBe(r.total.bloqueados[i])
    })
    const t = ts[ts.length - 1] as number
    const porColuna = new Map<string, number>()
    for (const m of cards.filter((c) => !c.card.eh_subtarefa && c.card.excluido_em === null)) {
      const e = estadoEm(ctx, m, t)
      if (e.emWip && e.coluna) porColuna.set(e.coluna, (porColuna.get(e.coluna) ?? 0) + 1)
    }
    for (const [col, n] of porColuna) {
      expect(r.porColuna.get(col)?.wip[ts.length - 1], col).toBe(n)
    }
    expect(serieWip(ctx, cards, ts).wip.length).toBe(ts.length)
  })

  it('memoiza por contexto, quadro e filtros normalizados', () => {
    const c = novoCtx()
    const ts = [c.hoje - 86_400_000, c.hoje]
    const a = varreduraPorColuna(c, filtro({ equipe: equipes.slice(0, 2) }), null, ts)
    const mesmoEmOutraOrdem = varreduraPorColuna(
      c,
      filtro({ equipe: [...equipes.slice(0, 2)].reverse() }),
      null,
      ts,
    )
    expect(mesmoEmOutraOrdem).toBe(a)
    const quadro = `quadro-${equipes[0]}`
    const q = varreduraPorColuna(c, filtro(), quadro, ts)
    expect(q).not.toBe(varreduraPorColuna(c, filtro(), null, ts))
    expect(varreduraPorColuna(c, filtro(), quadro, ts)).toBe(q)
    expect(varreduraPorColuna(c, filtro(), quadro, [ts[1] as number])).not.toBe(q)
    expect(varreduraPorColuna(novoCtx(), filtro(), quadro, ts)).not.toBe(q)
  })

  it('O1 a frio (mediana de 5, CPU) continua abaixo do limite de CI de 150 ms', () => {
    const amostras: number[] = []
    for (let i = 0; i < 5; i++) {
      const c = novoCtx()
      const t0 = process.cpuUsage()
      calcularO1(c, filtro({ periodo: { tipo: '12m' } }))
      const u = process.cpuUsage(t0)
      amostras.push((u.user + u.system) / 1000)
    }
    amostras.sort((a, b) => a - b)
    const mediana = amostras[2] as number
    console.info(
      `B8: O1 a frio, mediana ${mediana.toFixed(1)} ms (amostras ${amostras.map((a) => a.toFixed(1)).join(', ')})`,
    )
    expect(mediana).toBeLessThan(150)
  })
})
