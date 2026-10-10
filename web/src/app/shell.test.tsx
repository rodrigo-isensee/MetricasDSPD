import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect, useState, type ReactNode } from 'react'
import { createMemoryRouter, Link, RouterProvider, type RouteObject } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fonteDeTeste } from '@/test/helpers'
import { Provedores } from './App'
import { AppShell } from './AppShell'
import { ErroDeRota, PaginaNaoEncontrada } from './Erros'
import { useTema } from './tema'

// Shell com painéis leves: o que importa aqui é o comportamento do shell (foco, título, menu, erro, tema),
// não o conteúdo dos painéis (cobertos nos testes de cada painel).
function montar(url: string, filhos: RouteObject[], extra?: ReactNode) {
  const roteador = createMemoryRouter(
    [
      {
        path: '/',
        Component: AppShell,
        children: [{ errorElement: <ErroDeRota />, children: filhos }],
      },
    ],
    { initialEntries: [url] },
  )
  const r = render(
    <Provedores fonte={fonteDeTeste}>
      <RouterProvider router={roteador} />
      {extra}
    </Provedores>,
  )
  return { ...r, roteador }
}

const pagina = (titulo?: string, corpo?: ReactNode): RouteObject => ({
  Component: () => (
    <div>
      <h1 tabIndex={-1}>{titulo ?? 'Sem título'}</h1>
      {corpo}
    </div>
  ),
  ...(titulo ? { handle: { titulo } } : {}),
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
  localStorage.clear()
})

describe('AppShell: título e foco', () => {
  it('sem título na rota, o documento usa o nome do sistema', async () => {
    montar('/x', [{ path: 'x', ...pagina() }])
    await screen.findByRole('heading', { level: 1 })
    await waitFor(() =>
      expect(document.title).toBe('Métricas DSPD · Métricas DSPD · Dados fictícios'),
    )
  })

  it('ao trocar de rota, o foco vai ao h1 da nova página (e não na carga inicial)', async () => {
    montar('/a', [
      { path: 'a', ...pagina('Pagina A', <Link to="/b">ir para B</Link>) },
      { path: 'b', ...pagina('Pagina B') },
    ])
    await screen.findByRole('heading', { name: 'Pagina A' })
    expect(screen.getByRole('heading', { name: 'Pagina A' })).not.toHaveFocus()
    await userEvent.click(screen.getByRole('link', { name: 'ir para B' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Pagina B' })).toHaveFocus())
  })

  it('âncora existente recebe foco e rolagem; o título do cartão é preferido', async () => {
    const rolar = vi.spyOn(Element.prototype, 'scrollIntoView')
    montar('/a#cartao', [
      {
        path: 'a',
        ...pagina(
          'A',
          <section id="cartao">
            <h3 tabIndex={-1} data-cartao-titulo>
              Título do cartão
            </h3>
          </section>,
        ),
      },
    ])
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Título do cartão' })).toHaveFocus(),
    )
    expect(rolar).toHaveBeenCalled()
  })

  it('trocar só a âncora na mesma página não puxa o foco para o h1', async () => {
    montar('/a', [
      {
        path: 'a',
        ...pagina(
          'A',
          <>
            <Link to="#ponto">ir ao ponto</Link>
            <div id="ponto" tabIndex={-1} data-testid="ponto" />
          </>,
        ),
      },
    ])
    await userEvent.click(await screen.findByRole('link', { name: 'ir ao ponto' }))
    await waitFor(() => expect(screen.getByTestId('ponto')).toHaveFocus())
    await new Promise((resolve) => setTimeout(resolve, 120))
    expect(screen.getByTestId('ponto')).toHaveFocus()
  })

  it('âncora sem título de cartão foca o próprio elemento; âncora que chega depois é encontrada', async () => {
    montar('/a#tardio', [{ path: 'a', Component: Tardio }])
    const alvo = await screen.findByTestId('alvo', undefined, { timeout: 4000 })
    await waitFor(() => expect(alvo).toHaveFocus())
  })

  it('âncora que nunca aparece: para de procurar depois de 40 tentativas', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const limpar = vi.spyOn(globalThis, 'clearInterval')
    montar('/a#nada', [{ path: 'a', ...pagina('A') }])
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50 * 45)
    })
    expect(limpar).toHaveBeenCalled()
  })

  it('o link Pular para o conteúdo leva o foco ao main', async () => {
    montar('/a', [{ path: 'a', ...pagina('A') }])
    await userEvent.click(await screen.findByRole('link', { name: 'Pular para o conteúdo' }))
    expect(screen.getByRole('main')).toHaveFocus()
  })
})

function Tardio() {
  // O elemento só aparece depois da primeira busca: exercita a repetição periódica.
  const [pronto, setPronto] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setPronto(true), 120)
    return () => clearTimeout(t)
  }, [])
  return (
    <div>
      <h1 tabIndex={-1}>A</h1>
      {pronto && (
        <div id="tardio" tabIndex={-1} data-testid="alvo">
          alvo
        </div>
      )}
    </div>
  )
}

describe('Erros de rota', () => {
  const quebra = (erro: unknown): RouteObject => ({
    path: 'quebra',
    loader: () => {
      throw erro
    },
    Component: () => null,
  })

  it('falha ao abrir o painel: mostra o erro dentro do shell, ajusta o título e recarrega ao tentar de novo', async () => {
    const recarregar = vi.fn()
    const original = window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: Object.create(original, { reload: { value: recarregar } }) as Location,
    })
    try {
      montar('/quebra', [quebra(new Error('chunk falhou'))])
      const erro = await screen.findByTestId('erro-pagina')
      expect(within(erro).getByText(/Error: chunk falhou/)).toBeInTheDocument()
      expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument()
      await waitFor(() =>
        expect(document.title).toBe(
          'Não foi possível abrir este painel · Métricas DSPD · Dados fictícios',
        ),
      )
      await userEvent.click(within(erro).getByRole('button', { name: 'Tentar de novo' }))
      expect(recarregar).toHaveBeenCalled()
    } finally {
      Object.defineProperty(window, 'location', { configurable: true, value: original })
    }
  })

  it('resposta 404 vira a página não encontrada', async () => {
    montar('/quebra', [quebra(new Response(null, { status: 404 }))])
    expect(await screen.findByTestId('pagina-404')).toBeInTheDocument()
  })

  it('PaginaNaoEncontrada tem h1 e link para a Visão geral', async () => {
    montar('/zzz', [{ path: '*', Component: PaginaNaoEncontrada }])
    expect(await screen.findByRole('link', { name: 'Ir para a Visão geral' })).toHaveAttribute(
      'href',
      '/',
    )
  })
})

describe('NavegacaoGlobal: menu em tela estreita', () => {
  it('abre o menu, navega por um destino (com a memória de filtros) e fecha', async () => {
    const r = montar('/operacional?equipe=fluig', [
      { path: 'operacional', ...pagina('Operacional') },
      { path: 'tatico', ...pagina('Tático') },
      { path: 'ajuda', ...pagina('Ajuda') },
    ])
    await screen.findByRole('heading', { name: 'Operacional' })
    await userEvent.click(screen.getByTestId('abrir-menu'))
    const menu = await screen.findByRole('dialog', { name: 'Menu' })
    // memória de filtros só é gravada por páginas que usam useFiltros; aqui os links saem limpos
    await userEvent.click(within(menu).getByRole('link', { name: 'Tático' }))
    await waitFor(() => expect(r.roteador.state.location.pathname).toBe('/tatico'))
    expect(screen.queryByRole('dialog')).toBeNull()
    await userEvent.click(screen.getByTestId('abrir-menu'))
    const menu2 = await screen.findByRole('dialog', { name: 'Menu' })
    await userEvent.click(within(menu2).getByRole('link', { name: 'Ajuda' }))
    await waitFor(() => expect(r.roteador.state.location.pathname).toBe('/ajuda'))
    await userEvent.click(screen.getByTestId('abrir-menu'))
    await userEvent.click(await screen.findByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('tema', () => {
  function Sonda() {
    const t = useTema()
    return (
      <p data-testid="tema">
        {t.preferencia}/{t.efetivo}
      </p>
    )
  }
  const stubMedia = (escuro: boolean) => {
    const ouvintes = new Set<() => void>()
    const mq = {
      matches: escuro,
      addEventListener: (_: string, f: () => void) => ouvintes.add(f),
      removeEventListener: (_: string, f: () => void) => ouvintes.delete(f),
    }
    vi.stubGlobal('matchMedia', () => mq)
    return {
      mudar: (v: boolean) => {
        mq.matches = v
        ouvintes.forEach((f) => f())
      },
      ouvintes,
    }
  }

  it('"sistema" acompanha o esquema do sistema operacional e reage à mudança', () => {
    const m = stubMedia(true)
    const { unmount } = render(
      <Provedores fonte={fonteDeTeste}>
        <Sonda />
      </Provedores>,
    )
    expect(screen.getByTestId('tema')).toHaveTextContent('sistema/dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    act(() => m.mudar(false))
    expect(screen.getByTestId('tema')).toHaveTextContent('sistema/light')
    unmount()
    expect(m.ouvintes.size).toBe(0)
    vi.unstubAllGlobals()
  })

  it('usa a preferência guardada', () => {
    localStorage.setItem('metricas-dspd:tema', 'escuro')
    render(
      <Provedores fonte={fonteDeTeste}>
        <Sonda />
      </Provedores>,
    )
    expect(screen.getByTestId('tema')).toHaveTextContent('escuro/dark')
  })

  it('sem matchMedia, assume tema claro', () => {
    vi.stubGlobal('matchMedia', undefined)
    render(
      <Provedores fonte={fonteDeTeste}>
        <Sonda />
      </Provedores>,
    )
    expect(screen.getByTestId('tema')).toHaveTextContent('sistema/light')
    vi.unstubAllGlobals()
  })

  it('armazenamento indisponível: lê "sistema" e a escolha vale só na sessão', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    function Troca() {
      const t = useTema()
      return <button onClick={() => t.definir('escuro')}>escuro</button>
    }
    render(
      <Provedores fonte={fonteDeTeste}>
        <Sonda />
        <Troca />
      </Provedores>,
    )
    expect(screen.getByTestId('tema')).toHaveTextContent('sistema/')
    await userEvent.click(screen.getByRole('button', { name: 'escuro' }))
    expect(screen.getByTestId('tema')).toHaveTextContent('escuro/dark')
    vi.restoreAllMocks()
  })

  it('useTema fora do provedor é erro de programação', () => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => render(<Sonda />)).toThrow('useTema fora de <ProvedorTema>')
    erro.mockRestore()
  })
})
