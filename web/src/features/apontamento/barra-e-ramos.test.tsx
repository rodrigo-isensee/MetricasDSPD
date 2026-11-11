import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, renderHook, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import ApontamentoPage from './ApontamentoPage'
import { useDadosAba } from './dados'
import { RESPOSTA_FICTICIA, fonteFicticia, respostaFicticia, respostaVazia } from './fixture'
import { fmtApontamentos } from './formatar'
import type { ConsultaApontamento, FonteApontamento, RespostaApontamento } from './types'

const URL_ABA = '/operacional/apontamento'
const CONSULTA_PADRAO: ConsultaApontamento = { nivelMatriz: 'tipo', anomalos: 'incluir' }

function renderizar(url: string = URL_ABA, fonte: FonteApontamento = fonteFicticia) {
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

const com = (r: RespostaApontamento): FonteApontamento => ({ buscar: () => Promise.resolve(r) })

async function pronto(url?: string, fonte?: FonteApontamento) {
  const roteador = renderizar(url, fonte)
  const el = await screen.findByTestId('metrica-AP-KPIS')
  await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
  return roteador
}

async function marcar(filtro: string, rotuloOpcao: string) {
  await userEvent.click(screen.getByRole('button', { name: new RegExp(`^${filtro}: `) }))
  await userEvent.click(await screen.findByLabelText(rotuloOpcao))
  await userEvent.keyboard('{Escape}')
}

describe('barra de filtros', () => {
  it('cada filtro de lista grava a escolha na URL e o chip a remove', async () => {
    const roteador = await pronto()
    await marcar('Projeto', 'Iniciativa Portal do Cliente')
    await waitFor(() => expect(roteador.state.location.search).toBe('?projeto=1042'))
    await marcar('Tipo', 'Correção')
    await marcar('Subgrupo', 'Reunião')
    await marcar('Subtarefa', 'Em subtarefa')
    await marcar('Qualidade', 'Sem comentário')
    await waitFor(() =>
      expect(new URLSearchParams(roteador.state.location.search).get('qualidade')).toBe(
        'sem-comentario',
      ),
    )
    const p = new URLSearchParams(roteador.state.location.search)
    expect([p.get('tipo'), p.get('subgrupo'), p.get('subtarefa')]).toEqual([
      '5',
      'reuniao',
      'em-subtarefa',
    ])
    await userEvent.click(screen.getByRole('button', { name: 'Remover filtro Tipo: Correção' }))
    await waitFor(() =>
      expect(new URLSearchParams(roteador.state.location.search).has('tipo')).toBe(false),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    await waitFor(() => expect(roteador.state.location.search).toBe(''))
  })

  it('"Limpar" dentro do filtro esvazia só aquele filtro', async () => {
    const roteador = await pronto(`${URL_ABA}?tipo=3&projeto=1042`)
    await userEvent.click(screen.getByRole('button', { name: /^Tipo: / }))
    await userEvent.click(await screen.findByRole('button', { name: 'Limpar' }))
    await waitFor(() => expect(roteador.state.location.search).toBe('?projeto=1042'))
  })

  it('remover um valor de um filtro com vários mantém os outros', async () => {
    const roteador = await pronto(`${URL_ABA}?tipo=3,5`)
    await userEvent.click(screen.getByRole('button', { name: 'Remover filtro Tipo: Tarefa' }))
    await waitFor(() => expect(roteador.state.location.search).toBe('?tipo=5'))
  })

  it('o período vem em dois campos que andam juntos: um completa o outro e limpar um limpa o período', async () => {
    const roteador = await pronto()
    const de = screen.getByLabelText('De')
    const ate = screen.getByLabelText('Até')
    fireEvent.change(de, { target: { value: '2026-09-01' } })
    await waitFor(() =>
      expect(roteador.state.location.search).toBe('?de=2026-09-01&ate=2026-10-30'),
    )
    fireEvent.change(ate, { target: { value: '2026-09-30' } })
    await waitFor(() =>
      expect(roteador.state.location.search).toBe('?de=2026-09-01&ate=2026-09-30'),
    )
    fireEvent.change(de, { target: { value: '2026-09-10' } })
    await waitFor(() =>
      expect(roteador.state.location.search).toBe('?de=2026-09-10&ate=2026-09-30'),
    )
    expect(
      screen.getByRole('button', { name: /Remover filtro Período: 10\/09\/2026 a 30\/09\/2026/ }),
    ).toBeInTheDocument()
    fireEvent.change(ate, { target: { value: '' } })
    await waitFor(() => expect(roteador.state.location.search).toBe(''))
    fireEvent.change(ate, { target: { value: '2026-09-30' } })
    await waitFor(() =>
      expect(roteador.state.location.search).toBe('?de=2026-01-05&ate=2026-09-30'),
    )
    fireEvent.change(de, { target: { value: '' } })
    await waitFor(() => expect(roteador.state.location.search).toBe(''))
  })

  it('o chip do período o remove', async () => {
    const roteador = await pronto(`${URL_ABA}?de=2026-09-01&ate=2026-09-30`)
    await userEvent.click(screen.getByRole('button', { name: /Remover filtro Período/ }))
    await waitFor(() => expect(roteador.state.location.search).toBe(''))
  })

  it('"Ocultar possíveis erros" liga e desliga na URL', async () => {
    const roteador = await pronto()
    const caixa = screen.getByRole('checkbox', { name: 'Ocultar possíveis erros' })
    await userEvent.click(caixa)
    await waitFor(() => expect(roteador.state.location.search).toBe('?anomalos=ocultar'))
    await userEvent.click(caixa)
    await waitFor(() => expect(roteador.state.location.search).toBe(''))
    await userEvent.click(caixa)
    await waitFor(() => expect(roteador.state.location.search).toBe('?anomalos=ocultar'))
    await userEvent.click(
      screen.getByRole('button', { name: 'Remover filtro Possíveis erros: ocultos' }),
    )
    await waitFor(() => expect(roteador.state.location.search).toBe(''))
  })

  it('a ordem por total e o nível da matriz ficam na URL e voltam ao padrão sem ela', async () => {
    const roteador = await pronto(`${URL_ABA}?ordem=total&nivelMatriz=subtarefa`)
    const grupo = screen.getAllByRole('radiogroup', { name: 'Ordem' })[0]!
    expect(
      within(grupo).getByRole('radio', { name: 'Total de horas (maior primeiro)' }),
    ).toBeChecked()
    await userEvent.click(within(grupo).getByRole('radio', { name: 'Alfabética (padrão)' }))
    await waitFor(() => expect(roteador.state.location.search).toBe('?nivelMatriz=subtarefa'))
  })

  it('o mapa diário muda de período por dois campos e volta ao padrão ao limpar', async () => {
    const roteador = await pronto()
    const cartao = screen.getByTestId('metrica-AP-DIARIO')
    const de = within(cartao).getByLabelText('Mapa de')
    fireEvent.change(de, { target: { value: '2026-10-12' } })
    await waitFor(() =>
      expect(roteador.state.location.search).toBe('?diarioDe=2026-10-12&diarioAte=2026-10-30'),
    )
    expect(within(cartao).getByLabelText('Mapa de')).toHaveValue('2026-10-12')
    fireEvent.change(within(cartao).getByLabelText('até'), { target: { value: '2026-10-20' } })
    await waitFor(() =>
      expect(roteador.state.location.search).toBe('?diarioDe=2026-10-12&diarioAte=2026-10-20'),
    )
    fireEvent.change(within(cartao).getByLabelText('Mapa de'), { target: { value: '' } })
    await waitFor(() => expect(roteador.state.location.search).toBe(''))
  })

  it('sem resposta (erro na primeira carga) os filtros da URL aparecem como chips e podem ser removidos', async () => {
    const roteador = renderizar(
      `${URL_ABA}?tipo=3&pessoa=p2&projeto=1042&subtarefa=em-subtarefa&subgrupo=reuniao&qualidade=generico`,
      {
        buscar: () => Promise.reject(new Error('falha')),
      },
    )
    const chips = await screen.findByRole('list', { name: 'Filtros ativos' })
    expect(within(chips).getAllByRole('listitem')).toHaveLength(6)
    expect(within(chips).getByText('Pessoa que apontou: p2')).toBeInTheDocument()
    await userEvent.click(within(chips).getByRole('button', { name: 'Remover filtro Tipo: 3' }))
    await waitFor(() =>
      expect(new URLSearchParams(roteador.state.location.search).has('tipo')).toBe(false),
    )
  })
})

describe('achados: atalhos', () => {
  it('cada atalho aplica o filtro ou leva ao cartão', async () => {
    const roteador = await pronto()
    const lista = screen.getByTestId('lista-achados')
    await userEvent.click(within(lista).getAllByRole('button', { name: 'Ver apontamentos' })[0]!)
    await waitFor(() => expect(roteador.state.location.search).toBe('?qualidade=sem-comentario'))
    const links = within(lista).getAllByRole('link')
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '#ap-diario',
      '#ap-capacidade-mensal',
    ])
    expect(links.map((l) => l.textContent)).toEqual(['Ver mapa diário', 'Ver capacidade mensal'])
  })

  it('o atalho do projeto filtra pelo id; sem o projeto nas opções não há atalho', async () => {
    const roteador = await pronto()
    const lista = screen.getByTestId('lista-achados')
    // sem-comentario, concentracao-em-projeto, nao-classificado: três botões de filtro
    const botoes = within(lista).getAllByRole('button')
    expect(botoes).toHaveLength(3)
    await userEvent.click(botoes[2]!)
    await waitFor(() => expect(roteador.state.location.search).toBe('?projeto=1042'))
  })

  it('projeto citado que não está nas opções fica sem atalho', async () => {
    const r: RespostaApontamento = {
      ...RESPOSTA_FICTICIA,
      achados: [
        {
          codigo: 'concentracao-em-projeto',
          valores: { pct: 30 },
          rotuloRef: 'Projeto desconhecido',
        },
      ],
    }
    await pronto(URL_ABA, com(r))
    const lista = screen.getByTestId('lista-achados')
    expect(lista).toHaveTextContent("O projeto 'Projeto desconhecido' concentra 30%")
    expect(within(lista).queryByRole('button')).toBeNull()
  })

  it('rótulo de projeto longo e sem espaço quebra na frase do achado e na leitura dos cartões', async () => {
    const longo = 'nome_com_sublinhado_'.repeat(5)
    const r: RespostaApontamento = {
      ...RESPOSTA_FICTICIA,
      achados: [{ codigo: 'concentracao-em-projeto', valores: { pct: 60 }, rotuloRef: longo }],
    }
    await pronto(URL_ABA, com(r))
    const frase = within(screen.getByTestId('lista-achados')).getByText(new RegExp(longo))
    expect(frase.className).toContain('[overflow-wrap:anywhere]')
    for (const leitura of screen.getAllByTestId(/^leitura-AP-/)) {
      expect(leitura.className).toContain('[overflow-wrap:anywhere]')
    }
  })

  it('o cartão de Qualidade mostra a execução técnica à parte, lida da distribuição, e o atalho filtra por ela', async () => {
    const roteador = await pronto()
    const cartao = screen.getByTestId('metrica-AP-QUALIDADE')
    const nota = within(cartao).getByRole('region', { name: /Execução técnica/ })
    expect(nota).toHaveTextContent('Execução técnica: 24 apontamentos (')
    expect(nota).toHaveTextContent('Não conta como problema de qualidade')
    expect(within(nota).queryByText('Sem vínculo claro')).not.toBeInTheDocument()
    await userEvent.click(
      within(nota).getByRole('button', { name: 'Ver apontamentos de execução técnica' }),
    )
    await waitFor(() => expect(roteador.state.location.search).toBe('?subgrupo=execucao-tecnica'))
  })

  it('sem execução técnica na distribuição, a nota não aparece', async () => {
    const r = respostaFicticia(CONSULTA_PADRAO)
    await pronto(
      URL_ABA,
      com({
        ...r,
        distribuicao: {
          ...r.distribuicao,
          porSubgrupo: r.distribuicao.porSubgrupo.filter((l) => l.id !== 'execucao-tecnica'),
        },
      }),
    )
    expect(screen.queryByTestId('nota-execucao-tecnica')).not.toBeInTheDocument()
  })

  it('o cartão de subgrupo oferece o atalho para os sem comentário', async () => {
    const roteador = await pronto()
    const cartao = screen.getByTestId('metrica-AP-SUBGRUPO')
    await userEvent.click(
      within(cartao).getByRole('button', { name: 'Ver apontamentos sem comentário' }),
    )
    await waitFor(() => expect(roteador.state.location.search).toBe('?subgrupo=nao-classificado'))
  })
})

describe('ramos de dados e de leitura', () => {
  it('uma pessoa só: "1 pessoa" no KPI', async () => {
    const r: RespostaApontamento = {
      ...RESPOSTA_FICTICIA,
      kpis: { ...RESPOSTA_FICTICIA.kpis, pessoasAtivas: 1 },
    }
    await pronto(URL_ABA, com(r))
    expect(screen.getByTestId('leitura-AP-KPIS')).toHaveTextContent('por 1 pessoa.')
    expect(fmtApontamentos(1)).toBe('1 apontamento')
    expect(fmtApontamentos(2)).toBe('2 apontamentos')
  })

  it('célula ou flag que o servidor não mandou aparece como traço, sem quebrar a tabela', async () => {
    const r: RespostaApontamento = {
      ...RESPOSTA_FICTICIA,
      matriz: {
        ...RESPOSTA_FICTICIA.matriz,
        linhas: RESPOSTA_FICTICIA.matriz.linhas.map((l) => ({
          ...l,
          celulas: l.celulas.slice(0, 1),
        })),
      },
      qualidade: {
        ...RESPOSTA_FICTICIA.qualidade,
        porPessoa: RESPOSTA_FICTICIA.qualidade.porPessoa.map((p) => ({ ...p, porFlag: [] })),
      },
    }
    await pronto(URL_ABA, com(r))
    const matriz = screen.getByTestId('tabela-AP-MATRIZ-detalhe')
    expect(within(matriz).getAllByText('—').length).toBeGreaterThan(0)
    const q = screen.getByTestId('tabela-AP-QUALIDADE-PESSOA-detalhe')
    expect(within(q).getAllByText('—').length).toBeGreaterThan(0)
  })

  it('pessoa fora das opções vira "Pessoa não identificada" e fica por último na ordem por total', async () => {
    const r: RespostaApontamento = {
      ...RESPOSTA_FICTICIA,
      capacidade: {
        ...RESPOSTA_FICTICIA.capacidade,
        porPessoa: RESPOSTA_FICTICIA.capacidade.porPessoa.filter((p) => p.pessoaRef !== 'p3'),
      },
      opcoes: {
        ...RESPOSTA_FICTICIA.opcoes,
        pessoas: RESPOSTA_FICTICIA.opcoes.pessoas.filter((p) => p.pessoaRef !== 'p3'),
      },
    }
    await pronto(`${URL_ABA}?ordem=total`, com(r))
    const tabela = screen.getByTestId('tabela-AP-QUALIDADE-PESSOA-detalhe')
    const nomes = within(tabela)
      .getAllByRole('rowheader')
      .map((c) => c.textContent)
    expect(nomes.slice(0, 2)).toEqual(['Pessoa 1', 'Pessoa 2'])
    expect(nomes.filter((n) => n === 'Pessoa não identificada').length).toBeGreaterThan(0)
  })

  it('o mapa ignora teclas que não são setas e para nas bordas', async () => {
    await pronto()
    const mapa = screen.getByTestId('mapa-diario')
    const primeira = mapa.querySelector<HTMLElement>('td[data-lin="0"][data-col="0"]')!
    primeira.focus()
    await userEvent.keyboard('a')
    expect(document.activeElement).toBe(primeira)
    await userEvent.keyboard('{ArrowLeft}{ArrowUp}')
    expect(document.activeElement).toBe(primeira)
    await userEvent.keyboard('{ArrowRight}{ArrowLeft}')
    expect(document.activeElement).toBe(primeira)
    await userEvent.keyboard('{ArrowDown}{ArrowUp}')
    expect(document.activeElement).toBe(primeira)
  })

  it('useDadosAba fora do provedor falha com mensagem clara', () => {
    expect(() => renderHook(() => useDadosAba())).toThrow('useDadosAba fora de ProvedorDadosAba')
  })
})

describe('fonte fictícia', () => {
  it('aplica o período, o nível da matriz e o filtro de pessoa nos blocos por pessoa', () => {
    const r = respostaFicticia({
      ...CONSULTA_PADRAO,
      de: '2026-09-01',
      ate: '2026-09-30',
      nivelMatriz: 'subgrupo',
      pessoa: ['p1', 'p2'],
    })
    expect(r.periodo).toEqual({ de: '2026-09-01', ate: '2026-09-30' })
    expect(r.matriz.nivel).toBe('subgrupo')
    expect(r.matriz.linhas.map((l) => l.pessoaRef)).toEqual(['p1', 'p2'])
    expect(r.diario.linhas.map((l) => l.pessoaRef)).toEqual(['p1', 'p2'])
  })

  it('valor de filtro que não existe nas opções devolve o recorte vazio', () => {
    for (const c of [
      { pessoa: ['p99'] },
      { projeto: ['1'] },
      { tipo: ['1'] },
      { subtarefa: ['x'] },
      { subgrupo: ['x'] },
    ]) {
      const r = respostaFicticia({ ...CONSULTA_PADRAO, ...c })
      expect(r.kpis.apontamentos).toBe(0)
      expect(r.matriz.linhas).toEqual([])
    }
    const comPeriodo = respostaFicticia({
      ...CONSULTA_PADRAO,
      de: '2026-09-01',
      ate: '2026-09-02',
      tipo: ['1'],
    })
    expect(comPeriodo.periodo.de).toBe('2026-09-01')
    expect(respostaVazia().achados).toEqual([])
  })

  it('a fonte entrega a fixture sem filtros', async () => {
    const r = await fonteFicticia.buscar(CONSULTA_PADRAO)
    expect(r).toEqual(RESPOSTA_FICTICIA)
  })
})
