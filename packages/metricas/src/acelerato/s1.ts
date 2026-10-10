import type { ResultadoS1 } from '@metricas-dspd/contratos'
import type { Prioridade } from '@metricas-dspd/contratos'
import type { FiltrosSustentacao } from '@metricas-dspd/contratos'
import { resumoComMedia } from '../core/estatistica'
import { amostraAC } from './amostra'
import {
  baseAmostral,
  criterios,
  janelaPercentis,
  noIntervalo,
  periodoDe,
  prioridadesAlvo,
  r2,
  selecionarAC,
} from './comum'
import type { ContextoAC } from './indice'
import type { AlvoPrioridade } from './modelo'

/**
 * S1: primeiro atendimento (MTTA) e restauração (MTTR) por prioridade, nunca agregado.
 * Horas úteis do calendário de expediente para todas as prioridades; as pendências saem do relógio
 * de resolução; exceções de registro posterior ficam fora. Mediana/P85/P95 com a média ao lado (P6).
 */
export function calcularS1(ctx: ContextoAC, f: FiltrosSustentacao): ResultadoS1 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f)
  const fechados = selecionarAC(ctx, f).filter(
    (x) => x.fechado && noIntervalo(ctx, x.c.data_finalizado, janela),
  )
  const apuraveis = fechados.filter((x) => x.apuravel)
  const alvos = ctx.idx.base.config.alvos

  const classe = (
    p: Prioridade,
    campo: 'primeiroAtendimentoHU' | 'restauracaoHU',
    alvoHoras: number,
  ) => {
    const vals = apuraveis
      .filter((x) => x.c.prioridade === p)
      .map((x) => x[campo])
      .filter((v): v is number => v !== null)
    const est = resumoComMedia(amostraAC(p, vals, janela))
    const p50 = est.status === 'ok' ? est.valor.p50 : null
    return {
      alvoHoras,
      n: vals.length,
      estatistica: est,
      razaoMediana: p50 === null ? null : r2(p50 / alvoHoras),
      razaoP85: est.status === 'ok' ? r2(est.valor.p85 / alvoHoras) : null,
      statusMeta:
        p50 === null
          ? ('sem-referencia' as const)
          : p50 <= alvoHoras
            ? ('dentro' as const)
            : ('fora' as const),
    }
  }
  return {
    base: baseAmostral(apuraveis.length, 'chamados fechados', janela),
    criterios: criterios('S1', periodo, janela, ctx),
    janelaPercentis: janela,
    excecoesForaDaApuracao: fechados.length - apuraveis.length,
    prioridades: prioridadesAlvo(f).map((p) => {
      const a = alvos.find((x) => x.prioridade === p) as AlvoPrioridade
      return {
        prioridade: p,
        primeiroAtendimento: classe(p, 'primeiroAtendimentoHU', a.primeiro_atendimento_horas),
        restauracao: classe(p, 'restauracaoHU', a.restauracao_horas),
      }
    }),
  }
}
