import type { Intervalo, Prioridade } from '@/contracts/comum'
import { criarAmostraInterna, type Amostra } from '../core/amostra'

export type AmostraAC = Amostra<'acelerato', Prioridade>

/** Única porta de entrada de amostras do Acelerato: a classe é a prioridade (nunca agregada). */
export function amostraAC(p: Prioridade, valores: readonly number[], janela: Intervalo): AmostraAC {
  return criarAmostraInterna('acelerato', p, valores, janela)
}
