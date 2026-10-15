import { describe, expect, it } from 'vitest'
import { PAINEIS, textoPeriodoCurto } from './paineis'

describe('parâmetros de URL por painel (spec 2.5)', () => {
  it('abas locais de EI, S4 e E1 são parâmetros conhecidos do painel que as usa', () => {
    expect(PAINEIS.operacional.params).toContain('ei_fl1')
    expect(PAINEIS.estrategico.params).toContain('ei_fl3')
    expect(PAINEIS.sustentacao.params).toEqual(expect.arrayContaining(['s4', 'ei_sust']))
    expect(PAINEIS.estrategico.params).toContain('e1')
  })
})

describe('textoPeriodoCurto', () => {
  it('escreve o período do filtro em texto corrido, inclusive o personalizado', () => {
    expect(textoPeriodoCurto({ tipo: '12s' })).toBe('12 semanas')
    expect(textoPeriodoCurto({ tipo: '6m' })).toBe('6 meses')
    expect(textoPeriodoCurto({ tipo: 'custom', de: '2026-07-01', ate: '2026-09-30' })).toBe(
      '01/07/2026 a 30/09/2026',
    )
  })
})
