import type { Granularidade, TipoCard } from '@metricas-dspd/contratos'
import {
  diaLocal,
  horasUteisEntre,
  instanteDeIso,
  isoDeDia,
  type Calendario,
} from '../core/calendario'
import type { VersaoCriterio } from '../core/criterios'
import { slug } from '../slug'
import { arquivadoSemDesfecho, descartado } from './descartado'
import type { BaseBM, DimCard, DimColuna, FatoBloqueio, FatoTransicao } from './modelo'
import { ordenarNeutro } from '../core/ordenar'

export interface Segmento {
  ini: number
  /** null = em andamento. */
  fim: number | null
}

/** Marcos e derivados de um card (briefing 4.1), calculados uma vez a partir das transições. */
export interface MarcosCard {
  card: DimCard
  slugEquipe: string
  slugSistema: string
  /**
   * Dentro dos cálculos: não excluído, não subtarefa e não descartado (descarte = `motivo_descarte`
   * preenchido, 4.2/4.5). Arquivado NÃO tira o card (7.3): entregue e arquivado é o fim normal.
   */
  ativo: boolean
  /** Descartado: tem `motivo_descarte` (decisão Q6). */
  descartado: boolean
  /**
   * Arquivado sem ter sido entregue e sem `motivo_descarte` (decisão P1): não conta como trabalho
   * aberto, mas continua na base e é contado à parte (higiene, T6.4). Nunca é tratado como descartado.
   */
  arquivadoSemDesfecho: boolean
  entrada: number
  compromisso: number | null
  inicio: number | null
  /** Entrega vigente: null se o card não está entregue agora (inclui reabertos). */
  entrega: number | null
  segmentos: Segmento[]
  /** Tempo de ciclo em horas úteis (P10: o intervalo entregue não conta). Só se entregue. */
  cicloHU: number | null
  ultimaTransicao: number | null
  colunaAtual: string | null
  papelAtual: DimColuna['papel'] | null
  tipoColunaAtual: 'fila' | 'execucao' | null
  bloqueioAberto: FatoBloqueio | null
  projetoId: string | null
  frenteId: string | null
}

export interface IndiceBM {
  base: BaseBM
  cal: Calendario
  porId: Map<string, DimCard>
  marcos: MarcosCard[]
  marcosPorId: Map<string, MarcosCard>
  transicoesPorCard: Map<string, FatoTransicao[]>
  bloqueiosPorCard: Map<string, FatoBloqueio[]>
  filhos: Map<string, string[]>
  papelDe: (quadro: string, coluna: string) => DimColuna | undefined
}

export interface ContextoBM {
  idx: IndiceBM
  hoje: number
  hojeDia: number
  hojeIso: string
  cal: Calendario
  criterios: readonly VersaoCriterio[]
}

const cache = new WeakMap<BaseBM, Map<string, IndiceBM>>()

function construir(base: BaseBM, cal: Calendario): IndiceBM {
  const porId = new Map(base.cards.map((c) => [c.card_id, c]))
  const transicoesPorCard = new Map<string, FatoTransicao[]>()
  for (const t of base.transicoes) {
    const l = transicoesPorCard.get(t.card_id)
    if (l) l.push(t)
    else transicoesPorCard.set(t.card_id, [t])
  }
  for (const [id, l] of transicoesPorCard)
    transicoesPorCard.set(
      id,
      ordenarNeutro(l, (t) => [t.timestamp, t.coluna_destino, t.coluna_origem ?? '']),
    )
  const bloqueiosPorCard = new Map<string, FatoBloqueio[]>()
  for (const b of base.bloqueios) {
    const l = bloqueiosPorCard.get(b.card_id)
    if (l) l.push(b)
    else bloqueiosPorCard.set(b.card_id, [b])
  }
  const filhos = new Map<string, string[]>()
  for (const c of base.cards) {
    if (c.card_pai) {
      const l = filhos.get(c.card_pai)
      if (l) l.push(c.card_id)
      else filhos.set(c.card_pai, [c.card_id])
    }
  }
  const colMap = new Map(base.colunas.map((c) => [`${c.quadro_id}|${c.coluna}`, c]))
  const papelDe = (q: string, c: string) => colMap.get(`${q}|${c}`)

  const raiz = (c: DimCard, g: Granularidade): string | null => {
    let atual: DimCard | undefined = c
    for (let i = 0; i < 4 && atual; i++) {
      if (atual.granularidade === g) return atual.card_id
      atual = atual.card_pai ? porId.get(atual.card_pai) : undefined
    }
    return null
  }

  const marcos = base.cards.map((card): MarcosCard => {
    const trs = transicoesPorCard.get(card.card_id) ?? []
    const segmentos: Segmento[] = []
    let aberto: Segmento | null = null
    let entregue = false
    let ultima: DimColuna | undefined
    for (const t of trs) {
      const def = papelDe(card.quadro_id, t.coluna_destino)
      ultima = def
      if (!def) continue
      if (def.papel === 'entrega') {
        if (aberto) {
          aberto.fim = t.timestamp
          segmentos.push(aberto)
          aberto = null
        }
        entregue = true
      } else if (
        def.tipo_coluna === 'execucao' &&
        (def.papel === 'trabalho' || def.papel === 'homologacao')
      ) {
        if (!aberto && (segmentos.length === 0 || entregue))
          aberto = { ini: t.timestamp, fim: null }
        entregue = false
      } else if (!aberto && entregue) {
        entregue = false
      }
    }
    if (aberto) segmentos.push(aberto)
    const foiDescartado = descartado(card)
    const ativo = card.excluido_em === null && !card.eh_subtarefa && !foiDescartado
    const entrega = entregue ? (trs[trs.length - 1] as FatoTransicao).timestamp : null
    const semDesfecho = arquivadoSemDesfecho(card, entrega !== null)
    const emAndamento = segmentos.length > 0 && segmentos[segmentos.length - 1]?.fim === null
    const cicloHU =
      entrega !== null && !emAndamento
        ? segmentos.reduce((s, g) => s + horasUteisEntre(g.ini, g.fim as number, cal), 0)
        : null
    const blq = bloqueiosPorCard.get(card.card_id)?.find((b) => b.fim === null) ?? null
    return {
      card,
      slugEquipe: slug(card.equipe),
      slugSistema: slug(card.sistema),
      ativo,
      descartado: foiDescartado,
      arquivadoSemDesfecho: semDesfecho,
      entrada: card.criado_em,
      compromisso: card.comprometido_em,
      inicio: card.iniciado_em,
      entrega,
      segmentos,
      cicloHU,
      ultimaTransicao: trs[trs.length - 1]?.timestamp ?? null,
      colunaAtual: card.coluna_atual,
      papelAtual: ultima?.papel ?? null,
      tipoColunaAtual: ultima?.tipo_coluna ?? null,
      bloqueioAberto: blq,
      projetoId: raiz(card, 'projeto'),
      frenteId: raiz(card, 'frente'),
    }
  })
  return {
    base,
    cal,
    porId,
    marcos,
    marcosPorId: new Map(marcos.map((m) => [m.card.card_id, m])),
    transicoesPorCard,
    bloqueiosPorCard,
    filhos,
    papelDe,
  }
}

export function indexarBM(base: BaseBM, cal: Calendario): IndiceBM {
  const chave = `${cal.modo}|${cal.offsetMinutos}|${cal.horasPorDia}|${JSON.stringify(cal.turnos)}|${ordenarNeutro([...cal.feriados], (x) => [x]).join(',')}`
  let m = cache.get(base)
  if (!m) {
    m = new Map()
    cache.set(base, m)
  }
  let idx = m.get(chave)
  if (!idx) {
    idx = construir(base, cal)
    m.set(chave, idx)
  }
  return idx
}

/** `hoje`: instante ISO com fuso (data de corte). Sempre parâmetro, nunca o relógio do sistema. */
export function criarContextoBM(base: BaseBM, hoje: string, cal: Calendario): ContextoBM {
  const ms = instanteDeIso(hoje, cal)
  const dia = diaLocal(ms, cal)
  return {
    idx: indexarBM(base, cal),
    hoje: ms,
    hojeDia: dia,
    hojeIso: isoDeDia(dia),
    cal,
    criterios: base.config.criterios,
  }
}

export const EH_BUG: readonly TipoCard[] = ['Bug interno', 'Defeito em produção']
