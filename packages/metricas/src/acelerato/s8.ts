import type { ResultadoS8, FiltrosSustentacao } from '@metricas-dspd/contratos'
import { META_REABERTURA_MAX_PCT } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal } from '../core/calendario'
import { taxa } from '../core/estatistica'
import { mesesEntre } from '../core/series'
import { baseAmostral, criterios, periodoDe, selecionarAC } from './comum'
import type { ExtensaoAC } from './extensao'
import type { ContextoAC } from './indice'

/** Campo sem fonte: 0 de 0, insuficiente (nunca 0% publicado). */
const SEM_CAMPO = taxa(0, 0)

/**
 * S8: taxa de reabertura = incidentes com o campo `reincidente` (ticket anterior) preenchido ÷
 * incidentes, por mês de abertura do próprio chamado reincidente (mesma lógica da S12; decisão 14,
 * critério versionado T2.6). Sem intervalo de dias e sem critério de sintoma. Dado fictício até a
 * coleta real do campo. Chamado sem informação do campo (`reincidenteAusente`) nunca vira "não
 * reincidente" em silêncio: `cobertura` expõe "n de N" (n = incidentes com o campo informado).
 * Sem extensão (campo sem fonte): nada é publicado (insuficiente, sem referência), nunca 0%.
 */
export function calcularS8(ctx: ContextoAC, f: FiltrosSustentacao, ext?: ExtensaoAC): ResultadoS8 {
  const periodo = periodoDe(ctx, f)
  const abertos = selecionarAC(ctx, f).filter((x) => x.c.natureza === 'incidente')
  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
  const ausente = ext?.reincidenteAusente ?? {}
  let n = 0
  let k = 0
  let informados = 0
  const linhas = meses.map((b) => {
    const doMes = abertos.filter((x) => {
      const d = diaLocal(x.c.aberto_em, ctx.cal)
      return d >= b.inicioDia && d <= b.fimDia
    })
    const r = doMes.filter((x) => ext?.reabertoDe[x.c.chamado_id] !== undefined).length
    n += doMes.length
    k += r
    informados += doMes.filter((x) => ausente[x.c.chamado_id] !== true).length
    return {
      mes: b.chave,
      emAndamento: b.emAndamento,
      encerrados: doMes.length,
      reabertos: ext === undefined ? 0 : r,
      taxa: ext === undefined ? SEM_CAMPO : taxa(r, doMes.length),
    }
  })
  const total = ext === undefined ? SEM_CAMPO : taxa(k, n)
  return {
    base: baseAmostral(n, 'incidentes abertos', periodo),
    criterios: criterios('S8', periodo, periodo, ctx),
    metaMaxPct: META_REABERTURA_MAX_PCT,
    campoDisponivel: ext !== undefined,
    cobertura: { n: ext === undefined ? 0 : informados, total: n },
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
