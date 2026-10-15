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
    .map((m) => ({
      m,
      dia: diaLocal(m.entrega as number, ctx.cal),
      ciclo: du(ctx, m.cicloHU as number),
    }))
}

/** Entregues no intervalo: as pontas são lidas uma vez (não por item). */
const naJanelaDe = (es: readonly Entregue[], j: Intervalo): Entregue[] => {
  const a = diaDeIso(j.inicio)
  const b = diaDeIso(j.fim)
  return es.filter((e) => e.dia >= a && e.dia <= b)
}

/** P85 da janela se publicável, senão null. */
export function p85NaJanela(
  es: readonly Entregue[],
  j: Intervalo,
): { p85: number | null; n: number } {
  const vals = naJanelaDe(es, j).map((e) => e.ciclo)
  return {
    n: vals.length,
    p85: publicavel(vals.length) ? percentisDe(amostraBM('story', vals, j)).p85 : null,
  }
}

/** Os entregues de um tipo (todos, não só os da janela) e se o tipo existe na seleção. */
export interface EntreguesDoTipo {
  tipo: TipoCard
  es: Entregue[]
  existe: boolean
}

/** Uma classe (tipo) do O3 na janela: os entregues do tipo, os que caem na janela e a estatística protegida pelos 20. */
export interface ClasseNaJanela extends EntreguesDoTipo {
  naJanela: Entregue[]
  estatistica: ReturnType<typeof resumoComMedia>
}

/** Entregues por tipo (nunca misturados). Não depende da data de corte, só da seleção e do calendário. */
export function entreguesPorTipo(ctx: ContextoBM, f: FiltrosFluxo): EntreguesDoTipo[] {
  const cards = selecionar(ctx, f, 'story')
  return TIPOS_CARD.map((tipo: TipoCard) => {
    const doTipo = cards.filter((m) => m.card.tipo === tipo)
    return { tipo, es: entreguesDe(ctx, doTipo), existe: doTipo.length > 0 }
  })
}

/**
 * O núcleo do O3, compartilhado com a tendência mensal (ADR 0019): a estatística de cada tipo na janela, calculada
 * só dentro do tipo. Os tipos sem nenhum item (nem fora da janela) ficam de fora.
 */
export function classesNaJanela(
  porTipo: readonly EntreguesDoTipo[],
  janela: Janela,
): ClasseNaJanela[] {
  return porTipo
    .map((c) => {
      const naJanela = naJanelaDe(c.es, janela)
      const estatistica = resumoComMedia(
        amostraBM(
          'story',
          naJanela.map((e) => e.ciclo),
          janela,
        ),
      )
      return { ...c, naJanela, estatistica }
    })
    .filter((c) => c.naJanela.length > 0 || c.existe)
}

/** O3: tempo de ciclo por tipo (uma distribuição por vez, nunca misturadas). */
export function calcularO3(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO3 {
  const periodo = periodoDe(ctx, f)
  const janela: Janela = janelaPercentis(ctx, f, 'story')
  const espec = JANELA_POR_GRANULARIDADE.story
  const semanas = semanasEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia).filter(
    (s) => !s.emAndamento,
  )
  const anterior = janelaDeslocada(janela, 6)

  let total = 0
  const classes = classesNaJanela(entreguesPorTipo(ctx, f), janela).map(
    ({ tipo, es, naJanela, estatistica }) => {
      total += naJanela.length
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
    },
  )

  return {
    base: baseAmostral(total, 'itens concluídos', janela),
    criterios: criterios('O3', periodo, janela, ctx),
    janelaPercentis: janela,
    classes,
  }
}
