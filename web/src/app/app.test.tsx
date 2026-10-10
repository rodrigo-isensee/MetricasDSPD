import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderizarApp } from '@/test/helpers'

const busca = (r: { roteador: { state: { location: { search: string; pathname: string } } } }) =>
  new URLSearchParams(r.roteador.state.location.search)

describe('shell: navegação, estrutura e aviso de dados fictícios', () => {
  it('navegação com exatamente os 6 destinos na ordem e aria-current na rota atual', async () => {
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
      'Espera invisível',
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
    '/espera-invisivel',
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
    expect(
      within(nav).getByRole('link', { name: 'Espera invisível' }).getAttribute('href'),
    ).toContain('equipe=fluig')
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

describe('filtros ↔ URL', () => {
  it('Operacional e Tático mostram 4 filtros; Estratégico só Sistema e Período com explicação; Sustentação os próprios', async () => {
    const op = renderizarApp('/operacional')
    await screen.findByTestId('filtro-equipe')
    for (const f of ['equipe', 'tipo', 'sistema', 'periodo'])
      expect(screen.getByTestId(`filtro-${f}`)).toBeInTheDocument()
    op.unmount()

    const es = renderizarApp('/estrategico')
    await screen.findByTestId('filtro-sistema')
    expect(screen.queryByTestId('filtro-equipe')).toBeNull()
    expect(screen.queryByTestId('filtro-tipo')).toBeNull()
    expect(
      screen.getByRole('button', { name: 'Por que não há filtro de equipe?' }),
    ).toBeInTheDocument()
    es.unmount()

    renderizarApp('/sustentacao')
    await screen.findByTestId('filtro-prioridade')
    expect(screen.getByTestId('filtro-equipe')).toBeInTheDocument()
    expect(screen.queryByTestId('filtro-sistema')).toBeNull()
    expect(screen.queryByTestId('filtro-tipo')).toBeNull()
  })

  it('marcar um valor atualiza a URL na hora (sem botão Aplicar), cria chip e o Voltar desfaz', async () => {
    const r = renderizarApp('/operacional')
    await userEvent.click(await screen.findByTestId('filtro-equipe'))
    const opcao = await screen.findByLabelText('Fluig')
    await userEvent.click(opcao)
    expect(busca(r).get('equipe')).toBe('fluig')
    expect(screen.queryByRole('button', { name: 'Aplicar' })).toBeNull()
    expect(
      await screen.findByRole('button', { name: 'Remover filtro Equipe: Fluig' }),
    ).toBeInTheDocument()
    await act(async () => {
      await r.roteador.navigate(-1)
    })
    expect(busca(r).has('equipe')).toBe(false)
    await waitFor(() => expect(screen.queryByTestId('chip-filtro-equipe')).toBeNull())
  })

  it('só valores fora do padrão entram na URL; marcar todos equivale a Todos; remover chip remove só aquele filtro', async () => {
    const r = renderizarApp('/operacional?equipe=fluig&sistema=protheus&periodo=4s')
    const chip = await screen.findByRole('button', { name: 'Remover filtro Equipe: Fluig' })
    await userEvent.click(chip)
    expect(busca(r).has('equipe')).toBe(false)
    expect(busca(r).get('sistema')).toBe('protheus')
    expect(busca(r).get('periodo')).toBe('4s')
    // período padrão do painel (12s) nunca aparece na URL
    await userEvent.click(screen.getByRole('button', { name: /Remover filtro Período/ }))
    expect(busca(r).has('periodo')).toBe(false)
  })

  it('"Limpar filtros" só aparece com filtro fora do padrão, restaura o padrão e anuncia "Filtros limpos."', async () => {
    const r = renderizarApp('/operacional')
    await screen.findByTestId('filtro-equipe')
    expect(screen.queryByTestId('limpar-filtros')).toBeNull()
    r.unmount()
    const r2 = renderizarApp('/operacional?equipe=fluig&periodo=6m&cadencia=semanal')
    await userEvent.click(await screen.findByTestId('limpar-filtros'))
    expect(busca(r2).has('equipe')).toBe(false)
    expect(busca(r2).has('periodo')).toBe(false)
    expect(busca(r2).get('cadencia')).toBe('semanal')
    expect(screen.queryByTestId('limpar-filtros')).toBeNull()
    expect(screen.getByText('Filtros limpos.')).toBeInTheDocument()
  })

  it('valor inválido no link é ignorado, a URL é corrigida e aparece o aviso', async () => {
    const r = renderizarApp('/operacional?equipe=fluig,xyz&tipo=nada&periodo=99x')
    expect(await screen.findByTestId('aviso-filtros-invalidos')).toHaveTextContent(
      'Alguns filtros do link não existem e foram ignorados: equipe "xyz", tipo "nada", período "99x"',
    )
    await waitFor(() => expect(busca(r).get('equipe')).toBe('fluig'))
    expect(busca(r).has('tipo')).toBe(false)
    expect(busca(r).has('periodo')).toBe(false)
    await userEvent.click(screen.getByRole('button', { name: 'Entendi' }))
    expect(screen.queryByTestId('aviso-filtros-invalidos')).toBeNull()
  })

  it('2 ou mais equipes: aviso de consolidado; nenhum rótulo compara equipes', async () => {
    renderizarApp('/operacional?equipe=fluig,senior')
    expect(await screen.findByTestId('aviso-consolidado')).toHaveTextContent(
      'Resultado consolidado de 2 equipes. O sistema não compara equipes.',
    )
  })

  it('período personalizado valida as datas junto dos campos', async () => {
    const r = renderizarApp('/operacional')
    await userEvent.click(await screen.findByTestId('filtro-periodo'))
    await userEvent.click(await screen.findByRole('radio', { name: 'Personalizado' }))
    const de = screen.getByLabelText('De')
    const ate = screen.getByLabelText('Até')
    await userEvent.type(de, '2026-09-01')
    await userEvent.type(ate, '2026-08-01')
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar período' }))
    expect(
      await screen.findByText('A data inicial precisa ser anterior à data final.'),
    ).toBeInTheDocument()
    expect(busca(r).has('periodo')).toBe(false)
    await userEvent.clear(ate)
    await userEvent.type(ate, '2026-12-31')
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar período' }))
    expect(
      await screen.findByText(/A data final não pode passar de 09\/10\/2026/),
    ).toBeInTheDocument()
    await userEvent.clear(ate)
    await userEvent.type(ate, '2026-09-03')
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar período' }))
    expect(
      await screen.findByText('Escolha um intervalo de pelo menos 7 dias.'),
    ).toBeInTheDocument()
    await userEvent.clear(ate)
    await userEvent.type(ate, '2026-09-30')
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar período' }))
    await waitFor(() => expect(busca(r).get('periodo')).toBe('custom'))
    expect(busca(r).get('de')).toBe('2026-09-01')
    expect(busca(r).get('ate')).toBe('2026-09-30')
  })

  it('filtros do fluxo não são herdados pela Sustentação e vice-versa', async () => {
    const r = renderizarApp('/sustentacao?equipe=fluig&prioridade=p2')
    expect(
      await screen.findByRole('button', { name: 'Remover filtro Equipe: SSSC FLUIG' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Remover filtro Prioridade: P2' }),
    ).toBeInTheDocument()
    expect(busca(r).get('equipe')).toBe('fluig')
  })
})

describe('cartão de referência O4 e estados simulados (?mock=)', () => {
  it('mostra os números calculados, base, tabela alternativa e nota', async () => {
    renderizarApp('/operacional')
    const cartao = await screen.findByTestId('metrica-O4')
    await waitFor(() =>
      expect(within(cartao).getByTestId('base-O4')).toHaveTextContent(/Base: \d+ itens concluídos/),
    )
    expect(within(cartao).getByTestId('leitura-O4')).toHaveTextContent(
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
    renderizarApp('/operacional?mock=carregando')
    const cartao = await screen.findByTestId('metrica-O4')
    expect(cartao).toHaveAttribute('aria-busy', 'true')
    expect(within(cartao).getByTestId('estado-carregando-O4')).toBeInTheDocument()
  })

  it('?mock=erro:o4: só o cartão O4 falha e "Tentar de novo" mantém os filtros', async () => {
    const r = renderizarApp('/operacional?mock=erro:o4&equipe=fluig')
    const erro = await screen.findByTestId('estado-erro-O4')
    expect(erro).toHaveTextContent('Não foi possível carregar este gráfico')
    expect(screen.getByTestId('filtro-equipe')).toBeInTheDocument()
    await userEvent.click(within(erro).getByRole('button', { name: 'Tentar de novo' }))
    expect(await screen.findByTestId('estado-erro-O4')).toBeInTheDocument()
    expect(busca(r).get('equipe')).toBe('fluig')
  })

  it('?mock=vazio: "Nenhum item encontrado" com Limpar filtros', async () => {
    renderizarApp('/operacional?mock=vazio&equipe=fluig')
    const vazio = await screen.findByTestId('estado-vazio-O4')
    expect(vazio).toHaveTextContent('Nenhum item encontrado')
    expect(within(vazio).getByRole('button', { name: 'Remover filtro Equipe' })).toBeInTheDocument()
    expect(within(vazio).getByRole('button', { name: 'Limpar filtros' })).toBeInTheDocument()
  })

  it('filtro estreito deixa a vazão abaixo de 20 itens: faixa some e aparece "amostra insuficiente" com a base', async () => {
    renderizarApp('/operacional?tipo=divida-tecnica')
    const cartao = await screen.findByTestId('metrica-O4')
    expect(await within(cartao).findByTestId('amostra-insuficiente-O4')).toBeInTheDocument()
    expect(within(cartao).getByTestId('leitura-O4')).toHaveTextContent(
      /Faixa e mediana indisponíveis: \d+ de 20 itens mínimos/,
    )
  })

  it('âncora: abrir /operacional#o4 foca o título do cartão', async () => {
    renderizarApp('/operacional#o4')
    const cartao = await screen.findByTestId('metrica-O4')
    await waitFor(() => expect(within(cartao).getByRole('heading', { level: 3 })).toHaveFocus())
  })
})

describe('Visão geral e Ajuda', () => {
  it('a Visão geral consome a fonte e a Ajuda lista as mudanças de critério', async () => {
    renderizarApp('/')
    expect(await screen.findByText(/alertas e 4 níveis calculados/)).toBeInTheDocument()
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
