import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FILTROS_FLUXO, FonteAjustada } from '@/features/painel/testes/fonteFixa'
import { renderizarApp, renderizarCartao } from '@/test/helpers'
import { CartaoT1 } from './components/CartaoT1'
import { CartaoT2 } from './components/CartaoT2'
import { CartaoT3 } from './components/CartaoT3'
import { CartaoT4 } from './components/CartaoT4'
import { CartaoT5 } from './components/CartaoT5'
import { CartaoT7 } from './components/CartaoT7'
import { CartaoT9 } from './components/CartaoT9'

const pronto = async (codigo: string) => {
  const el = await screen.findByTestId(`metrica-${codigo}`)
  await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
  return el
}
const INSUF = { status: 'insuficiente', n: 5, minimo: 20, janela: null }

describe('T1 e T2: nenhuma classe com amostra suficiente', () => {
  it('T1 não publica lead time e avisa na leitura', async () => {
    renderizarCartao(<CartaoT1 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        T1: (r: { classes: { estatistica: unknown }[] }) =>
          r.classes.forEach((c) => (c.estatistica = INSUF)),
      }),
    })
    const el = await pronto('T1')
    expect(within(el).getByTestId('leitura-T1')).toHaveTextContent(
      'Nenhuma classe tem amostra suficiente para publicar o lead time.',
    )
  })

  it('T2 não publica aderência ao SLE e avisa na leitura', async () => {
    renderizarCartao(<CartaoT2 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        T2: (r: { classes: { dentroDoSle: unknown }[] }) =>
          r.classes.forEach((c) => (c.dentroDoSle = INSUF)),
      }),
    })
    const el = await pronto('T2')
    expect(within(el).getByTestId('leitura-T2')).toHaveTextContent(
      'Nenhuma classe tem amostra suficiente para publicar a aderência ao SLE.',
    )
  })
})

describe('T3: alocação sem desvio calculado', () => {
  it('percentual publicado sem desvio: mostra 0,0 p.p. sem sinal e não cita no resumo', async () => {
    renderizarCartao(<CartaoT3 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        T3: (r: {
          status: string
          naturezas: { itens: { pct: number; desvioPP: number | null } }[]
        }) => {
          r.status = 'ok'
          r.naturezas.forEach((n) => {
            n.itens.pct = 10
            n.itens.desvioPP = null
          })
        },
      }),
    })
    const el = await pronto('T3')
    expect(within(el).getAllByText(/desvio 0 p\.p\./).length).toBeGreaterThan(0)
    expect(within(el).getByTestId('leitura-T3')).toHaveTextContent('Percentuais indisponíveis')
  })
})

describe('T4: demanda x capacidade', () => {
  const ok = (extra: object) => ({
    status: 'ok',
    n: 40,
    janela: null,
    valor: {
      chegada: { min: 1, max: 5, mediana: 3, media: 3 },
      vazao: { min: 1, max: 5, mediana: 3, media: 3 },
      razao: 1,
      backlog: 10,
      semanasParaZerar: 4,
      filaCresce: false,
      saldo: 0,
      ...extra,
    },
  })
  const comClasse = (fn: (c: Record<string, unknown>) => void) =>
    new FonteAjustada({
      T4: (r: { classes: Record<string, unknown>[] }) => {
        const padrao = r.classes.find((c) => c.classe === 'Padrão') as Record<string, unknown>
        fn(padrao)
      },
    })

  it('fila que não cresce com semanas para zerar; razão indefinida e semanas ausentes na tabela', async () => {
    renderizarCartao(<CartaoT4 filtros={FILTROS_FLUXO} />, {
      fonte: comClasse((c) => (c.estatistica = ok({ semanasParaZerar: 4 }))),
    })
    const el = await pronto('T4')
    expect(within(el).getByTestId('leitura-T4')).toHaveTextContent('Semanas para zerar a fila: 4.')
  })

  it('sem semanas para zerar e sem fila crescendo: a leitura usa 0 e a tabela mostra "—"', async () => {
    renderizarCartao(<CartaoT4 filtros={FILTROS_FLUXO} />, {
      fonte: comClasse((c) => (c.estatistica = ok({ semanasParaZerar: null, razao: null }))),
    })
    const el = await pronto('T4')
    expect(within(el).getByTestId('leitura-T4')).toHaveTextContent('Semanas para zerar a fila: 0.')
    const tabela = within(el).getByTestId('tabela-T4-classes')
    expect(within(tabela).getByText('Indefinida (sem chegadas)')).toBeInTheDocument()
  })

  it('fila que cresce: a leitura e a tabela avisam', async () => {
    renderizarCartao(<CartaoT4 filtros={FILTROS_FLUXO} />, {
      fonte: comClasse(
        (c) => (c.estatistica = ok({ filaCresce: true, semanasParaZerar: null, razao: 1.5 })),
      ),
    })
    const el = await pronto('T4')
    expect(within(el).getByTestId('leitura-T4')).toHaveTextContent('A fila cresce')
  })

  it('classe com amostra insuficiente: leitura "n de 20" e bloco de amostra insuficiente', async () => {
    renderizarCartao(<CartaoT4 filtros={FILTROS_FLUXO} />, {
      fonte: comClasse((c) => (c.estatistica = { ...INSUF, n: 9 })),
    })
    const el = await pronto('T4')
    expect(within(el).getByTestId('leitura-T4')).toHaveTextContent('9 de 20 itens mínimos')
    expect(within(el).getByTestId('amostra-insuficiente-T4')).toBeInTheDocument()
  })

  it('sem a classe Padrão no resultado, não há leitura nem gráfico (nada é inventado)', async () => {
    renderizarCartao(<CartaoT4 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        T4: (r: { classes: { classe: string }[] }) => {
          r.classes = r.classes.filter((c) => c.classe !== 'Padrão')
        },
      }),
    })
    const el = await pronto('T4')
    expect(within(el).queryByTestId('leitura-T4')).toBeNull()
    expect(within(el).queryByTestId('amostra-insuficiente-T4')).toBeNull()
  })
})

describe('T5: parcela de falha', () => {
  it('sem origem maior, a leitura não cita origem; voltar da aba "por área" para "por sistema"', async () => {
    const r = renderizarCartao(<CartaoT5 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        T5: (x: {
          porSistema: { estatistica: { status: string; valor?: { origemMaior: unknown } } }[]
        }) => {
          x.porSistema.forEach((g) => {
            if (g.estatistica.status === 'ok' && g.estatistica.valor)
              g.estatistica.valor.origemMaior = null
          })
        },
      }),
    })
    const el = await pronto('T5')
    expect(within(el).getByTestId('leitura-T5')).not.toHaveTextContent('a maior origem')
    await userEvent.click(within(el).getByRole('tab', { name: 'Por área' }))
    expect(r.roteador.state.location.search).toContain('t5=area')
    await userEvent.click(within(el).getByRole('tab', { name: 'Por sistema' }))
    expect(r.roteador.state.location.search).not.toContain('t5=')
  })

  it('nenhum grupo com 20 itens: não publica a parcela de falha', async () => {
    renderizarCartao(<CartaoT5 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        T5: (x: { porSistema: { estatistica: unknown }[] }) =>
          x.porSistema.forEach((g) => (g.estatistica = INSUF)),
      }),
    })
    const el = await pronto('T5')
    expect(within(el).getByTestId('leitura-T5')).toHaveTextContent(
      'Nenhum grupo tem 20 itens ou mais para publicar a parcela de falha.',
    )
  })
})

describe('T7 e T9', () => {
  it('T7 dentro do limite de frentes', async () => {
    renderizarCartao(<CartaoT7 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        T7: (x: { kpis: { acimaDoLimite: boolean } }) => (x.kpis.acimaDoLimite = false),
      }),
    })
    const el = await pronto('T7')
    expect(within(el).getByText('Dentro do limite')).toBeInTheDocument()
    expect(el).toHaveTextContent('Dentro da meta')
  })

  it('T7 acima do limite de frentes', async () => {
    renderizarCartao(<CartaoT7 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        T7: (x: { kpis: { acimaDoLimite: boolean } }) => (x.kpis.acimaDoLimite = true),
      }),
    })
    const el = await pronto('T7')
    expect(within(el).getByText('Acima do limite')).toBeInTheDocument()
  })

  it('T9: uma frente adicionada no singular', async () => {
    renderizarCartao(<CartaoT9 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        T9: (x: { projetos: { adicionadas: number }[] }) =>
          x.projetos.forEach((p) => (p.adicionadas = 1)),
      }),
    })
    const el = await pronto('T9')
    expect(within(el).getAllByText(/\+1 frente;/).length).toBeGreaterThan(0)
  })
})

describe('Painel Tático: faixa "Pede atenção"', () => {
  it('mais de uma classe fora da meta e mais de uma natureza com desvio: plural', async () => {
    renderizarApp(
      '/tatico',
      new FonteAjustada({
        T2: (x: { classes: { statusMeta: string }[] }) =>
          x.classes.forEach((c) => (c.statusMeta = 'fora')),
        T3: (x: { status: string; naturezas: { itens: { statusMeta: string } }[] }) => {
          x.status = 'ok'
          x.naturezas.forEach((n) => (n.itens.statusMeta = 'fora'))
        },
      }),
    )
    await screen.findByTestId('faixa-atencao')
    expect(await screen.findByText(/abaixo da meta em \d+ classes/)).toBeInTheDocument()
    expect(
      await screen.findByText(/desvio acima de 10 p\.p\. em \d+ naturezas/),
    ).toBeInTheDocument()
  })
})
