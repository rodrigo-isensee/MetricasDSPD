import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { ErroApi } from '../../data/http/ErroApi'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  AlternarTabela,
  AmostraInsuficiente,
  AvisoCriterio,
  BadgeBase,
  CartaoMetrica,
  EstadoErro,
  Icone,
  Secao,
  TabelaDados,
  CabecalhoPainel,
  Dica,
  EstadoPositivo,
  EstadoVazio,
  ErroPagina,
  FaixaAtencao,
  NotaMetodologica,
  ProvedorContextoPainel,
  SeletorLocal,
  TituloErroContext,
  estadoFaixa,
  useContextoPainel,
} from '.'

afterEach(() => vi.restoreAllMocks())

describe('Dica', () => {
  it('abre por clique e fecha com Esc, mantendo o foco no gatilho', async () => {
    render(<Dica texto="Regra do cálculo" rotulo="Sobre o cálculo" />)
    const gatilho = screen.getByRole('button', { name: 'Sobre o cálculo' })
    await userEvent.click(gatilho)
    expect(await screen.findByRole('note')).toHaveTextContent('Regra do cálculo')
    // O mouse passa por cima antes de clicar: o clique mantém a dica aberta, o seguinte fecha.
    await userEvent.click(gatilho)
    expect(screen.getByRole('note')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('note')).toBeNull())
    expect(gatilho).toHaveFocus()
  })

  it('clique sem passagem do mouse (teclado, toque) abre e o seguinte fecha', async () => {
    render(<Dica texto="Balão" />)
    const gatilho = screen.getByRole('button', { name: 'Mais informações' })
    fireEvent.click(gatilho)
    expect(await screen.findByRole('note')).toBeInTheDocument()
    fireEvent.click(gatilho)
    await waitFor(() => expect(screen.queryByRole('note')).toBeNull())
  })

  it('o rótulo padrão é "Mais informações"', () => {
    render(<Dica texto="x" />)
    expect(screen.getByRole('button', { name: 'Mais informações' })).toBeInTheDocument()
  })

  it('abre ao passar o mouse e só fecha depois de uma folga, sem sumir ao pairar sobre o balão', async () => {
    render(<Dica texto="Balão" />)
    const gatilho = screen.getByRole('button', { name: 'Mais informações' })
    fireEvent.pointerEnter(gatilho, { pointerType: 'mouse' })
    const balao = await screen.findByRole('note')
    fireEvent.pointerLeave(gatilho, { pointerType: 'mouse' })
    fireEvent.pointerEnter(balao, { pointerType: 'mouse' })
    await new Promise((r) => setTimeout(r, 250))
    expect(screen.getByRole('note')).toBeInTheDocument()
    fireEvent.pointerLeave(balao, { pointerType: 'mouse' })
    await waitFor(() => expect(screen.queryByRole('note')).toBeNull())
  })

  it('toque não abre nem fecha por hover (só por clique)', async () => {
    render(<Dica texto="Balão" />)
    const gatilho = screen.getByRole('button', { name: 'Mais informações' })
    fireEvent.pointerEnter(gatilho, { pointerType: 'touch' })
    expect(screen.queryByRole('note')).toBeNull()
    await userEvent.click(gatilho)
    await screen.findByRole('note')
    fireEvent.pointerLeave(gatilho, { pointerType: 'touch' })
    await new Promise((r) => setTimeout(r, 250))
    expect(screen.getByRole('note')).toBeInTheDocument()
  })

  it('aceita um gatilho próprio', async () => {
    render(
      <Dica texto="Texto">
        <button type="button">meu gatilho</button>
      </Dica>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'meu gatilho' }))
    expect(await screen.findByRole('note')).toHaveTextContent('Texto')
  })
})

describe('CabecalhoPainel', () => {
  const props = { titulo: 'Operacional', pergunta: 'Como está o fluxo?', slug: 'operacional' }

  it('mostra título, pergunta, público, data de corte e fonte', () => {
    render(
      <CabecalhoPainel
        {...props}
        publico="Para times."
        dataCorte="2026-10-09"
        fonte="BusinessMap"
      />,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Operacional' })).toBeInTheDocument()
    expect(screen.getByText('Como está o fluxo? Para times.')).toBeInTheDocument()
    expect(screen.getByText('Dados até 09/10/2026 · Fonte: BusinessMap')).toBeInTheDocument()
  })

  it('sem data nem fonte, a linha de dados fica vazia; páginas de texto não têm "Copiar link"', () => {
    render(
      <CabecalhoPainel {...props} copiarLink={false}>
        <p>extra</p>
      </CabecalhoPainel>,
    )
    expect(screen.queryByTestId('copiar-link')).toBeNull()
    expect(screen.getByText('extra')).toBeInTheDocument()
    expect(screen.getByText('Como está o fluxo?')).toBeInTheDocument()
  })

  it('copia o link sem o parâmetro oculto mock, avisa e some o aviso depois', async () => {
    const escrever = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: escrever },
    })
    window.history.pushState({}, '', '/operacional?equipe=fluig&mock=vazio')
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      render(<CabecalhoPainel {...props} />)
      fireEvent.click(screen.getByTestId('copiar-link'))
      await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Link copiado.'))
      expect(escrever).toHaveBeenCalledWith('http://localhost:3000/operacional?equipe=fluig')
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5100)
      })
      expect(screen.getByRole('status')).toHaveTextContent('')
    } finally {
      vi.useRealTimers()
    }
  })

  it('o aviso "Link copiado." fica fora do fluxo, sem largura reservada: não refluir a barra nem estourar a 375 px (048-02)', () => {
    render(<CabecalhoPainel {...props} />)
    const aviso = screen.getByRole('status')
    expect(aviso.className).toContain('absolute')
    expect(aviso.className).not.toMatch(/min-w-/)
    expect(aviso.className).not.toContain('sr-only')
  })

  it('se a Clipboard API falhar, mostra o endereço selecionado num campo; copiar de novo limpa o campo', async () => {
    const escrever = vi.fn().mockRejectedValueOnce(new Error('negado')).mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: escrever },
    })
    render(<CabecalhoPainel {...props} />)
    await userEvent.click(screen.getByTestId('copiar-link'))
    const campo = await screen.findByLabelText<HTMLInputElement>('Copie o endereço desta visão:')
    expect(campo).toHaveAttribute('readonly')
    await waitFor(() => expect(campo.selectionEnd).toBeGreaterThan(0))
    // Sobreposto: não entra no fluxo da barra nem a faz refluir.
    expect(campo.closest('label')?.className).toContain('absolute')
    await userEvent.click(screen.getByTestId('copiar-link'))
    await waitFor(() => expect(screen.queryByLabelText('Copie o endereço desta visão:')).toBeNull())
  })
})

describe('ErroPagina', () => {
  const montar = (erro?: unknown, onTentar = vi.fn(), definir = vi.fn()) => {
    render(
      <MemoryRouter>
        <TituloErroContext.Provider value={definir}>
          <ErroPagina erro={erro} onTentarDeNovo={onTentar} />
        </TituloErroContext.Provider>
      </MemoryRouter>,
    )
    return { onTentar, definir }
  }

  it('anuncia o erro, troca o título enquanto montado e permite tentar de novo', async () => {
    const { onTentar, definir } = montar(new Error('falhou'))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(definir).toHaveBeenCalledWith(true)
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(onTentar).toHaveBeenCalled()
    expect(screen.getByRole('link', { name: 'Ir para a Visão geral' })).toHaveAttribute('href', '/')
    expect(screen.getByText('Error: falhou')).toBeInTheDocument()
  })

  it('aceita texto como erro, esconde detalhes quando o erro é desconhecido e restaura o título ao sair', () => {
    montar('Erro simulado')
    expect(screen.getByText('Erro simulado')).toBeInTheDocument()
  })

  it('sem detalhe técnico utilizável, não mostra "Detalhes técnicos"', () => {
    const { definir } = montar({ qualquer: 1 })
    expect(screen.queryByText('Detalhes técnicos')).toBeNull()
    cleanupAndCheck(definir)
  })

  function cleanupAndCheck(definir: ReturnType<typeof vi.fn>) {
    expect(definir).toHaveBeenCalledWith(true)
  }

  it('fora do shell, o aviso de título é inofensivo', () => {
    render(
      <MemoryRouter>
        <ErroPagina onTentarDeNovo={() => undefined} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('desmontar volta o título ao normal', () => {
    const definir = vi.fn()
    const r = render(
      <MemoryRouter>
        <TituloErroContext.Provider value={definir}>
          <ErroPagina onTentarDeNovo={() => undefined} />
        </TituloErroContext.Provider>
      </MemoryRouter>,
    )
    r.unmount()
    expect(definir).toHaveBeenLastCalledWith(false)
  })
})

describe('SeletorLocal', () => {
  const itens = [
    { valor: 'a', rotulo: 'Alfa', contagem: 3 },
    { valor: 'b', rotulo: 'Beta', insuficiente: true },
    { valor: 'c', rotulo: 'Gama' },
  ]
  function Caso({ inicial = 'a' }: { inicial?: string }) {
    const [v, setV] = useState(inicial)
    return (
      <SeletorLocal codigo="X" rotulo="Tipo" valor={v} onChange={setV} itens={itens}>
        <p>conteúdo de {v}</p>
      </SeletorLocal>
    )
  }

  it('setas, Home e End movem a seleção e o foco, circulando nas pontas', async () => {
    render(<Caso />)
    const aba = (n: string) => screen.getByRole('tab', { name: new RegExp(n) })
    expect(aba('Alfa')).toHaveTextContent('(3)')
    expect(aba('Beta')).toHaveTextContent('(amostra insuficiente)')
    aba('Alfa').focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(aba('Beta')).toHaveFocus()
    expect(aba('Beta')).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{End}')
    expect(aba('Gama')).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    expect(aba('Alfa')).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(aba('Gama')).toHaveFocus()
    await userEvent.keyboard('{Home}')
    expect(aba('Alfa')).toHaveFocus()
    await userEvent.keyboard('x')
    expect(aba('Alfa')).toHaveFocus()
    expect(screen.getByRole('tabpanel')).toHaveTextContent('conteúdo de a')
  })

  it('clicar numa aba seleciona; valor desconhecido cai na primeira aba', async () => {
    render(<Caso inicial="zzz" />)
    expect(screen.getByRole('tab', { name: /Alfa/ })).toHaveAttribute('aria-selected', 'true')
    await userEvent.click(screen.getByRole('tab', { name: /Gama/ }))
    expect(screen.getByRole('tabpanel')).toHaveTextContent('conteúdo de c')
  })

  it('sem itens, não quebra e o painel fica sem rótulo de aba', () => {
    render(
      <SeletorLocal codigo="V" rotulo="Vazio" valor="" onChange={() => undefined} itens={[]}>
        <p>nada</p>
      </SeletorLocal>,
    )
    expect(screen.getByRole('tabpanel')).toHaveTextContent('nada')
  })
})

describe('NotaMetodologica', () => {
  it('abre e fecha o bloco, com "Nesta tela" padrão e com valores informados', async () => {
    const nota = { oQueE: 'A', comoSeCalcula: 'B', comoLer: 'C', meta: 'D', cuidados: 'E' }
    const { rerender } = render(<NotaMetodologica codigo="O3" nota={nota} />)
    const botao = screen.getByRole('button', { name: /Como ler e como é calculado/ })
    expect(botao).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(botao)
    expect(botao).toHaveAttribute('aria-expanded', 'true')
    const bloco = screen.getByTestId('nota-O3')
    expect(within(bloco).getByText(/Janela: não se aplica a este cartão/)).toBeVisible()
    expect(within(bloco).getByText(/Filtros aplicados: nenhum/)).toBeVisible()
    expect(within(bloco).getByText(/Base amostral: não informada/)).toBeVisible()
    rerender(
      <NotaMetodologica
        codigo="O3"
        nota={nota}
        nestaTela={{ janela: '12 semanas', filtros: 'Equipe', base: '87 itens' }}
      />,
    )
    expect(screen.getByText(/Janela: 12 semanas/)).toBeVisible()
    await userEvent.click(botao)
    expect(botao).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('Estados vazios e contexto do painel', () => {
  it('vazio com filtros: um botão por filtro (não por valor) e Limpar filtros', async () => {
    const remover = vi.fn()
    const limpar = vi.fn()
    render(
      <ProvedorContextoPainel
        filtrosAtivos={[
          { chave: 'equipe', rotulo: 'Equipe', valor: 'A', valorId: 'a' },
          { chave: 'equipe', rotulo: 'Equipe', valor: 'B', valorId: 'b' },
        ]}
        removerFiltro={remover}
        limparFiltros={limpar}
      >
        <EstadoVazio titulo="Nada" texto="Sem itens" />
      </ProvedorContextoPainel>,
    )
    expect(screen.getByTestId('estado-vazio')).toHaveTextContent('Nada')
    expect(screen.getAllByRole('button', { name: 'Remover filtro Equipe' })).toHaveLength(1)
    await userEvent.click(screen.getByRole('button', { name: 'Remover filtro Equipe' }))
    expect(remover).toHaveBeenCalledWith('equipe')
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(limpar).toHaveBeenCalled()
  })

  it('vazio sem filtros ativos não oferece botões; estado positivo não é erro', () => {
    render(
      <>
        <EstadoVazio codigo="X" />
        <EstadoPositivo texto="Nenhum item bloqueado hoje." />
        <EstadoPositivo texto="Outro" codigo="Y" />
      </>,
    )
    expect(screen.getByTestId('estado-vazio-X')).toHaveTextContent('Nenhum item encontrado')
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByTestId('estado-positivo')).toHaveTextContent('Nenhum item bloqueado hoje.')
    expect(screen.getByTestId('estado-positivo-Y')).toBeInTheDocument()
  })

  it('fora de um painel, o contexto é vazio e inofensivo', () => {
    const { result } = renderHook(() => useContextoPainel())
    expect(result.current.filtrosAtivos).toEqual([])
    expect(result.current.removerFiltro('equipe')).toBeUndefined()
    expect(result.current.limparFiltros()).toBeUndefined()
    expect(result.current.reportarAtualizando('a', true)).toBeUndefined()
    expect(result.current.reivindicarAlerta('a')).toBe(true)
  })

  it('o painel anuncia "Atualizando painel" e depois "Painel atualizado"', async () => {
    function Sonda() {
      const c = useContextoPainel()
      return (
        <>
          <button onClick={() => c.reportarAtualizando('a', true)}>ligar</button>
          <button onClick={() => c.reportarAtualizando('a', true)}>ligar de novo</button>
          <button onClick={() => c.reportarAtualizando('a', false)}>desligar</button>
          <button onClick={() => c.reportarAtualizando('b', false)}>desligar outro</button>
        </>
      )
    }
    render(
      <ProvedorContextoPainel
        filtrosAtivos={[]}
        removerFiltro={() => undefined}
        limparFiltros={() => undefined}
      >
        <Sonda />
      </ProvedorContextoPainel>,
    )
    const anuncio = screen.getByTestId('anuncio-painel')
    expect(anuncio).toHaveTextContent('')
    await userEvent.click(screen.getByRole('button', { name: 'desligar outro' }))
    expect(anuncio).toHaveTextContent('')
    await userEvent.click(screen.getByRole('button', { name: 'ligar' }))
    await userEvent.click(screen.getByRole('button', { name: 'ligar de novo' }))
    expect(anuncio).toHaveTextContent('Atualizando painel')
    await userEvent.click(screen.getByRole('button', { name: 'desligar' }))
    expect(anuncio).toHaveTextContent('Painel atualizado')
  })
})

describe('FaixaAtencao', () => {
  const itens = [
    { id: 'a', texto: 'Item A', para: '#a', codigo: 'O1' },
    { id: 'b', texto: 'Item B', para: '/operacional#b', rotuloLink: 'Abrir B' },
    { id: 'c', texto: 'Item C', para: '#c' },
  ]
  const wrap = (el: React.ReactNode) => render(<MemoryRouter>{el}</MemoryRouter>)

  it('estadoFaixa: erro vence carregando, que vence ok; recarregar chama todas as consultas', () => {
    const r1 = vi.fn()
    expect(estadoFaixa([{ estado: 'ok' }, { estado: 'carregando' }]).estado).toBe('carregando')
    expect(estadoFaixa([{ estado: 'carregando' }, { estado: 'erro' }]).estado).toBe('erro')
    expect(estadoFaixa([{ estado: 'ok' }]).estado).toBe('ok')
    estadoFaixa([{ estado: 'ok', recarregar: r1 }, { estado: 'ok' }]).recarregar()
    expect(r1).toHaveBeenCalled()
  })

  it('lista os alertas com link interno ou de rota e o rótulo padrão; "Ver todos" expande e recolhe', async () => {
    wrap(<FaixaAtencao titulo="Atenção" vazio="Nada" itens={itens} maximo={2} />)
    expect(screen.getByRole('link', { name: /Item A.*Ver O1/ })).toHaveAttribute('href', '#a')
    expect(screen.getByRole('link', { name: /Item B.*Abrir B/ })).toHaveAttribute(
      'href',
      '/operacional#b',
    )
    expect(screen.queryByText('Item C')).toBeNull()
    const mais = screen.getByRole('button', { name: 'Ver todos os alertas (3)' })
    await userEvent.click(mais)
    expect(screen.getByRole('link', { name: /Item C.*Ver C/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Mostrar menos alertas' }))
    expect(screen.queryByText('Item C')).toBeNull()
  })

  it('sem máximo não há botão; lista vazia mostra a mensagem positiva', () => {
    const { unmount } = wrap(
      <FaixaAtencao titulo="Atenção" vazio="Nada pede atenção" itens={itens} />,
    )
    expect(screen.queryByRole('button')).toBeNull()
    unmount()
    wrap(<FaixaAtencao titulo="Atenção" vazio="Nada pede atenção" itens={[]} />)
    expect(screen.getByText('Nada pede atenção')).toBeInTheDocument()
  })

  it('carregando não vira região viva: a página já anuncia, o aria-busy basta (D-05c)', () => {
    wrap(<FaixaAtencao titulo="Atenção" itens={[]} estado="carregando" />)
    expect(screen.getByTestId('faixa-atencao-carregando')).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('nivel h3 vira h3 e a região segue nomeada pelo título (D-01)', () => {
    wrap(<FaixaAtencao titulo="Atenção" nivel="h3" itens={[]} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Atenção' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Atenção' })).toBeInTheDocument()
  })

  it('carregando e erro nunca afirmam que nada pede atenção; erro oferece tentar de novo', async () => {
    const tentar = vi.fn()
    const { rerender } = wrap(
      <FaixaAtencao
        titulo="Atenção"
        vazio="Nada"
        itens={[]}
        estado="carregando"
        reserva={{ mobile: 80, desktop: 60 }}
      />,
    )
    expect(screen.getByTestId('faixa-atencao-carregando')).toBeInTheDocument()
    expect(screen.getByTestId('faixa-atencao')).toHaveStyle({ '--fa-m': '80px', '--fa-d': '60px' })
    rerender(
      <MemoryRouter>
        <FaixaAtencao
          titulo="Atenção"
          vazio="Nada"
          itens={[]}
          estado="erro"
          onTentarDeNovo={tentar}
        />
      </MemoryRouter>,
    )
    expect(screen.queryByText('Nada')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(tentar).toHaveBeenCalled()
    rerender(
      <MemoryRouter>
        <FaixaAtencao titulo="Atenção" vazio="Nada" itens={[]} estado="erro" />
      </MemoryRouter>,
    )
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('o título vem do momento da spec', () => {
    wrap(<FaixaAtencao momento="hoje" vazio="Nada" itens={[]} />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })
})

describe('AvisoCriterio', () => {
  it('não aparece sem marcações; da série e da janela têm textos próprios', () => {
    const marcas = [{ id: 'm1', data: '2026-06-01', descricao: 'Novo critério' }]
    const { rerender } = render(
      <MemoryRouter>
        <AvisoCriterio marcacoes={[]} />
      </MemoryRouter>,
    )
    expect(screen.queryByTestId('aviso-criterio')).toBeNull()
    rerender(
      <MemoryRouter>
        <AvisoCriterio marcacoes={marcas} tipo="serie" />
      </MemoryRouter>,
    )
    expect(screen.getByText(/atravessa uma mudança de critério/)).toBeInTheDocument()
    rerender(
      <MemoryRouter>
        <AvisoCriterio
          marcacoes={marcas}
          tipo="janela"
          janela={{ unidade: 'semanas', quantidade: 12 }}
        />
      </MemoryRouter>,
    )
    expect(
      screen.getByText(/janela de 12 semanas inclui dados anteriores.*01\/06\/2026/),
    ).toBeInTheDocument()
    expect(screen.getByText('Mudança de critério em 01/06/2026: Novo critério')).toBeInTheDocument()
  })
})

describe('detalhes dos componentes de base', () => {
  const colunas = [{ chave: 'a', titulo: 'A' }]

  it('Secao com id liga o título à região; sem id, não', () => {
    const { rerender } = render(
      <Secao titulo="Fluxo" pergunta="Como vai?" id="fluxo">
        <p>x</p>
      </Secao>,
    )
    expect(screen.getByRole('region', { name: 'Fluxo' })).toHaveAttribute('id', 'fluxo')
    rerender(
      <Secao titulo="Fluxo">
        <p>x</p>
      </Secao>,
    )
    expect(screen.queryByRole('region')).toBeNull()
    expect(screen.getByRole('heading', { level: 2, name: 'Fluxo' })).not.toHaveAttribute('id')
    expect(screen.queryByText('Como vai?')).toBeNull()
  })

  it('Icone é decorativo, ou uma imagem com nome quando recebe título', () => {
    const { rerender } = render(<Icone nome="info" />)
    expect(screen.queryByRole('img')).toBeNull()
    rerender(<Icone nome="info" titulo="Informação" />)
    expect(screen.getByRole('img', { name: 'Informação' })).toBeInTheDocument()
  })

  it('TabelaDados vazia mostra a mensagem padrão ou a informada, em todas as colunas', () => {
    const { rerender } = render(<TabelaDados legenda="L" colunas={colunas} linhas={[]} />)
    expect(screen.getByText('Sem dados.')).toBeInTheDocument()
    rerender(<TabelaDados legenda="L" colunas={colunas} linhas={[]} vazio="Nada aqui" codigo="X" />)
    expect(screen.getByText('Nada aqui')).toBeInTheDocument()
    expect(screen.getByTestId('tabela-X')).toBeInTheDocument()
  })

  it('EstadoErro sem código usa o identificador genérico e sem botão se não houver como tentar de novo', () => {
    render(<EstadoErro erro={null} />)
    expect(screen.getByTestId('estado-erro')).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('EstadoErro expõe o código do ErroApi em data-erro-codigo e omite quando o erro não tem código', () => {
    const { rerender } = render(
      <EstadoErro codigo="O4" erro={new ErroApi(503, 'REFERENCIA_AUSENTE')} />,
    )
    expect(screen.getByTestId('estado-erro-O4')).toHaveAttribute(
      'data-erro-codigo',
      'REFERENCIA_AUSENTE',
    )
    expect(screen.getByTestId('estado-erro-O4')).not.toHaveAttribute('data-request-id')
    rerender(<EstadoErro codigo="O4" erro={new ErroApi(500, 'INTERNAL_ERROR', 'req-12345678')} />)
    expect(screen.getByTestId('estado-erro-O4')).toHaveAttribute('data-request-id', 'req-12345678')
    rerender(<EstadoErro codigo="O4" erro={new Error('x')} />)
    expect(screen.getByTestId('estado-erro-O4')).not.toHaveAttribute('data-erro-codigo')
  })

  it('AlternarTabela sem código não tem testid', () => {
    render(<AlternarTabela modo="grafico" onAlternar={() => undefined} />)
    expect(screen.getByRole('button', { name: 'Ver como tabela' })).not.toHaveAttribute(
      'data-testid',
    )
  })

  it('BadgeBase de um dia só mostra a data única; AmostraInsuficiente usa o singular com 1 item', () => {
    render(
      <>
        <BadgeBase
          base={{ n: 3, unidade: 'itens', janela: { inicio: '2026-10-09', fim: '2026-10-09' } }}
        />
        <AmostraInsuficiente n={1} codigo="X" />
      </>,
    )
    expect(screen.getByText(/Base: 3 itens/)).toBeInTheDocument()
    expect(screen.getByText('· 09/10/2026')).toBeInTheDocument()
    expect(screen.getByText(/Aqui há 1 item \(/)).toBeInTheDocument()
  })
})

describe('CartaoMetrica: atualização, janela fixa e rodapé', () => {
  const nota = { oQueE: 'a', comoSeCalcula: 'b', comoLer: 'c', meta: 'd', cuidados: 'e' }
  const montar = (
    p: Partial<React.ComponentProps<typeof CartaoMetrica>>,
    filtros: React.ComponentProps<typeof ProvedorContextoPainel>['filtrosAtivos'] = [],
  ) =>
    render(
      <MemoryRouter>
        <ProvedorContextoPainel
          filtrosAtivos={filtros}
          removerFiltro={() => undefined}
          limparFiltros={() => undefined}
        >
          <CartaoMetrica
            codigo="O3"
            titulo="Tempo de ciclo"
            pergunta="Em quantos dias?"
            estado="ok"
            nota={nota}
            fonte="BusinessMap"
            granularidade="demanda"
            {...p}
          >
            <p>corpo</p>
          </CartaoMetrica>
        </ProvedorContextoPainel>
      </MemoryRouter>,
    )

  it('atualizando: o painel anuncia e o cartão só esmaece se passar de 150 ms', async () => {
    const { rerender } = montar({ atualizando: true })
    const cartao = screen.getByTestId('metrica-O3')
    expect(cartao).toHaveAttribute('data-estado', 'atualizando')
    expect(cartao).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByTestId('anuncio-painel')).toHaveTextContent('Atualizando painel')
    await waitFor(() => expect(cartao.querySelector('.opacity-80')).not.toBeNull())
    rerender(
      <MemoryRouter>
        <ProvedorContextoPainel
          filtrosAtivos={[]}
          removerFiltro={() => undefined}
          limparFiltros={() => undefined}
        >
          <CartaoMetrica
            codigo="O3"
            titulo="Tempo de ciclo"
            pergunta="Em quantos dias?"
            estado="ok"
            nota={nota}
            fonte="BusinessMap"
            granularidade="demanda"
          >
            <p>corpo</p>
          </CartaoMetrica>
        </ProvedorContextoPainel>
      </MemoryRouter>,
    )
    expect(screen.getByTestId('anuncio-painel')).toHaveTextContent('Painel atualizado')
    expect(cartao.querySelector('.opacity-80')).toBeNull()
  })

  it('selo "Janela fixa" só quando o período difere da janela de percentis', () => {
    montar({
      janelaPercentis: { unidade: 'semanas', quantidade: 12 },
      periodo: { tipo: '4s' },
    })
    expect(screen.getByText(/Janela fixa/)).toBeInTheDocument()
  })

  it('janela de percentis igual ao período não mostra o selo; janela em meses sempre mostra', () => {
    const { unmount } = montar({
      janelaPercentis: { unidade: 'semanas', quantidade: 12 },
      periodo: { tipo: '12s' },
    })
    expect(screen.queryByText(/Janela fixa/)).toBeNull()
    unmount()
    montar({ janelaPercentis: { unidade: 'meses', quantidade: 6 }, periodo: { tipo: '12s' } })
    expect(screen.getByText(/Janela fixa/)).toBeInTheDocument()
  })

  it('base com variante, k e leitura; critérios; meta com status e texto', () => {
    montar({
      base: { n: 5, unidade: 'itens', janela: { inicio: '2026-09-01', fim: '2026-10-09' } },
      baseVariante: 'censo',
      baseK: 3,
      leitura: 'A mediana é 4 dias.',
      meta: 'Reduzir o P85',
      statusMeta: 'dentro',
      textoStatus: 'Mediana dentro do alvo',
      criterios: {
        serie: [{ id: 'm1', data: '2026-06-01', descricao: 'Novo critério' }],
        janela: [
          { id: 'm1', data: '2026-06-01', descricao: 'Novo critério' },
          { id: 'm2', data: '2026-08-01', descricao: 'Outro critério' },
        ],
      },
      selos: <span>selo extra</span>,
      acoes: <button>ação extra</button>,
    })
    expect(screen.getByTestId('leitura-O3')).toHaveTextContent('A mediana é 4 dias.')
    expect(screen.getByText('Mediana dentro do alvo')).toBeInTheDocument()
    expect(screen.getByText('selo extra')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ação extra' })).toBeInTheDocument()
    expect(screen.getAllByTestId('aviso-criterio')).toHaveLength(2)
  })

  it('carregando com código sem altura medida usa a altura padrão; alterna tabela e volta ao gráfico', async () => {
    montar({ codigo: 'ZZ', estado: 'carregando' })
    expect(screen.getByTestId('estado-carregando-ZZ')).toBeInTheDocument()
    cleanup()
    montar({ codigo: 'ZZ' })
    await userEvent.click(screen.getByTestId('alternar-tabela-ZZ'))
    await userEvent.click(screen.getByRole('button', { name: 'Ver como gráfico' }))
    expect(screen.getByRole('button', { name: 'Ver como tabela' })).toBeInTheDocument()
  })

  it('status sem texto próprio usa o texto padrão; semTabela esconde a alternativa', () => {
    montar({ statusMeta: 'fora', semTabela: true, variante: 'compacto' })
    expect(screen.getByText('Fora da meta')).toBeInTheDocument()
    expect(screen.queryByTestId('alternar-tabela-O3')).toBeNull()
  })

  it('filtros ativos: os que não atuam no cartão aparecem em "Não afetado por"', () => {
    montar({ aplicaveis: ['equipe'] }, [
      { chave: 'equipe', rotulo: 'Equipe', valor: 'A', valorId: 'a' },
      { chave: 'sistema', rotulo: 'Sistema', valor: 'B', valorId: 'b' },
      { chave: 'sistema', rotulo: 'Sistema', valor: 'C', valorId: 'c' },
    ])
    expect(screen.getByText(/Não afetado por/)).toHaveTextContent('Sistema')
  })

  it('erro sem exceção informada e sem como tentar de novo', () => {
    montar({ estado: 'erro' })
    expect(screen.getByTestId('estado-erro-O3')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).toBeNull()
  })
})
