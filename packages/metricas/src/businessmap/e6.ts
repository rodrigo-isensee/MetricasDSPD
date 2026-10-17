import type { FiltrosFluxo, ResultadoE6 } from '@metricas-dspd/contratos'
import { diaLocal, diasUteisNoIntervalo, isoDeDia } from '../core/calendario'
import { estatistica, percentisDe, taxa } from '../core/estatistica'
import { ordenarNeutro } from '../core/ordenar'
import { amostraBM } from './amostra'
import {
  baseAmostral,
  criterios,
  dentro,
  janelaPercentis,
  periodoDe,
  r2,
  selecionar,
} from './comum'
import type { ExtensaoTambemBM } from './extensao'
import type { ContextoBM } from './indice'

/**
 * E6: datas do portfólio. Projetos concluídos no período e a distância, em dias úteis inteiros (calendário da
 * biblioteca), entre a data comprometida e a conclusão, com sinal: negativo = antes, 0 = na data, positivo = atraso.
 * Vale a data registrada no compromisso (D-7, CA-20) e a tolerância é zero: entregue até a data comprometida é "na
 * data" (igual a "vencido" no O12; o dia civil decide, não a contagem de dias úteis). `replanejamentos` conta as alterações posteriores da data (derivadas das revisões
 * na coleta real). Percentual de "na data" só com 20 ou mais projetos; P50/P85 do deslize só com 20 ou mais na janela
 * móvel de 12 semanas (a mesma do E1 e do E9), e a lista de pontos (censo) sai sempre. Projeto concluído sem data
 * comprometida registrada vai para `semData` e não entra em nenhuma conta. Sem a extensão, tudo cai em `semData`.
 */
export function calcularE6(ctx: ContextoBM, f: FiltrosFluxo, ext?: ExtensaoTambemBM): ResultadoE6 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f, 'projeto')
  const datas = ext?.datasProjeto ?? {}
  const concluidos = selecionar(ctx, f, 'projeto', { semEquipe: true, semTipo: true }).filter(
    (m) => m.entrega !== null && dentro(ctx, m.entrega, periodo),
  )
  const comData = concluidos.flatMap((m) => {
    const d = datas[m.card.card_id]
    if (d === undefined) return []
    const comprometida = diaLocal(d.original, ctx.cal)
    const conclusao = diaLocal(m.entrega as number, ctx.cal)
    const deslize =
      conclusao > comprometida
        ? diasUteisNoIntervalo(comprometida + 1, conclusao, ctx.cal).length
        : conclusao < comprometida
          ? -diasUteisNoIntervalo(conclusao + 1, comprometida, ctx.cal).length
          : 0
    return [{ m, deslize, naData: conclusao <= comprometida, replanejamentos: d.replanejamentos }]
  })
  const naJanela = comData.filter((p) => dentro(ctx, p.m.entrega, janela))
  return {
    base: baseAmostral(comData.length, 'projetos concluídos com data comprometida', periodo),
    criterios: criterios('E6', periodo, janela, ctx),
    projetos: ordenarNeutro(
      comData.map((p) => ({
        cardId: p.m.card.card_id,
        codigo: p.m.card.card_id,
        titulo: p.m.card.titulo,
        concluidoEm: isoDeDia(diaLocal(p.m.entrega as number, ctx.cal)),
        deslizeDiasUteis: p.deslize,
        replanejamentos: p.replanejamentos,
      })),
      (p) => [p.cardId],
    ),
    semData: concluidos.length - comData.length,
    naData: taxa(comData.filter((p) => p.naData).length, comData.length),
    deslize: estatistica(naJanela.length, janela, () => {
      const p = percentisDe(
        amostraBM(
          'projeto',
          naJanela.map((x) => x.deslize),
          janela,
        ),
      )
      return { p50: r2(p.p50), p85: r2(p.p85) }
    }),
  }
}
