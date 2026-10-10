import type { MotivoBloqueio } from '@/contracts/comum'
import { horasUteisEntre } from '../core/calendario'
import type { ContextoBM, MarcosCard } from './indice'

export interface EstadoEm {
  existe: boolean
  coluna: string | null
  papel: string | null
  tipoColuna: 'fila' | 'execucao' | null
  /** Em progresso: iniciado, não entregue e não descartado naquele instante. */
  emWip: boolean
  ultimaTransicao: number | null
  bloqueioAberto: {
    motivo: MotivoBloqueio
    inicio: number
    coluna: string
    fornecedor: string | null
  } | null
}

/** Estado de um card em um instante (retratos do momento: O1, O2, bloqueados, O10, T7). */
export function estadoEm(ctx: ContextoBM, m: MarcosCard, t: number): EstadoEm {
  const trs = ctx.idx.transicoesPorCard.get(m.card.card_id) ?? []
  let coluna: string | null = null
  let ultima: number | null = null
  let iniciado = false
  let papel: string | null = null
  let tipoColuna: 'fila' | 'execucao' | null = null
  for (const x of trs) {
    if (x.timestamp > t) break
    const d = ctx.idx.papelDe(m.card.quadro_id, x.coluna_destino)
    coluna = x.coluna_destino
    ultima = x.timestamp
    papel = d?.papel ?? null
    tipoColuna = x.tipo_coluna
    if (d && d.tipo_coluna === 'execucao' && (d.papel === 'trabalho' || d.papel === 'homologacao'))
      iniciado = true
  }
  // Arquivado até t e fora de "entrega" (descartado ou sem desfecho, P1): não é trabalho aberto em t.
  // Entregue e arquivado depois continua entregue; só deixa o aberto por ter sido entregue.
  const descartado = m.card.arquivado_em !== null && m.card.arquivado_em <= t && papel !== 'entrega'
  const emWip = iniciado && papel !== 'entrega' && !descartado && m.card.criado_em <= t
  let bloqueio: EstadoEm['bloqueioAberto'] = null
  if (emWip || (!descartado && papel !== 'entrega')) {
    for (const b of ctx.idx.bloqueiosPorCard.get(m.card.card_id) ?? []) {
      if (b.inicio <= t && (b.fim === null || b.fim > t)) {
        bloqueio = {
          motivo: b.motivo,
          inicio: b.inicio,
          coluna: b.coluna_em_que_bloqueou,
          fornecedor: b.fornecedor,
        }
        break
      }
    }
  }
  return {
    existe: m.card.criado_em <= t,
    coluna,
    papel,
    tipoColuna,
    emWip,
    ultimaTransicao: ultima,
    bloqueioAberto: bloqueio,
  }
}

/** Idade em horas úteis no instante `t`: soma dos segmentos de ciclo (o intervalo entregue não conta, P10). */
export function idadeHUEm(ctx: ContextoBM, m: MarcosCard, t: number): number {
  let h = 0
  for (const s of m.segmentos) {
    if (s.ini >= t) continue
    const fim = Math.min(s.fim ?? t, t)
    h += horasUteisEntre(s.ini, fim, ctx.cal)
  }
  return h
}

/** Intervalo semiaberto [ini, fim) em ms. */
type Faixa = readonly [number, number]

/** Faixas em que o card está em progresso (mesma regra de `estadoEm.emWip`, sem varrer instantes). */
export function faixasWip(ctx: ContextoBM, m: MarcosCard): Faixa[] {
  const trs = ctx.idx.transicoesPorCard.get(m.card.card_id) ?? []
  const fimVida = m.card.arquivado_em ?? Infinity
  const faixas: Faixa[] = []
  let iniciado = false
  for (let i = 0; i < trs.length; i++) {
    const x = trs[i]
    if (!x) continue
    const d = ctx.idx.papelDe(m.card.quadro_id, x.coluna_destino)
    if (d && d.tipo_coluna === 'execucao' && (d.papel === 'trabalho' || d.papel === 'homologacao'))
      iniciado = true
    if (!iniciado || (d?.papel ?? null) === 'entrega') continue
    const a = Math.max(x.timestamp, m.card.criado_em)
    const b = Math.min(trs[i + 1]?.timestamp ?? Infinity, fimVida)
    if (a < b) faixas.push([a, b])
  }
  return faixas
}

/** União das faixas de bloqueio do card (um bloqueio aberto conta uma vez, mesmo que haja dois). */
function faixasBloqueio(ctx: ContextoBM, m: MarcosCard): Faixa[] {
  const bs = ctx.idx.bloqueiosPorCard.get(m.card.card_id)
  if (!bs || bs.length === 0) return []
  const ord = bs
    .map((b): [number, number] => [b.inicio, b.fim ?? Infinity])
    .sort((p, q) => p[0] - q[0])
  const uniao: [number, number][] = []
  for (const f of ord) {
    const u = uniao[uniao.length - 1]
    if (u && f[0] <= u[1]) u[1] = Math.max(u[1], f[1])
    else uniao.push([f[0], f[1]])
  }
  return uniao
}

/** Primeiro índice i com `instantes[i] >= v` (instantes em ordem crescente). */
function primeiroNaoMenor(instantes: readonly number[], v: number): number {
  let lo = 0
  let hi = instantes.length
  while (lo < hi) {
    const meio = (lo + hi) >>> 1
    if ((instantes[meio] ?? Infinity) < v) lo = meio + 1
    else hi = meio
  }
  return lo
}

/**
 * WIP e bloqueados em cada instante (crescentes) numa ÚNICA varredura dos cards: cada card vira
 * faixas e soma +1/-1 numa diferença acumulada. Custo O(cards x transições + instantes), em vez de
 * O(instantes x cards x transições) de chamar `estadoEm` por dia.
 */
export function serieWip(
  ctx: ContextoBM,
  cards: readonly MarcosCard[],
  instantes: readonly number[],
): { wip: number[]; bloqueados: number[] } {
  const n = instantes.length
  const dw = new Array<number>(n + 1).fill(0)
  const db = new Array<number>(n + 1).fill(0)
  const marcar = (d: number[], a: number, b: number) => {
    const lo = primeiroNaoMenor(instantes, a)
    const hi = primeiroNaoMenor(instantes, b)
    if (lo < hi) {
      d[lo] = (d[lo] ?? 0) + 1
      d[hi] = (d[hi] ?? 0) - 1
    }
  }
  for (const m of cards) {
    const fw = faixasWip(ctx, m)
    if (fw.length === 0) continue
    const fb = faixasBloqueio(ctx, m)
    for (const [a, b] of fw) {
      marcar(dw, a, b)
      for (const [x, y] of fb) {
        const lo = Math.max(a, x)
        const hi = Math.min(b, y)
        if (lo < hi) marcar(db, lo, hi)
      }
    }
  }
  const wip: number[] = []
  const bloqueados: number[] = []
  let w = 0
  let b = 0
  for (let i = 0; i < n; i++) {
    w += dw[i] ?? 0
    b += db[i] ?? 0
    wip.push(w)
    bloqueados.push(b)
  }
  return { wip, bloqueados }
}
