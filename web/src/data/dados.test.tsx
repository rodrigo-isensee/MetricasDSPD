import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { entradaDoCatalogo } from '@/content/catalogo-metricas'
import { FonteMetricasProvider, MockFonteMetricas, useFonte } from '.'
import type { FonteMetricas } from './FonteMetricas'
import { useMetrica } from './useMetrica'

afterEach(() => vi.useRealTimers())

describe('catálogo e provedor de fonte', () => {
  it('métrica fora do catálogo é erro de programação', () => {
    expect(entradaDoCatalogo('O3').codigo).toBe('O3')
    expect(() => entradaDoCatalogo('XX' as never)).toThrow('Métrica fora do catálogo: XX')
  })

  it('useFonte fora do provedor falha com mensagem clara', () => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => renderHook(() => useFonte())).toThrow('useFonte fora de <FonteMetricasProvider>')
    erro.mockRestore()
  })
})

describe('useMetrica com fonte real (API)', () => {
  it('o parâmetro oculto ?mock= é ignorado quando a fonte não é mock', async () => {
    const fonte = {
      tipo: 'api',
      obter: vi.fn().mockResolvedValue({ base: { n: 5 } }),
    } as unknown as FonteMetricas
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={new QueryClient()}>
        <FonteMetricasProvider fonte={fonte}>
          <MemoryRouter initialEntries={['/x?mock=erro']}>{children}</MemoryRouter>
        </FonteMetricasProvider>
      </QueryClientProvider>
    )
    const { result } = renderHook(
      () => useMetrica('O4', { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.estado).toBe('ok'))
    expect(fonte.obter).toHaveBeenCalledTimes(1)
  })
})

describe('MockFonteMetricas: opções e latência', () => {
  it('aceita semente e data de corte; sem latência fixa, sorteia um atraso por chamada', async () => {
    const fonte = new MockFonteMetricas({ semente: 7, hoje: '2026-09-30' })
    expect(await fonte.dataReferencia()).toBe('2026-09-30')
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const p = fonte.obter('O1', { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } })
    await vi.advanceTimersByTimeAsync(500)
    expect((await p).base.n).toBeGreaterThanOrEqual(0)
  })
})
