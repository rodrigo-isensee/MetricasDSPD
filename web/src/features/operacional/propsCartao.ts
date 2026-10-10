import { APLICABILIDADE_FLUXO } from '@metricas-dspd/contratos'
import type { BaseAmostral, CriteriosResultado, MetricaId } from '@metricas-dspd/contratos'
import type { TextoNota } from '@/components/ui'
import { entradaDoCatalogo } from '@/content/catalogo-metricas'
import type { MetricaQuery } from '@/data'

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
    aplicaveis: APLICABILIDADE_FLUXO[id] ?? [],
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
