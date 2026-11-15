import type { ResultadoS1 } from '@metricas-dspd/contratos'
import { fmtNumero } from '@/lib/formatar'

type ClasseS1 = ResultadoS1['prioridades'][number]['restauracao']
type UnidadeExibicao = NonNullable<ClasseS1['exibirEm']>
type Relogio = ClasseS1['unidade']

/** "h úteis" com até 2 casas e sem zeros sobrando (15 min = "0,25 h úteis"). Nunca minutos nem horas corridas (J2). */
export function fmtHU(h: number): string {
  return `${fmtNumero(h, 2)} h úteis`
}

/**
 * Prazo do S1 na unidade em que o PROC o escreve, com o relógio da célula (K-314, Q-099-11).
 * `exibirEm`: `min` (h × 60), `h` ou `dia` (h ÷ `horasPorDiaUtil` do resultado, nunca constante).
 * `relogio`: `util` escreve "útil/úteis"; `corrido` escreve "corrido(a)(s)". Até 2 casas, sem zeros sobrando; singular até 1,0.
 * `exibirEm` nulo (vigência anterior ao K-314): horas com o rótulo do relógio. A unidade nunca é deduzida do valor.
 */
export function fmtPrazo(
  h: number,
  exibirEm: UnidadeExibicao | null,
  relogio: Relogio,
  horasPorDiaUtil: number,
): string {
  const un = exibirEm ?? 'h'
  const v = Math.round((un === 'min' ? h * 60 : un === 'dia' ? h / horasPorDiaUtil : h) * 100) / 100
  const singular = v <= 1
  const util = relogio === 'util'
  const nome = un === 'min' ? 'min' : un === 'h' ? 'h' : singular ? 'dia' : 'dias'
  const feminino = un === 'h'
  const rotulo = util
    ? singular
      ? 'útil'
      : 'úteis'
    : `corrid${feminino ? 'a' : 'o'}${singular ? '' : 's'}`
  return `${fmtNumero(v, 2)} ${nome} ${rotulo}`
}

export const minusculo = (p: string) => p.toLowerCase()
