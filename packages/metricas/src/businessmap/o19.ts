import { MOTIVOS_BLOQUEIO, type ResultadoO19 } from '@metricas-dspd/contratos'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { estatistica, percentisDe, taxa } from '../core/estatistica'
import { amostraBM } from './amostra'
import { bloqueiosDoPeriodo } from './bloqueios'
import { baseAmostral, criterios, du, periodoDe, r2, selecionar } from './comum'
import type { ContextoBM } from './indice'

const soma = (xs: readonly number[]): number => xs.reduce((s, x) => s + x, 0)

/**
 * O19: bloqueios por causa. Os 7 motivos do domínio fechado em ordem neutra (a interface ordena por soma).
 * Soma em dias úteis e contagem são censo e saem sempre; o percentual do total é "k de n" sobre o número de
 * bloqueios encerrados (n em itens, review R6) e P50/P85 só com n >= 20 por motivo, pela biblioteca.
 */
export function calcularO19(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO19 {
  const periodo = periodoDe(ctx, f)
  const { encerrados, abertos } = bloqueiosDoPeriodo(ctx, selecionar(ctx, f, 'story'), periodo)
  const total = encerrados.length
  const motivos = MOTIVOS_BLOQUEIO.map((motivo) => {
    const doMotivo = encerrados.filter((b) => b.motivo === motivo)
    const horas = doMotivo.map((b) => b.duracao_horas_uteis)
    return {
      motivo,
      bloqueios: doMotivo.length,
      diasUteis: r2(du(ctx, soma(horas))),
      pctDoTotal: taxa(doMotivo.length, total),
      duracao: estatistica(doMotivo.length, periodo, () => {
        const p = percentisDe(
          amostraBM(
            'story',
            horas.map((h) => du(ctx, h)),
            periodo,
          ),
        )
        return { p50: r2(p.p50), p85: r2(p.p85), p95: r2(p.p95) }
      }),
    }
  })
  return {
    base: baseAmostral(total, 'bloqueios encerrados', periodo),
    criterios: criterios('O19', periodo, periodo, ctx),
    motivos,
    abertosForaDaSoma: abertos,
    totalDiasUteis: r2(du(ctx, soma(encerrados.map((b) => b.duracao_horas_uteis)))),
  }
}
