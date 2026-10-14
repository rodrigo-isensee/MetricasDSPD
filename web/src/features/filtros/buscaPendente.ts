/**
 * Última URL (pathname + busca) que o app mandou navegar e que o React Router ainda não renderizou.
 * No React Router 7 a navegação é uma transição: num painel pesado o render da URL nova atrasa, e
 * uma segunda ação do usuário (outro filtro, a cadência) que partisse da URL do último render
 * desfaria a primeira (IF-001, IS-003). Todas as escritas de URL partem daqui; o valor é descartado
 * quando a URL renderizada o alcança, quando muda a rota, ou depois de `VALIDADE_MS` (rede de
 * segurança para navegações interrompidas ou normalizadas para outra URL).
 */
export const VALIDADE_MS = 3000

interface Pendente {
  pathname: string
  search: string
  em: number
}

let pendente: Pendente | null = null

export function registrarBusca(pathname: string, search: string): void {
  pendente = { pathname, search, em: Date.now() }
}

/** Busca vigente: a pendente (se ainda válida para esta rota) ou a da URL renderizada. */
export function buscaVigente(pathname: string, search: string): string {
  if (!pendente) return search
  const expirou = Date.now() - pendente.em > VALIDADE_MS
  if (expirou || pendente.pathname !== pathname || pendente.search === search) {
    pendente = null
    return search
  }
  return pendente.search
}

/** Só para testes. */
export function limparBuscaPendente(): void {
  pendente = null
}
