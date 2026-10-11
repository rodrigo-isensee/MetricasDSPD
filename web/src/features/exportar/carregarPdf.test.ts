import { describe, expect, it } from 'vitest'
import { carregarPdf } from './carregarPdf'

describe('carregarPdf (chunk exportar-pdf)', () => {
  it('importa o desenhista sob demanda e cria um A4 retrato com título e idioma pt-BR', async () => {
    const { novoDocumento } = await carregarPdf()
    const doc = novoDocumento('Métricas DSPD · teste')
    expect(doc.internal.pageSize.getWidth()).toBeCloseTo(210, 0)
    expect(doc.internal.pageSize.getHeight()).toBeCloseTo(297, 0)
    expect(doc.output()).toContain('/Title (')
    expect(doc.output().includes('/Lang (pt-BR)')).toBe(true)
  })
})
