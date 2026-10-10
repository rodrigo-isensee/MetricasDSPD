import { horasUteisEntre } from '../core/calendario'
import type { ContextoBM, MarcosCard } from './indice'
import { du } from './comum'

export interface Blocos {
  fila: number
  espera: number
  execucao: number
  homologacao: number
  total: number
}

/**
 * Decomposição do lead time (T1), em dias úteis. Definição provisória (pergunta 6):
 * fila = entrada → compromisso; espera = tempo em colunas de fila e bloqueado após o compromisso;
 * execução = colunas de execução; homologação = coluna de homologação antes da entrega.
 * O intervalo em que o card esteve entregue (reabertura) fica de fora. O aceite fica fora (4.1).
 */
export function blocosDe(ctx: ContextoBM, m: MarcosCard): Blocos | null {
  if (m.entrega === null || m.compromisso === null) return null
  const trs = ctx.idx.transicoesPorCard.get(m.card.card_id) ?? []
  const bloqueios = ctx.idx.bloqueiosPorCard.get(m.card.card_id) ?? []
  const fila = horasUteisEntre(m.entrada, m.compromisso, ctx.cal)
  let espera = 0
  let execucao = 0
  let homologacao = 0
  for (let i = 0; i < trs.length; i++) {
    const t = trs[i]
    if (!t || t.timestamp < m.compromisso) continue
    const prox = trs[i + 1]
    const fim = prox ? prox.timestamp : m.entrega
    if (fim <= t.timestamp) continue
    const def = ctx.idx.papelDe(m.card.quadro_id, t.coluna_destino)
    if (!def || def.papel === 'entrega' || def.papel === 'backlog') continue
    const h = horasUteisEntre(t.timestamp, Math.min(fim, m.entrega), ctx.cal)
    if (def.tipo_coluna === 'fila' || def.papel === 'compromisso') {
      espera += h
      continue
    }
    let bloqueado = 0
    for (const b of bloqueios) {
      const a = Math.max(t.timestamp, b.inicio)
      const z = Math.min(fim, b.fim ?? fim, m.entrega)
      if (z > a) bloqueado += horasUteisEntre(a, z, ctx.cal)
    }
    espera += bloqueado
    if (def.papel === 'homologacao') homologacao += h - bloqueado
    else execucao += h - bloqueado
  }
  const total = fila + espera + execucao + homologacao
  return {
    fila: du(ctx, fila),
    espera: du(ctx, espera),
    execucao: du(ctx, execucao),
    homologacao: du(ctx, homologacao),
    total: du(ctx, total),
  }
}
