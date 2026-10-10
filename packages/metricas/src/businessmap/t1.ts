import type { ResultadoT1 } from '@metricas-dspd/contratos'
import { CLASSES_SERVICO } from '@metricas-dspd/contratos'
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
} from './comum'
import { blocosDe, type Blocos } from './blocos'
import type { ContextoBM } from './indice'

/** T1: lead time ponta a ponta por classe de serviço (sem agregado). */
export function calcularT1(ctx: ContextoBM, f: FiltrosFluxo): ResultadoT1 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f, 'story')
  const cards = selecionar(ctx, f, 'story')
    .filter(ehDemanda)
    .filter((m) => dentro(ctx, m.entrega, janela))
  let total = 0
  const am = (vs: readonly number[]) => amostraBM('story', vs, janela)
  const classes = CLASSES_SERVICO.map((classe) => {
    const bs = cards
      .filter((m) => m.card.classe_servico === classe)
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
  return {
    base: baseAmostral(total, 'demandas entregues', janela),
    criterios: criterios('T1', periodo, janela, ctx),
    janelaPercentis: janela,
    classes,
  }
}
