import {
  cartoesDoPainel,
  type CartaoId,
  type Dominio,
  type FiltrosFluxo,
  type FiltrosSustentacao,
  type MetricaId,
  type OpcoesFiltro,
} from '@metricas-dspd/contratos'
import { entradaDoCatalogo } from '@/content/catalogo-metricas'
import { lerFluxo, lerSustentacao } from '@/features/filtros/codec'
import { PAINEIS, type PainelId } from '@/features/filtros/paineis'
import type { Memoria } from '@/features/filtros/memoria'
import {
  LIMITE_METRICAS,
  ORDEM_FONTES,
  fonteExportavel,
  nomeArquivo,
  type FonteExportacao,
} from './modelo'

export type NivelExportacao = PainelId

export const NIVEIS: readonly { id: NivelExportacao; rotulo: string; rota: string }[] = [
  { id: 'operacional', rotulo: 'Operacional', rota: '/operacional' },
  { id: 'tatico', rotulo: 'Tático', rota: '/tatico' },
  { id: 'estrategico', rotulo: 'Estratégico', rota: '/estrategico' },
  { id: 'sustentacao', rotulo: 'Sustentação', rota: '/sustentacao' },
]

export interface ItemExportavel {
  /** `nivel:cartao`: único na seleção. */
  chave: string
  nivel: NivelExportacao
  codigo: string
  rotulo: string
  metrica: MetricaId
  fonte: FonteExportacao
}

/**
 * Métricas exportáveis de um nível: só as VISÍVEIS (preferências do pedido 007; métrica oculta não aparece).
 */
export function itensDoNivel(
  nivel: NivelExportacao,
  ocultos: readonly CartaoId[],
): ItemExportavel[] {
  // Complementares ficam fora da exportação nesta fase (dados fictícios; decisão pendente do usuário).
  return cartoesDoPainel(nivel)
    .filter((c) => c.grupo === 'nucleo' && !ocultos.includes(c.id))
    .flatMap((c) =>
      c.metricas.map((m) => ({
        chave: `${nivel}:${c.id}`,
        nivel,
        codigo: c.codigo,
        rotulo: c.rotulo,
        metrica: m,
        fonte: fonteExportavel(entradaDoCatalogo(m).fonte),
      })),
    )
}

export const ESCOPO_DO_NIVEL: Record<NivelExportacao, string> = {
  operacional: 'fluxo-operacional',
  tatico: 'fluxo-tatico',
  estrategico: 'fluxo-estrategico',
  sustentacao: 'sustentacao',
}

/** Escopo do nome do arquivo: uma métrica só leva o id dela; senão o escopo do painel ou "personalizada". */
export function escopoDoArquivo(
  base: 'visao-geral' | 'personalizada' | NivelExportacao,
  selecionadas: readonly { metrica: string }[],
): string {
  const unica = selecionadas.length === 1 ? selecionadas[0] : undefined
  if (unica) return unica.metrica
  if (base === 'visao-geral' || base === 'personalizada') return base
  return ESCOPO_DO_NIVEL[base]
}

export const rotuloDoEscopo = (base: 'visao-geral' | 'personalizada' | NivelExportacao): string =>
  base === 'visao-geral'
    ? 'Visão geral'
    : base === 'personalizada'
      ? 'Exportação personalizada'
      : (NIVEIS.find((n) => n.id === base) as { rotulo: string }).rotulo

export const dominioDoNivel = (nivel: NivelExportacao): Dominio =>
  nivel === 'sustentacao' ? 'acelerato' : 'businessmap'

/**
 * Filtros de um nível: os da URL se o usuário está nele; senão, no fluxo, os guardados na sessão
 * (os mesmos que os links entre painéis levam); na Sustentação, os padrões (ela é independente do fluxo).
 */
export function filtrosDoNivel(
  nivel: NivelExportacao,
  pathname: string,
  params: URLSearchParams,
  memoria: Memoria,
  opcoes: OpcoesFiltro | undefined,
): FiltrosFluxo | FiltrosSustentacao {
  const config = PAINEIS[nivel]
  const rota = NIVEIS.find((n) => n.id === nivel)?.rota
  const aqui = pathname === rota
  const restricao = { periodos: config.periodos, personalizado: config.personalizado }
  if (nivel === 'sustentacao')
    return lerSustentacao(
      aqui ? params : new URLSearchParams(),
      opcoes,
      config.periodoPadrao,
      '',
      restricao,
    ).filtros
  const origem = aqui ? params : new URLSearchParams(Object.entries(memoria))
  const f = lerFluxo(origem, opcoes, config.periodoPadrao, '', restricao).filtros
  return {
    ...f,
    equipe: config.filtros.includes('equipe') ? f.equipe : [],
    tipo: config.filtros.includes('tipo') ? f.tipo : [],
  }
}

/** Seleção inicial do "Exportar" do painel: tudo que está visível, até o limite. */
export const selecaoInicial = (itens: readonly ItemExportavel[]): string[] =>
  itens.slice(0, LIMITE_METRICAS).map((i) => i.chave)

export interface Previa {
  nome: string
  secoes: { fonte: FonteExportacao; codigos: string[] }[]
}

/** Prévia do que será gerado: nome do arquivo e as métricas de cada seção (BusinessMap, depois Acelerato). */
export function previa(
  base: 'visao-geral' | 'personalizada' | NivelExportacao,
  selecionados: readonly ItemExportavel[],
  agora: Date,
  mock: boolean,
): Previa {
  return {
    nome: nomeArquivo(escopoDoArquivo(base, selecionados), agora, mock),
    secoes: ORDEM_FONTES.map((fonte) => ({
      fonte,
      codigos: selecionados.filter((i) => i.fonte === fonte).map((i) => i.codigo),
    })).filter((s) => s.codigos.length > 0),
  }
}
