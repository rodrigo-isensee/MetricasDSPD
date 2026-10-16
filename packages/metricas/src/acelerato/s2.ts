import type { ResultadoS2 } from '@metricas-dspd/contratos'
import type { FiltrosSustentacao } from '@metricas-dspd/contratos'
import { taxa } from '../core/estatistica'
import {
  baseAmostral,
  criterios,
  noIntervalo,
  periodoDe,
  prioridadesAlvo,
  selecionarAC,
} from './comum'
import { diaLocal } from '../core/calendario'
import type { ChamadoCalc, ContextoAC } from './indice'

const META = 90

const celula = (t: ReturnType<typeof taxa>) => ({
  taxa: t,
  statusMeta:
    t.status === 'ok'
      ? t.pct >= META
        ? ('dentro' as const)
        : ('fora' as const)
      : ('sem-referencia' as const),
})

/** Chamados fechados e apuráveis (SLA registrado a tempo) que passam pelos filtros, com o dia local do fechamento. */
export function apuraveisComDia(
  ctx: ContextoAC,
  f: FiltrosSustentacao,
): { x: ChamadoCalc; dia: number }[] {
  return selecionarAC(ctx, f)
    .filter((x) => x.apuravel && x.c.data_finalizado !== null)
    .map((x) => ({ x, dia: diaLocal(x.c.data_finalizado as number, ctx.cal) }))
}

/** O núcleo do S2, compartilhado com a tendência mensal (ADR 0019): a aderência de cada prioridade em `xs`. */
export function aderenciaPorPrioridade(
  xs: readonly ChamadoCalc[],
  f: FiltrosSustentacao,
): ResultadoS2['prioridades'] {
  return prioridadesAlvo(f).map((p) => {
    const dele = xs.filter((x) => x.c.prioridade === p)
    const pa = dele.filter((x) => x.c.status_sla_pa !== null)
    return {
      prioridade: p,
      primeiroAtendimento: celula(
        taxa(pa.filter((x) => x.c.status_sla_pa === 'NO_PRAZO').length, pa.length),
      ),
      restauracao: celula(
        taxa(dele.filter((x) => x.c.status_sla_r === 'REALIZADO_NO_PRAZO').length, dele.length),
      ),
    }
  })
}

/** S2: aderência ao SLA por prioridade, separando primeiro atendimento de restauração. */
export function calcularS2(ctx: ContextoAC, f: FiltrosSustentacao): ResultadoS2 {
  const periodo = periodoDe(ctx, f)
  const xs = selecionarAC(ctx, f).filter(
    (x) => x.apuravel && noIntervalo(ctx, x.c.data_finalizado, periodo),
  )
  return {
    base: baseAmostral(xs.length, 'chamados fechados', periodo),
    criterios: criterios('S2', periodo, periodo, ctx),
    prioridades: aderenciaPorPrioridade(xs, f),
  }
}
