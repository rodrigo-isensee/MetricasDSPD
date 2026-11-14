import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
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
    segundos: (qtd - i) * 3600,
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
                projeto: {
                  id: incompletos[0]!,
                  rotulo: `Projeto ${incompletos[0]!.slice(1).padStart(2, '0')}`,
                  foraDoEscopo: false,
                },
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
    expect(within(tabela).getByText('Projeto 00')).toBeInTheDocument()
    expect(within(tabela).queryByText('Projeto 11')).toBeNull()
    expect(
      within(cartao).getByRole('button', { name: 'Ver todos os 12 projetos' }),
    ).not.toHaveAttribute('aria-expanded')
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
    expect(botao).not.toHaveAttribute('aria-expanded')
    expect(within(cartao).getByRole('status')).toHaveTextContent('Mostrando todos os 12 projetos.')
    expect(botao).toHaveFocus()
    expect(within(cartao).queryByTestId('projetos-demais')).toBeNull()
    expect(within(cartao).getAllByRole('row')).toHaveLength(13)
    await u.click(botao)
    expect(within(cartao).getByTestId('projetos-demais')).toBeInTheDocument()
    expect(botao).toHaveTextContent('Ver todos os 12 projetos')
    expect(within(cartao).getByRole('status')).toHaveTextContent(
      'Mostrando os 10 projetos com mais horas, de 12.',
    )
  })

  it('CA-38: reabrir o cartão volta a mostrar só os 10 maiores', async () => {
    const u = userEvent.setup()
    const resposta = com(12)
    const cartao = await renderizar(resposta)
    await u.click(within(cartao).getByRole('button', { name: 'Ver todos os 12 projetos' }))
    expect(within(cartao).getAllByRole('row')).toHaveLength(13)
    cleanup()
    const reaberto = await renderizar(resposta)
    expect(within(reaberto).getAllByRole('row')).toHaveLength(11)
    expect(within(reaberto).getByTestId('projetos-demais')).toBeInTheDocument()
    expect(within(reaberto).getByRole('button', { name: 'Ver todos os 12 projetos' })).toBeVisible()
  })

  it('empate na 10ª vaga: o corte e o Ver todos mantêm a mesma ordem do servidor', async () => {
    const u = userEvent.setup()
    const resposta = com(12)
    const ordem = ['zeta', 'Alfa', 'érico']
    const lista = projetos(12).map((l, i) =>
      i >= 9 && i < 12 ? { ...l, rotulo: ordem[i - 9]!, segundos: 7200 } : l,
    )
    resposta.distribuicao.porProjeto = lista
    const cartao = await renderizar(resposta)
    const rotulos = () =>
      within(cartao)
        .getAllByRole('row')
        .slice(1)
        .map((r) => r.textContent)
    const dez = rotulos()
    expect(dez[9]).toMatch(/^zeta/)
    await u.click(within(cartao).getByRole('button', { name: 'Ver todos os 12 projetos' }))
    expect(rotulos().slice(0, 10)).toEqual(dez)
  })

  it('CA-36: com 10 projetos ou menos não há botão nem linha Demais', async () => {
    const cartao = await renderizar(com(10))
    expect(within(cartao).queryByTestId('projetos-demais')).toBeNull()
    expect(within(cartao).queryByTestId('projetos-mostrando')).toBeNull()
    expect(within(cartao).queryByRole('button', { name: /Ver todos|Ver só/ })).toBeNull()
    expect(within(cartao).getAllByRole('row')).toHaveLength(11)
  })

  it('o selo de incompleto vale para projeto fora dos 10 maiores', async () => {
    const cartao = await renderizar(com(12, ['p11']))
    const selos = within(cartao).getByTestId('selos-projeto-incompleto')
    expect(selos).toHaveTextContent('Projeto 11')
  })

  it('B-2: a linha Demais leva o selo quando um projeto fora dos 10 está incompleto', async () => {
    const cartao = await renderizar(com(12, ['p11']))
    expect(
      within(within(cartao).getByTestId('projetos-demais')).getByText('Horas incompletas'),
    ).toBeInTheDocument()
  })

  it('B-2: sem incompleto entre os demais, a linha Demais não leva o selo', async () => {
    const cartao = await renderizar(com(12, ['p0']))
    expect(
      within(within(cartao).getByTestId('projetos-demais')).queryByText('Horas incompletas'),
    ).toBeNull()
    cleanup()
    const sem = await renderizar(com(12))
    expect(
      within(within(sem).getByTestId('projetos-demais')).queryByText('Horas incompletas'),
    ).toBeNull()
  })

  it('B-3: a altura do gráfico tem teto com muitos projetos', async () => {
    const u = userEvent.setup()
    const cartao = await renderizar(com(60))
    await u.click(within(cartao).getByRole('button', { name: 'Ver todos os 60 projetos' }))
    const div = cartao.querySelector('figure > div[style]') as HTMLElement
    expect(div.style.height).toBe('1200px')
  })
})
