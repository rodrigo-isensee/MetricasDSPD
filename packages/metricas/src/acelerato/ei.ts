import type { ResultadoEI } from '@metricas-dspd/contratos'
import type { Prioridade } from '@metricas-dspd/contratos'
import type { FiltrosSustentacao } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal } from '../core/calendario'
import { estatisticaEspera, pontoEspera, type ParVisoes } from '../core/espera'
import { JANELA_POR_GRANULARIDADE, janelaMovelDia } from '../core/janela'
import { ordenarNeutro } from '../core/ordenar'
import { mesesEntre } from '../core/series'
import {
  baseAmostral,
  criterios,
  janelaPercentis,
  periodoDe,
  prioridadesAlvo,
  r2,
  selecionarAC,
} from './comum'
import { classeDaEtapaEI } from './totalizadores'
import type { ContextoAC } from './indice'

interface ItemEI {
  prioridade: Prioridade
  dia: number
  v: ParVisoes
  /** Horas úteis por grupo de etapa, para a composição (contagem, nunca estatística). */
  filaInicial: number
  finais: number
  naoDecididas: Map<string, number>
}

/**
 * Espera invisível da sustentação (pedido 105, E7.243; decisões P-EI-1 B e P-EI-2 A, suposição P-EI-3; critério `105:EI_SUST`). Horas úteis.
 * Cliente = soma do tempo de todas as etapas do chamado fechado, menos as finais (fora das duas visões, contadas). Time = cliente menos as
 * esperas da D5a (as que pausam o SLA do S1) e a fila inicial. As etapas não decididas ficam como tempo do time e vão contadas em
 * `composicao`, nunca zero em silêncio. Segmentada por prioridade, nunca agregada (S1): uma estatística e uma série por prioridade, cada
 * uma com a regra de 20 itens. Só Acelerato, só datas e tempo por etapa (nada de pessoa); medianas pela biblioteca (T2.5).
 */
export function calcularEIAcelerato(ctx: ContextoAC, f: FiltrosSustentacao): ResultadoEI {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f)
  const espec = JANELA_POR_GRANULARIDADE.chamado
  const itens: ItemEI[] = []
  let semEtapas = 0
  const semEtapasPorDia: number[] = []
  for (const x of selecionarAC(ctx, f)) {
    if (!x.apuravel || x.c.data_finalizado === null || x.c.prioridade === undefined) continue
    const dia = diaLocal(x.c.data_finalizado, ctx.cal)
    let cliente = 0
    let espera = 0
    let filaInicial = 0
    let finais = 0
    const naoDecididas = new Map<string, number>()
    for (const [etapa, h] of x.porEtapa) {
      switch (classeDaEtapaEI(etapa)) {
        case 'final':
          finais += h
          continue
        case 'espera':
          espera += h
          break
        case 'fila-inicial':
          filaInicial += h
          break
        case 'nao-decidida':
          naoDecididas.set(etapa, (naoDecididas.get(etapa) ?? 0) + h)
          break
        case 'time':
          break
      }
      cliente += h
    }
    if (cliente <= 0) {
      semEtapasPorDia.push(dia)
      continue
    }
    itens.push({
      prioridade: x.c.prioridade,
      dia,
      v: { cliente, time: cliente - espera - filaInicial },
      filaInicial,
      finais,
      naoDecididas,
    })
  }
  const jIni = diaDeIso(janela.inicio)
  const jFim = diaDeIso(janela.fim)
  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
  const alvo = new Set<Prioridade>(prioridadesAlvo(f))
  const segmentos = prioridadesAlvo(f).map((p) => {
    const doSegmento = itens.filter((x) => x.prioridade === p)
    const naJanela = doSegmento.filter((x) => x.dia >= jIni && x.dia <= jFim)
    return {
      chave: p.toLowerCase(),
      rotulo: p,
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
  })
  const naJanelaTodos = itens.filter(
    (x) => alvo.has(x.prioridade) && x.dia >= jIni && x.dia <= jFim,
  )
  semEtapas = semEtapasPorDia.length - semEtapasPorDia.filter((d) => d < jIni || d > jFim).length
  return {
    base: baseAmostral(
      segmentos.reduce((s, x) => s + x.n, 0),
      'chamados',
      janela,
    ),
    criterios: criterios('EI_SUST', periodo, janela, ctx),
    nivel: 'SUST',
    fonte: 'Acelerato',
    granularidade: 'chamado',
    unidade: 'horas-uteis',
    janelaPercentis: janela,
    segmentoPor: 'prioridade',
    segmentos,
    composicao: composicaoDe(naJanelaTodos, semEtapas),
  }
}

const soma = (xs: readonly number[]): number => xs.reduce((s, v) => s + v, 0)

/** Contagem dos grupos de etapa nos chamados da janela (todas as prioridades do filtro); horas em soma, arredondadas. */
function composicaoDe(
  xs: readonly ItemEI[],
  semEtapas: number,
): NonNullable<ResultadoEI['composicao']> {
  const parte = (h: (x: ItemEI) => number) => ({
    chamados: xs.filter((x) => h(x) > 0).length,
    horasUteis: r2(soma(xs.map(h))),
  })
  const nomes = ordenarNeutro([...new Set(xs.flatMap((x) => [...x.naoDecididas.keys()]))], (n) => [
    n,
  ])
  const etapas = nomes.map((etapa) => ({
    etapa,
    ...parte((x) => x.naoDecididas.get(etapa) ?? 0),
  }))
  return {
    chamados: xs.length,
    semEtapas,
    filaInicial: parte((x) => x.filaInicial),
    finais: parte((x) => x.finais),
    naoDecididas: {
      ...parte((x) => soma([...x.naoDecididas.values()])),
      etapas,
    },
  }
}
