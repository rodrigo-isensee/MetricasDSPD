import type { MarcacaoCriterio, SeloFrescor, Taxa } from '@metricas-dspd/contratos'

/**
 * Tipos locais da aba Apontamento, idênticos ao contrato zod v1 (§3.9 do plano 059), exceto
 * `AchadoApontamento.valores`, que é uma união discriminada por `codigo` com as chaves do documento de
 * textos do UX. Trocados pelo import de `packages/contratos` quando a branch da trilha B o tiver (C2).
 */

/** `p` + inteiro: chave opaca de pessoa (`dim_responsavel.pessoa_ref`). Nunca nome nem `user_id`. */
export type PessoaRef = string
export type DataCivil = string // AAAA-MM-DD
export type MesCivil = string // AAAA-MM

export const FLAGS_QUALIDADE = [
  'sem-comentario',
  'generico',
  'sem-vinculo',
  'sem-iniciativa',
  'valor-atipico',
] as const
export type FlagQualidade = (typeof FLAGS_QUALIDADE)[number]
export type FiltroQualidade = FlagQualidade | 'completo'

export const NIVEIS_MATRIZ = ['tipo', 'subtarefa', 'subgrupo'] as const
export type NivelMatriz = (typeof NIVEIS_MATRIZ)[number]

export const FAIXAS_DIARIO = ['zero', 'ate-4h', '4h-a-8h', 'mais-de-8h'] as const
export type FaixaDiario = (typeof FAIXAS_DIARIO)[number]

/** Percentual com piso de 20 (o3): abaixo do mínimo não há `pct`, só a contagem `n`. */
export type PctComPiso =
  { status: 'ok'; n: number; pct: number } | { status: 'insuficiente'; n: number; minimo: 20 }

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

export interface Opcao {
  id: string
  rotulo: string
}

export interface PessoaApontamento {
  pessoaRef: PessoaRef
  /** Nome real só com `APONTAMENTO_NOMES` ligado; senão "Pessoa n". Sem de-para: "Pessoa não identificada". */
  rotulo: string
  identificada: boolean
}

export interface LinhaDistribuicao {
  id: string
  rotulo: string
  segundos: number
  apontamentos: number
  participacao: PctComPiso
  foraDoEscopo?: boolean
}

export interface KpisApontamento {
  segundos: number
  apontamentos: number
  pessoasAtivas: number
  completos: Taxa
  atipicos: number
}

export interface DistribuicaoApontamento {
  base: { n: number; unidade: 'apontamentos' }
  porProjeto: LinhaDistribuicao[]
  porTipo: LinhaDistribuicao[]
  porSubgrupo: LinhaDistribuicao[]
}

export interface QualidadePorFlag {
  flag: FlagQualidade
  apontamentos: number
  pct: PctComPiso
}

export interface QualidadeApontamento {
  geral: { completos: Taxa; porFlag: QualidadePorFlag[] }
  porPessoa: {
    pessoaRef: PessoaRef
    apontamentos: number
    completos: Taxa
    porFlag: QualidadePorFlag[]
  }[]
  flagsNaoExcludentes: true
}

export interface MatrizApontamento {
  nivel: NivelMatriz
  colunas: Opcao[]
  linhas: {
    pessoaRef: PessoaRef
    segundos: number
    apontamentos: number
    celulas: { colunaId: string; segundos: number; participacao: PctComPiso }[]
  }[]
}

export interface CapacidadeApontamento {
  horasPorDiaSegundos: number
  mensal: {
    mes: MesCivil
    capacidadeSegundos: number
    realizadoSegundos: number
    apontamentos: number
    utilizacao: PctComPiso
    /** Mês corrente cortado na última coleta ok. */
    parcialAte: DataCivil | null
  }[]
  porPessoa: {
    pessoaRef: PessoaRef
    inicio: DataCivil
    fim: DataCivil
    diasUteis: number
    capacidadeSegundos: number
    realizadoSegundos: number
    apontamentos: number
    utilizacao: PctComPiso
  }[]
  leituraRelativa: true
}

export interface DiarioApontamento {
  de: DataCivil
  ate: DataCivil
  limiteAtipicoSegundos: number
  dias: { data: DataCivil; util: boolean; feriado: boolean }[]
  linhas: {
    pessoaRef: PessoaRef
    segundos: number
    celulas: { data: DataCivil; segundos: number; faixa: FaixaDiario; atipico: boolean }[]
  }[]
}

/** Achado gerado por regra: código mais números; o front monta a frase. Nunca cita pessoa. */
export type AchadoApontamento = {
  rotuloRef: string | null
} & (
  | { codigo: 'nao-classificado-alto'; valores: { pct: number; n: number } }
  | { codigo: 'sem-comentario-alto'; valores: { pct: number; n: number } }
  | { codigo: 'concentracao-em-projeto'; valores: { pct: number } }
  | { codigo: 'dias-atipicos'; valores: { n: number; limite: number } }
  | {
      codigo: 'utilizacao-mensal-variou'
      valores: { pctAnterior: number; pct: number; mesAnterior: MesCivil; mes: MesCivil }
    }
)

export interface OpcoesApontamento {
  pessoas: PessoaApontamento[]
  projetos: (Opcao & { foraDoEscopo: boolean })[]
  tipos: Opcao[]
  subtarefas: Opcao[]
  subgrupos: Opcao[]
  historico: { inicio: DataCivil; fim: DataCivil }
}

export interface RespostaApontamento {
  versaoContrato: 1
  dominio: 'businessmap'
  periodo: { de: DataCivil; ate: DataCivil }
  frescor: { selo: SeloFrescor; ultimaColetaOk: string | null }
  /** `true` só com `APONTAMENTO_NOMES` ligado: o front mostra o aviso de nome real. */
  nomesReais: boolean
  opcoes: OpcoesApontamento
  kpis: KpisApontamento
  distribuicao: DistribuicaoApontamento
  qualidade: QualidadeApontamento
  matriz: MatrizApontamento
  capacidade: CapacidadeApontamento
  diario: DiarioApontamento
  achados: AchadoApontamento[]
  /** Mudanças de critério com data (T2.6): versões do dicionário e do calendário. */
  criterios: MarcacaoCriterio[]
}

/** Fonte da aba: hoje a fixture; na C2, a rota `GET /api/apontamento`. */
export interface FonteApontamento {
  buscar: (consulta: ConsultaApontamento) => Promise<RespostaApontamento>
}
