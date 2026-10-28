import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CATALOGO_CARTOES } from '@metricas-dspd/contratos'
import { fonteDeTeste, renderizarApp } from '@/test/helpers'

const PAINEIS = [
  ['/operacional?cadencia=semanal', 7, ['O5', 'O6', 'O8', 'O11', 'O13', 'O14', 'O16']],
  ['/tatico', 7, ['T6', 'T8', 'T11', 'T12', 'T10', 'T13', 'T14']],
  ['/estrategico', 6, ['E9', 'E4', 'E5', 'E6', 'E7', 'E8']],
  ['/operacional?cadencia=sustentacao', 6, ['S9', 'S10', 'S8', 'S11', 'O17', 'S12']],
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
        new RegExp(
          `Mais métricas ${url.startsWith('/operacional') ? 'desta visão' : 'deste painel'} · ${n} complementares`,
        ),
      )
      const det = screen.getByTestId<HTMLDetailsElement>('mais-metricas')
      expect(det.open).toBe(false)
      // Ao rolar até o resumo (clique, teclado), deixa 18 rem de contexto acima: o cartão do núcleo não fica sob o cabeçalho
      // fixo, que cobriria seus alvos de toque (axe target-size, COMP-01 a 1280 px).
      expect(resumo.closest('summary')).toHaveClass('scroll-mt-72')
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
        // O selo segue o `status` do catálogo do contrato: só onde falta fonte real.
        const mock = CATALOGO_CARTOES.find((x) => x.id === id.toLowerCase())?.status === 'mock'
        if (mock)
          expect(within(c).getByTestId('selo-ficticio')).toHaveTextContent('Dados fictícios')
        else expect(within(c).queryByTestId('selo-ficticio')).not.toBeInTheDocument()
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

  it('"Leia junto" do O3 lista O5, O6 e O8 e o caminho O3 para O5 abre o cartão', async () => {
    const u = userEvent.setup()
    renderizarApp('/operacional?cadencia=semanal')
    const leia = await screen.findByTestId('leia-junto-o3')
    expect(
      within(leia)
        .getAllByRole('link')
        .map((a) => a.textContent),
    ).toEqual(['O5 Eficiência de fluxo', 'O6 Previsibilidade', 'O8 Tamanho das demandas'])
    await u.click(within(leia).getByRole('link', { name: /O5 Eficiência de fluxo/ }))
    const cartao = await screen.findByTestId('metrica-O5')
    await waitFor(() =>
      expect(within(cartao).getByRole('heading', { name: 'Eficiência de fluxo' })).toHaveFocus(),
    )
  })

  it('link direto com #id (vindo do catálogo) abre a seção no cartão', async () => {
    renderizarApp('/operacional?cadencia=sustentacao#s9')
    expect(await screen.findByTestId('metrica-S9')).toBeInTheDocument()
    expect(screen.getByTestId<HTMLDetailsElement>('mais-metricas').open).toBe(true)
  })

  it('link direto com o id da seção de complementares (#compl-sust-qualidade) abre a seção e leva o foco ao título dela', async () => {
    renderizarApp('/operacional?cadencia=sustentacao#COMPL-SUST-QUALIDADE')
    const cartao = await screen.findByTestId('metrica-S8')
    expect(screen.getByTestId<HTMLDetailsElement>('mais-metricas').open).toBe(true)
    const secao = document.getElementById('compl-sust-qualidade') as HTMLElement
    expect(secao).toContainElement(cartao)
    await waitFor(() => expect(within(secao).getByRole('heading', { level: 2 })).toHaveFocus())
  })

  it('a antiga /sustentacao#compl-qualidade chega à mesma seção, aberta', async () => {
    renderizarApp('/sustentacao#compl-qualidade')
    expect(await screen.findByTestId('metrica-S8')).toBeInTheDocument()
    expect(screen.getByTestId<HTMLDetailsElement>('mais-metricas').open).toBe(true)
  })

  it('ocultar uma complementar reduz a contagem; "Leia junto" some com o par oculto', async () => {
    const u = userEvent.setup()
    renderizarApp('/operacional?cadencia=semanal')
    await u.click(await screen.findByRole('link', { name: /O6 Previsibilidade/ }))
    await u.click(await screen.findByRole('button', { name: 'Ocultar esta métrica O6' }))
    expect(await screen.findByText(/· 6 complementares/)).toBeInTheDocument()
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

  it('sem complementar visível a seção vira uma linha de aviso, nunca some calada', async () => {
    window.localStorage.setItem(
      'metricas-dspd:preferencias:v1',
      JSON.stringify({
        versao: 1,
        paineis: { tatico: { ocultar: ['t6', 't8', 't10', 't11', 't12', 't13', 't14'] } },
        atualizadoEm: '2026-10-10T00:00:00.000Z',
      }),
    )
    renderizarApp('/tatico')
    await screen.findByRole('heading', { level: 1, name: 'Tático' })
    await screen.findByTestId('botao-metricas')
    expect(screen.queryByTestId('mais-metricas')).not.toBeInTheDocument()
    expect(await screen.findByTestId('mais-metricas-ocultas')).toHaveTextContent(
      '7 complementares ocultas pelas suas preferências',
    )
  })

  it('na Sustentação, as 6 complementares ocultas aparecem na linha de aviso', async () => {
    window.localStorage.setItem(
      'metricas-dspd:preferencias:v1',
      JSON.stringify({
        versao: 1,
        paineis: { sustentacao: { ocultar: ['s8', 's9', 's10', 's11', 'o17', 's12'] } },
        atualizadoEm: '2026-10-10T00:00:00.000Z',
      }),
    )
    renderizarApp('/operacional?cadencia=sustentacao')
    expect(await screen.findByTestId('mais-metricas-ocultas')).toHaveTextContent(
      '6 complementares ocultas pelas suas preferências',
    )
  })

  it('complementares não aparecem em "Pede atenção"', async () => {
    renderizarApp('/operacional?cadencia=sustentacao')
    await screen.findByTestId('mais-metricas')
    const faixa = screen.queryByTestId('faixa-atencao')
    if (faixa) expect(faixa.textContent).not.toMatch(/S8|S9|S10|S11|S12/)
  })
})
