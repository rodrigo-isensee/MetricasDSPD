import type { FiltrosSustentacao, ResultadoTendenciaSust } from '@metricas-dspd/contratos'
import { diaDeIso, isoDeDia } from '../core/calendario'
import { JANELA_POR_GRANULARIDADE, janelaMovelDia } from '../core/janela'
import { MESES_TENDENCIA, limitesDosMeses, mesesFechados } from '../core/series'
import { baseAmostral, criterios } from './comum'
import type { ContextoAC } from './indice'
import { aderenciaPorPrioridade, apuraveisComDia } from './s2'
import { diasDeAbertura } from './s3'

/** Filtros padrão da sustentação (o Resumo não filtra): todas as prioridades, janela de 12 semanas. */
const PADRAO: FiltrosSustentacao = { equipe: [], prioridade: [], periodo: { tipo: '12s' } }

/**
 * Tendência mensal da sustentação (ADR 0019). Cada ponto é o S2 como o painel o mostraria no último dia
 * do mês (12 semanas até essa data), pelo mesmo núcleo do `calcularS2` (`aderenciaPorPrioridade`): nenhuma fórmula
 * nova. O S2 só olha chamados fechados e apuráveis, que não dependem do corte, então o índice é o mesmo nos seis
 * meses. O teste de propriedade confere cada ponto contra o `calcularS2` em um contexto criado e reindexado para o
 * fim do mês. O volume é a contagem de chamados abertos no mês (base do S3). O mês em curso fica fora. Só enxerga
 * o Acelerato. */
export function calcularTendenciaSust(ctx: ContextoAC): ResultadoTendenciaSust {
  const abertos = diasDeAbertura(ctx, PADRAO)
  const fechados = apuraveisComDia(ctx, PADRAO)
  const baldes = mesesFechados(ctx.hojeDia, MESES_TENDENCIA)
  const meses = baldes.map((b) => {
    const fimDoMes = isoDeDia(b.fimDia)
    const janela = janelaMovelDia(b.fimDia, JANELA_POR_GRANULARIDADE.chamado)
    const inicio = diaDeIso(janela.inicio)
    const naJanela = fechados.filter((c) => c.dia >= inicio && c.dia <= b.fimDia)
    return {
      mes: b.chave,
      fimDoMes,
      janela,
      prioridades: aderenciaPorPrioridade(
        naJanela.map((c) => c.x),
        PADRAO,
      ),
      volume: abertos.filter((d) => d >= b.inicioDia && d <= b.fimDia).length,
    }
  })
  const total = meses.reduce((s, m) => s + m.volume, 0)
  const { inicioDia, primeiroFimDia, fimDia } = limitesDosMeses(baldes)
  const serie = { inicio: isoDeDia(inicioDia), fim: isoDeDia(fimDia) }
  const janela = {
    inicio: janelaMovelDia(primeiroFimDia, JANELA_POR_GRANULARIDADE.chamado).inicio,
    fim: serie.fim,
  }
  return {
    base: baseAmostral(total, 'chamados abertos', serie),
    criterios: criterios('TENDENCIA_SUST', serie, janela, ctx),
    meses,
  }
}
