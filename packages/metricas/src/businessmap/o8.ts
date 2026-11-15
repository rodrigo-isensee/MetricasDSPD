import type { ResultadoO8, FiltrosFluxo } from '@metricas-dspd/contratos'
import { MOTIVO_O8_POR_TAMANHO_SEM_DADO_REAL, TIPOS_CARD } from '@metricas-dspd/contratos'
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
 * Pedido 099 (A4, Q-099-4; L24 a): a divisão por tamanho é por tipo e só sai se o próprio tipo tem
 * `tamanho_declarado` em algum card; sem, o tipo fica com `porTamanho` nulo (nunca tudo em "Sem tamanho",
 * que pareceria dado) e `motivoPorTamanho` traz o motivo quando nenhum tipo publica a divisão.
 */
export function calcularO8(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO8 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f, 'story')
  const anterior = janelaMovelDia(diaDeIso(janela.inicio) - 1, JANELA_POR_GRANULARIDADE.story)
  const cards = selecionar(ctx, f, 'story')
  const ini = diaDeIso(janela.inicio)
  const fim = diaDeIso(janela.fim)
  let total = 0
  // L24 (a), A2: a divisão por tipo é decidida pelos entregues da janela (e filtros) do próprio tipo.
  const tipos = TIPOS_CARD.map((tipo) => {
    const todos = entreguesDe(
      ctx,
      cards.filter((m) => m.card.tipo === tipo),
    )
    const es = todos.filter((e) => e.dia >= ini && e.dia <= fim)
    total += es.length
    // O8 só seleciona cards de granularidade 'story' (selecionar(..., 'story')): o rótulo da amostra é o da própria granularidade;
    // frente e projeto nunca entram aqui (K-353, A4 do review do O8).
    const tipoComTamanho = es.some((e) => e.m.card.tamanho_declarado !== null)
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
      porTamanho: !tipoComTamanho
        ? null
        : TAMANHOS.map((tamanho) => {
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
  // O motivo (texto fixo) só sai quando nenhum tipo publica a divisão; com algum tipo publicando, o
  // tipo sem tamanho fica com `porTamanho` nulo e o painel já trata por tipo.
  const algumPublica = tipos.some((t) => t.porTamanho !== null)
  return {
    base: baseAmostral(total, 'itens concluídos', janela),
    criterios: criterios('O8', periodo, janela, ctx),
    janelaPercentis: janela,
    tipos,
    motivoPorTamanho: algumPublica ? null : MOTIVO_O8_POR_TAMANHO_SEM_DADO_REAL,
  }
}
