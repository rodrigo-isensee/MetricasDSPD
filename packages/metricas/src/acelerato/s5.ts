import type { ResultadoS5 } from '@metricas-dspd/contratos'
import { MOTIVOS_ESCALACAO_PUBLICADOS } from '@metricas-dspd/contratos'
import type { FiltrosSustentacao } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal } from '../core/calendario'
import { pctOuNulo } from '../core/estatistica'
import { mesesEntre } from '../core/series'
import { baseAmostral, criterios, noIntervalo as noP, periodoDe, r2, selecionarAC } from './comum'
import type { ContextoAC } from './indice'
import { ordenarNeutro } from '../core/ordenar'
import { motivoEscalacaoDe, separarPorFluxoProc } from './motivos'

const p = (k: number, n: number) => {
  const v = pctOuNulo(k, n)
  return v === null ? null : r2(v)
}

/** F2: base = chamados resolvidos em N2, N3 ou fornecedor, com ou sem motivo informado. */
const escalado = (n: string | null) => n === 'N2' || n === 'N3' || n === 'Fornecedor'

/**
 * S5: motivos da escalação (domínio fechado de 5 valores mais a faixa `Outro`), ordenados por volume, e evolução mensal. Só os chamados dos
 * fluxos do PROC (P1 = B do dono); os de fora não entram e vão para `foraDoFluxo`. Motivo preenchido sem par é `Outro`; vazio é "Não informado".
 */
export function calcularS5(ctx: ContextoAC, f: FiltrosSustentacao): ResultadoS5 {
  const periodo = periodoDe(ctx, f)
  const { dentro: xs, fora } = separarPorFluxoProc(
    ctx,
    selecionarAC(ctx, f).filter(
      (x) => escalado(x.c.nivel_resolucao) && noP(ctx, x.c.aberto_em, periodo),
    ),
  )
  const motivoDe = (x: (typeof xs)[number]) => motivoEscalacaoDe(x.c.motivo_escalacao)
  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
  return {
    base: baseAmostral(xs.length, 'chamados escalados', periodo),
    criterios: criterios('S5', periodo, periodo, ctx),
    motivos: ordenarNeutro(
      MOTIVOS_ESCALACAO_PUBLICADOS.map((motivo) => {
        const n = xs.filter((x) => motivoDe(x) === motivo).length
        return { motivo, n, pct: p(n, xs.length) }
      }),
      (x) => [-x.n, MOTIVOS_ESCALACAO_PUBLICADOS.indexOf(x.motivo)],
    ),
    foraDoFluxo: fora,
    naoInformado: xs.filter((x) => motivoDe(x) === null).length,
    evolucao: meses.map((b) => {
      const doMes = xs.filter((x) => {
        const d = diaLocal(x.c.aberto_em, ctx.cal)
        return d >= b.inicioDia && d <= b.fimDia
      })
      return {
        mes: b.chave,
        emAndamento: b.emAndamento,
        n: doMes.length,
        motivos: MOTIVOS_ESCALACAO_PUBLICADOS.map((motivo) => {
          const n = doMes.filter((x) => motivoDe(x) === motivo).length
          return { motivo, n, pct: p(n, doMes.length) }
        }),
      }
    }),
  }
}
