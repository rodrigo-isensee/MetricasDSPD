import type { CartaoCatalogo } from '@metricas-dspd/contratos'

/** Cartões da visão diária do Operacional (a faixa do dia); os demais vivem na semanal. */
const CARTOES_DA_DIARIA: readonly string[] = ['o2', 'bloqueados', 'o1']

/**
 * Endereço de um cartão: o painel e o hash do cartão. No Operacional a visão diária só tem a faixa do dia
 * (O2, bloqueados e O1); os demais cartões (e a seção "Mais métricas") vivem na semanal, então o link já
 * pede `cadencia=semanal`. Os da faixa do dia ficam na diária (o padrão), onde o cartão existe.
 */
export function destinoDoCartao(c: Pick<CartaoCatalogo, 'painel' | 'id'>): string {
  const semanal = c.painel === 'operacional' && !CARTOES_DA_DIARIA.includes(c.id)
  return `/${c.painel}${semanal ? '?cadencia=semanal' : ''}#${c.id}`
}
