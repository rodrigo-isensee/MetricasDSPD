import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import ApontamentoPage from './ApontamentoPage'
import {
  RESPOSTA_FICTICIA,
  fonteFicticia,
  respostaComNomesReais,
  respostaDefasada,
  respostaFicticia,
  respostaInsuficiente,
  respostaVazia,
} from './fixture'
import type { FonteApontamento, RespostaApontamento } from './types'

const URL_ABA = '/operacional/apontamento'

function fonteCom(
  resposta:
    RespostaApontamento | ((c: Parameters<FonteApontamento['buscar']>[0]) => RespostaApontamento),
): FonteApontamento {
  return {
    buscar: (c) => Promise.resolve(typeof resposta === 'function' ? resposta(c) : resposta),
  }
}

function renderizar(url: string = URL_ABA, fonte: FonteApontamento = fonteFicticia) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const roteador = createMemoryRouter([{ path: '*', element: <ApontamentoPage fonte={fonte} /> }], {
    initialEntries: [url],
  })
  const r = render(
    <QueryClientProvider client={client}>
      <RouterProvider router={roteador} />
    </QueryClientProvider>,
  )
  return { ...r, roteador }
}

async function cartao(codigo: string, url?: string, fonte?: FonteApontamento) {
  const r = renderizar(url, fonte)
  const el = await screen.findByTestId(`metrica-${codigo}`)
  await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
  return { ...r, el }
}

const CODIGOS = [
  'AP-KPIS',
  'AP-PROJETO',
  'AP-TIPO',
  'AP-SUBGRUPO',
  'AP-QUALIDADE',
  'AP-MATRIZ',
  'AP-QUALIDADE-PESSOA',
  'AP-CAPACIDADE-MENSAL',
  'AP-CAPACIDADE-PESSOA',
  'AP-ACHADOS',
  'AP-DIARIO',
]

describe('contrato e fixture (§3.9)', () => {
  const proibidas = ['user_id', 'responsavel_id', 'comment', 'comentario', 'email']
  const chaves = (v: unknown, acc: string[] = []): string[] => {
    if (Array.isArray(v)) v.forEach((x) => chaves(x, acc))
    else if (v && typeof v === 'object')
      for (const [k, x] of Object.entries(v)) {
        acc.push(k)
        chaves(x, acc)
      }
    return acc
  }

  it('nenhuma chave de identidade ou comentário em nenhum nível', () => {
    for (const r of [
      RESPOSTA_FICTICIA,
      respostaVazia(),
      respostaInsuficiente(),
      respostaComNomesReais(),
    ])
      expect(chaves(r).filter((k) => proibidas.includes(k))).toEqual([])
  })

  it('pessoa só por pessoaRef opaco; horas em segundos inteiros; fonte única BusinessMap', () => {
    expect(RESPOSTA_FICTICIA.dominio).toBe('businessmap')
    expect(RESPOSTA_FICTICIA.nomesReais).toBe(false)
    for (const p of RESPOSTA_FICTICIA.opcoes.pessoas) expect(p.pessoaRef).toMatch(/^p[1-9]\d{0,8}$/)
    const segundos = RESPOSTA_FICTICIA.capacidade.porPessoa.map((p) => p.realizadoSegundos)
    for (const s of segundos) expect(Number.isInteger(s)).toBe(true)
    expect(
      RESPOSTA_FICTICIA.opcoes.pessoas.map((p) => p.rotulo).filter((r) => /^Pessoa \d$/.test(r)),
    ).toHaveLength(7)
  })

  it('percentual por pessoa só existe com 20 apontamentos ou mais (o3)', () => {
    const r = RESPOSTA_FICTICIA
    for (const p of r.qualidade.porPessoa)
      expect(p.completos.status).toBe(p.apontamentos >= 20 ? 'ok' : 'insuficiente')
    for (const p of r.capacidade.porPessoa)
      expect(p.utilizacao.status).toBe(p.apontamentos >= 20 ? 'ok' : 'insuficiente')
  })

  it('o schema não tem meta, faixa, status nem média por pessoa (o2)', () => {
    const porPessoa = [
      ...RESPOSTA_FICTICIA.capacidade.porPessoa,
      ...RESPOSTA_FICTICIA.qualidade.porPessoa,
    ]
    const ks = new Set(chaves(porPessoa))
    for (const k of ['meta', 'faixa', 'semaforo', 'media', 'mediaEquipe', 'cor'] as const)
      expect(ks.has(k)).toBe(false)
  })
})

describe('CA-1: cabeçalho, frescor e período', () => {
  it('mostra o selo da fonte BusinessMap com ícone e texto e o período dos dados', async () => {
    renderizar()
    const selo = await screen.findByTestId('selo-frescor-businessmap')
    expect(selo).toHaveTextContent('Atual')
    expect(selo.querySelector('svg')).not.toBeNull()
    expect(screen.getByTestId('periodo-dos-dados')).toHaveTextContent(
      'Dados de 03/08/2026 a 30/10/2026',
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Apontamento' })).toBeInTheDocument()
  })

  it('dado defasado: selo "Atrasado: última coleta há N h" e aviso, sem esconder o dado velho', async () => {
    await cartao('AP-KPIS', URL_ABA, fonteCom(respostaDefasada()))
    expect(screen.getByTestId('selo-frescor-businessmap')).toHaveTextContent(
      /Atrasado: última coleta há \d+ h/,
    )
    expect(screen.getByTestId('aviso-defasado')).toBeInTheDocument()
    expect(screen.getByTestId('kpi-apontamentos')).toBeInTheDocument()
  })

  describe('aviso de última coleta parcial (069 M1-a)', () => {
    const OK = '2026-10-30T06:10:00-03:00'
    const comTentativa = (
      resultado: 'ok' | 'parcial' | 'falha',
      fim: string,
      ultimaColetaOk: string | null = OK,
    ) =>
      fonteCom({
        ...RESPOSTA_FICTICIA,
        frescor: { selo: 'atual', ultimaColetaOk, ultimaTentativa: { resultado, fim } },
      })

    it('parcial mais nova que a última ok: mostra o aviso com data e hora', async () => {
      await cartao('AP-KPIS', URL_ABA, comTentativa('parcial', '2026-10-31T07:05:00-03:00'))
      expect(screen.getByTestId('aviso-parcial')).toHaveTextContent(
        'Última coleta parcial em 31/10 07:05: o período pode estar incompleto',
      )
    })

    it('parcial sem nenhuma coleta ok: mostra o aviso', async () => {
      await cartao('AP-KPIS', URL_ABA, comTentativa('parcial', '2026-10-31T07:05:00-03:00', null))
      expect(screen.getByTestId('aviso-parcial')).toBeInTheDocument()
    })

    it.each([
      ['parcial mais antiga que a última ok', comTentativa('parcial', '2026-10-29T07:05:00-03:00')],
      ['última tentativa ok', comTentativa('ok', '2026-10-31T07:05:00-03:00')],
      ['última tentativa falha', comTentativa('falha', '2026-10-31T07:05:00-03:00')],
      [
        'sem tentativa (null)',
        fonteCom({
          ...RESPOSTA_FICTICIA,
          frescor: { selo: 'atual', ultimaColetaOk: OK, ultimaTentativa: null },
        }),
      ],
      ['campo ausente (resposta antiga)', fonteCom(RESPOSTA_FICTICIA)],
    ])('sem aviso: %s', async (_nome, fonte) => {
      await cartao('AP-KPIS', URL_ABA, fonte)
      expect(screen.queryByTestId('aviso-parcial')).toBeNull()
    })
  })

  it('mostra a legenda da finalidade e o texto longo com as quatro cláusulas', async () => {
    renderizar()
    const legenda = await screen.findByTestId('legenda-finalidade')
    expect(legenda).toHaveTextContent(
      'Não medem esforço de entrega, velocidade, custo de card nem meta.',
    )
    await userEvent.click(within(legenda).getByRole('button', { name: 'Saiba mais' }))
    expect(within(legenda).getAllByRole('listitem')).toHaveLength(4)
    expect(legenda).toHaveTextContent('a lista de pessoas vem em ordem neutra (alfabética)')
    expect(legenda).toHaveTextContent('a aba fica fora da exportação do painel')
  })

  it('seções com título em pergunta e um cartão para cada bloco', async () => {
    renderizar()
    for (const c of CODIGOS) {
      const el = await screen.findByTestId(`metrica-${c}`)
      expect(el).toHaveAttribute('id', c.toLowerCase())
    }
    expect(
      screen.getByRole('heading', { level: 2, name: 'Quanto foi apontado e com que qualidade?' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Como os apontamentos se distribuem dia a dia?',
      }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThanOrEqual(
      CODIGOS.length,
    )
  })
})

describe('estados da tela', () => {
  it('carregando: anuncia "Carregando apontamentos" e não mostra o conteúdo', async () => {
    renderizar(URL_ABA, { buscar: () => new Promise<RespostaApontamento>(() => undefined) })
    expect(await screen.findByTestId('frescor-carregando')).toHaveTextContent(
      'Carregando apontamentos',
    )
    expect(screen.getByTestId('anuncio-carregando')).toHaveTextContent('Carregando apontamentos')
    expect(screen.getByTestId('metrica-AP-KPIS')).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByTestId('kpi-horas')).toBeNull()
  })

  it('erro: cada cartão mostra o erro, mantém os filtros e "Tentar de novo" busca outra vez', async () => {
    const buscar = vi
      .fn<FonteApontamento['buscar']>()
      .mockRejectedValueOnce(new Error('falha de rede'))
      .mockImplementation((c) => Promise.resolve(respostaFicticia(c)))
    const { roteador } = renderizar(`${URL_ABA}?tipo=3`, { buscar })
    const erro = await screen.findByTestId('estado-erro-AP-KPIS')
    expect(erro).toHaveTextContent('Seus filtros foram mantidos')
    expect(roteador.state.location.search).toBe('?tipo=3')
    await userEvent.click(within(erro).getByRole('button', { name: 'Tentar de novo' }))
    await waitFor(() =>
      expect(screen.getByTestId('metrica-AP-KPIS')).toHaveAttribute('data-estado', 'ok'),
    )
    expect(buscar).toHaveBeenCalledTimes(2)
  })
})

describe('CA-2: vazio', () => {
  it('recorte sem apontamento mostra o estado vazio com limpar e remover cada filtro ativo', async () => {
    const { roteador } = renderizar(`${URL_ABA}?pessoa=p1&tipo=3`, fonteCom(respostaVazia()))
    const vazio = await screen.findByTestId('estado-vazio-AP')
    expect(vazio).toHaveTextContent('Nenhum apontamento encontrado')
    expect(vazio).toHaveTextContent('Nenhum apontamento atende aos filtros atuais.')
    expect(within(vazio).getByRole('button', { name: 'Limpar filtros' })).toBeInTheDocument()
    expect(
      within(vazio).getByRole('button', { name: 'Remover filtro Pessoa que apontou' }),
    ).toBeInTheDocument()
    await userEvent.click(within(vazio).getByRole('button', { name: 'Remover filtro Tipo' }))
    await waitFor(() => expect(roteador.state.location.search).toBe('?pessoa=p1'))
    await userEvent.click(within(vazio).getByRole('button', { name: 'Limpar filtros' }))
    await waitFor(() => expect(roteador.state.location.search).toBe(''))
  })
})

describe('CA-3 e o3: amostra insuficiente', () => {
  it('de 1 a 19 apontamentos: soma e contagem ficam; o percentual vira "amostra insuficiente"', async () => {
    await cartao('AP-KPIS', URL_ABA, fonteCom(respostaInsuficiente()))
    const kpis = screen.getByTestId('metrica-AP-KPIS')
    expect(within(kpis).getByTestId('kpi-horas')).toHaveTextContent('19,5 h')
    expect(within(kpis).getByTestId('kpi-apontamentos')).toHaveTextContent('12')
    expect(within(kpis).getByTestId('kpi-completos')).not.toHaveTextContent('%')
    expect(within(kpis).getByTestId('amostra-insuficiente-AP-KPIS')).toBeInTheDocument()
    const util = await screen.findByTestId('tabela-AP-CAPACIDADE-PESSOA-detalhe')
    expect(util).not.toHaveTextContent('%')
    expect(within(util).getAllByText('amostra insuficiente').length).toBeGreaterThan(0)
  })

  it('por pessoa, quem tem menos de 20 apontamentos mostra só soma e contagem; quem tem 20 ou mais mostra o percentual', async () => {
    await cartao('AP-QUALIDADE-PESSOA')
    const tabela = screen.getByTestId('tabela-AP-QUALIDADE-PESSOA-detalhe')
    const linha = (nome: string) =>
      within(tabela).getByRole('row', { name: new RegExp(`^${nome}\\b`) })
    expect(linha('Pessoa 1')).toHaveTextContent('%')
    expect(linha('Pessoa 7')).not.toHaveTextContent('%')
    expect(linha('Pessoa 7')).toHaveTextContent('amostra insuficiente')
    const cap = screen.getByTestId('tabela-AP-CAPACIDADE-PESSOA-detalhe')
    expect(within(cap).getByRole('row', { name: /^Pessoa 7\b/ })).not.toHaveTextContent('%')
    expect(within(cap).getByRole('row', { name: /^Pessoa 1\b/ })).toHaveTextContent(
      /^Pessoa 1.*\d+%/,
    )
  })
})

describe('CA-4: filtros na URL', () => {
  it('escolher a pessoa grava só o pessoaRef na URL e põe o chip nos cartões que a aplicam', async () => {
    const { roteador } = await cartao('AP-KPIS')
    await userEvent.click(screen.getByRole('button', { name: /^Pessoa que apontou: Todas/ }))
    await userEvent.click(await screen.findByLabelText('Pessoa 3'))
    await waitFor(() => expect(roteador.state.location.search).toBe('?pessoa=p3'))
    expect(roteador.state.location.search).not.toMatch(/Pessoa/)
    const kpis = screen.getByTestId('metrica-AP-KPIS')
    await waitFor(() =>
      expect(
        within(kpis).getAllByText(/Filtros aplicados: Pessoa que apontou Pessoa 3/).length,
      ).toBeGreaterThan(0),
    )
    // o chip de filtro ativo aparece na barra, com botão de remover
    expect(
      screen.getByRole('button', { name: 'Remover filtro Pessoa que apontou: Pessoa 3' }),
    ).toBeInTheDocument()
  })

  it('o mapa diário só responde ao filtro Pessoa e diz isso no chip', async () => {
    await cartao('AP-DIARIO', `${URL_ABA}?tipo=3&pessoa=p2`)
    const diario = screen.getByTestId('metrica-AP-DIARIO')
    expect(within(diario).getByText('Não afetado por: Tipo')).toBeInTheDocument()
    expect(
      within(diario).getAllByText(/Filtros aplicados: Pessoa que apontou Pessoa 2/).length,
    ).toBeGreaterThan(0)
    const kpis = screen.getByTestId('metrica-AP-KPIS')
    expect(within(kpis).getAllByText(/Filtros aplicados: .*Tipo Tarefa/).length).toBeGreaterThan(0)
  })

  it('valor inválido na URL (um nome, por exemplo) é descartado sem eco', async () => {
    renderizar(`${URL_ABA}?pessoa=Maria,p1`)
    const aviso = await screen.findByTestId('filtros-invalidos')
    expect(aviso).toHaveTextContent('Valor inválido ignorado em: Pessoa que apontou.')
    expect(document.body).not.toHaveTextContent('Maria')
    expect(
      screen.getByRole('button', { name: 'Remover filtro Pessoa que apontou: Pessoa 1' }),
    ).toBeInTheDocument()
  })

  it('não grava pessoa em localStorage (AP-8)', async () => {
    const gravar = vi.spyOn(Storage.prototype, 'setItem')
    await cartao('AP-KPIS')
    await userEvent.click(screen.getByRole('button', { name: /^Pessoa que apontou: Todas/ }))
    await userEvent.click(await screen.findByLabelText('Pessoa 3'))
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Remover filtro Pessoa que apontou: Pessoa 3' }),
      ).toBeInTheDocument(),
    )
    expect(gravar).not.toHaveBeenCalled()
    expect(window.localStorage.length).toBe(0)
    gravar.mockRestore()
  })
})

describe('CA-5: matriz, um nível por vez', () => {
  it('troca entre tipo, subtarefa e subgrupo e grava o nível na URL, sem misturar dois níveis', async () => {
    const { roteador } = await cartao('AP-MATRIZ')
    const matriz = screen.getByTestId('metrica-AP-MATRIZ')
    const tabela = () => screen.getByTestId('tabela-AP-MATRIZ-detalhe')
    expect(within(tabela()).getByRole('columnheader', { name: 'Tarefa' })).toBeInTheDocument()
    await userEvent.click(within(matriz).getByRole('radio', { name: 'Subgrupo' }))
    await waitFor(() => expect(roteador.state.location.search).toBe('?nivelMatriz=subgrupo'))
    await waitFor(() =>
      expect(
        within(tabela()).getByRole('columnheader', { name: 'Desenvolvimento' }),
      ).toBeInTheDocument(),
    )
    expect(within(tabela()).queryByRole('columnheader', { name: 'Tarefa' })).toBeNull()
    expect(within(tabela()).queryByRole('columnheader', { name: 'Direto no card' })).toBeNull()
    await userEvent.click(within(matriz).getByRole('radio', { name: 'Tipo' }))
    await waitFor(() => expect(roteador.state.location.search).toBe(''))
  })
})

describe('CA-6: tabela alternativa em todo gráfico', () => {
  it.each([
    'AP-PROJETO',
    'AP-TIPO',
    'AP-SUBGRUPO',
    'AP-QUALIDADE',
    'AP-CAPACIDADE-MENSAL',
    'AP-DIARIO',
  ])('%s oferece "Ver como tabela" com o mesmo dado', async (codigo) => {
    await cartao(codigo)
    const el = screen.getByTestId(`metrica-${codigo}`)
    await userEvent.click(within(el).getByRole('button', { name: 'Ver como tabela' }))
    expect(await within(el).findByTestId(`tabela-${codigo}`)).toBeInTheDocument()
    expect(within(el).getByRole('button', { name: 'Ver como gráfico' })).toBeInTheDocument()
  })

  it('a tabela do mapa diário traz pessoa, dia, horas e faixa de cada célula', async () => {
    await cartao('AP-DIARIO')
    const el = screen.getByTestId('metrica-AP-DIARIO')
    await userEvent.click(within(el).getByRole('button', { name: 'Ver como tabela' }))
    const tabela = await within(el).findByTestId('tabela-AP-DIARIO')
    const primeira = RESPOSTA_FICTICIA.diario.linhas[0]!.celulas[0]!
    const dia = primeira.data.split('-').reverse().join('/')
    expect(within(tabela).getAllByRole('row').length).toBeGreaterThan(20)
    expect(within(tabela).getAllByText(dia).length).toBeGreaterThan(0)
    expect(within(tabela).getAllByText('Pessoa 1').length).toBeGreaterThan(0)
  })

  it('as listas que já são tabelas não repetem o botão', async () => {
    await cartao('AP-MATRIZ')
    for (const c of ['AP-MATRIZ', 'AP-QUALIDADE-PESSOA', 'AP-CAPACIDADE-PESSOA'])
      expect(
        within(screen.getByTestId(`metrica-${c}`)).queryByRole('button', {
          name: 'Ver como tabela',
        }),
      ).toBeNull()
  })
})

describe('CA-7 e M-6: mapa diário com faixas fixas e possível erro', () => {
  it('marca o dia acima do limite com texto e ícone, e a legenda mostra as faixas fixas', async () => {
    await cartao('AP-DIARIO')
    const mapa = screen.getByTestId('mapa-diario')
    const marcadas = mapa.querySelectorAll('[data-atipico="true"]')
    expect(marcadas).toHaveLength(1)
    expect(marcadas[0]).toHaveAccessibleName(
      /Pessoa 2, 14\/10, 17 horas, faixa mais de 8 h, Possível erro de apontamento/,
    )
    expect(marcadas[0]!.querySelector('svg')).not.toBeNull()
    expect(
      within(screen.getByTestId('dica-anomalia')).getByText(/Mais de 10 h apontadas/),
    ).toBeInTheDocument()
    const legenda = screen.getByTestId('legenda-diario')
    for (const t of [
      'até 4 h',
      '4 a 8 h',
      'mais de 8 h',
      'Fim de semana ou feriado',
      'Dia útil sem apontamento',
    ])
      expect(within(legenda).getByText(new RegExp(t))).toBeInTheDocument()
  })

  it('a faixa vem do contrato: a mesma faixa tem sempre o mesmo estilo, qualquer que seja o máximo', async () => {
    await cartao('AP-DIARIO')
    const estilos = new Map<string, Set<string>>()
    for (const td of screen
      .getByTestId('mapa-diario')
      .querySelectorAll<HTMLElement>('td[data-faixa]')) {
      const f = td.dataset.faixa ?? ''
      estilos.set(f, (estilos.get(f) ?? new Set()).add(td.style.background))
    }
    for (const [, s] of estilos) expect(s.size).toBe(1)
  })

  it('fim de semana e feriado ficam neutros e distintos de dia útil sem apontamento', async () => {
    await cartao('AP-DIARIO')
    const mapa = screen.getByTestId('mapa-diario')
    const feriado = mapa.querySelector('td[aria-label="Pessoa 1, 12/10, feriado"]')
    expect(feriado).toHaveAttribute('data-faixa', 'neutro')
    expect(mapa.querySelector('td[aria-label="Pessoa 1, 10/10, fim de semana"]')).toHaveAttribute(
      'data-faixa',
      'neutro',
    )
    expect(mapa.querySelectorAll('td[data-faixa="zero"]').length).toBeGreaterThan(0)
  })

  it('navega entre as células com as setas e lê "Pessoa, dia, horas, faixa"', async () => {
    await cartao('AP-DIARIO')
    const mapa = screen.getByTestId('mapa-diario')
    const primeira = mapa.querySelector<HTMLElement>('td[data-lin="0"][data-col="0"]')!
    primeira.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(document.activeElement).toHaveAttribute('data-col', '1')
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement).toHaveAttribute('data-lin', '1')
    expect(document.activeElement).toHaveAccessibleName(/^Pessoa 2, \d{2}\/\d{2}, /)
  })
})

describe('CA-8: 375 px sem rolagem na página', () => {
  it('a rolagem horizontal fica só dentro do bloco do mapa, com pessoa e total fixos', async () => {
    await cartao('AP-DIARIO')
    const regiao = screen.getByTestId('mapa-diario')
    expect(regiao).toHaveAttribute('role', 'region')
    expect(regiao).toHaveAttribute('tabindex', '0')
    expect(regiao.className).toMatch(/overflow-x-auto/)
    expect(regiao.className).toMatch(/max-w-full/)
    expect(within(regiao).getByRole('columnheader', { name: 'Pessoa' }).className).toMatch(/sticky/)
    expect(within(regiao).getByRole('columnheader', { name: 'Total' }).className).toMatch(/sticky/)
    // nenhum outro elemento da aba força largura mínima fora de uma região rolável
    const raiz = screen.getByTestId('aba-apontamento')
    const largos = [...raiz.querySelectorAll('table')].filter((t) => /min-w-max/.test(t.className))
    for (const t of largos) expect(t.closest('[role="region"]')).not.toBeNull()
  })

  it('no mobile a barra recolhe num botão "Filtros (n)"', async () => {
    renderizar(`${URL_ABA}?tipo=3&pessoa=p1`)
    const botao = await screen.findByRole('button', { name: 'Filtros (2)' })
    expect(botao).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(botao)
    expect(botao).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('CA-9, o1 e o2: ordem neutra e utilização sem semáforo', () => {
  const nomesDasLinhas = (tabela: HTMLElement) =>
    within(tabela)
      .getAllByRole('rowheader')
      .map((c) => c.textContent)

  it('a lista de pessoas vem em ordem alfabética e "Total de horas" é escolha de quem lê', async () => {
    const { roteador } = await cartao('AP-CAPACIDADE-PESSOA')
    const tabela = () => screen.getByTestId('tabela-AP-CAPACIDADE-PESSOA-detalhe')
    expect(nomesDasLinhas(tabela())).toEqual([
      'Pessoa 1',
      'Pessoa 2',
      'Pessoa 3',
      'Pessoa 4',
      'Pessoa 5',
      'Pessoa 6',
      'Pessoa 7',
      'Pessoa não identificada',
    ])
    const grupo = screen.getAllByRole('radiogroup', { name: 'Ordem' })[0]!
    expect(within(grupo).getByRole('radio', { name: 'Alfabética (padrão)' })).toBeChecked()
    await userEvent.click(
      within(grupo).getByRole('radio', { name: 'Total de horas (maior primeiro)' }),
    )
    await waitFor(() => expect(roteador.state.location.search).toBe('?ordem=total'))
    // Pessoa 7 (19 h) vem depois de Pessoa 6 (52,5 h); a ordem passa a ser por horas, sem nova chamada à fonte
    const total = nomesDasLinhas(tabela())
    expect(total.slice(0, 3)).toEqual(['Pessoa 1', 'Pessoa 2', 'Pessoa 3'])
    expect(total.indexOf('Pessoa 6')).toBeLessThan(total.indexOf('Pessoa 7'))
    expect(total.at(-1)).toBe('Pessoa não identificada')
  })

  it('a ordem por total vale também na matriz e no mapa diário', async () => {
    await cartao('AP-DIARIO', `${URL_ABA}?ordem=total`)
    const linhas = within(screen.getByTestId('mapa-diario'))
      .getAllByRole('row')
      .slice(1)
      .map((r) => within(r).getAllByRole('cell').at(-1)?.textContent ?? '')
      .map((t) => Number(t.replace(/[^\d,]/g, '').replace(',', '.')))
    expect(linhas).toEqual([...linhas].sort((a, b) => b - a))
  })

  it('a utilização por pessoa é só número: sem meta, faixa, cor de bom ou ruim, medidor nem média', async () => {
    await cartao('AP-CAPACIDADE-PESSOA')
    const cartaoEl = screen.getByTestId('metrica-AP-CAPACIDADE-PESSOA')
    const tabela = within(cartaoEl).getByTestId('tabela-AP-CAPACIDADE-PESSOA-detalhe')
    expect(tabela.querySelector('tbody')?.textContent).not.toMatch(
      /meta|bom|ruim|média|dentro|fora/i,
    )
    expect(tabela.querySelector('[role="meter"], [role="progressbar"], meter, progress')).toBeNull()
    expect(tabela.innerHTML).not.toMatch(
      /text-(ok|alerta|atencao)|bg-(ok|alerta|atencao)|border-(ok|alerta|atencao)/,
    )
    expect(within(cartaoEl).queryByText(/Meta:/)).toBeNull()
    expect(within(cartaoEl).queryByTestId(/status-meta/)).toBeNull()
  })

  it('mostra o selo de leitura relativa, sempre visível e em cor neutra', async () => {
    await cartao('AP-CAPACIDADE-PESSOA')
    for (const c of ['AP-CAPACIDADE-PESSOA', 'AP-CAPACIDADE-MENSAL']) {
      const selo = within(screen.getByTestId(`metrica-${c}`)).getByTestId('selo-leitura-relativa')
      expect(selo).toHaveTextContent('Comparação relativa; não é jornada total')
      expect(selo).toHaveTextContent('Pode passar de 100%')
      expect(selo.innerHTML).not.toMatch(/text-(ok|alerta|atencao)|bg-(ok|alerta|atencao)/)
    }
  })
})

describe('CA-10: pessoa sem de-para', () => {
  it('aparece como "Pessoa não identificada", em linha própria, com a explicação', async () => {
    await cartao('AP-MATRIZ')
    const tabela = screen.getByTestId('tabela-AP-MATRIZ-detalhe')
    const linhas = within(tabela)
      .getAllByRole('rowheader')
      .map((c) => c.textContent)
    expect(linhas.filter((l) => l === 'Pessoa não identificada')).toHaveLength(1)
    expect(linhas).toContain('Pessoa 7')
    expect(
      within(screen.getByTestId('metrica-AP-MATRIZ')).getByTestId('nota-nao-identificada'),
    ).toHaveTextContent(
      'Não foi possível ligar este apontamento a uma pessoa. Ele não é somado a outra.',
    )
  })
})

describe('CA-11: achados gerados dos dados', () => {
  it('monta a frase de cada código a partir dos valores, sem número escrito no código', async () => {
    const outra: RespostaApontamento = {
      ...RESPOSTA_FICTICIA,
      achados: [
        { codigo: 'nao-classificado-alto', valores: { pct: 41, n: 777 }, rotuloRef: null },
        { codigo: 'sem-comentario-alto', valores: { pct: 63, n: 555 }, rotuloRef: null },
        {
          codigo: 'concentracao-em-projeto',
          valores: { pct: 58 },
          rotuloRef: 'Iniciativa Apoio ao Fiscal',
        },
        { codigo: 'dias-atipicos', valores: { n: 7, limite: 12 }, rotuloRef: null },
        {
          codigo: 'utilizacao-mensal-variou',
          valores: { pctAnterior: 31, pct: 47, mesAnterior: '2026-07', mes: '2026-08' },
          rotuloRef: null,
        },
      ],
    }
    await cartao('AP-ACHADOS', URL_ABA, fonteCom(outra))
    const lista = screen.getByTestId('lista-achados')
    expect(lista).toHaveTextContent(
      "41% das horas apontadas (777 apontamentos) caíram em 'Não classificado'",
    )
    expect(lista).toHaveTextContent('63% dos apontamentos (555) estão sem comentário')
    expect(lista).toHaveTextContent(
      "O projeto 'Iniciativa Apoio ao Fiscal (fora dos quadros coletados)' concentra 58% das horas apontadas no período.",
    )
    expect(lista).toHaveTextContent(
      '7 dias com mais de 12 h apontadas por uma pessoa foram marcados como possível erro de apontamento.',
    )
    expect(lista).toHaveTextContent(
      'A utilização da equipe passou de 31% em jul/2026 para 47% em ago/2026.',
    )
    // nenhum achado cita pessoa
    expect(lista.textContent).not.toMatch(/Pessoa \d/)
  })

  it('código desconhecido e valores incompletos são descartados sem quebrar a seção', async () => {
    const r = {
      ...RESPOSTA_FICTICIA,
      achados: [
        { codigo: 'codigo-novo', valores: { x: 1 }, rotuloRef: null },
        { codigo: 'sem-comentario-alto', valores: { n: 3 }, rotuloRef: null },
        { codigo: 'dias-atipicos', valores: { n: 2, limite: 10 }, rotuloRef: null },
      ],
    } as unknown as RespostaApontamento
    await cartao('AP-ACHADOS', URL_ABA, fonteCom(r))
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0)
    const lista = screen.getByTestId('lista-achados')
    expect(within(lista).getAllByRole('listitem')).toHaveLength(1)
  })

  it('sem achados mostra a mensagem de lista vazia', async () => {
    await cartao('AP-ACHADOS', URL_ABA, fonteCom({ ...RESPOSTA_FICTICIA, achados: [] }))
    expect(screen.getByTestId('achados-vazio')).toHaveTextContent(
      'Nenhum destaque neste período com os filtros atuais.',
    )
  })

  it('o atalho do achado aplica o filtro correspondente na URL', async () => {
    const { roteador } = await cartao('AP-ACHADOS')
    const achados = screen.getByTestId('lista-achados')
    await userEvent.click(
      within(achados).getByRole('button', { name: 'Ver apontamentos não classificados' }),
    )
    await waitFor(() => expect(roteador.state.location.search).toBe('?subgrupo=nao-classificado'))
  })
})

describe('o4 e AP-8: exportação e nome real', () => {
  it('a aba não tem botão nem texto de exportação', async () => {
    await cartao('AP-KPIS')
    expect(screen.queryByRole('button', { name: /exportar/i })).toBeNull()
    expect(screen.queryByText(/exportar/i)).toBeNull()
  })

  it('com nomesReais mostra a faixa de aviso (status, ícone e texto) e não a linha de pessoas ocultas', async () => {
    await cartao('AP-KPIS', URL_ABA, fonteCom(respostaComNomesReais()))
    const aviso = screen.getByTestId('aviso-nome-real')
    expect(aviso).toHaveAttribute('role', 'status')
    expect(aviso).toHaveTextContent('Esta tela mostra nomes reais de pessoas.')
    expect(aviso.querySelector('svg')).not.toBeNull()
    expect(screen.queryByTestId('linha-nomes-ocultos')).toBeNull()
    expect(
      within(screen.getByTestId('tabela-AP-CAPACIDADE-PESSOA-detalhe')).getByText('Ana Exemplo'),
    ).toBeInTheDocument()
  })

  it('sem nomesReais não há faixa; uma linha explica o rótulo "Pessoa n"', async () => {
    await cartao('AP-KPIS')
    expect(screen.queryByTestId('aviso-nome-real')).toBeNull()
    expect(screen.getByTestId('linha-nomes-ocultos')).toHaveTextContent(
      "Pessoas aparecem como 'Pessoa 1', 'Pessoa 2'...",
    )
  })

  it('com nome real, o filtro grava só o pessoaRef na URL, nunca o nome', async () => {
    const { roteador } = await cartao('AP-KPIS', URL_ABA, fonteCom(respostaComNomesReais()))
    await userEvent.click(screen.getByRole('button', { name: /^Pessoa que apontou: Todas/ }))
    await userEvent.click(await screen.findByLabelText('Bruno Exemplo'))
    await waitFor(() => expect(roteador.state.location.search).toBe('?pessoa=p2'))
    expect(roteador.state.location.search).not.toMatch(/Bruno/)
  })
})

describe('qualidade e distribuição', () => {
  it('a nota diz que as flags não são excludentes e a soma passa de 100%', async () => {
    await cartao('AP-QUALIDADE')
    const el = screen.getByTestId('metrica-AP-QUALIDADE')
    expect(within(el).getByTestId('nota-AP-QUALIDADE')).toHaveTextContent(
      'Por isso as barras somam mais de 100%',
    )
    expect(within(el).getByTestId('leitura-AP-QUALIDADE')).toHaveTextContent(
      /\d+% dos apontamentos estão completos/,
    )
  })

  it('projeto fora dos quadros coletados leva o rótulo; story, frente e projeto nunca no mesmo gráfico', async () => {
    await cartao('AP-PROJETO')
    const tabela = screen.getByTestId('tabela-AP-PROJETO-detalhe')
    expect(
      within(tabela).getByText('Iniciativa Apoio ao Fiscal (Fora dos quadros coletados)'),
    ).toBeInTheDocument()
    expect(within(screen.getByTestId('metrica-AP-TIPO')).queryByText(/Iniciativa/)).toBeNull()
  })

  it('fonte única: todo cartão diz BusinessMap e nenhum cita o Acelerato', async () => {
    renderizar()
    for (const c of CODIGOS) {
      const el = await screen.findByTestId(`metrica-${c}`)
      expect(within(el).getByText('Fonte: BusinessMap')).toBeInTheDocument()
    }
    expect(screen.getByTestId('aba-apontamento').textContent).not.toMatch(/Fonte: Acelerato/)
  })

  it('o dado é da rota: nenhum cartão leva o selo "Dados fictícios"', async () => {
    renderizar()
    const kpis = await screen.findByTestId('metrica-AP-KPIS')
    expect(within(kpis).queryByTestId('selo-ficticio')).not.toBeInTheDocument()
  })

  it('o dicionário que mudou no período aparece como mudança de critério no cartão de subgrupo', async () => {
    await cartao('AP-SUBGRUPO')
    expect(
      within(screen.getByTestId('metrica-AP-SUBGRUPO')).getByTestId('aviso-criterio'),
    ).toHaveTextContent('Dicionário de subgrupos, revisão 2')
  })
})
