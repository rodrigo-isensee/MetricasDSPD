import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Dica } from '@/components/ui'
import { renderizarBarra } from '@/test/helpers'
import { FiltroMulti } from './FiltroMulti'
import { FiltroPeriodo } from './FiltroPeriodo'

const opcoes = [
  { id: 'a', nome: 'Alfa' },
  { id: 'b', nome: 'Beta' },
  { id: 'c', nome: 'Gama' },
]

describe('FiltroMulti', () => {
  it('resume a seleção: Todas, um nome, um id sem nome e a contagem', () => {
    const { rerender } = render(
      <FiltroMulti id="x" rotulo="Equipe" opcoes={opcoes} selecionados={[]} onChange={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: 'Equipe: Todas' })).toBeInTheDocument()
    rerender(
      <FiltroMulti
        id="x"
        rotulo="Equipe"
        opcoes={opcoes}
        selecionados={['a']}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Equipe: Alfa' })).toBeInTheDocument()
    rerender(
      <FiltroMulti
        id="x"
        rotulo="Equipe"
        opcoes={opcoes}
        selecionados={['z']}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Equipe: z' })).toBeInTheDocument()
    rerender(
      <FiltroMulti
        id="x"
        rotulo="Equipe"
        opcoes={opcoes}
        selecionados={['a', 'b']}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Equipe: 2 selecionadas' })).toBeInTheDocument()
    rerender(
      <FiltroMulti
        id="x"
        rotulo="Sistema"
        genero="m"
        opcoes={opcoes}
        selecionados={['a', 'b']}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Sistema: 2 selecionados' })).toBeInTheDocument()
    rerender(
      <FiltroMulti
        id="x"
        rotulo="Sistema"
        genero="m"
        opcoes={opcoes}
        selecionados={[]}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Sistema: Todos' })).toBeInTheDocument()
  })

  it('cliques em sequência com props atrasadas (URL intermediária) acumulam todas as marcações', async () => {
    const tres = [...opcoes, { id: 'd', nome: 'Delta' }]
    const onChange = vi.fn()
    const el = (sel: string[]) => (
      <FiltroMulti id="x" rotulo="Equipe" opcoes={tres} selecionados={sel} onChange={onChange} />
    )
    const { rerender } = render(el([]))
    await userEvent.click(screen.getByRole('button', { name: 'Equipe: Todas' }))
    await userEvent.click(screen.getByLabelText('Alfa'))
    await userEvent.click(screen.getByLabelText('Beta'))
    // chega o render da URL do primeiro clique, depois do segundo clique
    rerender(el(['a']))
    await userEvent.click(screen.getByLabelText('Gama'))
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b', 'c'], true)
    // a URL alcança o que foi emitido: volta a mandar a prop
    rerender(el(['a', 'b', 'c']))
    rerender(el(['d']))
    await userEvent.click(screen.getByLabelText('Alfa'))
    expect(onChange).toHaveBeenLastCalledWith(['d', 'a'], true)
  })

  it('o botão acompanha as caixas marcadas, mesmo antes de a URL chegar', async () => {
    const onChange = vi.fn()
    render(
      <FiltroMulti id="x" rotulo="Equipe" opcoes={opcoes} selecionados={[]} onChange={onChange} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Equipe: Todas' }))
    await userEvent.click(screen.getByLabelText('Alfa'))
    const botao = screen.getByTestId('filtro-x')
    expect(botao).toHaveAccessibleName('Equipe: Alfa')
    expect(botao).toHaveTextContent('Equipe: Alfa')
  })

  it('marcar todas: a URL vira "Todas" (prop vazia), as caixas voltam a vazias e o clique seguinte parte do vazio', async () => {
    const onChange = vi.fn()
    const el = (sel: string[]) => (
      <FiltroMulti id="x" rotulo="Equipe" opcoes={opcoes} selecionados={sel} onChange={onChange} />
    )
    const { rerender } = render(el([]))
    await userEvent.click(screen.getByRole('button', { name: 'Equipe: Todas' }))
    await userEvent.click(screen.getByLabelText('Alfa'))
    rerender(el(['a']))
    await userEvent.click(screen.getByLabelText('Beta'))
    await userEvent.click(screen.getByLabelText('Gama'))
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b', 'c'], true)
    expect(screen.getByLabelText('Alfa')).not.toBeChecked()
    rerender(el([]))
    await userEvent.click(screen.getByLabelText('Alfa'))
    expect(onChange).toHaveBeenLastCalledWith(['a'], true)
  })

  it('popover: a primeira marcação empilha no histórico, as seguintes substituem; Limpar e Fechar', async () => {
    const onChange = vi.fn()
    render(
      <FiltroMulti
        id="x"
        rotulo="Equipe"
        opcoes={opcoes}
        selecionados={['a']}
        onChange={onChange}
        dica={<Dica texto="ajuda" rotulo="Sobre" />}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Equipe: Alfa' }))
    await userEvent.click(screen.getByLabelText('Beta'))
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b'], false)
    await userEvent.click(screen.getByLabelText('Alfa'))
    expect(onChange).toHaveBeenLastCalledWith(['b'], true)
    await userEvent.click(screen.getByRole('button', { name: 'Limpar' }))
    expect(onChange).toHaveBeenLastCalledWith([], true)
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    // Ao reabrir, volta a empilhar.
    await userEvent.click(screen.getByRole('button', { name: 'Equipe: Todas' }))
    // (o botão já mostra "Todas": acompanha as caixas, não a prop antiga)
    await userEvent.click(screen.getByRole('button', { name: 'Limpar' }))
    expect(onChange).toHaveBeenLastCalledWith([], false)
  })

  it('lista (folha mobile): rótulo, dica e marcações com histórico empilhando só na primeira', async () => {
    const onChange = vi.fn()
    render(
      <FiltroMulti
        id="x"
        rotulo="Equipe"
        variante="lista"
        opcoes={opcoes}
        selecionados={[]}
        onChange={onChange}
        dica={<Dica texto="ajuda" rotulo="Sobre" />}
      />,
    )
    const bloco = screen.getByTestId('filtro-x')
    expect(within(bloco).getByRole('button', { name: 'Sobre' })).toBeInTheDocument()
    await userEvent.click(within(bloco).getByLabelText('Alfa'))
    expect(onChange).toHaveBeenLastCalledWith(['a'], false)
    await userEvent.click(within(bloco).getByLabelText('Beta'))
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b'], true)
  })

  it('cliques em sequência acumulam mesmo que a prop selecionados ainda não tenha atualizado (bug 004)', async () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <FiltroMulti
        id="x"
        rotulo="Equipe"
        variante="lista"
        opcoes={opcoes}
        selecionados={[]}
        onChange={onChange}
      />,
    )
    await userEvent.click(screen.getByLabelText('Alfa'))
    await userEvent.click(screen.getByLabelText('Beta'))
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b'], true)
    await userEvent.click(screen.getByLabelText('Alfa'))
    expect(onChange).toHaveBeenLastCalledWith(['b'], true)
    // Mudança externa (chip removido, Limpar) volta a mandar na seleção.
    rerender(
      <FiltroMulti
        id="x"
        rotulo="Equipe"
        variante="lista"
        opcoes={opcoes}
        selecionados={['b']}
        onChange={onChange}
      />,
    )
    await userEvent.click(screen.getByLabelText('Beta'))
    expect(onChange).toHaveBeenLastCalledWith([], true)
  })
})

describe('FiltroPeriodo', () => {
  const historico = { inicio: '2026-01-01', fim: '2026-10-09' }

  it('popover: escolhe um período fixo e fecha', async () => {
    const onChange = vi.fn()
    render(<FiltroPeriodo periodo={{ tipo: '12s' }} historico={historico} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /Período: Últimas 12 semanas/ }))
    await userEvent.click(screen.getByRole('radio', { name: 'Últimos 6 meses' }))
    expect(onChange).toHaveBeenCalledWith({ tipo: '6m' }, false)
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('mostra o intervalo personalizado no botão e já abre com as datas', async () => {
    render(
      <FiltroPeriodo
        periodo={{ tipo: 'custom', de: '2026-03-01', ate: '2026-04-01' }}
        historico={historico}
        onChange={vi.fn()}
      />,
    )
    const botao = screen.getByRole('button', { name: /01\/03\/2026 a 01\/04\/2026/ })
    await userEvent.click(botao)
    expect(screen.getByLabelText('De')).toHaveValue('2026-03-01')
    expect(screen.getByLabelText('Até')).toHaveValue('2026-04-01')
  })

  it('personalizado com erro volta a um período fixo e limpa o aviso; sem histórico aplica direto', async () => {
    const onChange = vi.fn()
    render(
      <FiltroPeriodo
        variante="lista"
        periodo={{ tipo: '12s' }}
        historico={undefined}
        onChange={onChange}
      />,
    )
    await userEvent.click(screen.getByRole('radio', { name: 'Personalizado' }))
    await userEvent.type(screen.getByLabelText('De'), '2026-03-01')
    await userEvent.type(screen.getByLabelText('Até'), '2026-04-01')
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar período' }))
    expect(onChange).toHaveBeenCalledWith(
      { tipo: 'custom', de: '2026-03-01', ate: '2026-04-01' },
      false,
    )
  })

  it('exibe e limpa a mensagem de erro ao voltar para um período fixo', async () => {
    const onChange = vi.fn()
    render(
      <FiltroPeriodo
        variante="lista"
        periodo={{ tipo: '12s' }}
        historico={historico}
        onChange={onChange}
      />,
    )
    await userEvent.click(screen.getByRole('radio', { name: 'Personalizado' }))
    await userEvent.type(screen.getByLabelText('De'), '2025-01-01')
    await userEvent.type(screen.getByLabelText('Até'), '2026-04-01')
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar período' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Há dados a partir de 01/01/2026')
    expect(screen.getByLabelText('De')).toBeInvalid()
    await userEvent.click(screen.getByRole('radio', { name: 'Últimas 4 semanas' }))
    expect(screen.queryByRole('alert')).toBeNull()
    expect(onChange).toHaveBeenCalledWith({ tipo: '4s' }, false)
  })

  it('painel sem personalizado (Estratégico) oferece só os períodos permitidos', () => {
    render(
      <FiltroPeriodo
        variante="lista"
        periodo={{ tipo: '12m' }}
        historico={historico}
        periodos={['6m', '12m']}
        personalizado={false}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getAllByRole('radio')).toHaveLength(2)
    expect(screen.queryByRole('radio', { name: 'Personalizado' })).toBeNull()
  })
})

describe('BarraFiltros: folha em tela estreita e avisos', () => {
  it('a folha mostra a contagem, aplica filtros (uma entrada de histórico), limpa e fecha', async () => {
    const r = renderizarBarra('/operacional?tipo=melhoria')
    const abrir = await screen.findByTestId('abrir-filtros')
    expect(abrir).toHaveTextContent('Filtros (1)')
    await userEvent.click(abrir)
    const folha = await screen.findByRole('dialog', { name: 'Filtros' })
    await userEvent.click(within(folha).getByTestId('equipe-opcao-fluig'))
    await waitFor(() => expect(r.roteador.state.location.search).toContain('equipe=fluig'))
    await userEvent.click(within(folha).getByTestId('equipe-opcao-senior'))
    expect(r.roteador.state.location.search).toContain('equipe=fluig,senior')
    // a folha toda é UMA entrada no histórico: o Voltar sai da folha com as duas marcações desfeitas
    await userEvent.click(within(folha).getByTestId('limpar-filtros-folha'))
    expect(r.roteador.state.location.search).toBe('')
    await userEvent.click(within(folha).getByRole('button', { name: 'Ver resultados' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByTestId('abrir-filtros')).toHaveTextContent('Filtros (0)')
  })

  it('CA-16/CA-14: na folha, Esc com texto só limpa o texto; sem texto fecha e devolve o foco', async () => {
    renderizarBarra('/operacional')
    const abrir = await screen.findByTestId('abrir-filtros')
    await userEvent.click(abrir)
    const folha = await screen.findByRole('dialog', { name: 'Filtros' })
    const campo = within(folha).getByTestId('equipe-busca')
    await userEvent.type(campo, 'zz')
    await userEvent.keyboard('{Escape}')
    expect(screen.getByRole('dialog', { name: 'Filtros' })).toBeInTheDocument()
    expect(within(folha).getByTestId('equipe-busca')).toHaveValue('')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(abrir).toHaveFocus()
  })

  it('S1: na folha, Esc com o foco na busca vazia de outro filtro fecha a folha, mesmo com texto em Equipe', async () => {
    renderizarBarra('/operacional')
    await userEvent.click(await screen.findByTestId('abrir-filtros'))
    const folha = await screen.findByRole('dialog', { name: 'Filtros' })
    await userEvent.type(within(folha).getByTestId('equipe-busca'), 'zz')
    await userEvent.click(within(folha).getByTestId('tipo-busca'))
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('S2: na folha, Esc com o foco em "Ver resultados" fecha a folha, mesmo com texto em Equipe', async () => {
    renderizarBarra('/operacional')
    await userEvent.click(await screen.findByTestId('abrir-filtros'))
    const folha = await screen.findByRole('dialog', { name: 'Filtros' })
    await userEvent.type(within(folha).getByTestId('equipe-busca'), 'zz')
    within(folha).getByRole('button', { name: 'Ver resultados' }).focus()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('A4: na folha, cada campo de busca tem nome acessível próprio', async () => {
    renderizarBarra('/operacional')
    await userEvent.click(await screen.findByTestId('abrir-filtros'))
    const folha = await screen.findByRole('dialog', { name: 'Filtros' })
    expect(within(folha).getByRole('textbox', { name: 'Buscar em Equipe' })).toBeInTheDocument()
    expect(
      within(folha).getByRole('textbox', { name: 'Buscar em Tipo de demanda' }),
    ).toBeInTheDocument()
  })

  it('reabrir a folha volta a empilhar uma nova entrada', async () => {
    const r = renderizarBarra('/operacional')
    await userEvent.click(await screen.findByTestId('abrir-filtros'))
    let folha = await screen.findByRole('dialog', { name: 'Filtros' })
    await userEvent.click(within(folha).getByTestId('tipo-opcao-melhoria'))
    await userEvent.click(within(folha).getByRole('button', { name: 'Ver resultados' }))
    await userEvent.click(screen.getByTestId('abrir-filtros'))
    folha = await screen.findByRole('dialog', { name: 'Filtros' })
    await userEvent.click(within(folha).getByTestId('sistema-opcao-protheus'))
    expect(r.roteador.state.location.search).toContain('sistema=protheus')
  })

  it('no Estratégico, filtros guardados que não se aplicam avisam na barra e na folha', async () => {
    const r = renderizarBarra('/operacional?equipe=fluig&tipo=melhoria')
    await screen.findByRole('button', { name: 'Remover filtro Equipe: Fluig' })
    await r.roteador.navigate('/estrategico')
    const aviso = await screen.findByTestId('aviso-filtros-nao-aplicaveis')
    expect(aviso).toHaveTextContent(
      'Equipe e Tipo de demanda não se aplicam ao nível estratégico. Seus filtros foram guardados e voltam quando você abrir outro painel de fluxo.',
    )
    await userEvent.click(screen.getByTestId('abrir-filtros'))
    const folha = await screen.findByRole('dialog', { name: 'Filtros' })
    expect(within(folha).getByText(/Por isso não há filtro por equipe/)).toBeInTheDocument()
  })

  it('um filtro guardado só: singular', async () => {
    const r = renderizarBarra('/operacional?equipe=fluig')
    await screen.findByRole('button', { name: 'Remover filtro Equipe: Fluig' })
    await r.roteador.navigate('/estrategico')
    expect(await screen.findByTestId('aviso-filtros-nao-aplicaveis')).toHaveTextContent(
      'Equipe não se aplica ao nível estratégico. Seu filtro foi guardado e volta quando',
    )
  })

  it('Sustentação: marcar prioridade grava em maiúsculas na leitura e minúsculas na URL', async () => {
    const r = renderizarBarra('/sustentacao')
    await userEvent.click(await screen.findByTestId('filtro-prioridade'))
    await userEvent.click(await screen.findByLabelText('P2'))
    expect(r.roteador.state.location.search).toBe('?prioridade=p2')
    expect(
      await screen.findByRole('button', { name: 'Remover filtro Prioridade: P2' }),
    ).toBeVisible()
  })

  it('anuncia a mudança aos leitores de tela agrupando os valores por filtro', async () => {
    renderizarBarra('/operacional')
    await userEvent.click(await screen.findByTestId('filtro-equipe'))
    await userEvent.click(await screen.findByLabelText('Fluig'))
    await userEvent.click(screen.getByLabelText('Senior'))
    expect(
      await screen.findByText(/Filtros atualizados\. Equipe: Fluig e Senior\./),
    ).toBeInTheDocument()
  })
})

describe('FiltroMulti: caixa marcada e prop atrasada', () => {
  it('desmarcar logo depois de marcar, com a URL ainda sem alcançar, tira a marcação (não marca de novo)', async () => {
    const onChange = vi.fn()
    render(
      <FiltroMulti id="x" rotulo="Equipe" opcoes={opcoes} selecionados={[]} onChange={onChange} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Equipe: Todas' }))
    await userEvent.click(screen.getByLabelText('Alfa'))
    expect(screen.getByLabelText('Alfa')).toBeChecked()
    await userEvent.click(screen.getByLabelText('Alfa'))
    expect(onChange).toHaveBeenLastCalledWith([], true)
  })
})

describe('FiltroMulti: busca digitando (097 L1, CA-10 a CA-16)', () => {
  const lista = [
    { id: 'a', nome: 'Avaliação' },
    { id: 'b', nome: 'Beta' },
    { id: 'c', nome: 'Gestão' },
  ]
  const montar = (
    sel: string[] = [],
    onChange = vi.fn(),
    variante: 'popover' | 'lista' = 'popover',
  ) =>
    render(
      <FiltroMulti
        id="x"
        rotulo="Equipe"
        opcoes={lista}
        selecionados={sel}
        onChange={onChange}
        variante={variante}
      />,
    )

  it('CA-10: abre com o campo Buscar focado, mesmo com lista curta', async () => {
    const u = userEvent.setup()
    montar()
    await u.click(screen.getByRole('button', { name: 'Equipe: Todas' }))
    expect(screen.getByLabelText(/^Buscar/)).toHaveFocus()
  })

  it('CA-11: ignora maiúsculas e acentos e anuncia a contagem', async () => {
    const u = userEvent.setup()
    montar()
    await u.click(screen.getByRole('button', { name: 'Equipe: Todas' }))
    await u.type(screen.getByLabelText(/^Buscar/), 'AVALIACAO')
    expect(screen.getByLabelText('Avaliação')).toBeInTheDocument()
    expect(screen.queryByLabelText('Beta')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('1 opção encontrada.')
  })

  it('CA-12: sem resultado mostra a mensagem e anuncia', async () => {
    const u = userEvent.setup()
    montar()
    await u.click(screen.getByRole('button', { name: 'Equipe: Todas' }))
    await u.type(screen.getByLabelText(/^Buscar/), 'zzz')
    expect(screen.getByText('Nenhuma opção com “zzz”.')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma opção encontrada.')
  })

  it('CA-13: a seleção fora da busca continua aplicada e é contada', async () => {
    const u = userEvent.setup()
    const onChange = vi.fn()
    montar(['a'], onChange)
    await u.click(screen.getByRole('button', { name: 'Equipe: Avaliação' }))
    await u.type(screen.getByLabelText(/^Buscar/), 'beta')
    expect(screen.getByText(/1 selecionada fora da busca/)).toBeInTheDocument()
    await u.click(screen.getByLabelText('Beta'))
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b'], expect.any(Boolean))
  })

  it('CA-14: teclado: seta para baixo, setas, Enter com uma opção, Esc limpa e depois fecha', async () => {
    const u = userEvent.setup()
    const onChange = vi.fn()
    montar([], onChange)
    const botao = screen.getByRole('button', { name: 'Equipe: Todas' })
    await u.click(botao)
    await u.keyboard('{ArrowDown}')
    expect(screen.getByLabelText('Avaliação')).toHaveFocus()
    await u.keyboard('{ArrowDown}')
    expect(screen.getByLabelText('Beta')).toHaveFocus()
    await u.keyboard('{ArrowUp}{ArrowUp}')
    expect(screen.getByLabelText(/^Buscar/)).toHaveFocus()
    await u.type(screen.getByLabelText(/^Buscar/), 'beta{Enter}')
    expect(onChange).toHaveBeenLastCalledWith(['b'], expect.any(Boolean))
    await u.keyboard('{Escape}')
    expect(screen.getByLabelText(/^Buscar/)).toHaveValue('')
    expect(screen.getByLabelText(/^Buscar/)).toBeInTheDocument()
    await u.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByLabelText('Buscar')).not.toBeInTheDocument())
    expect(screen.getByTestId('filtro-x')).toHaveFocus()
  })

  it('CA-14: Enter com várias opções ou nenhuma não marca nada; seta no fim e outras teclas não movem o foco', async () => {
    const u = userEvent.setup()
    const onChange = vi.fn()
    montar([], onChange)
    await u.click(screen.getByRole('button', { name: 'Equipe: Todas' }))
    await u.keyboard('{Enter}')
    await u.type(screen.getByLabelText(/^Buscar/), 'zzz{Enter}{ArrowDown}')
    expect(onChange).not.toHaveBeenCalled()
    await u.clear(screen.getByLabelText(/^Buscar/))
    await u.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}')
    expect(screen.getByLabelText('Gestão')).toHaveFocus()
    await u.keyboard('a')
    expect(screen.getByLabelText('Gestão')).toHaveFocus()
  })

  it('CA-15: fechar zera o texto', async () => {
    const u = userEvent.setup()
    montar()
    await u.click(screen.getByRole('button', { name: 'Equipe: Todas' }))
    await u.type(screen.getByLabelText(/^Buscar/), 'beta')
    await u.click(screen.getByRole('button', { name: 'Fechar' }))
    await u.click(screen.getByTestId('filtro-x'))
    expect(screen.getByLabelText(/^Buscar/)).toHaveValue('')
  })

  it('CA-16: a variante lista (folha mobile) tem o mesmo campo', async () => {
    const u = userEvent.setup()
    montar([], vi.fn(), 'lista')
    await u.type(screen.getByLabelText(/^Buscar/), 'gestao')
    expect(screen.getByLabelText('Gestão')).toBeInTheDocument()
    expect(screen.queryByLabelText('Beta')).not.toBeInTheDocument()
    await u.keyboard('{Escape}')
    expect(screen.getByLabelText(/^Buscar/)).toHaveValue('')
  })

  it('CA-16: Esc com o foco numa opção limpa a busca e mantém o popover aberto', async () => {
    const u = userEvent.setup()
    montar()
    await u.click(screen.getByRole('button', { name: 'Equipe: Todas' }))
    await u.type(screen.getByLabelText(/^Buscar/), 'beta')
    await u.keyboard('{ArrowDown}')
    expect(screen.getByLabelText('Beta')).toHaveFocus()
    await u.keyboard('{Escape}')
    expect(screen.getByLabelText(/^Buscar/)).toHaveValue('')
    expect(screen.getByLabelText('Avaliação')).toBeInTheDocument()
  })

  it('CA-16: na folha, Esc com o foco numa opção limpa a busca', async () => {
    const u = userEvent.setup()
    montar([], vi.fn(), 'lista')
    await u.type(screen.getByLabelText(/^Buscar/), 'gestao')
    await u.keyboard('{ArrowDown}')
    expect(screen.getByLabelText('Gestão')).toHaveFocus()
    await u.keyboard('{Escape}')
    expect(screen.getByLabelText(/^Buscar/)).toHaveValue('')
    expect(screen.getByLabelText('Beta')).toBeInTheDocument()
  })
})
