import { describe, expect, it } from 'vitest'
import { NOTAS_COMPLEMENTARES } from './notas'

describe('notas complementares', () => {
  it('nenhum texto termina em ".." (ponto duplicado)', () => {
    const textos = Object.entries(NOTAS_COMPLEMENTARES).flatMap(([id, nota]) =>
      Object.values(nota).map((t) => ({ id, t: String(t) })),
    )
    expect(textos.filter(({ t }) => t.trimEnd().endsWith('..'))).toEqual([])
  })
})
