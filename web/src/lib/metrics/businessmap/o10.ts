import type { ResultadoO10 } from '@/contracts/metricas'
import { TIPOS_CARD, type TipoCard } from '@/contracts/comum'
import type { FiltrosFluxo } from '@/contracts/filtros'
import { diaDeIso, diaLocal, fimDoExpediente, isoDeDia } from '../core/calendario'
import { percentisDe, estatistica, publicavel } from '../core/estatistica'
import { FAIXAS, histogramaEmpilhado } from '../core/histograma'
import { mesesEntre } from '../core/series'
import { baseAmostral, criterios, periodoDe, r2, selecionar } from './comum'
import { amostraBM } from './amostra'
import { arquivadoAte } from './descartado'
import { estadoEm } from './estado'
import type { ContextoBM, MarcosCard } from './indice'

/** Idade (dias corridos) no dia `d` dos itens ainda não iniciados naquele dia. */
function idadesNaoIniciados(ctx: ContextoBM, cards: readonly MarcosCard[], d: number) {
  const t = Math.min(ctx.hoje, fimDoExpediente(d, ctx.cal))
  const out: { idade: number; m: MarcosCard }[] = []
  for (const m of cards) {
    if (m.card.criado_em > t) continue
    if (arquivadoAte(m.card, t)) continue
    if (m.inicio !== null && m.inicio <= t) continue
    if (m.card.excluido_em !== null) continue
    if (estadoEm(ctx, m, t).papel === 'entrega') continue
    out.push({ idade: d - diaLocal(m.entrada, ctx.cal), m })
  }
  return out
}

/** O10: envelhecimento do backlog. Visão do time = tudo; visão do cliente = área solicitante externa (P5). */
export function calcularO10(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO10 {
  const periodo = periodoDe(ctx, f)
  const ref = diaDeIso(periodo.fim)
  const cards = selecionar(ctx, f, 'story', { incluirInativos: true }).filter(
    (m) => !m.card.eh_subtarefa,
  )
  const internas = new Set(ctx.idx.base.config.areas_internas)
  const time = idadesNaoIniciados(ctx, cards, ref)
  const cliente = time.filter((x) => !internas.has(x.m.card.area_solicitante))
  const classes = TIPOS_CARD as readonly string[]

  const histo = (xs: typeof time) =>
    estatistica(xs.length, periodo, () => ({
      faixas: histogramaEmpilhado(
        xs.map((x) => ({ valor: x.idade, classe: x.m.card.tipo })),
        FAIXAS.backlog,
        classes,
      ),
    }))

  const meses = mesesEntre(diaDeIso(periodo.inicio), ref, ctx.hojeDia)
  const evolucao = TIPOS_CARD.filter((tipo: TipoCard) =>
    cards.some((m) => m.card.tipo === tipo),
  ).map((tipo) => {
    const dele = cards.filter((m) => m.card.tipo === tipo)
    return {
      tipo,
      serie: meses.map((b) => {
        const xs = idadesNaoIniciados(ctx, dele, Math.min(b.fimDia, ref))
        const ok = publicavel(xs.length)
        const p = ok
          ? percentisDe(
              amostraBM(
                'story',
                xs.map((x) => x.idade),
                periodo,
              ),
            )
          : null
        return { mes: b.chave, n: xs.length, p50: p ? r2(p.p50) : null, p85: p ? r2(p.p85) : null }
      }),
    }
  })

  const acimaTime = time.filter((x) => x.idade > 180).length
  return {
    base: baseAmostral(time.length, 'itens não iniciados', periodo, {
      n: cliente.length,
      unidade: 'na visão do cliente',
    }),
    criterios: criterios('O10', periodo, periodo, ctx),
    referencia: isoDeDia(ref),
    acimaDe180: { time: acimaTime, cliente: cliente.filter((x) => x.idade > 180).length },
    time: { n: time.length, histograma: histo(time) },
    cliente: { n: cliente.length, histograma: histo(cliente) },
    evolucao,
    statusMeta: acimaTime === 0 ? 'dentro' : 'fora',
  }
}
