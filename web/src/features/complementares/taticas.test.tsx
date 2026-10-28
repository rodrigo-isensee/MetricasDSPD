import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { FiltrosDe, MetricaId, ResultadoDe } from '@metricas-dspd/contratos'
import { MockFonteMetricas } from '@/data'
import { COMUM, FILTROS_FLUXO, FonteFixa, JANELA, insuf } from '@/features/painel/testes/fonteFixa'
import { renderizarCartao } from '@/test/helpers'
import { CartaoT10, CartaoT11, CartaoT12, CartaoT13, CartaoT14 } from './taticas'

vi.setConfig({ testTimeout: 45000 })

/** Quando ligado, a base do mock sai com todo fornecedor de bloqueio grafado de 3 jeitos (B11-001). */
const grafias = vi.hoisted(() => ({ variar: false }))
vi.mock('@metricas-dspd/mock', async (importar) => {
  const real = await importar<typeof import('@metricas-dspd/mock')>()
  return {
    ...real,
    gerarBaseMock: (...args: Parameters<typeof real.gerarBaseMock>) => {
      const base = real.gerarBaseMock(...args)
      if (!grafias.variar) return base
      const variantes = ['TOTVS', 'Totvs', ' totvs ']
      let i = 0
      return {
        ...base,
        bm: {
          ...base.bm,
          bloqueios: base.bm.bloqueios.map((b) =>
            b.fornecedor === null ? b : { ...b, fornecedor: variantes[i++ % 3]! },
          ),
        },
      }
    },
  }
})

async function abrir(codigo: string, ui: React.ReactElement, fonte?: MockFonteMetricas) {
  renderizarCartao(ui, fonte ? { fonte } : {})
  const el = await screen.findByTestId(`metrica-${codigo}`)
  await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'))
  return el
}

const taxaOk = (k: number, n: number) => ({
  status: 'ok' as const,
  k,
  n,
  pct: Math.round((k / n) * 1000) / 10,
})
const taxaInsuf = (k: number, n: number) => ({
  status: 'insuficiente' as const,
  k,
  n,
  minimo: 20 as const,
})
const dur = (n: number, p50: number, p85: number) => ({
  status: 'ok' as const,
  n,
  valor: { p50, p85, p95: p85 + 2 },
  janela: JANELA,
})

class FonteErro extends MockFonteMetricas {
  constructor() {
    super({ latenciaMs: 0 })
  }
  override obter<K extends MetricaId>(_id: K, _f: FiltrosDe<K>): Promise<ResultadoDe<K>> {
    return Promise.reject(new Error('falha simulada'))
  }
}

/** Registra os filtros pedidos para cada métrica e devolve o DTO fixo. */
class FonteEspia extends FonteFixa {
  readonly pedidos: unknown[] = []
  override async obter<K extends MetricaId>(id: K, filtros: FiltrosDe<K>): Promise<ResultadoDe<K>> {
    this.pedidos.push(filtros)
    return super.obter(id, filtros)
  }
}

describe('T10 Tempo de terceiros', () => {
  const dto = (fornecedores: unknown[], total = 52) => ({
    ...COMUM,
    base: { ...COMUM.base, n: fornecedores.length ? 38 : 0, unidade: 'bloqueios' },
    fornecedores,
    totalDiasUteis: total,
  })

  it('uma linha por fornecedor como vem da API, com P50 e P85 só com 20 bloqueios ou mais', async () => {
    const fonte = new FonteFixa({
      T10: dto([
        { fornecedor: 'Fornecedor Beta', bloqueios: 30, diasUteis: 40, duracao: dur(30, 3, 6) },
        { fornecedor: 'Fornecedor Gama', bloqueios: 8, diasUteis: 12, duracao: insuf(8) },
      ]),
    })
    const el = await abrir('T10', <CartaoT10 filtros={FILTROS_FLUXO} />, fonte)
    expect(el).toHaveTextContent(
      'Os bloqueios por fornecedor somaram 52 dias úteis no período. Fornecedor Beta respondeu em até 6 dias úteis em 85% dos casos. Prazo contratado não informado.',
    )
    const linhas = within(within(el).getByTestId('tabela-T10')).getAllByRole('row').slice(1)
    expect(linhas).toHaveLength(2)
    expect(linhas[0]).toHaveTextContent(/Fornecedor Beta\s*30\s*40\s*P50 3 · P85 6 dias úteis/)
    expect(linhas[1]).toHaveTextContent(/Fornecedor Gama\s*8\s*12\s*— amostra insuficiente/)
    expect(el).toHaveTextContent('Fonte: BusinessMap')
    // Nesta fase não há prazo contratado nem "dentro/acima do contratado" (CA-36).
    expect(el.textContent).not.toMatch(/dentro do contratado|acima do contratado/i)
    expect(within(el).queryByRole('columnheader', { name: /prazo contratado/i })).toBeNull()
  })

  it('sem nenhum fornecedor com 20 bloqueios: a leitura não cita resposta em 85% dos casos', async () => {
    const fonte = new FonteFixa({
      T10: dto(
        [{ fornecedor: 'Fornecedor Gama', bloqueios: 8, diasUteis: 12, duracao: insuf(8) }],
        12,
      ),
    })
    const el = await abrir('T10', <CartaoT10 filtros={FILTROS_FLUXO} />, fonte)
    expect(within(el).getByTestId('leitura-T10')).toHaveTextContent(
      'Os bloqueios por fornecedor somaram 12 dias úteis no período. Prazo contratado não informado.',
    )
  })

  it('exibe o fornecedor exatamente como a API devolve (B11-001: a normalização é do back)', async () => {
    // A API já agrupou "Totvs", "TOTVS" e " totvs " numa linha só, com a grafia mais frequente.
    const fonte = new FonteFixa({
      T10: dto([{ fornecedor: 'Totvs', bloqueios: 41, diasUteis: 70, duracao: dur(41, 4, 9) }], 70),
    })
    const el = await abrir('T10', <CartaoT10 filtros={FILTROS_FLUXO} />, fonte)
    const linhas = within(within(el).getByTestId('tabela-T10')).getAllByRole('row').slice(1)
    expect(linhas).toHaveLength(1)
    expect(linhas[0]).toHaveTextContent(/^Totvs\s*41/)
    expect(el.textContent).not.toMatch(/TOTVS|totvs /)
  })

  it('B11-001 pelo caminho real: o mock com "TOTVS", "Totvs" e " totvs " mostra uma linha só', async () => {
    grafias.variar = true
    try {
      // Fonte nova: a base é gerada (e memoizada) por instância, já com as grafias trocadas.
      const el = await abrir(
        'T10',
        <CartaoT10 filtros={FILTROS_FLUXO} />,
        new MockFonteMetricas({ latenciaMs: 0 }),
      )
      const nomes = within(within(el).getByTestId('tabela-T10')).getAllByRole('rowheader')
      expect(nomes).toHaveLength(1)
      expect(nomes[0]!.textContent).toMatch(/^totvs$/i)
      expect(nomes[0]!.textContent).toBe(nomes[0]!.textContent.trim())
    } finally {
      grafias.variar = false
    }
  })

  it('sem fornecedor no período: mensagem própria e "Prazo contratado não informado"', async () => {
    const fonte = new FonteFixa({ T10: dto([], 0) })
    const el = await abrir('T10', <CartaoT10 filtros={FILTROS_FLUXO} />, fonte)
    expect(within(el).getByTestId('t10-sem-fornecedor')).toHaveTextContent(
      'Nenhum bloqueio por fornecedor no período.',
    )
    expect(el).toHaveTextContent('Prazo contratado não informado')
  })

  it('com o mock: fornecedores em ordem alfabética, sem selo de melhor ou pior', async () => {
    const el = await abrir('T10', <CartaoT10 filtros={FILTROS_FLUXO} />)
    const nomes = within(within(el).getByTestId('tabela-T10')).getAllByRole('rowheader')
    const lista = nomes.map((n) => n.textContent)
    expect(lista.length).toBeGreaterThan(0)
    expect(lista).toEqual([...lista].sort((a, b) => a.localeCompare(b, 'pt-BR')))
  })

  it('falha da API: botão para tentar de novo', async () => {
    renderizarCartao(<CartaoT10 filtros={FILTROS_FLUXO} />, { fonte: new FonteErro() })
    expect(await screen.findByRole('button', { name: /tentar de novo/i })).toBeInTheDocument()
  })
})

describe('T11 Sazonalidade da chegada', () => {
  const meses = (valores: (number | null)[], andamento = -1) =>
    valores.map((entradas, i) => ({ mes: i + 1, entradas, emAndamento: i === andamento }))
  const dto = (curto: boolean) => ({
    ...COMUM,
    anos: [
      { ano: 2025, meses: meses([30, 12, 14, 9, 10, 11, 38, 12, 9, 10, 11, 8]) },
      { ano: 2026, meses: meses([33, 13, 0, 10, 11, 12, 41, 13, 9, 7, null, null], 9) },
    ],
    marcacoes: [],
    mesesComDado: curto ? 14 : 24,
    mediaMensal: 14.5,
    historicoCurto: curto,
  })

  it('mapa mês × ano com o número em cada célula, o mês corrente "em andamento" e a média só como referência', async () => {
    const fonte = new FonteFixa({ T11: dto(false) })
    const el = await abrir('T11', <CartaoT11 filtros={FILTROS_FLUXO} />, fonte)
    const mapa = within(el).getByTestId('tabela-T11')
    const jul2026 = within(mapa).getByRole('row', { name: /2026/ })
    expect(jul2026).toHaveTextContent(/41/)
    expect(within(mapa).getAllByText('em andamento')).toHaveLength(1)
    expect(within(mapa).getAllByLabelText(/sem dado/)).toHaveLength(2)
    expect(within(el).getByTestId('leitura-T11')).toHaveTextContent(
      'Média mensal de referência: 14,5 pedidos por mês, em 24 meses fechados. O mapa mostra todos os meses.',
    )
    expect(within(el).queryByTestId('t11-historico-curto')).not.toBeInTheDocument()
  })

  it('com o tipo já escolhido no filtro global, mostra só o mapa, sem abas de tipo', async () => {
    const fonte = new FonteFixa({ T11: dto(false) })
    const el = await abrir(
      'T11',
      <CartaoT11 filtros={{ ...FILTROS_FLUXO, tipo: ['Melhoria'] }} />,
      fonte,
    )
    expect(within(el).getByTestId('tabela-T11')).toBeInTheDocument()
    expect(within(el).queryByRole('tab')).not.toBeInTheDocument()
  })

  it('com menos de dois anos de histórico, avisa que não dá para separar padrão de acaso', async () => {
    const fonte = new FonteFixa({ T11: dto(true) })
    const el = await abrir('T11', <CartaoT11 filtros={FILTROS_FLUXO} />, fonte)
    expect(within(el).getByTestId('t11-historico-curto')).toHaveTextContent(
      'Com menos de dois anos, ainda não dá para separar padrão de acaso.',
    )
  })

  it('um tipo por vez: a aba refaz a consulta com o tipo escolhido; "Todos os tipos" é o padrão', async () => {
    const fonte = new FonteEspia({ T11: dto(false) })
    const el = await abrir('T11', <CartaoT11 filtros={FILTROS_FLUXO} />, fonte)
    const abas = within(el).getAllByRole('tab')
    expect(abas[0]).toHaveTextContent('Todos os tipos')
    expect(abas[0]).toHaveAttribute('aria-selected', 'true')
    await userEvent.setup().click(within(el).getByRole('tab', { name: 'Melhoria' }))
    await waitFor(() =>
      expect(fonte.pedidos.some((p) => (p as { tipo: string[] }).tipo[0] === 'Melhoria')).toBe(
        true,
      ),
    )
    expect(within(el).getByRole('tab', { name: 'Melhoria' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })
})

describe('T12 Qualidade da entrada por área', () => {
  const dto = () => ({
    ...COMUM,
    total: taxaOk(40, 220),
    areas: [
      { area: 'Financeiro', taxa: taxaOk(11, 34) },
      { area: 'Comercial', taxa: taxaOk(8, 28) },
      { area: 'Jurídico', taxa: taxaInsuf(3, 9) },
    ],
  })

  it('lista por área na ordem de volume da API, com "k de n" e percentual só a partir de 20', async () => {
    const fonte = new FonteFixa({ T12: dto() })
    const el = await abrir('T12', <CartaoT12 filtros={FILTROS_FLUXO} />, fonte)
    expect(within(el).getByTestId('leitura-T12')).toHaveTextContent(
      '18% das demandas do período precisaram de ida e volta antes de começar. Na área Financeiro, 11 de 34.',
    )
    const itens = within(within(el).getByTestId('t12-areas')).getAllByRole('listitem')
    expect(itens.map((i) => i.querySelector('span')?.textContent)).toEqual([
      'Financeiro',
      'Comercial',
      'Jurídico',
    ])
    expect(itens[0]).toHaveTextContent('11 de 34 com ida e volta (32,4%)')
    expect(itens[2]).toHaveTextContent(
      '3 de 9 com ida e volta (percentual não publicado, menos de 20)',
    )
    expect(itens[2]!.textContent).not.toMatch(/\d%/)
    expect(el).toHaveTextContent('Não é nota da área')
  })

  it('total abaixo de 20 e sem áreas: só "k de n", sem percentual', async () => {
    const fonte = new FonteFixa({ T12: { ...dto(), total: taxaInsuf(6, 15), areas: [] } })
    const el = await abrir('T12', <CartaoT12 filtros={FILTROS_FLUXO} />, fonte)
    const leitura = within(el).getByTestId('leitura-T12')
    expect(leitura).toHaveTextContent(
      '6 de 15 demandas do período precisaram de ida e volta antes de começar.',
    )
    expect(leitura.textContent).not.toMatch(/%/)
  })

  it('com o mock, publica o cartão com a tabela equivalente', async () => {
    const el = await abrir('T12', <CartaoT12 filtros={FILTROS_FLUXO} />)
    expect(
      within(el).getByRole('table', { name: /ida e volta por área solicitante/ }),
    ).toBeVisible()
  })

  it('falha da API: botão para tentar de novo', async () => {
    renderizarCartao(<CartaoT12 filtros={FILTROS_FLUXO} />, { fonte: new FonteErro() })
    expect(await screen.findByRole('button', { name: /tentar de novo/i })).toBeInTheDocument()
  })
})

describe('T13 Dependências entre quadros', () => {
  const bloco = (
    g: 'story' | 'frente',
    entregas: unknown,
    comparacoes: unknown[],
    semDado = 0,
  ) => ({
    granularidade: g,
    entregas,
    semDado,
    comparacoes,
  })
  const dto = () => ({
    ...COMUM,
    segmentoPor: 'tipo',
    porGranularidade: [
      bloco(
        'story',
        taxaOk(31, 88),
        [
          {
            tipo: 'Melhoria',
            com: dur(24, 9, 21),
            sem: dur(40, 4, 9),
            grupoAbaixoDoMinimo: null,
          },
          {
            tipo: 'Incidente',
            com: insuf(7),
            sem: dur(25, 2, 5),
            grupoAbaixoDoMinimo: 'com',
          },
        ],
        3,
      ),
      bloco('frente', taxaInsuf(4, 11), []),
    ],
  })

  it('mostra o destaque, o par com × sem do mesmo tipo e o aviso de vínculos sem quadro', async () => {
    const fonte = new FonteFixa({ T13: dto() })
    const el = await abrir('T13', <CartaoT13 filtros={FILTROS_FLUXO} />, fonte)
    expect(within(el).getByTestId('t13-destaque')).toHaveTextContent(
      '31 de 88 entregas (35%) dependeram de outro quadro',
    )
    expect(within(el).getByTestId('leitura-T13')).toHaveTextContent(
      '35% das demandas entregues dependeram de trabalho de outro quadro. Em Melhoria, essas tiveram P85 de 21 dias úteis, contra 9 das que não dependeram.',
    )
    expect(within(el).getByTestId('t13-sem-dado')).toHaveTextContent(/3 entregas com o quadro/)
    const par = within(el).getByTestId('tabela-T13')
    expect(within(par).getAllByRole('row')).toHaveLength(3)
    expect(el).toHaveTextContent('Dados fictícios')
  })

  it('grupo abaixo de 20 no tipo: não exibe a comparação e diz qual grupo falta (CA-6)', async () => {
    const fonte = new FonteFixa({ T13: dto() })
    const el = await abrir('T13', <CartaoT13 filtros={FILTROS_FLUXO} />, fonte)
    await userEvent.setup().click(within(el).getByRole('tab', { name: 'Incidente' }))
    expect(within(el).getByTestId('t13-par-insuficiente')).toHaveTextContent(
      'Comparação não exibida em Incidente: o grupo com dependência tem menos de 20 itens no tipo.',
    )
    expect(within(el).queryByTestId('tabela-T13')).not.toBeInTheDocument()
  })

  it('uma granularidade por vez: trocar para Frentes substitui o bloco, e abaixo de 20 só "k de n"', async () => {
    const fonte = new FonteFixa({ T13: dto() })
    const el = await abrir('T13', <CartaoT13 filtros={FILTROS_FLUXO} />, fonte)
    await userEvent.setup().click(within(el).getByRole('tab', { name: 'Frentes' }))
    expect(within(el).getByTestId('t13-destaque')).toHaveTextContent(
      '4 de 11 entregas dependeram de outro quadro (percentual não publicado, menos de 20)',
    )
    expect(within(el).queryByText(/31 de 88/)).not.toBeInTheDocument()
    // L2T-001: o selo usa o n das frentes (11), nunca o das demandas (88).
    expect(within(el).getByTestId('base-T13')).toHaveTextContent(
      'Amostra insuficiente: 11 de 20 itens mínimos',
    )
    expect(within(el).getByTestId('base-T13')).not.toHaveTextContent(/88/)
    expect(within(el).getByTestId('t13-sem-par')).toBeInTheDocument()
  })

  it('os dois grupos abaixo de 20: diz que ambos faltam; P85 decimal sem dependência aparece com uma casa', async () => {
    const d = dto()
    d.porGranularidade[0]!.comparacoes = [
      { tipo: 'Melhoria', com: dur(24, 9, 21), sem: dur(40, 4, 9.5), grupoAbaixoDoMinimo: null },
      { tipo: 'Defeito', com: insuf(3), sem: insuf(5), grupoAbaixoDoMinimo: null },
    ]
    const fonte = new FonteFixa({ T13: d })
    const el = await abrir('T13', <CartaoT13 filtros={FILTROS_FLUXO} />, fonte)
    expect(within(el).getByTestId('leitura-T13')).toHaveTextContent('contra 9,5 das que não')
    await userEvent.setup().click(within(el).getByRole('tab', { name: 'Defeito' }))
    expect(within(el).getByTestId('t13-par-insuficiente')).toHaveTextContent(
      'os dois grupos, com e sem dependência, têm menos de 20 itens no tipo.',
    )
  })

  it('só uma granularidade na resposta: sem seletor', async () => {
    const d = dto()
    d.porGranularidade = [d.porGranularidade[0]!]
    const el = await abrir('T13', <CartaoT13 filtros={FILTROS_FLUXO} />, new FonteFixa({ T13: d }))
    expect(within(el).queryByRole('tab', { name: 'Frentes' })).not.toBeInTheDocument()
    expect(within(el).getByTestId('t13-destaque')).toBeInTheDocument()
  })

  it('resposta sem nenhum bloco de granularidade: o cartão não quebra', async () => {
    const d = { ...dto(), porGranularidade: [] }
    const el = await abrir('T13', <CartaoT13 filtros={FILTROS_FLUXO} />, new FonteFixa({ T13: d }))
    expect(within(el).queryByTestId('t13-destaque')).not.toBeInTheDocument()
  })

  it('falha da API: botão para tentar de novo', async () => {
    renderizarCartao(<CartaoT13 filtros={FILTROS_FLUXO} />, { fonte: new FonteErro() })
    expect(await screen.findByRole('button', { name: /tentar de novo/i })).toBeInTheDocument()
  })
})

describe('T14 Participação do meu time no projeto', () => {
  const projeto = (
    codigo: string,
    total: number,
    meu: ReturnType<typeof taxaOk> | ReturnType<typeof taxaInsuf>,
    outros: number | null,
    semTime: number,
  ) => ({
    projetoId: `id-${codigo}`,
    codigo,
    titulo: `Projeto ${codigo}`,
    total,
    meuTime: meu,
    outrosTimes: outros,
    semTime,
  })
  const dto = (
    story: unknown[],
    totalStory: unknown = taxaOk(61, 173),
    baseN = 173,
    semEquipe = false,
  ) => ({
    ...COMUM,
    base: { ...COMUM.base, n: baseN, unidade: 'demandas com time informado' },
    equipe: semEquipe ? null : 'Time A',
    semEquipe,
    porGranularidade: semEquipe
      ? []
      : [
          { granularidade: 'story', total: totalStory, projetos: story },
          {
            granularidade: 'frente',
            total: taxaInsuf(2, 9),
            projetos: [projeto('PRJ-090', 11, taxaInsuf(2, 9), 7, 2)],
          },
        ],
  })
  const visiveis = [
    projeto('PRJ-010', 120, taxaOk(57, 112), 55, 8),
    projeto('PRJ-031', 40, taxaOk(4, 34), 30, 6),
    projeto('PRJ-044', 15, taxaInsuf(5, 12), 7, 3),
  ]
  const filtros = { ...FILTROS_FLUXO, equipe: ['time-a'] }

  it('com os outros times publicáveis: barra, "k de n (p%) meu time", destaque e selo (CA-27, CA-34)', async () => {
    const fonte = new FonteFixa({ T14: dto(visiveis) })
    const el = await abrir('T14', <CartaoT14 filtros={filtros} />, fonte)
    expect(within(el).getByTestId('leitura-T14')).toHaveTextContent(
      '61 de 173 demandas com time informado (35%) são do meu time. No PRJ-031, 4 de 34 (12%) são do meu time.',
    )
    expect(within(el).getByTestId('t14-selo')).toHaveTextContent(
      'Só mostra meu time e os outros somados. Não compara times.',
    )
    const projetos = within(within(el).getByTestId('t14-projetos')).getAllByRole('listitem')
    // Ordem da API (total de demandas do projeto): a tela não reordena pela participação.
    expect(projetos.map((p) => p.querySelector('span')?.textContent)).toEqual([
      'PRJ-010 Projeto PRJ-010',
      'PRJ-031 Projeto PRJ-031',
      'PRJ-044 Projeto PRJ-044',
    ])
    expect(projetos[0]).toHaveTextContent('57 de 112 (50,9%) meu time · 8 sem time informado')
    expect(projetos[2]).toHaveTextContent(
      '5 de 12 meu time (percentual não publicado, menos de 20)',
    )
    expect(within(el).queryByTestId('t14-oculto')).not.toBeInTheDocument()
    expect(within(el).getByTestId('base-T14')).toBeInTheDocument()
  })

  it('R-1 = B e T14-M1 = B: "outros times" oculto mostra só a fatia do meu time, sem n, sem total e sem percentual', async () => {
    // Números escolhidos para não coincidir com nenhum outro texto da tela.
    const oculto = projeto('PRJ-077', 47, taxaOk(5, 41), null, 6)
    const fonte = new FonteFixa({
      T14: dto([visiveis[1]!, oculto], taxaOk(9, 213), 213),
    })
    const el = await abrir('T14', <CartaoT14 filtros={filtros} />, fonte)
    expect(within(el).getByTestId('t14-fatia-PRJ-077')).toHaveTextContent('Meu time: 5 demandas')
    expect(within(el).getByTestId('t14-oculto')).toBeInTheDocument()
    // O total do projeto e o total do recorte não aparecem em lugar nenhum: nem na leitura, nem na base, nem na tabela.
    expect(el.textContent).not.toMatch(/\b47\b/)
    expect(el.textContent).not.toMatch(/\b41\b/)
    expect(el.textContent).not.toMatch(/\b213\b/)
    expect(within(el).queryByTestId('base-T14')).not.toBeInTheDocument()
    expect(within(el).queryByTestId('leitura-T14')).not.toBeInTheDocument()
    const linha = within(within(el).getByTestId('tabela-T14')).getByRole('row', {
      name: /PRJ-077/,
    })
    expect(linha).toHaveTextContent(
      /PRJ-077 Projeto PRJ-077\s*5\s*não exibido\s*não exibido\s*não exibido/,
    )
    expect(linha.textContent).not.toMatch(/%/)
    // O projeto com os outros times publicáveis segue com a barra completa.
    expect(el).toHaveTextContent('4 de 34 (11,8%) meu time')
  })

  it('L2T-002: "Meu time: k" usa o plural certo (1 demanda, 1 frente, 2 demandas) sem n nem total', async () => {
    const um = projeto('PRJ-081', 53, taxaOk(1, 47), null, 6)
    const dois = projeto('PRJ-082', 59, taxaOk(2, 43), null, 6)
    const d = dto([um, dois])
    d.porGranularidade[1] = {
      granularidade: 'frente',
      total: taxaOk(1, 83),
      projetos: [projeto('PRJ-091', 83, taxaOk(1, 79), null, 4)],
    }
    const el = await abrir('T14', <CartaoT14 filtros={filtros} />, new FonteFixa({ T14: d }))
    const u = within(el).getByTestId('t14-fatia-PRJ-081')
    expect(u.textContent).toBe('Meu time: 1 demanda')
    expect(within(el).getByTestId('t14-fatia-PRJ-082').textContent).toBe('Meu time: 2 demandas')
    expect(el.textContent).not.toMatch(/\b53\b|\b47\b|\b59\b|\b43\b/)
    await userEvent.setup().click(within(el).getByRole('tab', { name: 'Frentes' }))
    expect(within(el).getByTestId('t14-fatia-PRJ-091').textContent).toBe('Meu time: 1 frente')
  })

  it('o total também some quando o projeto oculto está só na outra granularidade (frentes)', async () => {
    const d = dto(visiveis)
    d.porGranularidade[1] = {
      granularidade: 'frente',
      total: taxaOk(8, 83),
      projetos: [projeto('PRJ-090', 83, taxaOk(8, 79), null, 4)],
    }
    const fonte = new FonteFixa({ T14: d })
    const el = await abrir('T14', <CartaoT14 filtros={filtros} />, fonte)
    // A base (n total e o complemento de frentes) é uma só: oculta em ambas as granularidades.
    expect(within(el).queryByTestId('base-T14')).not.toBeInTheDocument()
    expect(el.textContent).not.toMatch(/\b83\b|\b79\b/)
    await userEvent.setup().click(within(el).getByRole('tab', { name: 'Frentes' }))
    expect(within(el).getByTestId('t14-fatia-PRJ-090')).toHaveTextContent('Meu time: 8 frentes')
    expect(el.textContent).not.toMatch(/\b83\b|\b79\b/)
    expect(within(el).queryByTestId('leitura-T14')).not.toBeInTheDocument()
  })

  it('sem projeto em andamento: avisa em vez de desenhar uma lista vazia', async () => {
    const fonte = new FonteFixa({ T14: dto([], taxaInsuf(0, 0), 5) })
    const el = await abrir('T14', <CartaoT14 filtros={filtros} />, fonte)
    expect(within(el).getByTestId('t14-sem-projetos')).toBeInTheDocument()
  })

  it('só uma granularidade na resposta: sem seletor', async () => {
    const d = dto(visiveis)
    d.porGranularidade = [d.porGranularidade[0]!]
    const el = await abrir('T14', <CartaoT14 filtros={filtros} />, new FonteFixa({ T14: d }))
    expect(within(el).queryByRole('tab', { name: 'Frentes' })).not.toBeInTheDocument()
  })

  it('sem equipe no filtro: orienta a escolher uma e não mostra valor (CA-28)', async () => {
    const fonte = new FonteFixa({
      T14: {
        ...dto([], taxaInsuf(0, 0), 0, true),
        base: { ...COMUM.base, n: 0, unidade: 'demandas' },
      },
    })
    const el = await abrir('T14', <CartaoT14 filtros={FILTROS_FLUXO} />, fonte)
    expect(within(el).getByTestId('t14-sem-equipe')).toHaveTextContent(
      'Escolha uma equipe para ver a participação do meu time.',
    )
    expect(within(el).queryByTestId('t14-projetos')).not.toBeInTheDocument()
  })

  it('uma granularidade por vez: demandas por padrão e troca para frentes', async () => {
    const fonte = new FonteFixa({ T14: dto(visiveis) })
    const el = await abrir('T14', <CartaoT14 filtros={filtros} />, fonte)
    expect(within(el).getByRole('tab', { name: 'Demandas' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await userEvent.setup().click(within(el).getByRole('tab', { name: 'Frentes' }))
    const lista = within(el).getByTestId('t14-projetos')
    expect(within(lista).getByText('PRJ-090 Projeto PRJ-090')).toBeInTheDocument()
    expect(within(lista).queryByText('PRJ-010 Projeto PRJ-010')).not.toBeInTheDocument()
  })

  it('nunca nomeia nem lista outro time: a tabela só tem "Outros times (somados)"', async () => {
    const fonte = new FonteFixa({ T14: dto(visiveis) })
    const el = await abrir('T14', <CartaoT14 filtros={filtros} />, fonte)
    const cabecalhos = within(within(el).getByTestId('tabela-T14'))
      .getAllByRole('columnheader')
      .map((c) => c.textContent)
    expect(cabecalhos).toEqual([
      'Projeto',
      'Meu time',
      'Outros times (somados)',
      'Sem time informado',
      'Participação do meu time',
    ])
  })

  it('falha da API: botão para tentar de novo', async () => {
    renderizarCartao(<CartaoT14 filtros={filtros} />, { fonte: new FonteErro() })
    expect(await screen.findByRole('button', { name: /tentar de novo/i })).toBeInTheDocument()
  })
})
