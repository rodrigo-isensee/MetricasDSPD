import type { DimCard } from './modelo'

/*
 * Descartado pela definição nativa (R-2' = A, P-1 = A: vale em todas as métricas): estado `discarded` do BusinessMap
 * ou card excluído. O modelo da fase 1 não carrega o estado nativo nem o `discarded_at`: o gerador sempre arquiva junto
 * com o motivo, então `motivo_descarte` + `arquivado_em` é a projeção do estado `discarded` e o instante do
 * arquivamento é a projeção do `discarded_at`. Na coleta real a projeção troca pelos campos nativos, aqui, e nenhuma
 * métrica muda. `discard_comment` (texto livre) nunca é lido.
 */
export const descartadoNativo = (card: DimCard, entrega: number | null): boolean =>
  (card.excluido_em !== null && !entregueAntesDeExcluir(card, entrega)) ||
  (card.motivo_descarte !== null && card.arquivado_em !== null)

/**
 * O25(b) = B (2026-10-16): card entregue e excluído depois NÃO é descarte; segue como entrega na vazão e no ciclo.
 * `entrega` é a entrega vigente do card (`null` se não está entregue agora, inclusive reaberto): excluído sem entrega
 * vigente no instante da exclusão continua sendo descarte. Registrada como `VERSAO_CRITERIO_EXCLUIDO_ENTREGUE` (T2.6).
 */
export const entregueAntesDeExcluir = (card: DimCard, entrega: number | null): boolean =>
  card.excluido_em !== null && entrega !== null && entrega <= card.excluido_em

/**
 * Única definição de "descartado" (P-1 = A, 2026-10-14; substitui a Q6, em que bastava `motivo_descarte` preenchido).
 * Motivo preenchido sem descarte nem exclusão não descarta: o card segue nos cálculos e vira aviso de preenchimento no
 * O25. Arquivado NÃO é descartado: entregue e depois arquivado é o fim normal e permanece nos cálculos. Entregue e depois
 * excluído também não é descarte (O25(b) = B, 2026-10-16).
 * Registrada como `VERSAO_CRITERIO_DESCARTE_NATIVO` (T2.6). Nenhum outro arquivo de métrica lê `motivo_descarte`
 * ou `arquivado_em` (regra de lint).
 */
export const descartado = (card: DimCard, entrega: number | null): boolean =>
  descartadoNativo(card, entrega)

/** Arquivado sem entrega e sem `motivo_descarte` (decisão P1): fora do "aberto", contado à parte. */
export const arquivadoSemDesfecho = (card: DimCard, entrega: number | null): boolean =>
  card.arquivado_em !== null && !descartado(card, entrega) && entrega === null

/** Já estava arquivado no instante `t` (retrato histórico). */
export const arquivadoAte = (card: DimCard, t: number): boolean =>
  card.arquivado_em !== null && card.arquivado_em <= t

/** Fora do trabalho aberto em `t` por arquivamento: arquivado até `t` e fora de "entrega" (P1). */
export const arquivadoForaDoAbertoEm = (card: DimCard, t: number, naEntrega: boolean): boolean =>
  arquivadoAte(card, t) && !naEntrega

/** Fim da vida "aberta" do card para varreduras de faixas: o instante do arquivamento, se houver. */
export const fimDeVidaAberta = (card: DimCard): number => card.arquivado_em ?? Infinity

/** Motivo preenchido sem descarte nem exclusão: aviso de preenchimento, fora da taxa (CA-26). */
export const motivoSemDescarte = (card: DimCard, entrega: number | null): boolean =>
  card.motivo_descarte !== null && !descartadoNativo(card, entrega)

export interface InstanteDoDescarte {
  instante: number
  /** Veio da última revisão, por falta do instante da exclusão. */
  aproximado: boolean
}

/** Instante da exclusão; sem ele, a última revisão do card, marcada como aproximada (decisão de 2026-10-14). */
export const instanteDeExcluido = (
  excluidoEm: number | null,
  ultimaRevisao: number,
): InstanteDoDescarte =>
  excluidoEm === null
    ? { instante: ultimaRevisao, aproximado: true }
    : { instante: excluidoEm, aproximado: false }

/**
 * Instante do descarte de um card descartado pela definição nativa (`null` se não é descartado): o da exclusão no
 * excluído; no descartado, o `discarded_at` (projeção da fase 1: o arquivamento). `ultimaRevisao` só serve de reserva.
 */
export const instanteDoDescarte = (
  card: DimCard,
  ultimaRevisao: number,
  entrega: number | null,
): InstanteDoDescarte | null => {
  if (card.excluido_em !== null && !entregueAntesDeExcluir(card, entrega))
    return instanteDeExcluido(card.excluido_em, ultimaRevisao)
  if (card.motivo_descarte !== null && card.arquivado_em !== null)
    return { instante: card.arquivado_em, aproximado: false }
  return null
}
