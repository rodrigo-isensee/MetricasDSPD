import { createContext, useContext } from 'react'
import type { CartaoCatalogo, CartaoId, PainelComCartoes } from '@metricas-dspd/contratos'

export interface PreferenciasPainel {
  painel: PainelComCartoes
  cartoes: readonly CartaoCatalogo[]
  ocultos: ReadonlySet<CartaoId>
  /** Quantos cartões estão visíveis (N) e o total do painel (M). */
  visiveis: number
  total: number
  /** O painel inteiro está oculto (CA-12). */
  tudoOculto: boolean
  estaOculto: (id: CartaoId) => boolean
  /** "Ocultar esta métrica": anuncia, oferece Desfazer e leva o foco ao próximo título. */
  ocultarCartao: (id: CartaoId) => void
  /** Mostra uma métrica nesta visita, sem anúncio (caixas do popover, "Mostrar O2 nesta visita"). */
  mostrar: (id: CartaoId) => void
  /** Mostra várias de uma vez ('Mostrar métricas da seção'). */
  mostrarVarios: (ids: readonly CartaoId[]) => void
  alternar: (id: CartaoId, visivel: boolean) => void
  mostrarTodas: () => void
  usarMinhas: () => void
}

export const ContextoPreferenciasPainel = createContext<PreferenciasPainel | null>(null)

/** `null` fora de um painel com cartões (Visão geral, Espera invisível, testes isolados): nada é recortado. */
export function usePreferenciasPainel(): PreferenciasPainel | null {
  return useContext(ContextoPreferenciasPainel)
}

/** Fora de um painel com preferências todo cartão é visível. */
export function useCartaoVisivel(id: CartaoId): boolean {
  const p = useContext(ContextoPreferenciasPainel)
  return !p || !p.estaOculto(id)
}
