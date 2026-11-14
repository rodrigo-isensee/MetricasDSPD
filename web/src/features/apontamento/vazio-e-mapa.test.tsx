import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import ApontamentoPage from './ApontamentoPage'
import { RESPOSTA_FICTICIA, respostaFicticia, respostaVazia, respostaVaziaComMapa } from './fixture'
import { VAZIO } from './textos'
import type { ConsultaApontamento, FonteApontamento, RespostaApontamento } from './types'

const URL_ABA = '/operacional/apontamento'
const SECOES_DO_PERIODO = [
  'secao-kpis',
  'secao-distribuicao',
  'secao-qualidade',
  'secao-capacidade',
  'secao-achados',
]

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

const fonteDe = (r: (c: ConsultaApontamento) => RespostaApontamento) =>
  ({ buscar: (c) => Promise.resolve(r(c)) }) satisfies FonteApontamento

/** Período vazio só com Equipe; sem Equipe, a resposta cheia (para ver o vazio ir e voltar). */
const vazioSeEquipe = fonteDe((c) => (c.equipe ? respostaVaziaComMapa() : respostaFicticia(c)))
const vazioComMapa = fonteDe(() => respostaVaziaComMapa())
const sobDemanda = (id: string) => document.getElementById(id)

describe('K-303: o vazio da aba vale só para os cartões do período', () => {
  it('CA-1: com kpis.apontamentos 0, o Dia a dia fica e as cinco seções do período saem', async () => {
    renderizar(URL_ABA, vazioComMapa)
    await screen.findByTestId('estado-vazio-AP')
    expect(screen.getByTestId('metrica-AP-DIARIO')).toBeInTheDocument()
    expect(sobDemanda('secao-diario')).not.toBeNull()
    for (const id of SECOES_DO_PERIODO) expect(sobDemanda(id)).toBeNull()
    expect(screen.queryByTestId('metrica-AP-KPIS')).toBeNull()
    expect(screen.queryByTestId('metrica-AP-ACHADOS')).toBeNull()
  })

  it('CA-2: com pessoas na janela do mapa, o mapa e a legenda aparecem como com dados', async () => {
    renderizar(URL_ABA, vazioComMapa)
    await screen.findByTestId('estado-vazio-AP')
    const mapa = await screen.findByTestId('mapa-diario')
    expect(within(mapa).getAllByRole('rowheader')).toHaveLength(
      RESPOSTA_FICTICIA.diario.linhas.length,
    )
    expect(screen.getByTestId('legenda-diario')).toBeInTheDocument()
    expect(screen.queryByTestId('diario-sem-pessoas')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: /ver como tabela/i }))
    expect(screen.queryByTestId('mapa-diario')).toBeNull()
    expect(
      within(screen.getByTestId('metrica-AP-DIARIO')).getAllByText('Pessoa 1').length,
    ).toBeGreaterThan(0)
  })

  it('CA-3: o vazio vem sob "Período dos filtros", com os textos exatos, antes do Dia a dia', async () => {
    renderizar(URL_ABA, vazioComMapa)
    const vazio = await screen.findByTestId('estado-vazio-AP')
    const secao = sobDemanda('secao-periodo')!
    expect(within(secao).getByRole('heading', { name: 'Período dos filtros' })).toBeInTheDocument()
    expect(secao).toContainElement(vazio)
    expect(vazio).toHaveTextContent('Nenhum apontamento no período dos filtros')
    expect(vazio).toHaveTextContent(
      'Nenhum apontamento atende aos filtros atuais. O mapa dia a dia abaixo usa a janela própria dele.',
    )
    expect(
      secao.compareDocumentPosition(sobDemanda('secao-diario')!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('CA-4: com filtro ativo, o vazio oferece Limpar e Remover por filtro, e o clique atualiza a URL', async () => {
    const roteador = renderizar(`${URL_ABA}?equipe=portal&tipo=3`, vazioComMapa)
    const vazio = await screen.findByTestId('estado-vazio-AP')
    expect(within(vazio).getByRole('button', { name: 'Limpar filtros' })).toBeInTheDocument()
    expect(within(vazio).getByRole('button', { name: 'Remover filtro Equipe' })).toBeInTheDocument()
    await userEvent.click(within(vazio).getByRole('button', { name: 'Remover filtro Tipo' }))
    await waitFor(() => expect(roteador.state.location.search).toBe('?equipe=portal'))
    await userEvent.click(within(vazio).getByRole('button', { name: 'Limpar filtros' }))
    await waitFor(() => expect(roteador.state.location.search).toBe(''))
  })

  it('CA-5: sem pessoa no mapa (vazia ou só Outra área), o vazio do período e o do mapa aparecem juntos', async () => {
    renderizar(
      URL_ABA,
      fonteDe(() => respostaVazia()),
    )
    expect(await screen.findByTestId('estado-vazio-AP')).toBeInTheDocument()
    expect(await screen.findByTestId('diario-sem-pessoas')).toHaveTextContent(
      'Nenhum apontamento nesta janela. Troque as datas do mapa.',
    )
    expect(screen.queryByTestId('mapa-diario')).toBeNull()
  })

  it('CA-5: só a linha Outra área também conta como sem pessoa', async () => {
    const soOutra: RespostaApontamento = {
      ...respostaVaziaComMapa(),
      diario: {
        ...RESPOSTA_FICTICIA.diario,
        linhas: RESPOSTA_FICTICIA.diario.linhas
          .slice(0, 1)
          .map((l) => ({ ...l, pessoaRef: 'outra-area' })),
      },
    }
    renderizar(
      URL_ABA,
      fonteDe(() => soOutra),
    )
    expect(await screen.findByTestId('estado-vazio-AP')).toBeInTheDocument()
    expect(await screen.findByTestId('diario-sem-pessoas')).toBeInTheDocument()
  })

  it('CA-6: no vazio do período não há índice de seções; com dados, há', async () => {
    renderizar(URL_ABA, vazioSeEquipe)
    await screen.findByTestId('metrica-AP-KPIS')
    expect(screen.getByRole('navigation', { name: 'Ir para' })).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: /^Equipe: Todas/ }))
    await userEvent.click(await screen.findByLabelText('Portal'))
    await screen.findByTestId('estado-vazio-AP')
    expect(screen.queryByRole('navigation', { name: 'Ir para' })).toBeNull()
  })

  it('CA-7: a região status anuncia o vazio e se esvazia quando ele sai, sem segunda região', async () => {
    const roteador = renderizar(`${URL_ABA}?equipe=portal`, vazioSeEquipe)
    await screen.findByTestId('estado-vazio-AP')
    const anuncio = screen.getByTestId('anuncio-carregando')
    expect(anuncio).toHaveAttribute('role', 'status')
    await waitFor(() => expect(anuncio).toHaveTextContent(VAZIO.anuncio))
    expect(anuncio).toHaveTextContent(
      'Nenhum apontamento no período dos filtros. O mapa dia a dia tem janela própria.',
    )
    expect(
      screen.getAllByRole('status').filter((e) => e.getAttribute('aria-live') === 'polite'),
    ).toContainEqual(anuncio)
    await roteador.navigate(URL_ABA)
    await screen.findByTestId('metrica-AP-KPIS')
    await waitFor(() => expect(anuncio).toBeEmptyDOMElement())
  })

  it('CA-7: carregando de novo vale o anúncio de carregando, não o do vazio', () => {
    const nunca: FonteApontamento = { buscar: () => new Promise(() => undefined) }
    renderizar(URL_ABA, nunca)
    expect(screen.getByTestId('anuncio-carregando')).toHaveTextContent('Carregando apontamentos')
    expect(screen.getByTestId('anuncio-carregando')).not.toHaveTextContent(VAZIO.anuncio)
  })

  it('CA-8: o vazio aparece sem tirar o foco do controle que a pessoa operou', async () => {
    renderizar(URL_ABA, vazioSeEquipe)
    await userEvent.click(await screen.findByRole('button', { name: /^Equipe: Todas/ }))
    const caixa = await screen.findByLabelText('Portal')
    await userEvent.click(caixa)
    await screen.findByTestId('estado-vazio-AP')
    expect(caixa).toBeInTheDocument()
    expect(document.activeElement).toBe(caixa)
    expect(sobDemanda('secao-periodo')).not.toContainElement(document.activeElement as HTMLElement)
  })

  it('CA-9: trocar a janela do mapa busca de novo, mantém o vazio e não mexe nos filtros', async () => {
    const buscar = vi.fn<FonteApontamento['buscar']>((c) =>
      Promise.resolve(respostaVaziaComMapa(respostaFicticia(c))),
    )
    const roteador = renderizar(`${URL_ABA}?equipe=portal`, { buscar })
    await screen.findByTestId('estado-vazio-AP')
    const de = RESPOSTA_FICTICIA.diario.dias[1]!.data
    fireEvent.change(screen.getByLabelText('Mapa de'), { target: { value: de } })
    await waitFor(() => expect(roteador.state.location.search).toContain(`diarioDe=${de}`))
    expect(new URLSearchParams(roteador.state.location.search).get('equipe')).toBe('portal')
    await waitFor(() => expect(buscar.mock.calls.some(([c]) => c.diarioDe === de)).toBe(true))
    expect(await screen.findByTestId('estado-vazio-AP')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Remover filtro Equipe: Portal' }),
    ).toBeInTheDocument()
  })

  it('CA-10: o rodapé do mapa é o mesmo no vazio do período e com dados', async () => {
    const rodape = () => {
      const c = screen.getByTestId('metrica-AP-DIARIO')
      return within(c)
        .getAllByText(/^(Filtros aplicados|Não afetado por):/)
        .map((e) => e.textContent)
    }
    const url = `${URL_ABA}?equipe=portal&tipo=3`
    renderizar(
      url,
      fonteDe((c) => respostaFicticia(c)),
    )
    await screen.findByTestId('mapa-diario')
    const comDados = rodape()
    expect(comDados).toContain('Não afetado por: Tipo')
    expect(sobDemanda('secao-kpis')).not.toBeNull()
    cleanup() // o estado de vazio vem de um segundo render, com a mesma URL
    renderizar(url, vazioComMapa)
    await screen.findByTestId('estado-vazio-AP')
    await screen.findByTestId('mapa-diario')
    expect(rodape()).toEqual(comDados)
  })

  it('CA-11: nenhum estado traz nome real de pessoa, total ou ordem por equipe', async () => {
    renderizar(`${URL_ABA}?equipe=portal`, vazioComMapa)
    const vazio = await screen.findByTestId('estado-vazio-AP')
    expect(vazio).not.toHaveTextContent(/Portal|Integrações|ranking|maior|menor|total/i)
    expect(screen.getByTestId('metrica-AP-DIARIO')).not.toHaveTextContent(/ranking/i)
    for (const r of screen.getAllByRole('rowheader'))
      expect(r).toHaveTextContent(/^Pessoa( \d+| não identificada)/)
  })

  it('CA-12: com apontamento no período, as seis seções e o índice seguem, e os textos antigos somem', async () => {
    renderizar(
      URL_ABA,
      fonteDe((c) => respostaFicticia(c)),
    )
    await screen.findByTestId('metrica-AP-KPIS')
    for (const id of [...SECOES_DO_PERIODO, 'secao-diario']) expect(sobDemanda(id)).not.toBeNull()
    expect(sobDemanda('secao-periodo')).toBeNull()
    expect(screen.getByRole('navigation', { name: 'Ir para' })).toBeInTheDocument()
    expect(screen.queryByTestId('estado-vazio-AP')).toBeNull()
    expect(document.body).not.toHaveTextContent('Nenhum apontamento encontrado')
  })

  it('CA-12: os textos antigos do vazio não existem mais em textos.ts', () => {
    expect(JSON.stringify(VAZIO)).not.toContain('Nenhum apontamento encontrado')
    expect(VAZIO.texto).not.toBe('Nenhum apontamento atende aos filtros atuais.')
  })
})
