import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams, type Location } from 'react-router'
import { buscaVigente, registrarBusca } from '@/features/filtros/buscaPendente'
import { textoBusca } from '@/features/filtros/codec'
import { comVisao, resolverVisao, type Visao } from '@/features/navegacao/visao'

interface EstadoNav {
  filtrosInvalidos?: string[]
}

export interface UsoVisao {
  visao: Visao
  /** Troca a visão: entrada no histórico (o Voltar desfaz), sem hash e sem mexer nos demais parâmetros. */
  escolher: (v: Visao) => void
}

/**
 * Visão ativa do Operacional (parâmetro `cadencia`; o hash vence). A URL é corrigida com `replace`
 * (Resumo sem `cadencia`, valor desconhecido, hash de outra visão); escolher no seletor usa `push`.
 */
export function useVisaoOperacional(): UsoVisao {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { pathname, search, hash, state } = useLocation() as Location<EstadoNav | null>
  const resolvida = resolverVisao(params, hash)
  const { corrigir, invalido } = resolvida
  const canonica = textoBusca(resolvida.busca)
  useEffect(() => {
    if (!corrigir) return
    const prox: EstadoNav | null = invalido ? { filtrosInvalidos: [`visão "${invalido}"`] } : state
    void navigate(
      { pathname, search: canonica ? `?${canonica}` : '', hash },
      { replace: true, state: prox, preventScrollReset: true },
    )
  }, [corrigir, invalido, canonica, navigate, pathname, hash, state])
  const escolher = useCallback(
    (v: Visao) => {
      const p = comVisao(new URLSearchParams(buscaVigente(pathname, search)), v)
      const prox = textoBusca(p)
      registrarBusca(pathname, prox ? `?${prox}` : '')
      void navigate({ pathname, search: prox ? `?${prox}` : '' }, { preventScrollReset: true })
    },
    [navigate, pathname, search],
  )
  return { visao: resolvida.visao, escolher }
}
