import { useSearchParams } from 'react-router'
import { hrefDaVisao, visaoDoHash, type Visao } from '../visao'

/**
 * Destino de um cartão ou âncora a partir do Resumo: a visão dona do hash (tabela 4.2), com os dois conjuntos de
 * filtros e os parâmetros de cartão preservados (viram o padrão ao trocar de visão) e sem o `mock`.
 */
export function useDestinoNaVisao(): (hash: string) => string {
  const [params] = useSearchParams()
  return (hash) => {
    const h = hrefDaVisao(visaoDoHash(hash) as Visao, params, { hash })
    return `${h.pathname}${h.search}${h.hash}`
  }
}

/** Destino de uma visão inteira a partir do Resumo ("Ver na Semanal"), com os filtros guardados e sem o `mock`. */
export function useDestinoDaVisao(): (visao: Visao) => string {
  const [params] = useSearchParams()
  return (visao) => {
    const h = hrefDaVisao(visao, params)
    return `${h.pathname}${h.search}`
  }
}
