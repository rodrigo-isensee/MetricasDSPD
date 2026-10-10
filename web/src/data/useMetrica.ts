import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import { useSearchParams } from 'react-router'
import type { Dominio, MetricaId } from '@metricas-dspd/contratos'
import type { FiltrosDe, ResultadoDe } from '@metricas-dspd/contratos'
import { useFonte } from './FonteMetricasProvider'
import { aplicarSimulacao, ehErroDePainel, lerModoMock, type ModoMock } from './simulacao'
import { ehVazio } from './vazio'

export type EstadoMetrica = 'carregando' | 'erro' | 'vazio' | 'ok'

export interface MetricaQuery<R> {
  /** Estado da tela para o cartão: carregando, erro, vazio (0 itens) ou ok. "Amostra insuficiente" é por estatística, dentro de `dados`. */
  estado: EstadoMetrica
  dados: R | undefined
  erro: Error | null
  /** true enquanto busca novos dados com o conteúdo anterior ainda na tela (esmaecer, spec 6.1). */
  atualizando: boolean
  /** Recarrega apenas esta métrica, mantendo os filtros ("Tentar de novo"). */
  recarregar: () => void
}

/**
 * Consome uma métrica pela fonte de dados. O resultado já vem calculado: nenhum componente calcula.
 * Respeita o parâmetro oculto `?mock=` (spec 6.6; ver `simulacao.ts`).
 */
export function useMetrica<K extends MetricaId>(
  id: K,
  filtros: FiltrosDe<K>,
): MetricaQuery<ResultadoDe<K>> {
  const fonte = useFonte()
  const [params] = useSearchParams()
  // `?mock=` só vale com a fonte mock: contra a API real, o parâmetro é ignorado (6.6).
  const modo = fonte.tipo === 'mock' ? lerModoMock(params.get('mock')) : null
  const jaFalhou = useRef(new Set<string>())
  const q = useQuery({
    queryKey: ['metrica', id, filtros, modo],
    queryFn: () => aplicarSimulacao(modo, id, filtros, (f) => fonte.obter(id, f), jaFalhou.current),
    placeholderData: keepPreviousData,
  })
  let estado: EstadoMetrica = 'ok'
  if (q.isError) estado = 'erro'
  else if (q.data === undefined) estado = 'carregando'
  else if (ehVazio(id, q.data)) estado = 'vazio'
  return {
    estado,
    dados: q.data,
    erro: q.error,
    atualizando: q.isPlaceholderData || (q.isFetching && q.data !== undefined),
    recarregar: () => void q.refetch(),
  }
}

export function useOpcoesFiltro<D extends Dominio>(dominio: D) {
  const fonte = useFonte()
  return useQuery({
    queryKey: ['opcoes-filtro', dominio],
    queryFn: () => fonte.opcoesFiltro(dominio),
    staleTime: Infinity,
  })
}

export function useDataReferencia(): string | undefined {
  const fonte = useFonte()
  return useQuery({
    queryKey: ['data-referencia'],
    queryFn: () => fonte.dataReferencia(),
    staleTime: Infinity,
  }).data
}

export function useCriterios() {
  const fonte = useFonte()
  return useQuery({
    queryKey: ['criterios'],
    queryFn: () => fonte.criterios(),
    staleTime: Infinity,
  })
}

/** O modo simulado da página atual (spec 6.6), ou null. */
export function useModoMock(): ModoMock | null {
  const [params] = useSearchParams()
  return lerModoMock(params.get('mock'))
}

/** `mock=erro`: a página inteira falha ("Não foi possível abrir este painel"). */
export function useErroDePainelSimulado(): boolean {
  return ehErroDePainel(useModoMock())
}
