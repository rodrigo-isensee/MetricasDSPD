import type { ResultadoO8, FiltrosFluxo } from '@metricas-dspd/contratos'
import { TIPOS_CARD } from '@metricas-dspd/contratos'
import { diaDeIso } from '../core/calendario'
import { medianaDe, publicavel, resumoComMedia } from '../core/estatistica'
import { JANELA_POR_GRANULARIDADE, janelaMovelDia } from '../core/janela'
import { amostraBM } from './amostra'
import { baseAmostral, criterios, janelaPercentis, periodoDe, r2, selecionar } from './comum'
import type { ContextoBM } from './indice'
import { entreguesDe, p85NaJanela } from './o3'

const TAMANHOS = ['P', 'M', 'G', 'Sem tamanho'] as const

/**
 * O8: tamanho das demandas = tempo em execução (dias úteis, o mesmo ciclo do O3). Mediana e média
 * só junto do P85 (nunca média isolada, 7.2), e % acima do P85 da janela anterior.
 */
export function calcularO8(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO8 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f, 'story')
  const anterior = janelaMovelDia(diaDeIso(janela.inicio) - 1, JANELA_POR_GRANULARIDADE.story)
  const cards = selecionar(ctx, f, 'story')
  const ini = diaDeIso(janela.inicio)
  const fim = diaDeIso(janela.fim)
  let total = 0
  const tipos = TIPOS_CARD.map((tipo) => {
    const todos = entreguesDe(
      ctx,
      cards.filter((m) => m.card.tipo === tipo),
    )
    const es = todos.filter((e) => e.dia >= ini && e.dia <= fim)
    total += es.length
    const amostra = amostraBM(
      'story',
      es.map((e) => e.ciclo),
      janela,
    )
    const res = resumoComMedia(amostra)
    const ref = p85NaJanela(todos, anterior).p85
    const estatistica =
      res.status === 'ok'
        ? {
            ...res,
            valor: {
              mediana: r2(res.valor.p50),
              media: r2(res.valor.media),
              p85: r2(res.valor.p85),
              acimaP85AnteriorPct:
                ref === null
                  ? null
                  : r2((es.filter((e) => e.ciclo > ref).length / es.length) * 100),
            },
          }
        : res
    return {
      tipo,
      n: es.length,
      estatistica,
      porTamanho: TAMANHOS.map((tamanho) => {
        const xs = es.filter((e) => (e.m.card.tamanho_declarado ?? 'Sem tamanho') === tamanho)
        return {
          tamanho,
          n: xs.length,
          mediana: publicavel(xs.length)
            ? r2(
                medianaDe(
                  amostraBM(
                    'story',
                    xs.map((e) => e.ciclo),
                    janela,
                  ),
                ),
              )
            : null,
        }
      }).filter((t) => t.n > 0),
    }
  }).filter((c) => c.n > 0)
  return {
    base: baseAmostral(total, 'itens concluídos', janela),
    criterios: criterios('O8', periodo, janela, ctx),
    janelaPercentis: janela,
    tipos,
  }
}
