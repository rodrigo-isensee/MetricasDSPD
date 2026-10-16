/**
 * Faixa de concentração de conhecimento de um sistema (E8, ADR 0020 item 4): 1, 2 ou 3 ("3 ou mais") pessoas distintas.
 * Recebe só um inteiro já contado no coletor/projetor e devolve a faixa; o número exato nunca é guardado (P-T5).
 * Não é exportada pelo `index.ts` público. Sem entrega (0 pessoas) não tem faixa.
 */
export function faixaConcentracao(pessoasDistintas: number): 1 | 2 | 3 | null {
  if (!Number.isInteger(pessoasDistintas) || pessoasDistintas < 1) return null
  return pessoasDistintas >= 3 ? 3 : (pessoasDistintas as 1 | 2)
}
