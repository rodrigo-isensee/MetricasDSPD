import type { ReactElement } from 'react'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FILTROS_FLUXO, FonteAjustada } from '@/features/painel/testes/fonteFixa'
import { CartaoO5 } from '@/features/complementares/fluxo'
import { renderizarCartao } from '@/test/helpers'
import { CartaoBloqueados } from './components/CartaoBloqueados'
import { CartaoO1 } from './components/CartaoO1'

vi.setConfig({ testTimeout: 45000 })

type Q = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

/** Fixture da versão de critério do lote 6a (ainda inexistente): só o contrato `MarcacaoCriterio`. */
const VERSAO = {
  id: 'criterio-2026-10-01-bloqueio-com-dado-real',
  data: '2026-10-01',
  descricao: 'histórico parcial de bloqueios: só há dado a partir de 01/10/2026.',
}
const tipoO5 = (tipo: string, n: number, ok: boolean) => ({
  tipo,
  n,
  estatistica: ok
    ? { status: 'ok', n, valor: { medianaPct: 40, agregadaPct: 35 } }
    : { status: 'insuficiente', n },
})
async function abrir(cartao: ReactElement, id: string) {
  renderizarCartao(cartao, { fonte: new FonteAjustada(ajustes) })
  const el = await screen.findByTestId(`metrica-${id}`)
  await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'))
  return el
}
let ajustes: Record<string, (r: Q) => void> = {}

describe('histórico parcial de bloqueio (pedido 075, lote 5b)', () => {
  it('CA-6 e CA-9: O5 em amostra insuficiente mostra a faixa de histórico parcial com a data', async () => {
    ajustes = {
      O5: (r) => (
        (r.tipos = [tipoO5('Story', 12, false)]),
        (r.criterios = { serie: [], janela: [VERSAO] })
      ),
    }
    const el = await abrir(<CartaoO5 filtros={FILTROS_FLUXO} />, 'O5')
    const faixa = within(el).getByTestId('aviso-criterio')
    expect(faixa).toHaveTextContent('inclui dados anteriores')
    expect(faixa).toHaveTextContent('01/10/2026')
    expect(faixa).toHaveTextContent('histórico parcial de bloqueios')
    expect(within(el).getByTestId('amostra-insuficiente-O5')).toHaveTextContent('12 de 20')
  })

  it('CA-9: tipo com menos de 20 itens aparece só como texto, sem barra nem percentual', async () => {
    ajustes = { O5: (r) => (r.tipos = [tipoO5('Story', 30, true), tipoO5('Bug', 7, false)]) }
    const el = await abrir(<CartaoO5 filtros={FILTROS_FLUXO} />, 'O5')
    const lista = within(el).getByTestId('lista-insuficientes')
    expect(lista).toHaveTextContent('Bug: amostra insuficiente (7 de 20 itens mínimos)')
    expect(lista.textContent).not.toMatch(/%/)
    expect(within(lista).queryByRole('meter')).not.toBeInTheDocument()
  })

  it('CA-8: com a janela toda depois da data, a faixa do O5 some', async () => {
    ajustes = { O5: (r) => (r.criterios = { serie: [], janela: [] }) }
    const el = await abrir(<CartaoO5 filtros={FILTROS_FLUXO} />, 'O5')
    expect(within(el).queryByTestId('aviso-criterio')).not.toBeInTheDocument()
  })

  it('CA-7: série do O1 com faixa, linha na data e trecho anterior sem ponto, nunca zero', async () => {
    ajustes = {
      O1: (r) => {
        r.notas = []
        r.hoje.bloqueados = 2
        r.criterios = { serie: [VERSAO], janela: [] }
        r.serie = r.serie.map((p: Q, i: number) => ({
          ...p,
          data: `2026-09-${String(i + 1).padStart(2, '0')}`,
          bloqueados: i < 3 ? null : 1,
        }))
        r.serie[3].data = '2026-10-01'
      },
    }
    const el = await abrir(<CartaoO1 filtros={FILTROS_FLUXO} />, 'O1')
    expect(within(el).getByTestId('aviso-criterio')).toHaveTextContent('mudança de critério')
    expect(within(el).getByTestId('marcador-criterio')).toHaveTextContent('01/10/2026')
    await userEvent.click(within(el).getByRole('button', { name: 'Ver como tabela' }))
    const linhas = within(el).getAllByRole('row')
    const bloqueados = linhas.filter((l) => /01\/09|02\/09|03\/09/.test(l.textContent))
    expect(bloqueados.length).toBeGreaterThan(0)
    for (const l of bloqueados) expect(l).toHaveTextContent('— amostra insuficiente')
  })

  it('CA-11: o texto de precisão do início fica sob a tabela e descreve a tabela', async () => {
    ajustes = {}
    const el = await abrir(<CartaoBloqueados filtros={FILTROS_FLUXO} />, 'BLOQUEADOS')
    const tabela = within(el).getByTestId('tabela-BLOQUEADOS').querySelector('table')
    const apoio = el.querySelector('#bloqueados-apoio')
    expect(tabela).toHaveAttribute('aria-describedby', 'bloqueados-apoio')
    expect(apoio).toHaveTextContent('data da coleta que o viu; pode ser posterior ao início real')
  })
})
