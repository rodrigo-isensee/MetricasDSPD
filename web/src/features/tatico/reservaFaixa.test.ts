import { describe, expect, it } from 'vitest'
import { reservaFaixaTatico } from './reservaFaixa'

describe('reservaFaixaTatico (K-133)', () => {
  it('sem equipe reserva as duas linhas de alertas em desktop (130 px)', () => {
    expect(reservaFaixaTatico({ equipe: [] })).toStrictEqual({ mobile: 294, desktop: 130 })
  })

  it('com equipe reserva só uma linha (88 px), a altura final medida, para o núcleo não subir ao carregar', () => {
    expect(reservaFaixaTatico({ equipe: ['erp-protheus'] }).desktop).toBe(88)
    expect(reservaFaixaTatico({ equipe: ['dados', 'fluig'] }).desktop).toBe(88)
  })
})
