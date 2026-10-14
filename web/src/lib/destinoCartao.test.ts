import { describe, expect, it } from 'vitest'
import { destinoDoCartao } from './destinoCartao'

describe('destinoDoCartao', () => {
  it('a visão vem da tabela hash -> visão', () => {
    expect(destinoDoCartao({ painel: 'operacional', id: 'o2' })).toBe(
      '/operacional?cadencia=diaria#o2',
    )
    expect(destinoDoCartao({ painel: 'operacional', id: 'o3' })).toBe(
      '/operacional?cadencia=semanal#o3',
    )
    expect(destinoDoCartao({ painel: 'operacional', id: 'o5' })).toBe(
      '/operacional?cadencia=semanal#o5',
    )
  })
  it('a sustentação vive no Operacional', () => {
    expect(destinoDoCartao({ painel: 'sustentacao', id: 's2' })).toBe(
      '/operacional?cadencia=sustentacao#s2',
    )
  })
  it('os outros painéis têm rota própria', () => {
    expect(destinoDoCartao({ painel: 'tatico', id: 't1' })).toBe('/tatico#t1')
  })
})
