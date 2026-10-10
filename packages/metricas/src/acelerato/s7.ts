import type { ResultadoS7 } from '@metricas-dspd/contratos'
import type { FiltrosSustentacao } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal } from '../core/calendario'
import { taxa } from '../core/estatistica'
import { mesesEntre } from '../core/series'
import { baseAmostral, criterios, noIntervalo, periodoDe, selecionarAC } from './comum'
import type { ContextoAC } from './indice'

/** S7: dois fenômenos medidos separados e nunca somados: ajuste manual de prioridade e reclassificação de tipo. */
export function calcularS7(ctx: ContextoAC, f: FiltrosSustentacao): ResultadoS7 {
  const periodo = periodoDe(ctx, f)
  const todos = selecionarAC(ctx, f)
  const abertos = todos.filter((x) => noIntervalo(ctx, x.c.aberto_em, periodo))
  const fechados = todos.filter((x) => x.fechado && noIntervalo(ctx, x.c.data_finalizado, periodo))
  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
  const doMes = <T>(xs: readonly T[], quando: (x: T) => number, ini: number, fim: number) =>
    xs.filter((x) => {
      const d = diaLocal(quando(x), ctx.cal)
      return d >= ini && d <= fim
    })

  const ajustes = abertos.filter((x) => x.c.prioridade_ajustada_manualmente)
  const reclass = fechados.filter(
    (x) => x.c.motivo_encerramento === 'Reclassificado, não é incidente',
  )
  return {
    base: baseAmostral(abertos.length, 'chamados abertos', periodo, {
      n: fechados.length,
      unidade: 'chamados encerrados',
    }),
    criterios: criterios('S7', periodo, periodo, ctx),
    ajusteDePrioridade: {
      meses: meses.map((b) => {
        const m = doMes(abertos, (x) => x.c.aberto_em, b.inicioDia, b.fimDia)
        const k = m.filter((x) => x.c.prioridade_ajustada_manualmente).length
        return {
          mes: b.chave,
          emAndamento: b.emAndamento,
          total: m.length,
          ocorrencias: k,
          pct: taxa(k, m.length),
        }
      }),
      totais: { total: abertos.length, ocorrencias: ajustes.length },
      justificados: {
        k: ajustes.filter((x) => x.c.justificativa_ajuste !== null).length,
        n: ajustes.length,
      },
    },
    reclassificacaoDeTipo: {
      meses: meses.map((b) => {
        const m = doMes(fechados, (x) => x.c.data_finalizado ?? 0, b.inicioDia, b.fimDia)
        const k = m.filter(
          (x) => x.c.motivo_encerramento === 'Reclassificado, não é incidente',
        ).length
        return {
          mes: b.chave,
          emAndamento: b.emAndamento,
          total: m.length,
          ocorrencias: k,
          pct: taxa(k, m.length),
        }
      }),
      totais: { total: fechados.length, ocorrencias: reclass.length },
    },
  }
}
