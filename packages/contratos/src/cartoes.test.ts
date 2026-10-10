import { describe, expect, it } from 'vitest'
import {
  CARTOES_RETIRADOS,
  CATALOGO_CARTOES,
  PAINEIS_COM_CARTOES,
  PAINEIS_DO_PAPEL,
  PAPEIS,
  PREFERENCIAS_PADRAO,
  cartaoPorId,
  cartoesDoPainel,
  preferenciasMetricasSchema,
} from './cartoes'
import { METRICA_IDS } from './comum'

describe('catálogo de cartões', () => {
  it('tem ids únicos por painel, em minúsculas, e métricas válidas', () => {
    for (const p of PAINEIS_COM_CARTOES) {
      const ids = cartoesDoPainel(p).map((c) => c.id)
      expect(new Set(ids).size).toBe(ids.length)
      expect(ids.length).toBeGreaterThan(0)
    }
    for (const c of CATALOGO_CARTOES) {
      expect(c.id).toBe(c.codigo.toLowerCase())
      for (const m of c.metricas) expect(METRICA_IDS).toContain(m)
    }
  })

  it('aponta pares "leia junto" que existem no mesmo painel', () => {
    for (const c of CATALOGO_CARTOES)
      for (const par of c.leiaJunto ?? []) expect(cartaoPorId(c.painel, par)).toBeDefined()
  })

  it('acha por id e devolve undefined para o inexistente', () => {
    expect(cartaoPorId('operacional', 'o9')?.codigo).toBe('O9')
    expect(cartaoPorId('tatico', 'o9')).toBeUndefined()
    expect(CARTOES_RETIRADOS).toEqual({})
  })

  it('sugere conjuntos só por painéis', () => {
    expect(PAPEIS.map((p) => PAINEIS_DO_PAPEL[p])).toEqual([
      ['operacional'],
      ['operacional', 'tatico'],
      ['tatico', 'estrategico'],
    ])
  })

  it('valida o formato das preferências', () => {
    expect(preferenciasMetricasSchema.safeParse(PREFERENCIAS_PADRAO).success).toBe(true)
    expect(preferenciasMetricasSchema.safeParse({ versao: 2 }).success).toBe(false)
  })
})
