import type { ResultadoS8, FiltrosSustentacao } from '@metricas-dspd/contratos'
import { META_REABERTURA_MAX_PCT } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal } from '../core/calendario'
import { taxa } from '../core/estatistica'
import { mesesEntre } from '../core/series'
import { baseAmostral, criterios, periodoDe, selecionarAC } from './comum'
import { EXTENSAO_AC_VAZIA, type ExtensaoAC } from './extensao'
import type { ContextoAC } from './indice'

/**
 * S8: taxa de reabertura = incidentes encerrados que foram indicados como ticket anterior no campo
 * `reincidente` de outro chamado ÷ incidentes encerrados, por mês do encerramento. Sem intervalo de
 * dias e sem critério de sintoma (decisão do usuário). Dado fictício até a coleta real do campo.
 */
export function calcularS8(
  ctx: ContextoAC,
  f: FiltrosSustentacao,
  ext: ExtensaoAC = EXTENSAO_AC_VAZIA,
): ResultadoS8 {
  const periodo = periodoDe(ctx, f)
  const reabertos = new Set(Object.values(ext.reabertoDe))
  const encerrados = selecionarAC(ctx, f).filter((x) => x.fechado && x.c.natureza === 'incidente')
  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
  let n = 0
  let k = 0
  const linhas = meses.map((b) => {
    const doMes = encerrados.filter((x) => {
      const d = diaLocal(x.c.data_finalizado as number, ctx.cal)
      return d >= b.inicioDia && d <= b.fimDia
    })
    const r = doMes.filter((x) => reabertos.has(x.c.chamado_id)).length
    n += doMes.length
    k += r
    return {
      mes: b.chave,
      emAndamento: b.emAndamento,
      encerrados: doMes.length,
      reabertos: r,
      taxa: taxa(r, doMes.length),
    }
  })
  const total = taxa(k, n)
  return {
    base: baseAmostral(n, 'incidentes encerrados', periodo),
    criterios: criterios('S8', periodo, periodo, ctx),
    metaMaxPct: META_REABERTURA_MAX_PCT,
    meses: linhas,
    total,
    statusMeta:
      total.status === 'ok'
        ? total.pct < META_REABERTURA_MAX_PCT
          ? 'dentro'
          : 'fora'
        : 'sem-referencia',
  }
}
