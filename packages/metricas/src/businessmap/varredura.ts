import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { ordenarNeutro } from '../core/ordenar'
import { selecionar } from './comum'
import {
  varrerPorColuna,
  varrerVidaPorColuna,
  type VarreduraPorColuna,
  type VarreduraVida,
} from './estado'
import type { ContextoBM } from './indice'

const memo = new WeakMap<ContextoBM, Map<string, VarreduraPorColuna>>()

/** Cards em jogo: stories ativas ou não, sem subtarefa nem excluídos (a base do O1), do quadro (`null` = todos). */
const cardsDaVarredura = (ctx: ContextoBM, f: FiltrosFluxo, quadro: string | null) =>
  selecionar(ctx, f, 'story', { incluirInativos: true }).filter(
    (c) => !c.card.eh_subtarefa && !c.excluido && (quadro === null || c.card.quadro_id === quadro),
  )

const norm = (l: readonly string[]) => ordenarNeutro(l, (x) => [x]).join(',')

/**
 * Varredura +1/-1 por coluna dos cards em progresso (stories ativas ou não, sem subtarefa nem
 * excluídos: a base do O1), memoizada por contexto. A chave leva o quadro (`null` = todos) e os
 * filtros normalizados, além dos instantes: o resultado é compartilhado e não pode ser alterado.
 */
export function varreduraPorColuna(
  ctx: ContextoBM,
  f: FiltrosFluxo,
  quadro: string | null,
  instantes: readonly number[],
): VarreduraPorColuna {
  const chave = `${quadro ?? '*'}|${norm(f.equipe)}|${norm(f.sistema)}|${norm(f.tipo)}|${instantes.join(',')}`
  let m = memo.get(ctx)
  if (!m) {
    m = new Map()
    memo.set(ctx, m)
  }
  const pronto = m.get(chave)
  if (pronto) return pronto
  const cards = cardsDaVarredura(ctx, f, quadro)
  const r = varrerPorColuna(ctx, cards, instantes)
  m.set(chave, r)
  return r
}

const memoVida = new WeakMap<ContextoBM, Map<string, VarreduraVida>>()

/**
 * Varredura da vida inteira dos cards (de "Backlog" a "Entregue", O20), sobre a mesma seleção da varredura do WIP
 * (mesmos filtros, sem subtarefa nem excluídos), memoizada por contexto.
 */
export function varreduraVida(
  ctx: ContextoBM,
  f: FiltrosFluxo,
  quadro: string,
  instantes: readonly number[],
  desde: number,
): VarreduraVida {
  const chave = `${quadro}|${norm(f.equipe)}|${norm(f.sistema)}|${norm(f.tipo)}|${desde}|${instantes.join(',')}`
  let m = memoVida.get(ctx)
  if (!m) {
    m = new Map()
    memoVida.set(ctx, m)
  }
  const pronto = m.get(chave)
  if (pronto) return pronto
  const cards = cardsDaVarredura(ctx, f, quadro)
  const r = varrerVidaPorColuna(ctx, cards, instantes, desde)
  m.set(chave, r)
  return r
}
