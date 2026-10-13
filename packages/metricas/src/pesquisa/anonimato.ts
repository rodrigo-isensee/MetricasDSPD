import {
  FAIXAS_ESCALA,
  MINIMOS_PESQUISA,
  type BlocoPesquisaConsolidado,
  type ResultadoPV1,
} from '@metricas-dspd/contratos'
import { taxa } from '../core/estatistica'

/**
 * Regras de publicação da PV1 (funções puras). O `n` de um grupo é o número de respondentes; a regra de
 * mínimo 5 (consolidado) e 3 (área), a supressão complementar (A10) e o mínimo de 20 para percentual
 * ficam todas aqui: front e server só repassam o resultado.
 */

type Ok = Extract<ResultadoPV1, { status: 'ok' }>
export type PorArea = Ok['porArea']
type AreaPublicada = Extract<PorArea, { status: 'publicado' }>['areas'][number]
type BlocoArea = AreaPublicada['bloco']
export type Faixas = readonly [number, number, number, number, number]

/** Respondentes de um grupo (área ou consolidado) e contagem por pergunta e faixa. */
export interface Grupo {
  rotulo: string
  n: number
  contagens: Readonly<Record<string, Faixas>>
}

export const ROTULO_OUTRAS = 'Outras áreas'

const comparar = (a: string, b: string) => a.localeCompare(b, 'pt-BR')

/** Soma grupos (mesmas perguntas) sem alterar os originais. */
export function somarGrupos(
  rotulo: string,
  grupos: readonly Grupo[],
  codigos: readonly string[],
): Grupo {
  const contagens: Record<string, Faixas> = {}
  for (const c of codigos) {
    const t: [number, number, number, number, number] = [0, 0, 0, 0, 0]
    for (const g of grupos) {
      const f = g.contagens[c]
      if (f) for (let i = 0; i < 5; i++) t[i] = (t[i] as number) + (f[i] as number)
    }
    contagens[c] = t
  }
  return { rotulo, n: grupos.reduce((s, g) => s + g.n, 0), contagens }
}

function perguntasDe(g: Grupo, codigos: readonly string[]) {
  return codigos.map((codigo) => {
    const f = g.contagens[codigo] ?? [0, 0, 0, 0, 0]
    return {
      codigo,
      faixas: FAIXAS_ESCALA.map((_, i) => ({
        faixa: (i + 1) as 1 | 2 | 3 | 4 | 5,
        contagem: taxa(f[i] as number, g.n),
      })),
    }
  })
}

/** Consolidado: n < 5 só informa n e mínimo; de 5 a 19, "k de n"; com 20 ou mais, também o percentual. */
export function blocoConsolidado(g: Grupo, codigos: readonly string[]): BlocoPesquisaConsolidado {
  const minimo = MINIMOS_PESQUISA.consolidado
  if (g.n < minimo) return { status: 'base-insuficiente', n: g.n, minimo }
  return { status: 'publicado', n: g.n, perguntas: perguntasDe(g, codigos) }
}

function blocoArea(g: Grupo, codigos: readonly string[]): BlocoArea {
  return { status: 'publicado', n: g.n, perguntas: perguntasDe(g, codigos) }
}

/** Faixas 4 e 5 somadas ("Concordam", U3 provisório), por pergunta, para a tendência. */
export function concordam(g: Grupo, codigos: readonly string[]) {
  return codigos.map((codigo) => {
    const f = g.contagens[codigo] ?? [0, 0, 0, 0, 0]
    return { codigo, contagem: taxa(f[3] + f[4], g.n) }
  })
}

/**
 * Por área. Ciclo 1: não publica. Do ciclo 2 em diante, área com n < 3 vai para "Outras áreas" e, se o resto
 * der 1 ou 2, a menor área publicada (empate: ordem alfabética) também vai (A10), até o resto ser 0 ou >= 3.
 * Com menos de 2 grupos publicáveis, não publica. A ordem por tamanho é só interna.
 */
export function agruparAreas(
  areas: readonly Grupo[],
  ciclo: number,
  codigos: readonly string[],
): PorArea {
  if (ciclo < MINIMOS_PESQUISA.porAreaDesdeCiclo)
    return { status: 'nao-publicado', motivo: 'primeiro-ciclo' }
  const min = MINIMOS_PESQUISA.area
  let publicadas = areas.filter((a) => a.n >= min)
  let pequenas = areas.filter((a) => a.n < min)
  const nOutras = () => pequenas.reduce((s, g) => s + g.n, 0)
  while (nOutras() > 0 && nOutras() < min && publicadas.length > 0) {
    const menor = [...publicadas].sort(
      (a, b) => a.n - b.n || comparar(a.rotulo, b.rotulo),
    )[0] as Grupo
    publicadas = publicadas.filter((a) => a !== menor)
    pequenas = [...pequenas, menor]
  }
  const outras = somarGrupos(ROTULO_OUTRAS, pequenas, codigos)
  const grupos = outras.n > 0 ? publicadas.length + 1 : publicadas.length
  if (grupos < 2) return { status: 'nao-publicado', motivo: 'base-insuficiente' }
  const lista: AreaPublicada[] = [...publicadas]
    .sort((a, b) => comparar(a.rotulo, b.rotulo))
    .map((g) => ({ rotulo: g.rotulo, outras: false, bloco: blocoArea(g, codigos) }))
  if (outras.n > 0)
    lista.push({ rotulo: ROTULO_OUTRAS, outras: true, bloco: blocoArea(outras, codigos) })
  return { status: 'publicado', areas: lista }
}
