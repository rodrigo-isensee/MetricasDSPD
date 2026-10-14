import { useCallback } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { buscaVigente, registrarBusca } from './buscaPendente'
import { textoBusca } from './codec'

/**
 * Seletor local de um cartão na URL (`o3=melhoria`, `s3=prop`, `cadencia=semanal`).
 * Valor ausente ou fora de `validos` cai no `padrao`. O padrão nunca entra na URL.
 * Usa `replace` (trocar de aba não polui o histórico; só filtros usam push).
 */
export function useParametroLocal<V extends string>(
  chave: string,
  validos: readonly V[],
  padrao: V,
): [V, (v: V) => void] {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const bruto = params.get(chave)
  const valor = (validos as readonly string[]).includes(bruto ?? '') ? (bruto as V) : padrao
  const definir = useCallback(
    (v: V) => {
      // Parte da URL vigente (inclui a navegação ainda não renderizada), não da do último render.
      const p = new URLSearchParams(buscaVigente(location.pathname, location.search))
      if (v === padrao) p.delete(chave)
      else p.set(chave, v)
      const search = textoBusca(p)
      registrarBusca(location.pathname, search ? `?${search}` : '')
      void navigate(
        { pathname: location.pathname, search, hash: location.hash },
        { replace: true, preventScrollReset: true },
      )
    },
    [navigate, location.pathname, location.search, location.hash, chave, padrao],
  )
  return [valor, definir]
}
