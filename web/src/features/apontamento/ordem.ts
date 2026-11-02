import { PESSOA_OUTRA_AREA } from './types'

export type Ordem = 'alfabetica' | 'total'

/**
 * Ordem das listas por pessoa (o1): a que o servidor entrega (neutra, alfabética) é a padrão; "total" é escolha
 * de quem lê e reordena só aqui, sem nova chamada. Empate no total mantém a ordem alfabética recebida.
 * "Outra área" soma pessoas que não são do time: não é pessoa e fica sempre por último, em qualquer ordem.
 */
export function ordenarPorTotal<T extends { pessoaRef: string }>(
  linhas: readonly T[],
  ordem: Ordem,
  total: (l: T) => number,
): T[] {
  if (ordem === 'alfabetica') return [...linhas]
  const ultima = (l: T) => (l.pessoaRef === PESSOA_OUTRA_AREA ? 1 : 0)
  const indexadas = linhas.map((l, i) => ({ l, i }))
  return indexadas
    .toSorted((a, b) => ultima(a.l) - ultima(b.l) || total(b.l) - total(a.l) || a.i - b.i)
    .map((x) => x.l)
}
