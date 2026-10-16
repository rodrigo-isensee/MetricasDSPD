import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderizarBarra } from '@/test/helpers'

// Integração filtros <-> URL com a barra isolada (sem gráficos): o custo por teste é baixo e estável
// sob carga (K-057). O painel completo continua coberto em app.test.tsx e nos testes de cada painel.
const busca = (r: { roteador: { state: { location: { search: string; pathname: string } } } }) =>
  new URLSearchParams(r.roteador.state.location.search)

describe('filtros ↔ URL', () => {
  it('Operacional e Tático mostram 4 filtros; Estratégico só Sistema e Período com explicação; Sustentação os próprios', async () => {
    const op = renderizarBarra('/operacional')
    await screen.findByTestId('filtro-equipe')
    for (const f of ['equipe', 'tipo', 'sistema', 'periodo'])
      expect(screen.getByTestId(`filtro-${f}`)).toBeInTheDocument()
    op.unmount()

    const es = renderizarBarra('/estrategico')
    await screen.findByTestId('filtro-sistema')
    expect(screen.queryByTestId('filtro-equipe')).toBeNull()
    expect(screen.queryByTestId('filtro-tipo')).toBeNull()
    expect(
      screen.getByRole('button', { name: 'Por que não há filtro de equipe?' }),
    ).toBeInTheDocument()
    es.unmount()

    renderizarBarra('/sustentacao')
    await screen.findByTestId('filtro-prioridade')
    expect(screen.getByTestId('filtro-equipe')).toBeInTheDocument()
    expect(screen.queryByTestId('filtro-sistema')).toBeNull()
    expect(screen.queryByTestId('filtro-tipo')).toBeNull()
  })

  it('marcar um valor atualiza a URL na hora (sem botão Aplicar), cria chip e o Voltar desfaz', async () => {
    const r = renderizarBarra('/operacional')
    await userEvent.click(await screen.findByTestId('filtro-equipe'))
    const opcao = await screen.findByLabelText('Fluig')
    await userEvent.click(opcao)
    expect(busca(r).get('equipe')).toBe('fluig')
    expect(screen.queryByRole('button', { name: 'Aplicar' })).toBeNull()
    expect(
      await screen.findByRole('button', { name: 'Remover filtro Equipe: Fluig' }),
    ).toBeInTheDocument()
    await act(async () => {
      await r.roteador.navigate(-1)
    })
    expect(busca(r).has('equipe')).toBe(false)
    await waitFor(() => expect(screen.queryByTestId('chip-filtro-equipe')).toBeNull())
  })

  it('só valores fora do padrão entram na URL; marcar todos equivale a Todos; remover chip remove só aquele filtro', async () => {
    const r = renderizarBarra('/operacional?equipe=fluig&sistema=protheus&periodo=4s')
    const chip = await screen.findByRole('button', { name: 'Remover filtro Equipe: Fluig' })
    await userEvent.click(chip)
    expect(busca(r).has('equipe')).toBe(false)
    expect(busca(r).get('sistema')).toBe('protheus')
    expect(busca(r).get('periodo')).toBe('4s')
    // período padrão do painel (12s) nunca aparece na URL
    await userEvent.click(screen.getByRole('button', { name: /Remover filtro Período/ }))
    expect(busca(r).has('periodo')).toBe(false)
  })

  it('"Limpar filtros" só aparece com filtro fora do padrão, restaura o padrão e anuncia "Filtros limpos."', async () => {
    const r = renderizarBarra('/operacional')
    await screen.findByTestId('filtro-equipe')
    expect(screen.queryByTestId('limpar-filtros')).toBeNull()
    r.unmount()
    const r2 = renderizarBarra('/operacional?equipe=fluig&periodo=6m&cadencia=semanal')
    await userEvent.click(await screen.findByTestId('limpar-filtros'))
    expect(busca(r2).has('equipe')).toBe(false)
    expect(busca(r2).has('periodo')).toBe(false)
    expect(busca(r2).get('cadencia')).toBe('semanal')
    expect(screen.queryByTestId('limpar-filtros')).toBeNull()
    expect(screen.getByText('Filtros limpos.')).toBeInTheDocument()
  })

  it('valor inválido no link é ignorado, a URL é corrigida e aparece o aviso', async () => {
    const r = renderizarBarra('/operacional?equipe=fluig,xyz&tipo=nada&periodo=99x')
    expect(await screen.findByTestId('aviso-filtros-invalidos')).toHaveTextContent(
      'Alguns filtros do link não existem e foram ignorados: equipe "xyz", tipo "nada", período "99x"',
    )
    await waitFor(() => expect(busca(r).get('equipe')).toBe('fluig'))
    expect(busca(r).has('tipo')).toBe(false)
    expect(busca(r).has('periodo')).toBe(false)
    await userEvent.click(screen.getByRole('button', { name: 'Entendi' }))
    expect(screen.queryByTestId('aviso-filtros-invalidos')).toBeNull()
  })

  it('período personalizado inválido no link: o aviso fala do período, não de filtros inexistentes', async () => {
    renderizarBarra('/operacional?periodo=custom')
    const aviso = await screen.findByTestId('aviso-filtros-invalidos')
    expect(aviso).toHaveTextContent('O período personalizado do link é inválido')
    expect(aviso).not.toHaveTextContent('filtros do link não existem')
  })

  it('2 ou mais equipes: aviso de consolidado; nenhum rótulo compara equipes', async () => {
    renderizarBarra('/operacional?equipe=fluig,senior')
    expect(await screen.findByTestId('aviso-consolidado')).toHaveTextContent(
      'Resultado consolidado de 2 equipes. O sistema não compara equipes.',
    )
  })

  it('período personalizado valida as datas junto dos campos', async () => {
    const r = renderizarBarra('/operacional')
    await userEvent.click(await screen.findByTestId('filtro-periodo'))
    await userEvent.click(await screen.findByRole('radio', { name: 'Personalizado' }))
    const de = screen.getByLabelText('De')
    const ate = screen.getByLabelText('Até')
    await userEvent.type(de, '2026-09-01')
    await userEvent.type(ate, '2026-08-01')
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar período' }))
    expect(
      await screen.findByText('A data inicial precisa ser anterior à data final.'),
    ).toBeInTheDocument()
    expect(busca(r).has('periodo')).toBe(false)
    await userEvent.clear(ate)
    await userEvent.type(ate, '2026-12-31')
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar período' }))
    expect(
      await screen.findByText(/A data final não pode passar de 09\/10\/2026/),
    ).toBeInTheDocument()
    await userEvent.clear(ate)
    await userEvent.type(ate, '2026-09-03')
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar período' }))
    expect(
      await screen.findByText('Escolha um intervalo de pelo menos 7 dias.'),
    ).toBeInTheDocument()
    await userEvent.clear(ate)
    await userEvent.type(ate, '2026-09-30')
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar período' }))
    await waitFor(() => expect(busca(r).get('periodo')).toBe('custom'))
    expect(busca(r).get('de')).toBe('2026-09-01')
    expect(busca(r).get('ate')).toBe('2026-09-30')
  })

  it('filtros do fluxo não são herdados pela Sustentação e vice-versa', async () => {
    const r = renderizarBarra('/sustentacao?equipe=fluig&prioridade=p2')
    expect(
      await screen.findByRole('button', {
        name: 'Remover filtro Equipe de sustentação: SSSC FLUIG',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Remover filtro Prioridade: P2' }),
    ).toBeInTheDocument()
    expect(busca(r).get('equipe')).toBe('fluig')
  })
})
