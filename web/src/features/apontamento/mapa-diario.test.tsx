import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import ApontamentoPage from './ApontamentoPage'
import { RESPOSTA_FICTICIA, respostaComOutraArea, respostaFicticia } from './fixture'
import { deslocamentoParaVer, rolarCelulaParaVista } from './rolagem'
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

async function mapa() {
  const el = await screen.findByTestId('mapa-diario')
  await waitFor(() => expect(el.querySelector('td[data-lin]')).not.toBeNull())
  return el
}

const comApontamentoEmDiaNaoUtil = (): RespostaApontamento => ({
  ...RESPOSTA_FICTICIA,
  diario: {
    ...RESPOSTA_FICTICIA.diario,
    linhas: RESPOSTA_FICTICIA.diario.linhas.map((l, i) =>
      i === 0
        ? {
            ...l,
            celulas: [
              ...l.celulas,
              { data: '2026-10-10', segundos: 23400, faixa: '4h-a-8h', atipico: false },
              { data: '2026-10-12', segundos: 7200, faixa: 'ate-4h', atipico: false },
            ],
          }
        : l,
    ),
  },
})

describe('mapa diário: célula ativa dentro da grade (A2 do review)', () => {
  it('depois de filtrar pessoa, alguma célula continua sendo a parada do Tab', async () => {
    const roteador = renderizar(
      URL_ABA,
      fonteDe((c) => respostaFicticia(c)),
    )
    const antes = await mapa()
    const ultima = antes.querySelector<HTMLElement>('td[data-lin="3"][data-col="5"]')!
    act(() => ultima.focus())
    expect(ultima).toHaveAttribute('tabindex', '0')
    await act(() => roteador.navigate(`${URL_ABA}?pessoa=p1`))
    await waitFor(() => expect(screen.getAllByText(/Pessoa que apontou/).length).toBeGreaterThan(0))
    await waitFor(() => expect(antes.querySelectorAll('tbody tr')).toHaveLength(1))
    const paradas = antes.querySelectorAll('td[role="gridcell"][tabindex="0"]')
    expect(paradas).toHaveLength(1)
    expect(paradas[0]).toHaveAttribute('data-lin', '0')
  })

  it('depois de encurtar a janela, a parada do Tab cai na última coluna que sobrou', async () => {
    const roteador = renderizar(
      URL_ABA,
      fonteDe((c) => {
        const r = respostaFicticia(c)
        if (!c.diarioDe || !c.diarioAte) return r
        const dias = r.diario.dias.slice(0, 3)
        const datas = new Set(dias.map((d) => d.data))
        return {
          ...r,
          diario: {
            ...r.diario,
            dias,
            linhas: r.diario.linhas.map((l) => ({
              ...l,
              celulas: l.celulas.filter((x) => datas.has(x.data)),
            })),
          },
        }
      }),
    )
    const antes = await mapa()
    const ultimaCol = antes.querySelector<HTMLElement>('td[data-lin="0"][data-col="9"]')!
    act(() => ultimaCol.focus())
    await act(() => roteador.navigate(`${URL_ABA}?diarioDe=2026-10-05&diarioAte=2026-10-07`))
    await waitFor(() => expect(antes.querySelectorAll('td[data-col="3"]')).toHaveLength(0))
    const paradas = antes.querySelectorAll('td[role="gridcell"][tabindex="0"]')
    expect(paradas).toHaveLength(1)
    expect(paradas[0]).toHaveAttribute('data-col', '2')
  })
})

describe('mapa diário: dia não útil com apontamento (A-5)', () => {
  it('o rótulo diz fim de semana ou feriado e traz as horas e a faixa', async () => {
    renderizar(
      URL_ABA,
      fonteDe(() => comApontamentoEmDiaNaoUtil()),
    )
    const el = await mapa()
    const sabado = el.querySelector<HTMLElement>('td[aria-label^="Pessoa 1, 10/10"]')!
    expect(sabado).toHaveAccessibleName('Pessoa 1, 10/10, fim de semana, 6,5 horas, faixa 4 a 8 h')
    expect(sabado).toHaveAttribute('data-faixa', '4h-a-8h')
    expect(sabado).toHaveAttribute('data-nao-util', 'true')
    expect(el.querySelector('td[aria-label^="Pessoa 1, 12/10"]')).toHaveAccessibleName(
      'Pessoa 1, 12/10, feriado, 2 horas, faixa até 4 h',
    )
  })

  it('a legenda explica o apontamento em dia não útil', async () => {
    renderizar(
      URL_ABA,
      fonteDe(() => comApontamentoEmDiaNaoUtil()),
    )
    await mapa()
    expect(
      within(screen.getByTestId('legenda-diario')).getByText(
        'Apontamento em fim de semana ou feriado',
      ),
    ).toBeInTheDocument()
  })
})

describe('mapa diário: Outra área fora do mapa (A-4)', () => {
  it('a linha não aparece no mapa, na tabela alternativa nem na contagem do cartão', async () => {
    renderizar(
      URL_ABA,
      fonteDe(() => respostaComOutraArea()),
    )
    const el = await mapa()
    expect(within(el).queryByText('Outra área')).toBeNull()
    expect(within(el).getAllByRole('rowheader')).toHaveLength(
      RESPOSTA_FICTICIA.diario.linhas.length,
    )
    const cartao = screen.getByTestId('metrica-AP-DIARIO')
    expect(
      within(cartao).getByText(`${RESPOSTA_FICTICIA.diario.linhas.length} pessoas no mapa`, {
        exact: false,
      }),
    ).toBeInTheDocument()
    await userEvent.click(within(cartao).getByRole('button', { name: /ver como tabela/i }))
    expect(within(cartao).queryByText('Outra área')).toBeNull()
  })
})

describe('mapa diário: célula focada fora das colunas fixas (A-2)', () => {
  it('deslocamentoParaVer devolve quanto rolar para cada lado, ou zero', () => {
    const area = { left: 0, right: 300 }
    expect(deslocamentoParaVer({ left: 100, right: 140 }, area, 100, 60)).toBe(0)
    expect(deslocamentoParaVer({ left: 60, right: 100 }, area, 100, 60)).toBe(-40)
    expect(deslocamentoParaVer({ left: 230, right: 270 }, area, 100, 60)).toBe(30)
  })

  const retangulo = (left: number, width: number) =>
    ({ left, right: left + width, width }) as DOMRect

  it('ao focar uma célula sob a coluna fixa, o bloco rola até ela aparecer', async () => {
    renderizar(
      URL_ABA,
      fonteDe((c) => respostaFicticia(c)),
    )
    const regiao = await mapa()
    const celula = regiao.querySelector<HTMLElement>('td[data-lin="0"][data-col="2"]')!
    const linha = celula.parentElement!
    // geometria do jsdom: pessoa fixa 100 px à esquerda, total fixo 60 px à direita, bloco de 300 px
    regiao.getBoundingClientRect = () => retangulo(0, 300)
    linha.firstElementChild!.getBoundingClientRect = () => retangulo(0, 100)
    linha.lastElementChild!.getBoundingClientRect = () => retangulo(240, 60)
    celula.getBoundingClientRect = () => retangulo(60, 40)
    Object.defineProperty(regiao, 'scrollLeft', { value: 200, writable: true })
    act(() => celula.focus())
    expect(regiao.scrollLeft).toBe(160)
    celula.getBoundingClientRect = () => retangulo(230, 40)
    rolarCelulaParaVista(celula)
    expect(regiao.scrollLeft).toBe(190)
    celula.getBoundingClientRect = () => retangulo(120, 40)
    rolarCelulaParaVista(celula)
    expect(regiao.scrollLeft).toBe(190)
  })

  it('sem região ou linha ao redor, não faz nada', () => {
    const solto = document.createElement('td')
    expect(() => rolarCelulaParaVista(solto)).not.toThrow()
    const semRegiao = document.createElement('tr')
    const td = document.createElement('td')
    semRegiao.append(td)
    expect(() => rolarCelulaParaVista(td)).not.toThrow()
  })
})
