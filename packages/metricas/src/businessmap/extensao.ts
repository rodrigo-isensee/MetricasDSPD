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

/** Datas do projeto concluído (E6): a comprometida no compromisso (D-7), a final e quantas vezes mudou. */
export interface DatasProjeto {
  /** Data comprometida no compromisso (instante, ms). */
  original: number
  /** Data acordada vigente na conclusão (ms). */
  final: number
  replanejamentos: number
}

/** Faixa de concentração de um sistema (ADR 0020, item 4): 1, 2 ou 3 (3 = "3 ou mais") pessoas. Nunca o número exato. */
export type FaixaConhecimento = 1 | 2 | 3

/** Linha do agregado `agg_conhecimento_sistema` (E8): gerada direto no mock, sem pessoas. */
export interface ConhecimentoSistema {
  sistema: string
  faixa: FaixaConhecimento
  entregas: number
}

/**
 * Extensão do pedido 011 só de mock, separada de `ExtensaoBM` para que a base e a montagem do contexto não paguem por ela
 * (ADR 0003, C1 e C2). Na coleta real cada campo vira coluna ou tabela própria (fase 3) e esta extensão não existe.
 * Nenhum campo identifica pessoa: `conhecimentoSistema` já é a faixa que sai do coletor (ADR 0020).
 */
export interface ExtensaoTambemBM {
  /** T11 (fase 1): o histórico de 24 meses que a base mock não tem. */
  entradasSazonais: EntradaSazonal[]
  /** E6: datas dos projetos concluídos; ausente = sem data comprometida registrada. */
  datasProjeto: Record<string, DatasProjeto>
  /** E8: faixa de concentração por sistema na janela de 12 meses que termina em "hoje". */
  conhecimentoSistema: ConhecimentoSistema[]
}

export const EXTENSAO_TAMBEM_BM_VAZIA: ExtensaoTambemBM = {
  entradasSazonais: [],
  datasProjeto: {},
  conhecimentoSistema: [],
}
