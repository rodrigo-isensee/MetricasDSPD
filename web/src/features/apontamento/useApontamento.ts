import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { ConsultaApontamento, FonteApontamento } from './types'

/**
 * Consulta única da aba (`GET /api/apontamento`, resposta agregada). A chave é a consulta inteira: mudar um filtro
 * busca de novo e mantém a resposta anterior na tela, esmaecida, até a nova chegar. Nada é guardado fora da memória
 * do cache (AP-8: pessoa nunca em `localStorage`).
 */
export function useApontamento(fonte: FonteApontamento, consulta: ConsultaApontamento) {
  const q = useQuery({
    queryKey: ['apontamento', consulta],
    queryFn: ({ signal }) => fonte.buscar(consulta, signal),
    placeholderData: keepPreviousData,
  })
  return {
    resposta: q.data,
    carregando: q.isPending,
    erro: q.error,
    atualizando: q.isFetching && q.isPlaceholderData,
    tentarDeNovo: () => void q.refetch(),
  }
}

/** Validade da sonda do tipo: a rota pode ligar o filtro durante a sessão, então a resposta não vale para sempre. */
export const VALIDADE_SONDA_TIPO_MS = 5 * 60_000

/**
 * O filtro por tipo só aparece quando a rota o aceita. Enquanto responder 422 `FILTRO_INDISPONIVEL` fica `false`: o
 * filtro some e `tipo` na URL não vai para a consulta. Falha de rede ou 5xx não vira "indisponível": a sonda tenta de
 * novo e, se continuar falhando, é refeita ao voltar à aba depois da validade.
 */
export function useFiltroTipoDisponivel(fonte: FonteApontamento): boolean {
  const q = useQuery({
    queryKey: ['apontamento-filtro-tipo'],
    queryFn: ({ signal }) =>
      fonte.filtroTipoDisponivel ? fonte.filtroTipoDisponivel(signal) : false,
    staleTime: VALIDADE_SONDA_TIPO_MS,
    retry: 2,
    refetchOnWindowFocus: true,
  })
  return q.data === true
}
