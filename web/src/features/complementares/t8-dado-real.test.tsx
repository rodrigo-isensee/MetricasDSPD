import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FILTROS_FLUXO, FonteAjustada } from '@/features/painel/testes/fonteFixa'
import { renderizarCartao } from '@/test/helpers'
import { CartaoT8 } from './previsao'

vi.setConfig({ testTimeout: 45000 })

// Pedido 105 (E7.499, D-T8 "A"): o T8 com dado real traz a contagem das sprints fora da conta e só publica com 20 sprints no recorte.
type Dto = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

async function cartao(ajuste: (x: Dto) => void) {
  renderizarCartao(<CartaoT8 filtros={FILTROS_FLUXO} />, {
    fonte: new FonteAjustada({ T8: ajuste }),
  })
  const el = await screen.findByTestId('metrica-T8')
  await waitFor(() => expect(el).not.toHaveAttribute('data-estado', 'carregando'), {
    timeout: 8000,
  })
  return el
}

describe('T8 com dado real: sprints fora da conta e mínimo de sprints', () => {
  it('mostra no corpo as sprints sem datas e as acima do teto, com o plural certo', async () => {
    const el = await cartao((x) => {
      x.foraDaConta = { semDatas: 1, acimaDoTeto: 3, tetoDiasUteis: 30 }
      x.sprintsNoRecorte = x.sprints.length
    })
    expect(
      within(el).getByText(
        'Ficaram fora desta conta: 1 sprint sem as duas datas de execução e 3 sprints com mais de 30 dias úteis.',
      ),
    ).toBeInTheDocument()
  })

  it('mostra só a parte que existe', async () => {
    const so1 = await cartao((x) => {
      x.foraDaConta = { semDatas: 2, acimaDoTeto: 0, tetoDiasUteis: 30 }
    })
    expect(
      within(so1).getByText('Ficaram fora desta conta: 2 sprints sem as duas datas de execução.'),
    ).toBeInTheDocument()
  })

  it('só as acima do teto, no singular', async () => {
    const so2 = await cartao((x) => {
      x.foraDaConta = { semDatas: 0, acimaDoTeto: 1, tetoDiasUteis: 30 }
    })
    expect(
      within(so2).getByText('Ficaram fora desta conta: 1 sprint com mais de 30 dias úteis.'),
    ).toBeInTheDocument()
  })

  it('sem sprint fora da conta (ou dado fictício, sem a contagem) não mostra a nota', async () => {
    const el = await cartao((x) => {
      x.foraDaConta = { semDatas: 0, acimaDoTeto: 0, tetoDiasUteis: 30 }
    })
    expect(el).not.toHaveTextContent(/fora desta conta/)
  })

  it('abaixo de 20 sprints no recorte diz que não publica estatística e não mostra "k de n" de itens', async () => {
    const el = await cartao((x) => {
      x.sprintsNoRecorte = 7
      x.sprints = []
      x.agregado = {
        entreguePct: { status: 'insuficiente', k: 0, n: 7, minimo: 20 },
        naoPlanejadoPct: { status: 'insuficiente', k: 0, n: 7, minimo: 20 },
      }
    })
    expect(el).toHaveTextContent(
      'Só 7 sprints no recorte: abaixo de 20 não se publica estatística.',
    )
    expect(el).not.toHaveTextContent(/0 de 7 do comprometido/)
  })

  it('com uma sprint no recorte, no singular', async () => {
    const el = await cartao((x) => {
      x.sprintsNoRecorte = 1
      x.sprints = []
      x.agregado = {
        entreguePct: { status: 'insuficiente', k: 0, n: 1, minimo: 20 },
        naoPlanejadoPct: { status: 'insuficiente', k: 0, n: 1, minimo: 20 },
      }
    })
    expect(el).toHaveTextContent('Só 1 sprint no recorte: abaixo de 20 não se publica estatística.')
  })

  it('vazio: a nota abre com "Fora da conta:"', async () => {
    renderizarCartao(<CartaoT8 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        T8: (x: Dto) => {
          x.base.n = 0
          x.sprints = []
          x.sprintsNoRecorte = 0
          x.foraDaConta = { semDatas: 2, acimaDoTeto: 0, tetoDiasUteis: 30 }
        },
      }),
    })
    const el = await screen.findByTestId('metrica-T8')
    await waitFor(() => expect(el).toHaveAttribute('data-estado', 'vazio'), { timeout: 8000 })
    expect(
      within(el).getByText('Fora da conta: 2 sprints sem as duas datas de execução.'),
    ).toBeInTheDocument()
  })
})
