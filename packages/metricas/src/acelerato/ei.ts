import type { ResultadoEI } from '@metricas-dspd/contratos'
import type { Prioridade } from '@metricas-dspd/contratos'
import type { FiltrosSustentacao } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal } from '../core/calendario'
import { estatisticaEspera, pontoEspera, type ParVisoes } from '../core/espera'
import { JANELA_POR_GRANULARIDADE, janelaMovelDia } from '../core/janela'
import { mesesEntre } from '../core/series'
import {
  baseAmostral,
  criterios,
  janelaPercentis,
  periodoDe,
  prioridadesAlvo,
  selecionarAC,
} from './comum'
import type { ContextoAC } from './indice'

interface ItemEI {
  prioridade: Prioridade
  dia: number
  v: ParVisoes
}

/**
 * Espera invisível da sustentação (P4/pergunta 12, provisório): cliente = tempo de vida do chamado
 * fechado (soma dos cinco totalizadores); time = totalizador "em atendimento". Horas úteis.
 * Segmentada por prioridade, nunca agregada (S1: "por prioridade, nunca agregado"): uma estatística
 * e uma série por prioridade, cada uma com a regra de 20 itens.
 * Fonte diferente do BusinessMap: não comparável com os outros níveis.
 */
export function calcularEIAcelerato(ctx: ContextoAC, f: FiltrosSustentacao): ResultadoEI {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f)
  const espec = JANELA_POR_GRANULARIDADE.chamado
  const itens: ItemEI[] = []
  for (const x of selecionarAC(ctx, f)) {
    if (!x.apuravel || x.c.data_finalizado === null || x.c.prioridade === undefined) continue
    itens.push({
      prioridade: x.c.prioridade,
      dia: diaLocal(x.c.data_finalizado, ctx.cal),
      v: { cliente: x.vidaHU, time: x.porTotalizador['em-atendimento'] },
    })
  }
  const jIni = diaDeIso(janela.inicio)
  const jFim = diaDeIso(janela.fim)
  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
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
  }
}
