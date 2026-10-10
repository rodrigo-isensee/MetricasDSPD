import { horasUteisEntre } from '../core/calendario'
import type { ContextoBM, MarcosCard } from './indice'
import { du } from './comum'

export interface Relogios {
  /** entrada -> entrega */
  cliente: number
  /** compromisso -> entrega */
  equipe: number
  /** início -> entrega (P10 para reabertos) */
  ciclo: number
}

/** Os três relógios do pedido em dias úteis (O9, EI). null se faltar algum marco ou não houver entrega. */
export function relogiosDe(ctx: ContextoBM, m: MarcosCard): Relogios | null {
  if (m.entrega === null || m.compromisso === null || m.cicloHU === null) return null
  return {
    cliente: du(ctx, horasUteisEntre(m.entrada, m.entrega, ctx.cal)),
    equipe: du(ctx, horasUteisEntre(m.compromisso, m.entrega, ctx.cal)),
    ciclo: du(ctx, m.cicloHU),
  }
}
