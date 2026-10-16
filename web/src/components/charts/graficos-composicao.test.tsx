import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'
import { ModoTabelaContext } from '../ui'
import { definirFilaImediata } from './filaDeGraficos'
import { AreaEmpilhada, Barras, Dispersao, Histograma, MapaCalor, ParEspera, SerieLinhas } from '.'

// Estes testes olham o desenho do gráfico; a fila (filaDeGraficos.test.tsx) tem teste próprio.
beforeAll(() => definirFilaImediata(true))

/** Passa o mouse sobre o gráfico: o Recharts mostra o tooltip (que repete os valores em texto). */
async function passar(container: HTMLElement) {
  const alvo = container.querySelector('.recharts-wrapper') as HTMLElement
  fireEvent.mouseMove(alvo, { clientX: 200, clientY: 100 })
  await act(async () => {
    await new Promise((r) => setTimeout(r, 50))
  })
  return container.querySelector('.recharts-tooltip-wrapper')?.textContent ?? ''
}

const tabela = (ui: React.ReactElement, codigo = 'X') =>
  render(
    <ModoTabelaContext.Provider
      value={{ modo: 'tabela', idLeitura: 'l', legenda: 'Cartão', codigo }}
    >
      {ui}
    </ModoTabelaContext.Provider>,
  )

describe('Barras', () => {
  const categorias = [
    { rotulo: 'Sem 1', valores: { a: 3, b: 1, pct: 10 } },
    { rotulo: 'Sem 2', emAndamento: true, valores: { a: 5, b: null, pct: null } },
  ]
  const series = [
    { chave: 'a', rotulo: 'Concluídos' },
    { chave: 'b', rotulo: 'Bloqueados' },
  ]

  it('vertical com linha em eixo à direita, faixa, referências e período em andamento', async () => {
    const { container } = render(
      <Barras
        categorias={categorias}
        series={series}
        faixa={{ min: 2, max: 4, rotulo: 'Faixa histórica' }}
        referencias={[
          { valor: 3, rotulo: 'Mediana' },
          { valor: 4, rotulo: 'Meta', traco: 'pontilhado' },
          { valor: 2, rotulo: 'Piso', traco: 'tracejado' },
        ]}
        linha={{ chave: 'pct', rotulo: '% vencidos', unidade: '%', formatar: (v) => `${v}%` }}
        descricao="Vazão"
        espaco={4}
        extra={<p>nota extra</p>}
      />,
    )
    const legenda = screen.getByRole('list', { name: 'Legenda' })
    for (const t of [
      'Concluídos',
      'Bloqueados',
      'Faixa histórica',
      'Mediana',
      'Meta',
      'Piso',
      '% vencidos',
      'Em andamento (fora das estatísticas)',
    ])
      expect(within(legenda).getByText(t)).toBeInTheDocument()
    expect(screen.getByText('nota extra')).toBeInTheDocument()
    const texto = await passar(container)
    expect(texto).toContain('Concluídos')
  })

  it('tooltip da linha usa o formatador próprio da linha', async () => {
    const { container } = render(
      <Barras
        categorias={[{ rotulo: 'A', valores: { a: 3, pct: 40 } }]}
        series={[{ chave: 'a', rotulo: 'Itens' }]}
        linha={{ chave: 'pct', rotulo: 'Vencidos', formatar: (v) => `${v} por cento` }}
        descricao="x"
      />,
    )
    expect(await passar(container)).toContain('40 por cento')
  })

  it('linha sem formatador próprio: eixo e tooltip usam o formatador das barras', async () => {
    const { container } = render(
      <Barras
        categorias={[{ rotulo: 'A', valores: { a: 3, pct: 40 } }]}
        series={[{ chave: 'a', rotulo: 'Itens' }]}
        linha={{ chave: 'pct', rotulo: 'Vencidos' }}
        formatar={(v) => `${v} u`}
        descricao="x"
      />,
    )
    expect(container.textContent).toContain('40 u')
    expect(await passar(container)).toContain('Vencidos: 40 u')
  })

  it('tabela equivalente: "—" onde não há dado e a linha com a unidade própria', () => {
    tabela(
      <Barras
        categorias={categorias}
        series={series}
        linha={{ chave: 'pct', rotulo: '% vencidos', unidade: '%' }}
        unidade="itens"
        descricao="Vazão"
      />,
    )
    const t = screen.getByRole('table')
    expect(within(t).getByRole('columnheader', { name: '% vencidos (%)' })).toBeInTheDocument()
    const linha2 = within(t).getByRole('row', { name: /Sem 2 \(em andamento\)/ })
    expect(
      within(linha2)
        .getAllByRole('cell')
        .map((c) => c.textContent),
    ).toEqual(['5', '—', '—'])
  })

  it('linha sem unidade e sem formatador próprio usa o formatador das barras', () => {
    tabela(
      <Barras
        categorias={[{ rotulo: 'A', valores: { a: 3, pct: 7 } }]}
        series={[{ chave: 'a', rotulo: 'Itens' }]}
        linha={{ chave: 'pct', rotulo: 'Taxa' }}
        formatar={(v) => `${v}!`}
        descricao="x"
      />,
    )
    expect(screen.getByRole('columnheader', { name: 'Taxa' })).toBeInTheDocument()
    expect(screen.getByText('7!')).toBeInTheDocument()
  })

  it('horizontal: faixa e referências no eixo dos valores, sem a linha; rótulos longos truncados', () => {
    const { container } = render(
      <Barras
        categorias={[{ rotulo: 'Um rótulo de categoria bem comprido demais', valores: { a: 3 } }]}
        series={[{ chave: 'a', rotulo: 'Itens' }]}
        orientacao="horizontal"
        faixa={{ min: 1, max: 2, rotulo: 'Faixa' }}
        referencias={[{ valor: 2, rotulo: 'Meta' }]}
        linha={{ chave: 'pct', rotulo: 'Ignorada' }}
        larguraRotulos={80}
        semLegenda
        descricao="x"
      />,
    )
    expect(screen.queryByRole('list', { name: 'Legenda' })).toBeNull()
    expect(container.querySelector('.recharts-line')).toBeNull()
    expect(container.textContent).toContain('…')
  })

  it('na tabela sem código do cartão, a tabela não recebe testid', () => {
    render(
      <ModoTabelaContext.Provider value={{ modo: 'tabela' }}>
        <Barras
          categorias={[{ rotulo: 'A', valores: { a: 1 } }]}
          series={[{ chave: 'a', rotulo: 'A' }]}
          descricao="x"
        />
      </ModoTabelaContext.Provider>,
    )
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('modo percentual (vertical e horizontal); só uma série sem padrão fica lisa', () => {
    const { container, rerender } = render(
      <Barras
        categorias={[{ rotulo: 'A', valores: { a: 1, b: 3 } }]}
        series={series}
        modo="percentual"
        descricao="x"
      />,
    )
    expect(container.textContent).toContain('%')
    rerender(
      <Barras
        categorias={[{ rotulo: 'A', valores: { a: 1, b: 3 } }]}
        series={[
          { chave: 'a', rotulo: 'Concluídos', padrao: 'contorno' },
          { chave: 'b', rotulo: 'B' },
        ]}
        modo="percentual"
        orientacao="horizontal"
        descricao="x"
      />,
    )
    expect(screen.getByRole('list', { name: 'Legenda' })).toBeInTheDocument()
  })
})

describe('Histograma', () => {
  it('uma série só: sem legenda; com classes empilhadas: uma série por classe, zero onde falta', () => {
    const { rerender } = render(
      <Histograma
        faixas={[
          { rotulo: '0-2', min: 0, max: 2, contagem: 4 },
          { rotulo: '3-5', min: 3, max: 5, contagem: 2 },
        ]}
        unidadeX="dias úteis"
        descricao="Tempo de ciclo"
      />,
    )
    expect(screen.queryByRole('list', { name: 'Legenda' })).toBeNull()
    rerender(
      <Histograma
        faixas={[
          {
            rotulo: '0-2',
            min: 0,
            max: 2,
            contagem: 4,
            empilhado: [{ classe: 'Melhoria', contagem: 4 }],
          },
          {
            rotulo: '3-5',
            min: 3,
            max: 5,
            contagem: 2,
            empilhado: [{ classe: 'Bug', contagem: 2 }],
          },
        ]}
        unidadeX="dias úteis"
        unidadeY="frentes"
        descricao="Tempo de ciclo"
      />,
    )
    const legenda = screen.getByRole('list', { name: 'Legenda' })
    expect(within(legenda).getByText('Melhoria')).toBeInTheDocument()
    expect(within(legenda).getByText('Bug')).toBeInTheDocument()
  })

  it('faixa sem a lista empilhada num gráfico empilhado conta zero', () => {
    tabela(
      <Histograma
        faixas={[
          {
            rotulo: '0-2',
            min: 0,
            max: 2,
            contagem: 4,
            empilhado: [{ classe: 'Melhoria', contagem: 4 }],
          },
          { rotulo: '3-5', min: 3, max: 5, contagem: 0 },
        ]}
        unidadeX="dias"
        descricao="Idade"
      />,
    )
    const linha = screen.getByRole('row', { name: /3-5/ })
    expect(within(linha).getByRole('cell')).toHaveTextContent('0')
  })
})

describe('SerieLinhas', () => {
  const pontos = [
    { x: '2026-06', valores: { p50: 3, p85: 6, wip: 4 } },
    { x: '2026-07', valores: { p50: null, p85: 5, wip: 6 } },
    { x: '2026-08', emAndamento: true, valores: { p50: 4, p85: 7, wip: 5 } },
  ]
  const series = [
    { chave: 'p50', rotulo: 'P50' },
    { chave: 'p85', rotulo: 'P85', traco: 'tracejado' as const },
    {
      chave: 'wip',
      rotulo: 'WIP',
      traco: 'pontilhado' as const,
      eixoDireito: true,
      cor: 4 as const,
    },
  ]

  it('várias linhas, eixo à direita, faixas (com e sem padrão), marcações e tooltip', async () => {
    const { container } = render(
      <SerieLinhas
        pontos={pontos}
        series={series}
        faixas={[
          { de: 'p50', ate: 'p85', rotulo: 'Entre P50 e P85' },
          { de: 'p50', ate: 'p85', rotulo: 'Com padrão', padrao: 'pontos' },
          { de: 'p50', ate: 'wip', rotulo: 'Acima', padrao: 'hachura', cor: 2, somenteAcima: true },
        ]}
        marcacoes={[
          { id: 'm1', data: '2026-07-15', descricao: 'Novo critério' },
          { id: 'm2', data: '2027-01-01', descricao: 'Futuro' },
        ]}
        formatarX={(x) => `m${x.slice(5)}`}
        unidade="dias"
        unidadeDireita="itens"
        descricao="Ciclo"
      />,
    )
    const marcas = screen.getAllByTestId('marcador-criterio')
    expect(marcas).toHaveLength(1)
    expect(marcas[0]).toHaveTextContent('Mudança de critério em 15/07/2026: Novo critério')
    const legenda = screen.getByRole('list', { name: 'Legenda' })
    expect(within(legenda).getByText('Entre P50 e P85')).toBeInTheDocument()
    expect(within(legenda).getByText('Acima')).toBeInTheDocument()
    expect(container.textContent).toContain('itens')
    expect(await passar(container)).toContain('P85')
  })

  it('faixa só com cor (sem padrão) usa a cor informada', () => {
    const { container } = render(
      <SerieLinhas
        pontos={pontos}
        series={[{ chave: 'p50', rotulo: 'P50' }]}
        faixas={[{ de: 'p50', ate: 'p85', rotulo: 'Faixa', cor: 5 }]}
        formatarX={(x) => x}
        unidade="dias"
        descricao="Ciclo"
      />,
    )
    expect(container.querySelector('.recharts-area-area')?.getAttribute('fill')).toBe(
      'var(--serie-5)',
    )
  })

  it('sem a direita, sem faixas e sem marcações: só as linhas', () => {
    const { container } = render(
      <SerieLinhas
        pontos={pontos}
        series={[{ chave: 'p50', rotulo: 'P50' }]}
        formatarX={(x) => x}
        unidade="dias"
        descricao="Ciclo"
      />,
    )
    expect(screen.queryByTestId('marcador-criterio')).toBeNull()
    expect(container.querySelectorAll('.recharts-yAxis')).toHaveLength(1)
  })

  it('tabela: amostra insuficiente nunca vira número; período em andamento é marcado; unidade da direita', () => {
    tabela(
      <SerieLinhas
        pontos={pontos}
        series={series}
        formatarX={(x) => `m${x.slice(5)}`}
        unidade="dias"
        unidadeDireita="itens"
        descricao="Ciclo"
      />,
    )
    expect(screen.getByRole('columnheader', { name: 'WIP (itens)' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'P50 (dias)' })).toBeInTheDocument()
    expect(screen.getByRole('row', { name: /m08 \(em andamento\)/ })).toBeInTheDocument()
    expect(screen.getAllByText('— amostra insuficiente')).toHaveLength(1)
  })

  it('série da direita sem unidade própria usa a unidade principal', () => {
    tabela(
      <SerieLinhas
        pontos={pontos}
        series={series}
        formatarX={(x) => x}
        unidade="dias"
        descricao="Ciclo"
      />,
    )
    expect(screen.getByRole('columnheader', { name: 'WIP (dias)' })).toBeInTheDocument()
  })
})

describe('Dispersao', () => {
  it('eixo de datas: tooltip com rótulo do item, referências nos três traços e legenda das marcas', async () => {
    const { container } = render(
      <Dispersao
        pontos={[
          { id: 'A-1', x: 20000, y: 5, rotulo: 'Item um' },
          { id: 'A-2', x: 20010, y: 9, forma: 'losango' },
          { id: 'A-3', x: 20020, y: 2, forma: 'triangulo' },
          { id: 'A-4', x: 20030, y: 3, forma: 'anel' },
        ]}
        eixoX={{ tipo: 'data', formatar: (x) => `dia ${x}` }}
        rotuloY="Tempo (dias)"
        referencias={[
          { valor: 4, rotulo: 'P50', traco: 'solido' },
          { valor: 6, rotulo: 'P85', traco: 'tracejado' },
          { valor: 8, rotulo: 'P95', traco: 'pontilhado' },
        ]}
        legendaFormas={{ losango: 'Acima do P85', anel: 'Bloqueado' }}
        descricao="Entregas"
      />,
    )
    const marcas = screen.getByRole('list', { name: 'Significado das marcas' })
    expect(within(marcas).getByText('losango')).toBeInTheDocument()
    expect(within(marcas).getByText(/Bloqueado/)).toBeInTheDocument()
    const pontoSvg = container.querySelector(
      '.recharts-scatter .recharts-symbols, .recharts-scatter g path, .recharts-scatter circle',
    ) as Element
    fireEvent.mouseOver(pontoSvg)
    fireEvent.mouseMove(pontoSvg, { clientX: 300, clientY: 100 })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })
    expect(container.querySelector('.recharts-tooltip-wrapper')?.textContent).toContain(
      'Tempo (dias)',
    )
  })

  it('o tooltip usa o id quando o ponto não tem rótulo', async () => {
    const { container } = render(
      <Dispersao
        pontos={[{ id: 'SEM-ROTULO', x: 20000, y: 5 }]}
        eixoX={{ tipo: 'data', formatar: (x) => `dia ${x}` }}
        rotuloY="Tempo"
        descricao="Entregas"
      />,
    )
    const ponto = container.querySelector('.recharts-scatter circle') as Element
    fireEvent.mouseOver(ponto)
    fireEvent.mouseMove(ponto, { clientX: 300, clientY: 100 })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })
    expect(container.querySelector('.recharts-tooltip-wrapper')?.textContent).toContain(
      'SEM-ROTULO',
    )
  })

  it('eixo por categorias e tabela com a marca de cada ponto', () => {
    tabela(
      <Dispersao
        pontos={[
          { id: 'A-1', x: 0, y: 5 },
          { id: 'A-2', x: 1, y: 9, forma: 'anel' },
        ]}
        eixoX={{ tipo: 'categorias', categorias: ['Análise', 'Teste'] }}
        rotuloY="Idade"
        descricao="Idade por etapa"
      />,
    )
    const t = screen.getByRole('table')
    expect(within(t).getByRole('columnheader', { name: 'Etapa' })).toBeInTheDocument()
    expect(within(t).getByRole('row', { name: /A-2/ })).toHaveTextContent('Teste')
    expect(within(t).getByRole('row', { name: /A-2/ })).toHaveTextContent('anel (bloqueado)')
    expect(within(t).getByRole('row', { name: /A-1/ })).toHaveTextContent('círculo')
  })

  it('eixo por categorias desenha os rótulos no gráfico', () => {
    const { container } = render(
      <Dispersao
        pontos={[{ id: 'A-1', x: 0, y: 5 }]}
        eixoX={{ tipo: 'categorias', categorias: ['Análise', 'Teste'] }}
        rotuloY="Idade"
        descricao="Idade por etapa"
      />,
    )
    expect(container.textContent).toContain('Análise')
  })
})

describe('AreaEmpilhada: tooltip', () => {
  it('repete os valores de cada classe em texto', async () => {
    const { container } = render(
      <AreaEmpilhada
        pontos={[
          { x: '2026-09-01', valores: { a: 3, b: 5 } },
          { x: '2026-09-08', valores: { a: 4, b: 6 } },
        ]}
        series={[
          { chave: 'a', rotulo: 'Em andamento' },
          { chave: 'b', rotulo: 'Concluído' },
        ]}
        formatarX={(x) => x.slice(5)}
        unidade="itens"
        descricao="CFD"
      />,
    )
    expect(await passar(container)).toContain('Em andamento')
  })
})

describe('MapaCalor e ParEspera', () => {
  it('mapa de calor: o número está na célula; ausente conta zero e não recebe cor', () => {
    render(
      <MapaCalor
        linhas={['Melhoria', 'Bug']}
        colunas={['Análise', 'Teste']}
        valores={[[10, 2], [5]]}
        descricao="Itens por etapa"
        rotuloLinhas="Tipo"
      />,
    )
    const t = screen.getByRole('table')
    const linhaBug = within(t).getByRole('row', { name: /Bug/ })
    expect(
      within(linhaBug)
        .getAllByRole('cell')
        .map((c) => c.textContent),
    ).toEqual(['5', '0'])
  })

  it('par de espera: sem tabela não repete o segmento vazio; com tabela mostra as três linhas', () => {
    const { unmount } = render(
      <ParEspera
        cliente={10}
        time={4}
        indicePct={60}
        unidade="dias úteis"
        descricao="Par"
        segmento="Melhoria"
        escalaMax={20}
      />,
    )
    expect(screen.getByTestId('par-segmento')).toHaveTextContent('Melhoria')
    expect(screen.getByText('Acima de 50%')).toBeInTheDocument()
    unmount()
    const r = render(
      <ParEspera cliente={10} time={4} indicePct={40} unidade="dias úteis" descricao="Par" />,
    )
    expect(screen.queryByTestId('par-segmento')).toBeNull()
    expect(screen.queryByText('Acima de 50%')).toBeNull()
    r.unmount()
    tabela(
      <ParEspera cliente={10} time={4} indicePct={40} unidade="dias úteis" descricao="Par" />,
      'EI',
    )
    expect(screen.getByTestId('tabela-EI')).toBeInTheDocument()
    tabelaSemCodigo()
  })

  function tabelaSemCodigo() {
    render(
      <ModoTabelaContext.Provider value={{ modo: 'tabela' }}>
        <ParEspera cliente={10} time={4} indicePct={40} unidade="dias" descricao="Par" />
      </ModoTabelaContext.Provider>,
    )
    expect(screen.getAllByRole('table')).toHaveLength(2)
  }
})
