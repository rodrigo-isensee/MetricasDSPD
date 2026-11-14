import { APLICABILIDADE_FLUXO } from '@metricas-dspd/contratos'
import type { BaseAmostral, CriteriosResultado, MetricaId } from '@metricas-dspd/contratos'
import type { TextoNota } from '@/components/ui'
import type { FiltroCartaoChave } from '@/components/ui/CartaoMetrica'
import { entradaDoCatalogo } from '@/content/catalogo-metricas'
import type { MetricaQuery } from '@/data'

/**
 * Métricas em que a Equipe atua mas o Setor não declara atuar até o L10b decidir: no T14 a equipe só diz qual é
 * "meu time" e não recorta a população (o cartão diz "Não afetado por: Setor" em vez de prometer um recorte).
 */
const SEM_SETOR: ReadonlySet<MetricaId> = new Set<MetricaId>(['T14'])

/**
 * Filtros que atuam na métrica (tabela 2.2); métrica sem aplicabilidade de fluxo declarada: nenhum. O Setor atua
 * onde a Equipe atua (recorte por cards); nos cartões de projeto (FL3), que não têm equipe, ele não atua (P-097-10).
 */
export const aplicaveisDe = (id: MetricaId): readonly FiltroCartaoChave[] => {
  const base = APLICABILIDADE_FLUXO[id] ?? []
  return base.includes('equipe') && !SEM_SETOR.has(id) ? ['setor', ...base] : base
}

/** Props comuns de um cartão do Operacional (nome, pergunta, meta e fonte vêm do catálogo; base e critérios, do DTO). */
export function propsCartao(
  id: MetricaId,
  q: MetricaQuery<{ base: BaseAmostral; criterios: CriteriosResultado }>,
  nota: TextoNota,
) {
  const m = entradaDoCatalogo(id)
  return {
    codigo: m.codigo,
    titulo: m.nome,
    pergunta: m.pergunta,
    estado: q.estado,
    atualizando: q.atualizando,
    ...(q.dados ? { base: q.dados.base, criterios: q.dados.criterios } : {}),
    nota,
    meta: m.meta,
    fonte: m.fonte,
    granularidade: m.granularidade,
    aplicaveis: aplicaveisDe(id),
    onTentarDeNovo: q.recarregar,
    erro: q.erro,
  } as const
}

/** Valor de URL de um tipo ("Dívida técnica" -> "divida-tecnica"). */
export const slug = (s: string): string =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, '-')

/** Dia civil numérico (eixo de data das dispersões) e o inverso para o rótulo. */
export const diaNum = (iso: string): number =>
  Math.floor(Date.parse(`${iso}T00:00:00Z`) / 86_400_000)
export const isoDoDia = (n: number): string => new Date(n * 86_400_000).toISOString().slice(0, 10)

/** Taxa já decidida pela biblioteca: percentual com 20 itens ou mais, "k de n" abaixo (4.0.2). */
export function textoTaxa(t: {
  status: 'ok' | 'insuficiente'
  k: number
  n: number
  pct?: number
}): string {
  return t.status === 'ok' && t.pct !== undefined
    ? `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(t.pct)}%`
    : `${t.k} de ${t.n}`
}
