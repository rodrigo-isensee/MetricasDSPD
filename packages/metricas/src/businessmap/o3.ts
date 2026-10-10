import type { ResultadoO3 } from '@metricas-dspd/contratos'
import { TIPOS_CARD, type Intervalo, type Janela, type TipoCard } from '@metricas-dspd/contratos'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal, isoDeDia } from '../core/calendario'
import { percentisDe, publicavel, resumoComMedia } from '../core/estatistica'
import { JANELA_POR_GRANULARIDADE, janelaDeslocada, janelaMovelDia } from '../core/janela'
import { semanasEntre } from '../core/series'
import { ordenarNeutro } from '../core/ordenar'
import { amostraBM } from './amostra'
import { baseAmostral, criterios, du, janelaPercentis, periodoDe, r2, selecionar } from './comum'
import type { ContextoBM, MarcosCard } from './indice'

export interface Entregue {
  m: MarcosCard
  dia: number
  ciclo: number // dias úteis
}

export function entreguesDe(ctx: ContextoBM, cards: readonly MarcosCard[]): Entregue[] {
  return cards
    .filter((m) => m.cicloHU !== null && m.entrega !== null)
    .map((m) => ({ m, dia: diaLocal(m.entrega ?? 0, ctx.cal), ciclo: du(ctx, m.cicloHU ?? 0) }))
}

const noIntervalo = (e: Entregue, j: Intervalo): boolean =>
  e.dia >= diaDeIso(j.inicio) && e.dia <= diaDeIso(j.fim)

/** P85 da janela se publicável, senão null. */
export function p85NaJanela(
  es: readonly Entregue[],
  j: Intervalo,
): { p85: number | null; n: number } {
  const vals = es.filter((e) => noIntervalo(e, j)).map((e) => e.ciclo)
  return {
    n: vals.length,
    p85: publicavel(vals.length) ? percentisDe(amostraBM('story', vals, j)).p85 : null,
  }
}

/** O3: tempo de ciclo por tipo (uma distribuição por vez, nunca misturadas). */
export function calcularO3(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO3 {
  const periodo = periodoDe(ctx, f)
  const janela: Janela = janelaPercentis(ctx, f, 'story')
  const cards = selecionar(ctx, f, 'story')
  const espec = JANELA_POR_GRANULARIDADE.story
  const semanas = semanasEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia).filter(
    (s) => !s.emAndamento,
  )
  const anterior = janelaDeslocada(janela, 6)

  let total = 0
  const classes = TIPOS_CARD.map((tipo: TipoCard) => {
    const es = entreguesDe(
      ctx,
      cards.filter((m) => m.card.tipo === tipo),
    )
    const naJanela = es.filter((e) => noIntervalo(e, janela))
    total += naJanela.length
    const estatistica = resumoComMedia(
      amostraBM(
        'story',
        naJanela.map((e) => e.ciclo),
        janela,
      ),
    )
    const atual = estatistica.status === 'ok' ? estatistica.valor.p85 : null
    const ant = p85NaJanela(es, anterior).p85
    const ok = atual !== null && ant !== null
    return {
      tipo,
      n: naJanela.length,
      estatistica,
      pontos: ordenarNeutro(
        naJanela.map((e) => ({
          cardId: e.m.card.card_id,
          titulo: e.m.card.titulo,
          dataEntrega: isoDeDia(e.dia),
          cicloDiasUteis: r2(e.ciclo),
        })),
        (x) => [x.cardId],
      ),
      serieP85: semanas.map((s) => {
        const r = p85NaJanela(es, janelaMovelDia(s.fimDia, espec))
        return { semana: s.chave, n: r.n, p85: r.p85 === null ? null : r2(r.p85) }
      }),
      variacaoP85: {
        status: ok ? ('ok' as const) : ('indisponivel' as const),
        atual: atual === null ? null : r2(atual),
        anterior: ant === null ? null : r2(ant),
        variacaoPct: ok && ant !== 0 ? r2(((atual - ant) / ant) * 100) : null,
        janelaAnterior: { inicio: anterior.inicio, fim: anterior.fim },
      },
    }
  }).filter((c) => c.n > 0 || cards.some((m) => m.card.tipo === c.tipo))

  return {
    base: baseAmostral(total, 'itens concluídos', janela),
    criterios: criterios('O3', periodo, janela, ctx),
    janelaPercentis: janela,
    classes,
  }
}
