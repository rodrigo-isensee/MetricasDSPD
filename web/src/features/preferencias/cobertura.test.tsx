import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CHAVE_PREFERENCIAS,
  PREFERENCIAS_PADRAO,
  type PainelComCartoes,
  type PreferenciasMetricas,
} from '@metricas-dspd/contratos'
import { Secao, usePreferenciasPainel } from '@/components/ui'
import { Provedores } from '@/app/App'
import { fonteDeTeste, renderizarApp } from '@/test/helpers'
import { IndiceDeSecoes } from '@/features/operacional/IndiceDeSecoes'
import type { FontePreferencias } from './fonte'
import { AvisoDentro, MarcadorOculto } from './MarcadorOculto'
import { ProvedorPainelPreferencias } from './ProvedorPainelPreferencias'
import { ProvedorPreferencias, usePreferencias } from './ProvedorPreferencias'
import { SecaoPainel } from './SecaoPainel'

function guardar(paineis: Partial<Record<PainelComCartoes, string[]>>) {
  const p: PreferenciasMetricas = {
    versao: 1,
    paineis: Object.fromEntries(Object.entries(paineis).map(([k, v]) => [k, { ocultar: v }])),
    atualizadoEm: '2026-10-10T00:00:00.000Z',
  }
  window.localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify(p))
}

const fonteLocal = (): FontePreferencias => ({
  origem: 'navegador',
  obter: () => Promise.resolve(PREFERENCIAS_PADRAO),
  salvar: () => Promise.resolve(),
})

afterEach(() => {
  window.localStorage.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('Secao e SecaoPainel fora de um painel com preferências', () => {
  it('Secao com contagem e sem id mostra o texto', () => {
    render(
      <Secao titulo="Tempo" contagem="1 de 2 visíveis">
        <span />
      </Secao>,
    )
    expect(screen.getByText('1 de 2 visíveis')).toBeInTheDocument()
  })

  it('SecaoPainel sem provedor mostra tudo', () => {
    render(
      <SecaoPainel cartoes={['o3']} titulo="Tempo">
        <span>conteúdo</span>
      </SecaoPainel>,
    )
    expect(screen.getByText('conteúdo')).toBeInTheDocument()
  })
})

function Sonda() {
  const p = usePreferenciasPainel()
  const prefs = usePreferencias()
  if (!p) return null
  return (
    <div>
      <button onClick={() => p.mostrar('inexistente')}>mostrar-inexistente</button>
      <button
        onClick={() => {
          const a = p.registrarMarcador(['o2'])
          const b = p.registrarMarcador(['o2'])
          a()
          b()
        }}
      >
        registrar-duas-vezes
      </button>
      <button onClick={prefs.desfazerRestauracao}>desfazer-sem-nada</button>
      <button onClick={() => p.ocultarCartao('o2')}>ocultar-o2</button>
      <div data-testid="sem-classe">{p.marcador('o2')}</div>
      <div data-testid="com-classe">{p.marcador('o3', 'extra')}</div>
      <MarcadorOculto id="inexistente" />
      <AvisoDentro id="inexistente" p={p} />
    </div>
  )
}

describe('provedores: caminhos defensivos', () => {
  it('mostrar id fora do catálogo, registrar duas vezes e desfazer sem restauração não quebram', async () => {
    const u = userEvent.setup()
    render(
      <MemoryRouter>
        <Provedores fonte={fonteDeTeste} fontePreferencias={fonteLocal()}>
          <ProvedorPainelPreferencias painel="operacional">
            <Sonda />
          </ProvedorPainelPreferencias>
        </Provedores>
      </MemoryRouter>,
    )
    await u.click(await screen.findByRole('button', { name: 'mostrar-inexistente' }))
    await u.click(screen.getByRole('button', { name: 'registrar-duas-vezes' }))
    await u.click(screen.getByRole('button', { name: 'desfazer-sem-nada' }))
    expect(screen.queryByTestId('marcador-INEXISTENTE')).not.toBeInTheDocument()
    expect(within(screen.getByTestId('sem-classe')).getByTestId('marcador-O2')).toBeInTheDocument()
  })

  it('marcador fora de um painel não desenha nada', () => {
    const { container } = render(<MarcadorOculto id="o3" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('sem armazenamento, os marcadores seguem ligados e a escolha vale só na sessão', async () => {
    const u = userEvent.setup()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('sem armazenamento')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('sem armazenamento')
    })
    function Chave() {
      const prefs = usePreferencias()
      return (
        <button onClick={() => prefs.definirMarcadores(!prefs.marcadores)}>
          {prefs.marcadores ? 'ligados' : 'desligados'}
        </button>
      )
    }
    render(
      <ProvedorPreferencias fonte={fonteLocal()}>
        <Chave />
      </ProvedorPreferencias>,
    )
    await u.click(await screen.findByRole('button', { name: 'ligados' }))
    await u.click(screen.getByRole('button', { name: 'desligados' }))
    expect(screen.getByRole('button', { name: 'ligados' })).toBeInTheDocument()
  })
})

describe('marcador no painel', () => {
  it('oculta pelo popover vale só nesta visita e o destaque de chegada some depois de 2 s', async () => {
    const u = userEvent.setup()
    renderizarApp('/operacional?cadencia=semanal')
    await screen.findByTestId('metrica-O3')
    await u.click(screen.getByTestId('botao-metricas'))
    const dlg = await screen.findByTestId('popover-metricas')
    await u.click(within(dlg).getByRole('checkbox', { name: /O3 Tempo de ciclo/ }))
    expect(await screen.findByTestId('marcador-O3')).toHaveTextContent('oculta nesta visita')
  })

  it('o destaque por link some sozinho e o texto de chegada fica', async () => {
    guardar({ operacional: ['o3'] })
    renderizarApp('/operacional?cadencia=semanal#o3')
    const marcador = await screen.findByTestId('marcador-O3')
    expect(marcador.className).toContain('border-acento')
    await waitFor(() => expect(marcador.className).toContain('border-borda-controle'), {
      timeout: 4000,
    })
    expect(screen.getByTestId('chegada-O3')).toBeInTheDocument()
  })

  it('os avisos do topo (sem marcador) e a chegada sem marcador levam ao "Mostrar"', async () => {
    const u = userEvent.setup()
    window.localStorage.setItem('metricas-dspd:marcadores-ocultas', 'desligados')
    guardar({ operacional: ['o3'] })
    renderizarApp('/operacional?cadencia=semanal#o3')
    const aviso = await screen.findByTestId('chegada-sem-marcador')
    await u.click(within(aviso).getByRole('button', { name: 'Mostrar O3' }))
    expect(await screen.findByTestId('metrica-O3')).toBeInTheDocument()
    expect(screen.queryByTestId('chegada-sem-marcador')).not.toBeInTheDocument()
  })

  it('o aviso de critério no topo tem o "Mostrar" da métrica', async () => {
    const u = userEvent.setup()
    window.localStorage.setItem('metricas-dspd:marcadores-ocultas', 'desligados')
    guardar({ operacional: ['o3', 'o9'] })
    renderizarApp('/operacional?cadencia=semanal')
    const lista = await screen.findByTestId('avisos-criterio-ocultas')
    const botao = within(lista).getAllByRole('button', { name: /^Mostrar / })[0] as HTMLElement
    await u.click(botao)
    await waitFor(() => expect(screen.queryByTestId('avisos-criterio-ocultas')).toBeNull())
  })

  it('sem marcadores, a seção toda oculta mostra a orientação e o "Mostrar"', async () => {
    const u = userEvent.setup()
    window.localStorage.setItem('metricas-dspd:marcadores-ocultas', 'desligados')
    guardar({ operacional: ['o10', 'o7'] })
    renderizarApp('/operacional?cadencia=semanal')
    const secao = await screen.findByRole('region', { name: 'Backlog' })
    await u.click(within(secao).getByRole('button', { name: 'Mostrar métricas da seção' }))
    expect(await screen.findByTestId('metrica-O10')).toBeInTheDocument()
  })

  it('sem marcadores, na visão diária a orientação não tem título de seção', async () => {
    const u = userEvent.setup()
    window.localStorage.setItem('metricas-dspd:marcadores-ocultas', 'desligados')
    guardar({ operacional: ['o1', 'o2', 'bloqueados'] })
    renderizarApp('/operacional?cadencia=diaria')
    const msg = await screen.findByTestId('secao-oculta')
    await u.click(within(msg).getByRole('button', { name: 'Mostrar métricas' }))
    expect(await screen.findByTestId('metrica-O2')).toBeInTheDocument()
  })
})

describe('Restaurar padrão: mensagens e desfazer', () => {
  it('sem nada oculto: o diálogo avisa, nada a desfazer e o foco volta ao botão', async () => {
    const u = userEvent.setup()
    renderizarApp('/preferencias')
    await u.click(await screen.findByRole('button', { name: 'Restaurar padrão' }))
    const dlg = await screen.findByRole('dialog', { name: 'Restaurar o padrão?' })
    expect(dlg).toHaveTextContent('Nenhuma métrica está oculta no seu padrão')
    await u.click(within(dlg).getByRole('button', { name: 'Restaurar' }))
    expect(screen.queryByRole('button', { name: 'Desfazer' })).not.toBeInTheDocument()
    expect(screen.getByTestId('restauracao')).toHaveTextContent('Nada a restaurar.')
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Restaurar padrão' })).toHaveFocus(),
    )
  })

  it('com uma oculta fala no singular e "Dispensar" tira o desfazer', async () => {
    const u = userEvent.setup()
    guardar({ operacional: ['o9'] })
    renderizarApp('/preferencias')
    await u.click(await screen.findByRole('button', { name: 'Restaurar padrão' }))
    await u.click(await screen.findByRole('button', { name: 'Restaurar' }))
    expect(await screen.findByTestId('restauracao')).toHaveTextContent(
      'Padrão restaurado: 1 métrica voltou a aparecer.',
    )
    await u.click(screen.getByRole('button', { name: 'Dispensar' }))
    expect(screen.queryByRole('button', { name: 'Desfazer' })).not.toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Restaurar padrão' })).toHaveFocus(),
    )
  })
})

describe('índice fixo', () => {
  function Pagina({ ids }: { ids: string[] }) {
    return (
      <div>
        <header />
        <IndiceDeSecoes
          secoes={[
            ['a', 'Seção A', []],
            ['b', 'Seção B', []],
          ]}
        />
        {ids.map((id) => (
          <section key={id} id={id}>
            <h2>{id}</h2>
          </section>
        ))}
      </div>
    )
  }

  it('destaca a seção em vista, fica abaixo do cabeçalho fixo e limpa ao sair', () => {
    let chamada: IntersectionObserverCallback = () => undefined
    const desconectar = vi.fn()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: IntersectionObserverCallback) {
          chamada = cb
        }
        observe() {}
        disconnect = desconectar
      },
    )
    const { unmount } = render(<Pagina ids={['a']} />)
    const cab = document.querySelector('header') as HTMLElement
    cab.style.position = 'sticky'
    Object.defineProperty(cab, 'offsetHeight', { value: 48 })
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    expect(screen.getByTestId('indice-secoes').style.top).toBe('48px')
    const alvo = document.getElementById('a') as HTMLElement
    act(() =>
      chamada(
        [
          {
            isIntersecting: true,
            intersectionRect: { height: 100 },
            target: alvo,
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      ),
    )
    expect(screen.getByRole('link', { name: 'Seção A' })).toHaveAttribute(
      'aria-current',
      'location',
    )
    act(() =>
      chamada(
        [{ isIntersecting: false, target: alvo } as unknown as IntersectionObserverEntry],
        {} as IntersectionObserver,
      ),
    )
    expect(screen.getByRole('link', { name: 'Seção A' })).not.toHaveAttribute('aria-current')
    cab.style.position = 'static'
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    expect(screen.getByTestId('indice-secoes').style.top).toBe('0px')
    unmount()
    expect(desconectar).toHaveBeenCalled()
  })

  it('clicar em seção que não está na tela não quebra; com a seção, a rolagem é pedida', async () => {
    const u = userEvent.setup()
    const rolar = vi.fn()
    render(<Pagina ids={['a']} />)
    ;(document.getElementById('a') as HTMLElement).scrollIntoView = rolar
    await u.click(screen.getByRole('link', { name: 'Seção B' }))
    expect(rolar).not.toHaveBeenCalled()
    await u.click(screen.getByRole('link', { name: 'Seção A' }))
    expect(rolar).toHaveBeenCalled()
    expect(screen.getByRole('heading', { name: 'a' })).toHaveFocus()
  })

  it('título já focável não ganha outro tabindex; seção sem h2 recebe o foco', async () => {
    const u = userEvent.setup()
    render(
      <div>
        <IndiceDeSecoes secoes={[['x', 'Seção X', []]]} />
        <section id="x" tabIndex={-1} />
      </div>,
    )
    await u.click(screen.getByRole('link', { name: 'Seção X' }))
    expect(document.getElementById('x')).toHaveFocus()
  })

  it('diz quantas métricas da seção estão ocultas', async () => {
    guardar({ tatico: ['t2', 't1'] })
    renderizarApp('/tatico')
    const ir = await screen.findByRole('navigation', { name: 'Ir para' })
    expect(within(ir).getByRole('link', { name: /Publicado/ })).toHaveTextContent('(2 ocultas)')
  })

  it('uma oculta fala no singular', async () => {
    guardar({ tatico: ['t2'] })
    renderizarApp('/tatico')
    const ir = await screen.findByRole('navigation', { name: 'Ir para' })
    expect(within(ir).getByRole('link', { name: /Publicado/ })).toHaveTextContent('(1 oculta)')
  })
})
