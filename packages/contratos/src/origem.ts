/**
 * Origem de cada métrica (plano 052, F6, H-13): `real` = dado da base alimentada pela coleta (BusinessMap no fluxo, Acelerato na
 * sustentação); `mock` = dado fictício (base do seed). Cada métrica vem inteira de UMA origem; nunca se misturam.
 * Fonte única do selo "Dados fictícios" por cartão, da contagem do cabeçalho e do Exportar (P-1 e P-4).
 */
import { z } from 'zod'
import type { MetricaId } from './comum'

export type OrigemDaMetrica = 'real' | 'mock'

/** Métricas com dado real: o painel operacional com dado no quadro (H-13: as 11 do FL1 e a Espera invisível do FL1) e a sustentação carregada do Acelerato. */
export const METRICAS_ORIGEM_REAL: ReadonlySet<MetricaId> = new Set<MetricaId>([
  'O1',
  'O2',
  'O3',
  'O4',
  'O5',
  'O6',
  'O7',
  'O9',
  'O10',
  'O11',
  'O13',
  'EI_FL1',
  // Sustentação (E2.115 e E2.117, plano 056 §3): as que o plano calcula só com o dado do Acelerato já carregado (S2, S3, S4, S8, S10). S9 e S12 voltaram a mock: dependem de campo que a base real não tem.
  'S2',
  'S3',
  'S4',
  'S8',
  'S10',
])

export const MOTIVO_AGUARDANDO_CAMPO = 'aguardando campo no quadro'

export const MOTIVO_AGUARDANDO_CAMPO_CHAMADO =
  'aguardando tipo e domínio do campo do chamado (P-DS-19)'
export const MOTIVO_S9_MOTIVO_PENDENCIA =
  'aguardando o motivo de pendência do chamado (tipo e domínio, P-DS-19)'
export const MOTIVO_S12_REGISTRO_POSTERIOR =
  'aguardando fonte do registro posterior de exceção de SLA'
export const MOTIVO_AGUARDANDO_PRAZOS_SLA = 'aguardando prazos de SLA por prioridade'
export const MOTIVO_CALCULO_NAO_DEFINIDO = 'cálculo ainda não definido para o Acelerato'

/**
 * Fictícias com motivo. FL1: campo ainda por criar na WS1 (H-13); O19 a O26 seguem mock até a F6b, sem motivo próprio.
 * Sustentação (plano 056): S5, S6, S7 e S11 esperam o tipo e o domínio dos campos do chamado (P-DS-19); S9 espera o motivo de
 * pendência (P-DS-19) e S12 o registro posterior de exceção de SLA, sem fonte (decisão do dono de 2026-11-01 17:30: se faltar campo,
 * segue fictícia); S1 espera os prazos de SLA por
 * prioridade (`ref_alvo_prioridade`, sem fonte na base real); a EI_SUST não consta do plano 056, então não se calcula por inferência.
 */
export const MOTIVO_ORIGEM_MOCK: Partial<Record<MetricaId, string>> = {
  O8: MOTIVO_AGUARDANDO_CAMPO,
  O12: MOTIVO_AGUARDANDO_CAMPO,
  O14: MOTIVO_AGUARDANDO_CAMPO,
  O15: MOTIVO_AGUARDANDO_CAMPO,
  O16: MOTIVO_AGUARDANDO_CAMPO,
  O17: MOTIVO_AGUARDANDO_CAMPO,
  O18: MOTIVO_AGUARDANDO_CAMPO,
  S1: MOTIVO_AGUARDANDO_PRAZOS_SLA,
  S5: MOTIVO_AGUARDANDO_CAMPO_CHAMADO,
  S6: MOTIVO_AGUARDANDO_CAMPO_CHAMADO,
  S7: MOTIVO_AGUARDANDO_CAMPO_CHAMADO,
  S9: MOTIVO_S9_MOTIVO_PENDENCIA,
  S11: MOTIVO_AGUARDANDO_CAMPO_CHAMADO,
  S12: MOTIVO_S12_REGISTRO_POSTERIOR,
  EI_SUST: MOTIVO_CALCULO_NAO_DEFINIDO,
}

export function origemDaMetrica(id: MetricaId): OrigemDaMetrica {
  return METRICAS_ORIGEM_REAL.has(id) ? 'real' : 'mock'
}

/** Motivo do dado fictício, quando o mapa guarda um; null para métrica real ou sem motivo registrado. */
export function motivoDaOrigemMock(id: MetricaId): string | null {
  return origemDaMetrica(id) === 'mock' ? (MOTIVO_ORIGEM_MOCK[id] ?? null) : null
}

/** Notas que o cartão mostra por indicação do contrato (H-15 e H-24). Os textos vivem só aqui. */
export const TEXTO_NOTA_CARTAO = {
  'sem-classe': 'Sem separação por classe até o quadro ter o campo.',
  'sle-nao-definido': 'SLE não definido.',
} as const
export type NotaCartaoId = keyof typeof TEXTO_NOTA_CARTAO
export const NOTA_CARTAO_IDS = [
  'sem-classe',
  'sle-nao-definido',
] as const satisfies readonly NotaCartaoId[]
export const notaCartaoIdSchema = z.enum(NOTA_CARTAO_IDS)

/** Notas fixas por métrica (H-15: O6 e SLE, o T2). A do O3 (H-24) é dinâmica: vem no resultado (`notas`). */
export const NOTAS_FIXAS_DO_CARTAO: Partial<Record<MetricaId, readonly NotaCartaoId[]>> = {
  O6: ['sem-classe'],
  T2: ['sem-classe'],
}
