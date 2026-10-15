import { TIPOS_CARD, type FiltrosFluxo, type ResultadoO25 } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal, fimDoExpediente, horasUteisEntre } from '../core/calendario'
import { estatistica, percentisDe, taxa } from '../core/estatistica'
import { mesesEntre } from '../core/series'
import { amostraBM } from './amostra'
import {
  baseAmostral,
  criterios,
  dentro,
  du,
  ehDemanda,
  janelaPercentis,
  periodoDe,
  r2,
  selecionar,
} from './comum'
import { instanteDoDescarte, motivoSemDescarte } from './descartado'
import type { ContextoBM } from './indice'

const soma = (xs: readonly number[]): number => xs.reduce((s, x) => s + x, 0)

/**
 * O25: descarte. Encerrados do período = entregues + descartados; taxa = descartados / encerrados, pela biblioteca
 * (percentual só com n >= 20). Descartado é o estado nativo `discarded` ou o excluído (R-2' = A, P-1 = A), no
 * instante do descarte (o da exclusão no excluído; sem ele, a última revisão, marcada como aproximada). Motivo
 * preenchido sem descarte vira aviso e fica fora da taxa (CA-26); o aviso conta só quem sairia da taxa do período (entregues nele ou abertos no fim dele). Tempo consumido (D-13, CA-19): do início ao
 * descarte em horas úteis; quem foi descartado antes de iniciar fica à parte, com tempo zero. P50/P85/P95 do
 * consumido depois do início só com n >= 20 na janela de 12 semanas, por tipo de demanda (regra 7: percentil só
 * dentro da classe; um tipo por vez na interface). Sem divisão por motivo enquanto a integração
 * não ler o catálogo nativo (`porMotivo = null`, CA-44); `discard_comment` e pessoa nunca entram.
 */
export function calcularO25(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO25 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f, 'story')
  const corte = fimDoExpediente(diaDeIso(periodo.fim), ctx.cal)
  const cards = selecionar(ctx, f, 'story', { incluirInativos: true }).filter(
    (m) => ehDemanda(m) && !m.card.eh_subtarefa,
  )
  const eventos = cards.flatMap((m) => {
    const d = instanteDoDescarte(m.card, m.ultimaTransicao ?? m.card.criado_em)
    if (d !== null) {
      const iniciou = m.inicio !== null && m.inicio < d.instante
      return [
        {
          tipo: m.card.tipo,
          descartado: true,
          instante: d.instante,
          aproximado: d.aproximado,
          iniciou,
          consumidoDu: iniciou
            ? du(ctx, horasUteisEntre(m.inicio as number, d.instante, ctx.cal))
            : 0,
        },
      ]
    }
    if (m.entrega !== null && !motivoSemDescarte(m.card))
      return [
        {
          tipo: m.card.tipo,
          descartado: false,
          instante: m.entrega,
          aproximado: false,
          iniciou: true,
          consumidoDu: 0,
        },
      ]
    return []
  })
  const noPeriodo = eventos.filter((e) => dentro(ctx, e.instante, periodo))
  const descartados = noPeriodo.filter((e) => e.descartado)
  const depois = descartados.filter((e) => e.iniciou)
  const depoisNaJanela = depois.filter((e) => dentro(ctx, e.instante, janela))
  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia).map(
    (b) => {
      const doMes = eventos.filter((e) => {
        const d = diaLocal(e.instante, ctx.cal)
        return d >= b.inicioDia && d <= b.fimDia
      })
      return {
        mes: b.chave,
        taxa: taxa(doMes.filter((e) => e.descartado).length, doMes.length),
        emAndamento: b.emAndamento,
      }
    },
  )
  const crit = criterios('O25', periodo, janela, ctx)
  return {
    base: baseAmostral(noPeriodo.length, 'encerrados (entregues e descartados)', periodo),
    criterios: crit,
    encerrados: taxa(descartados.length, noPeriodo.length),
    meses,
    marcacoes: crit.serie,
    consumido: {
      antesDoInicio: { itens: descartados.length - depois.length },
      depoisDoInicio: {
        itens: depois.length,
        diasUteis: r2(soma(depois.map((e) => e.consumidoDu))),
        segmentoPor: 'tipo' as const,
        porTipo: TIPOS_CARD.filter((t) => depois.some((e) => e.tipo === t)).map((t) => {
          const doTipo = depois.filter((e) => e.tipo === t)
          const naJanela = depoisNaJanela.filter((e) => e.tipo === t)
          return {
            tipo: t,
            itens: doTipo.length,
            diasUteis: r2(soma(doTipo.map((e) => e.consumidoDu))),
            estatistica: estatistica(naJanela.length, janela, () => {
              const p = percentisDe(
                amostraBM(
                  'story',
                  naJanela.map((e) => e.consumidoDu),
                  janela,
                ),
              )
              return { p50: r2(p.p50), p85: r2(p.p85), p95: r2(p.p95) }
            }),
          }
        }),
      },
    },
    instanteAproximado: { itens: descartados.filter((e) => e.aproximado).length },
    // B6-1: o aviso fala da mesma população da taxa do período: entregues no período e abertos no fim dele.
    avisoPreenchimento: {
      itens: cards.filter(
        (m) =>
          motivoSemDescarte(m.card) &&
          (dentro(ctx, m.entrega, periodo) ||
            (m.card.criado_em <= corte && (m.entrega === null || m.entrega > corte))),
      ).length,
    },
    porMotivo: null,
  }
}
