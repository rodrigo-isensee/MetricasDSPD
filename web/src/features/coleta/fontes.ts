import type { Dominio } from '@metricas-dspd/contratos'

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

/** Fontes que cada rota usa; a calibração só espera o estado dessas (Visão geral e Espera invisível usam as duas). */
export function dominiosDaRota(caminho: string): readonly Dominio[] {
  if (caminho === '/sustentacao') return ['acelerato']
  if (caminho === '/' || caminho === '/espera-invisivel' || caminho === '/dados')
    return ['businessmap', 'acelerato']
  return ['businessmap']
}
