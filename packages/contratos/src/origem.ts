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
  // Pedido 099 (A4, Q-099-4): o O8 publica o tempo em execução real (o mesmo do O3); a divisão por tamanho segue sem dado real até o campo do WS1.
  'O8',
  'O9',
  'O10',
  'O11',
  'O13',
  'O19',
  // Pedido 099 (lote A2, E3.222): o O20 Fluxo cumulativo lê a varredura da vida dos cards da base real (Q-RO-1: avanço 24289, retorno 602); a frio custa ~110 a 140 ms em processo na escala 3 do mock (A1 do ADR 0003).
  'O20',
  // Pedido 099 (lote A3, E3.43): o O25 Descarte lê o descarte nativo (`motivo_descarte`, `arquivado_em`, `excluido_em`) já na base (Q-RO-2).
  'O25',
  // Pedido 105 (E7.3, decisão do dono de 2026-11-15 12:33): o O24 lê a classe de serviço das etiquetas do card (Padrão = etiqueta Padrao); card sem etiqueta de classe fica fora da fila, nunca Padrão por omissão (Q-099-9).
  'O24',
  // Pedido 099 (lote C8, E3.237): O16 real pelos bugs (`ref_tipo_card`) e transições; o bug sem severidade aparece como "Sem severidade" até o `bm:ref-sync` com a reprojeção do C8a.
  'O16',
  // Pedido 099 (lote A1, E3.219): o O21 Fluxo reverso lê a `direcao` (avanço, retorno) das transições já na base (Q-RO-1) e o ciclo do O3.
  'O21',
  // Pedido 105 (E7.4, O18 = c): entregas com e sem bug pelos vínculos do BusinessMap (pai e filho ou relacionado) projetados em `dim_card.origem_bug`.
  'O18',
  'EI_FL1',
  // Pedido 105 (E7.68, D-T9 "T9 A", decisão do dono de 2026-11-16): o T9 lê o avanço pelas frentes filhas (concluídas ÷ total) e as adicionadas pela regra
  // do `criado_em` da frente depois do `iniciado_em` do projeto, derivada na leitura (a base não guarda o instante do vínculo: a frente criada antes e
  // ligada depois conta como original, e a nota do cartão diz isso); projeto sem início fica fora, contado. Só 13 projetos ativos têm frente filha:
  // o T9 não publica estatística agregada (só "k de n"), e o por projeto segue a regra do briefing (censo).
  'T9',
  // Pedido 105 (E7.64, D-T11 "A" do dono, 2026-11-16): o T11 lê `dim_card` (criado_em; story que não é Bug interno, a chegada do T4 e do O7; arquivados entram;
  // excluídos e subtarefas ficam fora; sem pessoa nem `equipeResponsavel`); a base real tem 25 meses sem buraco (consulta tat-i). Abaixo de 20 demandas não publica.
  'T11',
  // Pedido 060 (Q2, decisão do dono de 2026-11-02): a pesquisa de percepção (mostra `sem-pesquisa` enquanto não houver carga).
  // Pedido 075 (lote 6b, K-204): BLOQUEADOS, O5 e O19 voltam ao mapa real com a coleta gravando `fato_bloqueio`. T10 e T12 seguem fora (P-075-11 e P-075-12, "B").
  'BLOQUEADOS',
  'PV1',
  // Sustentação (E2.115 e E2.117, plano 056 §3): as que o plano calcula só com o dado do Acelerato já carregado (S2, S3, S4, S8, S10). S12 entrou no pedido 099 (D9) só com o volume.
  'S2',
  'S3',
  'S4',
  'S8',
  'S10',
  // Pedido 099 (E3.20, B' da Q-099-7): o O17 publica por sistema (categoria_sistema) com dado real; a causa raiz segue sem dado real.
  'O17',
  // Pedido 099 (D4, Q-099-5b = A): S1 real com o primeiro atendimento = primeiro comentário (com a nota de resposta automática) e a restauração por `data_pronto`.
  // Portão (ADR 0026 P3, ADR 0030 D4): o merge espera as consultas Q-RO-11 e Q-RO-12 e o `ac:ref-sync` dos alvos (sem `ref_alvo_prioridade` a API responde 503).
  'S1',
  // Pedido 099 (D9): S12 real só com o volume por sistema; reincidência e exceção de SLA por registro posterior saem sem fonte (nulas, com nota).
  'S12',
  // Pedido 099 (O12, E3.223): acordos e vencidos pelo prazo nativo do card; a parte de responsabilidade do atraso sai nula com o motivo (`RESPONSABILIDADE_ATRASO_COM_FONTE`).
  'O12',
  // Pedido 105 (E7.5): O15 real pela coluna do card da demanda na abertura do bug (`dim_card.fase_deteccao`, tabela `fase_deteccao_coluna` aprovada pelo dono); só entram os bugs com pai na base, com a nota de quantos ficaram fora.
  'O15',
  // Pedido 099 (D5a): S9 real pelas esperas decididas (Solicitante, Suporte Terceiros, Fornecedor, Janela de Mudança; Pendente como não classificado); a previsão de retorno segue sem data na base (n = 0, insuficiente).
  'S9',
  // Pedido 105 (D2, P1 a P3 do dono): S5, S6 e S7 reais só para os cinco fluxos do PROC (chamados fora deles ficam de fora, com a contagem); motivo sem par vira "Outro".
  'S5',
  'S6',
  'S7',
  // Pedido 105 (D6a, Decisão 18b do pedido 099): S11 real pela regra do fluxo do chamado (campo nativo no PROC, etapa "Causa Raiz" nos fluxos
  // antigo e intermediário); chamado sem fluxo fica de fora, contado; a conversão em Registro de Problema sai nula com o motivo.
  'S11',
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

/**
 * Pedido 099 (O12, Q-099-4 = A): motivo da parte de responsabilidade do atraso. O prazo do card diz quando venceu, não de quem foi o atraso.
 * Frase em minúsculas sem ponto final, completada pelo componente.
 */
export const MOTIVO_O12_RESPONSABILIDADE_SEM_DADO_REAL =
  'aguardando o campo de responsabilidade do atraso no quadro do BusinessMap (o prazo do card diz quando venceu, não de quem foi o atraso)'
/**
 * Pedido 099 (O12): interruptor que vira `true`, num PR próprio com versão de critério `afeta = ['O12', 'VISAO_GERAL']`, quando o campo de
 * responsabilidade do atraso existir no quadro e vier preenchido da fonte. Falso: o O12 publica `porResponsabilidade` e `vencidosCausaInterna`
 * `null` com o motivo, e `statusMeta = 'sem-referencia'`; nunca 0.
 */
export const RESPONSABILIDADE_ATRASO_COM_FONTE = false
/**
 * Pedido 099 (A4, Q-099-4) e 105 (E7.102): motivo da divisão do O8 por tamanho. O tempo em execução é real (pelas transições); o tamanho vem do
 * `size` nativo do card pela régua de cada time (seis faixas); enquanto a régua aprovada não estiver carregada, nenhum card tem tamanho e a
 * divisão sai sem dado real. Com algum card com tamanho o motivo é nulo (plano de tamanho, seção 4). Texto provisório, revisado pela UX.
 */
export const MOTIVO_O8_POR_TAMANHO_SEM_DADO_REAL =
  'aguardando a régua de tamanho aprovada: nenhum card tem tamanho pela régua do time'

/**
 * Pedido 105 (D6a): motivo da conversão do S11 em Registro de Problema. Desde o E7.101 a conversão sai do campo "Avaliação de Problema" e o
 * serviço não usa mais este motivo (resta para o resultado antigo com `conversao` nula; a conversão nunca é publicada como 0). Texto provisório, revisado pela UX. Frase completa (maiúscula e ponto final), exibida como está pelo componente.
 */
export const MOTIVO_S11_CONVERSAO_SEM_DADO_REAL =
  'Aguardando o vínculo do chamado com o Registro de Problema.'
/** Pedido 099 (L18, E3.298): motivo do S1 sem `ref_alvo_prioridade` carregada; nenhum prazo é presumido. */
export const MOTIVO_ALVOS_NAO_CARREGADOS =
  'alvos de prazo por prioridade não carregados (ref_alvo_prioridade); o dono roda o ac:ref-sync'
/**
 * Pedido 105 (D2, P1 = B): S5, S6 e S7 valem só para os cinco fluxos do PROC, lista versionada em `acelerato-dominio.json` (campo `fluxo_proc`) e
 * carregada pelo `ac:ref-sync`. Sem a lista na base nada é presumido: o estado é "sem dado real" com este motivo.
 */
export const MOTIVO_FLUXOS_PROC_NAO_CARREGADOS =
  'fluxos do PROC não carregados (ref_dominio, campo fluxo_proc); o dono roda o ac:ref-sync'
export const MOTIVO_CALCULO_NAO_DEFINIDO = 'cálculo ainda não definido para o Acelerato'
/** Pedido 065: interruptor da publicação real dos bloqueios; ligado no pedido 075 (lote 6b) depois da prova de `fato_bloqueio` com linhas reais. */
export const BLOQUEIOS_COM_DADO_REAL = true
/**
 * Pedido 069, L9-a (K-220): interruptor que vira `true`, com versão de critério `afeta = ['S3', 'S7']`, quando
 * `prioridade_ajustada_manualmente` vier da fonte (L9-c). Falso: o S3 publica `ajustesManuais: null`. Ligado no pedido 105 (D2): o campo
 * "Prioridade ajustada manualmente?" já está projetado em `dim_chamado`; só "Sim" conta (a coleta não separa "Não" de campo vazio: nota do S7).
 */
export const AJUSTE_PRIORIDADE_COM_FONTE = true

/** Pedido 105 (E7.55): início do histórico de troca de responsável dos cards na base (2026-11-09), exibido como 09/11/2026. */
export const O26_INICIO_HISTORICO_RESPONSAVEIS = '09/11/2026'
/** Pedido 105 (E7.55): início do histórico (2026-11-09) mais 12 semanas, a janela da métrica (2027-02-01), exibido como 01/02/2027. */
export const O26_DATA_DADO_REAL = '01/02/2027'
/**
 * Pedido 105 (E7.55, decisão 2 do dono de 16/11): o O26 (passagens de mão) segue sem dado real até juntar 12 semanas de histórico de
 * responsáveis. Texto revisado pela UX. Frase completa (maiúscula e ponto final), exibida como está pelo componente.
 */
export const MOTIVO_O26_HISTORICO_RESPONSAVEIS = `A base guarda a troca de responsável dos cards desde ${O26_INICIO_HISTORICO_RESPONSAVEIS}; a métrica precisa de 12 semanas de histórico e passa a ter dado real a partir de ${O26_DATA_DADO_REAL}.`

/**
 * Fictícias com motivo. FL1: campo ainda por criar na WS1 (H-13); O22 a O24 seguem mock até a F6b, sem motivo próprio; o O26 tem o seu (E7.55).
 * Sustentação: a EI_SUST não consta do plano 056, então não se calcula por inferência. S5, S6 e S7 (D2) e S11 (D6a) saíram no pedido 105.
 */
export const MOTIVO_ORIGEM_MOCK: Partial<Record<MetricaId, string>> = {
  O14: MOTIVO_AGUARDANDO_CAMPO,
  O26: MOTIVO_O26_HISTORICO_RESPONSAVEIS,
  EI_SUST: MOTIVO_CALCULO_NAO_DEFINIDO,
}

/** Motivo genérico da métrica fora do mapa real que não tem motivo próprio (O22 a O24, FL2, FL3, Visão geral e a tendência da sustentação). */
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
  'sem-classe': 'Cartões sem etiqueta de classe de serviço ficam fora da separação por classe.',
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
    'Chamados abertos no sistema depois do atendimento ficam de fora do cálculo. Hoje essa marca não vem do Acelerato, então nenhum chamado sai do cálculo por esse motivo.',
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
    'Chamados abertos no sistema depois do atendimento: sem dado (hoje essa marca não vem do Acelerato).',
} as const
export type NotaS12Id = keyof typeof TEXTO_NOTA_S12
export const NOTA_S12_IDS = ['excecao-sla-s12-sem-fonte'] as const satisfies readonly NotaS12Id[]
export const notaS12IdSchema = z.enum(NOTA_S12_IDS)
/**
 * Pedido 099 (D4, Q-099-5b = A): nota só do S1, em enum à parte (o enum da sustentação não cresce). O primeiro atendimento é o
 * primeiro comentário da tabela do Acelerato, que não separa o atendente da resposta automática. O texto vive só aqui.
 */
export const TEXTO_NOTA_S1 = {
  'primeiro-atendimento-inclui-automatica':
    'Primeiro atendimento: inclui respostas automáticas; o processo pede o primeiro atendimento significativo do atendente.',
} as const
export type NotaS1Id = keyof typeof TEXTO_NOTA_S1
export const NOTA_S1_IDS = [
  'primeiro-atendimento-inclui-automatica',
] as const satisfies readonly NotaS1Id[]
export const notaS1IdSchema = z.enum(NOTA_S1_IDS)
/**
 * Pedido 105 (D2): notas do S5, do S7 e (a de ajuste) do S3, em enum à parte (o enum da sustentação não cresce). O S5 não tem fonte para "Risco de estouro de SLA"
 * (o campo do Acelerato não traz esse valor): a faixa sai com n = 0. O S7 não separa "Não" de campo vazio no ajuste de prioridade.
 */
export const TEXTO_NOTA_MOTIVOS = {
  's5-risco-sla-sem-fonte':
    'Risco de estouro de SLA: sem fonte (o campo "Motivo da escalação" do Acelerato não traz este valor); a faixa aparece com zero.',
  's7-nao-igual-vazio':
    'Ajustes manuais de prioridade: a coleta não separa "Não" de campo vazio; só "Sim" conta como ajuste.',
} as const
export type NotaMotivosId = keyof typeof TEXTO_NOTA_MOTIVOS
export const NOTA_MOTIVOS_IDS = [
  's5-risco-sla-sem-fonte',
  's7-nao-igual-vazio',
] as const satisfies readonly NotaMotivosId[]
export const notaMotivosIdSchema = z.enum(NOTA_MOTIVOS_IDS)
/** Texto de qualquer nota que o cartão mostra (os dos cinco enums). */
export const TEXTO_NOTA_QUALQUER: Readonly<
  Record<NotaCartaoId | NotaSustentacaoId | NotaS12Id | NotaS1Id | NotaMotivosId, string>
> = {
  ...TEXTO_NOTA_CARTAO,
  ...TEXTO_NOTA_SUSTENTACAO,
  ...TEXTO_NOTA_S12,
  ...TEXTO_NOTA_S1,
  ...TEXTO_NOTA_MOTIVOS,
}

/** Notas fixas por métrica (H-15: O6 e SLE, o T2). A do O3 (H-24) é dinâmica: vem no resultado (`notas`). */
export const NOTAS_FIXAS_DO_CARTAO: Partial<Record<MetricaId, readonly NotaCartaoId[]>> = {
  O6: ['sem-classe'],
  T2: ['sem-classe'],
}
