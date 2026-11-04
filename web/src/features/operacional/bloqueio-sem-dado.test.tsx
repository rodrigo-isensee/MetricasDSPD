import { screen, waitFor, within } from '@testing-library/react'
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

const NOTA = 'bloqueio-sem-dado-real'

/** Anula a parte de bloqueio como o servidor faz na base real (pedido 065): null com a nota, nunca 0. */
function semBloqueio(id: MetricaId, r: Qualquer): Qualquer {
  if (id === 'O1') {
    r.hoje.bloqueados = null
    r.porColuna = r.porColuna?.map((c: Qualquer) => ({ ...c, bloqueados: null })) ?? null
    r.porTipoColuna = r.porTipoColuna.map((c: Qualquer) => ({ ...c, bloqueados: null }))
    r.serie = r.serie.map((p: Qualquer) => ({ ...p, bloqueados: null }))
    r.notas = [NOTA]
  }
  if (id === 'O2') {
    r.itens = r.itens.map((i: Qualquer) => ({ ...i, bloqueioMotivo: null }))
    r.notas = [NOTA]
  }
  if (id === 'O5') {
    for (const t of r.tipos)
      if (t.estatistica.status === 'ok') t.estatistica.valor.horasBloqueio = null
    r.notas = [NOTA]
  }
  return r
}

/** Fonte da API real: BLOQUEADOS fora do mapa responde `sem-dado-real`; O1, O2 e O5 vêm com a parte de bloqueio nula. */
const fonteApi = () =>
  Object.create(fonteDeTeste, {
    tipo: { value: 'api' },
    obter: {
      value: async (id: MetricaId, ...resto: unknown[]) => {
        if (id === 'BLOQUEADOS') {
          const c = corpoSemDadoReal(id)
          throw new SemDadoRealErro(c.metrica, c.motivo)
        }
        const r = await (fonteDeTeste.obter as (...a: unknown[]) => Promise<Qualquer>)(id, ...resto)
        return semBloqueio(id, structuredClone(r))
      },
    },
  }) as typeof fonteDeTeste

describe('parte de bloqueio sem dado real (pedido 065)', () => {
  it('W1: o cartão BLOQUEADOS mostra Sem dado real com o motivo, nunca "Nenhum item bloqueado hoje"', async () => {
    expect(origemDaMetrica('BLOQUEADOS')).toBe('mock')
    renderizarApp('/operacional?cadencia=diaria', fonteApi())
    const c = await screen.findByTestId('metrica-BLOQUEADOS')
    const estado = await within(c).findByTestId('estado-sem-dado-real-BLOQUEADOS')
    expect(estado).toHaveTextContent('Sem dado real')
    expect(estado).toHaveTextContent('a coleta ainda não grava os bloqueios do quadro')
    expect(within(c).queryByTestId('bloqueados-nenhum')).not.toBeInTheDocument()
  })

  it('W2: O1 diz "sem dado real" para bloqueados, sem "0 deles bloqueados" nem a série Bloqueados; o WIP total fica', async () => {
    renderizarCartao(<CartaoO1 filtros={FILTROS_FLUXO} />, { fonte: fonteApi() })
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

  it('W3: O2 mostra "Sem dado real" na coluna Bloqueado, sem "bloqueado" na legenda; dispersão e P50/P85/P95 ficam', async () => {
    renderizarCartao(<CartaoO2 filtros={FILTROS_FLUXO} />, { fonte: fonteApi() })
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

  it('W4: O5 mostra a nota, mantém as barras de eficiência e não diz "fila e bloqueio"', async () => {
    renderizarCartao(<CartaoO5 filtros={FILTROS_FLUXO} />, { fonte: fonteApi() })
    const c = await screen.findByTestId('metrica-O5')
    await waitFor(() => expect(c).toHaveAttribute('data-estado', 'ok'))
    expect(await within(c).findByTestId('notas-cartao-O5')).toHaveTextContent(
      'Bloqueios: sem dado real',
    )
    expect(within(c).getByTestId('leitura-O5').textContent).not.toMatch(/fila e bloqueio/)
    expect(within(c).queryByText(/Fila e bloqueio contam/)).not.toBeInTheDocument()
    expect(within(c).getByText(/bloqueio: sem dado real/)).toBeInTheDocument()
    expect(within(c).getAllByText(/Mediana por item/).length).toBeGreaterThan(0)
  })

  it('W5: a faixa "Pede atenção" fica parcial e nunca afirma que nada pede atenção', async () => {
    renderizarApp('/operacional?cadencia=diaria', fonteApi())
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
