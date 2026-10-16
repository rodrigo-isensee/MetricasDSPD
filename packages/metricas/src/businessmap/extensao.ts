/**
 * Extensão do modelo do BusinessMap para as métricas complementares (plano
 * `metricas-complementares.md` §2). Campos que ainda não existem na coleta real: ficam FORA de
 * `DimCard`/`BaseBM` (mapas por id), para que as 33 métricas do núcleo e o hash da base mock não
 * mudem. Fonte real futura: tabelas próprias (T1.3, T1.4, T4.2). Nenhum campo identifica pessoa.
 */
import type { NaturezaProjeto, TipoCard } from '@metricas-dspd/contratos'

/** Sprint = card-template pai no BusinessMap; as entregas são os cards filhos ligados a ele. */
export interface Sprint {
  /** card_id do card-template pai. */
  sprint_id: string
  nome: string
  /** AAAA-MM-DD, inclusivo. */
  inicio: string
  fim: string
}

/** Card filho ligado ao pai da sprint. */
export interface SprintCard {
  card_id: string
  sprint_id: string
  /** AAAA-MM-DD em que o filho foi ligado ao pai. Depois do início da sprint = entrada não planejada. */
  ligado_em: string
}

export interface ExtensaoBM {
  sprints: Sprint[]
  sprintCards: SprintCard[]
  /** card_id (projeto) -> natureza. */
  naturezaProjeto: Record<string, NaturezaProjeto>
}

export const EXTENSAO_BM_VAZIA: ExtensaoBM = {
  sprints: [],
  sprintCards: [],
  naturezaProjeto: {},
}

/** Uma demanda que entrou: só o necessário para contar por mês e filtrar (T11). Nenhum campo de pessoa. */
export interface EntradaSazonal {
  /** Instante de criação (ms), o marco de entrada (T1.5). */
  criado_em: number
  tipo: TipoCard
  /** Nome da equipe e do sistema, como no `DimCard` (o filtro compara pelo slug). */
  equipe: string
  sistema: string
}

/**
 * Extensão do pedido 011 (fase 1) só de mock: o histórico de 24 meses que a base mock (18 meses) não tem. Fica separada
 * de `ExtensaoBM` para que a base e a montagem do contexto não paguem por ela (ADR 0003, C1 e C2). Na coleta real o
 * T11 lê `dim_card` e esta extensão não existe. Os outros campos entram com as métricas da fase 2.
 */
export interface ExtensaoTambemBM {
  entradasSazonais: EntradaSazonal[]
}

export const EXTENSAO_TAMBEM_BM_VAZIA: ExtensaoTambemBM = { entradasSazonais: [] }
