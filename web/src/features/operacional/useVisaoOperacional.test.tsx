import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { limparBuscaPendente } from '@/features/filtros/buscaPendente'
import { useVisaoOperacional } from './useVisaoOperacional'

function Sonda() {
  const { visao, escolher } = useVisaoOperacional()
  const l = useLocation()
  return (
    <div>
      <output data-testid="visao">{visao}</output>
      <output data-testid="url">{`${l.pathname}${l.search}${l.hash}`}</output>
      <output data-testid="estado">{JSON.stringify(l.state)}</output>
      <button onClick={() => escolher('sustentacao')}>sust</button>
      <button onClick={() => escolher('resumo')}>resumo</button>
    </div>
  )
}

function montar(url: string) {
  limparBuscaPendente()
  const roteador = createMemoryRouter([{ path: '*', element: <Sonda /> }], {
    initialEntries: [url],
  })
  render(<RouterProvider router={roteador} />)
  return roteador
}

const url = () => screen.getByTestId('url').textContent

describe('useVisaoOperacional', () => {
  it('sem parâmetro é o Resumo e a URL não muda', () => {
    montar('/operacional?equipe=a')
    expect(screen.getByTestId('visao')).toHaveTextContent('resumo')
    expect(url()).toBe('/operacional?equipe=a')
  })

  it('cadencia=resumo é normalizada com replace (sem entrada no histórico)', async () => {
    const r = montar('/operacional?cadencia=resumo&equipe=a')
    await waitFor(() => expect(url()).toBe('/operacional?equipe=a'))
    expect(r.state.historyAction).toBe('REPLACE')
  })

  it('valor desconhecido: Resumo, URL corrigida e aviso no estado', async () => {
    montar('/operacional?cadencia=xyz')
    await waitFor(() => expect(url()).toBe('/operacional'))
    expect(screen.getByTestId('visao')).toHaveTextContent('resumo')
    expect(screen.getByTestId('estado').textContent).toContain('visão \\"xyz\\"')
  })

  it('o hash vence a cadencia e o hash é mantido', async () => {
    montar('/operacional?cadencia=diaria&sust_prioridade=p1#s1')
    await waitFor(() => expect(url()).toBe('/operacional?cadencia=sustentacao&sust_prioridade=p1#s1'))
    expect(screen.getByTestId('visao')).toHaveTextContent('sustentacao')
  })

  it('escolher empilha no histórico, não mexe nos outros parâmetros e o Voltar desfaz', async () => {
    const r = montar('/operacional?cadencia=semanal&equipe=x&periodo=4s#o3')
    await waitFor(() => expect(url()).toBe('/operacional?cadencia=semanal&equipe=x&periodo=4s#o3'))
    await userEvent.click(screen.getByText('sust'))
    await waitFor(() =>
      expect(url()).toBe('/operacional?cadencia=sustentacao&equipe=x&periodo=4s'),
    )
    expect(r.state.historyAction).toBe('PUSH')
    await userEvent.click(screen.getByText('resumo'))
    await waitFor(() => expect(url()).toBe('/operacional?equipe=x&periodo=4s'))
    await r.navigate(-1)
    await waitFor(() => expect(screen.getByTestId('visao')).toHaveTextContent('sustentacao'))
  })

  it('escolher o Resumo sem outros parâmetros deixa a URL limpa', async () => {
    montar('/operacional?cadencia=sustentacao')
    await userEvent.click(screen.getByText('resumo'))
    await waitFor(() => expect(url()).toBe('/operacional'))
  })
})
