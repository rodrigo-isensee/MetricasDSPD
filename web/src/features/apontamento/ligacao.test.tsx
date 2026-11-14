import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderizarApp } from '@/test/helpers'
import { respostaComNomesReais, respostaComOutraArea, respostaVazia } from './fixture'
import { criarFetchFalso, type OpcoesFetchFalso } from './rota-falsa'

const URL_ABA = '/operacional/apontamento'

afterEach(() => {
  vi.unstubAllGlobals()
})

function abrir(url: string = URL_ABA, opcoes: OpcoesFetchFalso = {}) {
  const falso = criarFetchFalso(opcoes)
  vi.stubGlobal('fetch', falso.fetchFalso)
  return { ...renderizarApp(url), ...falso }
}

async function pronto() {
  const kpis = await screen.findByTestId('metrica-AP-KPIS')
  await waitFor(() => expect(kpis).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
  return kpis
}

describe('ligação à rota GET /api/apontamento (C2)', () => {
  it('lê a rota real: chama o caminho da API e nenhum cartão leva o selo "Dados fictícios"', async () => {
    const { chamadas } = abrir()
    await pronto()
    expect(chamadas[0]).toBe('/api/apontamento?nivelMatriz=tipo&anomalos=incluir')
    expect(screen.queryByTestId('selo-ficticio')).not.toBeInTheDocument()
  })

  it('o filtro de equipe da URL vira parâmetro da rota, só por slug', async () => {
    const { chamadas } = abrir(`${URL_ABA}?equipe=portal&Pessoa=Maria&nome=Maria`)
    await pronto()
    expect(chamadas.some((c) => c.includes('equipe=portal'))).toBe(true)
    expect(chamadas.join()).not.toMatch(/Maria|nome/)
  })

  it('pessoa= na URL nunca vai à rota: aviso "O filtro Pessoa foi retirado; use Equipe." e a página segue (CA-9)', async () => {
    const { chamadas } = abrir(`${URL_ABA}?pessoa=p2,Maria`)
    await pronto()
    expect(chamadas.every((c) => !c.includes('pessoa'))).toBe(true)
    expect(screen.getByTestId('aviso-pessoa-retirada')).toHaveTextContent(
      'O filtro Pessoa foi retirado; use Equipe.',
    )
    expect(document.body).not.toHaveTextContent('Maria')
  })

  it('carregando: o cartão mostra o estado de carregamento e o anúncio, antes da resposta', async () => {
    const falso = criarFetchFalso()
    let liberar: () => void = () => {}
    const travada = new Promise<void>((r) => (liberar = r))
    vi.stubGlobal('fetch', async (...a: Parameters<typeof fetch>) => {
      await travada
      return falso.fetchFalso(...a)
    })
    renderizarApp(URL_ABA)
    expect(await screen.findByTestId('metrica-AP-KPIS')).toHaveAttribute(
      'data-estado',
      'carregando',
    )
    expect(screen.getByTestId('anuncio-carregando')).not.toBeEmptyDOMElement()
    liberar()
    await pronto()
    expect(screen.getByTestId('anuncio-carregando')).toBeEmptyDOMElement()
  })

  it('erro: falha da rota mostra o erro em cada cartão e "Tentar de novo" busca outra vez', async () => {
    const falso = criarFetchFalso({ rede: true })
    vi.stubGlobal('fetch', falso.fetchFalso)
    renderizarApp(URL_ABA)
    const kpis = await screen.findByTestId('metrica-AP-KPIS')
    await waitFor(() => expect(kpis).toHaveAttribute('data-estado', 'erro'), { timeout: 8000 })
    const antes = falso.chamadas.length
    await userEvent.click(within(kpis).getByRole('button', { name: 'Tentar de novo' }))
    await waitFor(() => expect(falso.chamadas.length).toBeGreaterThan(antes))
  })

  it('vazio: período sem apontamento mostra o estado vazio com orientação', async () => {
    abrir(URL_ABA, { resposta: () => respostaVazia() })
    expect(await screen.findByTestId('estado-vazio-AP')).toHaveTextContent(
      'Nenhum apontamento no período dos filtros',
    )
  })

  it('nada de pessoa em localStorage nem sessionStorage, nem ao filtrar a equipe', async () => {
    abrir(`${URL_ABA}?pessoa=p1`, { resposta: () => respostaComNomesReais() })
    await pronto()
    await userEvent.click(screen.getByRole('button', { name: /^Equipe: / }))
    await userEvent.click(await screen.findByLabelText('Portal'))
    await userEvent.keyboard('{Escape}')
    const chaves = (a: Storage) => Array.from({ length: a.length }, (_, k) => a.key(k))
    expect(chaves(window.localStorage)).toEqual([])
    expect(chaves(window.sessionStorage)).toEqual([])
  })
})

describe('filtro por tipo (id de opcoes.tipos, type_id em dígitos)', () => {
  const botaoTipo = () => screen.findByRole('button', { name: /^Tipo: / })

  it('fica sempre visível, sem consulta de sondagem: a primeira chamada é a da aba', async () => {
    const { chamadas } = abrir()
    await pronto()
    expect(await botaoTipo()).toBeInTheDocument()
    expect(chamadas).toEqual(['/api/apontamento?nivelMatriz=tipo&anomalos=incluir'])
  })

  it('um tipo: manda o id da opção (type_id em dígitos), não o rótulo, e mostra o chip com o rótulo', async () => {
    const { chamadas, roteador } = abrir()
    await pronto()
    await userEvent.click(await botaoTipo())
    await userEvent.click(await screen.findByLabelText('Correção'))
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(roteador.state.location.search).toContain('tipo=5'))
    await waitFor(() => expect(chamadas.some((c) => /[?&]tipo=5(&|$)/.test(c))).toBe(true))
    expect(chamadas.join()).not.toMatch(/tipo=[^&]*[a-z]/i)
    expect(await screen.findByText('Tipo: Correção')).toBeInTheDocument()
    await pronto()
  })

  it('dois tipos: manda os dois ids na lista, na ordem escolhida', async () => {
    const { chamadas } = abrir()
    await pronto()
    await userEvent.click(await botaoTipo())
    await userEvent.click(await screen.findByLabelText('Tarefa'))
    await userEvent.click(await screen.findByLabelText('Melhoria'))
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(chamadas.some((c) => c.includes('tipo=3%2C7'))).toBe(true))
    expect(await screen.findByText('Tipo: Tarefa')).toBeInTheDocument()
    expect(await screen.findByText('Tipo: Melhoria')).toBeInTheDocument()
    await pronto()
  })

  it('id inexistente (dígitos que a rota não conhece): vai à rota, volta o recorte vazio com orientação, e o chip sai pelo X', async () => {
    const { chamadas, roteador } = abrir(`${URL_ABA}?tipo=999`)
    expect(await screen.findByTestId('estado-vazio-AP')).toHaveTextContent(
      'Nenhum apontamento no período dos filtros',
    )
    expect(chamadas.some((c) => /[?&]tipo=999(&|$)/.test(c))).toBe(true)
    await userEvent.click(screen.getAllByRole('button', { name: /^Remover filtro Tipo/ })[0]!)
    await waitFor(() => expect(roteador.state.location.search).toBe(''))
    await pronto()
  })

  it('valor fora de dígitos na URL (rótulo antigo) é descartado com aviso e nunca vai à rota', async () => {
    const { chamadas } = abrir(`${URL_ABA}?tipo=melhoria`)
    await pronto()
    expect(chamadas.every((c) => !c.includes('tipo='))).toBe(true)
    expect(screen.getByTestId('filtros-invalidos')).toHaveTextContent('Tipo')
    expect(screen.getByTestId('filtros-invalidos')).not.toHaveTextContent('melhoria')
  })
})

describe('Outra área', () => {
  it('aparece como "Outra área", sem nome, nas listas por pessoa e por último, mesmo ordenando por total', async () => {
    abrir(`${URL_ABA}?ordem=total`, { resposta: () => respostaComOutraArea() })
    await pronto()
    const matriz = await screen.findByTestId('metrica-AP-MATRIZ')
    expect(within(matriz).getAllByText('Outra área').length).toBeGreaterThan(0)
    expect(screen.getByTestId('aba-apontamento').textContent).not.toMatch(/outra-area/)
  })

  it('a barra de filtros não tem Pessoa, e a explicação de Outra área fica junto da capacidade (CA-7, Q-3, K-289)', async () => {
    abrir(URL_ABA, { resposta: () => respostaComOutraArea() })
    await pronto()
    const barra = screen.getByTestId('barra-filtros-apontamento')
    expect(within(barra).queryByRole('button', { name: /^Pessoa/ })).toBeNull()
    expect(within(barra).queryByTestId('nota-outra-area')).toBeNull()
    const capacidade = await screen.findByTestId('metrica-AP-CAPACIDADE-PESSOA')
    expect(within(capacidade).getByTestId('nota-outra-area-capacidade')).toBeInTheDocument()
  })
})

describe('aba como quinta visão do seletor do Operacional', () => {
  it('no Operacional o seletor tem cinco opções; escolher Apontamento abre a aba', async () => {
    const { roteador } = abrir('/operacional?cadencia=semanal')
    const grupo = await screen.findByRole('radiogroup', { name: 'Visão' })
    expect(
      within(grupo)
        .getAllByRole('radio')
        .map((r) => (r as HTMLInputElement).value),
    ).toEqual(['resumo', 'diaria', 'semanal', 'sustentacao', 'apontamento'])
    await userEvent.click(within(grupo).getByRole('radio', { name: 'Apontamento' }))
    await waitFor(() => expect(roteador.state.location.pathname).toBe(URL_ABA))
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Apontamento' }),
    ).toBeInTheDocument()
    await pronto()
  })

  it('na aba, o seletor marca Apontamento e escolher outra visão volta ao Operacional nela', async () => {
    const { roteador } = abrir()
    await pronto()
    const grupo = screen.getByRole('radiogroup', { name: 'Visão' })
    expect(within(grupo).getByRole('radio', { name: 'Apontamento' })).toBeChecked()
    await userEvent.click(within(grupo).getByRole('radio', { name: 'Diária' }))
    await waitFor(() => expect(roteador.state.location.pathname).toBe('/operacional'))
    expect(roteador.state.location.search).toBe('?cadencia=diaria')
    expect(await screen.findByTestId('pergunta-cadencia')).toBeInTheDocument()
  })
})
