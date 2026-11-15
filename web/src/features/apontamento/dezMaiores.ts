import { ID_SEM_PROJETO } from '@metricas-dspd/contratos'

/** Quantos projetos o cartão AP-PROJETO mostra antes do "ver todos" (097, E5, CA-33). */
export const LIMITE_MAIORES = 10

/** Altura de cada barra e limites da altura do gráfico de projetos (097, B-3): com muitos projetos o gráfico não cresce sem fim. */
export const ALTURA_BARRA = 40
export const ALTURA_MINIMA_GRAFICO = 200
export const ALTURA_MAXIMA_GRAFICO = 1200

export const alturaGrafico = (linhas: number): number =>
  Math.min(ALTURA_MAXIMA_GRAFICO, Math.max(ALTURA_MINIMA_GRAFICO, linhas * ALTURA_BARRA))

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

export interface SemProjetoApartado<T> {
  /** Só projetos de verdade, na ordem recebida: é o que as dez vagas e todas as contagens enxergam. */
  projetos: T[]
  /** A linha sem projeto (`ID_SEM_PROJETO`), fora das vagas e das contagens; `undefined` quando não existe. */
  semProjeto: T | undefined
}

/**
 * Tira a linha sem projeto da lista (097, K-341, decisão 3a do dono): ela não é projeto, então não disputa as dez
 * vagas nem entra em "de N", "Ver todos os N" e "Demais N". A tela a coloca fixa no fim, com as horas dela.
 */
export function separarSemProjeto<T extends { id: string }>(
  linhas: readonly T[],
): SemProjetoApartado<T> {
  return {
    projetos: linhas.filter((l) => l.id !== ID_SEM_PROJETO),
    semProjeto: linhas.find((l) => l.id === ID_SEM_PROJETO),
  }
}
