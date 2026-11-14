import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { dezMaiores, LIMITE_MAIORES } from './dezMaiores'

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
        expect(r.visiveis.length).toBeLessThanOrEqual(LIMITE_MAIORES)
      }),
    )
  })

  it('propriedade: com a lista por horas decrescentes, nenhum dos demais passa do menor visível', () => {
    fc.assert(
      fc.property(linhas, (ls) => {
        const ordenada = ls.toSorted((a, b) => b.segundos - a.segundos)
        const r = dezMaiores(ordenada)
        expect(r.visiveis).toEqual(ordenada.slice(0, 10))
        const demais = ordenada.slice(10)
        expect(demais).toHaveLength(r.demais.quantidade)
        if (demais.length === 0) return
        const menor = Math.min(...r.visiveis.map((l) => l.segundos))
        for (const l of demais) expect(l.segundos).toBeLessThanOrEqual(menor)
      }),
    )
  })

  it('com 10 ou menos devolve todas na ordem recebida e sem demais (CA-36)', () => {
    const ls = [linha('B', 1), linha('A', 9), linha('C', 5)]
    expect(dezMaiores(ls)).toEqual({ visiveis: ls, demais: { quantidade: 0, segundos: 0 } })
    const dez = Array.from({ length: LIMITE_MAIORES }, (_, i) => linha(`P${i}`, i))
    expect(dezMaiores(dez).visiveis).toEqual(dez)
  })

  it('com mais de 10 corta a ordem recebida, sem reordenar, mesmo com empate na 10ª vaga (CA-33)', () => {
    const ls = [
      ...Array.from({ length: 9 }, (_, i) => linha(`P${i}`, 100 - i)),
      linha('Zeta', 50),
      linha('alfa', 50),
      linha('Érico', 50),
      linha('Beta', 10),
    ]
    const r = dezMaiores(ls)
    expect(r.visiveis).toEqual(ls.slice(0, 10))
    expect(r.visiveis[9]!.rotulo).toBe('Zeta')
    expect(r.demais).toEqual({ quantidade: 3, segundos: 110 })
  })

  it('não altera a lista recebida', () => {
    const ls = Array.from({ length: 12 }, (_, i) => linha(`P${i}`, i))
    const copia = [...ls]
    dezMaiores(ls)
    expect(ls).toEqual(copia)
  })
})
