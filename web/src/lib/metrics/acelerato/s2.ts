import type { ResultadoS2 } from '@/contracts/metricas'
import type { FiltrosSustentacao } from '@/contracts/filtros'
import { taxa } from '../core/estatistica'
import { baseAmostral, criterios, noIntervalo, periodoDe, selecionarAC } from './comum'
import type { ContextoAC } from './indice'
import { prioridadesAlvo } from './s1'

const META = 90

/** S2: aderência ao SLA por prioridade, separando primeiro atendimento de restauração. */
export function calcularS2(ctx: ContextoAC, f: FiltrosSustentacao): ResultadoS2 {
  const periodo = periodoDe(ctx, f)
  const xs = selecionarAC(ctx, f).filter(
    (x) => x.apuravel && noIntervalo(ctx, x.c.data_finalizado, periodo),
  )
  const celula = (t: ReturnType<typeof taxa>) => ({
    taxa: t,
    statusMeta:
      t.status === 'ok'
        ? t.pct >= META
          ? ('dentro' as const)
          : ('fora' as const)
        : ('sem-referencia' as const),
  })
  return {
    base: baseAmostral(xs.length, 'chamados fechados', periodo),
    criterios: criterios('S2', periodo, periodo, ctx),
    prioridades: prioridadesAlvo(f).map((p) => {
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
    }),
  }
}
