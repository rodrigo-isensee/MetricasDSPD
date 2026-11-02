import type { FlagQualidade } from '@metricas-dspd/contratos'
import { agrupar, doTime, somaSegundos } from './comum'
import type { FiltrosApontamento, LinhaApontamento } from './tipos'

const chaveDia = (pessoaRef: string, data: string): string => `${pessoaRef}|${data}`

/**
 * Pessoa e dia cuja soma passa do limite (P-5 da segurança, M-3 do plano): a anomalia é marcada e mantida, nunca
 * descartada. Calculada sobre TODAS as linhas do dia da pessoa, antes de qualquer filtro; linha sem pessoa (eliminada a
 * pedido) não entra, porque não há como somar o dia de alguém, e `outra-area` também não, porque soma várias pessoas.
 */
export function diasAtipicos(
  linhas: readonly LinhaApontamento[],
  limiteSegundos: number,
): ReadonlySet<string> {
  const doDia = agrupar(doTime(linhas), (l) => chaveDia(l.pessoaRef, l.data))
  return new Set([...doDia].filter(([, ls]) => somaSegundos(ls) > limiteSegundos).map(([k]) => k))
}

export const ehAtipico = (l: LinhaApontamento, atipicos: ReadonlySet<string>): boolean =>
  l.pessoaRef !== null && atipicos.has(chaveDia(l.pessoaRef, l.data))

/** Flags do apontamento: as da classificação mais `sem-iniciativa` (C-9) e `valor-atipico` (projeção); sem repetição. */
export function flagsEfetivas(
  l: LinhaApontamento,
  atipicos: ReadonlySet<string>,
): readonly FlagQualidade[] {
  const f = new Set(l.flags)
  if (l.semIniciativa) f.add('sem-iniciativa')
  if (ehAtipico(l, atipicos)) f.add('valor-atipico')
  return [...f]
}

const passa = <T>(escolhidos: readonly T[] | undefined, valor: T): boolean =>
  escolhidos === undefined || escolhidos.length === 0 || escolhidos.includes(valor)

/**
 * Filtros da consulta (CA-4). `soPessoa`: o mapa diário aplica só o filtro de pessoa. Lista vazia ou ausente = sem
 * filtro. Com filtro de pessoa, linha sem pessoa fica de fora. `anomalos = ocultar` tira os dias atípicos (escolha de
 * quem lê; o padrão é marcar e manter).
 */
export function filtrar(
  linhas: readonly LinhaApontamento[],
  f: FiltrosApontamento,
  atipicos: ReadonlySet<string>,
  soPessoa = false,
): LinhaApontamento[] {
  const pessoas = f.pessoa ?? []
  return linhas.filter((l) => {
    if (pessoas.length > 0 && (l.pessoaRef === null || !pessoas.includes(l.pessoaRef))) return false
    if (soPessoa) return true
    if (!passa(f.projeto, l.projeto.id)) return false
    if (!passa(f.tipo, l.tipo.id)) return false
    if (!passa(f.subtarefa, l.subtarefa.id)) return false
    if (!passa(f.subgrupo, l.subgrupo.id)) return false
    const flags = flagsEfetivas(l, atipicos)
    if (f.anomalos === 'ocultar' && flags.includes('valor-atipico')) return false
    const q = f.qualidade ?? []
    if (q.length === 0) return true
    return flags.length === 0 ? q.includes('completo') : flags.some((x) => q.includes(x))
  })
}
