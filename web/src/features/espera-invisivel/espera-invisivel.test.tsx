import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderizarApp } from '@/test/helpers'

const URL_DO: Record<string, string> = {
  'EI-FL1': '/operacional?cadencia=semanal',
  'EI-FL2': '/tatico',
  'EI-FL3': '/estrategico',
  'EI-SUST': '/sustentacao',
}

async function pronto(codigo: string, url = URL_DO[codigo] as string) {
  const r = renderizarApp(url)
  const el = await screen.findByTestId(`metrica-${codigo}`)
  await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
  return { ...r, el }
}

describe('Espera invisível por nível, segmentada', () => {
  it.each(['FL1', 'FL2', 'FL3', 'SUST'])(
    '%s: o painel traz só a espera invisível do próprio nível, com id de âncora estável',
    async (n) => {
      const { el } = await pronto(`EI-${n}`)
      expect(el).toHaveAttribute('id', `ei-${n.toLowerCase()}`)
      for (const outro of ['FL1', 'FL2', 'FL3', 'SUST'].filter((x) => x !== n))
        expect(screen.queryByTestId(`metrica-EI-${outro}`)).toBeNull()
    },
  )

  it('FL1: abas por tipo, uma por vez, sem aba "Todos"; cada aba tem as duas visões juntas e o índice', async () => {
    const { el, roteador } = await pronto('EI-FL1')
    const abas = within(el).getAllByRole('tab')
    expect(abas.length).toBeGreaterThanOrEqual(5)
    expect(within(el).queryByRole('tab', { name: /todos/i })).toBeNull()
    expect(abas[0]).toHaveAttribute('aria-selected', 'true')
    // mesma aba: cliente e time sempre em par
    expect(within(el).getByTestId('ei-cliente-fl1-incidente')).toBeInTheDocument()
    expect(within(el).getByTestId('ei-time-fl1-incidente')).toBeInTheDocument()
    expect(within(el).getByTestId('ei-indice-fl1-incidente')).toHaveTextContent(
      'Espera invisível: 16%',
    )
    expect(within(el).queryByText('Acima de 50%')).toBeNull()
    await userEvent.click(within(el).getByRole('tab', { name: /Requisição/ }))
    expect(roteador.state.location.search).toContain('ei_fl1=requisicao')
    expect(within(el).queryByTestId('ei-indice-fl1-incidente')).toBeNull()
    expect(within(el).getByTestId('ei-indice-fl1-requisicao')).toHaveTextContent('54%')
    // selo com ícone + texto acima de 50%
    expect(within(el).getByText('Acima de 50%')).toBeInTheDocument()
    expect(within(el).getByTestId('ei-segmento-fl1-requisicao')).toHaveTextContent(
      'Visão do cliente',
    )
    expect(within(el).getByTestId('ei-segmento-fl1-requisicao')).toHaveTextContent('Visão do time')
  })

  it('aba com amostra insuficiente continua selecionável: nenhuma das duas visões é publicada', async () => {
    const { el } = await pronto('EI-FL1')
    const aba = within(el).getByRole('tab', { name: /Dívida técnica/ })
    expect(aba).toHaveTextContent('amostra insuficiente')
    await userEvent.click(aba)
    const ins = within(el).getByTestId('amostra-insuficiente-EI-FL1')
    expect(ins).toHaveTextContent(/8 de 20 itens mínimos/)
    expect(within(el).queryByTestId('ei-cliente-fl1-divida-tecnica')).toBeNull()
    expect(within(el).queryByTestId('ei-time-fl1-divida-tecnica')).toBeNull()
    expect(within(el).queryByTestId('par-indice')).toBeNull()
  })

  it('FL2 não segmenta (sem abas); FL3 mostra Iniciativa e Melhoria separadas, ambas em amostra insuficiente', async () => {
    const { el: fl2, unmount } = await pronto('EI-FL2')
    expect(within(fl2).queryByRole('tablist')).toBeNull()
    expect(within(fl2).getByTestId('ei-indice-fl2')).toHaveTextContent('64%')
    unmount()
    const { el: fl3 } = await pronto('EI-FL3')
    const abas = within(fl3)
      .getAllByRole('tab')
      .map((a) => a.textContent)
    expect(abas.some((t) => t.startsWith('Melhoria'))).toBe(true)
    expect(abas.some((t) => t.startsWith('Iniciativa'))).toBe(true)
    expect(within(fl3).getByTestId('amostra-insuficiente-EI-FL3')).toBeInTheDocument()
    expect(within(fl3).queryByRole('button', { name: /evolução mensal/ })).toBeNull()
    await userEvent.click(within(fl3).getByRole('tab', { name: /Iniciativa/ }))
    expect(within(fl3).getByTestId('amostra-insuficiente-EI-FL3')).toHaveTextContent(/0 de 20/)
  })

  it('Sustentação: abas P1 a P5 em horas úteis, legenda de fonte diferente e sem unidade de dias do fluxo', async () => {
    const { el } = await pronto('EI-SUST')
    const abas = within(el)
      .getAllByRole('tab')
      .map((a) => a.textContent.replace(/\s*\(.*$/, ''))
    expect(abas).toEqual(['P1', 'P2', 'P3', 'P4', 'P5'])
    expect(within(el).getByTestId('ei-fonte-sust')).toHaveTextContent('Fonte diferente (Acelerato)')
    expect(within(el).getByTestId('ei-fonte-sust')).toHaveTextContent('Não comparável')
    await userEvent.click(within(el).getByRole('tab', { name: /^P3/ }))
    expect(within(el).getByTestId('ei-cliente-sust-p3')).toHaveTextContent(/h úteis/)
    expect(within(el).getByTestId('ei-time-sust-p3')).toBeInTheDocument()
    expect(within(el).getByText('Fonte: Acelerato')).toBeInTheDocument()
    expect(within(el).queryByText('Fonte: BusinessMap')).toBeNull()
  })

  it('o painel Sustentação traz o cartão compacto, com a aba nomeada no título e o botão de evolução', async () => {
    const { el } = await pronto('EI-SUST', '/sustentacao?ei_sust=p3')
    expect(within(el).getByRole('heading', { level: 3 })).toHaveTextContent(/Sustentação · P3/)
    expect(
      within(el).getByRole('button', { name: 'Ver evolução mensal, Sustentação' }),
    ).toBeInTheDocument()
    expect(within(el).queryByRole('link', { name: /evolução/ })).toBeNull()
  })

  it('"Ver evolução mensal" abre gráfico e tabela no cartão, sem mudar a URL; segundo clique e Esc fecham e devolvem o foco', async () => {
    const { el, roteador } = await pronto('EI-FL1')
    const antes = roteador.state.location.pathname + roteador.state.location.search
    const botao = within(el).getByRole('button', { name: 'Ver evolução mensal, Operacional' })
    expect(botao).toHaveAttribute('aria-expanded', 'false')
    expect(within(el).queryByTestId('tabela-EI-FL1-evolucao')).toBeNull()
    await userEvent.click(botao)
    expect(botao).toHaveAttribute('aria-expanded', 'true')
    expect(botao).toHaveTextContent('Esconder evolução mensal')
    expect(botao).toHaveAttribute('aria-controls', within(el).getByTestId(/^ei-evolucao-/).id)
    await userEvent.click(within(el).getByRole('button', { name: /tabela/i }))
    expect(within(el).getByTestId('tabela-EI-FL1-evolucao')).toBeInTheDocument()
    expect(roteador.state.location.pathname + roteador.state.location.search).toBe(antes)
    await userEvent.click(botao)
    expect(botao).toHaveAttribute('aria-expanded', 'false')
    expect(within(el).queryByTestId(/^ei-evolucao-/)).toBeNull()
    await userEvent.click(botao)
    ;(within(el).getAllByRole('tab')[0] as HTMLElement).focus()
    await userEvent.keyboard('a')
    expect(botao).toHaveAttribute('aria-expanded', 'true')
    ;(document.activeElement as HTMLElement).blur()
    await userEvent.keyboard('{Escape}')
    expect(botao).toHaveAttribute('aria-expanded', 'true')
    ;(within(el).getAllByRole('tab')[0] as HTMLElement).focus()
    await userEvent.keyboard('{Escape}')
    expect(botao).toHaveAttribute('aria-expanded', 'false')
    expect(botao).toHaveFocus()
  })

  it('FL2 (sem abas) também abre a evolução mensal no cartão', async () => {
    const { el } = await pronto('EI-FL2')
    await userEvent.click(within(el).getByRole('button', { name: 'Ver evolução mensal, Tático' }))
    expect(within(el).getByTestId('ei-evolucao-fl2')).toBeInTheDocument()
  })

  it('Esc com o gráfico fechado não faz nada; trocar a aba com o gráfico aberto atualiza a URL e o gráfico', async () => {
    const { el, roteador } = await pronto('EI-FL1')
    await userEvent.click(within(el).getAllByRole('tab')[0] as HTMLElement)
    await userEvent.keyboard('{Escape}')
    const botao = within(el).getByRole('button', { name: /Ver evolução mensal/ })
    expect(botao).not.toHaveFocus()
    await userEvent.click(botao)
    const grafico = () => within(el).getByTestId(/^ei-evolucao-/)
    expect(grafico().getAttribute('data-testid')).toBe('ei-evolucao-fl1-incidente')
    await userEvent.click(within(el).getByRole('tab', { name: /Requisição/ }))
    expect(roteador.state.location.search).toContain('ei_fl1=requisicao')
    expect(grafico().getAttribute('data-testid')).toBe('ei-evolucao-fl1-requisicao')
  })
})
