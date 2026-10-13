import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FILTROS_FLUXO } from '@/features/painel/testes/fonteFixa'
import userEvent from '@testing-library/user-event'
import { renderizarApp, renderizarCartao } from '@/test/helpers'
import { CartaoO13, CartaoO16, CartaoO6 } from './fluxo'

vi.setConfig({ testTimeout: 45000 })

describe('O6 Previsibilidade e links para o O15', () => {
  it('O6 mostra a referência e nunca "Fora da meta" (regra anti-meta, L-7)', async () => {
    renderizarCartao(<CartaoO6 filtros={FILTROS_FLUXO} />)
    const cartao = await screen.findByTestId('metrica-O6')
    await waitFor(() => expect(cartao).toHaveAttribute('data-estado', 'ok'))
    expect(cartao.textContent).toMatch(/Referência do briefing: abaixo de 2,5/)
    expect(cartao.textContent).not.toMatch(/fora da meta/i)
  })

  it.each([
    ['O13', CartaoO13],
    ['O16', CartaoO16],
  ] as const)('%s tem link para o cartão O15 (L-1)', async (codigo, Cartao) => {
    renderizarCartao(<Cartao filtros={FILTROS_FLUXO} />)
    const cartao = await screen.findByTestId(`metrica-${codigo}`)
    await waitFor(() => expect(cartao).toHaveAttribute('data-estado', 'ok'))
    expect(
      screen.getByRole('link', { name: 'Onde os bugs são encontrados (O15)' }),
    ).toHaveAttribute('href', '#o15')
  })

  it('com o O15 oculto nas preferências, o O13 cita o O15 em texto, sem link morto', async () => {
    window.localStorage.setItem(
      'metricas-dspd:preferencias:v1',
      JSON.stringify({
        versao: 1,
        paineis: { operacional: { ocultar: ['o15'] } },
        atualizadoEm: '2026-10-10T00:00:00.000Z',
      }),
    )
    renderizarApp('/operacional?cadencia=semanal')
    await userEvent.setup().click(await screen.findByText(/Mais métricas deste painel/))
    const o13 = await screen.findByTestId('metrica-O13')
    await waitFor(() => expect(o13).toHaveAttribute('data-estado', 'ok'))
    expect(o13).toHaveTextContent('Leia junto com Onde os bugs são encontrados (O15).')
    expect(within(o13).queryByRole('link', { name: /O15/ })).not.toBeInTheDocument()
  })
})
