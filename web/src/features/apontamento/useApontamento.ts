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

/**
 * O filtro por tipo só aparece quando a rota o aceita. Enquanto responder 422 `FILTRO_INDISPONIVEL` (ou a sonda
 * falhar, ou a fonte não souber dizer), fica `false`: o filtro some e `tipo` na URL não vai para a consulta.
 */
export function useFiltroTipoDisponivel(fonte: FonteApontamento): boolean {
  const q = useQuery({
    queryKey: ['apontamento-filtro-tipo'],
    queryFn: ({ signal }) =>
      fonte.filtroTipoDisponivel ? fonte.filtroTipoDisponivel(signal) : false,
    staleTime: Infinity,
    retry: false,
  })
  return q.data === true
}
