import type { Prng } from './prng'

/** Faixa de latência simulada por chamada (D7): evita que a interface seja validada só com resposta instantânea. */
export const LATENCIA_MIN_MS = 150
export const LATENCIA_MAX_MS = 400

/** Sorteia uma latência na faixa, pelo PRNG com semente (nunca `Math.random`). */
export const sortearLatencia = (rng: Prng): number =>
  Math.round(LATENCIA_MIN_MS + rng() * (LATENCIA_MAX_MS - LATENCIA_MIN_MS))
