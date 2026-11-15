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

/** Motivo da pendência sem motivo conhecido: a etapa `Pendente` sem "Motivo de Pendência" (Decisão do dono, pedido 099, D5a). */
export const MOTIVO_NAO_CLASSIFICADO = 'Não classificado'

const normaliza = (etapa: string): string => etapa.trim().toLocaleLowerCase('pt-BR')

/**
 * De-para das esperas reais do Acelerato para o motivo de pendência (pedido 099, D5a; versão de critério `afeta = ['S1', 'S9']`).
 * Decididas pelo dono: "Aguardando Solicitante" é aguardando solicitante; "Aguardando Suporte Terceiros" e "Aguardando Fornecedor" são
 * aguardando fornecedor; "Aguardando Janela de Mudança" (com ou sem o sufixo "(Deploy Produção)") é aguardando janela de mudança.
 * Fora, até decisão do dono: Equipe Interna, Aprovação, Mudança e Data Acordada (não se inferem). Comparação sem diferença de caixa.
 */
const MOTIVO_DA_ESPERA: ReadonlyMap<string, MotivoPendencia> = new Map([
  ['aguardando solicitante', 'Aguardando solicitante'],
  ['aguardando suporte terceiros', 'Aguardando fornecedor'],
  ['aguardando fornecedor', 'Aguardando fornecedor'],
  ['aguardando janela de mudança', 'Aguardando janela de mudança'],
  ['aguardando janela de mudança (deploy produção)', 'Aguardando janela de mudança'],
])

/**
 * Motivo de pendência de um intervalo de etapa, ou `null` se a etapa não é pendência. `Pendente` vale pelo motivo gravado, ou
 * "Não classificado" sem ele; as esperas decididas valem pelo de-para acima.
 */
export function motivoDaPendencia(etapa: string, motivo: MotivoPendencia | null): string | null {
  if (normaliza(etapa) === 'pendente') return motivo ?? MOTIVO_NAO_CLASSIFICADO
  return MOTIVO_DA_ESPERA.get(normaliza(etapa)) ?? null
}

/** Etapa que pausa o relógio de SLA da S1: as de `ETAPAS_PAUSA` e as esperas decididas (mesmo de-para da S9). */
export function pausaOSla(etapa: string): boolean {
  return (
    (ETAPAS_PAUSA as readonly string[]).includes(etapa) ||
    normaliza(etapa) === 'pendente' ||
    MOTIVO_DA_ESPERA.has(normaliza(etapa))
  )
}
