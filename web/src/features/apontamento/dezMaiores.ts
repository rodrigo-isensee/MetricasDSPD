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
 * calculados no servidor: não é tempo, percentil nem previsão. Sem segunda ordenação: corta a ordem recebida
 * (a do servidor, por horas e depois a ordem neutra), a mesma do "Ver todos", então um empate na 10ª vaga
 * nunca troca de posição entre as duas vistas (CA-33). Com 10 ou menos linhas devolve todas e `demais`
 * zerado (CA-36); acima disso agrega o restante em `demais` (CA-34). Os filtros do painel já valem nas
 * linhas recebidas (CA-37).
 */
export function dezMaiores<T extends { segundos: number }>(
  linhas: readonly T[],
  limite = LIMITE_MAIORES,
): DezMaiores<T> {
  const demais = linhas.slice(limite)
  return {
    visiveis: linhas.slice(0, limite),
    demais: { quantidade: demais.length, segundos: demais.reduce((s, l) => s + l.segundos, 0) },
  }
}
