import { describe, expect, it } from 'vitest'
import { gerarBaseMock } from '.'

const HOJES = [
  '2026-10-09T18:00:00-03:00',
  '2026-03-04T10:00:00-03:00',
  '2026-05-15T12:30:00-03:00',
  '2026-06-10T08:10:00-03:00',
  '2026-01-02T09:00:00-03:00',
]

describe('variações de configuração do gerador', () => {
  it('nenhuma configuração gera marco no futuro, e cada semente é reproduzível', () => {
    for (const [i, hoje] of HOJES.entries()) {
      for (const semente of Array.from({ length: 3 }, (_, k) => k + 1 + i * 20)) {
        const cfg = { escala: 0.15, semente, hoje, mesesHistorico: 12 }
        const b = gerarBaseMock(cfg)
        const limite = Date.parse(hoje)
        expect(b.bm.cards.length).toBeGreaterThan(0)
        expect(b.bm.transicoes.every((t) => t.timestamp <= limite)).toBe(true)
        expect(b.ac.chamados.every((c) => c.aberto_em <= limite)).toBe(true)
      }
    }
  })
})
