import { describe, expect, it } from 'vitest'
import { janelaIncompleta } from './series'

describe('janelaIncompleta (pedido 077, A4)', () => {
  const janela = { inicio: '2026-03-10', fim: '2026-06-01' }
  it('fronteira: inicio igual ao historicoDesde é completa; um dia antes é incompleta', () => {
    expect(janelaIncompleta(janela, '2026-03-10')).toBe(false)
    expect(janelaIncompleta(janela, '2026-03-11')).toBe(true)
  })
  it('historicoDesde ausente é falso', () => {
    expect(janelaIncompleta(janela)).toBe(false)
    expect(janelaIncompleta(janela, undefined)).toBe(false)
  })
})
