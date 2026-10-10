import type { EtapaAcelerato, MotivoPendencia } from './modelo'

/** Os cinco totalizadores da view de etapas (briefing 3.2). A soma é o tempo de vida do chamado. */
export type Totalizador =
  | 'sem-atendimento'
  | 'em-atendimento'
  | 'espera-combinada'
  | 'espera-solicitante'
  | 'espera-outros-times'

export const TOTALIZADORES: readonly Totalizador[] = [
  'sem-atendimento',
  'em-atendimento',
  'espera-combinada',
  'espera-solicitante',
  'espera-outros-times',
]

/**
 * Mapeamento etapa → totalizador, preservado e revisável quando novas etapas entrarem (3.2).
 * Pendente depende do motivo. Encerrado e Arquivar não contam (relógio parado).
 */
export function totalizadorDaEtapa(
  etapa: EtapaAcelerato,
  motivo: MotivoPendencia | null,
): Totalizador | null {
  switch (etapa) {
    case 'Novo':
    case 'Em triagem':
    case 'Aguardando atribuição':
      return 'sem-atendimento'
    case 'Em diagnóstico':
    case 'Em atendimento N1':
    case 'Em atendimento N2':
    case 'Em atendimento N3':
      return 'em-atendimento'
    case 'Aguardando validação':
      return 'espera-solicitante'
    case 'Pendente':
      if (motivo === 'Aguardando janela de mudança') return 'espera-combinada'
      if (motivo === 'Aguardando solicitante') return 'espera-solicitante'
      return 'espera-outros-times'
    case 'Encerrado':
    case 'Arquivar':
      return null
  }
}

/** Etapas que pausam o relógio de SLA (briefing 3.4). */
export const ETAPAS_PAUSA: readonly EtapaAcelerato[] = ['Pendente', 'Aguardando validação']
