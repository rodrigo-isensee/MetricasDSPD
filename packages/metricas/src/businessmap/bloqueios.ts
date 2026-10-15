import type { FatoBloqueio } from './modelo'
import type { Intervalo } from '@metricas-dspd/contratos'
import { diaDeIso, fimDoExpediente } from '../core/calendario'
import { dentro } from './comum'
import type { ContextoBM, MarcosCard } from './indice'

export interface BloqueiosDoPeriodo {
  /** Bloqueios com `fim` dentro do período, de cards que passaram pelos filtros. Duração sempre preenchida. */
  encerrados: readonly (FatoBloqueio & { duracao_horas_uteis: number })[]
  /** Bloqueios abertos no fim do período (inclui os que terminam depois dele): ficam fora de soma e percentil (O19). */
  abertos: number
}

/**
 * Base comum do O19 e do T10 (fato_bloqueio): só lê campos do bloqueio (motivo, fornecedor, início, fim,
 * duração), nunca pessoa. A seleção de cards (granularidade story) vem do chamador.
 */
export function bloqueiosDoPeriodo(
  ctx: ContextoBM,
  cards: readonly MarcosCard[],
  periodo: Intervalo,
): BloqueiosDoPeriodo {
  const corte = fimDoExpediente(diaDeIso(periodo.fim), ctx.cal)
  const encerrados: (FatoBloqueio & { duracao_horas_uteis: number })[] = []
  let abertos = 0
  for (const m of cards) {
    for (const b of ctx.idx.bloqueiosPorCard.get(m.card.card_id) ?? []) {
      // Aberto no fim do período: começou até o corte e ainda não tinha terminado nele (inclui o que termina depois).
      if (b.inicio <= corte && (b.fim === null || b.fim > corte)) abertos++
      if (b.fim !== null && b.duracao_horas_uteis !== null && dentro(ctx, b.fim, periodo))
        encerrados.push({ ...b, duracao_horas_uteis: b.duracao_horas_uteis })
    }
  }
  return { encerrados, abertos }
}
