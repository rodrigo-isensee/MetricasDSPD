import type { MetricaId } from '@metricas-dspd/contratos'
import type { ResultadoDe } from '@metricas-dspd/contratos'

/**
 * Estado "vazio" (nenhum item no recorte). Regra geral: `base.n === 0`. Exceção: O1 tem como base
 * os dias úteis do período (denominador da taxa), então "sem itens" é nenhum item em progresso em
 * dia algum. A `base` nunca é distorcida para representar o vazio.
 */
export function ehVazio(id: MetricaId, dados: ResultadoDe<MetricaId>): boolean {
  if (!('base' in dados)) return false
  if (id === 'O1' && 'diasDentroDoLimite' in dados) return dados.serie.every((d) => d.wip === 0)
  return dados.base.n === 0
}
