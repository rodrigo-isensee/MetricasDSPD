import type { ResultadoO13, FiltrosFluxo } from '@metricas-dspd/contratos'
import { diaDeIso, isoDeDia } from '../core/calendario'
import { taxa } from '../core/estatistica'
import { mesesEntre } from '../core/series'
import { baseAmostral, criterios, dentro, ehDemanda, periodoDe, selecionar } from './comum'
import type { ContextoBM } from './indice'

/** O13: vazão de defeitos em produção: contagem e % sobre a vazão total de demandas do mês. Sem alvo de volume. */
export function calcularO13(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO13 {
  const periodo = periodoDe(ctx, f)
  const entregues = selecionar(ctx, f, 'story', { semTipo: true })
    .filter(ehDemanda)
    .filter((m) => m.entrega !== null)
  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
  let defeitosTotal = 0
  let vazaoTotal = 0
  const linhas = meses.map((b) => {
    const doMes = entregues.filter((m) =>
      dentro(ctx, m.entrega, { inicio: isoDeDia(b.inicioDia), fim: isoDeDia(b.fimDia) }),
    )
    const defeitos = doMes.filter((m) => m.card.tipo === 'Defeito em produção').length
    defeitosTotal += defeitos
    vazaoTotal += doMes.length
    return {
      mes: b.chave,
      emAndamento: b.emAndamento,
      defeitos,
      vazaoTotal: doMes.length,
      pct: taxa(defeitos, doMes.length),
    }
  })
  return {
    base: baseAmostral(defeitosTotal, 'defeitos entregues', periodo, {
      n: vazaoTotal,
      unidade: 'demandas entregues',
    }),
    criterios: criterios('O13', periodo, periodo, ctx),
    meses: linhas,
  }
}
