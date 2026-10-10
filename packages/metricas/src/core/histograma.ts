import type { FaixaHistograma } from '@metricas-dspd/contratos'
import type { Amostra } from './amostra'
import { publicavel } from './estatistica'

export interface DefFaixa {
  min: number
  /** null = aberta ("+N"). */
  max: number | null
}

const rotulo = (f: DefFaixa): string =>
  f.max === null ? `+${f.min - 1}` : f.min === f.max ? `${f.min}` : `${f.min}-${f.max}`

/** Faixas inteiras e inclusivas, aplicadas sobre floor(valor). PROVISÓRIAS (P14, pergunta 13). */
export const FAIXAS = {
  rapida: [
    { min: 0, max: 1 },
    { min: 2, max: 3 },
    { min: 4, max: 5 },
    { min: 6, max: 10 },
    { min: 11, max: 20 },
    { min: 21, max: null },
  ],
  lenta: [
    { min: 0, max: 5 },
    { min: 6, max: 10 },
    { min: 11, max: 20 },
    { min: 21, max: 40 },
    { min: 41, max: 80 },
    { min: 81, max: null },
  ],
  frente: [
    { min: 0, max: 10 },
    { min: 11, max: 20 },
    { min: 21, max: 40 },
    { min: 41, max: 80 },
    { min: 81, max: 160 },
    { min: 161, max: null },
  ],
  projeto: [
    { min: 0, max: 40 },
    { min: 41, max: 80 },
    { min: 81, max: 120 },
    { min: 121, max: 180 },
    { min: 181, max: 260 },
    { min: 261, max: null },
  ],
  /** Idade de backlog em dias corridos (faixas longas permitidas só aqui). */
  backlog: [
    { min: 0, max: 30 },
    { min: 31, max: 60 },
    { min: 61, max: 90 },
    { min: 91, max: 180 },
    { min: 181, max: 365 },
    { min: 366, max: null },
  ],
} as const satisfies Record<string, readonly DefFaixa[]>

export type PresetFaixas = keyof typeof FAIXAS

export function indiceFaixa(valor: number, faixas: readonly DefFaixa[]): number {
  const v = Math.floor(valor)
  for (let i = 0; i < faixas.length; i++) {
    const f = faixas[i] as DefFaixa
    if (v >= f.min && (f.max === null || v <= f.max)) return i
  }
  return faixas.length - 1
}

export function contarFaixas(
  valores: readonly number[],
  faixas: readonly DefFaixa[],
): FaixaHistograma[] {
  const cont = faixas.map(() => 0)
  for (const v of valores) {
    const i = indiceFaixa(v, faixas)
    cont[i] = (cont[i] as number) + 1
  }
  return faixas.map((f, i) => ({
    rotulo: rotulo(f),
    min: f.min,
    max: f.max,
    contagem: cont[i] as number,
  }))
}

/**
 * Histograma de uma única amostra (logo, de uma única classe e granularidade).
 * Devolve null abaixo de 20 itens: histograma é distribuição e não se publica.
 */
export function histograma(a: Amostra, faixas: readonly DefFaixa[]): FaixaHistograma[] | null {
  if (!publicavel(a.valores.length)) return null
  return contarFaixas(a.valores, faixas)
}

/**
 * Contagem empilhada por uma classe auxiliar (ex.: tipo no O10). Uma série de valores por classe.
 *
 * SÓ PARA CONTAGEM DE RETRATO (itens abertos hoje, como o backlog do O10): não é distribuição de
 * tempo concluído e por isso NÃO aplica a regra de 20 itens (a contagem de um censo é publicável
 * com qualquer n). Para distribuição de tempo concluído use `histograma`, que devolve null abaixo
 * de 20. As classes empilhadas devem ser tipos de demanda da MESMA granularidade (story, frente e
 * projeto nunca no mesmo histograma).
 */
export function histogramaEmpilhado(
  itens: readonly { valor: number; classe: string }[],
  faixas: readonly DefFaixa[],
  classes: readonly string[],
): FaixaHistograma[] {
  const m = faixas.map(() => new Map<string, number>())
  for (const it of itens) {
    const mm = m[indiceFaixa(it.valor, faixas)] as Map<string, number>
    mm.set(it.classe, (mm.get(it.classe) ?? 0) + 1)
  }
  return faixas.map((f, i) => {
    const mm = m[i] as Map<string, number>
    const empilhado = classes
      .map((classe) => ({ classe, contagem: mm.get(classe) ?? 0 }))
      .filter((x) => x.contagem > 0)
    return {
      rotulo: rotulo(f),
      min: f.min,
      max: f.max,
      contagem: empilhado.reduce((s, x) => s + x.contagem, 0),
      empilhado,
    }
  })
}
