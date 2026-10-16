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
