import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FILTROS_FLUXO, FonteAjustada, FonteFixa, COMUM } from '@/features/painel/testes/fonteFixa'
import { CartaoO19 } from '@/features/complementares/operacionais'
import { renderizarCartao } from '@/test/helpers'
import { CartaoBloqueados } from './components/CartaoBloqueados'
import { CartaoO2 } from './components/CartaoO2'

vi.setConfig({ testTimeout: 45000 })

const NC = 'não classificado'
const PESSOA = /autor|e-mail|respons[aá]vel|quem bloqueou/i
type Q = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
const item = (motivo: string, ha: number) => ({
  cardId: `K-${ha}`,
  titulo: 'T',
  tipo: 'Story',
  etapa: 'Dev',
  motivo,
  fornecedor: null,
  bloqueadoHaDiasUteis: ha,
})

async function abrirBloqueados(itens: Q[]) {
  renderizarCartao(<CartaoBloqueados filtros={FILTROS_FLUXO} />, {
    fonte: new FonteAjustada({ BLOQUEADOS: (r: Q) => void (r.itens = itens) }),
  })
  const el = await screen.findByTestId('metrica-BLOQUEADOS')
  await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'))
  return el
}

describe('motivo "não classificado" (pedido 075, lote 5a)', () => {
  it('CA-1, CA-3, CA-4 e CA-11: BLOQUEADOS com itálico, ícone decorativo, leitura e apoios', async () => {
    const el = await abrirBloqueados([item(NC, 9), item('Janela de mudança', 2)])
    const tabela = within(el).getByTestId('tabela-BLOQUEADOS')
    const texto = within(tabela).getByText(NC)
    expect(texto).toHaveClass('italic', 'text-texto-2')
    expect(texto.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(within(tabela).getByText('Janela de mudança')).not.toHaveClass('italic')
    expect(el).toHaveTextContent('bloqueado há 9 dias úteis por motivo não classificado.')
    expect(el).not.toHaveTextContent('por "não classificado"')
    const apoio = within(el).getByTestId('apoio-nao-classificado')
    expect(apoio).toHaveTextContent('Motivo ainda sem classificação.')
    expect(tabela.querySelector('table')).toHaveAttribute('aria-describedby', 'bloqueados-apoio')
    expect(el).toHaveTextContent('pode ser posterior ao início real')
    expect(el.textContent).not.toMatch(PESSOA)
  })

  it('CA-10: zero bloqueados segue "Nenhum item bloqueado hoje."', async () => {
    const el = await abrirBloqueados([])
    expect(within(el).getByTestId('bloqueados-nenhum')).toHaveTextContent(
      'Nenhum item bloqueado hoje.',
    )
  })

  it('CA-1 e CA-5: O2 marca o motivo na coluna Bloqueado, com apoio', async () => {
    renderizarCartao(<CartaoO2 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        O2: (r: Q) => void ((r.notas = []), r.itens.forEach((i: Q) => (i.bloqueioMotivo = NC))),
      }),
    })
    const el = await screen.findByTestId('metrica-O2')
    await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'))
    const lista = within(el).getByTestId('o2-lista')
    expect(within(lista).getAllByText(NC)[0]).toHaveClass('italic')
    expect(within(lista).getByTestId('apoio-nao-classificado')).toBeInTheDocument()
    expect(lista.querySelector('table')).toHaveAttribute('aria-describedby', 'o2-apoio-motivo')
    expect(
      within(lista)
        .getAllByRole('columnheader')
        .map((c) => c.textContent),
    ).not.toContain('Fornecedor')
  })

  describe('O19', () => {
    const pct = (b: number, d: number) => ({
      status: 'ok' as const,
      bloqueios: b,
      diasUteis: d,
      totalDiasUteis: 100,
      pct: d,
    })
    const dur = {
      status: 'ok' as const,
      n: 30,
      valor: { p50: 1, p85: 2, p95: 4 },
      janela: COMUM.base.janela,
    }
    const m = (motivo: string, b: number, d: number) => ({
      motivo,
      bloqueios: b,
      diasUteis: d,
      pctDoTotal: pct(b, d),
      duracao: dur,
    })

    it('CA-2 e CA-4: "não classificado" por último mesmo sendo o maior, somado ao total e com legenda hachurada', async () => {
      renderizarCartao(<CartaoO19 filtros={FILTROS_FLUXO} />, {
        fonte: new FonteFixa({
          O19: {
            ...COMUM,
            motivos: [
              m(NC, 40, 70),
              m('Janela de mudança', 25, 20),
              m('Aguardando fornecedor', 30, 10),
            ],
            abertosForaDaSoma: 0,
            totalDiasUteis: 100,
          },
        }),
      })
      const el = await screen.findByTestId('metrica-O19')
      await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'))
      const linhas = within(within(el).getByTestId('tabela-O19')).getAllByRole('row').slice(1)
      expect(linhas.map((l) => l.querySelector('th')?.textContent)).toEqual([
        'Janela de mudança',
        'Aguardando fornecedor',
        NC,
      ])
      expect(within(linhas[2] as HTMLElement).getByText(NC)).toHaveClass('italic')
      expect(within(linhas[2] as HTMLElement).getAllByRole('cell')[1]).toHaveTextContent('70')
      expect(el).toHaveTextContent('Janela de mudança somou 20 dias úteis')
      expect(el).toHaveTextContent(
        'Bloqueio sem motivo classificado somou 70 dias úteis em 40 bloqueios.',
      )
      expect(el.querySelector('table')).toHaveAttribute('aria-describedby', 'o19-apoio-motivo')
      expect(el.querySelector('[fill*="url(#"]')).not.toBeNull()
      expect(within(el).getAllByText(NC).length).toBeGreaterThan(1)
      expect(within(el).getByTestId('apoio-nao-classificado')).toBeInTheDocument()
      // CA-5: nenhum cabeçalho, legenda ou rótulo com segmento de pessoa
      const rotulos = [
        ...el.querySelectorAll('th,figcaption,caption,legend,[class*=legenda],svg text'),
      ]
      expect(rotulos.length).toBeGreaterThan(0)
      rotulos.forEach((r) => expect(r.textContent).not.toMatch(PESSOA))
    })

    it('CA-1: só "não classificado" lê "bloqueio sem motivo classificado somou N dias"', async () => {
      renderizarCartao(<CartaoO19 filtros={FILTROS_FLUXO} />, {
        fonte: new FonteFixa({
          O19: { ...COMUM, motivos: [m(NC, 5, 12)], abertosForaDaSoma: 0, totalDiasUteis: 12 },
        }),
      })
      const el = await screen.findByTestId('metrica-O19')
      await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'))
      expect(el).toHaveTextContent('Bloqueio sem motivo classificado somou 12 dias úteis.')
      expect(el).not.toHaveTextContent('não classificado somou')
    })
  })
})
