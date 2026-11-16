import {
  MOTIVO_O12_RESPONSABILIDADE_SEM_DADO_REAL,
  RESPONSABILIDADE_ATRASO_COM_FONTE,
  type FiltrosFluxo,
  type ResultadoO12,
} from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal } from '../core/calendario'
import { taxa } from '../core/estatistica'
import { mesesEntre } from '../core/series'
import { baseAmostral, criterios, periodoDe, selecionar } from './comum'
import { instanteDoDescarte } from './descartado'
import type { ContextoBM, MarcosCard } from './indice'

const zero = () => ({ Interno: 0, Solicitante: 0, Terceiro: 0, naoClassificado: 0 })

/**
 * Conta como acordo (Q-099-23 = AAA, 2026-11-13): o card que passou pelo ponto de compromisso (b = A), com o prazo atual do card (a = A).
 * Descartado antes do prazo sai da conta; descartado depois do prazo conta como vencido (c = A). Subtarefa nunca conta.
 */
function conta(m: MarcosCard): boolean {
  if (m.card.data_acordada === null || m.compromisso === null || m.card.eh_subtarefa) return false
  if (m.ativo) return true
  if (!m.descartado) return false
  // A reserva (`ultimaRevisao`) só vale sem instante nativo; descartado sempre traz um dos dois, então 0 nunca é usado.
  const descarte = instanteDoDescarte(m.card, 0, m.entrega)
  return descarte !== null && m.card.data_acordada < descarte.instante
}

function vencido(ctx: ContextoBM, m: MarcosCard): boolean {
  // Descartado depois do prazo venceu sem entrega; os demais comparam com a entrega ou com hoje.
  if (m.descartado) return true
  return (m.card.data_acordada as number) < (m.entrega ?? ctx.hoje)
}

/**
 * O12: acordos x vencidos pelo prazo nativo do card (decisão B, Q-099-10). A divisão por responsabilidade do atraso sai `null` com o motivo
 * enquanto nenhum vencido vier com o campo 51 preenchido (`RESPONSABILIDADE_ATRASO_COM_FONTE`, E7.214): nunca 0 nem meta avaliada.
 */
export function calcularO12(
  ctx: ContextoBM,
  f: FiltrosFluxo,
  /** Só os testes passam outro valor: o interruptor é a constante do contrato. */
  comResponsabilidade: boolean = RESPONSABILIDADE_ATRASO_COM_FONTE,
): ResultadoO12 {
  const periodo = periodoDe(ctx, f)
  const cards = selecionar(ctx, f, 'story', { semTipo: true, incluirInativos: true }).filter(conta)
  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
  const tot = zero()
  let acordos = 0
  let vencidos = 0
  const linhas = meses.map((b) => {
    const doMes = cards.filter((m) => {
      const d = diaLocal(m.card.data_acordada as number, ctx.cal)
      return d >= b.inicioDia && d <= b.fimDia
    })
    const v = doMes.filter((m) => vencido(ctx, m))
    const por = zero()
    for (const m of v) {
      const r = m.card.responsabilidade_atraso
      if (r === null) por.naoClassificado++
      else por[r]++
    }
    for (const k of Object.keys(por) as (keyof typeof por)[]) tot[k] += por[k]
    acordos += doMes.length
    vencidos += v.length
    return {
      mes: b.chave,
      emAndamento: b.emAndamento,
      acordos: doMes.length,
      vencidos: v.length,
      porResponsabilidade: por,
      pctVencidos: taxa(v.length, doMes.length),
    }
  })
  // Ligado, mas sem nenhum vencido classificado (campo 51 ainda vazio): não publica, para não passar 0 de causa interna por dado.
  const publica = comResponsabilidade && tot.Interno + tot.Solicitante + tot.Terceiro > 0
  return {
    base: baseAmostral(acordos, 'acordos', periodo, { n: vencidos, unidade: 'vencidos' }),
    criterios: criterios('O12', periodo, periodo, ctx),
    meses: linhas.map((l) => ({
      ...l,
      porResponsabilidade: publica ? l.porResponsabilidade : null,
    })),
    totais: {
      acordos,
      vencidos,
      porResponsabilidade: publica ? tot : null,
      pctVencidos: taxa(vencidos, acordos),
    },
    vencidosCausaInterna: publica ? tot.Interno : null,
    motivoResponsabilidade: publica ? null : MOTIVO_O12_RESPONSABILIDADE_SEM_DADO_REAL,
    statusMeta: !publica ? 'sem-referencia' : tot.Interno === 0 ? 'dentro' : 'fora',
  }
}
