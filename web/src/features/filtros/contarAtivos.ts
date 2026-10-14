import { lerFluxo, lerSustentacao } from './codec'
import { PAINEIS, type DominioFiltros } from './paineis'

/**
 * Quantos filtros (chaves, não valores: Equipe com 3 valores conta 1) de um conjunto estão fora do padrão na URL.
 * Leitura pelo `codec`, sem normalizar nem gravar: serve para falar do conjunto da OUTRA fonte (o que ficou
 * guardado) sem tocar nele. `prefixo` é `''` no fluxo e `sust_` na Sustentação.
 */
export function contarAtivos(
  params: URLSearchParams,
  dominio: DominioFiltros,
  prefixo = '',
): number {
  const ativos = new Set<string>()
  if (dominio === 'fluxo') {
    const { periodoPadrao } = PAINEIS.operacional
    const f = lerFluxo(params, undefined, periodoPadrao, prefixo).filtros
    if (f.equipe.length > 0) ativos.add('equipe')
    if (f.tipo.length > 0) ativos.add('tipo')
    if (f.sistema.length > 0) ativos.add('sistema')
    if (f.periodo.tipo !== periodoPadrao) ativos.add('periodo')
  } else {
    const { periodoPadrao } = PAINEIS.sustentacao
    const f = lerSustentacao(params, undefined, periodoPadrao, prefixo).filtros
    if (f.equipe.length > 0) ativos.add('equipe')
    if (f.prioridade.length > 0) ativos.add('prioridade')
    if (f.periodo.tipo !== periodoPadrao) ativos.add('periodo')
  }
  return ativos.size
}
