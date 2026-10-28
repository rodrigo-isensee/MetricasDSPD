import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderizarApp } from '@/test/helpers'

describe('P2: barra única de ações e Detalhes da coleta', () => {
  it('a barra reúne Métricas, Exportar e Copiar link, e o Copiar link não fica mais no cabeçalho', async () => {
    renderizarApp('/tatico')
    const barra = await screen.findByRole('group', { name: 'Ações do painel' })
    expect(within(barra).getByRole('button', { name: /Métricas/ })).toBeInTheDocument()
    expect(within(barra).getAllByRole('button', { name: /Exportar/ }).length).toBeGreaterThan(0)
    expect(within(barra).getByRole('button', { name: /Copiar link/ })).toBeInTheDocument()
    expect(screen.getAllByTestId('copiar-link')).toHaveLength(1)
    // Os filtros ficam na mesma barra sticky (mesmo contêiner), não em outra linha.
    expect(screen.getByTestId('barra-filtros')).toContainElement(barra)
  })

  it('"Detalhes da coleta" abre o popover com o link para a página Dados; a falha continua visível sem abrir', async () => {
    renderizarApp('/tatico')
    // A falha de coleta (aviso obrigatório) não depende do popover.
    expect(await screen.findByTestId('falha-coleta-businessmap')).toBeVisible()
    const gatilho = screen.getByRole('button', { name: 'Detalhes da coleta do BusinessMap' })
    expect(gatilho).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(gatilho)
    const pop = await screen.findByTestId('popover-coleta-businessmap')
    expect(gatilho).toHaveAttribute('aria-expanded', 'true')
    expect(within(pop).getByText(/Última coleta concluída em/)).toBeInTheDocument()
    expect(within(pop).getByRole('link', { name: /Abrir Dados e coletas/ })).toHaveAttribute(
      'href',
      '/dados?fonte=bm',
    )
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByTestId('popover-coleta-businessmap')).toBeNull()
    expect(gatilho).toHaveFocus()
  })

  it('Visão geral e Resumo do Operacional também têm a barra com Copiar link', async () => {
    const { unmount } = renderizarApp('/')
    const vg = await screen.findByRole('group', { name: 'Ações do painel' })
    expect(within(vg).getByRole('button', { name: /Copiar link/ })).toBeInTheDocument()
    unmount()
    renderizarApp('/operacional')
    const op = await screen.findByRole('group', { name: 'Ações do painel' })
    expect(within(op).getByRole('button', { name: /Copiar link/ })).toBeInTheDocument()
  })
})
