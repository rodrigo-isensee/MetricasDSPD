import type { ResultadoT8, FiltrosFluxo } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal } from '../core/calendario'
import { taxa } from '../core/estatistica'
import { baseAmostral, criterios, periodoDe, selecionar } from './comum'
import { EXTENSAO_BM_VAZIA, type ExtensaoBM } from './extensao'
import type { ContextoBM, MarcosCard } from './indice'

/**
 * T8: sprint. A sprint é um card-template pai no BusinessMap e as entregas são os cards filhos.
 * Planejado = filho ligado ao pai até o início da sprint; ligado depois = entrada não planejada
 * (separada). Entregue = concluído até o fim da sprint. Por sprint e agregado, sem ranking nem
 * comparação entre times e sem alvo de 100% (7.2). Dado fictício até existir a coleta real.
 */
export function calcularT8(
  ctx: ContextoBM,
  f: FiltrosFluxo,
  ext: ExtensaoBM = EXTENSAO_BM_VAZIA,
): ResultadoT8 {
  const periodo = periodoDe(ctx, f)
  const porId = new Map(
    selecionar(ctx, f, 'story', { semTipo: true }).map((m) => [m.card.card_id, m]),
  )
  const ini = diaDeIso(periodo.inicio)
  const fim = diaDeIso(periodo.fim)
  const sprints = ext.sprints
    .filter((s) => diaDeIso(s.fim) >= ini && diaDeIso(s.inicio) <= fim)
    .map((s) => {
      const itens = ext.sprintCards.filter(
        (c) => c.sprint_id === s.sprint_id && porId.has(c.card_id),
      )
      const comprometidos = itens.filter((c) => diaDeIso(c.ligado_em) <= diaDeIso(s.inicio))
      const entregues = comprometidos.filter((c) => {
        const entrega = (porId.get(c.card_id) as MarcosCard).entrega
        return entrega !== null && diaLocal(entrega, ctx.cal) <= diaDeIso(s.fim)
      }).length
      return {
        sprintId: s.sprint_id,
        nome: s.nome,
        inicio: s.inicio,
        fim: s.fim,
        emAndamento: diaDeIso(s.fim) > ctx.hojeDia,
        itens: itens.length,
        comprometidos: comprometidos.length,
        entreguesDoComprometido: entregues,
        carryOver: comprometidos.length - entregues,
        entradaNaoPlanejada: itens.length - comprometidos.length,
        entreguePct: taxa(entregues, comprometidos.length),
        naoPlanejadoPct: taxa(itens.length - comprometidos.length, itens.length),
      }
    })
    .filter((s) => s.itens > 0)
  const fechadas = sprints.filter((s) => !s.emAndamento)
  const soma = (k: 'itens' | 'comprometidos' | 'entreguesDoComprometido' | 'entradaNaoPlanejada') =>
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
      naoPlanejadoPct: taxa(soma('entradaNaoPlanejada'), soma('itens')),
    },
  }
}
