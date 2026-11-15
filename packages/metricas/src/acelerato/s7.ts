import type { ResultadoS7 } from '@metricas-dspd/contratos'
import type { FiltrosSustentacao } from '@metricas-dspd/contratos'
import { justificativaInformada, type Chamado } from './modelo'
import { diaDeIso, diaLocal } from '../core/calendario'
import { taxa } from '../core/estatistica'
import { mesesEntre } from '../core/series'
import { baseAmostral, criterios, noIntervalo, periodoDe, selecionarAC } from './comum'
import type { ContextoAC } from './indice'
import { motivoEncerramentoDe, separarPorFluxoProc } from './motivos'

/** Texto não vazio (R6: só espaços não conta) ou, sem texto, o indicador derivado. */
const justificado = (x: { c: Chamado }): boolean =>
  justificativaInformada(x.c.justificativa_ajuste) || x.c.justificativa_informada === true

const reclassificado = (x: { c: Chamado }): boolean =>
  motivoEncerramentoDe(x.c.motivo_encerramento) === 'Reclassificado, não é incidente'

/**
 * S7: dois fenômenos medidos separados e nunca somados: ajuste manual de prioridade e reclassificação de tipo. Só os chamados dos fluxos do PROC
 * (P1 = B); `foraDoFluxo` conta os chamados distintos, abertos ou encerrados no período, que ficaram de fora. O ajuste conta só "Sim": a coleta
 * não separa "Não" de campo vazio (nota no contrato publicado).
 */
export function calcularS7(ctx: ContextoAC, f: FiltrosSustentacao): ResultadoS7 {
  const periodo = periodoDe(ctx, f)
  const todos = selecionarAC(ctx, f)
  const dosPeriodo = todos.filter(
    (x) =>
      noIntervalo(ctx, x.c.aberto_em, periodo) ||
      (x.fechado && noIntervalo(ctx, x.c.data_finalizado, periodo)),
  )
  const { dentro, fora } = separarPorFluxoProc(ctx, dosPeriodo)
  const abertos = dentro.filter((x) => noIntervalo(ctx, x.c.aberto_em, periodo))
  const fechados = dentro.filter((x) => x.fechado && noIntervalo(ctx, x.c.data_finalizado, periodo))
  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
  const doMes = <T>(xs: readonly T[], quando: (x: T) => number, ini: number, fim: number) =>
    xs.filter((x) => {
      const d = diaLocal(quando(x), ctx.cal)
      return d >= ini && d <= fim
    })

  const ajustes = abertos.filter((x) => x.c.prioridade_ajustada_manualmente)
  const reclass = fechados.filter(reclassificado)
  return {
    base: baseAmostral(abertos.length, 'chamados abertos', periodo, {
      n: fechados.length,
      unidade: 'chamados encerrados',
    }),
    criterios: criterios('S7', periodo, periodo, ctx),
    foraDoFluxo: fora,
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
        k: ajustes.filter(justificado).length,
        n: ajustes.length,
      },
    },
    reclassificacaoDeTipo: {
      meses: meses.map((b) => {
        const m = doMes(fechados, (x) => x.c.data_finalizado as number, b.inicioDia, b.fimDia)
        const k = m.filter(reclassificado).length
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
