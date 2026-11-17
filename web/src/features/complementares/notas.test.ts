import { describe, expect, it } from 'vitest'
import { NOTAS_COMPLEMENTARES } from './notas'

describe('notas complementares', () => {
  it('nenhum texto termina em ".." (ponto duplicado)', () => {
    const textos = Object.entries(NOTAS_COMPLEMENTARES).flatMap(([id, nota]) =>
      Object.values(nota).map((t) => ({ id, t: String(t) })),
    )
    expect(textos.filter(({ t }) => t.trimEnd().endsWith('..'))).toEqual([])
  })

  it('S9 avisa que o motivo da pendência não é preenchido no Acelerato', () => {
    expect(NOTAS_COMPLEMENTARES.S9.cuidados).toContain(
      'O motivo da pendência não está sendo preenchido no Acelerato; por isso aparece como Não classificado.',
    )
  })

  it('T15 não promete um time só: o "O que é" fala do recorte do filtro de time', () => {
    expect(NOTAS_COMPLEMENTARES.T15.oQueE).toBe(
      'Quantos dias úteis dura uma sprint, do começo ao fim, nas sprints do recorte do filtro de time.',
    )
    expect(NOTAS_COMPLEMENTARES.T15.oQueE).not.toContain('time escolhido')
  })
})
