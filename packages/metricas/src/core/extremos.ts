/**
 * Mínimo e máximo por laço. `Math.min(...x)` / `Math.max(...x)` com spread estouram a pilha em
 * bases grandes (ADR 0003) e são proibidos por lint; use estas funções. Lista vazia: `Infinity`
 * (mínimo) e `-Infinity` (máximo), como em `Math.min()` / `Math.max()`.
 */
export function minimo(valores: readonly number[]): number {
  let m = Infinity
  for (const v of valores) if (v < m) m = v
  return m
}

export function maximo(valores: readonly number[]): number {
  let m = -Infinity
  for (const v of valores) if (v > m) m = v
  return m
}
