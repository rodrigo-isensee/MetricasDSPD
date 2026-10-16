import { describe, expect, it } from 'vitest'
import { dominiosDaRota } from './fontes'

describe('dominiosDaRota', () => {
  it('em /operacional a fonte vem da visão (busca e hash)', () => {
    expect(dominiosDaRota('/operacional')).toEqual(['businessmap', 'acelerato'])
    expect(dominiosDaRota('/operacional', '?cadencia=diaria')).toEqual(['businessmap'])
    expect(dominiosDaRota('/operacional', '?cadencia=semanal')).toEqual(['businessmap'])
    expect(dominiosDaRota('/operacional', '?cadencia=sustentacao')).toEqual(['acelerato'])
    expect(dominiosDaRota('/operacional', '?cadencia=semanal', '#s2')).toEqual(['acelerato'])
    expect(dominiosDaRota('/operacional', '', '#o3')).toEqual(['businessmap'])
  })
  it('as outras rotas não mudam', () => {
    expect(dominiosDaRota('/tatico')).toEqual(['businessmap'])
    expect(dominiosDaRota('/')).toEqual(['businessmap', 'acelerato'])
    expect(dominiosDaRota('/dados')).toEqual(['businessmap', 'acelerato'])
  })
})
