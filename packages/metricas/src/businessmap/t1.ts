import type { ResultadoT1 } from '@metricas-dspd/contratos'
import { NIVEIS_PRIORIDADE_BM } from '@metricas-dspd/contratos'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { medianaDe, percentisDe, estatistica } from '../core/estatistica'
import { amostraBM } from './amostra'
import {
  baseAmostral,
  criterios,
  dentro,
  ehDemanda,
  janelaPercentis,
  periodoDe,
  r2,
  selecionar,
  semPrioridadeDe,
} from './comum'
import { blocosDe, type Blocos } from './blocos'
import type { ContextoBM } from './indice'

/** T1: lead time ponta a ponta por prioridade nativa do BusinessMap (sem agregado); card sem prioridade fica fora e é contado (E7.100). */
export function calcularT1(ctx: ContextoBM, f: FiltrosFluxo): ResultadoT1 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f, 'story')
  const cards = selecionar(ctx, f, 'story')
    .filter(ehDemanda)
    .filter((m) => dentro(ctx, m.entrega, janela))
  let total = 0
  const am = (vs: readonly number[]) => amostraBM('story', vs, janela)
  const classes = NIVEIS_PRIORIDADE_BM.map((classe) => {
    const bs = cards
      .filter((m) => m.card.prioridade === classe)
      .map((m) => blocosDe(ctx, m))
      .filter((b): b is Blocos => b !== null)
    total += bs.length
    return {
      classe,
      n: bs.length,
      estatistica: estatistica(bs.length, janela, () => {
        const p = percentisDe(am(bs.map((b) => b.total)))
        return {
          blocos: {
            fila: r2(medianaDe(am(bs.map((b) => b.fila)))),
            espera: r2(medianaDe(am(bs.map((b) => b.espera)))),
            execucao: r2(medianaDe(am(bs.map((b) => b.execucao)))),
            homologacao: r2(medianaDe(am(bs.map((b) => b.homologacao)))),
          },
          total: { p50: r2(p.p50), p85: r2(p.p85), p95: r2(p.p95) },
          fracaoFilaPct: r2(
            medianaDe(am(bs.map((b) => (b.total > 0 ? (b.fila / b.total) * 100 : 0)))),
          ),
        }
      }),
    }
  })
  const semPrioridade = semPrioridadeDe(cards)
    .map((m) => blocosDe(ctx, m))
    .filter((b) => b !== null).length
  return {
    base: baseAmostral(total, 'demandas entregues', janela),
    criterios: criterios('T1', periodo, janela, ctx),
    janelaPercentis: janela,
    semPrioridade: { n: semPrioridade, total: total + semPrioridade },
    classes,
  }
}
