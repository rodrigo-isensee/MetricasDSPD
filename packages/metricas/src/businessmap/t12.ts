import type { FiltrosFluxo, MotivoBloqueio, ResultadoT12 } from '@metricas-dspd/contratos'
import { taxa } from '../core/estatistica'
import { ordenarNeutro } from '../core/ordenar'
import { baseAmostral, criterios, dentro, ehDemanda, periodoDe, selecionar } from './comum'
import type { ContextoBM, MarcosCard } from './indice'

/** Motivo do bloqueio que conta como "ida e volta" na entrada (D-8 = A). */
export const MOTIVO_IDA_E_VOLTA: MotivoBloqueio = 'Falta de informação no chamado'

/**
 * D-8 = A, os dois critérios com OU (o card que tem os dois conta uma vez só):
 * (a) bloqueio com motivo "Falta de informação no chamado" que começou antes do início (ou o card nunca iniciou);
 * (b) retorno da coluna de papel `compromisso` para a de papel `backlog`.
 */
export function teveIdaEVolta(ctx: ContextoBM, m: MarcosCard): boolean {
  const id = m.card.card_id
  const porBloqueio = (ctx.idx.bloqueiosPorCard.get(id) ?? []).some(
    (b) => b.motivo === MOTIVO_IDA_E_VOLTA && (m.inicio === null || b.inicio < m.inicio),
  )
  if (porBloqueio) return true
  return (ctx.idx.transicoesPorCard.get(id) ?? []).some(
    (t) =>
      t.coluna_origem !== null &&
      ctx.idx.papelDe(m.card.quadro_id, t.coluna_origem)?.papel === 'compromisso' &&
      ctx.idx.papelDe(m.card.quadro_id, t.coluna_destino)?.papel === 'backlog',
  )
}

/**
 * T12: qualidade da entrada por área solicitante. Demandas (story que não é bug interno) criadas no período;
 * por área, k com ida e volta de n demandas, em ordem de volume (neutra, nunca por pior desempenho: CA-11).
 * O percentual só sai com n >= 20 (total e por área; abaixo, "k de n"), pela biblioteca. A linha é a área
 * solicitante (dimensão permitida), nunca a equipe do DSPD nem pessoa.
 */
export function calcularT12(ctx: ContextoBM, f: FiltrosFluxo): ResultadoT12 {
  const periodo = periodoDe(ctx, f)
  const itens = selecionar(ctx, f, 'story')
    .filter(ehDemanda)
    .filter((m) => dentro(ctx, m.card.criado_em, periodo))
    .map((m) => ({ area: m.card.area_solicitante, ida: teveIdaEVolta(ctx, m) }))
  const porArea = new Map<string, { k: number; n: number }>()
  for (const i of itens) {
    const a = porArea.get(i.area) ?? { k: 0, n: 0 }
    a.n++
    if (i.ida) a.k++
    porArea.set(i.area, a)
  }
  const areas = ordenarNeutro([...porArea], ([area, v]) => [-v.n, area]).map(([area, v]) => ({
    area,
    taxa: taxa(v.k, v.n),
  }))
  return {
    base: baseAmostral(itens.length, 'demandas criadas', periodo),
    criterios: criterios('T12', periodo, periodo, ctx),
    total: taxa(itens.filter((i) => i.ida).length, itens.length),
    areas,
  }
}
