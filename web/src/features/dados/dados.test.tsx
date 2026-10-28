import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderizarApp } from '@/test/helpers'

const busca = (r: { roteador: { state: { location: { search: string; pathname: string } } } }) =>
  new URLSearchParams(r.roteador.state.location.search)

describe('/dados: rota, navegação e abas', () => {
  it('"Dados e coletas" está na navegação e o foco vai para o h1', async () => {
    const r = renderizarApp('/operacional')
    await screen.findByRole('heading', { level: 1, name: 'Operacional' })
    const nav = screen.getAllByRole('navigation', { name: 'Navegação principal' })[0] as HTMLElement
    await userEvent.click(within(nav).getByRole('link', { name: 'Dados e coletas' }))
    const h1 = await screen.findByRole('heading', { level: 1, name: 'Dados e coletas' })
    expect(r.roteador.state.location.pathname).toBe('/dados')
    await waitFor(() => expect(h1).toHaveFocus())
    expect(screen.getByTestId('aviso-sem-pessoas')).toHaveTextContent(
      'Esta tela mostra apenas o estado das coletas. Não há informação por pessoa.',
    )
    await waitFor(() => expect(document.title).toMatch(/^Dados e coletas · Métricas DSPD/))
  })

  it('o "Detalhes da coleta" do painel leva à aba da própria fonte', async () => {
    const r = renderizarApp('/sustentacao')
    await userEvent.click(
      await screen.findByRole('button', { name: 'Detalhes da coleta do Acelerato' }),
    )
    await userEvent.click(
      await screen.findByRole('link', { name: 'Abrir Dados e coletas do Acelerato' }),
    )
    await screen.findByRole('heading', { level: 1, name: 'Dados e coletas' })
    expect(r.roteador.state.location.search).toBe('?fonte=ac')
    expect(screen.getByRole('tab', { name: 'Acelerato' })).toHaveAttribute('aria-selected', 'true')
  })

  it('abas BusinessMap, Acelerato e Pesquisa de percepção com role tablist; a URL manda e o padrão é BusinessMap', async () => {
    renderizarApp('/dados')
    const lista = await screen.findByRole('tablist', { name: 'Fonte de dados' })
    expect(
      within(lista)
        .getAllByRole('tab')
        .map((t) => t.textContent),
    ).toEqual(['BusinessMap', 'Acelerato', 'Pesquisa de percepção'])
    expect(screen.getByRole('tab', { name: 'BusinessMap' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('?fonte=ac abre o Acelerato; valor inválido cai em BusinessMap', async () => {
    const a = renderizarApp('/dados?fonte=ac')
    expect(await screen.findByRole('tab', { name: 'Acelerato' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    a.unmount()
    renderizarApp('/dados?fonte=xyz')
    expect(await screen.findByRole('tab', { name: 'BusinessMap' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('trocar de aba grava ?fonte= (sem perder o resto) e mostra só a fonte escolhida', async () => {
    const r = renderizarApp('/dados?fonte=bm&mock=coleta-vazia:bm')
    await screen.findByTestId('dados-vazio-businessmap')
    await userEvent.click(screen.getByRole('tab', { name: 'Acelerato' }))
    expect(busca(r).get('fonte')).toBe('ac')
    expect(busca(r).get('mock')).toBe('coleta-vazia:bm')
    expect(await screen.findByTestId('dados-conteudo-acelerato')).toBeInTheDocument()
    expect(screen.queryByTestId('dados-vazio-businessmap')).not.toBeInTheDocument()
    expect(screen.getByRole('tabpanel')).not.toHaveTextContent('BusinessMap')
    expect(screen.getByTestId('nota-fontes-separadas')).toHaveTextContent(
      'As fontes nunca são somadas nem comparadas. Veja a aba BusinessMap separadamente.',
    )
  })

  it('aba "Pesquisa de percepção" (?fonte=pq): só os critérios do dominio pesquisa, sem coleta', async () => {
    const r = renderizarApp('/dados?fonte=bm')
    await userEvent.click(await screen.findByRole('tab', { name: 'Pesquisa de percepção' }))
    expect(busca(r).get('fonte')).toBe('pq')
    const painel = await screen.findByTestId('dados-conteudo-pesquisa')
    const t = await within(painel).findByRole('table', { name: /Mudanças de critério/ })
    expect(within(t).getAllByRole('row')).toHaveLength(2)
    expect(t).toHaveTextContent('01/04/2026')
    expect(t).toHaveTextContent('Questionário v2')
    expect(t).toHaveTextContent('PV1')
    expect(screen.getByTestId('nota-fontes-separadas')).toHaveTextContent(
      'A pesquisa de percepção é uma fonte à parte',
    )
    expect(screen.queryByTestId('dados-conteudo-businessmap')).not.toBeInTheDocument()
  })

  it('?fonte=pq abre direto a aba da pesquisa', async () => {
    renderizarApp('/dados?fonte=pq')
    expect(await screen.findByRole('tab', { name: 'Pesquisa de percepção' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('o teclado navega nas abas (setas) e a URL acompanha', async () => {
    const r = renderizarApp('/dados?fonte=bm')
    const bm = await screen.findByRole('tab', { name: 'BusinessMap' })
    bm.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Acelerato' })).toHaveFocus()
    await waitFor(() => expect(busca(r).get('fonte')).toBe('ac'))
  })

  it('não há cadastro manual: nenhum campo de texto nem botão de editar janela', async () => {
    renderizarApp('/dados')
    await screen.findByTestId('dados-conteudo-businessmap')
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /cadastrar|editar janela|nova janela/i }),
    ).not.toBeInTheDocument()
  })
})

describe('/dados: estados por fonte', () => {
  it('carregando: esqueleto com texto para leitor de tela', async () => {
    renderizarApp('/dados?mock=carregando')
    expect(await screen.findByTestId('estado-carregando-DADOS-businessmap')).toHaveAttribute(
      'aria-busy',
      'true',
    )
  })

  it('vazio: "Ainda não há coletas desta fonte" só na fonte sem coletas', async () => {
    renderizarApp('/dados?fonte=ac&mock=coleta-vazia:ac')
    const vazio = await screen.findByTestId('dados-vazio-acelerato')
    expect(vazio).toHaveTextContent('Ainda não há coletas desta fonte')
    expect(vazio).toHaveTextContent('A primeira coleta acontece no próximo ciclo diário.')
  })

  it('erro de leitura de uma fonte: mensagem, "Tentar de novo" e a outra fonte segue normal', async () => {
    renderizarApp('/dados?mock=coleta-erro:bm')
    const erro = await screen.findByRole('alert')
    expect(erro).toHaveTextContent('Não foi possível carregar os dados desta fonte')
    await userEvent.click(within(erro).getByRole('button', { name: 'Tentar de novo' }))
    await screen.findByRole('alert')
    await userEvent.click(screen.getByRole('tab', { name: 'Acelerato' }))
    expect(await screen.findByTestId('dados-conteudo-acelerato')).toBeInTheDocument()
  })
})
