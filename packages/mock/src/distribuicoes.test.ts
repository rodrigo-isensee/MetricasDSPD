import { describe, expect, it } from 'vitest'
import {
  bernoulli,
  escolha,
  escolhaPonderada,
  inteiro,
  lognormal,
  normal,
  poisson,
  uniforme,
} from './distribuicoes'
import { derivar } from './prng'

const fixo = (v: number) => () => v

describe('distribuições do gerador', () => {
  it('normal e lognormal são determinísticas e a lognormal tem a mediana pedida', () => {
    const rng = derivar(1, 'dist')
    const a = Array.from({ length: 2000 }, () => lognormal(rng, 10, 0.5)).sort((x, y) => x - y)
    expect(a[1000]).toBeGreaterThan(9)
    expect(a[1000]).toBeLessThan(11)
    expect(normal(fixo(0.5))).toBeCloseTo(Math.sqrt(-2 * Math.log(0.5)) * Math.cos(Math.PI), 9)
    expect(Number.isFinite(normal(fixo(0)))).toBe(true)
  })

  it('poisson devolve contagens inteiras com média próxima de lambda', () => {
    const rng = derivar(2, 'poisson')
    const xs = Array.from({ length: 3000 }, () => poisson(rng, 3))
    expect(xs.every((x) => Number.isInteger(x) && x >= 0)).toBe(true)
    const media = xs.reduce((s, x) => s + x, 0) / xs.length
    expect(media).toBeGreaterThan(2.8)
    expect(media).toBeLessThan(3.2)
  })

  it('bernoulli, inteiro e uniforme respeitam os limites', () => {
    expect(bernoulli(fixo(0.1), 0.2)).toBe(true)
    expect(bernoulli(fixo(0.2), 0.2)).toBe(false)
    expect(inteiro(fixo(0), 3, 7)).toBe(3)
    expect(inteiro(fixo(0.999999), 3, 7)).toBe(7)
    expect(uniforme(fixo(0.5), 2, 4)).toBe(3)
  })

  it('escolha sorteia um item e recusa lista vazia', () => {
    expect(escolha(fixo(0.99), ['a', 'b', 'c'])).toBe('c')
    expect(escolha(fixo(0), ['a', 'b', 'c'])).toBe('a')
    expect(() => escolha(fixo(0), [])).toThrow('lista vazia')
  })

  it('escolhaPonderada respeita os pesos, cai no último quando nada passa e recusa lista vazia', () => {
    const pares = [
      ['a', 1],
      ['b', 3],
    ] as const
    expect(escolhaPonderada(fixo(0), pares)).toBe('a')
    expect(escolhaPonderada(fixo(0.5), pares)).toBe('b')
    expect(escolhaPonderada(fixo(0), [['unico', 0]] as const)).toBe('unico')
    expect(() => escolhaPonderada(fixo(0), [])).toThrow('lista vazia')
  })
})
