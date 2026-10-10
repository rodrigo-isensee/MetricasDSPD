import type { ResultadoBloqueados } from '@/contracts/metricas'
import type { FiltrosFluxo } from '@/contracts/filtros'
import { diaDeIso, horasUteisEntre, fimDoExpediente } from '../core/calendario'
import { baseAmostral, criterios, du, periodoDe, r2, selecionar } from './comum'
import { estadoEm } from './estado'
import type { ContextoBM } from './indice'

/** "Bloqueados agora": lista ordenada por tempo bloqueado. Contagem pura, sem estatística. Sem coluna de pessoa. */
export function calcularBloqueados(ctx: ContextoBM, f: FiltrosFluxo): ResultadoBloqueados {
  const periodo = periodoDe(ctx, f)
  const t = Math.min(ctx.hoje, fimDoExpediente(diaDeIso(periodo.fim), ctx.cal))
  const itens = selecionar(ctx, f, 'story')
    .map((m) => ({ m, e: estadoEm(ctx, m, t) }))
    .flatMap(({ m, e }) => {
      const b = e.bloqueioAberto
      if (b === null || !e.emWip) return []
      return [
        {
          cardId: m.card.card_id,
          titulo: m.card.titulo,
          tipo: m.card.tipo,
          etapa: b.coluna,
          motivo: b.motivo,
          fornecedor: b.fornecedor,
          bloqueadoHaDiasUteis: r2(du(ctx, horasUteisEntre(b.inicio, t, ctx.cal))),
        },
      ]
    })
    .sort((a, b) => b.bloqueadoHaDiasUteis - a.bloqueadoHaDiasUteis)
  return {
    base: baseAmostral(itens.length, 'itens bloqueados', null),
    criterios: criterios('BLOQUEADOS', periodo, periodo, ctx),
    itens,
  }
}
