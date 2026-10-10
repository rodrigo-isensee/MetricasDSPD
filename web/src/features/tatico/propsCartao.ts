import { APLICABILIDADE_FLUXO } from '@metricas-dspd/contratos'
import type { BaseAmostral, CriteriosResultado, MetricaId } from '@metricas-dspd/contratos'
import type { TextoNota } from '@/components/ui'
import { entradaDoCatalogo } from '@/content/catalogo-metricas'
import type { MetricaQuery } from '@/data'

/** Props comuns a todo cartão de fluxo (nome, pergunta, meta, fonte e estados vêm do catálogo e do DTO). */
export function propsCartao(
  codigo: MetricaId,
  q: MetricaQuery<{ base: BaseAmostral; criterios: CriteriosResultado }>,
  nota: TextoNota,
) {
  const m = entradaDoCatalogo(codigo)
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
    aplicaveis: APLICABILIDADE_FLUXO[codigo] ?? [],
    onTentarDeNovo: q.recarregar,
    erro: q.erro,
  } as const
}

/** Valor de URL de uma classe de serviço ("Prazo fixo" -> "prazo-fixo"). */
export const slug = (s: string): string =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, '-')
