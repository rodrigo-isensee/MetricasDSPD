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

  it('classifica os cartões: mock só onde falta fonte real (O17, T8, E4, S8, S11, S12)', () => {
    const compl = CATALOGO_CARTOES.filter((c) => c.grupo === 'complementar')
    expect(compl.map((c) => c.codigo).sort()).toEqual(
      [
        'O5',
        'O6',
        'O8',
        'O11',
        'O13',
        'O14',
        'O16',
        'O17',
        'T6',
        'T8',
        'E4',
        'E5',
        'S8',
        'S9',
        'S10',
        'S11',
        'S12',
      ].sort(),
    )
    const mock = ['O17', 'T8', 'E4', 'S8', 'S11', 'S12']
    for (const c of compl) expect(c.status).toBe(mock.includes(c.codigo) ? 'mock' : 'disponivel')
    for (const c of CATALOGO_CARTOES.filter((x) => x.grupo === 'nucleo'))
      expect(c.status).toBe('disponivel')
    expect(CATALOGO_CARTOES.filter((c) => c.grupo === 'nucleo')).toHaveLength(32)
  })

  it('torna as 17 complementares alcançáveis por "leia junto" a partir do núcleo', () => {
    const alcancadas = new Set(
      CATALOGO_CARTOES.filter((c) => c.grupo === 'nucleo').flatMap((c) => c.leiaJunto ?? []),
    )
    for (const c of CATALOGO_CARTOES.filter((x) => x.grupo === 'complementar'))
      expect(alcancadas.has(c.id), c.codigo).toBe(true)
  })

  it('põe a O17 na Sustentação, nunca no BusinessMap', () => {
    expect(cartaoPorId('sustentacao', 'o17')?.grupo).toBe('complementar')
    expect(cartaoPorId('operacional', 'o17')).toBeUndefined()
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
