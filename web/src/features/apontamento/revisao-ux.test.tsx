import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import ApontamentoPage from './ApontamentoPage'
import {
  RESPOSTA_FICTICIA,
  respostaComNomesReais,
  respostaComOutraArea,
  respostaFicticia,
} from './fixture'
import { NOTA_OUTRA_AREA } from './textos'
import type { FonteApontamento, RespostaApontamento } from './types'

const URL_ABA = '/operacional/apontamento'

function renderizar(url: string, resposta: () => RespostaApontamento = () => RESPOSTA_FICTICIA) {
  const fonte: FonteApontamento = {
    buscar: (c) => Promise.resolve(c.pessoa ? respostaFicticia(c, resposta()) : resposta()),
  }
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

async function cartao(codigo: string) {
  const el = await screen.findByTestId(`metrica-${codigo}`)
  await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
  return el
}

describe('A-1: tabelas por pessoa rolam só no bloco, com a coluna Pessoa fixa', () => {
  it.each(['AP-CAPACIDADE-PESSOA', 'AP-QUALIDADE-PESSOA'])('%s', async (codigo) => {
    renderizar(URL_ABA)
    const tabela = within(await cartao(codigo)).getByTestId(`tabela-${codigo}-detalhe`)
    expect(tabela).toHaveAttribute('role', 'region')
    expect(tabela).toHaveAttribute('tabindex', '0')
    expect(tabela.className).toMatch(/overflow-x-auto/)
    expect(tabela.className).toMatch(/max-w-full/)
    expect(within(tabela).getByRole('columnheader', { name: 'Pessoa' }).className).toMatch(/sticky/)
    for (const nome of within(tabela).getAllByRole('rowheader'))
      expect(nome.className).toMatch(/sticky/)
  })
})

describe('A-3: nota fixa de quem é Outra área', () => {
  it('aparece nas listas por pessoa e no filtro, uma vez por cartão, e não nas outras', async () => {
    renderizar(URL_ABA, () => respostaComOutraArea())
    for (const codigo of ['AP-MATRIZ', 'AP-QUALIDADE-PESSOA']) {
      const c = await cartao(codigo)
      expect(within(c).getAllByTestId('nota-outra-area')).toHaveLength(1)
    }
    expect(screen.getAllByText(NOTA_OUTRA_AREA)).toHaveLength(3) // matriz, qualidade por pessoa e filtro
    const barra = screen.getByTestId('barra-filtros-apontamento')
    expect(within(barra).getByText(NOTA_OUTRA_AREA)).toBeInTheDocument()
    expect(NOTA_OUTRA_AREA).toBe(
      'Outra área: pessoas que não foram responsáveis por card do DSPD nos últimos 12 meses, somadas, sem nome.',
    )
  })

  it('sem Outra área, a nota não aparece', async () => {
    renderizar(URL_ABA)
    await cartao('AP-MATRIZ')
    expect(screen.queryByTestId('nota-outra-area')).toBeNull()
  })
})

describe('A-4: Outra área só nas somas', () => {
  it('fica fora da capacidade e da utilização por pessoa, mas segue na matriz', async () => {
    renderizar(URL_ABA, () => respostaComOutraArea())
    const cap = within(await cartao('AP-CAPACIDADE-PESSOA'))
    expect(cap.queryByText('Outra área')).toBeNull()
    expect(cap.getAllByRole('rowheader')).toHaveLength(
      RESPOSTA_FICTICIA.capacidade.porPessoa.length,
    )
    expect(within(await cartao('AP-MATRIZ')).getByText('Outra área')).toBeInTheDocument()
    expect(within(await cartao('AP-QUALIDADE-PESSOA')).getByText('Outra área')).toBeInTheDocument()
  })
})

describe('A-6 e A-7: público e aviso de nome real', () => {
  it('o texto de público inclui quem não é do time', async () => {
    renderizar(URL_ABA)
    await cartao('AP-KPIS')
    expect(
      screen.getByText(/Para quem acompanha o painel · fonte única: BusinessMap\./),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Para o time e a liderança/)).toBeNull()
  })

  it('com nomes reais, a região da aba carrega o aviso no nome acessível', async () => {
    renderizar(URL_ABA, () => respostaComNomesReais())
    await cartao('AP-KPIS')
    expect(
      screen.getByRole('region', { name: /^Apontamento\. Esta tela mostra nomes reais/ }),
    ).toBeInTheDocument()
  })

  it('sem nomes reais, a região só se chama Apontamento', async () => {
    renderizar(URL_ABA)
    await cartao('AP-KPIS')
    expect(screen.getByRole('region', { name: 'Apontamento' })).toBeInTheDocument()
  })
})

describe('A-8: a ordem fora do padrão aparece como chip e conta em Filtros (n)', () => {
  it('chip com remoção, contagem e limpeza', async () => {
    const roteador = renderizar(`${URL_ABA}?ordem=total`)
    await cartao('AP-KPIS')
    expect(await screen.findByRole('button', { name: 'Filtros (1)' })).toBeInTheDocument()
    const chip = screen.getByTestId('chip-filtro-ordem')
    expect(chip).toHaveTextContent('Ordem: total de horas')
    await userEvent.click(
      within(chip).getByRole('button', { name: 'Remover filtro Ordem: total de horas' }),
    )
    await waitFor(() => expect(roteador.state.location.search).toBe(''))
    expect(screen.queryByTestId('chip-filtro-ordem')).toBeNull()
  })

  it('Limpar filtros também volta à ordem neutra', async () => {
    const roteador = renderizar(`${URL_ABA}?ordem=total&pessoa=p1`)
    await cartao('AP-KPIS')
    await userEvent.click(await screen.findByRole('button', { name: 'Limpar filtros' }))
    await waitFor(() => expect(roteador.state.location.search).toBe(''))
  })

  it('na ordem alfabética não há chip de ordem', async () => {
    renderizar(URL_ABA)
    await cartao('AP-KPIS')
    expect(screen.queryByTestId('chip-filtro-ordem')).toBeNull()
  })
})

describe('A-9: datas dos critérios vigentes', () => {
  it('a linha "Critério" diz desde quando a versão vale; a mais recente da família', async () => {
    renderizar(URL_ABA)
    const diario = within(await cartao('AP-DIARIO'))
    expect(diario.getByText(/Versão vigente desde 20\/08\/2026\./)).toBeInTheDocument()
    const qualidade = within(await cartao('AP-QUALIDADE'))
    expect(qualidade.getByText(/Versão vigente desde 15\/09\/2026\./)).toBeInTheDocument()
    expect(
      within(await cartao('AP-CAPACIDADE-PESSOA')).getByText(/Versão vigente desde 20\/08\/2026\./),
    ).toBeInTheDocument()
  })

  it('o mês em andamento diz até quando vale, no "como ler" da capacidade mensal', async () => {
    renderizar(URL_ABA)
    const c = within(await cartao('AP-CAPACIDADE-MENSAL'))
    expect(c.getByText(/O mês em andamento vale até 30\/10\/2026\./)).toBeInTheDocument()
  })

  it('sem critério na resposta, a linha fica como estava', async () => {
    renderizar(URL_ABA, () => ({ ...RESPOSTA_FICTICIA, criterios: [] }))
    const c = await cartao('AP-DIARIO')
    expect(within(c).queryByText(/Versão vigente/)).toBeNull()
  })
})

describe('A-10: célula de utilização só com o valor', () => {
  it('a coluna Utilização traz "19%", sem repetir o rótulo', async () => {
    renderizar(URL_ABA)
    const tabela = within(await cartao('AP-CAPACIDADE-MENSAL')).getByTestId(
      'tabela-AP-CAPACIDADE-MENSAL-detalhe',
    )
    const linha = within(tabela).getAllByRole('row').at(-1)!
    expect(within(linha).getAllByRole('cell').at(-1)).toHaveTextContent(/^\d+%$/)
    expect(tabela).not.toHaveTextContent('Utilização:')
  })
})

describe('A-11: carregando não é anunciado duas vezes', () => {
  it('o texto visível fica oculto da tecnologia assistiva; a região viva anuncia', async () => {
    const fonte: FonteApontamento = { buscar: () => new Promise(() => {}) }
    const client = new QueryClient()
    const roteador = createMemoryRouter(
      [{ path: '*', element: <ApontamentoPage fonte={fonte} /> }],
      {
        initialEntries: [URL_ABA],
      },
    )
    render(
      <QueryClientProvider client={client}>
        <RouterProvider router={roteador} />
      </QueryClientProvider>,
    )
    expect(await screen.findByTestId('frescor-carregando')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByTestId('anuncio-carregando')).toHaveTextContent('Carregando apontamentos')
  })
})

describe('A-12: atalho de dias atípicos', () => {
  it('chama-se "Ver mapa diário" e leva o foco ao título do cartão', async () => {
    renderizar(URL_ABA)
    await cartao('AP-DIARIO')
    const link = await screen.findByRole('link', { name: 'Ver mapa diário' })
    expect(link).toHaveAttribute('href', '#ap-diario')
    await userEvent.click(link)
    expect(document.activeElement).toHaveAttribute('data-cartao-titulo')
    expect(document.activeElement).toHaveTextContent('Mapa de calor pessoa × dia')
  })
})

describe('A-13: datas no formato do painel', () => {
  it('o período do cabeçalho usa dd/mm/aaaa, como o mapa e as tabelas', async () => {
    renderizar(URL_ABA)
    await cartao('AP-KPIS')
    expect(screen.getByTestId('periodo-dos-dados')).toHaveTextContent(
      /^Dados de \d{2}\/\d{2}\/\d{4} a \d{2}\/\d{2}\/\d{4}$/,
    )
  })
})
