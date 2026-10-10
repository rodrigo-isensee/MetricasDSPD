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
    expect(onChange).toHaveBeenLastCalledWith([], true)
    await userEvent.click(screen.getByRole('button', { name: 'Limpar' }))
    expect(onChange).toHaveBeenLastCalledWith([], true)
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    // Ao reabrir, volta a empilhar.
    await userEvent.click(screen.getByRole('button', { name: 'Equipe: Alfa' }))
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
    expect(onChange).toHaveBeenLastCalledWith(['b'], true)
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

  it('painel sem personalizado (Estratégico) oferece só os períodos permitidos', async () => {
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
