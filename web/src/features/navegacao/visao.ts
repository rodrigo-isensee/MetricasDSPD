import { cartoesDoPainel } from '@metricas-dspd/contratos'
import { textoBusca } from '@/features/filtros/codec'

/**
 * Visões do Operacional (plano da Sustentação no Operacional, 4.1 e 4.2). Módulo puro: lê o parâmetro
 * `cadencia`, decide a visão (o hash vence), normaliza a URL e monta links. Nenhum cálculo de métrica.
 */
export const VISOES = ['resumo', 'diaria', 'semanal', 'sustentacao'] as const
export type Visao = (typeof VISOES)[number]

/** O Resumo é o padrão e fica fora da URL canônica. */
export const VISAO_PADRAO: Visao = 'resumo'

export const ROTULO_VISAO: Record<Visao, string> = {
  resumo: 'Resumo',
  diaria: 'Diária',
  semanal: 'Semanal',
  sustentacao: 'Sustentação',
}

const ehVisao = (v: string): v is Visao => (VISOES as readonly string[]).includes(v)

/** `cadencia` desconhecido cai no Resumo e é sinalizado (aviso de valor inválido, 2.6). */
export function lerVisao(params: URLSearchParams): { visao: Visao; invalido: string | null } {
  const bruto = params.get('cadencia')
  if (bruto === null) return { visao: VISAO_PADRAO, invalido: null }
  return ehVisao(bruto)
    ? { visao: bruto, invalido: null }
    : { visao: VISAO_PADRAO, invalido: bruto }
}

/** Cartões da visão diária (a faixa do dia); os demais cartões do painel `operacional` vivem na Semanal. */
const CARTOES_DA_DIARIA: readonly string[] = ['o2', 'bloqueados', 'o1']

/** Âncoras do Resumo: os dois blocos e as duas séries (não existem no catálogo). */
const ANCORAS_DO_RESUMO: readonly string[] = [
  'resumo-fluxo',
  'resumo-sustentacao',
  'tendencia-fluxo',
  'tendencia-sustentacao',
]

/**
 * Pares âncora → visão, derivados do catálogo (nada de lista escrita à mão além do que o catálogo não tem).
 * Exportados em lista para o teste provar que nenhuma âncora pertence a duas visões.
 */
export function entradasDaTabela(): [string, Visao][] {
  const operacional = cartoesDoPainel('operacional')
  const sustentacao = cartoesDoPainel('sustentacao')
  const doNucleoFluxo = operacional.filter(
    (c) => c.grupo === 'nucleo' && !CARTOES_DA_DIARIA.includes(c.id),
  )
  const secoes = (cs: typeof operacional) => [...new Set(cs.map((c) => c.secao))]
  return [
    ...operacional.map((c): [string, Visao] => [
      c.id,
      CARTOES_DA_DIARIA.includes(c.id) ? 'diaria' : 'semanal',
    ]),
    ...secoes(doNucleoFluxo).map((s): [string, Visao] => [s, 'semanal']),
    ...secoes(operacional.filter((c) => c.grupo === 'complementar')).map((s): [string, Visao] => [
      `compl-${s}`,
      'semanal',
    ]),
    ...sustentacao.map((c): [string, Visao] => [c.id, 'sustentacao']),
    ...secoes(sustentacao.filter((c) => c.grupo !== 'complementar')).map((s): [string, Visao] => [
      s,
      'sustentacao',
    ]),
    ...secoes(sustentacao.filter((c) => c.grupo === 'complementar')).map((s): [string, Visao] => [
      `compl-${s}`,
      'sustentacao',
    ]),
    ...ANCORAS_DO_RESUMO.map((a): [string, Visao] => [a, 'resumo']),
  ]
}

export const TABELA_HASH: ReadonlyMap<string, Visao> = new Map(entradasDaTabela())

/** Visão dona do hash (sem diferenciar maiúsculas); `null` para vazio, `#mais-metricas` ou desconhecido. */
export function visaoDoHash(hash: string): Visao | null {
  const id = hash.replace(/^#/, '').toLowerCase()
  return TABELA_HASH.get(id) ?? null
}

export interface VisaoResolvida {
  visao: Visao
  /** URL canônica da visão: Resumo sem `cadencia`; as demais com ela. Os outros parâmetros ficam intactos. */
  busca: URLSearchParams
  /** `true` quando a URL atual difere da canônica (corrigir com `replace`). */
  corrigir: boolean
  invalido: string | null
}

/** Decide a visão (hash vence `cadencia`) e a URL canônica dela. */
export function resolverVisao(params: URLSearchParams, hash: string): VisaoResolvida {
  const { visao: doParametro, invalido } = lerVisao(params)
  const visao = visaoDoHash(hash) ?? doParametro
  const busca = comVisao(params, visao)
  return { visao, busca, corrigir: textoBusca(busca) !== textoBusca(params), invalido }
}

/** Cópia dos parâmetros com a visão aplicada: o Resumo remove `cadencia` (padrão), as demais a gravam. */
export function comVisao(params: URLSearchParams, visao: Visao): URLSearchParams {
  const p = new URLSearchParams(params)
  if (visao === VISAO_PADRAO) p.delete('cadencia')
  else p.set('cadencia', visao)
  return p
}

/**
 * Link para outra visão do Operacional com os dois conjuntos de filtros e os parâmetros de cartão
 * preservados. O parâmetro oculto `mock` só vai se pedido (os links nunca o propagam, 6.6).
 */
export function hrefDaVisao(
  visao: Visao,
  params: URLSearchParams,
  { hash = '', mock = false }: { hash?: string; mock?: boolean } = {},
): { pathname: string; search: string; hash: string } {
  const p = comVisao(params, visao)
  if (!mock) p.delete('mock')
  const search = textoBusca(p)
  return { pathname: '/operacional', search: search ? `?${search}` : '', hash }
}
