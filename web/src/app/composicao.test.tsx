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

  it('sem variáveis, usa os padrões', () => {
    expect(criarFontePadrao()).toBeDefined()
  })

  it('monta o aplicativo completo com o roteador do navegador', async () => {
    vi.stubEnv('VITE_MOCK_LATENCIA', '0')
    window.history.pushState({}, '', '/ajuda')
    render(<App />)
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByTestId('aviso-dados-ficticios')).toBeInTheDocument()
  })
})
