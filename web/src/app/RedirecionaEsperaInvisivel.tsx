import { Navigate, useLocation } from 'react-router'

const PREFIXO_SUST = 'sust_'

/**
 * Destino de cada âncora da antiga página `/espera-invisivel`. Fluxo (BusinessMap) e Sustentação
 * (Acelerato) nunca trocam parâmetros: cada destino leva só os do próprio domínio.
 */
export function destinoDaEsperaInvisivel(hash: string, busca: string): string {
  const origem = new URLSearchParams(busca)
  const fluxo = new URLSearchParams()
  const sust = new URLSearchParams()
  origem.forEach((valor, chave) => {
    if (chave.startsWith(PREFIXO_SUST)) sust.append(chave.slice(PREFIXO_SUST.length), valor)
    else if (chave === 'ei_sust') sust.append(chave, valor)
    else fluxo.append(chave, valor)
  })
  const com = (p: URLSearchParams) => (p.size > 0 ? `?${p.toString().replaceAll('%2C', ',')}` : '')
  switch (hash) {
    case '#ei-fl1': {
      fluxo.set('cadencia', 'semanal')
      return `/operacional${com(fluxo)}#ei-fl1`
    }
    case '#ei-fl2':
      return `/tatico${com(fluxo)}#ei-fl2`
    case '#ei-fl3':
      return `/estrategico${com(fluxo)}#ei-fl3`
    case '#ei-sust':
      return `/sustentacao${com(sust)}#ei-sust`
    default:
      return '/'
  }
}

/** Rota antiga `/espera-invisivel`: sem tela, só leva ao painel certo (por `replace`, para o Voltar não fazer laço). */
export function RedirecionaEsperaInvisivel() {
  const { hash, search } = useLocation()
  return <Navigate to={destinoDaEsperaInvisivel(hash, search)} replace />
}
