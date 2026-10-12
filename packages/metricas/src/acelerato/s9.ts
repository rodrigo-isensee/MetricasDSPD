import type { ResultadoS9, FiltrosSustentacao } from '@metricas-dspd/contratos'
import { horasUteisEntre } from '../core/calendario'
import { estatistica, percentisDe, taxa } from '../core/estatistica'
import { amostraAC } from './amostra'
import {
  baseAmostral,
  criterios,
  janelaPercentis,
  noIntervalo,
  periodoDe,
  r2,
  selecionarAC,
} from './comum'
import type { ContextoAC } from './indice'
import { MOTIVOS_PENDENCIA } from './modelo'

const SEM_MOTIVO = 'Não informado'

/**
 * S9: tempo em pendência (horas úteis na etapa `Pendente`) por motivo, e cumprimento da previsão de
 * retorno. Uma distribuição por motivo; nunca agregadas.
 */
export function calcularS9(ctx: ContextoAC, f: FiltrosSustentacao): ResultadoS9 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f)
  const xs = selecionarAC(ctx, f)
  const pendencias = xs.flatMap((x) =>
    x.etapas
      .filter(
        (e) => e.etapa === 'Pendente' && e.saida !== null && noIntervalo(ctx, e.saida, janela),
      )
      .map((e) => ({
        x,
        motivo: e.motivo_pendencia ?? SEM_MOTIVO,
        horas: horasUteisEntre(e.entrada, e.saida as number, ctx.cal),
        saida: e.saida as number,
      })),
  )
  const motivos = [...MOTIVOS_PENDENCIA, SEM_MOTIVO]
    .map((motivo) => {
      const doMotivo = pendencias.filter((p) => p.motivo === motivo)
      return {
        motivo,
        n: doMotivo.length,
        estatistica: estatistica(doMotivo.length, janela, () => {
          const p = percentisDe(
            amostraAC(
              'todas',
              doMotivo.map((d) => d.horas),
              janela,
            ),
          )
          return { p50: r2(p.p50), p85: r2(p.p85), p95: r2(p.p95) }
        }),
      }
    })
    .filter((m) => m.n > 0)
  const comPrevisao = pendencias.filter((p) => p.x.c.previsao_retorno !== null)
  const noPrazo = comPrevisao.filter((p) => p.saida <= (p.x.c.previsao_retorno as number)).length
  return {
    base: baseAmostral(pendencias.length, 'pendências encerradas', janela),
    criterios: criterios('S9', periodo, janela, ctx),
    janelaPercentis: janela,
    porMotivo: motivos,
    cumprimentoPrevisao: taxa(noPrazo, comPrevisao.length),
  }
}
