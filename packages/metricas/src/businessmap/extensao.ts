/**
 * Extensão do modelo do BusinessMap para as métricas complementares (plano
 * `metricas-complementares.md` §2). Campos que ainda não existem na coleta real: ficam FORA de
 * `DimCard`/`BaseBM` (mapas por id), para que as 33 métricas do núcleo e o hash da base mock não
 * mudem. Fonte real futura: tabelas próprias (T1.3, T1.4, T4.2). Nenhum campo identifica pessoa.
 */
import type { NaturezaProjeto } from '@metricas-dspd/contratos'

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
