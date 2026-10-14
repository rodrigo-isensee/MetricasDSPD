import type { Dominio } from '@metricas-dspd/contratos'
import { resolverVisao } from '@/features/operacional/visao'

export const NOME_FONTE: Record<Dominio, string> = {
  businessmap: 'BusinessMap',
  acelerato: 'Acelerato',
}

/** Valor de `?fonte=` em `/dados`. */
export const SIGLA_FONTE: Record<Dominio, 'bm' | 'ac'> = { businessmap: 'bm', acelerato: 'ac' }

export const DOMINIO_DA_SIGLA: Record<'bm' | 'ac', Dominio> = {
  bm: 'businessmap',
  ac: 'acelerato',
}

export const ROTA_DADOS = '/dados'

/**
 * Fontes que cada rota usa; a calibração só espera o estado dessas (a Visão geral e o Resumo do Operacional usam as
 * duas). Em `/operacional` a fonte vem da visão (parâmetro `cadencia` e hash).
 */
export function dominiosDaRota(caminho: string, busca = '', hash = ''): readonly Dominio[] {
  if (caminho === '/operacional') {
    const { visao } = resolverVisao(new URLSearchParams(busca), hash)
    if (visao === 'resumo') return ['businessmap', 'acelerato']
    return visao === 'sustentacao' ? ['acelerato'] : ['businessmap']
  }
  if (caminho === '/' || caminho === '/dados') return ['businessmap', 'acelerato']
  return ['businessmap']
}
