import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { ordenarNeutro } from '../core/ordenar'
import { selecionar } from './comum'
import { varrerPorColuna, type VarreduraPorColuna } from './estado'
import type { ContextoBM } from './indice'

const memo = new WeakMap<ContextoBM, Map<string, VarreduraPorColuna>>()

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
  const cards = selecionar(ctx, f, 'story', { incluirInativos: true }).filter(
    (c) =>
      !c.card.eh_subtarefa &&
      c.card.excluido_em === null &&
      (quadro === null || c.card.quadro_id === quadro),
  )
  const r = varrerPorColuna(ctx, cards, instantes)
  m.set(chave, r)
  return r
}
