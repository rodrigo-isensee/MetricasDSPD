/**
 * Ordenação neutra: estável, total e independente do ambiente. A saída não depende da ordem de
 * entrada porque a última chave é sempre o id do item (desempate determinístico). Cada chave é
 * comparada na ordem; números pelo valor (use o negativo para ordem decrescente) e textos pelos
 * pontos de código (sem `localeCompare`, que varia com o ambiente).
 */
export function ordenarNeutro<T>(
  itens: readonly T[],
  chave: (t: T) => readonly (string | number)[],
): T[] {
  const pares = itens.map((item, i) => ({ item, i, k: chave(item) }))
  pares.sort((a, b) => {
    const n = Math.max(a.k.length, b.k.length)
    for (let j = 0; j < n; j++) {
      const x = a.k[j]
      const y = b.k[j]
      if (x === y) continue
      if (x === undefined) return -1
      if (y === undefined) return 1
      if (typeof x === 'number' && typeof y === 'number') return x < y ? -1 : 1
      const sx = String(x)
      const sy = String(y)
      if (sx !== sy) return sx < sy ? -1 : 1
    }
    return a.i - b.i
  })
  return pares.map((p) => p.item)
}
