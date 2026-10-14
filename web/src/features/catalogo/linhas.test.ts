import { describe, expect, it, vi } from 'vitest'

vi.mock('@metricas-dspd/contratos', async (importar) => ({
  ...(await importar<typeof import('@metricas-dspd/contratos')>()),
  CATALOGO_CARTOES: [],
}))

describe('linhasDoCatalogo com catálogo inconsistente', () => {
  it('falha com erro explícito quando uma métrica não tem cartão', async () => {
    const { linhasDoCatalogo } = await import('./linhas')
    expect(() => linhasDoCatalogo()).toThrow(/Catálogo inconsistente/)
  })
})
