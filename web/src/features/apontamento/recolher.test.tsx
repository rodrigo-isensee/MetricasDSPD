import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { CHAVE_RECOLHIDOS } from '@/components/ui'
import ApontamentoPage from './ApontamentoPage'
import { RESPOSTA_FICTICIA, fonteFicticia } from './fixture'
import type { FonteApontamento } from './types'

function renderizar(fonte: FonteApontamento = fonteFicticia) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const roteador = createMemoryRouter([{ path: '*', element: <ApontamentoPage fonte={fonte} /> }], {
    initialEntries: ['/operacional/apontamento'],
  })
  return render(
    <QueryClientProvider client={client}>
      <RouterProvider router={roteador} />
    </QueryClientProvider>,
  )
}

async function esperar(codigo: string) {
  const el = await screen.findByTestId(`metrica-${codigo}`)
  await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
}

beforeEach(() => localStorage.clear())

describe('recolher cartão na aba Apontamento (097 E5, L8b)', () => {
  it('o KPI não recolhe; os gráficos recolhem, lembram a escolha e o Restaurar devolve tudo', async () => {
    const u = userEvent.setup()
    renderizar()
    await esperar('AP-PROJETO')
    expect(screen.queryByTestId('recolher-AP-KPIS')).toBeNull()
    expect(screen.getByTestId('recolher-AP-PROJETO')).toHaveAttribute('aria-expanded', 'true')

    await u.click(screen.getByTestId('recolher-AP-PROJETO'))
    expect(screen.getByTestId('resumo-recolhido-AP-PROJETO')).toHaveTextContent(
      /^Recolhido\. \d+ projetos?, .+ h no total\.$/,
    )
    expect(JSON.parse(localStorage.getItem(CHAVE_RECOLHIDOS)!)).toEqual({
      versao: 1,
      paineis: { apontamento: ['AP-PROJETO'] },
    })

    cleanup()
    renderizar()
    await esperar('AP-TIPO')
    expect(screen.getByTestId('recolher-AP-PROJETO')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByTestId('recolher-AP-TIPO')).toHaveAttribute('aria-expanded', 'true')

    await u.click(screen.getByRole('button', { name: 'Restaurar cartões recolhidos' }))
    expect(screen.getByTestId('recolher-AP-PROJETO')).toHaveAttribute('aria-expanded', 'true')
    expect(localStorage.getItem(CHAVE_RECOLHIDOS)).toBeNull()
  })

  it('o resumo do AP-PROJETO não traz o nome de nenhum projeto nem de pessoa (CA-32)', async () => {
    renderizar()
    await esperar('AP-PROJETO')
    await userEvent.click(screen.getByTestId('recolher-AP-PROJETO'))
    expect(screen.getByTestId('resumo-recolhido-AP-PROJETO').textContent).toMatch(
      /^Recolhido\. [\d.]+ projetos?, [\d.,]+ h no total\.$/,
    )
  })

  it('com um só projeto o resumo usa o singular', async () => {
    const uma: FonteApontamento = {
      buscar: () =>
        Promise.resolve({
          ...RESPOSTA_FICTICIA,
          distribuicao: {
            ...RESPOSTA_FICTICIA.distribuicao,
            porProjeto: RESPOSTA_FICTICIA.distribuicao.porProjeto.slice(0, 1),
          },
        }),
    }
    renderizar(uma)
    await esperar('AP-PROJETO')
    await userEvent.click(screen.getByTestId('recolher-AP-PROJETO'))
    expect(screen.getByTestId('resumo-recolhido-AP-PROJETO')).toHaveTextContent(
      /^Recolhido\. 1 projeto, /,
    )
  })
})
