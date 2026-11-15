import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import ApontamentoPage from './ApontamentoPage'
import { respostaFicticia } from './fixture'
import { ANOMALIA, CARTOES, DIARIO_VAZIO } from './textos'
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

const semPessoas = (r: RespostaApontamento): RespostaApontamento => ({
  ...r,
  diario: { ...r.diario, linhas: [] },
})

const semLinhasSeRecorte = fonteDe((c) => {
  const r = respostaFicticia(c)
  return c.setor || c.equipe ? semPessoas(r) : r
})

describe('mapa diário recortado pelo Setor (K-337, decisão do dono de 14/11)', () => {
  it('A1: o "Como ler" diz que Setor e Equipe recortam o mapa, em qualquer setor ou equipe', () => {
    expect(CARTOES.diario.comoLer).toMatch(
      /O Setor e a Equipe escolhidos na barra recortam este mapa/,
    )
    expect(CARTOES.diario.comoLer).toMatch(/em qualquer setor ou equipe/)
  })

  it('A2: só Setor sem ninguém na janela mostra a mensagem do setor e remove só o Setor', async () => {
    const roteador = renderizar(`${URL_ABA}?setor=plataformas`, semLinhasSeRecorte)
    const cartao = await screen.findByTestId('metrica-AP-DIARIO')
    const aviso = await within(cartao).findByTestId('diario-sem-pessoas')
    expect(aviso).toHaveTextContent(
      'Nenhum apontamento do setor escolhido nesta janela. Troque as datas do mapa ou remova o filtro Setor.',
    )
    expect(aviso).toHaveTextContent(DIARIO_VAZIO.comSetor)
    expect(within(aviso).getAllByRole('button')).toHaveLength(1)
    expect(within(aviso).queryByRole('button', { name: 'Remover filtro Equipe' })).toBeNull()
    await userEvent.click(within(aviso).getByRole('button', { name: 'Remover filtro Setor' }))
    await waitFor(() => expect(roteador.state.location.search).toBe(''))
    expect(await screen.findByTestId('mapa-diario')).toBeInTheDocument()
  })

  it('A2: Setor e Equipe: mensagem combinada, um botão por filtro, e cada um remove só o seu', async () => {
    const roteador = renderizar(`${URL_ABA}?setor=plataformas&equipe=portal`, semLinhasSeRecorte)
    const cartao = await screen.findByTestId('metrica-AP-DIARIO')
    const aviso = await within(cartao).findByTestId('diario-sem-pessoas')
    expect(aviso).toHaveTextContent(
      'Nenhum apontamento do setor e da equipe escolhidos nesta janela. Troque as datas do mapa ou remova os filtros Setor e Equipe.',
    )
    expect(within(aviso).getAllByRole('button')).toHaveLength(2)
    await userEvent.click(within(aviso).getByRole('button', { name: 'Remover filtro Setor' }))
    await waitFor(() => expect(roteador.state.location.search).toBe('?equipe=portal'))
  })

  it('A2: o texto só com Equipe não muda e não oferece remover o Setor', async () => {
    renderizar(`${URL_ABA}?equipe=portal`, semLinhasSeRecorte)
    const aviso = await within(await screen.findByTestId('metrica-AP-DIARIO')).findByTestId(
      'diario-sem-pessoas',
    )
    expect(aviso).toHaveTextContent(DIARIO_VAZIO.comEquipe)
    expect(within(aviso).queryByRole('button', { name: 'Remover filtro Setor' })).toBeNull()
  })

  it('A2: sem Setor nem Equipe, mensagem simples e nenhum botão', async () => {
    renderizar(
      URL_ABA,
      fonteDe((c) => semPessoas(respostaFicticia(c))),
    )
    const aviso = await within(await screen.findByTestId('metrica-AP-DIARIO')).findByTestId(
      'diario-sem-pessoas',
    )
    expect(aviso).toHaveTextContent(DIARIO_VAZIO.semRecorte)
    expect(within(aviso).queryByRole('button')).toBeNull()
  })

  it('A3: com Setor ativo, a dica do atípico diz que o dia é avaliado inteiro', async () => {
    renderizar(`${URL_ABA}?setor=plataformas`, fonteDe(respostaFicticia))
    const dica = await screen.findByTestId('dica-anomalia')
    expect(dica).toHaveTextContent(
      'O dia é avaliado com todas as horas da pessoa, não só as do setor ou da equipe escolhidos.',
    )
    expect(dica).toHaveTextContent(ANOMALIA.dicaRecorte)
  })

  it('A3: sem Setor nem Equipe, a dica não traz a frase do recorte', async () => {
    renderizar(URL_ABA, fonteDe(respostaFicticia))
    const dica = await screen.findByTestId('dica-anomalia')
    expect(dica).not.toHaveTextContent(/não só as do setor/)
  })

  it('A3: o nome acessível da grade diz o setor, antes da equipe, nunca pessoa', async () => {
    renderizar(`${URL_ABA}?setor=plataformas`, fonteDe(respostaFicticia))
    const grade = await within(await screen.findByTestId('mapa-diario')).findByRole('grid')
    expect(grade).toHaveAccessibleName(
      /^Horas apontadas por pessoa e dia, do setor Plataformas, de /,
    )
  })

  it('A3: com Setor e Equipe, o nome diz o setor e depois a equipe', async () => {
    renderizar(`${URL_ABA}?setor=plataformas&equipe=portal`, fonteDe(respostaFicticia))
    const grade = await within(await screen.findByTestId('mapa-diario')).findByRole('grid')
    expect(grade).toHaveAccessibleName(
      /^Horas apontadas por pessoa e dia, do setor Plataformas, da equipe Portal, de /,
    )
  })

  it('A3: com dois setores, o nome diz dos setores e lista os dois', async () => {
    renderizar(`${URL_ABA}?setor=plataformas,sem-setor`, fonteDe(respostaFicticia))
    const grade = await within(await screen.findByTestId('mapa-diario')).findByRole('grid')
    expect(grade).toHaveAccessibleName(
      /^Horas apontadas por pessoa e dia, dos setores Plataformas, Sem setor, de /,
    )
  })

  it('A3: sem Setor, o nome da grade não cita setor', async () => {
    renderizar(URL_ABA, fonteDe(respostaFicticia))
    const grade = await within(await screen.findByTestId('mapa-diario')).findByRole('grid')
    expect(grade).not.toHaveAccessibleName(/setor/i)
  })

  it('A4: o Setor vale para o cartão do mapa e não aparece como "Não afetado por"', async () => {
    renderizar(`${URL_ABA}?setor=plataformas`, fonteDe(respostaFicticia))
    const cartao = await screen.findByTestId('metrica-AP-DIARIO')
    await within(cartao).findByTestId('mapa-diario')
    expect(cartao).toHaveTextContent(/Filtros aplicados: Setor Plataformas/)
    expect(cartao).not.toHaveTextContent(/Não afetado por:[^·]*Setor/)
  })
})
