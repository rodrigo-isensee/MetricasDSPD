import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { IndiceDeSecoes, SECAO_MAIS_METRICAS } from './IndiceDeSecoes'

describe('IndiceDeSecoes fora de um painel com preferências', () => {
  it('lista todas as seções, inclusive "Mais métricas", como âncoras', () => {
    render(
      <IndiceDeSecoes
        secoes={[
          ['prazos', 'Prazos', ['s2', 's1']],
          SECAO_MAIS_METRICAS,
          ['percepcao', 'Percepção de valor', ['pv1']],
        ]}
      />,
    )
    const links = screen.getAllByRole('link')
    expect(links.map((l) => [l.textContent, l.getAttribute('href')])).toEqual([
      ['Prazos', '#prazos'],
      ['Mais métricas', '#mais-metricas'],
      ['Percepção de valor', '#percepcao'],
    ])
    expect(screen.getByRole('navigation', { name: 'Ir para' })).toBeInTheDocument()
  })
})

describe('IndiceDeSecoes fixo', () => {
  it('fica fixo, leva o foco ao título da seção e avisa quantas ocultas', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    render(
      <div>
        <IndiceDeSecoes secoes={[['prazos', 'Prazos', ['s2']]]} />
        <section id="prazos">
          <h2>Prazos</h2>
        </section>
      </div>,
    )
    expect(screen.getByTestId('indice-secoes').className).toContain('sticky')
    await userEvent.click(screen.getByRole('link', { name: 'Prazos' }))
    expect(screen.getByRole('heading', { name: 'Prazos' })).toHaveFocus()
  })

  it('fica abaixo da barra de filtros: o top soma --h-filtros ao cabeçalho fixo', () => {
    const cab = document.createElement('header')
    cab.style.position = 'sticky'
    document.body.appendChild(cab)
    try {
      render(<IndiceDeSecoes secoes={[['prazos', 'Prazos', ['s2']]]} />)
      expect(screen.getByTestId('indice-secoes').getAttribute('style')).toContain('--h-filtros')
    } finally {
      cab.remove()
    }
  })
})
