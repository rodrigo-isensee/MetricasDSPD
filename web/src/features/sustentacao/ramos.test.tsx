import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FILTROS_SUSTENTACAO, FonteAjustada } from '@/features/painel/testes/fonteFixa'
import { renderizarApp, renderizarCartao } from '@/test/helpers'
import { CartaoS1 } from './components/CartaoS1'
import { CartaoS3 } from './components/CartaoS3'
import { CartaoS4 } from './components/CartaoS4'
import { CartaoS6 } from './components/CartaoS6'
import { CartaoS7 } from './components/CartaoS7'

const pronto = async (codigo: string) => {
  const el = await screen.findByTestId(`metrica-${codigo}`)
  await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
  return el
}
const INSUF = { status: 'insuficiente', k: 1, n: 5, minimo: 20, janela: null }

describe('S1: tempo por prioridade', () => {
  it('mediana acima do alvo, e exceção de registro no singular', async () => {
    renderizarCartao(<CartaoS1 filtros={FILTROS_SUSTENTACAO} />, {
      fonte: new FonteAjustada({
        S1: (r: {
          excecoesForaDaApuracao: number
          prioridades: Record<string, { statusMeta: string }>[]
        }) => {
          r.excecoesForaDaApuracao = 1
          r.prioridades.forEach((p) => {
            p.primeiroAtendimento!.statusMeta = 'fora'
            p.restauracao!.statusMeta = 'fora'
          })
        },
      }),
    })
    const el = await pronto('S1')
    expect(within(el).getByTestId('s1-excecoes')).toHaveTextContent(/^1 chamado com exceção/)
    expect(within(el).getAllByText('Mediana acima do alvo').length).toBeGreaterThan(0)
  })
})

describe('S3: entrada de chamados', () => {
  it('último mês fechado sem proporção publicada (menos de 20 chamados)', async () => {
    renderizarCartao(<CartaoS3 filtros={FILTROS_SUSTENTACAO} />, {
      fonte: new FonteAjustada({
        S3: (r: { meses: { emAndamento: boolean; total: number; p1p2Pct: number | null }[] }) =>
          r.meses.forEach((m) => {
            m.emAndamento = false
            m.total = Math.max(m.total, 1)
            m.p1p2Pct = null
          }),
      }),
    })
    const el = await pronto('S3')
    expect(within(el).getByTestId('leitura-S3')).toHaveTextContent(
      'a proporção de P1 e P2 não é publicada com menos de 20 chamados no mês.',
    )
  })

  it('na visão de proporção, lista os meses sem proporção (menos de 20 chamados)', async () => {
    renderizarCartao(<CartaoS3 filtros={FILTROS_SUSTENTACAO} />, {
      url: '/?s3=proporcao',
      fonte: new FonteAjustada({
        S3: (r: { meses: { total: number; p1p2Pct: number | null }[] }) => {
          const m = r.meses[0] as { total: number; p1p2Pct: number | null }
          m.total = 5
          m.p1p2Pct = null
        },
      }),
    })
    const el = await pronto('S3')
    expect(within(el).getByTestId('s3-sem-proporcao')).toHaveTextContent(
      /Sem proporção \(menos de 20 chamados no mês; o absoluto permanece\): .*\./,
    )
  })
})

describe('S4: resolução por nível', () => {
  it('se a prioridade da aba não existe no resultado, mostra a primeira disponível', async () => {
    renderizarCartao(<CartaoS4 filtros={FILTROS_SUSTENTACAO} />, {
      fonte: new FonteAjustada({
        S4: (r: { prioridades: { prioridade: string }[] }) => {
          r.prioridades = r.prioridades.filter((p) => p.prioridade !== 'P1')
        },
      }),
    })
    const el = await pronto('S4')
    const abas = within(el).getAllByRole('tab')
    expect(abas[0]).toHaveAttribute('aria-selected', 'true')
    expect(abas[0]).toHaveTextContent('P2')
  })
})

describe('S6 e S7', () => {
  it('S6 com taxa de contorno indisponível', async () => {
    renderizarCartao(<CartaoS6 filtros={FILTROS_SUSTENTACAO} />, {
      fonte: new FonteAjustada({
        S6: (r: { taxaContorno: unknown }) => (r.taxaContorno = { ...INSUF, k: 3 }),
      }),
    })
    const el = await pronto('S6')
    expect(within(el).getByTestId('leitura-S6')).toHaveTextContent(
      /Taxa de contorno indisponível: 5 de 20 itens mínimos \(3 de 5 por contorno\)/,
    )
    expect(within(el).getByTestId('s6-taxa-contorno')).toHaveTextContent('—')
  })

  it('S7 com mês sem percentual publicado (amostra insuficiente)', async () => {
    renderizarCartao(<CartaoS7 filtros={FILTROS_SUSTENTACAO} />, {
      fonte: new FonteAjustada({
        S7: (r: { ajusteDePrioridade: { meses: { pct: unknown }[] } }) =>
          r.ajusteDePrioridade.meses.forEach((m) => (m.pct = INSUF)),
      }),
    })
    const el = await pronto('S7')
    expect(within(el).getAllByText(/5 de 20/).length).toBeGreaterThan(0)
  })
})

describe('Painel Sustentação: faixa "Pede atenção"', () => {
  it('SLA fora da meta em mais de uma prioridade e mediana acima do alvo em uma só: singular e plural', async () => {
    renderizarApp(
      '/sustentacao',
      new FonteAjustada({
        S2: (r: {
          prioridades: {
            primeiroAtendimento: { statusMeta: string }
            restauracao: { statusMeta: string }
          }[]
        }) => r.prioridades.forEach((p) => (p.primeiroAtendimento.statusMeta = 'fora')),
        S1: (r: { prioridades: { restauracao: { statusMeta: string } }[] }) =>
          r.prioridades.forEach((p, i) => (p.restauracao.statusMeta = i === 0 ? 'fora' : 'dentro')),
      }),
    )
    await screen.findByTestId('faixa-atencao')
    expect(await screen.findByText(/abaixo de 90% em \d+ prioridades/)).toBeInTheDocument()
    expect(await screen.findByText('Mediana acima do alvo em 1 prioridade')).toBeInTheDocument()
  })

  it('uma só prioridade com SLA fora da meta (singular) e mediana acima do alvo em várias (plural)', async () => {
    renderizarApp(
      '/sustentacao',
      new FonteAjustada({
        S2: (r: {
          prioridades: {
            primeiroAtendimento: { statusMeta: string }
            restauracao: { statusMeta: string }
          }[]
        }) =>
          r.prioridades.forEach((p, i) => {
            p.primeiroAtendimento.statusMeta = i === 0 ? 'fora' : 'dentro'
            p.restauracao.statusMeta = 'dentro'
          }),
        S1: (r: { prioridades: { restauracao: { statusMeta: string } }[] }) =>
          r.prioridades.forEach((p) => (p.restauracao.statusMeta = 'fora')),
      }),
    )
    expect(
      await screen.findByText('Aderência ao SLA abaixo de 90% em 1 prioridade'),
    ).toBeInTheDocument()
    expect(await screen.findByText(/Mediana acima do alvo em \d+ prioridades/)).toBeInTheDocument()
  })
})
