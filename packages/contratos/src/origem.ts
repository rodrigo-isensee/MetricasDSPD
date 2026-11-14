/**
 * Origem de cada métrica (ADR 0030): `real` = dado da base alimentada pela coleta (BusinessMap no fluxo, Acelerato na
 * sustentação); `sem-dado` = a métrica ainda não tem dado real e o painel mostra o estado "sem dado real" com o motivo.
 * Cada métrica vem inteira de UMA origem; nunca se misturam. Fonte única do estado por cartão, da contagem do cabeçalho e do Exportar.
 */
import { z } from 'zod'
import type { MetricaId } from './comum'

export type OrigemDaMetrica = 'real' | 'sem-dado'

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
  'O19',
  // Pedido 099 (lote A3, E3.43): o O25 Descarte lê o descarte nativo (`motivo_descarte`, `arquivado_em`, `excluido_em`) já na base (Q-RO-2).
  'O25',
  'EI_FL1',
  // Pedido 060 (Q2, decisão do dono de 2026-11-02): a pesquisa de percepção (mostra `sem-pesquisa` enquanto não houver carga).
  // Pedido 075 (lote 6b, K-204): BLOQUEADOS, O5 e O19 voltam ao mapa real com a coleta gravando `fato_bloqueio`. T10 e T12 seguem fora (P-075-11 e P-075-12, "B").
  'BLOQUEADOS',
  'PV1',
  // Sustentação (E2.115 e E2.117, plano 056 §3): as que o plano calcula só com o dado do Acelerato já carregado (S2, S3, S4, S8, S10). S9 voltou a mock: depende de campo que a base real não tem. S12 entrou no pedido 099 (D9) só com o volume.
  'S2',
  'S3',
  'S4',
  'S8',
  'S10',
  // Pedido 099 (E3.20, B' da Q-099-7): o O17 publica por sistema (categoria_sistema) com dado real; a causa raiz segue sem dado real.
  'O17',
  // Pedido 099 (D9): S12 real só com o volume por sistema; reincidência e exceção de SLA por registro posterior saem sem fonte (nulas, com nota).
  'S12',
  // Pedido 077 (L5, K-211): a tendência do fluxo lê só o BusinessMap real.
  'TENDENCIA_FLUXO',
  // Pedido 077 (L7, K-211): a tendência da sustentação lê só o Acelerato real.
  'TENDENCIA_SUST',
])

export const MOTIVO_AGUARDANDO_CAMPO = 'aguardando campo no quadro'

/**
 * Pedido 099 (B' da Q-099-7): motivo da parte por causa raiz do O17. A causa raiz é do Registro de Problemas e a base não tem o
 * vínculo ao incidente; a causa aparente não serve no lugar dela.
 */
export const MOTIVO_O17_CAUSA_RAIZ_SEM_DADO_REAL =
  'aguardando o Registro de Problemas com vínculo ao incidente (a causa aparente não é a causa raiz)'

export const MOTIVO_AGUARDANDO_CAMPO_CHAMADO =
  'aguardando tipo e domínio do campo do chamado (P-DS-19)'
export const MOTIVO_S9_MOTIVO_PENDENCIA =
  'aguardando o motivo de pendência do chamado (tipo e domínio, P-DS-19)'
export const MOTIVO_AGUARDANDO_PRAZOS_SLA = 'aguardando prazos de SLA por prioridade'
export const MOTIVO_CALCULO_NAO_DEFINIDO = 'cálculo ainda não definido para o Acelerato'
/** Pedido 065: interruptor da publicação real dos bloqueios; ligado no pedido 075 (lote 6b) depois da prova de `fato_bloqueio` com linhas reais. */
export const BLOQUEIOS_COM_DADO_REAL = true
/**
 * Pedido 069, L9-a (K-220): interruptor que vira `true`, num PR próprio com versão de critério `afeta = ['S3', 'S7']`, quando
 * `prioridade_ajustada_manualmente` vier da fonte (L9-c) e o dono vir a contagem. Falso: o S3 publica `ajustesManuais: null`.
 */
export const AJUSTE_PRIORIDADE_COM_FONTE = false

/**
 * Fictícias com motivo. FL1: campo ainda por criar na WS1 (H-13); O19 a O26 seguem mock até a F6b, sem motivo próprio.
 * Sustentação (plano 056): S5, S6, S7 e S11 esperam o tipo e o domínio dos campos do chamado (P-DS-19); S9 espera o motivo de
 * pendência (P-DS-19); S1 espera os prazos de SLA por
 * prioridade (`ref_alvo_prioridade`, sem fonte na base real); a EI_SUST não consta do plano 056, então não se calcula por inferência.
 */
export const MOTIVO_ORIGEM_MOCK: Partial<Record<MetricaId, string>> = {
  O8: MOTIVO_AGUARDANDO_CAMPO,
  O12: MOTIVO_AGUARDANDO_CAMPO,
  O14: MOTIVO_AGUARDANDO_CAMPO,
  O15: MOTIVO_AGUARDANDO_CAMPO,
  O16: MOTIVO_AGUARDANDO_CAMPO,
  O18: MOTIVO_AGUARDANDO_CAMPO,
  S1: MOTIVO_AGUARDANDO_PRAZOS_SLA,
  S5: MOTIVO_AGUARDANDO_CAMPO_CHAMADO,
  S6: MOTIVO_AGUARDANDO_CAMPO_CHAMADO,
  S7: MOTIVO_AGUARDANDO_CAMPO_CHAMADO,
  S9: MOTIVO_S9_MOTIVO_PENDENCIA,
  S11: MOTIVO_AGUARDANDO_CAMPO_CHAMADO,
  EI_SUST: MOTIVO_CALCULO_NAO_DEFINIDO,
}

/** Motivo genérico da métrica fora do mapa real que não tem motivo próprio (O19 a O26, FL2, FL3, Visão geral e a tendência da sustentação). */
export const MOTIVO_FONTE_REAL_NAO_DEFINIDA = 'fonte real ainda não definida'

/**
 * Pedido 060 (P3): estado da métrica fora do mapa real. A API não calcula nada para ela: responde 200 com este corpo, sem número, sem
 * percentil, sem histograma, só o motivo em texto. `estado` é o discriminante (nenhum DTO de resultado tem esse campo).
 */
export const ESTADO_SEM_DADO_REAL = 'sem-dado-real' as const
export const semDadoRealSchema = z
  .object({
    estado: z.literal(ESTADO_SEM_DADO_REAL),
    metrica: z.string(),
    motivo: z.string().min(1),
  })
  .strict()
  .meta({ id: 'SemDadoReal' })
export type SemDadoReal = z.infer<typeof semDadoRealSchema>

export function origemDaMetrica(id: MetricaId): OrigemDaMetrica {
  return METRICAS_ORIGEM_REAL.has(id) ? 'real' : 'sem-dado'
}

/** Motivo da falta de dado real, quando o mapa guarda um; null para métrica real ou sem motivo registrado. */
export function motivoDaOrigemSemDado(id: MetricaId): string | null {
  return origemDaMetrica(id) === 'sem-dado' ? (MOTIVO_ORIGEM_MOCK[id] ?? null) : null
}

/** Motivo do estado "sem dado real": o do mapa, ou o genérico. Nunca vazio. */
export function motivoSemDadoReal(id: MetricaId): string {
  return motivoDaOrigemSemDado(id) ?? MOTIVO_FONTE_REAL_NAO_DEFINIDA
}

/** Corpo da resposta "sem dado real" da métrica `id` (pedido 060, P3). */
export function corpoSemDadoReal(id: MetricaId): SemDadoReal {
  return {
    estado: ESTADO_SEM_DADO_REAL,
    metrica: id,
    motivo: motivoSemDadoReal(id),
  }
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

/**
 * Pedido 069, L9-a (K-220): notas só da sustentação (S3 e S2), em enum à parte para não mudar o contrato de O1, O2 e O3.
 * Os textos vivem só aqui, como os de `TEXTO_NOTA_CARTAO`.
 */
export const TEXTO_NOTA_SUSTENTACAO = {
  'ajuste-prioridade-sem-dado-real':
    'Ajustes manuais de prioridade: sem dado real (a coleta ainda não traz o campo "Prioridade ajustada manualmente?").',
  'excecao-sla-sem-fonte':
    'Exceção de SLA por registro posterior sem fonte: todo chamado fechado conta como apurável.',
} as const
export type NotaSustentacaoId = keyof typeof TEXTO_NOTA_SUSTENTACAO
export const NOTA_SUSTENTACAO_IDS = [
  'ajuste-prioridade-sem-dado-real',
  'excecao-sla-sem-fonte',
] as const satisfies readonly NotaSustentacaoId[]
export const notaSustentacaoIdSchema = z.enum(NOTA_SUSTENTACAO_IDS)
/**
 * Pedido 099 (D9): nota só do S12, em enum à parte para não mudar o contrato do S2, do S3 e da tendência (o enum da sustentação não cresce).
 */
export const TEXTO_NOTA_S12 = {
  'excecao-sla-s12-sem-fonte':
    'Exceção de SLA por registro posterior: campo sem fonte (a coleta ainda não traz o registro).',
} as const
export type NotaS12Id = keyof typeof TEXTO_NOTA_S12
export const NOTA_S12_IDS = ['excecao-sla-s12-sem-fonte'] as const satisfies readonly NotaS12Id[]
export const notaS12IdSchema = z.enum(NOTA_S12_IDS)
/** Texto de qualquer nota que o cartão mostra (os dos três enums). */
export const TEXTO_NOTA_QUALQUER: Readonly<
  Record<NotaCartaoId | NotaSustentacaoId | NotaS12Id, string>
> = {
  ...TEXTO_NOTA_CARTAO,
  ...TEXTO_NOTA_SUSTENTACAO,
  ...TEXTO_NOTA_S12,
}

/** Notas fixas por métrica (H-15: O6 e SLE, o T2). A do O3 (H-24) é dinâmica: vem no resultado (`notas`). */
export const NOTAS_FIXAS_DO_CARTAO: Partial<Record<MetricaId, readonly NotaCartaoId[]>> = {
  O6: ['sem-classe'],
  T2: ['sem-classe'],
}
