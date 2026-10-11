import type { ResultadoT8, FiltrosFluxo } from '@metricas-dspd/contratos'
import { diaDeIso } from '../core/calendario'
import { taxa } from '../core/estatistica'
import { baseAmostral, criterios, periodoDe, selecionar } from './comum'
import { EXTENSAO_BM_VAZIA, type ExtensaoBM } from './extensao'
import type { ContextoBM } from './indice'

/**
 * T8: sprint. Por sprint: % do comprometido entregue, carry-over e entrada não planejada. Sempre
 * agregado (sem ranking nem comparação entre times) e sem alvo de 100% (7.2). Dado fictício.
 */
export function calcularT8(
  ctx: ContextoBM,
  f: FiltrosFluxo,
  ext: ExtensaoBM = EXTENSAO_BM_VAZIA,
): ResultadoT8 {
  const periodo = periodoDe(ctx, f)
  const ids = new Set(selecionar(ctx, f, 'story', { semTipo: true }).map((m) => m.card.card_id))
  const ini = diaDeIso(periodo.inicio)
  const fim = diaDeIso(periodo.fim)
  const sprints = ext.sprints
    .filter((s) => diaDeIso(s.fim) >= ini && diaDeIso(s.inicio) <= fim)
    .map((s) => {
      const itens = ext.sprintCards.filter((c) => c.sprint_id === s.sprint_id && ids.has(c.card_id))
      const comprometidos = itens.filter((c) => c.planejado_na_entrada)
      const entregues = comprometidos.filter((c) => c.entregue).length
      return {
        sprintId: s.sprint_id,
        inicio: s.inicio,
        fim: s.fim,
        emAndamento: diaDeIso(s.fim) > ctx.hojeDia,
        itens: itens.length,
        comprometidos: comprometidos.length,
        entreguesDoComprometido: entregues,
        carryOver: comprometidos.length - entregues,
        adicionados: itens.length - comprometidos.length,
        entreguePct: taxa(entregues, comprometidos.length),
        naoPlanejadoPct: taxa(itens.length - comprometidos.length, itens.length),
      }
    })
    .filter((s) => s.itens > 0)
  const fechadas = sprints.filter((s) => !s.emAndamento)
  const soma = (k: 'itens' | 'comprometidos' | 'entreguesDoComprometido' | 'adicionados') =>
    fechadas.reduce((t, s) => t + s[k], 0)
  return {
    base: baseAmostral(
      sprints.reduce((t, s) => t + s.itens, 0),
      'itens em sprint',
      periodo,
    ),
    criterios: criterios('T8', periodo, periodo, ctx),
    sprints,
    agregado: {
      entreguePct: taxa(soma('entreguesDoComprometido'), soma('comprometidos')),
      naoPlanejadoPct: taxa(soma('adicionados'), soma('itens')),
    },
  }
}
