import { configure, getConfig } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { esperaMinima, lerEsperaAsync, limiteEspera } from './espera'

describe('lerEsperaAsync', () => {
  it('aceita um inteiro positivo em ms', () => {
    expect(lerEsperaAsync('5000')).toBe(5000)
    expect(lerEsperaAsync('15000')).toBe(15000)
  })

  it.each([undefined, '', '  ', 'abc', '0', '-1', 'Infinity'])(
    'falha na partida com %j',
    (valor) => {
      expect(() => lerEsperaAsync(valor)).toThrow(/METRICAS_DSPD_ESPERA_ASYNC_MS inválida/)
    },
  )
})

describe('esperaMinima', () => {
  it('fica com o explícito quando ele é maior que o global', () => {
    expect(esperaMinima(8000, 5000)).toBe(8000)
  })

  it('fica com o global quando o CI o deixa maior que o explícito', () => {
    expect(esperaMinima(8000, 15000)).toBe(15000)
  })
})

describe('limiteEspera', () => {
  const original = getConfig().asyncUtilTimeout
  afterEach(() => configure({ asyncUtilTimeout: original }))

  it('respeita a espera global configurada', () => {
    configure({ asyncUtilTimeout: 15000 })
    expect(limiteEspera(8000)).toBe(15000)
    configure({ asyncUtilTimeout: 5000 })
    expect(limiteEspera(8000)).toBe(8000)
  })
})
