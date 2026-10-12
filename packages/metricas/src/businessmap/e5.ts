import type { ResultadoE5, FiltrosFluxo } from '@metricas-dspd/contratos'
import { diaDeIso } from '../core/calendario'
import { medianaDe, publicavel } from '../core/estatistica'
import { JANELA_POR_GRANULARIDADE, janelaMovelDia } from '../core/janela'
import { criarPrng, preverTermino } from '../core/montecarlo'
import { ordenarNeutro } from '../core/ordenar'
import { amostraBM } from './amostra'
import { SEMENTE_PREVISAO, vazaoSemanal } from './apoio'
import { baseAmostral, criterios, janelaPercentis, periodoDe, selecionar } from './comum'
import type { ContextoBM } from './indice'

/**
 * E5: previsão de término de projeto (Monte Carlo, T2.5) pela vazão semanal de FRENTES concluídas
 * na janela, para as frentes restantes. Mostra sempre as frentes adicionadas depois do início (T9).
 */
export function calcularE5(ctx: ContextoBM, f: FiltrosFluxo): ResultadoE5 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f, 'frente')
  const j = janelaMovelDia(diaDeIso(janela.fim), JANELA_POR_GRANULARIDADE.frente)
  const frentes = selecionar(ctx, f, 'frente', { semEquipe: true, semTipo: true })
  const projetos = selecionar(ctx, f, 'projeto', { semEquipe: true, semTipo: true }).filter(
    (p) => p.entrega === null && !p.arquivadoSemDesfecho,
  )
  const v = vazaoSemanal(ctx, frentes, j)
  const amostra = amostraBM('frente', v.contagens, j)
  const linhas = projetos
    .map((p) => {
      const fs = frentes.filter((m) => m.card.card_pai === p.card.card_id)
      const restantes = fs.filter((m) => m.entrega === null).length
      return {
        projetoId: p.card.card_id,
        projeto: p.card.titulo,
        frentesRestantes: restantes,
        frentesAdicionadasAposInicio: fs.filter((m) => m.card.adicionado_apos_inicio_pai).length,
        previsao:
          restantes > 0
            ? preverTermino(amostra, restantes, 'semana', { prng: criarPrng(SEMENTE_PREVISAO) })
            : null,
      }
    })
    .flatMap((l) => (l.previsao === null ? [] : [{ ...l, previsao: l.previsao }]))
  return {
    base: baseAmostral(v.total, 'frentes concluídas', j),
    criterios: criterios('E5', periodo, janela, ctx),
    janelaPercentis: janela,
    vazaoSemanal: {
      n: v.total,
      mediana: publicavel(v.total) ? medianaDe(amostra) : null,
    },
    projetos: ordenarNeutro(linhas, (l) => [l.projetoId]),
  }
}
