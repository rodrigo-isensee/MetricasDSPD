import { screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderizarApp } from '@/test/helpers'
import { criarFetchFalso } from './rota-falsa'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('rota da aba Apontamento', () => {
  it('abre em /operacional/apontamento, dentro do shell, com o título da página', async () => {
    vi.stubGlobal('fetch', criarFetchFalso().fetchFalso)
    renderizarApp('/operacional/apontamento')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Apontamento' }),
    ).toBeInTheDocument()
    const kpis = await screen.findByTestId('metrica-AP-KPIS')
    await waitFor(() => expect(kpis).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
    await waitFor(() => expect(document.title).toContain('Operacional · Apontamento'))
  })
})
