import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

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
  const [params, setParams] = useSearchParams()
  const bruto = params.get(chave)
  const valor = (validos as readonly string[]).includes(bruto ?? '') ? (bruto as V) : padrao
  const definir = useCallback(
    (v: V) => {
      const p = new URLSearchParams(params)
      if (v === padrao) p.delete(chave)
      else p.set(chave, v)
      setParams(p, { replace: true, preventScrollReset: true })
    },
    [params, setParams, chave, padrao],
  )
  return [valor, definir]
}
