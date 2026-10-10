import { createContext, useContext } from 'react'

/**
 * Permite que uma tela de erro (dentro do shell) troque o `<title>` da página para
 * "Não foi possível abrir este painel" enquanto estiver montada. O shell fornece; fora dele é no-op.
 */
export const TituloErroContext = createContext<(ativo: boolean) => void>(() => undefined)
export const useDefinirTituloErro = (): ((ativo: boolean) => void) => useContext(TituloErroContext)
