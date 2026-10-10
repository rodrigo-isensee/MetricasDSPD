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
  /** Pares "leia junto": o link some se o par está oculto. */
  leiaJunto?: readonly CartaoId[]
}

type Def = readonly [
  codigo: string,
  rotulo: string,
  metricas?: readonly MetricaId[] | undefined,
  par?: string,
]

function secao(
  painel: PainelComCartoes,
  id: string,
  titulo: string,
  cartoes: readonly Def[],
): CartaoCatalogo[] {
  return cartoes.map(([codigo, rotulo, metricas, par]) => ({
    id: codigo.toLowerCase(),
    codigo,
    rotulo,
    painel,
    secao: id,
    secaoTitulo: titulo,
    metricas: metricas ?? [codigo as MetricaId],
    ...(par ? { leiaJunto: [par] } : {}),
  }))
}

export const CATALOGO_CARTOES: readonly CartaoCatalogo[] = [
  ...secao('operacional', 'diaria', 'Visão diária', [
    ['O2', 'Idade do trabalho em progresso'],
    ['BLOQUEADOS', 'Bloqueados agora'],
    ['O1', 'Trabalho em progresso e limite'],
  ]),
  ...secao('operacional', 'tempo', 'Tempo', [
    ['O3', 'Tempo de ciclo'],
    ['O9', 'Os três relógios do pedido'],
    ['EI-FL1', 'Espera invisível · Operacional', ['EI_FL1']],
  ]),
  ...secao('operacional', 'fluxo', 'Fluxo', [['O4', 'Vazão semanal']]),
  ...secao('operacional', 'compromissos', 'Compromissos', [['O12', 'Acordos e vencidos']]),
  ...secao('operacional', 'backlog', 'Backlog', [
    ['O10', 'Envelhecimento do backlog'],
    ['O7', 'Entrada × saída por tipo'],
  ]),
  ...secao('operacional', 'qualidade', 'Qualidade', [
    ['O15', 'Onde os bugs são encontrados'],
    ['O18', 'Entregas com e sem bug', undefined, 'o4'],
  ]),
  ...secao('tatico', 'publicado', 'Estamos cumprindo o que publicamos?', [
    ['T2', 'Aderência ao SLE'],
    ['T1', 'Lead time ponta a ponta', undefined, 't4'],
    ['T5', 'Demanda de falha'],
  ]),
  ...secao('tatico', 'fila', 'O que entra, e o que sai da fila para isso caber?', [
    ['T4', 'Demanda × capacidade', undefined, 't1'],
    ['T3', 'Alocação da capacidade'],
  ]),
  ...secao('tatico', 'projetos', 'Os projetos estão avançando de verdade?', [
    ['T9', 'Avanço real e escopo'],
    ['T7', 'Fluxo de frentes'],
  ]),
  ...secao('tatico', 'espera-invisivel', 'Espera invisível do nível', [
    ['EI-FL2', 'Espera invisível · Tático', ['EI_FL2']],
  ]),
  ...secao('estrategico', 'prazo', 'Quanto tempo leva decidir e entregar?', [
    ['E1', 'Lead time de projetos'],
  ]),
  ...secao('estrategico', 'apostas', 'As entregas refletem as prioridades e geram resultado?', [
    ['E2', 'Capacidade por objetivo estratégico'],
    ['E3', 'Entrega × resultado'],
  ]),
  ...secao('estrategico', 'espera-invisivel', 'Espera invisível do nível', [
    ['EI-FL3', 'Espera invisível · Estratégico', ['EI_FL3']],
  ]),
  ...secao('sustentacao', 'prazos', 'Prazos', [
    ['S2', 'Aderência ao SLA'],
    ['S1', 'Primeiro atendimento e restauração'],
  ]),
  ...secao('sustentacao', 'volume', 'Volume e resolução', [
    ['S3', 'Volume mensal por prioridade'],
    ['S4', 'Onde o chamado foi resolvido'],
  ]),
  ...secao('sustentacao', 'causas', 'Escalação, encerramento e reclassificação', [
    ['S5', 'Motivos da escalação'],
    ['S6', 'Motivos de encerramento'],
    ['S7', 'Reclassificação'],
  ]),
  ...secao('sustentacao', 'espera', 'Espera invisível do nível', [
    ['EI-SUST', 'Espera invisível · Sustentação', ['EI_SUST']],
  ]),
]

/** Ids de cartões retirados do catálogo ou renomeados (`novo` ou `null`): aplicado na leitura, em silêncio. */
export const CARTOES_RETIRADOS: Readonly<Record<string, string | null>> = {}

export const cartoesDoPainel = (painel: PainelComCartoes): readonly CartaoCatalogo[] =>
  CATALOGO_CARTOES.filter((c) => c.painel === painel)

export const cartaoPorId = (painel: PainelComCartoes, id: CartaoId): CartaoCatalogo | undefined =>
  CATALOGO_CARTOES.find((c) => c.painel === painel && c.id === id)

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
