/**
 * Catálogo de CARTÕES dos painéis (pedido 007) e formato das preferências de métricas.
 * Fonte única para painel, perfil e testes. Preferência é só de interface: nunca entra em cálculo,
 * alerta ou aviso, e nunca identifica nem compara pessoas.
 */
import { z } from 'zod'
import type { MetricaId } from './comum'

export const PAINEIS_COM_CARTOES = ['operacional', 'tatico', 'estrategico', 'sustentacao'] as const
export type PainelComCartoes = (typeof PAINEIS_COM_CARTOES)[number]

export const ROTULO_PAINEL: Record<PainelComCartoes, string> = {
  operacional: 'Operacional',
  tatico: 'Tático',
  estrategico: 'Estratégico',
  sustentacao: 'Sustentação',
}

/** Id do cartão: o código da métrica em minúsculas (`o9`, `bloqueados`, `ei-fl1`), igual ao `id` do cartão na página. */
export type CartaoId = string

export interface CartaoCatalogo {
  id: CartaoId
  /** Código exibido (O9, BLOQUEADOS, EI-FL1). */
  codigo: string
  rotulo: string
  painel: PainelComCartoes
  secao: string
  secaoTitulo: string
  /** Métricas que o cartão exibe (para cruzar com alertas e mudanças de critério). */
  metricas: readonly MetricaId[]
  /** Cartões "leia junto" (lista de ids, únicos entre painéis; pode apontar para outro painel): o link some se o par está oculto. */
  leiaJunto?: readonly CartaoId[]
  /** Núcleo (briefing) ou complementar (seção "Mais métricas deste painel"). */
  grupo: 'nucleo' | 'complementar'
  /** 'mock' = dado fictício até a coleta real (a interface rotula "Dados fictícios"). */
  status: 'disponivel' | 'mock'
}

type Def = readonly [
  codigo: string,
  rotulo: string,
  metricas?: readonly MetricaId[] | undefined,
  pares?: readonly string[],
]

/**
 * Complementares que ainda dependem de campo sem fonte real (extensão): só estas são rotuladas "Dados
 * fictícios". O17 fica 'mock' até a coleta real do campo causa raiz (Metabase). As demais derivam
 * só de `BaseBM`/`BaseAC` e são 'disponivel'.
 */
const COM_EXTENSAO_MOCK: ReadonlySet<string> = new Set(['O17', 'T8', 'E4', 'S8', 'S11', 'S12'])

function secao(
  painel: PainelComCartoes,
  id: string,
  titulo: string,
  cartoes: readonly Def[],
  grupo: CartaoCatalogo['grupo'] = 'nucleo',
): CartaoCatalogo[] {
  return cartoes.map(([codigo, rotulo, metricas, pares]) => ({
    id: codigo.toLowerCase(),
    codigo,
    rotulo,
    painel,
    secao: id,
    secaoTitulo: titulo,
    metricas: metricas ?? [codigo as MetricaId],
    ...(pares ? { leiaJunto: pares } : {}),
    grupo,
    status:
      grupo === 'complementar' && COM_EXTENSAO_MOCK.has(codigo)
        ? ('mock' as const)
        : ('disponivel' as const),
  }))
}

export const CATALOGO_CARTOES: readonly CartaoCatalogo[] = [
  ...secao('operacional', 'diaria', 'Visão diária', [
    ['O2', 'Idade do trabalho em progresso'],
    ['BLOQUEADOS', 'Bloqueados agora'],
    ['O1', 'Trabalho em progresso e limite'],
  ]),
  ...secao('operacional', 'tempo', 'Tempo', [
    ['O3', 'Tempo de ciclo', undefined, ['o5', 'o6', 'o8']],
    ['O9', 'Os três relógios do pedido'],
    ['EI-FL1', 'Espera invisível · Operacional', ['EI_FL1']],
  ]),
  ...secao('operacional', 'fluxo', 'Fluxo', [['O4', 'Vazão semanal', undefined, ['o8']]]),
  ...secao('operacional', 'compromissos', 'Compromissos', [['O12', 'Acordos e vencidos']]),
  ...secao('operacional', 'backlog', 'Backlog', [
    ['O10', 'Envelhecimento do backlog', undefined, ['o11']],
    ['O7', 'Entrada × saída por tipo'],
  ]),
  ...secao('operacional', 'qualidade', 'Qualidade', [
    ['O15', 'Onde os bugs são encontrados', undefined, ['o13', 'o16', 'o17']],
    ['O18', 'Entregas com e sem bug', undefined, ['o4']],
  ]),
  ...secao('tatico', 'publicado', 'Estamos cumprindo o que publicamos?', [
    ['T2', 'Aderência ao SLE'],
    ['T1', 'Lead time ponta a ponta', undefined, ['t4', 't6']],
    ['T5', 'Demanda de falha', undefined, ['o14']],
  ]),
  ...secao('tatico', 'fila', 'O que entra, e o que sai da fila para isso caber?', [
    ['T4', 'Demanda × capacidade', undefined, ['t1', 't8']],
    ['T3', 'Alocação da capacidade'],
  ]),
  ...secao('tatico', 'projetos', 'Os projetos estão avançando de verdade?', [
    ['T9', 'Avanço real e escopo', undefined, ['t6', 'e5']],
    ['T7', 'Fluxo de frentes'],
  ]),
  ...secao('tatico', 'espera-invisivel', 'Espera invisível do nível', [
    ['EI-FL2', 'Espera invisível · Tático', ['EI_FL2']],
  ]),
  ...secao('estrategico', 'prazo', 'Quanto tempo leva decidir e entregar?', [
    ['E1', 'Lead time de projetos', undefined, ['e4', 'e5']],
  ]),
  ...secao('estrategico', 'apostas', 'As entregas refletem as prioridades e geram resultado?', [
    ['E2', 'Capacidade por objetivo estratégico'],
    ['E3', 'Entrega × resultado'],
  ]),
  ...secao('estrategico', 'espera-invisivel', 'Espera invisível do nível', [
    ['EI-FL3', 'Espera invisível · Estratégico', ['EI_FL3']],
  ]),
  ...secao('sustentacao', 'prazos', 'Prazos', [
    ['S2', 'Aderência ao SLA', undefined, ['s8', 's12']],
    ['S1', 'Primeiro atendimento e restauração', undefined, ['s9', 's10']],
  ]),
  ...secao('sustentacao', 'volume', 'Volume e resolução', [
    ['S3', 'Volume mensal por prioridade', undefined, ['s8', 's12']],
    ['S4', 'Onde o chamado foi resolvido'],
  ]),
  ...secao('sustentacao', 'causas', 'Escalação, encerramento e reclassificação', [
    ['S5', 'Motivos da escalação', undefined, ['s11']],
    ['S6', 'Motivos de encerramento'],
    ['S7', 'Reclassificação', undefined, ['s11']],
  ]),
  ...secao('sustentacao', 'espera', 'Espera invisível do nível', [
    ['EI-SUST', 'Espera invisível · Sustentação', ['EI_SUST']],
  ]),

  // Complementares (dados mockados): seção = a pergunta do painel.
  ...secao(
    'operacional',
    'por-que-demora',
    'Por que demora?',
    [
      ['O5', 'Eficiência de fluxo'],
      ['O6', 'Previsibilidade'],
      ['O8', 'Tamanho das demandas'],
    ],
    'complementar',
  ),
  ...secao(
    'operacional',
    'o-que-entra',
    'O que entra?',
    [
      ['O11', 'Composição do backlog'],
      ['O14', 'Origem da demanda'],
    ],
    'complementar',
  ),
  ...secao(
    'operacional',
    'qualidade-compl',
    'Qualidade',
    [
      ['O13', 'Vazão de defeitos'],
      ['O16', 'Estoque e idade de bugs'],
    ],
    'complementar',
  ),
  ...secao(
    'tatico',
    'quando-fica-pronto',
    'Quando fica pronto?',
    [['T6', 'Previsão probabilística']],
    'complementar',
  ),
  ...secao(
    'tatico',
    'cumprindo-o-plano',
    'Estamos cumprindo o plano?',
    [['T8', 'Sprint']],
    'complementar',
  ),
  ...secao(
    'estrategico',
    'terminando-ou-comecando',
    'Estamos terminando ou só começando?',
    [['E4', 'Iniciadas × concluídas']],
    'complementar',
  ),
  ...secao(
    'estrategico',
    'quando-termina',
    'Quando termina?',
    [['E5', 'Previsão de término']],
    'complementar',
  ),
  ...secao(
    'sustentacao',
    'por-que-demora',
    'Por que demora?',
    [
      ['S9', 'Tempo em pendência'],
      ['S10', 'Fila de atribuição'],
    ],
    'complementar',
  ),
  ...secao(
    'sustentacao',
    'qualidade',
    'Qualidade',
    [
      ['S8', 'Taxa de reabertura'],
      ['S11', 'Avaliação de Problema'],
      ['O17', 'Defeitos por causa raiz e sistema'],
    ],
    'complementar',
  ),
  ...secao(
    'sustentacao',
    'o-que-entra',
    'O que entra?',
    [['S12', 'Volume por sistema']],
    'complementar',
  ),
]

/** Ids de cartões retirados do catálogo ou renomeados (`novo` ou `null`): aplicado na leitura, em silêncio. */
export const CARTOES_RETIRADOS: Readonly<Record<string, string | null>> = {}

export const cartoesDoPainel = (painel: PainelComCartoes): readonly CartaoCatalogo[] =>
  CATALOGO_CARTOES.filter((c) => c.painel === painel)

export const cartaoPorId = (painel: PainelComCartoes, id: CartaoId): CartaoCatalogo | undefined =>
  CATALOGO_CARTOES.find((c) => c.painel === painel && c.id === id)

/** Acha o cartão pelo id em qualquer painel (os ids são únicos no catálogo): usado pelo "leia junto" entre painéis. */
export const cartaoPorIdGlobal = (id: CartaoId): CartaoCatalogo | undefined =>
  CATALOGO_CARTOES.find((c) => c.id === id)

/** Atalho opcional "Aplicar sugestão do meu papel": só marca caixas; o papel nunca é gravado. */
export const PAPEIS = ['time', 'coordenador', 'gerente'] as const
export type Papel = (typeof PAPEIS)[number]
export const ROTULO_PAPEL: Record<Papel, string> = {
  time: 'Time',
  coordenador: 'Coordenador',
  gerente: 'Gerente',
}
/** Painéis que cada papel enxerga na sugestão (decisão do usuário, 2026-10-10 §9). */
export const PAINEIS_DO_PAPEL: Record<Papel, readonly PainelComCartoes[]> = {
  time: ['operacional'],
  coordenador: ['operacional', 'tatico'],
  gerente: ['tatico', 'estrategico'],
}

export const CHAVE_PREFERENCIAS = 'metricas-dspd:preferencias:v1'

export const preferenciasMetricasSchema = z.object({
  versao: z.literal(1),
  /** Guarda OCULTOS: cartão novo aparece por padrão. */
  paineis: z.partialRecord(z.enum(PAINEIS_COM_CARTOES), z.object({ ocultar: z.array(z.string()) })),
  atualizadoEm: z.string(),
})
export type PreferenciasMetricas = z.infer<typeof preferenciasMetricasSchema>

export const PREFERENCIAS_PADRAO: PreferenciasMetricas = {
  versao: 1,
  paineis: {},
  atualizadoEm: '1970-01-01T00:00:00.000Z',
}
