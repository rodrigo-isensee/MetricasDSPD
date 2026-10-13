import type { LinhaPesquisa, VersaoCriterio } from '@metricas-dspd/contratos'

/**
 * Modelo da pesquisa trimestral de percepção (PV1). Só contagens agregadas por trimestre, área, pergunta e
 * faixa: nenhum respondente, comentário ou texto livre (exceto o "o que mudou", escrito pela coordenação).
 * É uma fonte própria: não se mistura com BusinessMap nem com Acelerato.
 */

/** Área atendida (lista fechada `ref_pesq_area`): nome de unidade, nunca de pessoa. */
export interface AreaPesquisa {
  codigo: string
  rotulo: string
}

export interface PerguntaQuestionario {
  codigo: string
  ordem: number
  texto: string
}

/** Versão do questionário. Trocar texto ou escala exige nova versão (T2.6). */
export interface VersaoQuestionario {
  id: string
  /** AAAA-MM-DD */
  vigenteDesde: string
  perguntas: PerguntaQuestionario[]
}

/**
 * Uma carga recebida. Um trimestre pode ter mais de uma (reenvio): a vigente é SEMPRE a de maior `cargaId`
 * (a data de referência só decide se o trimestre já existia); as anteriores ficam guardadas (nunca se sobrescreve
 * histórico), mas nunca são publicadas (anonimato, decisão I-2).
 */
export interface CargaPesquisa {
  cargaId: number
  /** `2026-T3` */
  trimestre: string
  versaoId: string
  /** AAAA-MM-DD */
  recebidaEm: string
  oQueMudou: string | null
  /** Uma linha por área e pergunta (mesmo formato do CSV de carga). */
  linhas: LinhaPesquisa[]
}

export interface BasePesquisa {
  areas: AreaPesquisa[]
  versoes: VersaoQuestionario[]
  cargas: CargaPesquisa[]
  /** Mudanças de critério da pesquisa (`ref_versao_criterio` com `dominio = 'pesquisa'`, T2.6). */
  criterios: VersaoCriterio[]
}

export interface ContextoPesquisa {
  base: BasePesquisa
  /** Data de corte (AAAA-MM-DD): só decide se o trimestre já existia; nunca escolhe uma carga substituída. */
  hojeIso: string
}

/** Contexto da pesquisa a partir da data de corte (ISO com ou sem hora; usa a data civil informada). */
export function criarContextoPesquisa(base: BasePesquisa, hoje: string): ContextoPesquisa {
  return { base, hojeIso: hoje.slice(0, 10) }
}
