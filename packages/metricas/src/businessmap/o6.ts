import type { ResultadoO6, FiltrosFluxo } from '@metricas-dspd/contratos'
import { META_PREVISIBILIDADE_MAX, NIVEIS_PRIORIDADE_BM } from '@metricas-dspd/contratos'
import { estatistica, percentisDe } from '../core/estatistica'
import { amostraBM } from './amostra'
import {
  baseAmostral,
  criterios,
  janelaPercentis,
  periodoDe,
  r2,
  selecionar,
  semPrioridadeDe,
} from './comum'
import type { ContextoBM } from './indice'
import { entreguesDe } from './o3'
import { diaDeIso } from '../core/calendario'

/** O6: previsibilidade = P85 ÷ P50 do cycle time (mesma amostra do O3), por prioridade nativa do BusinessMap (E7.100); card sem prioridade fica fora e é contado. */
export function calcularO6(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO6 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f, 'story')
  const cards = selecionar(ctx, f, 'story')
  const ini = diaDeIso(janela.inicio)
  const fim = diaDeIso(janela.fim)
  let total = 0
  const naJanela = (xs: ReturnType<typeof selecionar>) =>
    entreguesDe(ctx, xs).filter((e) => e.dia >= ini && e.dia <= fim)
  const classes = NIVEIS_PRIORIDADE_BM.map((classe) => {
    const es = naJanela(cards.filter((m) => m.card.prioridade === classe))
    total += es.length
    const estat = estatistica(es.length, janela, () => {
      const p = percentisDe(
        amostraBM(
          'story',
          es.map((e) => e.ciclo),
          janela,
        ),
      )
      return { p50: r2(p.p50), p85: r2(p.p85), razao: r2(p.p85 / Math.max(p.p50, 0.01)) }
    })
    return {
      classe,
      n: es.length,
      estatistica: estat,
      statusMeta:
        estat.status === 'ok'
          ? estat.valor.razao < META_PREVISIBILIDADE_MAX
            ? ('dentro' as const)
            : ('fora' as const)
          : ('sem-referencia' as const),
    }
  }).filter((c) => c.n > 0)
  const semPrioridade = naJanela(semPrioridadeDe(cards)).length
  return {
    base: baseAmostral(total, 'itens concluídos', janela),
    criterios: criterios('O6', periodo, janela, ctx),
    janelaPercentis: janela,
    semPrioridade: { n: semPrioridade, total: total + semPrioridade },
    alvoMax: META_PREVISIBILIDADE_MAX,
    classes,
  }
}
