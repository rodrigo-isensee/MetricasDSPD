/**
 * Extensão do modelo do BusinessMap para as métricas complementares (plano
 * `metricas-complementares.md` §2). Campos que ainda não existem na coleta real: ficam FORA de
 * `DimCard`/`BaseBM` (mapas por id), para que as 33 métricas do núcleo e o hash da base mock não
 * mudem. Fonte real futura: tabelas próprias (T1.3, T1.4, T4.2). Nenhum campo identifica pessoa.
 */
import type { CausaRaiz, NaturezaProjeto } from '@metricas-dspd/contratos'

export interface Sprint {
  sprint_id: string
  /** AAAA-MM-DD, inclusivo. */
  inicio: string
  fim: string
}

export interface SprintCard {
  card_id: string
  sprint_id: string
  /** false = entrou na sprint depois do início (entrada não planejada). */
  planejado_na_entrada: boolean
  entregue: boolean
}

export interface ExtensaoBM {
  /** card_id (bug) -> causa raiz. */
  causasRaiz: Record<string, CausaRaiz>
  sprints: Sprint[]
  sprintCards: SprintCard[]
  /** card_id (projeto) -> natureza. */
  naturezaProjeto: Record<string, NaturezaProjeto>
}

export const EXTENSAO_BM_VAZIA: ExtensaoBM = {
  causasRaiz: {},
  sprints: [],
  sprintCards: [],
  naturezaProjeto: {},
}
