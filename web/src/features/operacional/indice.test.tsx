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

  it('fica logo abaixo do cabeçalho fixo: o top é a altura do cabeçalho, sem --h-filtros (048-03)', () => {
    const cab = document.createElement('header')
    cab.style.position = 'sticky'
    document.body.appendChild(cab)
    try {
      render(<IndiceDeSecoes secoes={[['prazos', 'Prazos', ['s2']]]} />)
      const estilo = screen.getByTestId('indice-secoes').getAttribute('style') ?? ''
      expect(estilo).not.toContain('--h-filtros')
      expect(estilo).not.toContain('var(')
    } finally {
      cab.remove()
    }
  })
})

describe('IndiceDeSecoes mede o que fica fixo (bugs 048-01 e A4 do QA)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
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

  it('o rootMargin do observador usa cabeçalho + índice medidos, não um valor fixo', () => {
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
    render(<IndiceDeSecoes secoes={[['prazos', 'Prazos', ['s2']]]} />)
    // 49 (cabeçalho) + 33 (índice) = 82; a barra de filtros rola e não entra na soma.
    expect(margens.at(-1)).toBe('-82px 0px -60% 0px')
  })

  it('o destaque ignora a seção que só encosta na faixa (área zero) e vai para a seguinte (bug 048-01)', async () => {
    let aviso: ((e: unknown[]) => void) | undefined
    class ObservadorFalso {
      constructor(cb: (e: unknown[]) => void) {
        aviso = cb
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('IntersectionObserver', ObservadorFalso)
    render(
      <div>
        <IndiceDeSecoes
          secoes={[
            ['publicado', 'Publicado', ['t1']],
            ['fila', 'Fila', ['t2']],
          ]}
        />
        <section id="publicado" />
        <section id="fila" />
      </div>,
    )
    const { act } = await import('@testing-library/react')
    act(() =>
      aviso?.([
        {
          target: document.getElementById('publicado'),
          isIntersecting: true,
          intersectionRect: { height: 0 },
        },
        {
          target: document.getElementById('fila'),
          isIntersecting: true,
          intersectionRect: { height: 120 },
        },
      ]),
    )
    expect(screen.getByRole('link', { name: 'Fila' })).toHaveAttribute('aria-current', 'location')
    expect(screen.getByRole('link', { name: 'Publicado' })).not.toHaveAttribute('aria-current')
  })
})
