import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FILTROS_FLUXO, FonteAjustada } from '@/features/painel/testes/fonteFixa'
import { renderizarApp, renderizarCartao } from '@/test/helpers'
import { CartaoE1 } from './components/CartaoE1'
import { CartaoE2 } from './components/CartaoE2'

const pronto = async (codigo: string) => {
  const el = await screen.findByTestId(`metrica-${codigo}`)
  await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
  return el
}
const J = { inicio: '2026-07-18', fim: '2026-10-09' }

describe('E1: ramos', () => {
  it('variação positiva da mediana leva o sinal "+"', async () => {
    renderizarCartao(<CartaoE1 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        E1: (r: { segmentos: { estatistica: unknown; variacaoMediana: unknown }[] }) => {
          const s = r.segmentos[0] as { estatistica: unknown; variacaoMediana: unknown }
          s.estatistica = {
            status: 'ok',
            n: 30,
            janela: J,
            valor: {
              total: { p50: 98, p85: 140, p95: 170 },
              medianaAntesDoInicio: 40,
              medianaExecucao: 58,
              fracaoAntesPct: 40,
            },
          }
          s.variacaoMediana = { status: 'ok', atual: 110, anterior: 100, variacaoPct: 10 }
        },
      }),
    })
    const el = await pronto('E1')
    expect(await within(el).findByTestId('e1-variacao')).toHaveTextContent(
      'Variação da mediana: +10%',
    )
  })

  it('sem nenhum tipo de projeto no resultado, não há leitura nem abas', async () => {
    renderizarCartao(<CartaoE1 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        E1: (r: { segmentos: unknown[] }) => {
          r.segmentos = []
        },
      }),
    })
    const el = await pronto('E1')
    expect(within(el).queryByTestId('leitura-E1')).toBeNull()
    expect(within(el).queryAllByRole('tab')).toHaveLength(0)
  })
})

describe('E2: ramos', () => {
  it('sem percentual de fora de objetivo, a leitura cita só a evolução vinculada', async () => {
    renderizarCartao(<CartaoE2 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        E2: (r: { trimestres: { segmentos: { tipo: string; pct: number | null }[] }[] }) =>
          r.trimestres.forEach((t) =>
            t.segmentos.forEach((s) => {
              if (s.tipo === 'fora-de-objetivo') s.pct = null
            }),
          ),
      }),
    })
    const el = await pronto('E2')
    expect(within(el).getByTestId('leitura-E2')).not.toHaveTextContent('fora de qualquer objetivo')
  })

  it('categoria ausente num trimestre conta zero', async () => {
    renderizarCartao(<CartaoE2 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        E2: (r: { trimestres: { segmentos: unknown[] }[] }) => {
          const t = r.trimestres[r.trimestres.length - 1] as { segmentos: unknown[] }
          t.segmentos = t.segmentos.slice(0, 1)
        },
      }),
    })
    await pronto('E2')
  })

  it('evolução vinculada com amostra insuficiente: leitura "n de 20"', async () => {
    renderizarCartao(<CartaoE2 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        E2: (r: { evolucaoVinculada: unknown }) => {
          r.evolucaoVinculada = { status: 'insuficiente', k: 3, n: 12, minimo: 20, janela: J }
        },
      }),
    })
    const el = await pronto('E2')
    expect(within(el).getByTestId('leitura-E2')).toHaveTextContent(
      'Percentuais indisponíveis: 12 de 20 itens mínimos.',
    )
  })
})

describe('Painel Estratégico: faixa', () => {
  it('uma iniciativa sem resultado declarado: singular', async () => {
    renderizarApp(
      '/estrategico',
      new FonteAjustada({
        E3: (r: { semFicha: number }) => {
          r.semFicha = 1
        },
      }),
    )
    expect(await screen.findByText('1 iniciativa sem resultado declarado')).toBeInTheDocument()
  })
})
