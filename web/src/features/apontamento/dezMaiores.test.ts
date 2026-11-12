import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { dezMaiores } from './dezMaiores'

const linha = (rotulo: string, segundos: number) => ({ rotulo, segundos })

const linhas = fc.array(
  fc.record({ rotulo: fc.string({ minLength: 1, maxLength: 8 }), segundos: fc.nat(1_000_000) }),
  { maxLength: 40 },
)

describe('dezMaiores (097 L9)', () => {
  it('propriedade: soma e contagem dos visíveis mais os demais batem com o total', () => {
    fc.assert(
      fc.property(linhas, (ls) => {
        const r = dezMaiores(ls)
        const total = ls.reduce((s, l) => s + l.segundos, 0)
        const soma = r.visiveis.reduce((s, l) => s + l.segundos, 0) + r.demais.segundos
        expect(soma).toBe(total)
        expect(r.visiveis.length + r.demais.quantidade).toBe(ls.length)
        expect(r.visiveis.length).toBeLessThanOrEqual(10)
      }),
    )
  })

  it('propriedade: nenhum dos demais tem mais horas que o menor dos visíveis', () => {
    fc.assert(
      fc.property(linhas, (ls) => {
        const r = dezMaiores(ls)
        if (r.demais.quantidade === 0) return
        const menor = Math.min(...r.visiveis.map((l) => l.segundos))
        const fora = ls.length - r.visiveis.length
        expect(fora).toBe(r.demais.quantidade)
        expect(r.demais.segundos).toBeLessThanOrEqual(menor * fora)
      }),
    )
  })

  it('com 10 ou menos devolve todas na ordem recebida e sem demais (CA-36)', () => {
    const ls = [linha('B', 1), linha('A', 9), linha('C', 5)]
    expect(dezMaiores(ls)).toEqual({ visiveis: ls, demais: { quantidade: 0, segundos: 0 } })
    const dez = Array.from({ length: 10 }, (_, i) => linha(`P${i}`, i))
    expect(dezMaiores(dez).visiveis).toEqual(dez)
  })

  it('com mais de 10 ordena por horas e desempata em ordem alfabética (CA-33)', () => {
    const ls = [
      ...Array.from({ length: 9 }, (_, i) => linha(`P${i}`, 100 + i)),
      linha('Zeta', 50),
      linha('Alfa', 50),
      linha('Beta', 10),
    ]
    const r = dezMaiores(ls)
    expect(r.visiveis.map((l) => l.rotulo)).toEqual([
      'P8',
      'P7',
      'P6',
      'P5',
      'P4',
      'P3',
      'P2',
      'P1',
      'P0',
      'Alfa',
    ])
    expect(r.demais).toEqual({ quantidade: 2, segundos: 60 })
  })

  it('não altera a lista recebida', () => {
    const ls = Array.from({ length: 12 }, (_, i) => linha(`P${i}`, i))
    const copia = [...ls]
    dezMaiores(ls)
    expect(ls).toEqual(copia)
  })
})
