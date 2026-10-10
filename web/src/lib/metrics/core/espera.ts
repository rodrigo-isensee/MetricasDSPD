import type { Estatistica, Intervalo } from '@/contracts/comum'
import { estatistica, publicavel } from './estatistica'
import { mediana } from './percentil'

/** Visão do cliente e do time do MESMO item (mesma unidade). */
export interface ParVisoes {
  cliente: number
  time: number
}

export interface MedianasEspera {
  cliente: number
  time: number
  indicePct: number
  acimaDe50: boolean
}

export interface PontoEspera {
  n: number
  cliente: number | null
  time: number | null
  indicePct: number | null
}

const r2 = (v: number): number => Math.round(v * 100) / 100

/** Espera invisível = (cliente - time) / cliente, em %, sobre as medianas dos mesmos itens. */
export const indiceEspera = (cliente: number, time: number): number =>
  cliente > 0 ? ((cliente - time) / cliente) * 100 : 0

function medianas(itens: readonly ParVisoes[]): MedianasEspera {
  const c = mediana(itens.map((x) => x.cliente))
  const t = mediana(itens.map((x) => x.time))
  const i = indiceEspera(c, t)
  return { cliente: r2(c), time: r2(t), indicePct: r2(i), acimaDe50: i > 50 }
}

/**
 * Estatística de UM segmento (um tipo de demanda, uma prioridade, ou o próprio nível quando a
 * granularidade já é o segmento). Abaixo de 20 itens nenhuma das duas visões é calculada.
 */
export function estatisticaEspera(
  itens: readonly ParVisoes[],
  janela: Intervalo,
): Estatistica<MedianasEspera> {
  return estatistica(itens.length, janela, () => medianas(itens))
}

/** Ponto mensal da série: com menos de 20 itens na janela do mês, as medianas ficam nulas. */
export function pontoEspera(itens: readonly ParVisoes[]): PontoEspera {
  if (!publicavel(itens.length))
    return { n: itens.length, cliente: null, time: null, indicePct: null }
  const m = medianas(itens)
  return { n: itens.length, cliente: m.cliente, time: m.time, indicePct: m.indicePct }
}
