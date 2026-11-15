import type { ResultadoS6 } from '@metricas-dspd/contratos'
import { MOTIVOS_ENCERRAMENTO_PUBLICADOS } from '@metricas-dspd/contratos'
import type { FiltrosSustentacao } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal } from '../core/calendario'
import { pctOuNulo, taxa } from '../core/estatistica'
import { mesesEntre } from '../core/series'
import { baseAmostral, criterios, noIntervalo, periodoDe, r2, selecionarAC } from './comum'
import type { ContextoAC } from './indice'
import { ordenarNeutro } from '../core/ordenar'
import { motivoEncerramentoDe, separarPorFluxoProc } from './motivos'

const p = (k: number, n: number) => {
  const v = pctOuNulo(k, n)
  return v === null ? null : r2(v)
}

/**
 * S6: motivos de encerramento (5 valores mais a faixa `Outro`) com a taxa de contorno em destaque. Só os chamados dos fluxos do PROC (P1 = B);
 * os de fora vão para `foraDoFluxo`. Motivo preenchido sem par é `Outro`; vazio é "Não informado" (P2 e P3 do dono).
 */
export function calcularS6(ctx: ContextoAC, f: FiltrosSustentacao): ResultadoS6 {
  const periodo = periodoDe(ctx, f)
  const { dentro: xs, fora } = separarPorFluxoProc(
    ctx,
    selecionarAC(ctx, f).filter((x) => x.fechado && noIntervalo(ctx, x.c.data_finalizado, periodo)),
  )
  const motivoDe = (x: (typeof xs)[number]) => motivoEncerramentoDe(x.c.motivo_encerramento)
  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
  const contagem = (ys: typeof xs) =>
    MOTIVOS_ENCERRAMENTO_PUBLICADOS.map((motivo) => {
      const n = ys.filter((x) => motivoDe(x) === motivo).length
      return { motivo, n, pct: p(n, ys.length) }
    })
  return {
    base: baseAmostral(xs.length, 'chamados encerrados', periodo),
    criterios: criterios('S6', periodo, periodo, ctx),
    motivos: ordenarNeutro(contagem(xs), (x) => [
      -x.n,
      MOTIVOS_ENCERRAMENTO_PUBLICADOS.indexOf(x.motivo),
    ]),
    /** Fechados sem motivo de encerramento: "Não informado", nunca inferido nem somado a outro motivo. */
    foraDoFluxo: fora,
    naoInformado: xs.filter((x) => motivoDe(x) === null).length,
    taxaContorno: taxa(xs.filter((x) => motivoDe(x) === 'Contorno aplicado').length, xs.length),
    evolucao: meses.map((b) => {
      const doMes = xs.filter((x) => {
        const d = diaLocal(x.c.data_finalizado as number, ctx.cal)
        return d >= b.inicioDia && d <= b.fimDia
      })
      return { mes: b.chave, emAndamento: b.emAndamento, n: doMes.length, motivos: contagem(doMes) }
    }),
  }
}
