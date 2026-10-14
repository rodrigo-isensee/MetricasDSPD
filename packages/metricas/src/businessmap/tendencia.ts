import type { FiltrosFluxo, ResultadoTendenciaFluxo } from '@metricas-dspd/contratos'
import { isoDeDia } from '../core/calendario'
import { JANELA_POR_GRANULARIDADE, janelaMovelDia } from '../core/janela'
import { MESES_TENDENCIA, limitesDosMeses, mesesFechados } from '../core/series'
import { baseAmostral, criterios } from './comum'
import { concluidosDeDemanda } from './o4'
import { classesNaJanela, entreguesPorTipo } from './o3'
import type { ContextoBM } from './indice'

/** Filtros padrão do fluxo (o Resumo não filtra): todos os recortes, janela móvel de 12 semanas. */
const PADRAO: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }

/**
 * Tendência mensal do fluxo (ADR 0019). Cada ponto é o O3 como o painel o mostraria no último dia do mês
 * (janela de 12 semanas até essa data), pelo mesmo núcleo do `calcularO3` (`classesNaJanela`): nenhuma fórmula
 * nova, e sem refazer o que a tendência não usa (pontos, série semanal, variação). Os entregues por tipo não
 * dependem do corte e são montados uma vez para os seis meses. O teste de propriedade confere cada ponto contra
 * o `calcularO3` em um contexto criado para o fim do mês. O mês em curso fica fora. Só enxerga o BusinessMap.
 */
export function calcularTendenciaFluxo(ctx: ContextoBM): ResultadoTendenciaFluxo {
  const concluidos = concluidosDeDemanda(ctx, PADRAO)
  const porTipo = entreguesPorTipo(ctx, PADRAO)
  const baldes = mesesFechados(ctx.hojeDia, MESES_TENDENCIA)
  const meses = baldes.map((b) => {
    const fimDoMes = isoDeDia(b.fimDia)
    const janelaPercentis = janelaMovelDia(b.fimDia, JANELA_POR_GRANULARIDADE.story)
    return {
      mes: b.chave,
      fimDoMes,
      janelaPercentis,
      p85PorTipo: classesNaJanela(porTipo, janelaPercentis).map((c) => ({
        tipo: c.tipo,
        n: c.naJanela.length,
        estatistica:
          c.estatistica.status === 'ok'
            ? {
                ...c.estatistica,
                valor: { p50: c.estatistica.valor.p50, p85: c.estatistica.valor.p85 },
              }
            : c.estatistica,
      })),
      concluidos: concluidos.filter((i) => i.dia >= b.inicioDia && i.dia <= b.fimDia).length,
    }
  })
  const total = meses.reduce((s, m) => s + m.concluidos, 0)
  const { inicioDia, primeiroFimDia, fimDia } = limitesDosMeses(baldes)
  const serie = { inicio: isoDeDia(inicioDia), fim: isoDeDia(fimDia) }
  const janela = {
    inicio: janelaMovelDia(primeiroFimDia, JANELA_POR_GRANULARIDADE.story).inicio,
    fim: serie.fim,
  }
  return {
    base: baseAmostral(total, 'itens concluídos', serie),
    criterios: criterios('TENDENCIA_FLUXO', serie, janela, ctx),
    meses,
  }
}
