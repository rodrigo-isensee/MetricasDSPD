import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import ApontamentoPage from './ApontamentoPage'
import { consultaParaQuery } from './api'
import { RESPOSTA_FICTICIA, fonteFicticia, respostaFicticia } from './fixture'
import { lerFiltros, opcoesDeSetor } from './filtros'
import type { ConsultaApontamento, FonteApontamento, RespostaApontamento } from './types'

const URL_ABA = '/operacional/apontamento'
const PADRAO: ConsultaApontamento = { nivelMatriz: 'tipo', anomalos: 'incluir' }

function renderizar(url: string = URL_ABA, fonte: FonteApontamento = fonteFicticia) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const roteador = createMemoryRouter([{ path: '*', element: <ApontamentoPage fonte={fonte} /> }], {
    initialEntries: [url],
  })
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={roteador} />
    </QueryClientProvider>,
  )
  return roteador
}

async function pronto(url?: string, fonte?: FonteApontamento) {
  const roteador = renderizar(url, fonte)
  const el = await screen.findByTestId('metrica-AP-KPIS')
  await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
  return roteador
}

const semSetores = (): RespostaApontamento => {
  const { setores: _omitido, ...opcoes } = RESPOSTA_FICTICIA.opcoes
  return { ...RESPOSTA_FICTICIA, opcoes }
}

describe('filtro Setor no Apontamento', () => {
  it('aparece antes da Equipe, com "Todos", e lista as opções da resposta com "Sem setor"', async () => {
    await pronto()
    const barra = screen.getByTestId('barra-filtros-apontamento')
    const botoes = within(barra)
      .getAllByRole('button')
      .map((b) => b.textContent)
    const iSetor = botoes.findIndex((t) => t.startsWith('Setor: Todos'))
    const iEquipe = botoes.findIndex((t) => t.startsWith('Equipe: '))
    expect(iSetor).toBeGreaterThanOrEqual(0)
    expect(iSetor).toBeLessThan(iEquipe)
    await userEvent.click(screen.getByRole('button', { name: /^Setor: / }))
    for (const nome of ['Plataformas', 'Sistemas Corporativos', 'Sem setor'])
      expect(await screen.findByLabelText(nome)).toBeInTheDocument()
  })

  it('a escolha vai para a URL (lista de slugs), vira chip e o chip a remove', async () => {
    const roteador = await pronto()
    await userEvent.click(screen.getByRole('button', { name: /^Setor: / }))
    await userEvent.click(await screen.findByLabelText('Plataformas'))
    await userEvent.click(await screen.findByLabelText('Sem setor'))
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(roteador.state.location.search).toBe('?setor=plataformas%2Csem-setor'),
    )
    const chips = await screen.findByRole('list', { name: 'Filtros ativos' })
    expect(within(chips).getByText('Setor: Sem setor')).toBeInTheDocument()
    await userEvent.click(
      within(chips).getByRole('button', { name: 'Remover filtro Setor: Plataformas' }),
    )
    await waitFor(() => expect(roteador.state.location.search).toBe('?setor=sem-setor'))
  })

  it('link com setor reabre o filtro marcado; valor fora do formato é descartado e avisado', async () => {
    await pronto(`${URL_ABA}?setor=plataformas`)
    expect(screen.getByRole('button', { name: 'Setor: Plataformas' })).toBeInTheDocument()
    const lidos = lerFiltros(new URLSearchParams('setor=Plataformas Ltda,plataformas'))
    expect(lidos.consulta.setor).toEqual(['plataformas'])
    expect(lidos.invalidos).toEqual(['Setor'])
  })

  it('resposta sem `setores` (contrato opcional): o filtro não aparece', async () => {
    await pronto(URL_ABA, { buscar: () => Promise.resolve(semSetores()) })
    expect(screen.queryByRole('button', { name: /^Setor: / })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Equipe: / })).toBeInTheDocument()
    expect(opcoesDeSetor(semSetores().opcoes)).toBeUndefined()
  })

  it('sem `setores` na resposta, o setor da URL vira chip com o próprio id e o recorte fictício é vazio', async () => {
    await pronto(`${URL_ABA}?setor=plataformas`, { buscar: () => Promise.resolve(semSetores()) })
    const chips = await screen.findByRole('list', { name: 'Filtros ativos' })
    expect(within(chips).getByText('Setor: plataformas')).toBeInTheDocument()
    expect(
      respostaFicticia({ ...PADRAO, setor: ['plataformas'] }, semSetores()).kpis.apontamentos,
    ).toBe(0)
  })

  it('lista de setores vazia: o filtro aparece sem opções, como os outros', async () => {
    const r: RespostaApontamento = {
      ...RESPOSTA_FICTICIA,
      opcoes: { ...RESPOSTA_FICTICIA.opcoes, setores: [] },
    }
    await pronto(URL_ABA, { buscar: () => Promise.resolve(r) })
    await userEvent.click(screen.getByRole('button', { name: /^Setor: / }))
    expect(screen.queryAllByRole('checkbox', { name: /Plataformas/ })).toHaveLength(0)
  })

  it('erro na carga: o link com setor mostra o chip e permite remover', async () => {
    const roteador = renderizar(`${URL_ABA}?setor=plataformas`, {
      buscar: () => Promise.reject(new Error('falha')),
    })
    const chips = await screen.findByRole('list', { name: 'Filtros ativos' })
    expect(within(chips).getByText('Setor: plataformas')).toBeInTheDocument()
    await userEvent.click(
      within(chips).getByRole('button', { name: 'Remover filtro Setor: plataformas' }),
    )
    await waitFor(() => expect(roteador.state.location.search).toBe(''))
  })

  it('a consulta leva o setor em CSV, e "Limpar filtros" o remove da URL', async () => {
    expect(consultaParaQuery({ ...PADRAO, setor: ['plataformas', 'sem-setor'] })).toBe(
      'setor=plataformas%2Csem-setor&nivelMatriz=tipo&anomalos=incluir',
    )
    expect(consultaParaQuery({ ...PADRAO, setor: [] })).toBe('nivelMatriz=tipo&anomalos=incluir')
    const roteador = await pronto(`${URL_ABA}?setor=plataformas&equipe=portal`)
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    await waitFor(() => expect(roteador.state.location.search).toBe(''))
  })

  it('fonte fictícia: setor que existe nas opções filtra; que não existe devolve o recorte vazio', () => {
    expect(
      respostaFicticia({ ...PADRAO, setor: ['plataformas'] }).kpis.apontamentos,
    ).toBeGreaterThan(0)
    expect(respostaFicticia({ ...PADRAO, setor: ['nao-existe'] }).kpis.apontamentos).toBe(0)
  })

  it('nada de pessoa nem comparação: o filtro só recorta (nenhum cartão novo por setor)', async () => {
    const ids = () =>
      screen
        .getAllByTestId(/^metrica-AP-/)
        .map((e) => e.getAttribute('data-testid'))
        .sort()
    await pronto()
    const semFiltro = ids()
    expect(semFiltro.length).toBeGreaterThan(0)
    cleanup()
    await pronto(`${URL_ABA}?setor=plataformas`)
    expect(ids()).toEqual(semFiltro)
  })
})
