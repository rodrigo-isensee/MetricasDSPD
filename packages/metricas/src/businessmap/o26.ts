import {
  FAIXAS_PASSAGENS,
  TIPOS_CARD,
  type FiltrosFluxo,
  type ResultadoO26,
} from '@metricas-dspd/contratos'
import { estatistica, percentisDe, taxa } from '../core/estatistica'
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
import type { ExtensaoTambemBM } from './extensao'
import type { ContextoBM } from './indice'
import { entreguesDe } from './o3'

/** Índice da faixa de um número de passagens: 0, 1, 2, 3 e 4 ou mais. Inteiro inválido ou negativo é "sem dado". */
const faixaDe = (passagens: number | undefined): number | null =>
  passagens === undefined || !Number.isInteger(passagens) || passagens < 0
    ? null
    : Math.min(passagens, FAIXAS_PASSAGENS.length - 1)

/**
 * O26: passagens de mão (D-5' = B; Q-a = 1 passagem; Q-b = conta). Cada entrega do período traz só o inteiro
 * `passagens` (contado no coletor, ADR 0020): a biblioteca nunca vê quem trocou. Um bloco por tipo (regra 7).
 * Histograma de entregas por faixa (0, 1, 2, 3, 4+) com a contagem sempre publicada; o percentual só com 20 ou mais
 * entregas com dado no tipo. O P85 do tempo de ciclo por faixa (ciclo do O3, `entreguesDe`, sem recálculo) só com 20 ou
 * mais entregas na faixa, dentro da janela móvel de 12 semanas. `semDado` conta as entregas sem `passagens`
 * (anteriores à coleta) e nunca entram como "0 passagens".
 */
export function calcularO26(
  ctx: ContextoBM,
  f: FiltrosFluxo,
  ext?: ExtensaoTambemBM,
): ResultadoO26 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f, 'story')
  const passagens = ext?.passagens ?? {}
  const entregues = entreguesDe(
    ctx,
    selecionar(ctx, f, 'story')
      .filter(ehDemanda)
      .filter((m) => m.entrega !== null),
  )
  const doPeriodo = entregues.filter((e) => dentro(ctx, e.m.entrega, periodo))
  const naJanela = entregues.filter((e) => dentro(ctx, e.m.entrega, janela))
  const comFaixa = <T extends { m: { card: { card_id: string } } }>(es: readonly T[]) =>
    es.flatMap((e) => {
      const i = faixaDe(passagens[e.m.card.card_id])
      return i === null ? [] : [{ e, i }]
    })
  const porTipo = TIPOS_CARD.flatMap((tipo) => {
    const todas = doPeriodo.filter((e) => e.m.card.tipo === tipo)
    if (todas.length === 0) return []
    const dado = comFaixa(todas)
    const dadoJanela = comFaixa(naJanela.filter((e) => e.m.card.tipo === tipo))
    return [
      {
        tipo,
        entregas: dado.length,
        semDado: todas.length - dado.length,
        faixas: FAIXAS_PASSAGENS.map((faixa, i) => {
          const ciclos = dadoJanela.filter((x) => x.i === i).map((x) => x.e.ciclo)
          const itens = dado.filter((x) => x.i === i).length
          return {
            faixa,
            itens,
            pct: taxa(itens, dado.length),
            cicloP85: estatistica(ciclos.length, janela, () => ({
              p85: r2(percentisDe(amostraBM('story', ciclos, janela)).p85),
            })),
          }
        }),
      },
    ]
  })
  return {
    base: baseAmostral(doPeriodo.length, 'demandas entregues', periodo),
    criterios: criterios('O26', periodo, janela, ctx),
    segmentoPor: 'tipo',
    porTipo,
  }
}
