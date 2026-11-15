import { describe, expect, it } from 'vitest'
import { resultadoO8 } from './schemas'

// Pedido 105 (K-353): `porTamanho` nulo exige `motivoPorTamanho`; a API só produz os estados coerentes.
const janela = { inicio: '2026-01-01', fim: '2026-03-25' }
const tipoO8 = (porTamanho: unknown) => ({
  tipo: 'Melhoria',
  n: 3,
  estatistica: { status: 'insuficiente', n: 3, minimo: 20, janela },
  porTamanho,
})
const corpo = (motivoPorTamanho: string | null, porTamanho: unknown) => ({
  base: { n: 3, unidade: 'cards', janela },
  criterios: { serie: [], janela: [] },
  janelaPercentis: { ...janela, unidade: 'semanas', quantidade: 12 },
  tipos: [tipoO8(porTamanho)],
  motivoPorTamanho,
})

describe('resultadoO8: motivoPorTamanho (superRefine)', () => {
  it('recusa porTamanho nulo sem motivo, apontando o campo do motivo', () => {
    const r = resultadoO8.safeParse(corpo(null, null))
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error.issues[0]?.path).toEqual(['motivoPorTamanho'])
      expect(r.error.issues[0]?.message).toBe(
        'porTamanho nulo em todos os tipos exige motivoPorTamanho',
      )
    }
  })

  it('aceita porTamanho nulo com motivo', () => {
    expect(resultadoO8.safeParse(corpo('nenhum card tem tamanho declarado', null)).success).toBe(
      true,
    )
  })

  it('aceita porTamanho publicado sem motivo (motivo nulo)', () => {
    const p = [{ tamanho: 'P', n: 3, mediana: null }]
    expect(resultadoO8.safeParse(corpo(null, p)).success).toBe(true)
  })

  it('aceita um tipo com porTamanho nulo e motivo nulo quando outro tipo publica (L24 (a))', () => {
    const c = corpo(null, [{ tamanho: 'P', n: 3, mediana: null }])
    c.tipos.push(tipoO8(null))
    expect(resultadoO8.safeParse(c).success).toBe(true)
  })

  it('recusa motivo nulo quando todos os tipos têm porTamanho nulo (vários tipos)', () => {
    const c = corpo(null, null)
    c.tipos.push(tipoO8(null))
    expect(resultadoO8.safeParse(c).success).toBe(false)
  })

  it('aceita lista de tipos vazia sem motivo', () => {
    const c = corpo(null, null)
    c.tipos = []
    expect(resultadoO8.safeParse(c).success).toBe(true)
  })

  it('recusa motivo vazio', () => {
    expect(resultadoO8.safeParse(corpo('', null)).success).toBe(false)
  })
})
