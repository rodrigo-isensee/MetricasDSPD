import type { Estatistica, Percentis } from '@metricas-dspd/contratos'
import type { Amostra } from './amostra'
import { estatistica } from './estatistica'
import { ordenar, percentilOrdenado } from './percentil'

/**
 * Monte Carlo de vazão (T2.5; usado por T6 e E5). Reamostra, com reposição, os períodos da vazão
 * histórica de UMA `Amostra` (um domínio, uma classe, uma granularidade de período): não há como
 * misturar BusinessMap com Acelerato nem story com frente ou projeto, porque a função só recebe uma
 * amostra. A amostra traz os itens entregues por período (dia útil ou semana) dentro da janela móvel.
 *
 * Regra de 20 itens: `n` é o total de itens entregues na janela (a soma da vazão); abaixo de 20 a
 * previsão é `insuficiente` e a simulação nem roda. O resultado é sempre P50/P85/P95, nunca média.
 */

/** Gerador pseudoaleatório injetado: devolve números em [0, 1). Nunca `Math.random` dentro do núcleo. */
export type Prng = () => number

/** Unidade de um período da amostra de vazão; só rotula o resultado, não converte nada. */
export type GranularidadeVazao = 'dia' | 'semana'

export const SIMULACOES_PADRAO = 10_000

export interface OpcoesMonteCarlo {
  prng: Prng
  simulacoes?: number
}

export interface PrevisaoTermino {
  /**
   * Períodos até terminar N itens. P85 = em 85% das simulações o trabalho terminou em até esse
   * número de períodos (o compromisso externo fica no P85). Ordem: p50 <= p85 <= p95.
   */
  periodos: Percentis
  granularidade: GranularidadeVazao
  itens: number
  simulacoes: number
}

export interface PrevisaoItens {
  /**
   * Itens entregues em até D períodos, com a confiança do rótulo: P85 = em 85% das simulações
   * entregou-se pelo menos esse número (quantil conservador). Ordem: p95 <= p85 <= p50.
   */
  itens: Percentis
  granularidade: GranularidadeVazao
  periodos: number
  simulacoes: number
}

/** PRNG mulberry32: determinístico pela semente, para testes e para previsões reproduzíveis. */
export function criarPrng(semente: number): Prng {
  let s = semente >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function inteiroPositivo(v: number, nome: string): number {
  if (!Number.isInteger(v) || v < 1) throw new RangeError(`${nome}: esperado inteiro >= 1`)
  return v
}

function validar(a: Amostra, simulacoes: number): number {
  inteiroPositivo(simulacoes, 'simulacoes')
  let total = 0
  for (const v of a.valores) {
    if (!Number.isInteger(v) || v < 0)
      throw new RangeError('vazao: itens por período devem ser inteiros >= 0')
    total += v
  }
  return total
}

function sorteio(prng: Prng, n: number): number {
  return Math.min(Math.floor(prng() * n), n - 1)
}

function quantis(valores: number[], conservador: boolean): Percentis {
  const o = ordenar(valores)
  const q = (p: number) => percentilOrdenado(o, conservador ? 1 - p : p)
  return { p50: q(0.5), p85: q(0.85), p95: q(0.95) }
}

/** Quando terminam `itens` itens, reamostrando a vazão da amostra. */
export function preverTermino(
  vazao: Amostra,
  itens: number,
  granularidade: GranularidadeVazao,
  opcoes: OpcoesMonteCarlo,
): Estatistica<PrevisaoTermino> {
  inteiroPositivo(itens, 'itens')
  const simulacoes = opcoes.simulacoes ?? SIMULACOES_PADRAO
  const total = validar(vazao, simulacoes)
  return estatistica(total, vazao.janela, () => {
    const n = vazao.valores.length
    const resultados: number[] = []
    for (let s = 0; s < simulacoes; s++) {
      let feitos = 0
      let periodos = 0
      while (feitos < itens) {
        feitos += vazao.valores[sorteio(opcoes.prng, n)] as number
        periodos++
      }
      resultados.push(periodos)
    }
    return { periodos: quantis(resultados, false), granularidade, itens, simulacoes }
  })
}

/** Quantos itens saem em `periodos` períodos, reamostrando a vazão da amostra. */
export function preverItens(
  vazao: Amostra,
  periodos: number,
  granularidade: GranularidadeVazao,
  opcoes: OpcoesMonteCarlo,
): Estatistica<PrevisaoItens> {
  inteiroPositivo(periodos, 'periodos')
  const simulacoes = opcoes.simulacoes ?? SIMULACOES_PADRAO
  const total = validar(vazao, simulacoes)
  return estatistica(total, vazao.janela, () => {
    const n = vazao.valores.length
    const resultados: number[] = []
    for (let s = 0; s < simulacoes; s++) {
      let feitos = 0
      for (let p = 0; p < periodos; p++) feitos += vazao.valores[sorteio(opcoes.prng, n)] as number
      resultados.push(feitos)
    }
    return { itens: quantis(resultados, true), granularidade, periodos, simulacoes }
  })
}
