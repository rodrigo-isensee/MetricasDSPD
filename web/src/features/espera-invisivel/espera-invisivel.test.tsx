import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderizarApp } from '@/test/helpers'

async function pronto(codigo: string, url = '/espera-invisivel') {
  const r = renderizarApp(url)
  const el = await screen.findByTestId(`metrica-${codigo}`)
  await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
  return { ...r, el }
}

describe('Espera invisível por nível, segmentada', () => {
  it('/espera-invisivel mostra os quatro blocos com ids de âncora estáveis; cada painel só o seu', async () => {
    renderizarApp('/espera-invisivel')
    for (const n of ['FL1', 'FL2', 'FL3', 'SUST']) {
      const el = await screen.findByTestId(`metrica-EI-${n}`)
      expect(el).toHaveAttribute('id', `ei-${n.toLowerCase()}`)
    }
  })

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
    const r = renderizarApp('/espera-invisivel')
    const fl2 = await screen.findByTestId('metrica-EI-FL2')
    await waitFor(() => expect(fl2).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
    expect(within(fl2).queryByRole('tablist')).toBeNull()
    expect(within(fl2).getByTestId('ei-indice-fl2')).toHaveTextContent('64%')
    const fl3 = screen.getByTestId('metrica-EI-FL3')
    await waitFor(() => expect(fl3).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
    const abas = within(fl3)
      .getAllByRole('tab')
      .map((a) => a.textContent)
    expect(abas.some((t) => t.startsWith('Melhoria'))).toBe(true)
    expect(abas.some((t) => t.startsWith('Iniciativa'))).toBe(true)
    expect(within(fl3).getByTestId('amostra-insuficiente-EI-FL3')).toBeInTheDocument()
    await userEvent.click(within(fl3).getByRole('tab', { name: /Iniciativa/ }))
    expect(within(fl3).getByTestId('amostra-insuficiente-EI-FL3')).toHaveTextContent(/0 de 20/)
    r.unmount()
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

  it('o painel Sustentação traz só o cartão EI-SUST, compacto, com a aba nomeada no título e "Ver evolução"', async () => {
    const { el } = await pronto('EI-SUST', '/sustentacao')
    expect(within(el).getByRole('heading', { level: 3 })).toHaveTextContent(/Sustentação · P\d/)
    expect(within(el).getByRole('link', { name: 'Ver evolução' })).toHaveAttribute(
      'href',
      '/espera-invisivel#ei-sust',
    )
    expect(screen.queryByTestId('metrica-EI-FL1')).toBeNull()
  })

  it('a série de FL1 mostra as duas linhas e a tabela alternativa com os mesmos números', async () => {
    const { el } = await pronto('EI-FL1')
    await userEvent.click(within(el).getByRole('button', { name: /tabela/i }))
    expect(within(el).getByTestId('tabela-EI-FL1')).toBeInTheDocument()
    expect(within(el).getByTestId('tabela-EI-FL1-evolucao')).toBeInTheDocument()
  })
})
