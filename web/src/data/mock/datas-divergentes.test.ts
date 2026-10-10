import { describe, expect, it, vi } from 'vitest'

// Isolado em arquivo próprio: o mock do módulo vale para todo o arquivo.
vi.mock('@metricas-dspd/metricas', async (importar) => {
  const real = await importar<typeof import('@metricas-dspd/metricas')>()
  return {
    ...real,
    acelerato: {
      ...real.acelerato,
      criarContextoAC: (...a: Parameters<typeof real.acelerato.criarContextoAC>) => ({
        ...real.acelerato.criarContextoAC(...a),
        hojeIso: '2000-01-01',
      }),
    },
  }
})

describe('MockFonteMetricas: uma só data de corte', () => {
  it('se os contextos do BusinessMap e do Acelerato divergirem na data de corte, falha em vez de mostrar dados incoerentes', async () => {
    const { MockFonteMetricas } = await import('./MockFonteMetricas')
    const fonte = new MockFonteMetricas({ latenciaMs: 0 })
    await expect(fonte.dataReferencia()).rejects.toThrow(/Datas de corte divergentes/)
  })
})
