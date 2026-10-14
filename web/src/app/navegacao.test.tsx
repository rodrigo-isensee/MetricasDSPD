import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderizarApp } from '@/test/helpers'

describe('NavegacaoGlobal: padrão do destino fora da URL (IF-006)', () => {
  it('12 meses memorizado no Operacional não vai no link do Estratégico (é o padrão dele); no Tático vai', async () => {
    renderizarApp('/operacional?cadencia=semanal&periodo=12m')
    await screen.findByRole('heading', { level: 1, name: /Operacional/ })
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' })
    await waitFor(() =>
      expect(within(nav).getByRole('link', { name: 'Tático' })).toHaveAttribute(
        'href',
        '/tatico?periodo=12m',
      ),
    )
    expect(within(nav).getByRole('link', { name: 'Estratégico' })).toHaveAttribute(
      'href',
      '/estrategico',
    )
  })
})
