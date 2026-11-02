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
