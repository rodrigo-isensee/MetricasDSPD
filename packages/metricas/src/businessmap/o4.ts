import type { ResultadoO4 } from '@metricas-dspd/contratos'
import { TIPOS_CARD } from '@metricas-dspd/contratos'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal } from '../core/calendario'
import { estatistica, medianaDe } from '../core/estatistica'
import { maximo, minimo } from '../core/extremos'
import { JANELA_POR_GRANULARIDADE, janelaMovelDia } from '../core/janela'
import { semanasEntre } from '../core/series'
import { baseAmostral, criterios, ehDemanda, periodoDe, selecionar } from './comum'
import { amostraBM } from './amostra'
import type { ContextoBM } from './indice'

/** O4: vazão semanal com faixa (mín a máx) e mediana das semanas completas da janela. */
export function calcularO4(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO4 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaMovelDia(diaDeIso(periodo.fim), JANELA_POR_GRANULARIDADE.story)
  const cards = selecionar(ctx, f, 'story')
    .filter(ehDemanda)
    .filter((m) => m.entrega !== null)
  const itens = cards.map((m) => ({
    dia: diaLocal(m.entrega as number, ctx.cal),
    tipo: m.card.tipo,
  }))

  const semanas = semanasEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia).map(
    (s) => {
      const dele = itens.filter((i) => i.dia >= s.inicioDia && i.dia <= s.fimDia)
      return {
        semana: s.chave,
        itens: dele.length,
        emAndamento: s.emAndamento,
        porTipo: TIPOS_CARD.map((tipo) => ({
          tipo,
          itens: dele.filter((i) => i.tipo === tipo).length,
        })).filter((x) => x.itens > 0),
      }
    },
  )

  // faixa: semanas completas dentro da janela de 12 semanas
  const completas = semanasEntre(diaDeIso(janela.inicio), diaDeIso(janela.fim), ctx.hojeDia).filter(
    (s) => !s.emAndamento,
  )
  const contagens = completas.map(
    (s) => itens.filter((i) => i.dia >= s.inicioDia && i.dia <= s.fimDia).length,
  )
  // Base = soma das semanas completas (a semana em andamento fica fora das estatísticas).
  const totalJanela = contagens.reduce((s, n) => s + n, 0)
  const faixa = estatistica(totalJanela, janela, () => ({
    min: minimo(contagens),
    max: maximo(contagens),
    mediana: medianaDe(amostraBM('story', contagens, janela)),
  }))
  return {
    base: baseAmostral(totalJanela, 'itens concluídos', janela),
    criterios: criterios('O4', periodo, janela, ctx),
    semanas,
    janelaFaixa: { inicio: janela.inicio, fim: janela.fim },
    faixa,
  }
}
