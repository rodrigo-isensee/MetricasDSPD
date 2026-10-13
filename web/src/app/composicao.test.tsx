import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App, criarFontePadrao, criarQueryClient } from './App'

afterEach(() => vi.unstubAllEnvs())

describe('App e composição', () => {
  it('o cliente de dados não tenta de novo nem atualiza sozinho', () => {
    const q = criarQueryClient().getDefaultOptions().queries
    expect(q).toMatchObject({ retry: false, staleTime: Infinity, refetchOnWindowFocus: false })
  })

  it('a fonte padrão lê semente, data e latência das variáveis públicas', async () => {
    vi.stubEnv('VITE_MOCK_SEMENTE', '7')
    vi.stubEnv('VITE_MOCK_HOJE', '2026-10-09')
    vi.stubEnv('VITE_MOCK_LATENCIA', '0')
    const fonte = criarFontePadrao()
    expect(await fonte.dataReferencia()).toBe('2026-10-09')
  })

  it('sem variáveis, usa os padrões: fonte mock', () => {
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
    vi.stubEnv('VITE_MOCK_LATENCIA', '0')
    window.history.pushState({}, '', '/ajuda')
    render(<App />)
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByTestId('aviso-dados-ficticios')).toBeInTheDocument()
  })
})
