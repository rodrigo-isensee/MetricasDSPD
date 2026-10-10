import type { Granularidade, Intervalo } from '@metricas-dspd/contratos'
import { criarAmostraInterna, type Amostra } from '../core/amostra'

export type AmostraBM = Amostra<'businessmap', Granularidade>

/** Única porta de entrada de amostras do BusinessMap: a classe é a granularidade. */
export function amostraBM(
  g: Granularidade,
  valores: readonly number[],
  janela: Intervalo,
): AmostraBM {
  return criarAmostraInterna('businessmap', g, valores, janela)
}
