/**
 * Reservado (T2.5): nenhuma métrica do núcleo usa Monte Carlo (T6 e E5 estão fora desta etapa).
 * Quando existir, deve passar por aqui, com PRNG injetado (nada de Math.random).
 */
export interface EntradaMonteCarlo {
  vazaoSemanal: readonly number[]
  itensRestantes: number
  prng: () => number
  simulacoes: number
}

export function preverTermino(entrada: EntradaMonteCarlo): never {
  throw new Error(
    `Monte Carlo não implementado nesta etapa (${entrada.simulacoes} simulações pedidas).`,
  )
}
