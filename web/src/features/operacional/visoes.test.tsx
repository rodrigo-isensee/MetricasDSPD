import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderizarApp } from '@/test/helpers'

const visaoMarcada = () =>
  within(screen.getByRole('radiogroup', { name: 'Visão' }))
    .getAllByRole('radio')
    .find((r) => (r as HTMLInputElement).checked)?.parentElement?.textContent
const busca = (r: { roteador: { state: { location: { search: string } } } }) =>
  new URLSearchParams(r.roteador.state.location.search)

describe('seletor Visão (CA-2, CA-19)', () => {
  it('tem as 4 opções, na ordem, e a visão da URL está marcada', async () => {
    renderizarApp('/operacional?cadencia=semanal')
    const grupo = await screen.findByRole('radiogroup', { name: 'Visão' })
    expect(
      within(grupo)
        .getAllByRole('radio')
        .map((r) => (r as HTMLInputElement).value),
    ).toEqual(['resumo', 'diaria', 'semanal', 'sustentacao'])
    expect(within(grupo).getByRole('radio', { name: 'Semanal' })).toBeChecked()
    expect(screen.getByTestId('pergunta-cadencia')).toHaveTextContent(
      'O que mudou na nossa distribuição de tempo?',
    )
  })

  it('escolher Sustentação grava cadencia=sustentacao com entrada no histórico, mostra a visão, anuncia e mantém o foco no rádio', async () => {
    const r = renderizarApp('/operacional?cadencia=semanal&equipe=fluig')
    const radio = await screen.findByRole('radio', { name: 'Sustentação' })
    await userEvent.click(radio)
    await waitFor(() => expect(busca(r).get('cadencia')).toBe('sustentacao'))
    expect(busca(r).get('equipe')).toBe('fluig')
    expect(r.roteador.state.historyAction).toBe('PUSH')
    expect(
      await screen.findByTestId('recorte-sustentacao', undefined, { timeout: 8000 }),
    ).toBeInTheDocument()
    for (const s of ['prazos', 'volume', 'causas', 'espera', 'percepcao'])
      expect(document.getElementById(s), s).not.toBeNull()
    expect(screen.getByTestId('anuncio-visao')).toHaveTextContent(
      'Visão Sustentação. Fonte: Acelerato.',
    )
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Sustentação' }))
    expect(document.title).toContain('Operacional · Sustentação · Métricas DSPD')
    // O Voltar desfaz a troca
    await r.roteador.navigate(-1)
    await waitFor(() => expect(visaoMarcada()).toBe('Semanal'), { timeout: 15000 })
  })

  it('Voltar e a troca de hash também anunciam a visão (D-02)', async () => {
    const r = renderizarApp('/operacional?cadencia=semanal')
    await screen.findByRole('radiogroup', { name: 'Visão' })
    expect(screen.getByTestId('anuncio-visao')).toBeEmptyDOMElement()
    await userEvent.click(screen.getByRole('radio', { name: 'Diária' }))
    await waitFor(() =>
      expect(screen.getByTestId('anuncio-visao')).toHaveTextContent(
        'Visão Diária. Fonte: BusinessMap.',
      ),
    )
    await r.roteador.navigate(-1)
    await waitFor(() =>
      expect(screen.getByTestId('anuncio-visao')).toHaveTextContent(
        'Visão Semanal. Fonte: BusinessMap.',
      ),
    )
    await r.roteador.navigate('/operacional?cadencia=semanal#s1')
    await waitFor(() =>
      expect(screen.getByTestId('anuncio-visao')).toHaveTextContent(
        'Visão Sustentação. Fonte: Acelerato.',
      ),
    )
  })

  it('"Ver na Sustentação" do Resumo anuncia a visão e leva o foco ao título, não ao body (D-02, D-03)', async () => {
    renderizarApp('/operacional')
    const nota = await screen.findByTestId('nota-janelas-alerta', undefined, { timeout: 15000 })
    await userEvent.click(within(nota).getByRole('link', { name: 'Ver na Sustentação' }))
    await waitFor(() => expect(visaoMarcada()).toBe('Sustentação'), { timeout: 15000 })
    expect(screen.getByTestId('anuncio-visao')).toHaveTextContent(
      'Visão Sustentação. Fonte: Acelerato.',
    )
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 })),
    )
  })

  it('sem h1 no documento a troca por link não quebra: só não move o foco', async () => {
    renderizarApp('/operacional')
    const nota = await screen.findByTestId('nota-janelas-alerta', undefined, { timeout: 15000 })
    const espia = vi.spyOn(Document.prototype, 'querySelector').mockReturnValue(null)
    try {
      await userEvent.click(within(nota).getByRole('link', { name: 'Ver na Sustentação' }))
      await waitFor(() => expect(visaoMarcada()).toBe('Sustentação'), { timeout: 15000 })
      expect(espia).toHaveBeenCalledWith('h1')
      expect(screen.getByTestId('anuncio-visao')).toHaveTextContent('Visão Sustentação.')
    } finally {
      espia.mockRestore()
    }
  })

  it('seta no grupo de rádio troca a visão e cada seta é uma entrada de histórico (A7)', async () => {
    const r = renderizarApp('/operacional?cadencia=diaria')
    const radio = await screen.findByRole('radio', { name: 'Diária' })
    radio.focus()
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(busca(r).get('cadencia')).toBe('semanal'), { timeout: 15000 })
    expect(r.roteador.state.historyAction).toBe('PUSH')
    await userEvent.keyboard('{ArrowLeft}')
    await waitFor(() => expect(busca(r).get('cadencia')).toBe('diaria'), { timeout: 15000 })
    expect(r.roteador.state.historyAction).toBe('PUSH')
    await r.roteador.navigate(-1)
    await waitFor(() => expect(visaoMarcada()).toBe('Semanal'), { timeout: 15000 })
  })

  it('V6-4: duas escolhas no mesmo quadro que voltam à visão de partida não prendem o foco nem o rastro do seletor', async () => {
    const r = renderizarApp('/operacional?cadencia=diaria')
    await screen.findByRole('radiogroup', { name: 'Visão' })
    const diaria = screen.getByRole('radio', { name: 'Diária' })
    act(() => {
      fireEvent.click(screen.getByRole('radio', { name: 'Semanal' }))
      // O navegador marca o rádio nativamente; sem render entre as setas, o React ainda não o restaurou.
      ;(diaria as HTMLInputElement).checked = false
      fireEvent.click(diaria)
    })
    await waitFor(() => expect(busca(r).get('cadencia')).toBe('diaria'))
    // Troca por link depois: sem refs presas, o foco vai ao título (D-03), não fica no seletor.
    await act(async () => {
      await r.roteador.navigate('/operacional?cadencia=sustentacao')
    })
    await waitFor(() => expect(document.activeElement).toBe(document.querySelector('h1')), {
      timeout: 15000,
    })
  })

  it('o título do documento muda por visão', async () => {
    const r = renderizarApp('/operacional?cadencia=diaria')
    await screen.findByRole('radiogroup', { name: 'Visão' })
    await waitFor(() => expect(document.title).toContain('Operacional · Diária · Métricas DSPD'))
    await userEvent.click(screen.getByRole('radio', { name: 'Semanal' }))
    await waitFor(() => expect(document.title).toContain('Operacional · Semanal'))
    expect(screen.getByTestId('anuncio-visao')).toHaveTextContent(
      'Visão Semanal. Fonte: BusinessMap.',
    )
    expect(r.roteador.state.location.search).toContain('cadencia=semanal')
  })

  it('o hash decide a visão: #s1 abre a Sustentação e #o3 a Semanal', async () => {
    const a = renderizarApp('/operacional?cadencia=diaria#s1')
    await waitFor(() => expect(a.roteador.state.location.search).toContain('cadencia=sustentacao'))
    expect(
      await screen.findByTestId('metrica-S1', undefined, { timeout: 8000 }),
    ).toBeInTheDocument()
    a.unmount()
    const b = renderizarApp('/operacional?cadencia=sustentacao#o3')
    await waitFor(() => expect(b.roteador.state.location.search).toContain('cadencia=semanal'))
    expect(
      await screen.findByTestId('metrica-O3', undefined, { timeout: 8000 }),
    ).toBeInTheDocument()
  })

  it('o link antigo /sustentacao termina na visão com o cartão do hash', async () => {
    const r = renderizarApp('/sustentacao?prioridade=P1&periodo=12m&equipe=totvs&tipo=Bug#s2')
    expect(
      await screen.findByTestId('metrica-S2', undefined, { timeout: 8000 }),
    ).toBeInTheDocument()
    await waitFor(() => expect(busca(r).get('sust_prioridade')).toBe('p1'))
    expect(busca(r).get('sust_periodo')).toBe('12m')
    expect(busca(r).get('sust_equipe')).toBe('totvs')
    expect(busca(r).has('tipo')).toBe(false)
    expect(busca(r).get('cadencia')).toBe('sustentacao')
  })
})

describe('uma fonte por visão (CA-3, CA-4, CA-8)', () => {
  it('a Sustentação só tem cartões do Acelerato e da pesquisa; faixa com a fonte e só S2 e S1', async () => {
    renderizarApp('/operacional?cadencia=sustentacao&mock=sem-calibracao')
    await screen.findByTestId('recorte-sustentacao', undefined, { timeout: 8000 })
    for (const c of ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'EI-SUST', 'PV1']) {
      const el = await screen.findByTestId(`metrica-${c}`)
      expect(el).toHaveTextContent(
        c === 'PV1' ? 'Fonte: Pesquisa de percepção' : 'Fonte: Acelerato',
      )
    }
    expect(document.querySelectorAll('[data-testid^="metrica-O"]')).toHaveLength(0)
    const faixa = screen.getByTestId('faixa-atencao')
    expect(faixa).toHaveTextContent('Pede atenção no período · Sustentação (Acelerato)')
    expect(within(faixa).getByTestId('faixa-atencao-janela')).toHaveTextContent(
      'Período do filtro: 6 meses',
    )
    await waitFor(() =>
      expect(
        within(faixa)
          .queryAllByRole('link')
          .map((l) => l.getAttribute('href')).length,
      ).toBeGreaterThan(0),
    )
    for (const l of within(faixa).getAllByRole('link'))
      expect(l.getAttribute('href')).toMatch(/^#s[12]$/)
    expect(screen.queryByText('Também nesta aba', { exact: false })).toBeNull()
  })

  it('as visões do fluxo não têm cartões S*, EI-SUST nem PV1, e a faixa cita o BusinessMap', async () => {
    renderizarApp('/operacional?cadencia=semanal')
    await screen.findByTestId('metrica-O3', undefined, { timeout: 8000 })
    expect(document.querySelectorAll('[data-testid^="metrica-S"]')).toHaveLength(0)
    expect(screen.queryByTestId('metrica-EI-SUST')).toBeNull()
    expect(screen.queryByTestId('metrica-PV1')).toBeNull()
    expect(screen.getByTestId('faixa-atencao')).toHaveTextContent(
      'Pede atenção na semana · Fluxo de projeto (BusinessMap)',
    )
    expect(screen.getByTestId('metrica-O3')).toHaveTextContent('Fonte: BusinessMap')
  })

  it('a Diária: faixa do dia com a fonte e link para a Semanal que preserva os filtros e não leva o mock', async () => {
    renderizarApp(
      '/operacional?cadencia=diaria&equipe=fluig&sust_prioridade=p1&mock=sem-calibracao',
    )
    await screen.findByTestId('metrica-O2', undefined, { timeout: 8000 })
    expect(screen.getByTestId('faixa-atencao')).toHaveTextContent(
      'Pede atenção hoje · Fluxo de projeto (BusinessMap)',
    )
    const href =
      screen.getByRole('link', { name: /Ver também a visão semanal/ }).getAttribute('href') ?? ''
    const p = new URLSearchParams(href.split('?')[1])
    expect(p.get('cadencia')).toBe('semanal')
    expect(p.get('equipe')).toBe('fluig')
    expect(p.get('sust_prioridade')).toBe('p1')
    expect(p.has('mock')).toBe(false)
  })
})

describe('filtros por visão (CA-5, CA-6)', () => {
  it('a Sustentação: legenda da fonte e só Equipe de sustentação, Prioridade e Período', async () => {
    renderizarApp('/operacional?cadencia=sustentacao')
    expect(await screen.findByTestId('legenda-filtros')).toHaveTextContent(
      'Filtros da Sustentação · Acelerato',
    )
    expect(screen.getByTestId('filtro-equipe')).toHaveTextContent('Equipe de sustentação')
    expect(screen.getByTestId('filtro-prioridade')).toBeInTheDocument()
    expect(screen.getByTestId('filtro-periodo')).toHaveTextContent('6 meses')
    expect(screen.queryByTestId('filtro-tipo')).toBeNull()
    expect(screen.queryByTestId('filtro-sistema')).toBeNull()
  })

  it('o fluxo: legenda, Equipe, Tipo, Sistema e Período (12 semanas), sem Prioridade', async () => {
    renderizarApp('/operacional?cadencia=semanal')
    expect(await screen.findByTestId('legenda-filtros')).toHaveTextContent(
      'Filtros do fluxo de projeto · BusinessMap',
    )
    for (const f of ['equipe', 'tipo', 'sistema', 'periodo'])
      expect(screen.getByTestId(`filtro-${f}`)).toBeInTheDocument()
    expect(screen.getByTestId('filtro-periodo')).toHaveTextContent('12 semanas')
    expect(screen.queryByTestId('filtro-prioridade')).toBeNull()
  })

  it('trocar de visão guarda os filtros da outra: Sustentação com P1, volta à Semanal e os chips seguem', async () => {
    const r = renderizarApp('/operacional?cadencia=semanal&equipe=fluig&periodo=4s')
    await screen.findByRole('button', { name: 'Remover filtro Equipe: Fluig' })
    await userEvent.click(screen.getByRole('radio', { name: 'Sustentação' }))
    await userEvent.click(
      await screen.findByTestId('filtro-prioridade', undefined, { timeout: 8000 }),
    )
    await userEvent.click(await screen.findByLabelText('P1'))
    await waitFor(() => expect(busca(r).get('sust_prioridade')).toBe('p1'))
    expect(busca(r).get('equipe')).toBe('fluig')
    expect(busca(r).get('periodo')).toBe('4s')
    expect(await screen.findByTestId('filtros-guardados')).toHaveTextContent(
      'Os filtros do fluxo de projeto (2 ativos) continuam guardados para as visões Diária e Semanal.',
    )
    await userEvent.click(screen.getByRole('radio', { name: 'Semanal' }))
    expect(
      await screen.findByRole('button', { name: 'Remover filtro Equipe: Fluig' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('chip-filtro-periodo')).toBeInTheDocument()
    expect(await screen.findByTestId('filtros-guardados')).toHaveTextContent(
      'Os filtros da Sustentação (1 ativo) continuam guardados para a visão Sustentação.',
    )
    // "Limpar filtros" na Semanal não toca na Sustentação
    await userEvent.click(screen.getByTestId('limpar-filtros'))
    await waitFor(() => expect(busca(r).has('equipe')).toBe(false))
    expect(busca(r).get('sust_prioridade')).toBe('p1')
  })

  it('rodapé do cartão: nenhum cartão S cita Tipo ou Sistema, e nenhum O cita Prioridade (CA-7)', async () => {
    renderizarApp(
      '/operacional?cadencia=sustentacao&sust_prioridade=p1&sust_equipe=totvs&mock=sem-calibracao',
    )
    const s2 = await screen.findByTestId('metrica-S2', undefined, { timeout: 8000 })
    await waitFor(() => expect(s2).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
    for (const c of ['S1', 'S2', 'S3', 'S4']) {
      const t = screen.getByTestId(`metrica-${c}`).textContent
      expect(t).not.toMatch(/Tipo de demanda|Sistema/)
    }
  })
})

describe('índice da visão (CA-10)', () => {
  it('a Sustentação lista as seções na ordem; ocultar S3 e S4 retira Volume e resolução', async () => {
    window.localStorage.setItem(
      'metricas-dspd:preferencias:v1',
      JSON.stringify({
        versao: 1,
        paineis: { sustentacao: { ocultar: ['s3', 's4'] } },
        atualizadoEm: '2026-10-10T00:00:00.000Z',
      }),
    )
    try {
      renderizarApp('/operacional?cadencia=sustentacao')
      const nav = await screen.findByRole('navigation', { name: 'Ir para' }, { timeout: 8000 })
      expect(
        within(nav)
          .getAllByRole('link')
          .map((l) => l.textContent),
      ).toEqual([
        'Prazos',
        'Escalação, encerramento e reclassificação',
        'Espera invisível',
        'Mais métricas',
        'Percepção de valor',
      ])
    } finally {
      window.localStorage.clear()
    }
  })
})

describe('fonte sem coleta (CA-22)', () => {
  it('a Sustentação mostra SemDadosDaFonte e a Semanal funciona', async () => {
    const a = renderizarApp('/operacional?cadencia=sustentacao&mock=coleta-vazia:ac')
    expect(
      await screen.findByTestId('sem-dados-acelerato', undefined, { timeout: 8000 }),
    ).toBeInTheDocument()
    a.unmount()
    renderizarApp('/operacional?cadencia=semanal&mock=coleta-vazia:ac')
    expect(
      await screen.findByTestId('metrica-O3', undefined, { timeout: 8000 }),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('sem-dados-acelerato')).toBeNull()
  })
})
