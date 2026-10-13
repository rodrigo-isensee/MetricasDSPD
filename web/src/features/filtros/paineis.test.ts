import { describe, expect, it } from 'vitest'
import { PAINEIS } from './paineis'

describe('parâmetros de URL por painel (spec 2.5)', () => {
  it('abas locais de EI, S4 e E1 são parâmetros conhecidos do painel que as usa', () => {
    expect(PAINEIS.operacional.params).toContain('ei_fl1')
    expect(PAINEIS.estrategico.params).toContain('ei_fl3')
    expect(PAINEIS.sustentacao.params).toEqual(expect.arrayContaining(['s4', 'ei_sust']))
    expect(PAINEIS.estrategico.params).toContain('e1')
  })
})
