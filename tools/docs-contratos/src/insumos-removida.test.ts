import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@metricas-dspd/contratos/validacao', async (importOriginal) => {
  const real = await importOriginal<typeof import('@metricas-dspd/contratos/validacao')>()
  const { O3: _removida, ...resto } = real.SCHEMAS_RESULTADO as Record<string, unknown>
  return { ...real, SCHEMAS_RESULTADO: resto }
})

import { carregarInsumos } from './insumos.ts'

describe('métrica removida de SCHEMAS_RESULTADO', () => {
  it('dá mensagem clara de contrato removido, não "Cannot read properties of undefined"', () => {
    const raiz = resolve(import.meta.dirname, '../../..')
    expect(() => carregarInsumos(raiz)).toThrow(
      /^contrato resultados\/O3 removido: incompatível, exige aceite/,
    )
  })
})
