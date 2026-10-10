import type { Intervalo, Prioridade } from '@/contracts/comum'
import { criarAmostraInterna, type Amostra } from '../core/amostra'

export type AmostraAC = Amostra<'acelerato', Prioridade | 'todas'>

/** Única porta de entrada de amostras do Acelerato: a classe é a prioridade (nunca agregada; 'todas' só onde o painel ainda não segmenta, ver S4). */
export function amostraAC(
  p: Prioridade | 'todas',
  valores: readonly number[],
  janela: Intervalo,
): AmostraAC {
  return criarAmostraInterna('acelerato', p, valores, janela)
}
