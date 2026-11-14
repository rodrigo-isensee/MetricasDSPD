import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ID_SEM_PROJETO } from '@metricas-dspd/contratos'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import ApontamentoPage from './ApontamentoPage'
import { separarSemProjeto } from './dezMaiores'
import { RESPOSTA_FICTICIA } from './fixture'
import { fraseDoAchado } from './textos'
import type { FonteApontamento, LinhaDistribuicao, RespostaApontamento } from './types'

const base = RESPOSTA_FICTICIA.distribuicao.porProjeto[0]!

const projetos = (qtd: number): LinhaDistribuicao[] =>
  Array.from({ length: qtd }, (_, i) => ({
    ...base,
    id: `p${i}`,
    rotulo: `Projeto ${String(i).padStart(2, '0')}`,
    segundos: (qtd - i + 1) * 3600,
    apontamentos: 25,
  }))

/** Linha sem projeto com `horas` e, por padrão, a maior de todas (a que antes tomava a 1ª vaga). */
const semProjeto = (horas: number): LinhaDistribuicao => ({
  ...base,
  id: ID_SEM_PROJETO,
  rotulo: 'Sem iniciativa',
  segundos: horas * 3600,
  apontamentos: 30,
})

function com(linhas: LinhaDistribuicao[]): RespostaApontamento {
  const { registroIncompleto: _descartado, ...resto } = RESPOSTA_FICTICIA
  return { ...resto, distribuicao: { ...resto.distribuicao, porProjeto: linhas } }
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

const linhasDaTabela = (cartao: HTMLElement) =>
  within(cartao)
    .getAllByRole('row')
    .slice(1)
    .map((r) => r.textContent)

describe('separarSemProjeto', () => {
  it('separa a linha sem projeto e mantém a ordem dos projetos', () => {
    const r = separarSemProjeto([{ id: 'a' }, { id: ID_SEM_PROJETO }, { id: 'b' }])
    expect(r.projetos).toEqual([{ id: 'a' }, { id: 'b' }])
    expect(r.semProjeto).toEqual({ id: ID_SEM_PROJETO })
  })
  it('sem a linha, devolve tudo e semProjeto indefinido', () => {
    const r = separarSemProjeto([{ id: 'a' }])
    expect(r.projetos).toEqual([{ id: 'a' }])
    expect(r.semProjeto).toBeUndefined()
  })
})

describe('097 K-341: linha sem projeto fixa embaixo do AP-PROJETO', () => {
  it('CA-33/CA-34: 10 projetos e a linha sem projeto: sem corte, sem botão, a linha fica por último', async () => {
    const cartao = await renderizar(com([semProjeto(50), ...projetos(10)]))
    expect(within(cartao).queryByTestId('projetos-mostrando')).toBeNull()
    expect(within(cartao).queryByTestId('projetos-demais')).toBeNull()
    expect(within(cartao).queryByRole('button', { name: /Ver todos|Ver só/ })).toBeNull()
    const linhas = linhasDaTabela(cartao)
    expect(linhas).toHaveLength(11)
    expect(linhas[10]).toMatch(/^Sem iniciativa50 h/)
    expect(linhas[0]).toMatch(/^Projeto 00/)
  })

  it('CA-33/CA-34: 12 projetos e a linha sem projeto: os 10 maiores são projetos, N e Demais sem ela', async () => {
    const cartao = await renderizar(com([semProjeto(50), ...projetos(12)]))
    expect(within(cartao).getByTestId('projetos-mostrando')).toHaveTextContent(
      'Mostrando os 10 projetos com mais horas, de 12.',
    )
    // Demais soma só projetos: Projeto 10 (3 h) e Projeto 11 (2 h); as 50 h sem projeto ficam de fora.
    expect(within(cartao).getByTestId('projetos-demais')).toHaveTextContent(
      'Demais 2 projetos: 5 h',
    )
    expect(within(cartao).getByRole('button', { name: 'Ver todos os 12 projetos' })).toBeVisible()
    const linhas = linhasDaTabela(cartao)
    expect(linhas).toHaveLength(11)
    expect(linhas[0]).toMatch(/^Projeto 00/)
    expect(linhas[9]).toMatch(/^Projeto 09/)
    expect(linhas[10]).toMatch(/^Sem iniciativa50 h/)
  })

  it('Ver todos: lista os projetos e a linha sem projeto por último, com N sem ela', async () => {
    const u = userEvent.setup()
    const cartao = await renderizar(com([semProjeto(50), ...projetos(12)]))
    await u.click(within(cartao).getByRole('button', { name: 'Ver todos os 12 projetos' }))
    expect(within(cartao).getByRole('status')).toHaveTextContent('Mostrando todos os 12 projetos.')
    expect(within(cartao).queryByTestId('projetos-demais')).toBeNull()
    const linhas = linhasDaTabela(cartao)
    expect(linhas).toHaveLength(13)
    expect(linhas[11]).toMatch(/^Projeto 11/)
    expect(linhas[12]).toMatch(/^Sem iniciativa/)
  })

  it('10 projetos mais a linha não viram "Ver todos os 11 projetos"', async () => {
    const cartao = await renderizar(com([...projetos(10), semProjeto(1)]))
    expect(within(cartao).queryByRole('button', { name: /11 projetos/ })).toBeNull()
  })

  it('a linha sem projeto aparece com as horas dela no gráfico acessível e na tabela', async () => {
    const cartao = await renderizar(com([...projetos(3), semProjeto(7.5)]))
    expect(linhasDaTabela(cartao).at(-1)).toMatch(/^Sem iniciativa7,5 h/)
  })

  it('só a linha sem projeto: uma linha, sem corte nem botão', async () => {
    const cartao = await renderizar(com([semProjeto(12)]))
    expect(linhasDaTabela(cartao)).toHaveLength(1)
    expect(within(cartao).queryByTestId('projetos-demais')).toBeNull()
    expect(within(cartao).queryByRole('button', { name: /Ver todos|Ver só/ })).toBeNull()
  })

  it('sem a linha sem projeto, nada muda (12 projetos)', async () => {
    const cartao = await renderizar(com(projetos(12)))
    expect(within(cartao).getByTestId('projetos-mostrando')).toHaveTextContent('de 12.')
    expect(linhasDaTabela(cartao)).toHaveLength(10)
    expect(linhasDaTabela(cartao).some((l) => l.startsWith('Sem iniciativa'))).toBe(false)
  })

  it('A1: a frase de leitura não escolhe a linha sem projeto, mesmo sendo a de mais horas', async () => {
    const cartao = await renderizar(com([semProjeto(500), ...projetos(3)]))
    expect(cartao).toHaveTextContent('Projeto 00 reúne a maior parte das horas apontadas')
    expect(cartao).not.toHaveTextContent('Sem iniciativa reúne')
  })

  it('A1: só com a linha sem projeto, não há frase de leitura', async () => {
    const cartao = await renderizar(com([semProjeto(12)]))
    expect(cartao).not.toHaveTextContent('reúne a maior parte das horas')
  })

  it('o selo de incompleto da linha sem projeto continua na lista de selos', async () => {
    const resposta = com([...projetos(2), semProjeto(3)])
    resposta.registroIncompleto = {
      total: 1,
      cards: [
        {
          cardId: '9100000001',
          titulo: 'Card incompleto',
          projeto: { id: ID_SEM_PROJETO, rotulo: 'Sem iniciativa', foraDoEscopo: false },
        },
      ],
      projetoIds: [ID_SEM_PROJETO],
    }
    const cartao = await renderizar(resposta)
    expect(within(cartao).getByTestId('selos-projeto-incompleto')).toHaveTextContent(
      'Sem iniciativa',
    )
  })
})

describe('097 K-341: achado de concentração com as horas sem projeto', () => {
  const achado = (valores: Record<string, unknown>) => ({
    codigo: 'concentracao-em-projeto',
    valores,
    rotuloRef: 'Alfa',
  })
  it('com horasSemProjeto, diz à parte quantas horas ficaram sem projeto', () => {
    expect(fraseDoAchado(achado({ pct: 40, horasSemProjeto: 12.5 }))?.frase).toBe(
      "O projeto 'Alfa' concentra 40% das horas apontadas no período. À parte, 12,5 h ficaram sem projeto.",
    )
  })
  it('horasSemProjeto 0 também é dito (a linha existe)', () => {
    expect(fraseDoAchado(achado({ pct: 40, horasSemProjeto: 0 }))?.frase).toContain(
      'À parte, 0 h ficaram sem projeto.',
    )
  })
  it('sem horasSemProjeto (ou inválido), a frase é a de antes', () => {
    const antes = "O projeto 'Alfa' concentra 40% das horas apontadas no período."
    expect(fraseDoAchado(achado({ pct: 40 }))?.frase).toBe(antes)
    expect(fraseDoAchado(achado({ pct: 40, horasSemProjeto: 'x' }))?.frase).toBe(antes)
  })
})
