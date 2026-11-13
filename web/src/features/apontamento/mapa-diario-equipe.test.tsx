import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import ApontamentoPage from './ApontamentoPage'
import { respostaFicticia } from './fixture'
import { CARTOES } from './textos'
import type { FonteApontamento, RespostaApontamento } from './types'

const URL_ABA = '/operacional/apontamento'

function renderizar(url: string, fonte: FonteApontamento) {
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

const fonteDe = (r: (c: Parameters<FonteApontamento['buscar']>[0]) => RespostaApontamento) =>
  ({ buscar: (c) => Promise.resolve(r(c)) }) satisfies FonteApontamento

const semLinhasSeEquipe = fonteDe((c) => {
  const r = respostaFicticia(c)
  return c.equipe ? { ...r, diario: { ...r.diario, linhas: [] } } : r
})

describe('mapa diário recortado pela Equipe (K-286, volta 1 da revisão de UX)', () => {
  it('A1: o "Como ler" não diz que o cartão ignora os filtros e cita a Equipe', () => {
    expect(CARTOES.diario.comoLer).not.toMatch(/não responde aos filtros/i)
    expect(CARTOES.diario.comoLer).toMatch(/Equipe/)
    expect(CARTOES.diario.comoLer).toMatch(/dia inteiro/)
  })

  it('A2: equipe sem ninguém na janela mostra mensagem própria e remove o filtro pelo botão', async () => {
    const roteador = renderizar(`${URL_ABA}?equipe=portal`, semLinhasSeEquipe)
    const cartao = await screen.findByTestId('metrica-AP-DIARIO')
    const aviso = await within(cartao).findByTestId('diario-sem-pessoas')
    expect(aviso).toHaveTextContent(/Nenhum apontamento da equipe escolhida nesta janela/)
    expect(within(cartao).queryByTestId('mapa-diario')).toBeNull()
    expect(within(cartao).queryByTestId('legenda-diario')).toBeNull()
    await userEvent.click(within(cartao).getByRole('button', { name: 'Remover filtro Equipe' }))
    await waitFor(() => expect(roteador.state.location.search).toBe(''))
    expect(await screen.findByTestId('mapa-diario')).toBeInTheDocument()
  })

  it('A2: sem filtro de equipe, nada de mensagem de vazio da equipe', async () => {
    renderizar(URL_ABA, semLinhasSeEquipe)
    expect(await screen.findByTestId('mapa-diario')).toBeInTheDocument()
    expect(screen.queryByTestId('diario-sem-pessoas')).toBeNull()
  })

  it('A3: com a Equipe ativa, a dica do atípico diz que o dia é avaliado inteiro', async () => {
    renderizar(`${URL_ABA}?equipe=portal`, fonteDe(respostaFicticia))
    const dica = await screen.findByTestId('dica-anomalia')
    expect(dica).toHaveTextContent(
      'O dia é avaliado com todas as horas da pessoa, não só as da equipe escolhida.',
    )
  })

  it('A3: sem Equipe, a dica não traz essa frase', async () => {
    renderizar(URL_ABA, fonteDe(respostaFicticia))
    const dica = await screen.findByTestId('dica-anomalia')
    expect(dica).not.toHaveTextContent(/não só as da equipe/)
  })

  it('A4: o nome da grade e a legenda da tabela dizem a equipe, nunca pessoa', async () => {
    renderizar(`${URL_ABA}?equipe=portal`, fonteDe(respostaFicticia))
    const grade = await within(await screen.findByTestId('mapa-diario')).findByRole('grid')
    expect(grade).toHaveAccessibleName(/^Horas apontadas por pessoa e dia, da equipe Portal, de /)
  })

  it('A4: com duas equipes, o nome da grade diz das equipes e lista as duas', async () => {
    renderizar(`${URL_ABA}?equipe=integracoes,portal`, fonteDe(respostaFicticia))
    const grade = await within(await screen.findByTestId('mapa-diario')).findByRole('grid')
    expect(grade).toHaveAccessibleName(
      /^Horas apontadas por pessoa e dia, das equipes Integrações, Portal, de /,
    )
  })

  it('A4: sem Equipe, o nome da grade não cita equipe', async () => {
    renderizar(URL_ABA, fonteDe(respostaFicticia))
    const grade = await within(await screen.findByTestId('mapa-diario')).findByRole('grid')
    expect(grade).not.toHaveAccessibleName(/equipe/i)
  })
})
