import { render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import {
  CHAVE_PREFERENCIAS,
  cartoesDoPainel,
  type EstadoColeta,
  type PreferenciasMetricas,
} from '@metricas-dspd/contratos'
import { CartaoMetrica } from '@/components/ui'
import { fonteDeTeste, renderizarApp } from '@/test/helpers'
import { contarFicticios, origemDoCartao } from './OrigemDosCartoes'

const nota = { oQueE: 'a', comoSeCalcula: 'b', comoLer: 'c', meta: 'd', cuidados: 'e' }
const evento = {
  id: 'c1',
  inicio: '2026-10-31T09:00:00Z',
  fim: '2026-10-31T09:05:00Z',
  duracaoMs: 300000,
  resultado: 'ok' as const,
  tipoErro: null,
  efeito: 'aplicada' as const,
  contagens: null,
}

/** Fonte da API real (painel misto) sobre a base do mock: o estado de coleta é fixo, com calibração vigente. */
const fonteApi = () =>
  Object.create(fonteDeTeste, {
    tipo: { value: 'api' },
    estadoColeta: {
      value: (dominio: 'businessmap' | 'acelerato'): Promise<EstadoColeta> =>
        Promise.resolve({
          dominio,
          selo: 'atual',
          horasDesdeUltimaOk: 1,
          ultimaOk: evento,
          ultimaTentativa: evento,
          proximaPrevista: '2026-11-01T09:00:00Z',
          falhasRecentes: [],
          calibracao: [
            {
              inicio: '2026-10-31',
              fim: '2026-12-29',
              origem: 'inicio-coleta',
              criterioId: null,
              metricas: ['O1'],
            },
          ],
          metricasEmCalibracao: ['O1'],
        }),
    },
  }) as typeof fonteDeTeste

function ocultarTudo(painel: 'operacional') {
  const p: PreferenciasMetricas = {
    versao: 1,
    paineis: { [painel]: { ocultar: cartoesDoPainel(painel).map((c) => c.id) } },
    atualizadoEm: '2026-10-31T00:00:00.000Z',
  }
  window.localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify(p))
}

describe('origem do cartão (P-1 = B)', () => {
  it('com a API real, é fictício o cartão cuja métrica é mock no contrato, com o motivo da H-13', () => {
    expect(origemDoCartao('O12', 'api')).toEqual({
      ficticio: true,
      motivo: 'aguardando campo no quadro',
    })
    expect(origemDoCartao('O2', 'api')).toEqual({ ficticio: false, motivo: null })
    expect(origemDoCartao('O19', 'api')).toEqual({ ficticio: true, motivo: null })
    expect(origemDoCartao('T2', 'api').ficticio).toBe(true)
  })

  it('código fora do catálogo vale como id de métrica: real se o mapa diz real, senão fictício', () => {
    expect(origemDoCartao('EI_FL1', 'api')).toEqual({ ficticio: false, motivo: null })
    expect(origemDoCartao('XX9', 'api')).toEqual({ ficticio: true, motivo: null })
    expect(origemDoCartao('XX9', 'mock')).toEqual({ ficticio: false, motivo: null })
  })

  it('Sustentação (E2.115): S2, S3, S4, S8, S9, S10 e S12 saem sem selo; S1, S5, S6, S7, S11 e a EI_SUST levam o selo com o motivo do Acelerato', () => {
    for (const c of ['S2', 'S3', 'S4', 'S8', 'S9', 'S10', 'S12']) {
      expect(origemDoCartao(c, 'api'), c).toEqual({ ficticio: false, motivo: null })
    }
    expect(origemDoCartao('S1', 'api')).toEqual({
      ficticio: true,
      motivo: 'aguardando prazos de SLA por prioridade',
    })
    for (const c of ['S5', 'S6', 'S7', 'S11']) {
      expect(origemDoCartao(c, 'api'), c).toEqual({
        ficticio: true,
        motivo: 'aguardando campo do chamado no Acelerato',
      })
    }
    expect(origemDoCartao('EI-SUST', 'api').ficticio).toBe(true)
    expect(origemDoCartao('S2', 'mock').ficticio).toBe(false)
  })

  it('a contagem do cabeçalho da Sustentação só conta os cartões que ainda não são reais', () => {
    const n = cartoesDoPainel('sustentacao').filter(
      (c) => origemDoCartao(c.codigo, 'api').ficticio,
    ).length
    expect(contarFicticios('sustentacao', 'api')).toBe(n)
    expect(n).toBeLessThan(cartoesDoPainel('sustentacao').length)
    expect(n).toBeGreaterThanOrEqual(6)
  })

  it('com a fonte mock vale só o catálogo: o aviso global do app já diz que tudo é fictício', () => {
    expect(origemDoCartao('O12', 'mock').ficticio).toBe(false)
    expect(contarFicticios('operacional', 'mock')).toBe(0)
  })

  it('a contagem do cabeçalho conta todo cartão do painel que não é real', () => {
    const n = cartoesDoPainel('operacional').filter(
      (c) => origemDoCartao(c.codigo, 'api').ficticio,
    ).length
    expect(contarFicticios('operacional', 'api')).toBe(n)
    expect(n).toBeGreaterThanOrEqual(7)
    expect(contarFicticios('tatico', 'api')).toBe(cartoesDoPainel('tatico').length)
  })
})

describe('painel com API real: selo por cartão e nota do cabeçalho', () => {
  it('O12 leva o selo e o motivo, O2 não; o cabeçalho conta os fictícios do painel', async () => {
    renderizarApp('/operacional?cadencia=diaria', fonteApi())
    const nota = await screen.findByTestId('nota-ficticios-operacional')
    const n = contarFicticios('operacional', 'api')
    expect(nota).toHaveTextContent(`${n} cartões ainda com dados fictícios`)
    const o2 = await screen.findByTestId('metrica-O2')
    expect(within(o2).queryByTestId('selo-ficticio')).not.toBeInTheDocument()
  })

  it('nos painéis que seguem em mock (Tático) a nota conta todos os cartões', async () => {
    renderizarApp('/tatico', fonteApi())
    const nota = await screen.findByTestId('nota-ficticios-tatico')
    expect(nota).toHaveTextContent(`${contarFicticios('tatico', 'api')} cartões ainda com dados`)
    const t2 = await screen.findByTestId('metrica-T2')
    expect(within(t2).getByTestId('selo-ficticio')).toBeInTheDocument()
  })

  it('com a fonte mock não há nota nem selo extra (o aviso global cobre)', async () => {
    renderizarApp('/operacional?cadencia=diaria')
    await screen.findByTestId('metrica-O2')
    expect(screen.queryByTestId('nota-ficticios-operacional')).not.toBeInTheDocument()
  })

  it('o selo de um cartão fictício com motivo mostra o motivo em texto visível', async () => {
    renderizarApp('/operacional?cadencia=semanal', fonteApi())
    const o18 = await screen.findByTestId('metrica-O18')
    expect(within(o18).getByTestId('selo-ficticio')).toHaveTextContent('Dados fictícios')
    expect(within(o18).getByTestId('motivo-ficticio')).toHaveTextContent(
      'aguardando campo no quadro',
    )
  })

  it('acessibilidade: selo e nota dizem o estado em texto, com ícone decorativo (nunca só cor)', async () => {
    renderizarApp('/operacional?cadencia=semanal', fonteApi())
    const nota = await screen.findByTestId('nota-ficticios-operacional')
    expect(nota.textContent.trim()).toMatch(/cartões ainda com dados fictícios$/)
    expect(nota.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    const o18 = await screen.findByTestId('metrica-O18')
    const selo = within(o18).getByTestId('selo-ficticio')
    expect(selo.textContent.trim()).toBe('Dados fictícios')
    expect(selo.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('Visão geral: origem de VISAO_GERAL (A1 do review da F6)', () => {
  it('com a API real mostra o selo "Dados fictícios", mesmo resumindo métricas reais', async () => {
    renderizarApp('/', fonteApi())
    const origem = await screen.findByTestId('origem-visao-geral')
    expect(within(origem).getByTestId('selo-ficticio')).toHaveTextContent('Dados fictícios')
  })

  it('com a fonte mock não há selo extra (o aviso global cobre)', async () => {
    renderizarApp('/')
    await screen.findByTestId('recorte-visao-geral')
    expect(screen.queryByTestId('selo-ficticio')).not.toBeInTheDocument()
  })
})

describe('painel com todas as métricas ocultas (P-5 = B)', () => {
  it('a faixa "Dados de calibração", o selo de frescor e a nota de fictícios continuam visíveis', async () => {
    ocultarTudo('operacional')
    renderizarApp('/operacional?cadencia=semanal', fonteApi())
    expect(await screen.findByTestId('painel-oculto-vazio')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByTestId('faixa-calibracao-businessmap')).toBeInTheDocument(),
    )
    expect(screen.getByTestId('faixa-calibracao-businessmap')).toHaveTextContent(
      'Dados de calibração',
    )
    expect(screen.getByTestId('selo-frescor-businessmap')).toHaveTextContent('Atual')
    expect(screen.getByTestId('nota-ficticios-operacional')).toBeInTheDocument()
    // Há indicação de que há métricas ocultas.
    expect(screen.getByTestId('faixa-ocultas')).toHaveTextContent('métricas ocultas')
  })
})

describe('notas no cartão (H-15 e H-24)', () => {
  const cartao = (codigo: string, extra: Record<string, unknown> = {}) =>
    render(
      <MemoryRouter>
        <CartaoMetrica
          codigo={codigo}
          titulo="T"
          pergunta="P?"
          estado="ok"
          nota={nota}
          fonte="BusinessMap"
          granularidade="demanda"
          {...extra}
        >
          <p>corpo</p>
        </CartaoMetrica>
      </MemoryRouter>,
    )

  it('O6 mostra "sem separação por classe" pelo texto do contrato', () => {
    cartao('O6')
    expect(screen.getByTestId('notas-cartao-O6')).toHaveTextContent(
      'Sem separação por classe até o quadro ter o campo.',
    )
  })

  it('o SLE (T2) só mostra a nota quando a métrica for dado real: hoje é mock', () => {
    cartao('T2')
    expect(screen.queryByTestId('notas-cartao-T2')).not.toBeInTheDocument()
  })

  it('O3 mostra "SLE não definido" só quando o resultado indica, e sem repetir', () => {
    const { unmount } = cartao('O3')
    expect(screen.queryByTestId('notas-cartao-O3')).not.toBeInTheDocument()
    unmount()
    cartao('O3', { notasDoCartao: ['sle-nao-definido', 'sle-nao-definido'] })
    const lista = screen.getByTestId('notas-cartao-O3')
    expect(within(lista).getAllByRole('listitem')).toHaveLength(1)
    expect(lista).toHaveTextContent('SLE não definido.')
  })

  it('um cartão sem nota indicada não mostra lista', () => {
    cartao('O1')
    expect(screen.queryByTestId('notas-cartao-O1')).not.toBeInTheDocument()
  })
})
