import type { ResultadoO17, FiltrosFluxo } from '@metricas-dspd/contratos'
import { CAUSAS_RAIZ } from '@metricas-dspd/contratos'
import { ordenarNeutro } from '../core/ordenar'
import { ehBugCard } from './apoio'
import { baseAmostral, criterios, dentro, periodoDe, selecionar } from './comum'
import type { ContextoBM } from './indice'
import { EXTENSAO_BM_VAZIA, type ExtensaoBM } from './extensao'

/** O17: bugs concluídos por causa raiz e por sistema (módulo = sistema, a confirmar). Contagem, sem mínimo. */
export function calcularO17(
  ctx: ContextoBM,
  f: FiltrosFluxo,
  ext: ExtensaoBM = EXTENSAO_BM_VAZIA,
): ResultadoO17 {
  const periodo = periodoDe(ctx, f)
  const bugs = selecionar(ctx, f, 'story', { semTipo: true })
    .filter(ehBugCard)
    .filter((m) => dentro(ctx, m.entrega, periodo))
  const causa = (id: string) => ext.causasRaiz[id] ?? 'Não informada'
  const sistemas = [...new Set(bugs.map((m) => m.card.sistema))].map((sistema) => ({
    sistema,
    n: bugs.filter((m) => m.card.sistema === sistema).length,
  }))
  return {
    base: baseAmostral(bugs.length, 'bugs concluídos', periodo),
    criterios: criterios('O17', periodo, periodo, ctx),
    porCausa: [...CAUSAS_RAIZ, 'Não informada' as const]
      .map((c) => ({ causa: c, n: bugs.filter((m) => causa(m.card.card_id) === c).length }))
      .filter((x) => x.causa !== 'Não informada' || x.n > 0),
    porSistema: ordenarNeutro(sistemas, (s) => [-s.n, s.sistema]),
  }
}
