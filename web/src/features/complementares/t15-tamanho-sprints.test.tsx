import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FILTROS_FLUXO, FonteAjustada } from '@/features/painel/testes/fonteFixa'
import { renderizarCartao } from '@/test/helpers'
import { CartaoT15 } from './previsao'

vi.setConfig({ testTimeout: 45000 })

// Pedido 105 (E7.504): o T15 mostra P50, P85 e a média juntos e, abaixo de 20 sprints, só a contagem.
type Dto = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

async function cartao(ajuste: (x: Dto) => void) {
  renderizarCartao(<CartaoT15 filtros={FILTROS_FLUXO} />, {
    fonte: new FonteAjustada({ T15: ajuste }),
  })
  const el = await screen.findByTestId('metrica-T15')
  await waitFor(() => expect(el).not.toHaveAttribute('data-estado', 'carregando'), {
    timeout: 8000,
  })
  return el
}

const JANELA = { inicio: '2026-01-01', fim: '2026-03-31' }

describe('T15: tamanho das sprints', () => {
  it('com amostra suficiente mostra P50, P85 e a média juntos, em dias úteis', async () => {
    const el = await cartao((x) => {
      x.sprintsNoRecorte = 24
      x.base.n = 24
      x.estatistica = {
        status: 'ok',
        n: 24,
        janela: JANELA,
        valor: { p50: 8, p85: 10, p95: 12, media: 8.6 },
      }
      x.foraDaConta = { semDatas: 0, acimaDoTeto: 0, tetoDiasUteis: 30 }
    })
    expect(el).toHaveTextContent(/P50/)
    expect(el).toHaveTextContent(/P85/)
    expect(el).toHaveTextContent(/Média/)
    // Cada frase no seu lugar: trocar só a do cartão ou só a da nota derruba o teste.
    const nota = within(el).getByTestId('nota-T15')
    const paragrafos = (raiz: HTMLElement) =>
      Array.from(raiz.querySelectorAll('p')).map((p) => p.textContent)
    const fraseCartao =
      'Com mais de um time no filtro (ou nenhum), as sprints dos times se somam; para ver um time, filtre por ele. Sem meta e sem comparar times. A média só vale lida com o P50 e o P85.'
    const fraseNota =
      'Com mais de um time no filtro (ou nenhum), as sprints dos times se somam; para ver um time, filtre por ele. Não compara times nem ordena sprints. Só BusinessMap.'
    const foraDaNota = Array.from(el.querySelectorAll('p')).filter((p) => !nota.contains(p))
    expect(foraDaNota.map((p) => p.textContent)).toContain(fraseCartao)
    expect(paragrafos(nota)).not.toContain(fraseCartao)
    expect(paragrafos(nota)).toContain(fraseNota)
    expect(foraDaNota.map((p) => p.textContent)).not.toContain(fraseNota)
  })

  it('abaixo de 20 sprints só a contagem, sem P50, P85 nem média', async () => {
    const el = await cartao((x) => {
      x.sprintsNoRecorte = 7
      x.estatistica = { status: 'insuficiente', n: 7, minimo: 20, janela: JANELA }
      x.foraDaConta = { semDatas: 0, acimaDoTeto: 0, tetoDiasUteis: 30 }
    })
    expect(el).toHaveTextContent(
      'Só 7 sprints no recorte: abaixo de 20 não se publica estatística.',
    )
    expect(within(el).queryByText(/Média/)).toBeNull()
  })

  it('diz quantas sprints ficaram fora da conta', async () => {
    const el = await cartao((x) => {
      x.sprintsNoRecorte = 5
      x.estatistica = { status: 'insuficiente', n: 5, minimo: 20, janela: JANELA }
      x.foraDaConta = { semDatas: 2, acimaDoTeto: 1, tetoDiasUteis: 30 }
    })
    expect(
      within(el).getByText(
        'Ficaram fora desta conta: 2 sprints sem as duas datas de execução e 1 sprint com mais de 30 dias úteis.',
      ),
    ).toBeInTheDocument()
  })
})
