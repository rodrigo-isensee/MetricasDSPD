import { z } from 'zod'

/** Regra de amostra mínima (briefing 4.2): abaixo disto, a estatística não é publicada. */
export const MINIMO_AMOSTRA = 20

export type Dominio = 'businessmap' | 'acelerato'

/** Granularidade dos cards do BusinessMap. Frente = feature ou pacote (mesmo nível). */
export const GRANULARIDADES = ['story', 'frente', 'projeto'] as const
export type Granularidade = (typeof GRANULARIDADES)[number]

export const TIPOS_CARD = [
  'Incidente',
  'Requisição',
  'Melhoria',
  'Iniciativa',
  'Bug interno',
  'Defeito em produção',
  'Dívida técnica',
] as const
export type TipoCard = (typeof TIPOS_CARD)[number]

/** Tipos oferecidos no filtro do fluxo (Iniciativa é tipo de projeto, só no FL3; spec UX 2.1). */
export const TIPOS_FILTRO = [
  'Incidente',
  'Requisição',
  'Melhoria',
  'Bug interno',
  'Defeito em produção',
  'Dívida técnica',
] as const satisfies readonly TipoCard[]

export const CLASSES_SERVICO = ['Urgente', 'Prazo fixo', 'Padrão', 'Intangível'] as const
export type ClasseServico = (typeof CLASSES_SERVICO)[number]

export const PRIORIDADES = ['P1', 'P2', 'P3', 'P4', 'P5'] as const
export type Prioridade = (typeof PRIORIDADES)[number]

export const EQUIPES_SUSTENTACAO = ['SSSC TOTVS', 'SSSC SENIOR', 'SSSC FLUIG'] as const
export type EquipeSustentacao = (typeof EQUIPES_SUSTENTACAO)[number]

export const FASES_DETECCAO = [
  'Desenvolvimento',
  'Revisão de código',
  'Teste interno',
  'Homologação do negócio',
  'Produção',
] as const
export type FaseDeteccao = (typeof FASES_DETECCAO)[number]

export const MOTIVOS_BLOQUEIO = [
  'Aguardando fornecedor',
  'Aguardando validação do negócio',
  'Aguardando ambiente ou infraestrutura',
  'Dependência de outra demanda',
  'Falta de informação no chamado',
  'Janela de mudança',
  'Aguardando licença ou contrato',
] as const
export type MotivoBloqueio = (typeof MOTIVOS_BLOQUEIO)[number]

export const ORIGENS_DEMANDA = [
  'Erro em entrega anterior',
  'Configuração incorreta',
  'Falta de treinamento do usuário',
  'Informação não repassada',
  'Processo manual que deveria estar automatizado',
] as const
export type OrigemDemanda = (typeof ORIGENS_DEMANDA)[number]

export const RESPONSABILIDADES_ATRASO = ['Interno', 'Solicitante', 'Terceiro'] as const
export type ResponsabilidadeAtraso = (typeof RESPONSABILIDADES_ATRASO)[number]

export const MOTIVOS_ESCALACAO = [
  'Sem conhecimento técnico no N1',
  'Sem solução ou contorno conhecido',
  'Risco de estouro de SLA',
  'Múltiplos sistemas ou dependências',
  'Necessidade de atuação especializada',
] as const
export type MotivoEscalacao = (typeof MOTIVOS_ESCALACAO)[number]

export const MOTIVOS_ENCERRAMENTO = [
  'Resolução definitiva',
  'Contorno aplicado',
  'Reclassificado, não é incidente',
  'Encerrado sem retorno',
  'Duplicado',
] as const
export type MotivoEncerramento = (typeof MOTIVOS_ENCERRAMENTO)[number]

export const NIVEIS_RESOLUCAO = ['N1', 'N2', 'N3', 'Fornecedor'] as const
export type NivelResolucao = (typeof NIVEIS_RESOLUCAO)[number]

/** Identificadores de métrica do núcleo (mais o bloco "Bloqueados agora" e a Visão geral). */
export const METRICA_IDS = [
  'O1',
  'O2',
  'BLOQUEADOS',
  'O3',
  'O4',
  'O7',
  'O9',
  'O10',
  'O12',
  'O15',
  'O18',
  'T1',
  'T2',
  'T3',
  'T4',
  'T5',
  'T7',
  'T9',
  'E1',
  'E2',
  'E3',
  'S1',
  'S2',
  'S3',
  'S4',
  'S5',
  'S6',
  'S7',
  'EI_FL1',
  'EI_FL2',
  'EI_FL3',
  'EI_SUST',
  'VISAO_GERAL',
] as const
export type MetricaId = (typeof METRICA_IDS)[number]

/** Intervalo de datas civis (AAAA-MM-DD, fuso America/Sao_Paulo), inclusivo nas duas pontas. */
export const intervaloSchema = z.object({ inicio: z.string(), fim: z.string() })
export type Intervalo = z.infer<typeof intervaloSchema>

/** Janela móvel de percentis: intervalo + a especificação que a gerou. */
export const janelaSchema = intervaloSchema.extend({
  unidade: z.enum(['semanas', 'meses']),
  quantidade: z.number(),
})
export type Janela = z.infer<typeof janelaSchema>

/**
 * Parâmetro ÚNICO da janela móvel de percentis (briefing: 12 semanas). A biblioteca de cálculo
 * (`JANELA_POR_GRANULARIDADE`) e todo texto de janela da interface partem desta constante: nunca
 * se escreve "12 semanas" à mão.
 */
export const JANELA_PERCENTIS_PADRAO: Pick<Janela, 'unidade' | 'quantidade'> = {
  unidade: 'semanas',
  quantidade: 12,
}

export const periodoSchema = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.enum(['4s', '12s', '6m', '12m']) }),
  z.object({ tipo: z.literal('custom'), de: z.string(), ate: z.string() }),
])
export type Periodo = z.infer<typeof periodoSchema>

export const marcacaoCriterioSchema = z.object({
  id: z.string(),
  data: z.string(),
  descricao: z.string(),
})
export type MarcacaoCriterio = z.infer<typeof marcacaoCriterioSchema>

export const statusMetaSchema = z.enum(['dentro', 'fora', 'sem-referencia'])
/** `sem-referencia`: não há como avaliar (amostra insuficiente ou meta não numérica). */
export type StatusMeta = z.infer<typeof statusMetaSchema>

export const percentisSchema = z.object({ p50: z.number(), p85: z.number(), p95: z.number() })
export type Percentis = z.infer<typeof percentisSchema>

export const percentisComMediaSchema = percentisSchema.extend({ media: z.number() })
export type PercentisComMedia = z.infer<typeof percentisComMediaSchema>

/**
 * Estatística de distribuição sujeita à regra dos 20 itens (D8 da spec de UX).
 * `insuficiente` nunca carrega o valor: a interface mostra "n de 20 itens mínimos".
 */
export function estatisticaSchema<T extends z.ZodType>(valor: T) {
  return z.discriminatedUnion('status', [
    z.object({
      status: z.literal('ok'),
      n: z.number().int().min(MINIMO_AMOSTRA),
      valor,
      janela: intervaloSchema,
    }),
    z.object({
      status: z.literal('insuficiente'),
      n: z
        .number()
        .int()
        .max(MINIMO_AMOSTRA - 1),
      minimo: z.literal(MINIMO_AMOSTRA),
      janela: intervaloSchema,
    }),
  ])
}
export type Estatistica<T> =
  | { status: 'ok'; n: number; valor: T; janela: Intervalo }
  | { status: 'insuficiente'; n: number; minimo: typeof MINIMO_AMOSTRA; janela: Intervalo }

/**
 * Taxa k de n. Abaixo de 20 itens o percentual não é publicado, mas "k de n" permanece.
 */
export const taxaSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('ok'),
    k: z.number(),
    n: z.number().int().min(MINIMO_AMOSTRA),
    pct: z.number(),
  }),
  z.object({
    status: z.literal('insuficiente'),
    k: z.number(),
    n: z
      .number()
      .int()
      .max(MINIMO_AMOSTRA - 1),
    minimo: z.literal(MINIMO_AMOSTRA),
  }),
])
export type Taxa =
  | { status: 'ok'; k: number; n: number; pct: number }
  | { status: 'insuficiente'; k: number; n: number; minimo: typeof MINIMO_AMOSTRA }

/** Base amostral declarada em todo resultado ("Base: 87 itens · 12 semanas"). */
export const baseAmostralSchema = z.object({
  n: z.number(),
  unidade: z.string(),
  janela: intervaloSchema.nullable(),
  /** Segunda base do cartão, quando há (ex.: itens concluídos usados como referência). */
  complemento: z.object({ n: z.number(), unidade: z.string() }).optional(),
})
export type BaseAmostral = z.infer<typeof baseAmostralSchema>

/** Mudanças de critério (T2.6): da série exibida e da janela de percentis. */
export const criteriosSchema = z.object({
  serie: z.array(marcacaoCriterioSchema),
  janela: z.array(marcacaoCriterioSchema),
})
export type CriteriosResultado = z.infer<typeof criteriosSchema>

export const faixaHistogramaSchema = z.object({
  rotulo: z.string(),
  min: z.number(),
  /** null = faixa aberta ("+20"). */
  max: z.number().nullable(),
  contagem: z.number(),
  /** Empilhamento (ex.: por tipo no O10). Ausente nos histogramas simples. */
  empilhado: z.array(z.object({ classe: z.string(), contagem: z.number() })).optional(),
})
export type FaixaHistograma = z.infer<typeof faixaHistogramaSchema>

export const versaoCriterioSchema = z.object({
  id: z.string(),
  data: z.string(),
  descricao: z.string(),
  afeta: z.array(z.enum(METRICA_IDS)),
})
export type VersaoCriterio = z.infer<typeof versaoCriterioSchema>
