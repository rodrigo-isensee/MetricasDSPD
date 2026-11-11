import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { origemDaMetrica, type MetricaId } from '@metricas-dspd/contratos'
import { fonteDeTeste, renderizarApp, renderizarCartao } from '@/test/helpers'
import { FILTROS_FLUXO } from '@/features/painel/testes/fonteFixa'
import { CartaoO5 } from '@/features/complementares/fluxo'
import { CartaoO1 } from './components/CartaoO1'
import { CartaoO2 } from './components/CartaoO2'

vi.setConfig({ testTimeout: 45000 })

/** Fonte da API real depois do pedido 075 (lote 6b): BLOQUEADOS, O5 e O19 são reais e a parte de bloqueio do O1 e do O2 vem calculada, sem nota. */
const fonteApi = () =>
  Object.create(fonteDeTeste, { tipo: { value: 'api' } }) as typeof fonteDeTeste

describe('bloqueio com dado real (pedido 075, lote 6b; inverte o 065)', () => {
  it('W0: BLOQUEADOS, O5 e O19 são reais e o motivo de mock não existe mais', () => {
    for (const id of ['BLOQUEADOS', 'O5', 'O19'] as const)
      expect(origemDaMetrica(id), id).toBe('real')
  })

  it('W1: o cartão BLOQUEADOS publica, sem Sem dado real nem o motivo da coleta ausente', async () => {
    renderizarApp('/operacional?cadencia=diaria', fonteApi())
    const c = await screen.findByTestId('metrica-BLOQUEADOS')
    await waitFor(() => expect(c).toHaveAttribute('data-estado', 'ok'))
    expect(within(c).queryByTestId('estado-sem-dado-real-BLOQUEADOS')).not.toBeInTheDocument()
    expect(c.textContent).not.toContain('a coleta ainda não grava os bloqueios do quadro')
  })

  it('W2: O1 traz os bloqueados, sem "bloqueados: sem dado real" nem a nota; o WIP total fica', async () => {
    renderizarCartao(<CartaoO1 filtros={FILTROS_FLUXO} />, { fonte: fonteApi() })
    const c = await screen.findByTestId('metrica-O1')
    await waitFor(() => expect(c).toHaveAttribute('data-estado', 'ok'))
    expect(within(c).queryByTestId('o1-bloqueados-sem-dado')).not.toBeInTheDocument()
    expect(c.textContent).not.toMatch(/bloqueados: sem dado real/)
    expect(within(c).queryByText(/Bloqueios: sem dado real/)).not.toBeInTheDocument()
    expect(within(c).getByTestId('o1-dias-dentro')).toBeInTheDocument()
    expect(within(c).getByText(/Hoje há \d+/)).toBeInTheDocument()
  })

  it('W3: O2 sem "Sem dado real" na coluna Bloqueado e sem a nota; dispersão e P50/P85/P95 ficam', async () => {
    renderizarCartao(<CartaoO2 filtros={FILTROS_FLUXO} />, { fonte: fonteApi() })
    const c = await screen.findByTestId('metrica-O2')
    await waitFor(() => expect(c).toHaveAttribute('data-estado', 'ok'))
    const lista = await within(c).findByTestId('o2-lista')
    expect(within(lista).queryByText('Sem dado real')).not.toBeInTheDocument()
    const grafico = within(c).getByTestId('o2-grafico')
    expect(grafico.textContent).toMatch(/P50/)
    expect(grafico.textContent).toMatch(/P95/)
    expect(within(c).queryByText(/Bloqueios: sem dado real/)).not.toBeInTheDocument()
  })

  it('W4: O5 publica, sem Sem dado real nem o motivo "inflada"', async () => {
    renderizarCartao(<CartaoO5 filtros={FILTROS_FLUXO} />, { fonte: fonteApi() })
    const c = await screen.findByTestId('metrica-O5')
    await waitFor(() => expect(c).toHaveAttribute('data-estado', 'ok'))
    expect(within(c).queryByTestId('estado-sem-dado-real-O5')).not.toBeInTheDocument()
    expect(c.textContent).not.toContain('inflada')
  })

  it('W5: a faixa "Pede atenção" deixa de ser parcial por falta de dado de bloqueio', async () => {
    renderizarApp('/operacional?cadencia=diaria', fonteApi())
    const faixa = await screen.findByTestId('faixa-atencao')
    await waitFor(() => expect(faixa.querySelectorAll('li').length).toBeGreaterThan(0))
    expect(
      within(faixa).queryByTestId('faixa-atencao-sem-dado-real-parcial'),
    ).not.toBeInTheDocument()
  })
})

type Qualquer = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

/** O contrato ainda aceita bloqueados null no O1 (sai no lote 9b): o cartão não inventa 0 nem a série Bloqueados. */
const fonteBloqueadosNulo = (comEquipe: boolean) =>
  Object.create(fonteApi(), {
    obter: {
      value: async (id: MetricaId, ...resto: unknown[]) => {
        const r = await (fonteDeTeste.obter as (...a: unknown[]) => Promise<Qualquer>)(id, ...resto)
        if (id !== 'O1') return r
        r.hoje.bloqueados = null
        r.porTipoColuna = r.porTipoColuna.map((c: Qualquer) => ({ ...c, bloqueados: null }))
        r.porColuna = comEquipe
          ? [
              {
                coluna: 'Em execução',
                tipoColuna: 'execucao',
                limite: 5,
                itens: 3,
                bloqueados: null,
              },
            ]
          : null
        return r
      },
    },
  }) as typeof fonteDeTeste

describe('O1 com bloqueados null (contrato ainda o aceita)', () => {
  it.each([false, true])(
    'mostra o WIP sem "deles bloqueados" (com equipe: %s)',
    async (comEquipe) => {
      renderizarCartao(<CartaoO1 filtros={FILTROS_FLUXO} />, {
        fonte: fonteBloqueadosNulo(comEquipe),
      })
      const c = await screen.findByTestId('metrica-O1')
      await waitFor(() => expect(c).toHaveAttribute('data-estado', 'ok'))
      expect(c.textContent).not.toMatch(/\d+ deles bloqueados/)
      expect(within(c).getByText(/Hoje há \d+/)).toBeInTheDocument()
    },
  )
})
