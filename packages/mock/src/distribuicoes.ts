import type { Prng } from './prng'

export function normal(rng: Prng): number {
  const u = Math.max(rng(), 1e-12)
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/** Lognormal parametrizada pela mediana e pelo sigma (da normal subjacente). */
export function lognormal(rng: Prng, mediana: number, sigma: number): number {
  return mediana * Math.exp(sigma * normal(rng))
}

export function poisson(rng: Prng, lambda: number): number {
  const L = Math.exp(-lambda)
  let k = 0
  let p = 1
  do {
    k++
    p *= rng()
  } while (p > L)
  return k - 1
}

export const bernoulli = (rng: Prng, p: number): boolean => rng() < p

export const inteiro = (rng: Prng, min: number, max: number): number =>
  min + Math.floor(rng() * (max - min + 1))

export const uniforme = (rng: Prng, min: number, max: number): number => min + rng() * (max - min)

export function escolha<T>(rng: Prng, itens: readonly T[]): T {
  const v = itens[Math.floor(rng() * itens.length)]
  if (v === undefined) throw new Error('escolha: lista vazia')
  return v
}

export function escolhaPonderada<T>(rng: Prng, pares: readonly (readonly [T, number])[]): T {
  const total = pares.reduce((s, [, p]) => s + p, 0)
  let r = rng() * total
  for (const [v, p] of pares) {
    r -= p
    if (r < 0) return v
  }
  const ultimo = pares[pares.length - 1]
  if (!ultimo) throw new Error('escolhaPonderada: lista vazia')
  return ultimo[0]
}
