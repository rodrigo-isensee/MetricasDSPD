import { corpoSemDadoReal, type MetricaId } from '@metricas-dspd/contratos'
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HttpFonteMetricas } from '@/data'
import { App, criarFontePadrao, criarQueryClient } from './App'

afterEach(() => vi.unstubAllEnvs())

describe('App e composição', () => {
  it('o cliente de dados não tenta de novo nem atualiza sozinho', () => {
    const q = criarQueryClient().getDefaultOptions().queries
    expect(q).toMatchObject({ retry: false, staleTime: Infinity, refetchOnWindowFocus: false })
  })

  it('a fonte padrão lê semente, data e latência das variáveis públicas', async () => {
    vi.stubEnv('VITE_FONTE', 'mock')
    vi.stubEnv('VITE_MOCK_SEMENTE', '7')
    vi.stubEnv('VITE_MOCK_HOJE', '2026-10-09')
    vi.stubEnv('VITE_MOCK_LATENCIA', '0')
    const fonte = criarFontePadrao()
    expect(await fonte.dataReferencia()).toBe('2026-10-09')
  })

  it('sem variáveis, a fonte é a API: o mock só liga com VITE_FONTE=mock explícito (pedido 060)', () => {
    expect(criarFontePadrao().tipo).toBe('api')
    vi.stubEnv('VITE_FONTE', 'mock')
    expect(criarFontePadrao().tipo).toBe('mock')
  })

  it('VITE_FONTE=api escolhe a fonte HTTP, com a base padrão ou a configurada', async () => {
    vi.stubEnv('VITE_FONTE', 'api')
    const f = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(() => Promise.resolve(new Response('[]')))
    const fonte = criarFontePadrao()
    expect(fonte.tipo).toBe('api')
    await fonte.criterios()
    vi.stubEnv('VITE_API_BASE', '/v9')
    await criarFontePadrao().criterios()
    expect(f.mock.calls.map((c) => c[0])).toStrictEqual(['/api/v1/criterios', '/v9/criterios'])
    f.mockRestore()
  })

  it('a fonte padrão (api) é a HTTP pura, sem o decorador de simulado (pedido 099)', () => {
    vi.stubEnv('VITE_FONTE', 'api')
    expect(criarFontePadrao()).toBeInstanceOf(HttpFonteMetricas)
  })

  it('sem dado real, nenhum cartão do Operacional mostra o selo "Simulado", mesmo com a API marcando simulavel', async () => {
    vi.stubEnv('VITE_FONTE', 'api')
    const f = vi.spyOn(globalThis, 'fetch').mockImplementation((entrada: RequestInfo | URL) => {
      const url =
        typeof entrada === 'string' ? entrada : entrada instanceof URL ? entrada.href : entrada.url
      const m = /\/metricas\/([A-Za-z0-9-]+)/.exec(url)
      if (!m) return Promise.resolve(new Response('[]'))
      const corpo = { ...corpoSemDadoReal(m[1] as MetricaId), simulavel: true }
      return Promise.resolve(
        new Response(JSON.stringify(corpo), { headers: { 'content-type': 'application/json' } }),
      )
    })
    window.history.pushState({}, '', '/operacional')
    render(<App />)
    await waitFor(() => expect(screen.getAllByText(/Sem dado real/i).length).toBeGreaterThan(0), {
      timeout: 5000,
    })
    expect(screen.queryByText(/Simulado/i)).not.toBeInTheDocument()
    expect(screen.queryByTestId(/simulado/i)).not.toBeInTheDocument()
    f.mockRestore()
  })

  it('VITE_API_BASE absoluta (ou //host) falha na partida: só caminho relativo', () => {
    vi.stubEnv('VITE_FONTE', 'api')
    vi.stubEnv('VITE_API_BASE', 'https://outro-host/api/v1')
    expect(() => criarFontePadrao()).toThrow('VITE_API_BASE inválida')
    vi.stubEnv('VITE_API_BASE', '//outro-host/api')
    expect(() => criarFontePadrao()).toThrow('VITE_API_BASE inválida')
  })

  it('VITE_FONTE inválida falha na partida, sem cair no mock', () => {
    vi.stubEnv('VITE_FONTE', 'banco')
    expect(() => criarFontePadrao()).toThrow('VITE_FONTE inválida')
  })

  it('monta o aplicativo completo com o roteador do navegador', async () => {
    vi.stubEnv('VITE_FONTE', 'mock')
    vi.stubEnv('VITE_MOCK_LATENCIA', '0')
    window.history.pushState({}, '', '/ajuda')
    render(<App />)
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByTestId('aviso-dados-ficticios')).toBeInTheDocument()
  })
})
