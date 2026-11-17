import { CAUSAS_RAIZ_BUG, type FiltrosFluxo, type ResultadoO27 } from '@metricas-dspd/contratos'
import { taxa } from '../core/estatistica'
import { ehBugCard } from './apoio'
import { baseAmostral, criterios, dentro, janelaPercentis, periodoDe, selecionar } from './comum'
import { instanteDoDescarte } from './descartado'
import type { ContextoBM } from './indice'

/** Motivo de `porSistema` nulo: o campo Sistema afetado ainda não existe no BusinessMap, e não há de-para com as categorias do Acelerato. */
export const MOTIVO_O27_POR_SISTEMA = 'aguardando o campo Sistema afetado no BusinessMap'

const TIPOS_BUG = ['Bug interno', 'Defeito em produção'] as const
const CODIGOS: ReadonlySet<string> = new Set(CAUSAS_RAIZ_BUG.map((c) => c.codigo))

/**
 * O27: causa raiz dos bugs do BusinessMap (campo 48), por tipo. Entram os bugs fechados na janela de 12 semanas: concluídos ou descartados
 * (arquivados entram; excluídos e subtarefas ficam fora). O filtro de tipo não atua (cada tipo é uma coluna). O mínimo de 20 vale por tipo
 * sobre os bugs com causa; sem causa (ou com valor fora do domínio) conta à parte e nunca entra no denominador. Nenhum dado do Acelerato.
 */
export function calcularO27(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO27 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f, 'story')
  const fechados = selecionar(ctx, f, 'story', { semTipo: true, incluirInativos: true })
    .filter((m) => ehBugCard(m) && !m.excluido && !m.card.eh_subtarefa)
    .filter((m) => {
      const instante =
        m.entrega ??
        // O excluído já saiu acima; no descartado o instante é o do arquivamento, e a última revisão (reserva do excluído) não é usada.
        instanteDoDescarte(m.card, m.card.criado_em, m.entrega)?.instante ??
        null
      return dentro(ctx, instante, janela)
    })
  /** As 12 opções do campo, na ordem do campo, com n e % sobre os bugs com causa; `null` abaixo de 20 (a taxa da biblioteca não publica). */
  const causasDe = (comCausa: number, conta: (codigo: string) => number) => {
    const linhas = CAUSAS_RAIZ_BUG.flatMap((c) => {
      const t = taxa(conta(c.codigo), comCausa)
      return t.status === 'ok' ? [{ causa: c.codigo, rotulo: c.rotulo, n: t.k, pct: t.pct }] : []
    })
    return linhas.length > 0 ? linhas : null
  }
  const porTipo = TIPOS_BUG.map((tipo) => {
    const doTipo = fechados.filter((m) => m.card.tipo === tipo)
    const causaDe = (m: (typeof doTipo)[number]): string | null =>
      m.card.causa_raiz !== null && CODIGOS.has(m.card.causa_raiz) ? m.card.causa_raiz : null
    const comCausa = doTipo.filter((m) => causaDe(m) !== null)
    const conta = (codigo: string) => comCausa.filter((m) => causaDe(m) === codigo).length
    return {
      tipo,
      n: doTipo.length,
      naoEBug: conta('nao_e_bug'),
      naoInformada: doTipo.length - comCausa.length,
      comCausa: comCausa.length,
      causas: causasDe(comCausa.length, conta),
    }
  })
  return {
    base: baseAmostral(fechados.length, 'bugs fechados', janela),
    criterios: criterios('O27', periodo, janela, ctx),
    porTipo,
    porSistema: null,
    motivoPorSistema: MOTIVO_O27_POR_SISTEMA,
  }
}
