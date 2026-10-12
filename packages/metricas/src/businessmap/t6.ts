import type { ResultadoT6, FiltrosFluxo } from '@metricas-dspd/contratos'
import { diaDeIso } from '../core/calendario'
import { JANELA_POR_GRANULARIDADE, janelaMovelDia } from '../core/janela'
import { criarPrng, preverItens, preverTermino } from '../core/montecarlo'
import { amostraBM } from './amostra'
import {
  baseAmostral,
  CLASSES_T,
  criterios,
  ehDemanda,
  janelaPercentis,
  periodoDe,
  selecionar,
} from './comum'
import type { ContextoBM } from './indice'
import { ENTRADAS_T6, SEMENTE_PREVISAO, vazaoSemanal } from './apoio'

/** T6: previsão probabilística (Monte Carlo, T2.5) sobre a vazão semanal de UMA classe de serviço por vez. */
export function calcularT6(ctx: ContextoBM, f: FiltrosFluxo): ResultadoT6 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f, 'story')
  const cards = selecionar(ctx, f, 'story', { semTipo: true }).filter(ehDemanda)
  const j = janelaMovelDia(diaDeIso(janela.fim), JANELA_POR_GRANULARIDADE.story)
  let total = 0
  const classes = CLASSES_T.map((classe) => {
    const v = vazaoSemanal(
      ctx,
      cards.filter((m) => m.card.classe_servico === classe),
      j,
    )
    total += v.total
    const amostra = amostraBM('story', v.contagens, j)
    const opcoes = () => ({ prng: criarPrng(SEMENTE_PREVISAO) })
    return {
      classe,
      n: v.total,
      termino: ENTRADAS_T6.itens.map((itens) => ({
        itens,
        previsao: preverTermino(amostra, itens, 'semana', opcoes()),
      })),
      itens: ENTRADAS_T6.semanas.map((semanas) => ({
        semanas,
        previsao: preverItens(amostra, semanas, 'semana', opcoes()),
      })),
    }
  }).filter((c) => c.n > 0 || cards.some((m) => m.card.classe_servico === c.classe))
  return {
    base: baseAmostral(total, 'itens concluídos', janela),
    criterios: criterios('T6', periodo, janela, ctx),
    janelaPercentis: janela,
    entradas: { itens: [...ENTRADAS_T6.itens], semanas: [...ENTRADAS_T6.semanas] },
    classes,
  }
}
