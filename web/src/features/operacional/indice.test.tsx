import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
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

describe('IndiceDeSecoes mede o que fica fixo (bugs 048-01 e A4 do QA)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    document.documentElement.style.removeProperty('--h-filtros')
    document.documentElement.style.removeProperty('--h-indice')
    document.querySelectorAll('header').forEach((h) => h.remove())
  })

  it('publica a altura medida do índice em --h-indice (o scroll-padding o soma) e a retira ao sair', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      height: 33,
    } as DOMRect)
    const { unmount } = render(<IndiceDeSecoes secoes={[['prazos', 'Prazos', ['s2']]]} />)
    expect(document.documentElement.style.getPropertyValue('--h-indice')).toBe('33px')
    unmount()
    expect(document.documentElement.style.getPropertyValue('--h-indice')).toBe('')
  })

  it('o rootMargin do observador usa cabeçalho + filtros + índice medidos, não um valor fixo', () => {
    const margens: string[] = []
    class ObservadorFalso {
      constructor(_cb: unknown, opcoes?: IntersectionObserverInit) {
        margens.push(opcoes?.rootMargin ?? '')
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('IntersectionObserver', ObservadorFalso)
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.tagName === 'HEADER' ? 49 : 33
    })
    const cab = document.createElement('header')
    cab.style.position = 'sticky'
    document.body.appendChild(cab)
    document.documentElement.style.setProperty('--h-filtros', '136px')
    render(<IndiceDeSecoes secoes={[['prazos', 'Prazos', ['s2']]]} />)
    // 49 (cabeçalho) + 136 (filtros) + 33 (índice) = 218; antes era topo + 56 = 105.
    expect(margens.at(-1)).toBe('-218px 0px -60% 0px')
  })
})
