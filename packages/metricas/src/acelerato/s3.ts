import type { ResultadoS3 } from '@metricas-dspd/contratos'
import { PRIORIDADES } from '@metricas-dspd/contratos'
import type { FiltrosSustentacao } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal } from '../core/calendario'
import { pctOuNulo, publicavel } from '../core/estatistica'
import { mesesEntre } from '../core/series'
import { baseAmostral, criterios, periodoDe, r2, selecionarAC } from './comum'
import type { ContextoAC } from './indice'

/** S3: volume mensal por prioridade, absoluto e em proporção. Conta todos os chamados abertos no mês. */
export function calcularS3(ctx: ContextoAC, f: FiltrosSustentacao): ResultadoS3 {
  const periodo = periodoDe(ctx, f)
  const xs = selecionarAC(ctx, f)
  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
  let total = 0
  const linhas = meses.map((b) => {
    const doMes = xs.filter((x) => {
      const d = diaLocal(x.c.aberto_em, ctx.cal)
      return d >= b.inicioDia && d <= b.fimDia
    })
    total += doMes.length
    const por = PRIORIDADES.map((p) => {
      const n = doMes.filter((x) => x.c.prioridade === p).length
      const pct = pctOuNulo(n, doMes.length)
      return { prioridade: p, n, pct: pct === null ? null : r2(pct) }
    })
    const p1p2 = doMes.filter((x) => x.c.prioridade === 'P1' || x.c.prioridade === 'P2').length
    return {
      mes: b.chave,
      emAndamento: b.emAndamento,
      total: doMes.length,
      porPrioridade: por,
      p1p2Pct: publicavel(doMes.length) ? r2((p1p2 / doMes.length) * 100) : null,
      ajustesManuais: doMes.filter((x) => x.c.prioridade_ajustada_manualmente).length,
    }
  })
  return {
    base: baseAmostral(total, 'chamados abertos', periodo),
    criterios: criterios('S3', periodo, periodo, ctx),
    meses: linhas,
  }
}
