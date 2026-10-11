import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { fonteDeTeste, renderizarApp } from '@/test/helpers'

const PAINEIS = [
  ['/operacional?cadencia=semanal', 8, ['O5', 'O6', 'O8', 'O11', 'O13', 'O14', 'O16', 'O17']],
  ['/tatico', 2, ['T6', 'T8']],
  ['/estrategico', 2, ['E4', 'E5']],
  ['/sustentacao', 5, ['S8', 'S9', 'S10', 'S11', 'S12']],
] as const

// Abrir a seção monta até 8 gráficos em jsdom: folga para máquina carregada.
vi.setConfig({ testTimeout: 45000 })

describe('Mais métricas deste painel', () => {
  it.each(PAINEIS)(
    '%s: recolhida, com a contagem, e sem buscar dado antes de abrir',
    async (url, n, ids) => {
      const spy = vi.spyOn(fonteDeTeste, 'obter')
      renderizarApp(url)
      const resumo = await screen.findByText(
        new RegExp(`Mais métricas deste painel · ${n} complementares`),
      )
      const det = screen.getByTestId('mais-metricas') as HTMLDetailsElement
      expect(det.open).toBe(false)
      await waitFor(() => expect(spy).toHaveBeenCalled())
      for (const id of ids) expect(spy.mock.calls.some((c) => c[0] === id)).toBe(false)
      expect(screen.queryByTestId(`metrica-${ids[0]}`)).not.toBeInTheDocument()
      await userEvent.setup().click(resumo)
      expect(det.open).toBe(true)
      for (const id of ids) {
        const c = await screen.findByTestId(`metrica-${id}`)
        await waitFor(() =>
          expect(c).toHaveAttribute('data-estado', expect.stringMatching(/^(ok|vazio)$/)),
        )
        expect(within(c).getByTestId('selo-ficticio')).toHaveTextContent('Dados fictícios')
      }
      spy.mockRestore()
    },
  )

  it('fechar de novo desmonta os cartões', async () => {
    const u = userEvent.setup()
    renderizarApp('/estrategico')
    const resumo = await screen.findByText(/Mais métricas deste painel/)
    await u.click(resumo)
    await screen.findByTestId('metrica-E4')
    await u.click(resumo)
    expect(screen.queryByTestId('metrica-E4')).not.toBeInTheDocument()
  })

  it('"Leia junto" no cartão do núcleo abre a seção e leva o foco ao cartão', async () => {
    const u = userEvent.setup()
    renderizarApp('/operacional?cadencia=semanal')
    const leia = await screen.findByTestId('leia-junto-o3')
    await u.click(within(leia).getByRole('link', { name: /O6 Previsibilidade/ }))
    const cartao = await screen.findByTestId('metrica-O6')
    await waitFor(() =>
      expect(within(cartao).getByRole('heading', { name: 'Previsibilidade' })).toHaveFocus(),
    )
  })

  it('link direto com #id (vindo do catálogo) abre a seção no cartão', async () => {
    renderizarApp('/sustentacao#s9')
    expect(await screen.findByTestId('metrica-S9')).toBeInTheDocument()
    expect((screen.getByTestId('mais-metricas') as HTMLDetailsElement).open).toBe(true)
  })

  it('ocultar uma complementar reduz a contagem; "Leia junto" some com o par oculto', async () => {
    const u = userEvent.setup()
    renderizarApp('/operacional?cadencia=semanal')
    await u.click(await screen.findByRole('link', { name: /O6 Previsibilidade/ }))
    await u.click(await screen.findByRole('button', { name: 'Ocultar esta métrica O6' }))
    expect(await screen.findByText(/· 7 complementares/)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /O6 Previsibilidade/ })).not.toBeInTheDocument()
  })

  it('pedir um complementar oculto o mostra de novo (link direto)', async () => {
    window.localStorage.setItem(
      'metricas-dspd:preferencias:v1',
      JSON.stringify({
        versao: 1,
        paineis: { tatico: { ocultar: ['t6'] } },
        atualizadoEm: '2026-10-10T00:00:00.000Z',
      }),
    )
    renderizarApp('/tatico#t6')
    expect(await screen.findByTestId('metrica-T6')).toBeInTheDocument()
  })

  it('sem complementar visível a seção some; com o painel todo oculto também', async () => {
    window.localStorage.setItem(
      'metricas-dspd:preferencias:v1',
      JSON.stringify({
        versao: 1,
        paineis: { tatico: { ocultar: ['t6', 't8'] } },
        atualizadoEm: '2026-10-10T00:00:00.000Z',
      }),
    )
    renderizarApp('/tatico')
    await screen.findByRole('heading', { level: 1, name: 'Tático' })
    await screen.findByTestId('botao-metricas')
    expect(screen.queryByTestId('mais-metricas')).not.toBeInTheDocument()
  })

  it('complementares não aparecem em "Pede atenção"', async () => {
    renderizarApp('/sustentacao')
    await screen.findByTestId('mais-metricas')
    const faixa = screen.queryByTestId('faixa-atencao')
    if (faixa) expect(faixa.textContent).not.toMatch(/S8|S9|S10|S11|S12/)
  })
})
