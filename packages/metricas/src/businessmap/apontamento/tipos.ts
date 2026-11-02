import type { Calendario } from '../../core/calendario'
import type {
  ConsultaApontamento,
  FlagQualidade,
  NivelMatriz,
  PessoaApontamento,
  PessoaRef,
} from '@metricas-dspd/contratos'

/** Dimensão com id estável e rótulo de tela (projeto, tipo de card, subgrupo, subtarefa). Nunca texto livre do usuário. */
export interface DimApontamento {
  id: string
  rotulo: string
}

/**
 * Um apontamento já projetado (`fato_apontamento` com as dimensões resolvidas). Sem comentário, sem `user_id` e sem
 * título de subtarefa: só a chave opaca de pessoa, que é `null` depois do pedido de eliminação (as horas seguem no
 * agregado do time e saem dos blocos por pessoa).
 */
export interface LinhaApontamento {
  pessoaRef: PessoaRef | null
  /** AAAA-MM-DD (America/Sao_Paulo). */
  data: string
  /** Segundos inteiros, maiores que 0 (C-3). */
  segundos: number
  tipo: DimApontamento
  /** Raiz da hierarquia (`dim_card_raiz`); o rótulo é o título da raiz. `foraDoEscopo`: raiz fora dos quadros (Q-A7). */
  projeto: DimApontamento & { foraDoEscopo: boolean }
  subgrupo: DimApontamento
  /** `em-subtarefa` ou `direto-no-card` (dicionário fechado, C-2 do plano). */
  subtarefa: DimApontamento
  /** Card sem iniciativa (C-9, Q-A8): vira a flag `sem-iniciativa`. */
  semIniciativa: boolean
  /** Flags decididas na classificação (`sem-comentario`, `generico`, `sem-vinculo`); o resto é derivado aqui. */
  flags: readonly FlagQualidade[]
}

export type FiltrosApontamento = Pick<
  ConsultaApontamento,
  'pessoa' | 'projeto' | 'tipo' | 'subtarefa' | 'subgrupo' | 'qualidade' | 'anomalos'
>

export interface EntradaApontamento {
  /** Todas as linhas do período e da janela do diário, SEM filtro (o valor atípico é do dia inteiro da pessoa). */
  linhas: readonly LinhaApontamento[]
  periodo: { de: string; ate: string }
  diario: { de: string; ate: string }
  filtros: FiltrosApontamento
  nivelMatriz: NivelMatriz
  /** Calendário montado da referência com feriados (`criarCalendario({ feriados })`). */
  calendario: Calendario
  /** Soma do dia da pessoa acima disto vira `valor-atipico` (proposta do UX: 16 h). */
  limiteAtipicoSegundos: number
  /** Data (AAAA-MM-DD) da última coleta bem-sucedida: o mês corrente corta nela (C-7). `null` = sem corte. */
  ultimaColetaOk: string | null
  /** Rótulos de pessoa para a ordem neutra (o1). */
  pessoas: readonly PessoaApontamento[]
  nomesReais: boolean
  limiares?: Partial<LimiaresAchado>
}

/**
 * Limiares dos achados gerados (M-1 do UX, CA-11). PROVISÓRIOS: a especificação do dono não define o que é "alto";
 * os valores abaixo são proposta técnica, ficam numa constante única e viram pergunta ao dono (`R-DECISAO`).
 */
export interface LimiaresAchado {
  /** `nao-classificado-alto`: parte das horas em "Não classificado" a partir da qual o achado sai (%). */
  naoClassificadoPct: number
  /** `sem-comentario-alto`: parte dos apontamentos sem comentário a partir da qual o achado sai (%). */
  semComentarioPct: number
  /** `concentracao-em-projeto`: parte das horas num só projeto a partir da qual o achado sai (%). */
  concentracaoPct: number
  /** `dias-atipicos`: número mínimo de dias (pessoa e dia) atípicos. */
  diasAtipicos: number
  /** `utilizacao-mensal-variou`: variação mínima, em pontos percentuais, entre os dois últimos meses. */
  variacaoUtilizacaoPp: number
}
