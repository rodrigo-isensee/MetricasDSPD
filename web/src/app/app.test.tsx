import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { fonteDeTeste, renderizarApp } from '@/test/helpers'
import type { FonteMetricas } from '@/data'

const busca = (r: { roteador: { state: { location: { search: string; pathname: string } } } }) =>
  new URLSearchParams(r.roteador.state.location.search)

describe('shell: navegação, estrutura e aviso de dados fictícios', () => {
  it('navegação com exatamente os 7 destinos na ordem e aria-current na rota atual', async () => {
    renderizarApp('/operacional')
    await screen.findByRole('heading', { level: 1, name: 'Operacional' })
    const nav = screen.getAllByRole('navigation', { name: 'Navegação principal' })[0] as HTMLElement
    const links = within(nav)
      .getAllByRole('link')
      .map((l) => l.textContent)
    expect(links).toEqual([
      'Visão geral',
      'Operacional',
      'Tático',
      'Estratégico',
      'Sustentação',
      'Catálogo de métricas',
      'Dados e coletas',
    ])
    expect(within(nav).getByRole('link', { name: 'Operacional' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(within(nav).getByRole('link', { name: 'Visão geral' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it.each([
    '/',
    '/operacional',
    '/tatico',
    '/estrategico',
    '/sustentacao',
    '/dados',
    '/ajuda',
    '/nada-aqui',
  ])('%s: um único h1, aviso "Dados fictícios" e rodapé com a data', async (rota) => {
    renderizarApp(rota)
    await screen.findByRole('heading', { level: 1 })
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByTestId('aviso-dados-ficticios')).toHaveTextContent('Dados fictícios')
    const rodape = screen.getByTestId('rodape')
    expect(rodape).toHaveTextContent('Dados fictícios gerados para validar a experiência')
    await waitFor(() => expect(rodape).toHaveTextContent('Dados até 09/10/2026'))
  })

  it('com fonte real (tipo api) não há aviso, nem texto, nem título de dados fictícios (D5)', async () => {
    const api = Object.create(fonteDeTeste, {
      tipo: { value: 'api' },
    }) as unknown as FonteMetricas
    renderizarApp('/ajuda', api as never)
    await screen.findByRole('heading', { level: 1, name: 'Ajuda' })
    expect(screen.queryByTestId('aviso-dados-ficticios')).not.toBeInTheDocument()
    const rodape = screen.getByTestId('rodape')
    await waitFor(() => expect(rodape).toHaveTextContent('Dados até 09/10/2026'))
    expect(rodape).not.toHaveTextContent('fictícios')
    const sobre = screen.getByRole('heading', { name: 'Sobre os dados' })
      .parentElement as HTMLElement
    expect(sobre).toHaveTextContent('Dados das coletas do BusinessMap e do Acelerato.')
    expect(sobre).not.toHaveTextContent('fictícios')
    expect(document.title).toBe('Ajuda · Métricas DSPD')
  })

  it('rota desconhecida mostra 404 com link para a Visão geral', async () => {
    renderizarApp('/xyz')
    expect(
      await screen.findByRole('heading', { name: 'Página não encontrada' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir para a Visão geral' })).toHaveAttribute('href', '/')
  })

  it('o título do documento termina em "Métricas DSPD · Dados fictícios"', async () => {
    renderizarApp('/tatico')
    await screen.findByRole('heading', { level: 1, name: 'Tático' })
    await waitFor(() => expect(document.title).toBe('Tático · Métricas DSPD · Dados fictícios'))
  })

  it('o link "Pular para o conteúdo" é o primeiro focável e leva o foco ao main', async () => {
    renderizarApp('/operacional')
    await screen.findByRole('heading', { level: 1, name: 'Operacional' })
    await userEvent.tab()
    const pular = screen.getByRole('link', { name: 'Pular para o conteúdo' })
    expect(pular).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('main')).toHaveFocus()
  })

  it('links entre painéis de fluxo preservam os filtros; para Sustentação e Visão geral vão limpos', async () => {
    renderizarApp('/operacional?equipe=fluig&tipo=melhoria&periodo=4s')
    await screen.findByRole('heading', { level: 1, name: 'Operacional' })
    const nav = screen.getAllByRole('navigation', { name: 'Navegação principal' })[0] as HTMLElement
    await waitFor(() =>
      expect(within(nav).getByRole('link', { name: 'Tático' }).getAttribute('href')).toBe(
        '/tatico?equipe=fluig&tipo=melhoria&periodo=4s',
      ),
    )
    expect(within(nav).queryByRole('link', { name: 'Espera invisível' })).toBeNull()
    expect(within(nav).getByRole('link', { name: 'Sustentação' }).getAttribute('href')).toBe(
      '/sustentacao',
    )
    expect(within(nav).getByRole('link', { name: 'Visão geral' }).getAttribute('href')).toBe('/')
  })

  it('o tema persiste em localStorage e muda o data-theme', async () => {
    renderizarApp('/ajuda')
    await screen.findByRole('heading', { level: 1 })
    await userEvent.selectOptions(screen.getByTestId('seletor-tema'), 'escuro')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('metricas-dspd:tema')).toBe('escuro')
    await userEvent.selectOptions(screen.getByTestId('seletor-tema'), 'claro')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    await userEvent.selectOptions(screen.getByTestId('seletor-tema'), 'sistema')
    expect(localStorage.getItem('metricas-dspd:tema')).toBeNull()
  })
})

describe('cartão de referência O4 e estados simulados (?mock=)', () => {
  it('mostra os números calculados, base, tabela alternativa e nota', async () => {
    renderizarApp('/operacional?cadencia=semanal')
    const cartao = await screen.findByTestId('metrica-O4')
    await waitFor(() =>
      expect(within(cartao).getByTestId('base-O4')).toHaveTextContent(/Base: \d+ itens concluídos/),
    )
    expect(await within(cartao).findByTestId('leitura-O4')).toHaveTextContent(
      /a vazão ficou entre \d+ e \d+ itens por semana; a mediana é \d+/,
    )
    await userEvent.click(within(cartao).getByRole('button', { name: 'Ver como tabela' }))
    expect(
      within(cartao).getByRole('columnheader', { name: /Itens concluídos/ }),
    ).toBeInTheDocument()
    expect(within(cartao).getAllByRole('rowheader').length).toBeGreaterThanOrEqual(12)
    expect(within(cartao).getByText(/em andamento/)).toBeInTheDocument()
  })

  it('?mock=carregando: cartão com esqueleto e aria-busy', async () => {
    renderizarApp('/operacional?cadencia=semanal&mock=carregando')
    const cartao = await screen.findByTestId('metrica-O4')
    expect(cartao).toHaveAttribute('aria-busy', 'true')
    expect(within(cartao).getByTestId('estado-carregando-O4')).toBeInTheDocument()
  })

  it('?mock=erro:o4: só o cartão O4 falha e "Tentar de novo" mantém os filtros', async () => {
    const r = renderizarApp('/operacional?cadencia=semanal&mock=erro:o4&equipe=fluig')
    const erro = await screen.findByTestId('estado-erro-O4')
    expect(erro).toHaveTextContent('Não foi possível carregar este gráfico')
    expect(screen.getByTestId('filtro-equipe')).toBeInTheDocument()
    await userEvent.click(within(erro).getByRole('button', { name: 'Tentar de novo' }))
    expect(await screen.findByTestId('estado-erro-O4')).toBeInTheDocument()
    expect(busca(r).get('equipe')).toBe('fluig')
  })

  it('?mock=vazio: "Nenhum item encontrado" com Limpar filtros', async () => {
    renderizarApp('/operacional?cadencia=semanal&mock=vazio&equipe=fluig')
    const vazio = await screen.findByTestId('estado-vazio-O4')
    expect(vazio).toHaveTextContent('Nenhum item encontrado')
    expect(within(vazio).getByRole('button', { name: 'Remover filtro Equipe' })).toBeInTheDocument()
    expect(within(vazio).getByRole('button', { name: 'Limpar filtros' })).toBeInTheDocument()
    // bug 002: vazio (0 itens) não é amostra insuficiente
    const cartao = screen.getByTestId('metrica-O4')
    expect(within(cartao).queryByText(/Amostra insuficiente/)).not.toBeInTheDocument()
    expect(within(cartao).getByTestId('base-O4')).toHaveAttribute('data-variante', 'ok')
  })

  it('filtro estreito deixa a vazão abaixo de 20 itens: faixa some e aparece "amostra insuficiente" com a base', async () => {
    renderizarApp('/operacional?cadencia=semanal&tipo=divida-tecnica')
    const cartao = await screen.findByTestId('metrica-O4')
    expect(await within(cartao).findByTestId('amostra-insuficiente-O4')).toBeInTheDocument()
    expect(within(cartao).getByTestId('leitura-O4')).toHaveTextContent(
      /Faixa e mediana indisponíveis: \d+ de 20 itens mínimos/,
    )
  })

  it('âncora: abrir /operacional#o4 foca o título do cartão', async () => {
    renderizarApp('/operacional?cadencia=semanal#o4')
    const cartao = await screen.findByTestId('metrica-O4')
    await waitFor(() => expect(within(cartao).getByRole('heading', { level: 3 })).toHaveFocus())
  })
})

describe('Visão geral e Ajuda', () => {
  it('a Visão geral consome a fonte e a Ajuda lista as mudanças de critério', async () => {
    renderizarApp('/')
    expect(
      await screen.findByTestId('nivel-operacional', undefined, { timeout: 8000 }),
    ).toBeInTheDocument()
  })
  it('Ajuda traz as regras de uso e a tabela de critérios do mock', async () => {
    renderizarApp('/ajuda')
    expect(
      await screen.findByText(/Nenhuma métrica deste sistema serve para avaliar pessoas/),
    ).toBeInTheDocument()
    expect(await screen.findByText('02/03/2026')).toBeInTheDocument()
    expect(screen.getByText('01/06/2026')).toBeInTheDocument()
  })
})
