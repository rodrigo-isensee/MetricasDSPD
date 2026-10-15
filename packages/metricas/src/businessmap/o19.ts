import { MOTIVOS_BLOQUEIO, type ResultadoO19 } from '@metricas-dspd/contratos'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { estatistica, pctDiasUteis, percentisDe } from '../core/estatistica'
import { amostraBM } from './amostra'
import { bloqueiosDoPeriodo } from './bloqueios'
import { baseAmostral, criterios, du, janelaPercentis, periodoDe, r2, selecionar } from './comum'
import type { ContextoBM } from './indice'

const soma = (xs: readonly number[]): number => xs.reduce((s, x) => s + x, 0)

/**
 * O19: bloqueios por causa. Os 7 motivos do domínio fechado em ordem neutra (a interface ordena por soma).
 * Soma em dias úteis e contagem são censo e saem sempre; o percentual do total é a participação da causa nos DIAS
 * úteis bloqueados (O19-pct = B, 2026-10-16), publicado só com 20 ou mais bloqueios da causa (o mínimo continua
 * sobre bloqueios, nunca sobre dias; abaixo, só "X de Y dias úteis"), e P50/P85 só com n >= 20 por motivo, pela biblioteca, sobre a janela móvel de 12 semanas e não sobre o período.
 */
export function calcularO19(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO19 {
  const periodo = periodoDe(ctx, f)
  const cards = selecionar(ctx, f, 'story')
  const { encerrados, abertos } = bloqueiosDoPeriodo(ctx, cards, periodo)
  // Percentis na janela móvel de 12 semanas (regra inviolável), não no período; o censo segue no período.
  const janela = janelaPercentis(ctx, f, 'story')
  const naJanela = bloqueiosDoPeriodo(ctx, cards, janela).encerrados
  const total = encerrados.length
  const totalDiasUteis = r2(du(ctx, soma(encerrados.map((b) => b.duracao_horas_uteis))))
  const motivos = MOTIVOS_BLOQUEIO.map((motivo) => {
    const doMotivo = encerrados.filter((b) => b.motivo === motivo)
    const horas = doMotivo.map((b) => b.duracao_horas_uteis)
    const horasJanela = naJanela
      .filter((b) => b.motivo === motivo)
      .map((b) => b.duracao_horas_uteis)
    const diasUteis = r2(du(ctx, soma(horas)))
    return {
      motivo,
      bloqueios: doMotivo.length,
      diasUteis,
      pctDoTotal: pctDiasUteis(doMotivo.length, diasUteis, totalDiasUteis),
      duracao: estatistica(horasJanela.length, janela, () => {
        const p = percentisDe(
          amostraBM(
            'story',
            horasJanela.map((h) => du(ctx, h)),
            janela,
          ),
        )
        return { p50: r2(p.p50), p85: r2(p.p85), p95: r2(p.p95) }
      }),
    }
  })
  return {
    base: baseAmostral(total, 'bloqueios encerrados', periodo),
    criterios: criterios('O19', periodo, janela, ctx),
    motivos,
    abertosForaDaSoma: abertos,
    totalDiasUteis,
  }
}
