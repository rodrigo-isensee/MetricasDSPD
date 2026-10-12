import type { CartaoCatalogo } from '@metricas-dspd/contratos'

/**
 * Endereço de um cartão: o painel e o hash do cartão. No Operacional a visão diária só tem a faixa do dia;
 * os demais cartões (e a seção "Mais métricas") vivem na semanal, então o link já pede `cadencia=semanal`.
 */
export function destinoDoCartao(c: Pick<CartaoCatalogo, 'painel' | 'id'>): string {
  return `/${c.painel}${c.painel === 'operacional' ? '?cadencia=semanal' : ''}#${c.id}`
}
