import { describe, expect, it } from 'vitest'
import { contagemParcial, janelaIncompleta } from './series'

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

describe('contagemParcial (pedido 077, L8a)', () => {
  it('fronteira: mês que começa no historicoDesde não é parcial; um dia antes é', () => {
    expect(contagemParcial('2026-06-01', '2026-06-01')).toBe(false)
    expect(contagemParcial('2026-06-01', '2026-06-02')).toBe(true)
  })
  it('historicoDesde ausente é falso', () => {
    expect(contagemParcial('2026-06-01')).toBe(false)
  })
})
