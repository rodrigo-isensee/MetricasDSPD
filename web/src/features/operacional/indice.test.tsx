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

  it('por padrão segue o fluxo da página: não é fixo nem publica --h-indice', () => {
    render(<IndiceDeSecoes secoes={[['prazos', 'Prazos', []]]} />)
    const nav = screen.getByRole('navigation', { name: 'Ir para' })
    expect(nav).not.toHaveClass('md:sticky')
    expect(document.documentElement.style.getPropertyValue('--h-indice')).toBe('')
  })

  it('com fixo, fica abaixo do cabeçalho e da barra de filtros, pelas variáveis CSS (K-416)', () => {
    render(<IndiceDeSecoes fixo secoes={[['prazos', 'Prazos', []], SECAO_MAIS_METRICAS]} />)
    const nav = screen.getByRole('navigation', { name: 'Ir para' })
    expect(nav).toHaveClass('md:sticky', 'z-20', 'bg-fundo')
    expect(nav.className).toContain('md:top-[calc(var(--h-cabecalho)+var(--h-filtros))]')
    for (const link of screen.getAllByRole('link')) expect(link).toHaveClass('alvo')
  })

  it('publica a própria altura em --h-indice e a retira ao desmontar (WCAG 2.4.11)', () => {
    const { unmount } = render(<IndiceDeSecoes fixo secoes={[['prazos', 'Prazos', []]]} />)
    expect(document.documentElement.style.getPropertyValue('--h-indice')).toMatch(/px$/)
    unmount()
    expect(document.documentElement.style.getPropertyValue('--h-indice')).toBe('')
  })
})
