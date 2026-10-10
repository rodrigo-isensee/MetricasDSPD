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
