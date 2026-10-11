import type { ResultadoS8, FiltrosSustentacao } from '@metricas-dspd/contratos'
import { META_REABERTURA_MAX_PCT } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal, MS_DIA } from '../core/calendario'
import { taxa } from '../core/estatistica'
import { mesesEntre } from '../core/series'
import { baseAmostral, criterios, periodoDe, selecionarAC } from './comum'
import { EXTENSAO_AC_VAZIA, type ExtensaoAC } from './extensao'
import type { ContextoAC } from './indice'

/** N dias corridos do "curto intervalo" da reabertura: valor provisório do mock (pendente-usuario, S8). */
export const DIAS_REABERTURA_PADRAO = 7

/**
 * S8: taxa de reabertura = incidentes encerrados que tiveram novo chamado do mesmo sintoma em até N
 * dias ÷ incidentes encerrados, por mês do encerramento. Dado fictício até existir `reaberto_de`.
 */
export function calcularS8(
  ctx: ContextoAC,
  f: FiltrosSustentacao,
  ext: ExtensaoAC = EXTENSAO_AC_VAZIA,
  dias: number = DIAS_REABERTURA_PADRAO,
): ResultadoS8 {
  const periodo = periodoDe(ctx, f)
  const porId = new Map(ctx.idx.chamados.map((x) => [x.c.chamado_id, x.c]))
  const reabertos = new Set<string>()
  for (const [novo, original] of Object.entries(ext.reabertoDe)) {
    const n = porId.get(novo)
    const o = porId.get(original)
    if (n && o && o.data_finalizado !== null && n.aberto_em - o.data_finalizado <= dias * MS_DIA)
      reabertos.add(original)
  }
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
    diasReabertura: dias,
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
