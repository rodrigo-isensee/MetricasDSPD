/** Quantos projetos o cartão AP-PROJETO mostra antes do "ver todos" (097, E5, CA-33). */
export const LIMITE_MAIORES = 10

export interface ParteDosDemais {
  quantidade: number
  segundos: number
}

export interface DezMaiores<T> {
  visiveis: T[]
  demais: ParteDosDemais
}

/**
 * Corte dos 10 projetos com mais horas, feito na web (sem contrato novo). Soma inteira de `segundos` já
 * calculados no servidor: não é tempo, percentil nem previsão. Com 10 ou menos linhas devolve todas na ordem
 * recebida e `demais` zerado (CA-36). Acima disso ordena por horas decrescentes, empate em ordem alfabética
 * do rótulo (CA-33), e agrega o restante em `demais` (CA-34). Os filtros do painel já valem nas linhas
 * recebidas (CA-37).
 */
export function dezMaiores<T extends { segundos: number; rotulo: string }>(
  linhas: readonly T[],
  limite = LIMITE_MAIORES,
): DezMaiores<T> {
  if (linhas.length <= limite)
    return { visiveis: [...linhas], demais: { quantidade: 0, segundos: 0 } }
  const ordenadas = linhas.toSorted(
    (a, b) => b.segundos - a.segundos || a.rotulo.localeCompare(b.rotulo, 'pt-BR'),
  )
  const demais = ordenadas.slice(limite)
  return {
    visiveis: ordenadas.slice(0, limite),
    demais: { quantidade: demais.length, segundos: demais.reduce((s, l) => s + l.segundos, 0) },
  }
}
