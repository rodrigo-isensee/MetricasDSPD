import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { corpoSemDadoReal, origemDaMetrica, type MetricaId } from '@metricas-dspd/contratos'
import { SemDadoRealErro } from '@/data'
import { fonteDeTeste, renderizarApp, renderizarCartao } from '@/test/helpers'
import { FILTROS_FLUXO } from '@/features/painel/testes/fonteFixa'
import { CartaoO5 } from '@/features/complementares/fluxo'
import { CartaoO1 } from './components/CartaoO1'
import { CartaoO2 } from './components/CartaoO2'

vi.setConfig({ testTimeout: 45000 })

type Qualquer = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

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

const NOTA_065 = 'bloqueio-sem-dado-real'

/** Anula a parte de bloqueio como o servidor faz na base real (pedido 065): null com a nota, nunca 0. */
function semBloqueio065(id: MetricaId, r: Qualquer): Qualquer {
  if (id === 'O1') {
    r.hoje.bloqueados = null
    r.porColuna = r.porColuna?.map((c: Qualquer) => ({ ...c, bloqueados: null })) ?? null
    r.porTipoColuna = r.porTipoColuna.map((c: Qualquer) => ({ ...c, bloqueados: null }))
    r.serie = r.serie.map((p: Qualquer) => ({ ...p, bloqueados: null }))
    r.notas = [NOTA_065]
  }
  if (id === 'O2') {
    r.itens = r.itens.map((i: Qualquer) => ({ ...i, bloqueioMotivo: null }))
    r.notas = [NOTA_065]
  }
  return r
}

/** Fonte da API real: BLOQUEADOS e O5 fora do mapa respondem `sem-dado-real`; O1 e O2 vêm com a parte de bloqueio nula. */
const fonteApiSemBloqueio = () =>
  Object.create(fonteDeTeste, {
    tipo: { value: 'api' },
    obter: {
      value: async (id: MetricaId, ...resto: unknown[]) => {
        if (id === 'BLOQUEADOS' || id === 'O5') {
          // Motivo da época do 065, posto na própria resposta: o cliente ainda sabe mostrar um estado sem dado real com motivo.
          const c = corpoSemDadoReal(id)
          throw new SemDadoRealErro(
            c.metrica,
            id === 'O5'
              ? 'a coleta ainda não grava os bloqueios do quadro; sem eles a eficiência de fluxo sairia inflada'
              : 'a coleta ainda não grava os bloqueios do quadro',
          )
        }
        const r = await (fonteDeTeste.obter as (...a: unknown[]) => Promise<Qualquer>)(id, ...resto)
        return semBloqueio065(id, structuredClone(r))
      },
    },
  }) as typeof fonteDeTeste

describe('o cliente ainda renderiza a parte de bloqueio nula e o estado sem dado real (pedido 065; fica até o lote 9a)', () => {
  it('W1: o cartão BLOQUEADOS mostra Sem dado real com o motivo, nunca "Nenhum item bloqueado hoje"', async () => {
    renderizarApp('/operacional?cadencia=diaria', fonteApiSemBloqueio())
    const c = await screen.findByTestId('metrica-BLOQUEADOS')
    const estado = await within(c).findByTestId('estado-sem-dado-real-BLOQUEADOS')
    expect(estado).toHaveTextContent('Sem dado real')
    expect(estado).toHaveTextContent('a coleta ainda não grava os bloqueios do quadro')
    expect(within(c).queryByTestId('bloqueados-nenhum')).not.toBeInTheDocument()
  })

  it('W2: O1 diz "sem dado real" para bloqueados, sem "0 deles bloqueados" nem a série Bloqueados; o WIP total fica', async () => {
    renderizarCartao(<CartaoO1 filtros={FILTROS_FLUXO} />, { fonte: fonteApiSemBloqueio() })
    const c = await screen.findByTestId('metrica-O1')
    await waitFor(() => expect(c).toHaveAttribute('data-estado', 'ok'))
    expect(await within(c).findByTestId('o1-bloqueados-sem-dado')).toHaveTextContent(
      'Bloqueados: sem dado real',
    )
    expect(within(c).getByTestId('leitura-O1')).toHaveTextContent('bloqueados: sem dado real')
    expect(c.textContent).not.toMatch(/\d+ deles bloqueados/)
    expect(within(c).queryByText(/Bloqueados \(contam no WIP\)/)).not.toBeInTheDocument()
    expect(within(c).getByTestId('notas-cartao-O1')).toHaveTextContent('Bloqueios: sem dado real')
    expect(within(c).getByTestId('o1-dias-dentro')).toBeInTheDocument()
    expect(within(c).getByText(/Hoje há \d+/)).toBeInTheDocument()
  })

  it('W2b: com uma equipe (quebra por coluna), O1 sem bloqueio usa a descrição do gráfico sem "bloqueados dentro do total"', async () => {
    const base = fonteApiSemBloqueio()
    const fonte = Object.create(base, {
      obter: {
        value: async (id: MetricaId, ...resto: unknown[]) => {
          const r = await (base.obter as (...a: unknown[]) => Promise<Qualquer>)(id, ...resto)
          if (id === 'O1' && !r.porColuna) {
            r.porColuna = [
              {
                coluna: 'Em execução',
                tipoColuna: 'execucao',
                limite: 5,
                itens: 3,
                bloqueados: null,
              },
              { coluna: 'Fila', tipoColuna: 'fila', limite: null, itens: 2, bloqueados: null },
            ]
          }
          return r
        },
      },
    }) as typeof fonteDeTeste
    renderizarCartao(<CartaoO1 filtros={FILTROS_FLUXO} />, { fonte })
    const c = await screen.findByTestId('metrica-O1')
    await waitFor(() => expect(c).toHaveAttribute('data-estado', 'ok'))
    expect(await within(c).findByTestId('o1-bloqueados-sem-dado')).toBeInTheDocument()
    expect(within(c).queryByTestId('o1-selecione-equipe')).not.toBeInTheDocument()
    await userEvent.click(within(c).getAllByRole('button', { name: 'Ver como tabela' })[0]!)
    expect(await within(c).findByText('WIP por coluna do fluxo')).toBeInTheDocument()
    expect(within(c).queryByText(/com bloqueados dentro do total/)).not.toBeInTheDocument()
  })

  it('W3: O2 mostra "Sem dado real" na coluna Bloqueado, sem "bloqueado" na legenda; dispersão e P50/P85/P95 ficam', async () => {
    renderizarCartao(<CartaoO2 filtros={FILTROS_FLUXO} />, { fonte: fonteApiSemBloqueio() })
    const c = await screen.findByTestId('metrica-O2')
    await waitFor(() => expect(c).toHaveAttribute('data-estado', 'ok'))
    const lista = await within(c).findByTestId('o2-lista')
    expect(within(lista).getAllByText('Sem dado real').length).toBeGreaterThan(0)
    expect(within(lista).queryByText('—')).not.toBeInTheDocument()
    const grafico = within(c).getByTestId('o2-grafico')
    expect(grafico.textContent.toLowerCase()).not.toContain('bloqueado')
    expect(grafico.textContent).toMatch(/P50/)
    expect(grafico.textContent).toMatch(/P95/)
    expect(within(c).getByTestId('notas-cartao-O2')).toHaveTextContent('Bloqueios: sem dado real')
  })

  it('W4: O5 inteiro mostra Sem dado real com o motivo, sem barras nem percentual', async () => {
    renderizarCartao(<CartaoO5 filtros={FILTROS_FLUXO} />, { fonte: fonteApiSemBloqueio() })
    const c = await screen.findByTestId('metrica-O5')
    const estado = await within(c).findByTestId('estado-sem-dado-real-O5')
    expect(estado).toHaveTextContent('Sem dado real')
    expect(estado).toHaveTextContent('a coleta ainda não grava os bloqueios do quadro')
    expect(estado).toHaveTextContent('inflada')
    expect(within(c).queryByText(/Mediana por item/)).not.toBeInTheDocument()
    expect(c.textContent).not.toMatch(/\d+\s*%/)
  })

  it('W5: a faixa "Pede atenção" fica parcial e nunca afirma que nada pede atenção', async () => {
    renderizarApp('/operacional?cadencia=diaria', fonteApiSemBloqueio())
    const faixa = await screen.findByTestId('faixa-atencao')
    // Os itens do O2 e do O1 aparecem; se não houver nenhum, o texto de parcial vale. Nunca "nada pede atenção".
    await waitFor(() => {
      const itens = faixa.querySelectorAll('li')
      const parcial = within(faixa).queryByTestId('faixa-atencao-sem-dado-real-parcial')
      expect(itens.length > 0 || parcial !== null).toBe(true)
    })
    expect(within(faixa).queryByText(/Nada pede atenção/i)).not.toBeInTheDocument()
    expect(within(faixa).queryByText(/bloqueado/i)).not.toBeInTheDocument()
  })
})
