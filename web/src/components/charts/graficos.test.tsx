import { render, screen, within } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { ModoTabelaContext } from '../ui'
import { definirFilaImediata } from './filaDeGraficos'
import {
  AreaEmpilhada,
  GraficoMensal,
  Legenda,
  TooltipTema,
  corNaPosicao,
  idPadrao,
  marcaDoTipo,
  preenchimento,
  rotuloEixoY,
  uidSvg,
} from '.'

// Estes testes olham o desenho do gráfico; a fila (filaDeGraficos.test.tsx) tem teste próprio.
beforeAll(() => definirFilaImediata(true))
afterAll(() => definirFilaImediata(false))

const pontos = [
  { x: '2026-09-01', valores: { a: 3, b: 5 } },
  { x: '2026-09-08', valores: { a: 4 } },
]
const series = [
  { chave: 'a', rotulo: 'Em andamento' },
  { chave: 'b', rotulo: 'Concluído', cor: 3 as const, padrao: 'pontos' as const },
]

describe('AreaEmpilhada', () => {
  it('desenha o gráfico com legenda em texto e descrição para leitores de tela', () => {
    render(
      <AreaEmpilhada
        pontos={pontos}
        series={series}
        formatarX={(x) => x.slice(5)}
        unidade="itens"
        descricao="Fluxo acumulado por classe"
      />,
    )
    const figura = screen.getByRole('figure')
    expect(within(figura).getByText('Fluxo acumulado por classe')).toBeInTheDocument()
    const legenda = within(figura).getByRole('list', { name: 'Legenda' })
    expect(within(legenda).getByText('Em andamento')).toBeInTheDocument()
    expect(within(legenda).getByText('Concluído')).toBeInTheDocument()
  })

  it('no modo tabela, mostra os valores formatados e "—" onde não há dado', () => {
    render(
      <ModoTabelaContext.Provider
        value={{ modo: 'tabela', idLeitura: 'l', legenda: 'x', codigo: 'E3' }}
      >
        <AreaEmpilhada
          pontos={pontos}
          series={series}
          formatarX={(x) => `d${x.slice(8)}`}
          formatar={(v) => `${v} it.`}
          unidade="itens"
          descricao="Fluxo acumulado"
          altura={300}
        />
      </ModoTabelaContext.Provider>,
    )
    const tabela = screen.getByRole('table')
    expect(
      within(tabela).getByRole('columnheader', { name: 'Em andamento (itens)' }),
    ).toBeInTheDocument()
    const linha2 = within(tabela).getByRole('row', { name: /d08/ })
    expect(
      within(linha2)
        .getAllByRole('cell')
        .map((c) => c.textContent),
    ).toEqual(['4 it.', '—'])
    expect(within(tabela).getByRole('row', { name: /d01/ })).toHaveTextContent('3 it.')
  })
})

describe('TooltipTema', () => {
  it('não aparece inativo, sem itens ou sem payload', () => {
    const { container, rerender } = render(
      <TooltipTema active={false} payload={[{ name: 'a', value: 1 }]} />,
    )
    expect(container).toBeEmptyDOMElement()
    rerender(<TooltipTema active />)
    expect(container).toBeEmptyDOMElement()
    rerender(<TooltipTema active payload={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('repete os valores em texto: formatados, crus, textuais, sem nulos e sem séries internas', () => {
    render(
      <TooltipTema
        active
        label="2026-09-01"
        rotuloX={(x) => `Semana ${x}`}
        formatar={(v, chave) => `${v} un (${chave})`}
        payload={[
          { name: 'A', value: 3, dataKey: 'a' },
          { name: 'Texto', value: 'alto', dataKey: 't' },
          { name: 'Faixa', value: [1, 2], dataKey: 'f' },
          { name: 'Nulo', value: null, dataKey: 'n' },
          { name: 'Interno', value: 9, dataKey: '__x' },
        ]}
      />,
    )
    expect(screen.getByText('Semana 2026-09-01')).toBeInTheDocument()
    expect(screen.getByText('A: 3 un (a)')).toBeInTheDocument()
    expect(screen.getByText('Texto: alto')).toBeInTheDocument()
    expect(screen.getByText('Faixa:')).toBeInTheDocument()
    expect(screen.queryByText(/Nulo/)).toBeNull()
    expect(screen.queryByText(/Interno/)).toBeNull()
  })

  it('sem formatador mostra o número cru; sem rótulo não mostra título; rótulo sem conversor é o próprio texto', () => {
    const { rerender } = render(
      <TooltipTema active payload={[{ name: 'A', value: 3, dataKey: 'a' }]} />,
    )
    expect(screen.getByText('A: 3')).toBeInTheDocument()
    expect(document.querySelector('p')).toBeNull()
    rerender(<TooltipTema active label={7} payload={[{ name: 'A', value: 3, dataKey: 'a' }]} />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })
})

describe('tema dos gráficos', () => {
  it('cor por posição cicla de 1 a 6; cada tipo de demanda tem cor e padrão fixos', () => {
    expect(corNaPosicao(0)).toBe(1)
    expect(corNaPosicao(6)).toBe(1)
    expect(marcaDoTipo('Incidente')).toEqual({ cor: 1, padrao: 'liso' })
    expect(marcaDoTipo('Melhoria')).toEqual({ cor: 3, padrao: 'pontos' })
    expect(marcaDoTipo('Tipo desconhecido')).toEqual({ cor: 1, padrao: 'liso' })
    expect(marcaDoTipo('Dívida técnica')).toEqual({ cor: 1, padrao: 'listras' })
  })

  it('preenchimento: liso, contorno ou referência ao padrão; ids sem caracteres inválidos', () => {
    expect(preenchimento('liso', 2)).toBe('var(--serie-2)')
    expect(preenchimento('contorno', 2)).toBe('transparent')
    expect(preenchimento('listras', 2, 'u1')).toBe('url(#pat-u1-listras-2)')
    expect(idPadrao('pontos', 4)).toBe('pat-pontos-4')
    expect(uidSvg(':r1:')).toBe('_r1_')
  })

  it('rótulo do eixo Y: à esquerda (padrão) ou à direita', () => {
    expect(rotuloEixoY('dias')).toMatchObject({ value: 'dias', angle: -90, position: 'insideLeft' })
    expect(rotuloEixoY('dias', 'dir')).toMatchObject({ angle: 90, position: 'insideRight' })
  })
})

describe('Legenda', () => {
  it('mostra um item por série, com traço ou padrão', () => {
    const { container } = render(
      <Legenda
        itens={[
          { rotulo: 'P50', cor: 1, traco: 'solido' },
          { rotulo: 'P85', cor: 2, traco: 'tracejado' },
          { rotulo: 'P95', cor: 3, traco: 'pontilhado' },
          { rotulo: 'Liso', cor: 4 },
          { rotulo: 'Listras', cor: 5, padrao: 'listras' },
          { rotulo: 'Pontos', cor: 6, padrao: 'pontos' },
          { rotulo: 'Cruzado', cor: 1, padrao: 'cruzado' },
          { rotulo: 'Contorno', cor: 2, padrao: 'contorno' },
        ]}
      />,
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(8)
    expect(container.querySelectorAll('line')).toHaveLength(3)
    expect(container.querySelectorAll('pattern')).toHaveLength(5)
  })
})

describe('GraficoMensal', () => {
  const dados = [
    { mes: '2026-04', valor: 8 },
    { mes: '2026-05', valor: null },
    { mes: '2026-06', valor: 9 },
  ]
  it('linha: meses sem valor viram marcador vazado, com a legenda "poucos itens" no eixo', () => {
    const { container } = render(
      <div style={{ width: 640, height: 160 }}>
        <GraficoMensal dados={dados} forma="linha" unidade="dias úteis" marcas={[]} />
      </div>,
    )
    expect(container.querySelector('svg')).not.toBeNull()
    expect(container.querySelector('[data-testid="marcador-vazado"]')).not.toBeNull()
  })
  it('linha com teto do eixo e linha de mudança de critério; barras sem marcador', () => {
    const a = render(
      <div style={{ width: 640, height: 160 }}>
        <GraficoMensal
          dados={dados}
          forma="linha"
          unidade="prioridades"
          eixoMax={5}
          marcas={[{ id: 'c', mes: '2026-05', data: '2026-05-10' }]}
        />
      </div>,
    )
    expect(a.container.querySelector('svg')).not.toBeNull()
    a.unmount()
    const b = render(
      <div style={{ width: 640, height: 160 }}>
        <GraficoMensal
          dados={dados.map((d) => ({ ...d, valor: d.valor ?? 0 }))}
          forma="barras"
          unidade="itens"
          marcas={[]}
        />
      </div>,
    )
    expect(b.container.querySelector('svg')).not.toBeNull()
  })
})
