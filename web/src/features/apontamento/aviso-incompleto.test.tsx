import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import ApontamentoPage from './ApontamentoPage'
import { RESPOSTA_FICTICIA } from './fixture'
import { INCOMPLETO } from './textos'
import type { FonteApontamento, RegistroIncompleto, RespostaApontamento } from './types'

const PROJETO = RESPOSTA_FICTICIA.distribuicao.porProjeto[0]!

const um: RegistroIncompleto = {
  total: 1,
  cards: [
    {
      cardId: '9100000001',
      titulo: 'Card de teste incompleto',
      projeto: { id: PROJETO.id, rotulo: PROJETO.rotulo, foraDoEscopo: false },
    },
  ],
  projetoIds: [PROJETO.id],
}
const dois: RegistroIncompleto = {
  total: 2,
  cards: [
    ...um.cards,
    {
      cardId: '9100000002',
      titulo: 'Outro card',
      projeto: { id: 'sem-projeto', rotulo: 'Sem iniciativa', foraDoEscopo: true },
    },
  ],
  projetoIds: [PROJETO.id, 'sem-projeto'],
}

function com(r: RegistroIncompleto | undefined): RespostaApontamento {
  const { registroIncompleto: _descartado, ...resto } = RESPOSTA_FICTICIA
  return r ? { ...resto, registroIncompleto: r } : resto
}

function renderizar(resposta: RespostaApontamento) {
  const fonte: FonteApontamento = { buscar: () => Promise.resolve(resposta) }
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const roteador = createMemoryRouter([{ path: '*', element: <ApontamentoPage fonte={fonte} /> }], {
    initialEntries: ['/operacional/apontamento'],
  })
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={roteador} />
    </QueryClientProvider>,
  )
}

async function aba() {
  const kpis = await screen.findByTestId('metrica-AP-KPIS')
  await waitFor(() => expect(kpis).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
}

describe('063: aviso de registro de horas incompleto', () => {
  it('CA-1/CA-10: faixa com título no singular, corpo, role status único e sem termos técnicos', async () => {
    renderizar(com(um))
    await aba()
    const faixa = screen.getByTestId('aviso-registro-incompleto')
    expect(faixa).toHaveAttribute('role', 'status')
    expect(faixa).toHaveTextContent('Registro de horas incompleto em 1 card')
    expect(faixa).not.toHaveTextContent(/em 1 cards/)
    expect(faixa).toHaveTextContent(INCOMPLETO.corpo)
    expect(faixa.querySelector('svg')).not.toBeNull()
    expect(`${INCOMPLETO.titulo(1)} ${INCOMPLETO.corpo}`).not.toMatch(
      /teto|lote|1000|worklog|pagina|loggedTime|em breve/i,
    )
    expect(screen.getAllByTestId('aviso-registro-incompleto')).toHaveLength(1)
  })

  it('CA-1: plural; a faixa fica abaixo da legenda e antes dos filtros', async () => {
    renderizar(com(dois))
    await aba()
    const faixa = screen.getByTestId('aviso-registro-incompleto')
    expect(faixa).toHaveTextContent('Registro de horas incompleto em 2 cards')
    const legenda = screen.getByTestId('legenda-finalidade')
    expect(legenda.compareDocumentPosition(faixa) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('CA-2/CA-11: a lista abre por botão com aria-expanded e mostra card, título e projeto, sem pessoa nem horas', async () => {
    const u = userEvent.setup()
    renderizar(com(dois))
    await aba()
    const lista = screen.getByTestId('lista-cards-incompletos')
    expect(lista).not.toBeVisible()
    const botao = screen.getByRole('button', { name: 'Ver quais cards' })
    expect(botao).toHaveAttribute('aria-expanded', 'false')
    await u.click(botao)
    expect(screen.getByRole('button', { name: 'Ocultar lista de cards' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(lista).toBeVisible()
    expect(lista).toHaveTextContent('9100000001 · Card de teste incompleto')
    expect(lista).toHaveTextContent('Sem iniciativa (Fora dos quadros coletados)')
    expect(lista.textContent).not.toMatch(/\d+\s*h\b|Pessoa/)
    expect(botao.className).toMatch(/min-h-11/)
  })

  it('CA-3/CA-4: selo no projeto com dica por foco, Esc fecha, e coluna Observação na tabela', async () => {
    const u = userEvent.setup()
    renderizar(com(um))
    await aba()
    const cartao = screen.getByTestId('metrica-AP-PROJETO')
    const selos = within(cartao).getByTestId('selos-projeto-incompleto')
    const selo = within(selos).getByRole('button', { name: /Horas incompletas/ })
    selo.focus()
    await u.keyboard('{Enter}')
    expect(await screen.findByText(INCOMPLETO.dicaSelo)).toBeInTheDocument()
    await u.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByText(INCOMPLETO.dicaSelo)).toBeNull())
    const tabela = within(cartao).getByTestId('tabela-AP-PROJETO-detalhe')
    expect(within(tabela).getByRole('columnheader', { name: 'Observação' })).toBeInTheDocument()
    expect(within(tabela).getAllByText('Horas incompletas')).toHaveLength(1)
  })

  it('lugar 3: nota nos KPIs e "Como ler" só com o sinal; a nota leva à faixa', async () => {
    const u = userEvent.setup()
    renderizar(com(um))
    await aba()
    const nota = within(screen.getByTestId('metrica-AP-KPIS')).getByTestId('nota-kpis-incompleto')
    expect(nota).toHaveTextContent(INCOMPLETO.notaKpis)
    await u.click(within(nota).getByRole('link', { name: INCOMPLETO.irAoAviso }))
    expect(screen.getByTestId('aviso-registro-incompleto')).toHaveFocus()
    expect(screen.queryAllByTestId('nota-kpis-incompleto')).toHaveLength(1)
  })

  it.each([
    ['total 0', { total: 0, cards: [], projetoIds: [] }],
    ['campo ausente', undefined],
  ])('CA-6/CA-12: %s: sem faixa, selo, coluna nem nota, e a aba carrega', async (_n, r) => {
    renderizar(com(r))
    await aba()
    expect(screen.queryByTestId('aviso-registro-incompleto')).toBeNull()
    expect(screen.queryByTestId('selos-projeto-incompleto')).toBeNull()
    expect(screen.queryByTestId('nota-kpis-incompleto')).toBeNull()
    expect(screen.queryByRole('columnheader', { name: 'Observação' })).toBeNull()
    expect(screen.queryByText(/Horas incompletas/)).toBeNull()
  })

  it('CA-5: sem botão de dispensa', async () => {
    renderizar(com(um))
    await aba()
    const faixa = screen.getByTestId('aviso-registro-incompleto')
    expect(within(faixa).getAllByRole('button')).toHaveLength(1)
  })
})
