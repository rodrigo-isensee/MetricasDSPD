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

/** Vínculo `predecessor` de um card (D-14' = A). `outro_quadro` nulo = quadro do relacionado desconhecido (sem permissão). */
export interface VinculoPredecessor {
  card_id: string
  relacionado_id: string
  tipo: 'predecessor'
  outro_quadro: boolean | null
  /** Instante em que o vínculo passou a existir (derivado das revisões; `fato_vinculo.criado_em`). */
  criado_em: number
  /** Instante da remoção, ou `null` se segue vigente. Remover nunca apaga o evento (R-4). */
  removido_em: number | null
}

/** Datas do projeto concluído (E6): a comprometida no compromisso (D-7), a final e quantas vezes mudou. */
export interface DatasProjeto {
  /** Data comprometida no compromisso (instante, ms). */
  original: number
  /** Data acordada vigente na conclusão (ms). */
  final: number
  replanejamentos: number
}

/**
 * Extensão do pedido 011 só de mock, separada de `ExtensaoBM` para que a base e a montagem do contexto não paguem por ela
 * (ADR 0003, C1 e C2). Na coleta real cada campo vira coluna ou tabela própria (fase 3) e esta extensão não existe.
 * Nenhum campo identifica pessoa: `passagens` já é o inteiro que sai do coletor (ADR 0020) e `primeiroToque` é só o instante.
 */
export interface ExtensaoTambemBM {
  /** T11 (fase 1): o histórico de 24 meses que a base mock não tem. */
  entradasSazonais: EntradaSazonal[]
  /** O22: instante do primeiro comentário humano; `null` = ainda sem toque; ausente = sem dado. */
  primeiroToque: Record<string, number | null>
  /** O26: número de passagens de mão por card entregue (inteiro >= 0); ausente = sem dado. */
  passagens: Record<string, number>
  /** T13: vínculos `predecessor` (só os que a coleta lê; pai/filho e relativo não entram). */
  vinculos: VinculoPredecessor[]
  /** E6: datas dos projetos concluídos; ausente = sem data comprometida registrada. */
  datasProjeto: Record<string, DatasProjeto>
}

export const EXTENSAO_TAMBEM_BM_VAZIA: ExtensaoTambemBM = {
  entradasSazonais: [],
  primeiroToque: {},
  passagens: {},
  vinculos: [],
  datasProjeto: {},
}
