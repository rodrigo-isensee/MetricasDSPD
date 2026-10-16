import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  AmostraInsuficiente,
  BadgeBase,
  CartaoMetrica,
  ProvedorContextoPainel,
  SeletorCadencia,
  SeletorLocal,
  StatusMeta,
  TabelaDados,
} from '.'
import { useState } from 'react'
import { MemoryRouter } from 'react-router'

const nota = { oQueE: 'a', comoSeCalcula: 'b', comoLer: 'c', meta: 'd', cuidados: 'e' }
const base = {
  n: 87,
  unidade: 'itens concluídos',
  janela: { inicio: '2026-07-18', fim: '2026-10-09' },
}

const Cartao = (p: Partial<React.ComponentProps<typeof CartaoMetrica>>) => (
  <MemoryRouter>
    <CartaoMetrica
      codigo="O3"
      titulo="Tempo de ciclo"
      pergunta="Em quantos dias entregamos?"
      estado="ok"
      nota={nota}
      fonte="BusinessMap"
      granularidade="demanda"
      base={base}
      {...p}
    >
      <p>corpo do gráfico</p>
    </CartaoMetrica>
  </MemoryRouter>
)

describe('BadgeBase e AmostraInsuficiente', () => {
  it('declara a base: itens, unidade e janela', () => {
    render(<BadgeBase base={base} />)
    expect(screen.getByText(/Base: 87 itens concluídos/)).toBeInTheDocument()
    expect(screen.getByText(/18\/07 a 09\/10\/2026/)).toBeInTheDocument()
  })

  it('amostra insuficiente mostra "n de 20", o medidor acessível e sugere remover filtros ativos', async () => {
    const remover = vi.fn()
    render(
      <ProvedorContextoPainel
        filtrosAtivos={[{ chave: 'sistema', rotulo: 'Sistema', valor: 'Fluig', valorId: 'fluig' }]}
        removerFiltro={remover}
        limparFiltros={() => undefined}
      >
        <AmostraInsuficiente n={12} codigo="O3" />
      </ProvedorContextoPainel>,
    )
    expect(screen.getByText(/12 de 20 itens mínimos/, { selector: 'p' })).toBeInTheDocument()
    const m = screen.getByRole('meter')
    expect(m).toHaveAttribute('aria-valuenow', '12')
    expect(m).toHaveAttribute('aria-valuemax', '20')
    await userEvent.click(screen.getByRole('button', { name: 'Remover filtro Sistema' }))
    expect(remover).toHaveBeenCalledWith('sistema')
    expect(screen.getByTestId('amostra-insuficiente-O3')).toBeInTheDocument()
  })

  it('sem filtros ativos explica que a classe é pequena mesmo sem filtros', () => {
    render(<AmostraInsuficiente n={3} />)
    expect(screen.getByText(/poucos itens mesmo sem filtros/)).toBeInTheDocument()
  })
})

describe('CartaoMetrica', () => {
  it('estado ok: id em minúsculas, base visível e corpo', () => {
    render(<Cartao leitura="85% em até 9 dias úteis." />)
    expect(document.getElementById('o3')).toBeInTheDocument()
    expect(screen.getByTestId('metrica-O3')).toHaveAttribute('data-estado', 'ok')
    expect(screen.getByTestId('base-O3')).toHaveTextContent('87')
    expect(screen.getByText('corpo do gráfico')).toBeInTheDocument()
    expect(screen.getByTestId('leitura-O3')).toHaveTextContent('85% em até 9 dias úteis.')
  })

  it('carregando: aria-busy, texto para leitor de tela e sem corpo', () => {
    render(<Cartao estado="carregando" />)
    expect(screen.getByTestId('metrica-O3')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByTestId('metrica-O3')).toHaveAttribute('data-estado', 'carregando')
    expect(screen.getByTestId('estado-carregando-O3')).toBeInTheDocument()
    expect(screen.getByText('Carregando O3 Tempo de ciclo…')).toBeInTheDocument()
    expect(screen.queryByText('corpo do gráfico')).not.toBeInTheDocument()
  })

  it('erro: mensagem, tentar de novo e filtros mantidos', async () => {
    const tentar = vi.fn()
    render(<Cartao estado="erro" onTentarDeNovo={tentar} />)
    expect(screen.getByTestId('metrica-O3')).toHaveAttribute('data-estado', 'erro')
    expect(screen.getByText('Não foi possível carregar este gráfico')).toBeInTheDocument()
    expect(screen.getByText(/Seus filtros foram mantidos/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(tentar).toHaveBeenCalledTimes(1)
  })

  it('só o primeiro erro da página é alert; os demais são status', () => {
    render(
      <ProvedorContextoPainel
        filtrosAtivos={[]}
        removerFiltro={() => undefined}
        limparFiltros={() => undefined}
      >
        <Cartao codigo="O3" estado="erro" />
        <Cartao codigo="O4" estado="erro" />
      </ProvedorContextoPainel>,
    )
    expect(screen.getAllByRole('alert')).toHaveLength(1)
    expect(within(screen.getByTestId('estado-erro-O4')).queryByRole('alert')).toBeNull()
  })

  it('vazio: oferece limpar filtros e remover cada filtro ativo, distinto de amostra insuficiente', async () => {
    const limpar = vi.fn()
    render(
      <ProvedorContextoPainel
        filtrosAtivos={[{ chave: 'tipo', rotulo: 'Tipo de demanda', valor: 'Melhoria' }]}
        removerFiltro={() => undefined}
        limparFiltros={limpar}
      >
        <Cartao estado="vazio" />
      </ProvedorContextoPainel>,
    )
    expect(screen.getByText('Nenhum item encontrado')).toBeInTheDocument()
    expect(screen.queryByText('Amostra insuficiente')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(limpar).toHaveBeenCalled()
    expect(
      screen.getByRole('button', { name: 'Remover filtro Tipo de demanda' }),
    ).toBeInTheDocument()
  })

  it('nota metodológica: fechada por padrão, abre por teclado com aria-expanded e não move o foco', async () => {
    render(<Cartao />)
    const botao = screen.getByRole('button', { name: 'Como ler e como é calculado' })
    expect(botao).toHaveAttribute('aria-expanded', 'false')
    botao.focus()
    await userEvent.keyboard('{Enter}')
    expect(botao).toHaveAttribute('aria-expanded', 'true')
    expect(botao).toHaveFocus()
    const nota = screen.getByTestId('nota-O3')
    for (const t of [
      'O que é',
      'Como se calcula',
      'Como ler',
      'Meta',
      'Cuidados e limites',
      'Nesta tela',
    ]) {
      expect(within(nota).getByRole('heading', { name: t })).toBeInTheDocument()
    }
    expect(within(nota).getByText(/menos de 20 itens não são publicadas/)).toBeInTheDocument()
    await userEvent.keyboard(' ')
    expect(botao).toHaveAttribute('aria-expanded', 'false')
  })

  it('"Nesta tela" lista a janela, os filtros aplicados e a base reais do cartão', async () => {
    render(
      <ProvedorContextoPainel
        filtrosAtivos={[{ chave: 'equipe', rotulo: 'Equipe', valor: 'Fluig' }]}
        removerFiltro={() => undefined}
        limparFiltros={() => undefined}
      >
        <Cartao aplicaveis={['equipe']} />
      </ProvedorContextoPainel>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Como ler e como é calculado' }))
    const nota = screen.getByTestId('nota-O3')
    expect(nota).toHaveTextContent('Filtros aplicados: Equipe Fluig')
    expect(nota).toHaveTextContent('Base amostral: 87 itens concluídos')
    expect(nota).toHaveTextContent('18/07 a 09/10/2026')
  })

  it('rodapé: "Filtros aplicados" e "Não afetado por" conforme a aplicabilidade', () => {
    render(
      <ProvedorContextoPainel
        filtrosAtivos={[
          { chave: 'equipe', rotulo: 'Equipe', valor: 'Fluig' },
          { chave: 'tipo', rotulo: 'Tipo de demanda', valor: 'Melhoria' },
        ]}
        removerFiltro={() => undefined}
        limparFiltros={() => undefined}
      >
        <Cartao aplicaveis={['equipe']} />
      </ProvedorContextoPainel>,
    )
    expect(
      screen.getByText('Filtros aplicados: Equipe Fluig', { selector: 'span' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Não afetado por: Tipo de demanda/)).toBeInTheDocument()
    expect(screen.getByText('Fonte: BusinessMap')).toBeInTheDocument()
    expect(screen.getByText('Granularidade: demanda')).toBeInTheDocument()
  })

  it('"Ver como tabela" alterna com "Ver como gráfico"', async () => {
    render(<Cartao />)
    const alternar = screen.getByRole('button', { name: 'Ver como tabela' })
    expect(alternar).not.toHaveAttribute('aria-pressed')
    await userEvent.click(alternar)
    expect(screen.getByRole('button', { name: 'Ver como gráfico' })).not.toHaveAttribute(
      'aria-pressed',
    )
  })
})

describe('StatusMeta, TabelaDados e SeletorLocal', () => {
  it('status sempre com ícone e texto', () => {
    const { container } = render(<StatusMeta status="fora" />)
    expect(screen.getByText('Fora da meta')).toBeInTheDocument()
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('tabela com caption, th scope e região rolável rotulada e focável', () => {
    render(
      <TabelaDados
        legenda="itens por semana"
        colunas={[
          { chave: 'a', titulo: 'Semana' },
          { chave: 'b', titulo: 'Itens', alinhar: 'direita' },
        ]}
        linhas={[{ a: '01/09', b: '8' }]}
      />,
    )
    const regiao = screen.getByRole('region', {
      name: 'Tabela de itens por semana, role para os lados',
    })
    expect(regiao).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('columnheader', { name: 'Itens' })).toHaveAttribute('scope', 'col')
    expect(screen.getByRole('rowheader', { name: '01/09' })).toHaveAttribute('scope', 'row')
    expect(screen.getByText('itens por semana', { selector: 'caption' })).toBeInTheDocument()
  })

  it('seletor local: setas movem e selecionam, mostra contagem e "(amostra insuficiente)"', async () => {
    function Exemplo() {
      const [v, setV] = useState('a')
      return (
        <SeletorLocal
          codigo="o3"
          rotulo="Ver por tipo"
          valor={v}
          onChange={setV}
          itens={[
            { valor: 'a', rotulo: 'Melhoria', contagem: 49 },
            { valor: 'b', rotulo: 'Dívida técnica', insuficiente: true },
          ]}
        >
          <p>conteúdo {v}</p>
        </SeletorLocal>
      )
    }
    render(<Exemplo />)
    expect(
      screen.getByRole('tab', { name: /Dívida técnica.*amostra insuficiente/ }),
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Melhoria.*\(49\)/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    screen.getByRole('tab', { name: /Melhoria/ }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: /Dívida técnica/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText('conteúdo b')).toBeInTheDocument()
  })
})

describe('SeletorCadencia', () => {
  const opcoes = [
    { valor: 'a', rotulo: 'Aaa' },
    { valor: 'b', rotulo: 'Bbb' },
  ] as const
  it('rótulo padrão "Cadência"; escolher chama onChange; sem onIntencao, ponteiro e foco não fazem nada', async () => {
    const onChange = vi.fn()
    render(<SeletorCadencia valor="a" onChange={onChange} opcoes={opcoes} />)
    expect(screen.getByRole('radiogroup', { name: 'Cadência' })).toBeInTheDocument()
    await userEvent.hover(screen.getByText('Bbb'))
    await userEvent.click(screen.getByRole('radio', { name: 'Bbb' }))
    expect(onChange).toHaveBeenCalledWith('b')
  })
  it('onIntencao avisa com o valor sob o ponteiro e sob o foco (pré-carga antes do clique)', async () => {
    const onIntencao = vi.fn()
    render(
      <SeletorCadencia
        rotulo="Visão"
        valor="a"
        onChange={() => undefined}
        opcoes={opcoes}
        onIntencao={onIntencao}
      />,
    )
    await userEvent.hover(screen.getByText('Bbb'))
    expect(onIntencao).toHaveBeenLastCalledWith('b')
    onIntencao.mockClear()
    await userEvent.tab()
    expect(onIntencao).toHaveBeenCalledWith('a')
  })
})
