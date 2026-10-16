import type { CartaoCatalogo } from '@metricas-dspd/contratos'
import { visaoDoHash } from '@/features/navegacao/visao'

/**
 * Endereço de um cartão: sempre dentro do Operacional, na visão dona do cartão (tabela hash → visão):
 * a faixa do dia na Diária, os demais cartões do fluxo na Semanal e os da sustentação na Sustentação.
 * Os outros painéis têm rota própria.
 */
export function destinoDoCartao(c: Pick<CartaoCatalogo, 'painel' | 'id'>): string {
  if (c.painel === 'sustentacao') return `/operacional?cadencia=sustentacao#${c.id}`
  if (c.painel === 'operacional')
    // Todo cartão do painel `operacional` está na tabela (teste de unicidade e de cobertura do catálogo).
    return `/operacional?cadencia=${visaoDoHash(`#${c.id}`) as string}#${c.id}`
  return `/${c.painel}#${c.id}`
}
