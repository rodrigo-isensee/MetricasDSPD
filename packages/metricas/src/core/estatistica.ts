import {
  MINIMO_AMOSTRA,
  type Estatistica,
  type Intervalo,
  type Percentis,
  type PercentisComMedia,
  type Taxa,
} from '@metricas-dspd/contratos'
import type { Amostra } from './amostra'
import { media, mediana, ordenar, percentilOrdenado } from './percentil'

export { MINIMO_AMOSTRA }

export const publicavel = (n: number): boolean => n >= MINIMO_AMOSTRA

/** Aplica a regra de mínimo: abaixo de 20 itens a função de cálculo nem é chamada. */
export function estatistica<T>(n: number, janela: Intervalo, calcular: () => T): Estatistica<T> {
  if (!publicavel(n)) return { status: 'insuficiente', n, minimo: MINIMO_AMOSTRA, janela }
  return { status: 'ok', n, valor: calcular(), janela }
}

function calcularPercentis(valores: readonly number[]): Percentis {
  const o = ordenar(valores)
  return {
    p50: percentilOrdenado(o, 0.5),
    p85: percentilOrdenado(o, 0.85),
    p95: percentilOrdenado(o, 0.95),
  }
}

/**
 * P50/P85/P95 sem a regra de mínimo, para uso DENTRO de uma estatística já protegida por
 * `estatistica(n, ...)`. Só aceita `Amostra` (domínio e classe no tipo): valores soltos não entram.
 */
export const percentisDe = (a: Amostra): Percentis => calcularPercentis(a.valores)

/** Mediana de uma amostra de classe única (mesma regra: só dentro de uma estatística protegida). */
export const medianaDe = (a: Amostra): number => mediana(a.valores)

/** P50/P85/P95 de uma amostra de classe única, com a regra de mínimo. */
export function percentis(a: Amostra): Estatistica<Percentis> {
  return estatistica(a.valores.length, a.janela, () => calcularPercentis(a.valores))
}

/** A média só existe junto dos percentis (nunca sozinha). */
export function resumoComMedia(a: Amostra): Estatistica<PercentisComMedia> {
  return estatistica(a.valores.length, a.janela, () => ({
    ...calcularPercentis(a.valores),
    media: media(a.valores),
  }))
}

/** k de n; o percentual só é publicado com n >= 20. */
export function taxa(k: number, n: number): Taxa {
  if (!publicavel(n)) return { status: 'insuficiente', k, n, minimo: MINIMO_AMOSTRA }
  return { status: 'ok', k, n, pct: (k / n) * 100 }
}

/** Percentual simples ou null abaixo do mínimo. */
export function pctOuNulo(k: number, n: number): number | null {
  return publicavel(n) ? (k / n) * 100 : null
}

export const arredondar = (v: number, casas = 2): number => {
  const f = 10 ** casas
  return Math.round(v * f) / f
}
