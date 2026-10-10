import { describe, expect, it } from 'vitest'
import { validarPeriodoCustom } from './periodo'

const hist = { inicio: '2026-01-01', fim: '2026-10-09' }

describe('validarPeriodoCustom', () => {
  it('pede as duas datas válidas', () => {
    expect(validarPeriodoCustom('', '2026-03-01', hist)).toBe('Informe as duas datas.')
    expect(validarPeriodoCustom('2026-03-01', '2026-02-30', hist)).toBe('Informe as duas datas.')
  })
  it('exige ordem, limites do histórico e 7 dias', () => {
    expect(validarPeriodoCustom('2026-03-10', '2026-03-01', hist)).toMatch(/anterior/)
    expect(validarPeriodoCustom('2026-03-01', '2026-11-01', hist)).toMatch(/09\/10\/2026/)
    expect(validarPeriodoCustom('2025-12-01', '2026-03-01', hist)).toBe(
      'Há dados a partir de 01/01/2026. Escolha uma data a partir dela.',
    )
    expect(validarPeriodoCustom('2026-03-01', '2026-03-05', hist)).toMatch(/7 dias/)
  })
  it('aceita um intervalo válido', () => {
    expect(validarPeriodoCustom('2026-03-01', '2026-03-07', hist)).toBeNull()
  })
})
