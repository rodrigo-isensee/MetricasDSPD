import type { Intervalo } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal } from '../core/calendario'
import { semanasEntre } from '../core/series'
import type { ContextoBM, MarcosCard } from './indice'

export const ehBugCard = (m: MarcosCard): boolean =>
  m.card.tipo === 'Bug interno' || m.card.tipo === 'Defeito em produção'

/** Vazão semanal (itens entregues por semana completa) dos cards na janela móvel. */
export function vazaoSemanal(ctx: ContextoBM, cards: readonly MarcosCard[], janela: Intervalo) {
  const dias = cards
    .filter((m) => m.entrega !== null)
    .map((m) => diaLocal(m.entrega as number, ctx.cal))
  const semanas = semanasEntre(diaDeIso(janela.inicio), diaDeIso(janela.fim), ctx.hojeDia).filter(
    (s) => !s.emAndamento,
  )
  const contagens = semanas.map((s) => dias.filter((d) => d >= s.inicioDia && d <= s.fimDia).length)
  return { contagens, total: contagens.reduce((a, n) => a + n, 0) }
}

/** Semente fixa das previsões: o mesmo pedido devolve sempre a mesma previsão (reprodutível). */
export const SEMENTE_PREVISAO = 20261011
export const ENTRADAS_T6 = { itens: [10, 20, 40], semanas: [4, 8, 12] } as const
