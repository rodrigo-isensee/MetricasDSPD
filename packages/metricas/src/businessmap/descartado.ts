import type { DimCard } from './modelo'

/**
 * Única definição de "descartado" (decisão Q6): card com `motivo_descarte` preenchido.
 * Arquivado NÃO é descartado: entregue e depois arquivado é o fim normal e permanece nos cálculos.
 * Nenhum outro arquivo de métrica lê `motivo_descarte` ou `arquivado_em` (regra de lint).
 */
export const descartado = (card: DimCard): boolean => card.motivo_descarte !== null

/** Arquivado sem entrega e sem `motivo_descarte` (decisão P1): fora do "aberto", contado à parte. */
export const arquivadoSemDesfecho = (card: DimCard, entregue: boolean): boolean =>
  card.arquivado_em !== null && !descartado(card) && !entregue

/** Já estava arquivado no instante `t` (retrato histórico). */
export const arquivadoAte = (card: DimCard, t: number): boolean =>
  card.arquivado_em !== null && card.arquivado_em <= t

/** Fora do trabalho aberto em `t` por arquivamento: arquivado até `t` e fora de "entrega" (P1). */
export const arquivadoForaDoAbertoEm = (card: DimCard, t: number, naEntrega: boolean): boolean =>
  arquivadoAte(card, t) && !naEntrega

/** Fim da vida "aberta" do card para varreduras de faixas: o instante do arquivamento, se houver. */
export const fimDeVidaAberta = (card: DimCard): number => card.arquivado_em ?? Infinity

/*
 * Descarte do O25 (R-2' = A, P-1 = A). Descartado é o card com estado nativo `discarded` do BusinessMap e também o
 * excluído. O modelo da fase 1 não carrega o estado nativo nem o `discarded_at`: o gerador sempre arquiva junto com o
 * motivo, então `motivo_descarte` + `arquivado_em` é a projeção do estado `discarded` e o instante do arquivamento é a
 * projeção do `discarded_at`. Na coleta real a projeção troca pelos campos nativos, aqui, e nenhuma métrica muda.
 * `discard_comment` (texto livre) nunca é lido.
 */

/** Descartado pela definição nativa: estado `discarded` (projeção da fase 1) ou card excluído. */
export const descartadoNativo = (card: DimCard): boolean =>
  card.excluido_em !== null || (card.motivo_descarte !== null && card.arquivado_em !== null)

/** Motivo preenchido sem descarte nem exclusão: aviso de preenchimento, fora da taxa (CA-26). */
export const motivoSemDescarte = (card: DimCard): boolean =>
  card.motivo_descarte !== null && !descartadoNativo(card)

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
): InstanteDoDescarte | null => {
  if (card.excluido_em !== null) return instanteDeExcluido(card.excluido_em, ultimaRevisao)
  if (card.motivo_descarte !== null && card.arquivado_em !== null)
    return { instante: card.arquivado_em, aproximado: false }
  return null
}
