import { createContext, useContext } from 'react'
import type { CartaoCatalogo, CartaoId, PainelComCartoes } from '@metricas-dspd/contratos'

export interface PreferenciasPainel {
  painel: PainelComCartoes
  cartoes: readonly CartaoCatalogo[]
  ocultos: ReadonlySet<CartaoId>
  /** Quantos cartões do NÚCLEO estão visíveis (N) e o total do núcleo (M); os complementares contam à parte. */
  visiveis: number
  total: number
  complementaresVisiveis: number
  complementaresTotal: number
  /** Seção "Mais métricas deste painel": aberta nesta visita (disclosure por visita, nunca preferência). */
  secaoAberta: boolean
  definirSecaoAberta: (aberta: boolean) => void
  /** Cartão complementar que o "Leia junto" ou o catálogo pediu: a seção abre, rola até ele e o foco vai ao título. */
  alvoComplementar: string | null
  irParaComplementar: (id: CartaoId) => void
  alvoAtendido: () => void
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
