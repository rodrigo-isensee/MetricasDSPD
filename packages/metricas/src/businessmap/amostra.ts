import type { Granularidade, Intervalo } from '@metricas-dspd/contratos'
import { criarAmostraInterna, type Amostra } from '../core/amostra'

/** `sprint` é a classe própria do T15 (duração de sprint): nunca no mesmo histograma de story, frente ou projeto. */
export type ClasseAmostraBM = Granularidade | 'sprint'
export type AmostraBM = Amostra<'businessmap', ClasseAmostraBM>

/** Única porta de entrada de amostras do BusinessMap: a classe é a granularidade. */
export function amostraBM(
  g: ClasseAmostraBM,
  valores: readonly number[],
  janela: Intervalo,
): AmostraBM {
  return criarAmostraInterna('businessmap', g, valores, janela)
}
