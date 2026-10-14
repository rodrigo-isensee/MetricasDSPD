import type { ResultadoEI } from '@metricas-dspd/contratos'
import { TIPOS_CARD, type Granularidade, type MetricaId } from '@metricas-dspd/contratos'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { slug } from '../slug'
import { diaDeIso, diaLocal, horasUteisEntre } from '../core/calendario'
import { estatisticaEspera, pontoEspera, type ParVisoes } from '../core/espera'
import { JANELA_POR_GRANULARIDADE, janelaMovelDia } from '../core/janela'
import { mesesEntre } from '../core/series'
import {
  baseAmostral,
  criterios,
  du,
  ehDemanda,
  janelaPercentis,
  periodoDe,
  selecionar,
} from './comum'
import type { ContextoBM, MarcosCard } from './indice'
import { relogiosDe } from './relogios'

export type NivelBM = 'FL1' | 'FL2' | 'FL3'
const CFG: Record<
  NivelBM,
  { g: Granularidade; id: MetricaId; gran: 'demanda' | 'frente' | 'projeto' }
> = {
  FL1: { g: 'story', id: 'EI_FL1', gran: 'demanda' },
  FL2: { g: 'frente', id: 'EI_FL2', gran: 'frente' },
  FL3: { g: 'projeto', id: 'EI_FL3', gran: 'projeto' },
}

/** Visão do cliente e visão do time do mesmo item (provisório, pergunta 1). Dias úteis. */
function visoes(
  ctx: ContextoBM,
  nivel: NivelBM,
  m: MarcosCard,
): { cliente: number; time: number } | null {
  if (m.entrega === null) return null
  if (nivel === 'FL1') {
    const r = relogiosDe(ctx, m)
    return r ? { cliente: r.cliente, time: r.equipe } : null
  }
  const ini = nivel === 'FL2' ? m.compromisso : m.inicio
  if (ini === null) return null
  return {
    cliente: du(ctx, horasUteisEntre(m.entrada, m.entrega, ctx.cal)),
    time: du(ctx, horasUteisEntre(ini, m.entrega, ctx.cal)),
  }
}

interface ItemEI {
  tipo: MarcosCard['card']['tipo']
  dia: number
  v: ParVisoes
}

/**
 * Espera invisível = (cliente - time) / cliente sobre as MEDIANAS dos mesmos itens e da mesma janela.
 * Segmentação (briefing 4.2): FL1 calcula UMA estatística e UMA série por tipo de demanda, nunca uma
 * mediana que mistura tipos. FL2 e FL3 têm um único segmento (a granularidade já é o segmento).
 * Se o segmento tiver menos de 20 itens, nenhuma das duas visões é publicada.
 */
export function calcularEIBM(ctx: ContextoBM, f: FiltrosFluxo, nivel: NivelBM): ResultadoEI {
  const { g, id, gran } = CFG[nivel]
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f, g)
  const espec = JANELA_POR_GRANULARIDADE[g]
  const cards = selecionar(ctx, f, g, { semTipo: true, semEquipe: nivel === 'FL3' }).filter((m) =>
    g === 'story' ? ehDemanda(m) : true,
  )
  const itens: ItemEI[] = []
  for (const m of cards) {
    const v = visoes(ctx, nivel, m)
    if (v)
      itens.push({
        tipo: m.card.tipo,
        dia: diaLocal(m.entrega as number, ctx.cal),
        v,
      })
  }
  const jIni = diaDeIso(janela.inicio)
  const jFim = diaDeIso(janela.fim)
  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)

  const montar = (chave: string | null, rotulo: string | null, doSegmento: readonly ItemEI[]) => {
    const naJanela = doSegmento.filter((x) => x.dia >= jIni && x.dia <= jFim)
    return {
      chave,
      rotulo,
      n: naJanela.length,
      estatistica: estatisticaEspera(
        naJanela.map((x) => x.v),
        janela,
      ),
      serie: meses.map((b) => {
        const j = janelaMovelDia(Math.min(b.fimDia, ctx.hojeDia), espec)
        const a = diaDeIso(j.inicio)
        const z = diaDeIso(j.fim)
        return {
          mes: b.chave,
          ...pontoEspera(doSegmento.filter((x) => x.dia >= a && x.dia <= z).map((x) => x.v)),
        }
      }),
    }
  }

  // FL1: tipos de demanda (sem "Bug interno", que não é demanda entregável). FL3: tipos de projeto
  // (Iniciativa, Melhoria; decisão Q4). FL2: frentes não têm tipo, um único segmento.
  const segmentoPor = nivel === 'FL2' ? null : ('tipo' as const)
  const tiposDoNivel = TIPOS_CARD.filter(
    (t) => (nivel !== 'FL1' || t !== 'Bug interno') && cards.some((m) => m.card.tipo === t),
  )
  const segmentos =
    nivel === 'FL2'
      ? [montar(null, null, itens)]
      : tiposDoNivel.map((t) =>
          montar(
            slug(t),
            t,
            itens.filter((x) => x.tipo === t),
          ),
        )
  return {
    base: baseAmostral(
      segmentos.reduce((s, x) => s + x.n, 0),
      nivel === 'FL1' ? 'demandas' : nivel === 'FL2' ? 'frentes' : 'projetos',
      janela,
    ),
    criterios: criterios(id, periodo, janela, ctx),
    nivel,
    fonte: 'BusinessMap',
    granularidade: gran,
    unidade: 'dias-uteis',
    janelaPercentis: janela,
    segmentoPor,
    segmentos,
  }
}
