import type {
  FaixaDiario,
  FlagQualidade,
  NivelMatriz,
  PctComPiso,
  PessoaRef,
  RespostaApontamento as RespostaContrato,
} from '@metricas-dspd/contratos'

export {
  FAIXAS_DIARIO,
  FLAGS_QUALIDADE,
  NIVEIS_MATRIZ,
  PESSOA_OUTRA_AREA,
  respostaApontamentoSchema,
} from '@metricas-dspd/contratos'
export type { FaixaDiario, FlagQualidade, NivelMatriz, PctComPiso, PessoaRef }

/**
 * Tipos da aba Apontamento. A resposta é o contrato zod v1 da trilha B (`packages/contratos`), importado e nunca
 * redeclarado; aqui ficam só os tipos da consulta e da fonte, que são do front.
 */

export type DataCivil = string // AAAA-MM-DD
export type MesCivil = string // AAAA-MM
export type FiltroQualidade = FlagQualidade | 'completo'

export interface ConsultaApontamento {
  de?: DataCivil
  ate?: DataCivil
  pessoa?: PessoaRef[]
  projeto?: string[]
  tipo?: string[]
  subtarefa?: string[]
  subgrupo?: string[]
  qualidade?: FiltroQualidade[]
  nivelMatriz: NivelMatriz
  diarioDe?: DataCivil
  diarioAte?: DataCivil
  anomalos: 'incluir' | 'ocultar'
}

export type RespostaApontamento = RespostaContrato
export type OpcoesApontamento = RespostaApontamento['opcoes']
export type Opcao = OpcoesApontamento['tipos'][number]
export type PessoaApontamento = OpcoesApontamento['pessoas'][number]
export type KpisApontamento = RespostaApontamento['kpis']
export type DistribuicaoApontamento = RespostaApontamento['distribuicao']
export type LinhaDistribuicao = DistribuicaoApontamento['porProjeto'][number]
export type QualidadeApontamento = RespostaApontamento['qualidade']
export type QualidadePorFlag = QualidadeApontamento['geral']['porFlag'][number]
export type MatrizApontamento = RespostaApontamento['matriz']
export type CapacidadeApontamento = RespostaApontamento['capacidade']
export type DiarioApontamento = RespostaApontamento['diario']
export type AchadoApontamento = RespostaApontamento['achados'][number]

/** Fonte da aba: a rota `GET /api/apontamento` (ou, nos testes, uma fixture tipada). */
export interface FonteApontamento {
  buscar: (consulta: ConsultaApontamento, signal?: AbortSignal) => Promise<RespostaApontamento>
  /** `true` só quando a rota aceita o filtro por tipo; enquanto responder 422 o filtro fica oculto. */
  filtroTipoDisponivel?: (signal?: AbortSignal) => Promise<boolean>
}
