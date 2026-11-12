import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import ApontamentoPage from './ApontamentoPage'
import { RESPOSTA_FICTICIA } from './fixture'
import type { FonteApontamento, LinhaDistribuicao, RespostaApontamento } from './types'

const base = RESPOSTA_FICTICIA.distribuicao.porProjeto[0]!

function projetos(qtd: number): LinhaDistribuicao[] {
  return Array.from({ length: qtd }, (_, i) => ({
    ...base,
    id: `p${i}`,
    rotulo: `Projeto ${String(i).padStart(2, '0')}`,
    segundos: (i + 1) * 3600,
    apontamentos: 25,
  }))
}

function com(qtd: number, incompletos: string[] = []): RespostaApontamento {
  const { registroIncompleto: _descartado, ...resto } = RESPOSTA_FICTICIA
  return {
    ...resto,
    distribuicao: { ...resto.distribuicao, porProjeto: projetos(qtd) },
    ...(incompletos.length > 0
      ? {
          registroIncompleto: {
            total: 1,
            cards: [
              {
                cardId: '9100000001',
                titulo: 'Card incompleto',
                projeto: { id: incompletos[0]!, rotulo: 'Projeto 00', foraDoEscopo: false },
              },
            ],
            projetoIds: incompletos,
          },
        }
      : {}),
  }
}

async function renderizar(resposta: RespostaApontamento) {
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
  const kpis = await screen.findByTestId('metrica-AP-KPIS')
  await waitFor(() => expect(kpis).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
  return screen.getByTestId('metrica-AP-PROJETO')
}

describe('097 L9: os 10 maiores do AP-PROJETO', () => {
  it('CA-33/CA-34: com 12 projetos lista os 10 de mais horas, a frase, a linha Demais e o botão', async () => {
    const cartao = await renderizar(com(12))
    expect(within(cartao).getByTestId('projetos-mostrando')).toHaveTextContent(
      'Mostrando os 10 projetos com mais horas, de 12.',
    )
    expect(within(cartao).getByTestId('projetos-demais')).toHaveTextContent(
      'Demais 2 projetos: 3 h',
    )
    const tabela = within(cartao).getByRole('table')
    expect(within(tabela).getAllByRole('row')).toHaveLength(11)
    expect(within(tabela).getByText('Projeto 11')).toBeInTheDocument()
    expect(within(tabela).queryByText('Projeto 00')).toBeNull()
    expect(
      within(cartao).getByRole('button', { name: 'Ver todos os 12 projetos' }),
    ).toHaveAttribute('aria-expanded', 'false')
  })

  it('singular com 11 projetos', async () => {
    const cartao = await renderizar(com(11))
    expect(within(cartao).getByTestId('projetos-demais')).toHaveTextContent('Demais 1 projeto: 1 h')
  })

  it('CA-35: ver todos abre região com rolagem focável, troca o botão e mantém o foco', async () => {
    const u = userEvent.setup()
    const cartao = await renderizar(com(12))
    const botao = within(cartao).getByRole('button', { name: 'Ver todos os 12 projetos' })
    await u.click(botao)
    const regiao = within(cartao).getByRole('region', { name: 'Todos os projetos, com rolagem' })
    expect(regiao).toHaveAttribute('tabindex', '0')
    expect(regiao.className).toMatch(/max-h-\[360px\]/)
    expect(botao).toHaveTextContent('Ver só os 10 maiores')
    expect(botao).toHaveAttribute('aria-expanded', 'true')
    expect(botao).toHaveFocus()
    expect(within(cartao).queryByTestId('projetos-demais')).toBeNull()
    expect(within(cartao).getAllByRole('row')).toHaveLength(13)
    await u.click(botao)
    expect(within(cartao).getByTestId('projetos-demais')).toBeInTheDocument()
    expect(botao).toHaveAttribute('aria-expanded', 'false')
  })

  it('CA-36: com 10 projetos ou menos não há botão nem linha Demais', async () => {
    const cartao = await renderizar(com(10))
    expect(within(cartao).queryByTestId('projetos-demais')).toBeNull()
    expect(within(cartao).queryByTestId('projetos-mostrando')).toBeNull()
    expect(within(cartao).queryByRole('button', { name: /Ver todos|Ver só/ })).toBeNull()
    expect(within(cartao).getAllByRole('row')).toHaveLength(11)
  })

  it('o selo de incompleto vale para projeto fora dos 10 maiores', async () => {
    const cartao = await renderizar(com(12, ['p0']))
    const selos = within(cartao).getByTestId('selos-projeto-incompleto')
    expect(selos).toHaveTextContent('Projeto 00')
  })
})
