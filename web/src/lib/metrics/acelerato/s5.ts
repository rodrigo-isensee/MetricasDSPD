import type { ResultadoS5 } from '@/contracts/metricas'
import { MOTIVOS_ESCALACAO } from '@/contracts/comum'
import type { FiltrosSustentacao } from '@/contracts/filtros'
import { diaDeIso, diaLocal } from '../core/calendario'
import { pctOuNulo } from '../core/estatistica'
import { mesesEntre } from '../core/series'
import { baseAmostral, criterios, noIntervalo as noP, periodoDe, r2, selecionarAC } from './comum'
import type { ContextoAC } from './indice'

const p = (k: number, n: number) => {
  const v = pctOuNulo(k, n)
  return v === null ? null : r2(v)
}

/** S5: motivos da escalação (domínio fechado de 5 valores), ordenados por volume, e evolução mensal. */
export function calcularS5(ctx: ContextoAC, f: FiltrosSustentacao): ResultadoS5 {
  const periodo = periodoDe(ctx, f)
  const xs = selecionarAC(ctx, f).filter(
    (x) => x.c.motivo_escalacao !== null && noP(ctx, x.c.aberto_em, periodo),
  )
  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
  return {
    base: baseAmostral(xs.length, 'chamados escalados', periodo),
    criterios: criterios('S5', periodo, periodo, ctx),
    motivos: MOTIVOS_ESCALACAO.map((motivo) => {
      const n = xs.filter((x) => x.c.motivo_escalacao === motivo).length
      return { motivo, n, pct: p(n, xs.length) }
    }).sort((a, b) => b.n - a.n),
    evolucao: meses.map((b) => {
      const doMes = xs.filter((x) => {
        const d = diaLocal(x.c.aberto_em, ctx.cal)
        return d >= b.inicioDia && d <= b.fimDia
      })
      return {
        mes: b.chave,
        emAndamento: b.emAndamento,
        n: doMes.length,
        motivos: MOTIVOS_ESCALACAO.map((motivo) => {
          const n = doMes.filter((x) => x.c.motivo_escalacao === motivo).length
          return { motivo, n, pct: p(n, doMes.length) }
        }),
      }
    }),
  }
}
