export type Ordem = 'alfabetica' | 'total'

/**
 * Ordem das listas por pessoa (o1): a que o servidor entrega (neutra, alfabética) é a padrão; "total" é escolha
 * de quem lê e reordena só aqui, sem nova chamada. Empate no total mantém a ordem alfabética recebida.
 */
export function ordenarPorTotal<T>(
  linhas: readonly T[],
  ordem: Ordem,
  total: (l: T) => number,
): T[] {
  if (ordem === 'alfabetica') return [...linhas]
  const indexadas = linhas.map((l, i) => ({ l, i }))
  return indexadas.toSorted((a, b) => total(b.l) - total(a.l) || a.i - b.i).map((x) => x.l)
}
