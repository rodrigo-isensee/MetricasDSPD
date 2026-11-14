import { z } from 'zod'
import {
  EQUIPES_SUSTENTACAO,
  PRIORIDADES,
  TIPOS_FILTRO,
  periodoSchema,
  type EquipeSustentacao,
  type Prioridade,
} from './comum'

/**
 * Ids ANTIGOS das três equipes de sustentação (antes do 097 L7a). A equipe agora é texto/slug vindo do dado real
 * (`dim_chamado.equipe`, id = slug do nome); estes ids seguem aceitos como apelido por um ciclo de release.
 */
export const EQUIPES_SUSTENTACAO_ID = ['totvs', 'senior', 'fluig'] as const
export type EquipeSustentacaoId = (typeof EQUIPES_SUSTENTACAO_ID)[number]

/** Apelido dos ids antigos para o slug do nome real (`slug('SSSC TOTVS')`). */
export const APELIDO_EQUIPE_SUSTENTACAO: Record<EquipeSustentacaoId, string> = {
  totvs: 'sssc-totvs',
  senior: 'sssc-senior',
  fluig: 'sssc-fluig',
}

/** Resolve o apelido antigo para o slug real; qualquer outro id passa como está. */
export const idEquipeSustentacao = (id: string): string =>
  (APELIDO_EQUIPE_SUSTENTACAO as Record<string, string | undefined>)[id] ?? id

export const NOME_EQUIPE_SUSTENTACAO: Record<EquipeSustentacaoId, EquipeSustentacao> = {
  totvs: 'SSSC TOTVS',
  senior: 'SSSC SENIOR',
  fluig: 'SSSC FLUIG',
}

export const tipoFiltroSchema = z.enum(TIPOS_FILTRO)
export type TipoFiltro = z.infer<typeof tipoFiltroSchema>

/** Ids dos tipos de demanda na URL e nas opções de filtro (spec de UX 2.5). */
export const TIPO_ID: Record<TipoFiltro, string> = {
  Incidente: 'incidente',
  Requisição: 'requisicao',
  Melhoria: 'melhoria',
  'Bug interno': 'bug-interno',
  'Defeito em produção': 'defeito-producao',
  'Dívida técnica': 'divida-tecnica',
  'Trabalho de produto': 'trabalho-produto',
}

/**
 * Filtros do fluxo (BusinessMap). Lista vazia = "Todos" (padrão). Equipe e sistema são ids
 * (slugs) vindos de `OpcoesFiltro`. Várias equipes = resultado consolidado, nunca comparação.
 */
export const filtrosFluxoSchema = z.object({
  equipe: z.array(z.string()),
  tipo: z.array(tipoFiltroSchema),
  sistema: z.array(z.string()),
  periodo: periodoSchema,
})
export type FiltrosFluxo = z.infer<typeof filtrosFluxoSchema>

/** Filtros da sustentação (Acelerato). Tipo distinto do fluxo de propósito. Sem filtro por agente. */
export const filtrosSustentacaoSchema = z.object({
  /** Slugs do nome da equipe (`dim_chamado.equipe`); os ids antigos (`totvs`...) seguem aceitos. */
  equipe: z.array(z.string()),
  prioridade: z.array(z.enum(PRIORIDADES)),
  periodo: periodoSchema,
})
export type FiltrosSustentacao = z.infer<typeof filtrosSustentacaoSchema>

export const PERIODOS_PADRAO = ['4s', '12s', '6m', '12m'] as const
export type PeriodoPadrao = (typeof PERIODOS_PADRAO)[number]

export interface OpcaoFiltro {
  id: string
  nome: string
}

export interface OpcoesFiltroFluxo {
  dominio: 'businessmap'
  equipes: OpcaoFiltro[]
  tipos: OpcaoFiltro[]
  sistemas: OpcaoFiltro[]
  /** Setores (id = slug do nome sem sobrenome), ordem alfabética; vazio até o dono mapear os quadros (097, L10a). */
  setores?: OpcaoFiltro[] | undefined
  /** Datas limite para o período personalizado (AAAA-MM-DD). */
  historico: { inicio: string; fim: string }
}

export interface OpcoesFiltroSustentacao {
  dominio: 'acelerato'
  equipes: OpcaoFiltro[]
  prioridades: OpcaoFiltro[]
  historico: { inicio: string; fim: string }
}

export type OpcoesFiltro = OpcoesFiltroFluxo | OpcoesFiltroSustentacao

export type { Prioridade }
export { EQUIPES_SUSTENTACAO }
