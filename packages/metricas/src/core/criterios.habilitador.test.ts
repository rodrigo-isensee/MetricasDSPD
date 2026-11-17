import { APLICABILIDADE_FLUXO } from '@metricas-dspd/contratos'
import { describe, expect, it } from 'vitest'
import { VERSAO_CRITERIO_HABILITADOR_T3, VERSOES_DA_BIBLIOTECA } from './criterios'

/** Métricas que não filtram por tipo, mas mudam com a categoria Habilitador (O14 e o T3 segmentam por tipo do card; o resto vem do tipo no filtro). */
const POR_SEGMENTACAO = ['O14', 'T3', 'EI_FL1', 'TENDENCIA_FLUXO']
/** Só leem tipos de bug: o Habilitador não as altera. */
const SO_BUG = ['O13', 'O18', 'O27']

describe('versão de critério do Habilitador (pedido 105, E7.522 A1/A2)', () => {
  const afeta = [...VERSAO_CRITERIO_HABILITADOR_T3.afeta].sort()

  it('afeta toda métrica em que o filtro Tipo atua, mais as que segmentam por tipo', () => {
    const comTipo = Object.entries(APLICABILIDADE_FLUXO)
      .filter(([, chaves]) => chaves.includes('tipo'))
      .map(([id]) => id)
    const esperado = [...new Set([...comTipo, ...POR_SEGMENTACAO])].sort()
    expect(afeta).toEqual(esperado)
  })

  it('não afeta as métricas que só leem tipos de bug', () => {
    for (const id of SO_BUG) expect(afeta).not.toContain(id)
  })

  it('não repete métrica e está na biblioteca', () => {
    expect(new Set(afeta).size).toBe(afeta.length)
    expect(VERSOES_DA_BIBLIOTECA).toContain(VERSAO_CRITERIO_HABILITADOR_T3)
  })
})
