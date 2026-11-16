import type { ResultadoT4 } from '@metricas-dspd/contratos'
import { NIVEIS_PRIORIDADE_BM, META_RAZAO_MAX, META_RAZAO_MIN } from '@metricas-dspd/contratos'
import type { Intervalo } from '@metricas-dspd/contratos'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal } from '../core/calendario'
import { estatistica, medianaDe } from '../core/estatistica'
import { maximo, minimo } from '../core/extremos'
import { media } from '../core/percentil'
import { semanasEntre } from '../core/series'
import {
  baseAmostral,
  criterios,
  ehDemanda,
  periodoDe,
  r2,
  selecionar,
  semPrioridadeDe,
} from './comum'
import { amostraBM } from './amostra'
import type { ContextoBM } from './indice'

const faixa = (v: readonly number[], j: Intervalo) => ({
  min: minimo(v),
  max: maximo(v),
  mediana: medianaDe(amostraBM('story', v, j)),
  media: r2(media(v)),
})

/** T4: demanda x capacidade, sempre por prioridade nativa do BusinessMap (nunca agregado; E7.100). Card sem prioridade fica fora e é contado. */
export function calcularT4(ctx: ContextoBM, f: FiltrosFluxo): ResultadoT4 {
  const periodo = periodoDe(ctx, f)
  const cards = selecionar(ctx, f, 'story').filter(ehDemanda)
  const semanas = semanasEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
  let total = 0
  // Cartões distintos com chegada ou entrega em semana completa (cartão entregue na janela não conta 2, A4).
  const cartoesDe = (xs: typeof cards): number => {
    const completas = semanas.filter((s) => !s.emAndamento)
    const na = (t: number | null): boolean =>
      t !== null &&
      ((d) => completas.some((s) => d >= s.inicioDia && d <= s.fimDia))(diaLocal(t, ctx.cal))
    return xs.filter((m) => na(m.entrada) || na(m.entrega)).length
  }
  const classes = NIVEIS_PRIORIDADE_BM.map((classe) => {
    const xs = cards.filter((m) => m.card.prioridade === classe)
    const chegadas = xs.map((m) => diaLocal(m.entrada, ctx.cal))
    const saidas = xs
      .filter((m) => m.entrega !== null)
      .map((m) => diaLocal(m.entrega as number, ctx.cal))
    const linhas = semanas.map((s) => ({
      semana: s.chave,
      emAndamento: s.emAndamento,
      chegada: chegadas.filter((d) => d >= s.inicioDia && d <= s.fimDia).length,
      vazao: saidas.filter((d) => d >= s.inicioDia && d <= s.fimDia).length,
    }))
    const completas = linhas.filter((l) => !l.emAndamento)
    const somaC = completas.reduce((s, l) => s + l.chegada, 0)
    const somaV = completas.reduce((s, l) => s + l.vazao, 0)
    const n = somaC + somaV
    total += n
    const backlog = xs.filter(
      (m) => m.ativo && m.entrega === null && !m.arquivadoSemDesfecho,
    ).length
    const mediaC = completas.length ? somaC / completas.length : 0
    const mediaV = completas.length ? somaV / completas.length : 0
    const est = estatistica(n, periodo, () => {
      const filaCresce = mediaV <= mediaC
      return {
        chegada: faixa(
          completas.map((l) => l.chegada),
          periodo,
        ),
        vazao: faixa(
          completas.map((l) => l.vazao),
          periodo,
        ),
        razao: somaV === 0 ? null : r2(somaC / somaV),
        backlog,
        semanasParaZerar: filaCresce ? null : r2(backlog / (mediaV - mediaC)),
        filaCresce,
        saldo: somaV - somaC,
      }
    })
    return {
      classe,
      n,
      estatistica: est,
      statusMeta:
        est.status === 'ok' && est.valor.razao !== null
          ? est.valor.razao >= META_RAZAO_MIN && est.valor.razao <= META_RAZAO_MAX
            ? ('dentro' as const)
            : ('fora' as const)
          : ('sem-referencia' as const),
      totais: {
        chegadas: linhas.reduce((s, l) => s + l.chegada, 0),
        saidas: linhas.reduce((s, l) => s + l.vazao, 0),
        backlog,
      },
      semanas: linhas,
    }
  })
  return {
    base: baseAmostral(total, 'chegadas e entregas', periodo),
    criterios: criterios('T4', periodo, periodo, ctx),
    semPrioridade: { n: cartoesDe(semPrioridadeDe(cards)), total: cartoesDe(cards) },
    classes,
  }
}
