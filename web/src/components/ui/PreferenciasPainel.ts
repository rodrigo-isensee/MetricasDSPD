import { createContext, useContext, type ReactNode } from 'react'
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
  /** Marcadores de métrica oculta no lugar do cartão (U2); a pessoa pode desligar em Preferências. */
  marcadores: boolean
  /** A métrica está oculta no padrão guardado (e não só nesta visita). */
  ocultaNoPadrao: (id: CartaoId) => boolean
  /** Cartão oculto a que a pessoa chegou por link: o marcador explica e o foco vai ao "Mostrar". */
  chegada: CartaoId | null
  /** Marcador a desenhar no lugar do cartão oculto (`null` com os marcadores desligados). */
  marcador: (id: CartaoId, className?: string) => ReactNode
  /** Ids com marcador na tela: o aviso de mudança de critério deles vai dentro do marcador, não no topo. */
  comMarcador: ReadonlySet<CartaoId>
  registrarMarcador: (ids: readonly CartaoId[]) => () => void
  /** O painel inteiro está oculto (CA-12). */
  tudoOculto: boolean
  estaOculto: (id: CartaoId) => boolean
  /** "Ocultar esta métrica": lembrada até a pessoa mandar mostrar (U1); anuncia e leva o foco. */
  ocultarCartao: (id: CartaoId) => void
  /** Mostra uma métrica e lembra: continua visível até a pessoa mandar ocultar (U1). */
  mostrar: (id: CartaoId) => void
  /** Mostra várias de uma vez ('Mostrar métricas da seção'). */
  mostrarVarios: (ids: readonly CartaoId[]) => void
  alternar: (id: CartaoId, visivel: boolean) => void
  /** Mostra todas e lembra (U1). */
  mostrarTodas: () => void
  /** Mostra todas só nesta visita, sem mexer no perfil (botão do popover "Métricas"). */
  mostrarTodasNestaVisita: () => void
  usarMinhas: () => void
}

export const ContextoPreferenciasPainel = createContext<PreferenciasPainel | null>(null)

/** `null` fora de um painel com cartões (Visão geral, testes isolados): nada é recortado. */
export function usePreferenciasPainel(): PreferenciasPainel | null {
  return useContext(ContextoPreferenciasPainel)
}

/** Fora de um painel com preferências todo cartão é visível. */
export function useCartaoVisivel(id: CartaoId): boolean {
  const p = useContext(ContextoPreferenciasPainel)
  return !p || !p.estaOculto(id)
}
