/**
 * Modelo analítico do BusinessMap (briefing 4.5) mais as extensões marcadas `// extensão`
 * (campos de 4.4 e necessidades do núcleo). Instantes em epoch ms; datas civis em AAAA-MM-DD.
 * `responsaveis` e `usuario` existem só por fidelidade ao 4.5: NENHUMA função da biblioteca
 * agrega, filtra ou devolve por pessoa.
 */
import type {
  ClasseServico,
  FaseDeteccao,
  Granularidade,
  MotivoBloqueio,
  OrigemDemanda,
  ResponsabilidadeAtraso,
  TipoCard,
  VersaoCriterio,
} from '@metricas-dspd/contratos'

export interface DimCard {
  card_id: string
  titulo: string // extensão (fictício; a UI mostra código e título)
  tipo: TipoCard
  classe_servico: ClasseServico
  sistema: string
  area_solicitante: string
  fornecedor: string | null
  objetivo_estrategico: string | null
  card_pai: string | null
  criado_em: number
  comprometido_em: number | null
  iniciado_em: number | null
  concluido_em: number | null
  arquivado_em: number | null
  motivo_descarte: string | null
  responsaveis: string[]
  tamanho_declarado: 'P' | 'M' | 'G' | null
  // extensões 4.4 / necessidades do núcleo
  granularidade: Granularidade
  equipe: string
  quadro_id: string
  coluna_atual: string | null
  excluido_em: number | null
  eh_subtarefa: boolean
  data_acordada: number | null
  responsabilidade_atraso: ResponsabilidadeAtraso | null
  origem_demanda: OrigemDemanda | null
  fase_deteccao: FaseDeteccao | null
  severidade: 'Crítica' | 'Alta' | 'Média' | 'Baixa' | null
  origem_bug: string | null
  /** T1.7: frente criada depois do início da execução do projeto pai. */
  adicionado_apos_inicio_pai: boolean
}

export interface FatoTransicao {
  card_id: string
  coluna_origem: string | null
  coluna_destino: string
  tipo_coluna: 'fila' | 'execucao'
  usuario: string
  timestamp: number
  direcao: 'avanco' | 'retorno'
}

export interface FatoBloqueio {
  card_id: string
  motivo: MotivoBloqueio
  coluna_em_que_bloqueou: string
  fornecedor: string | null
  inicio: number
  fim: number | null
  duracao_horas_uteis: number | null
}

/** Papel da coluna no fluxo (apoio ao cálculo dos marcos de 4.1). */
export type PapelColuna = 'backlog' | 'compromisso' | 'trabalho' | 'homologacao' | 'entrega'

export interface DimColuna {
  quadro_id: string
  coluna: string
  tipo_coluna: 'fila' | 'execucao'
  papel: PapelColuna
  ordem: number
  limite_wip: number | null
}

export interface FichaResultado {
  card_id: string // iniciativa
  resultado_esperado: string
  declarado_antes_do_inicio: boolean
  unidade: string
  ganho_previsto: number
  ganho_medido: number | null
  medida: string
  data_declaracao: string
}

export interface AlocacaoAcordada {
  natureza: 'Sustentação' | 'Evolução' | 'Projetos' | 'Dívida técnica'
  pct: number
}

export interface SlePublicado {
  classe: ClasseServico
  dias_uteis: number | null // null = sem SLE (Intangível)
  publicado_em: string
}

export interface ConfigBM {
  /** Limite de WIP do fluxo por equipe (nome da equipe). */
  limite_wip_fluxo: Record<string, number>
  limite_frentes: number
  sle: SlePublicado[]
  alocacao: AlocacaoAcordada[]
  objetivos: string[]
  criterios: VersaoCriterio[]
  equipes: { nome: string; sistemas: string[] }[]
  sistemas: string[]
  areas_internas: string[]
}

export interface BaseBM {
  cards: DimCard[]
  transicoes: FatoTransicao[]
  bloqueios: FatoBloqueio[]
  colunas: DimColuna[]
  fichas: FichaResultado[]
  config: ConfigBM
}

/** Colunas padrão dos quadros. Fila começa com "Aguardando" ou "Pronto para" (4.2). */
export const COLUNAS_TIME = [
  { coluna: 'Aguardando priorização', tipo_coluna: 'fila', papel: 'backlog' },
  { coluna: 'Pronto para desenvolver', tipo_coluna: 'fila', papel: 'compromisso' },
  { coluna: 'Em desenvolvimento', tipo_coluna: 'execucao', papel: 'trabalho' },
  { coluna: 'Aguardando revisão', tipo_coluna: 'fila', papel: 'trabalho' },
  { coluna: 'Em revisão', tipo_coluna: 'execucao', papel: 'trabalho' },
  { coluna: 'Em teste', tipo_coluna: 'execucao', papel: 'trabalho' },
  { coluna: 'Aguardando homologação', tipo_coluna: 'fila', papel: 'trabalho' },
  { coluna: 'Em homologação', tipo_coluna: 'execucao', papel: 'homologacao' },
  { coluna: 'Entregue', tipo_coluna: 'execucao', papel: 'entrega' },
] as const satisfies readonly Omit<DimColuna, 'quadro_id' | 'ordem' | 'limite_wip'>[]

export const COLUNAS_COORDENACAO = [
  { coluna: 'Aguardando priorização', tipo_coluna: 'fila', papel: 'backlog' },
  { coluna: 'Pronto para iniciar', tipo_coluna: 'fila', papel: 'compromisso' },
  { coluna: 'Em execução', tipo_coluna: 'execucao', papel: 'trabalho' },
  { coluna: 'Entregue', tipo_coluna: 'execucao', papel: 'entrega' },
] as const satisfies readonly Omit<DimColuna, 'quadro_id' | 'ordem' | 'limite_wip'>[]

export const COLUNAS_GERENCIA = [
  { coluna: 'Pronto para iniciar', tipo_coluna: 'fila', papel: 'compromisso' },
  { coluna: 'Em execução', tipo_coluna: 'execucao', papel: 'trabalho' },
  { coluna: 'Entregue', tipo_coluna: 'execucao', papel: 'entrega' },
] as const satisfies readonly Omit<DimColuna, 'quadro_id' | 'ordem' | 'limite_wip'>[]
