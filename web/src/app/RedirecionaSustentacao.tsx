import { Navigate, useLocation } from 'react-router'
import { textoBusca } from '@/features/filtros/codec'

const PREFIXO_SUST = 'sust_'

/** Filtros da página antiga, que passam a viver com o prefixo `sust_` na URL do Operacional. */
const FILTROS_RENOMEADOS: readonly string[] = ['equipe', 'prioridade', 'periodo', 'de', 'ate']
/** Parâmetros de cartão da Sustentação e o simulador de estados: seguem como estão. */
const INTACTOS: readonly string[] = ['s3', 's4', 's5', 's6', 'ei_sust', 'mock']

/** Ids de seção complementar que ganharam o prefixo `sust-` (os ids de cartão não mudam). */
const HASH_RENOMEADO: Readonly<Record<string, string>> = {
  '#compl-por-que-demora': '#compl-sust-por-que-demora',
  '#compl-o-que-entra': '#compl-sust-o-que-entra',
  '#compl-qualidade': '#compl-sust-qualidade',
}

/**
 * Destino da antiga `/sustentacao` (tabela 4.3 do plano): sempre o caminho interno fixo `/operacional`, com
 * `cadencia=sustentacao`. Os parâmetros são reconstruídos com `URLSearchParams` (nenhum valor da URL vira
 * caminho: sem redirecionamento aberto). Parâmetros do fluxo (`tipo`, `sistema`, `cadencia`...) são descartados.
 */
export function destinoDaSustentacao(busca: string, hash: string): string {
  const origem = new URLSearchParams(busca)
  const destino = new URLSearchParams({ cadencia: 'sustentacao' })
  origem.forEach((valor, chave) => {
    if (FILTROS_RENOMEADOS.includes(chave)) destino.set(`${PREFIXO_SUST}${chave}`, valor)
    else if (INTACTOS.includes(chave)) destino.set(chave, valor)
  })
  // Já com prefixo (link gerado entre as duas demandas): vale sobre o equivalente sem prefixo.
  origem.forEach((valor, chave) => {
    if (chave.startsWith(PREFIXO_SUST)) destino.set(chave, valor)
  })
  const novoHash = HASH_RENOMEADO[hash.toLowerCase()] ?? hash
  return `/operacional?${textoBusca(destino)}${novoHash}`
}

/** Rota antiga `/sustentacao`: sem tela e sem chunk de página; leva ao Operacional por `replace` (o Voltar não faz laço). */
export function RedirecionaSustentacao() {
  const { hash, search } = useLocation()
  return <Navigate to={destinoDaSustentacao(search, hash)} replace />
}
