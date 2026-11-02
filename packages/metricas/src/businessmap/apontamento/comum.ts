/**
 * Base da aba Apontamento (pedido 059, plano §3.7): tipos de entrada, soma em segundos inteiros, percentual com piso de
 * 20 e ordem neutra de pessoas. Domínio BusinessMap: nada daqui toca o Acelerato. Pessoa só entra como `pessoaRef`
 * (chave opaca, ADR 0020); nome, `user_id` e comentário nunca chegam à biblioteca.
 */
import { MINIMO_AMOSTRA, type PctComPiso, type PessoaRef } from '@metricas-dspd/contratos'
import { publicavel } from '../../core/estatistica'
import { ordenarNeutro } from '../../core/ordenar'

import type { LinhaApontamento } from './tipos'

export const SEGUNDOS_POR_HORA = 3600

export type LinhaComPessoa = LinhaApontamento & { pessoaRef: PessoaRef }

/** Só as linhas com pessoa: a linha sem pessoa (eliminada a pedido) fica no agregado do time e fora dos blocos por pessoa. */
export const comPessoa = (linhas: readonly LinhaApontamento[]): LinhaComPessoa[] =>
  linhas.filter((l): l is LinhaComPessoa => l.pessoaRef !== null)

/** Horas para exibição ou texto; as somas e os totais ficam sempre em segundos inteiros (C-3 do plano). */
export const horas = (segundos: number): number => segundos / SEGUNDOS_POR_HORA

export const somaSegundos = (itens: readonly { segundos: number }[]): number =>
  itens.reduce((s, i) => s + i.segundos, 0)

/**
 * Percentual `parte` de `total` com o piso de 20 (o3): `n` é o número de apontamentos da base do percentual e abaixo
 * de 20 só a contagem sai. Sem teto: a utilização pode passar de 100%. Total zero publica 0%.
 */
export function pctComPiso(parte: number, total: number, n: number): PctComPiso {
  if (!publicavel(n)) return { status: 'insuficiente', n, minimo: MINIMO_AMOSTRA }
  return { status: 'ok', n, pct: total === 0 ? 0 : (parte / total) * 100 }
}

/** Agrupa preservando a ordem de chegada; a ordem final é sempre decidida por quem chama (ordenarNeutro). */
export function agrupar<T>(itens: readonly T[], chave: (t: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>()
  for (const i of itens) {
    const k = chave(i)
    const g = m.get(k)
    if (g) g.push(i)
    else m.set(k, [i])
  }
  return m
}

const numeroDe = (ref: PessoaRef): number => Number(ref.slice(1))

/** Alfabética sem acento nem caixa (para a ordem dos nomes reais). */
const chaveAlfabetica = (rotulo: string): string =>
  rotulo.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')

/**
 * Ordem neutra de pessoas (o1): alfabética pelo rótulo com nomes ligados; com nomes desligados ("Pessoa n"), pela
 * ordem numérica de `pessoaRef`. Nunca por total. Ref desconhecida em `rotulos` vai antes, pelo número.
 */
export function ordenarPorPessoa<T extends { pessoaRef: PessoaRef }>(
  itens: readonly T[],
  rotulos: ReadonlyMap<PessoaRef, string>,
  nomesReais: boolean,
): T[] {
  return ordenarNeutro(itens, (i) =>
    nomesReais
      ? [chaveAlfabetica(rotulos.get(i.pessoaRef) ?? ''), numeroDe(i.pessoaRef)]
      : [numeroDe(i.pessoaRef)],
  )
}
