/**
 * Modelo do Acelerato (briefing 3.2 e 3.4). Nenhum tipo é compartilhado com o BusinessMap
 * além de primitivos e dos domínios fechados de `contracts/comum`.
 */
import type {
  EquipeSustentacao,
  MotivoEncerramento,
  MotivoEscalacao,
  NivelResolucao,
  Prioridade,
  VersaoCriterio,
} from '@/contracts/comum'

export type EtapaAcelerato =
  | 'Novo'
  | 'Em triagem'
  | 'Em diagnóstico'
  | 'Em atendimento N1'
  | 'Aguardando atribuição'
  | 'Em atendimento N2'
  | 'Em atendimento N3'
  | 'Pendente'
  | 'Aguardando validação'
  | 'Encerrado'
  | 'Arquivar'

export type MotivoPendencia =
  | 'Aguardando fornecedor'
  | 'Aguardando solicitante'
  | 'Aguardando área vinculada'
  | 'Aguardando janela de mudança'

export interface Chamado {
  chamado_id: string
  organizacao: 'DSPD Sustentação'
  tipo_fila: 'DSPD - SSSC'
  equipe: EquipeSustentacao
  natureza: 'incidente' | 'requisicao'
  categoria_sistema: string
  excluido: boolean
  status: 'Concluído' | 'Aberto'
  impacto: 'Alto' | 'Médio' | 'Baixo'
  urgencia: 'Alta' | 'Média' | 'Baixa'
  prioridade: Prioridade
  prioridade_ajustada_manualmente: boolean
  justificativa_ajuste: string | null
  aberto_em: number
  primeiro_atendimento_em: number | null
  restaurado_em: number | null
  data_finalizado: number | null
  status_sla_r: 'REALIZADO_NO_PRAZO' | 'REALIZADO_APOS_VENCIMENTO' | null
  /** Nome hipotético (P5): SLA do primeiro atendimento. */
  status_sla_pa: 'NO_PRAZO' | 'APOS_VENCIMENTO' | null
  motivo_escalacao: MotivoEscalacao | null
  motivo_pendencia_atual: MotivoPendencia | null
  previsao_retorno: number | null
  motivo_encerramento: MotivoEncerramento | null
  avaliacao_problema: 'Aberto' | 'Não aplicável' | null
  excecao_sla_registro_posterior: boolean
  incidente_critico_coordenado: boolean
  nivel_resolucao: NivelResolucao | null
}

export interface EtapaChamado {
  chamado_id: string
  etapa: EtapaAcelerato
  entrada: number
  saida: number | null
  motivo_pendencia: MotivoPendencia | null
}

/** Prazos da matriz de prioridade (briefing 3.4), em horas úteis. P1 = 15 min / 4 h. */
export interface AlvoPrioridade {
  prioridade: Prioridade
  primeiro_atendimento_horas: number
  restauracao_horas: number
}

export interface ConfigAC {
  alvos: AlvoPrioridade[]
  criterios: VersaoCriterio[]
}

export interface BaseAC {
  chamados: Chamado[]
  etapas: EtapaChamado[]
  config: ConfigAC
}

/** Matriz Impacto x Urgência. */
export const MATRIZ_PRIORIDADE: Record<
  Chamado['impacto'],
  Record<Chamado['urgencia'], Prioridade>
> = {
  Alto: { Alta: 'P1', Média: 'P2', Baixa: 'P3' },
  Médio: { Alta: 'P2', Média: 'P3', Baixa: 'P4' },
  Baixo: { Alta: 'P3', Média: 'P4', Baixa: 'P5' },
}

/** 8 h úteis por dia: 1 dia útil = 8 h. */
export const ALVOS_PADRAO: AlvoPrioridade[] = [
  { prioridade: 'P1', primeiro_atendimento_horas: 0.25, restauracao_horas: 4 },
  { prioridade: 'P2', primeiro_atendimento_horas: 0.5, restauracao_horas: 8 },
  { prioridade: 'P3', primeiro_atendimento_horas: 2, restauracao_horas: 16 },
  { prioridade: 'P4', primeiro_atendimento_horas: 4, restauracao_horas: 40 },
  { prioridade: 'P5', primeiro_atendimento_horas: 8, restauracao_horas: 80 },
]
