import type { ResultadoS6 } from '@/contracts/metricas'
import { MOTIVOS_ENCERRAMENTO } from '@/contracts/comum'
import type { FiltrosSustentacao } from '@/contracts/filtros'
import { diaDeIso, diaLocal } from '../core/calendario'
import { pctOuNulo, taxa } from '../core/estatistica'
import { mesesEntre } from '../core/series'
import { baseAmostral, criterios, noIntervalo, periodoDe, r2, selecionarAC } from './comum'
import type { ContextoAC } from './indice'
import { ordenarNeutro } from '../core/ordenar'

const p = (k: number, n: number) => {
  const v = pctOuNulo(k, n)
  return v === null ? null : r2(v)
}

/** S6: motivos de encerramento (5 valores) com a taxa de contorno em destaque. */
export function calcularS6(ctx: ContextoAC, f: FiltrosSustentacao): ResultadoS6 {
  const periodo = periodoDe(ctx, f)
  const xs = selecionarAC(ctx, f).filter(
    (x) => x.fechado && noIntervalo(ctx, x.c.data_finalizado, periodo),
  )
  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
  const contagem = (ys: typeof xs) =>
    MOTIVOS_ENCERRAMENTO.map((motivo) => {
      const n = ys.filter((x) => x.c.motivo_encerramento === motivo).length
      return { motivo, n, pct: p(n, ys.length) }
    })
  return {
    base: baseAmostral(xs.length, 'chamados encerrados', periodo),
    criterios: criterios('S6', periodo, periodo, ctx),
    motivos: ordenarNeutro(contagem(xs), (x) => [-x.n, MOTIVOS_ENCERRAMENTO.indexOf(x.motivo)]),
    taxaContorno: taxa(
      xs.filter((x) => x.c.motivo_encerramento === 'Contorno aplicado').length,
      xs.length,
    ),
    evolucao: meses.map((b) => {
      const doMes = xs.filter((x) => {
        const d = diaLocal(x.c.data_finalizado ?? 0, ctx.cal)
        return d >= b.inicioDia && d <= b.fimDia
      })
      return { mes: b.chave, emAndamento: b.emAndamento, n: doMes.length, motivos: contagem(doMes) }
    }),
  }
}
