/**
 * Percentil por interpolação linear entre ordens, h = (n - 1) * p (tipo 7 de Hyndman-Fan; igual a
 * PERCENTILE.INC do Excel/Power BI e ao padrão do NumPy). PROVISÓRIO (P1). Critério v1.
 */
export const METODO_PERCENTIL = 'interpolacao-linear-tipo-7'

/** `ordenados` deve estar em ordem crescente e não vazio. `p` entre 0 e 1. */
export function percentilOrdenado(ordenados: readonly number[], p: number): number {
  const n = ordenados.length
  if (n === 0) throw new RangeError('percentil: amostra vazia')
  if (p < 0 || p > 1) throw new RangeError('percentil: p fora de [0, 1]')
  const h = (n - 1) * p
  const lo = Math.floor(h)
  const hi = Math.min(lo + 1, n - 1)
  const a = ordenados[lo] as number
  const b = ordenados[hi] as number
  return a + (h - lo) * (b - a)
}

export function ordenar(valores: readonly number[]): number[] {
  return [...valores].sort((a, b) => a - b)
}

export function percentil(valores: readonly number[], p: number): number {
  return percentilOrdenado(ordenar(valores), p)
}

export function media(valores: readonly number[]): number {
  if (valores.length === 0) throw new RangeError('media: amostra vazia')
  return valores.reduce((s, v) => s + v, 0) / valores.length
}

export const mediana = (valores: readonly number[]): number => percentil(valores, 0.5)
