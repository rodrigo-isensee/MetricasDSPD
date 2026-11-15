import type { MetricaId } from '@metricas-dspd/contratos'
import type { ResultadoDe } from '@metricas-dspd/contratos'

/**
 * Estado "vazio" (nenhum item no recorte). Regra geral: `base.n === 0`. Exceção: O1 tem como base
 * os dias úteis do período (denominador da taxa), então "sem itens" é nenhum item em progresso em
 * dia algum. O15 também: só é vazio sem bug com fase e sem bug fora da conta (`bugsSemFase`); com bugs só
 * fora da conta o cartão mostra o corpo, com a nota `o15-fora` (K-365). A `base` nunca é distorcida para representar o vazio.
 */
export function ehVazio(id: MetricaId, dados: ResultadoDe<MetricaId>): boolean {
  if (!('base' in dados)) return false
  if (id === 'O1' && 'diasDentroDoLimite' in dados) return dados.serie.every((d) => d.wip === 0)
  if (id === 'O15' && 'bugsSemFase' in dados) return dados.base.n === 0 && dados.bugsSemFase === 0
  return dados.base.n === 0
}
