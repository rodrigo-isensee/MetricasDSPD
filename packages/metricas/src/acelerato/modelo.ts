/**
 * Modelo do Acelerato (briefing 3.2 e 3.4). Nenhum tipo é compartilhado com o BusinessMap
 * além de primitivos e dos domínios fechados de `contracts/comum`.
 */
import type {
  MotivoEncerramento,
  MotivoEscalacao,
  NivelResolucao,
  Prioridade,
  VersaoCriterio,
} from '@metricas-dspd/contratos'

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

export const MOTIVOS_PENDENCIA = [
  'Aguardando fornecedor',
  'Aguardando solicitante',
  'Aguardando área vinculada',
  'Aguardando janela de mudança',
] as const
export type MotivoPendencia = (typeof MOTIVOS_PENDENCIA)[number]

export interface Chamado {
  chamado_id: string
  organizacao: 'DSPD Sustentação'
  tipo_fila: 'DSPD - SSSC'
  equipe: string
  natureza: 'incidente' | 'requisicao'
  categoria_sistema: string
  excluido: boolean
  status: 'Concluído' | 'Aberto'
  impacto: 'Alto' | 'Médio' | 'Baixo'
  urgencia: 'Alta' | 'Média' | 'Baixa'
  prioridade?: Prioridade
  prioridade_ajustada_manualmente: boolean
  justificativa_ajuste: string | null
  /** Indicador derivado "justificativa preenchida", para quando o texto não está disponível (S7; o banco não guarda o texto). */
  justificativa_informada?: boolean
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

/** Relógio em que o prazo é medido: `corrido` (24 h por dia, sem feriado) ou `util` (calendário de expediente). */
export type UnidadePrazo = 'corrido' | 'util'

/**
 * Prazos da matriz de prioridade (PROC 30.000.010 v002), em horas, cada um com a unidade (Q-099-11). P1 = 15 min / 4 h. Dia útil = 8 h
 * (os prazos em dias úteis vêm já em horas).
 */
export interface AlvoPrioridade {
  prioridade: Prioridade
  primeiro_atendimento_horas: number
  unidade_primeiro_atendimento: UnidadePrazo
  restauracao_horas: number
  unidade_restauracao: UnidadePrazo
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

/** 8 h úteis por dia: 1 dia útil = 8 h. Unidades da Q-099-11: P1 (os dois prazos) e P2 (primeiro atendimento) em tempo corrido. */
export const ALVOS_PADRAO: AlvoPrioridade[] = [
  { prioridade: 'P1', primeiro_atendimento_horas: 0.25, unidade_primeiro_atendimento: 'corrido', restauracao_horas: 4, unidade_restauracao: 'corrido' },
  { prioridade: 'P2', primeiro_atendimento_horas: 0.5, unidade_primeiro_atendimento: 'corrido', restauracao_horas: 8, unidade_restauracao: 'util' },
  { prioridade: 'P3', primeiro_atendimento_horas: 2, unidade_primeiro_atendimento: 'util', restauracao_horas: 16, unidade_restauracao: 'util' },
  { prioridade: 'P4', primeiro_atendimento_horas: 4, unidade_primeiro_atendimento: 'util', restauracao_horas: 40, unidade_restauracao: 'util' },
  { prioridade: 'P5', primeiro_atendimento_horas: 8, unidade_primeiro_atendimento: 'util', restauracao_horas: 80, unidade_restauracao: 'util' },
]

/** Predicado único de "justificado" (R6): campo preenchido e não vazio; texto só com espaços NÃO conta. Usado pela S7 e pelo seed/coletor. */
export const justificativaInformada = (texto: string | null): boolean =>
  texto !== null && texto.trim() !== ''
