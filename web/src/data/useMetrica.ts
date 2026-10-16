import { useMemo } from 'react'
import { keepPreviousData, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import type { Dominio, MetricaId } from '@metricas-dspd/contratos'
import type { FiltrosDe, ResultadoDe } from '@metricas-dspd/contratos'
import { useFonte } from './FonteMetricasProvider'
import {
  aplicarSimulacao,
  aplicarSimulacaoEstado,
  aplicarSimulacaoHistorico,
  ehErroDePainel,
  lerModoMock,
  type ModoMock,
} from './simulacao'
import { ehVazio } from './vazio'

/** Ids que já falharam em `erro-uma-vez`, por cliente de cache: vários cartões da mesma métrica (cartão e faixa) compartilham. */
const falhasSimuladas = new WeakMap<QueryClient, Set<string>>()
function jaFalhouDo(c: QueryClient): Set<string> {
  let s = falhasSimuladas.get(c)
  if (!s) falhasSimuladas.set(c, (s = new Set()))
  return s
}

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
 * Respeita o parâmetro oculto `?mock=` (spec 6.6; ver `simulacao.ts`). `habilitada: false` adia a consulta
 * (o estado fica "carregando" até ela começar).
 */
export function useMetrica<K extends MetricaId>(
  id: K,
  filtros: FiltrosDe<K>,
  { habilitada = true }: { habilitada?: boolean } = {},
): MetricaQuery<ResultadoDe<K>> {
  const fonte = useFonte()
  const [params] = useSearchParams()
  // `?mock=` só vale com a fonte mock: contra a API real, o parâmetro é ignorado (6.6).
  const modo = fonte.tipo === 'mock' ? lerModoMock(params.get('mock')) : null
  const jaFalhou = jaFalhouDo(useQueryClient())
  const q = useQuery({
    queryKey: ['metrica', id, filtros, modo],
    queryFn: ({ signal }) =>
      aplicarSimulacao(modo, id, filtros, (f) => fonte.obter(id, f, { signal }), jaFalhou),
    placeholderData: keepPreviousData,
    // Desabilitada (ex.: a tendência espera os números do bloco): sem dados, o estado é "carregando".
    enabled: habilitada,
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

/** Modo `?mock=` efetivo: só vale com a fonte mock. */
function useModoEfetivo(): ModoMock | null {
  const fonte = useFonte()
  const [params] = useSearchParams()
  return fonte.tipo === 'mock' ? lerModoMock(params.get('mock')) : null
}

/** Estado de coleta de UMA fonte (selo, calibração, falhas). Chave compartilhada por selo, faixa, cartões e `/dados`. */
export function useEstadoColeta(dominio: Dominio) {
  const fonte = useFonte()
  const modo = useModoEfetivo()
  return useQuery({
    queryKey: ['coleta', dominio, modo],
    queryFn: () => aplicarSimulacaoEstado(modo, dominio, () => fonte.estadoColeta(dominio)),
    // IR-002: remontar um observador sobre uma consulta em erro a refaria e a devolveria a "pending", num laço
    // com o bloco de espera do painel. A nova tentativa é só pelo "Tentar de novo".
    retryOnMount: false,
  })
}

/** Histórico paginado de coletas de UMA fonte (20 por página). Mantém a página anterior ao trocar. */
export function useHistoricoColetas(dominio: Dominio, pagina: number) {
  const fonte = useFonte()
  const modo = useModoEfetivo()
  return useQuery({
    queryKey: ['coletas', dominio, pagina, modo],
    queryFn: () =>
      aplicarSimulacaoHistorico(modo, dominio, () => fonte.historicoColetas(dominio, pagina)),
    placeholderData: keepPreviousData,
  })
}

/** Ids das métricas em calibração na fonte; vazio enquanto carrega ou se a leitura falhar (o painel nunca esconde dados por isso). */
export function useMetricasEmCalibracao(dominio: Dominio): ReadonlySet<MetricaId> {
  const { data } = useEstadoColeta(dominio)
  return useMemo(() => new Set<MetricaId>(data?.metricasEmCalibracao ?? []), [data])
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
