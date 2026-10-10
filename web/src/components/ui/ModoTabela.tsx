import { createContext, useContext } from 'react'

export type ModoVisual = 'grafico' | 'tabela'

export interface ModoTabelaValor {
  modo: ModoVisual
  /** id da frase de leitura (aria-describedby dos gráficos). */
  idLeitura?: string
  /** Título e pergunta do cartão, para o figcaption. */
  legenda?: string
  /** Código do cartão, para o `data-testid` da tabela (`tabela-O4`). */
  codigo?: string
}

export const ModoTabelaContext = createContext<ModoTabelaValor>({ modo: 'grafico' })
export const useModoTabela = (): ModoTabelaValor => useContext(ModoTabelaContext)
