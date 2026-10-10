import type { ResultadoO12 } from '@/contracts/metricas'
import type { FiltrosFluxo } from '@/contracts/filtros'
import { diaDeIso, diaLocal } from '../core/calendario'
import { taxa } from '../core/estatistica'
import { mesesEntre } from '../core/series'
import { baseAmostral, criterios, periodoDe, selecionar } from './comum'
import type { ContextoBM, MarcosCard } from './indice'

const zero = () => ({ Interno: 0, Solicitante: 0, Terceiro: 0, naoClassificado: 0 })

function vencido(ctx: ContextoBM, m: MarcosCard): boolean {
  const lim = m.card.data_acordada
  if (lim === null) return false
  return lim < (m.entrega ?? ctx.hoje)
}

/** O12: acordos x vencidos, por responsabilidade do atraso (campo preenchido no vencimento). */
export function calcularO12(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO12 {
  const periodo = periodoDe(ctx, f)
  const cards = selecionar(ctx, f, 'story', { semTipo: true }).filter(
    (m) => m.card.data_acordada !== null,
  )
  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
  const tot = zero()
  let acordos = 0
  let vencidos = 0
  const linhas = meses.map((b) => {
    const doMes = cards.filter((m) => {
      const d = diaLocal(m.card.data_acordada ?? 0, ctx.cal)
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
  return {
    base: baseAmostral(acordos, 'acordos', periodo, { n: vencidos, unidade: 'vencidos' }),
    criterios: criterios('O12', periodo, periodo, ctx),
    meses: linhas,
    totais: { acordos, vencidos, porResponsabilidade: tot, pctVencidos: taxa(vencidos, acordos) },
    vencidosCausaInterna: tot.Interno,
    statusMeta: tot.Interno === 0 ? 'dentro' : 'fora',
  }
}
