import { render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import {
  CHAVE_PREFERENCIAS,
  cartoesDoPainel,
  corpoSemDadoReal,
  origemDaMetrica,
  type MetricaId,
  type EstadoColeta,
  type PreferenciasMetricas,
} from '@metricas-dspd/contratos'
import { CartaoMetrica } from '@/components/ui'
import { SemDadoRealErro } from '@/data'
import { fonteDeTeste, renderizarApp } from '@/test/helpers'
import { contarSemDadoReal, origemDoCartao } from './OrigemDosCartoes'

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

/**
 * Fonte da API real sobre a base do mock: o estado de coleta é fixo, com calibração vigente, e a métrica fora do mapa real
 * responde `sem-dado-real` com o motivo, como a API (pedido 060, P3).
 */
const fonteApi = () =>
  Object.create(fonteDeTeste, {
    tipo: { value: 'api' },
    obter: {
      value: (id: MetricaId, ...resto: unknown[]) => {
        if (origemDaMetrica(id) === 'mock') {
          const c = corpoSemDadoReal(id)
          return Promise.reject(new SemDadoRealErro(c.metrica, c.motivo))
        }
        return (fonteDeTeste.obter as (...a: unknown[]) => Promise<unknown>)(id, ...resto)
      },
    },
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

describe('origem do cartão (pedido 060)', () => {
  it('com a API real, cartão cuja métrica é mock no contrato está sem dado real, com o motivo, e nunca é fictício', () => {
    expect(origemDoCartao('O12', 'api')).toEqual({
      ficticio: false,
      semDadoReal: true,
      motivo: 'aguardando campo no quadro',
    })
    expect(origemDoCartao('O2', 'api')).toEqual({
      ficticio: false,
      semDadoReal: false,
      motivo: null,
    })
    expect(origemDoCartao('O19', 'api')).toEqual({
      ficticio: false,
      semDadoReal: true,
      motivo: null,
    })
    expect(origemDoCartao('T2', 'api').semDadoReal).toBe(true)
  })

  it('código fora do catálogo vale como id de métrica: real se o mapa diz real, senão sem dado real', () => {
    expect(origemDoCartao('EI_FL1', 'api')).toEqual({
      ficticio: false,
      semDadoReal: false,
      motivo: null,
    })
    expect(origemDoCartao('XX9', 'api').semDadoReal).toBe(true)
    expect(origemDoCartao('XX9', 'mock').semDadoReal).toBe(false)
  })

  it('Sustentação: S2, S3, S4, S8 e S10 têm dado real; S1, S5, S6, S7, S9, S11, S12 e a EI_SUST estão sem dado real com o motivo do Acelerato', () => {
    for (const c of ['S2', 'S3', 'S4', 'S8', 'S10']) {
      expect(origemDoCartao(c, 'api').semDadoReal, c).toBe(false)
    }
    expect(origemDoCartao('S1', 'api').motivo).toBe('aguardando prazos de SLA por prioridade')
    for (const c of ['S5', 'S6', 'S7', 'S11']) {
      expect(origemDoCartao(c, 'api').motivo, c).toBe(
        'aguardando tipo e domínio do campo do chamado (P-DS-19)',
      )
    }
    expect(origemDoCartao('S9', 'api').motivo).toBe(
      'aguardando o motivo de pendência do chamado (tipo e domínio, P-DS-19)',
    )
    expect(origemDoCartao('S12', 'api').motivo).toBe(
      'aguardando fonte do registro posterior de exceção de SLA',
    )
    expect(origemDoCartao('EI-SUST', 'api').semDadoReal).toBe(true)
    expect(origemDoCartao('S2', 'mock').semDadoReal).toBe(false)
  })

  it('a contagem do cabeçalho da Sustentação só conta os cartões sem dado real', () => {
    const n = cartoesDoPainel('sustentacao').filter(
      (c) => origemDoCartao(c.codigo, 'api').semDadoReal,
    ).length
    expect(contarSemDadoReal('sustentacao', 'api')).toBe(n)
    expect(n).toBeLessThan(cartoesDoPainel('sustentacao').length)
    expect(n).toBeGreaterThanOrEqual(6)
  })

  it('com a fonte mock vale só o catálogo: o aviso global do app já diz que tudo é fictício', () => {
    expect(origemDoCartao('O12', 'mock').ficticio).toBe(false)
    expect(contarSemDadoReal('operacional', 'mock')).toBe(0)
  })

  it('a contagem do cabeçalho conta todo cartão do painel sem dado real', () => {
    const n = cartoesDoPainel('operacional').filter(
      (c) => origemDoCartao(c.codigo, 'api').semDadoReal,
    ).length
    expect(contarSemDadoReal('operacional', 'api')).toBe(n)
    expect(n).toBeGreaterThanOrEqual(7)
    expect(contarSemDadoReal('tatico', 'api')).toBe(cartoesDoPainel('tatico').length)
  })
})

describe('painel com API real: estado "Sem dado real" por cartão e nota do cabeçalho', () => {
  it('O12 mostra Sem dado real e o motivo, sem número nem selo fictício; O2 segue com dado; o cabeçalho conta', async () => {
    renderizarApp('/operacional?cadencia=semanal', fonteApi())
    const nota = await screen.findByTestId('nota-sem-dado-real-operacional')
    const n = contarSemDadoReal('operacional', 'api')
    expect(nota).toHaveTextContent(`${n} cartões sem dado real`)
    const o12 = await screen.findByTestId('metrica-O12')
    const estado = await within(o12).findByTestId('estado-sem-dado-real-O12')
    expect(estado).toHaveTextContent('Sem dado real')
    expect(within(o12).getByTestId('motivo-sem-dado-real-O12')).toHaveTextContent(
      'aguardando campo no quadro',
    )
    expect(o12).toHaveAttribute('data-estado', 'sem-dado-real')
    expect(within(o12).queryByTestId('selo-ficticio')).not.toBeInTheDocument()
    expect(within(o12).queryByTestId('leitura-O12')).not.toBeInTheDocument()
    expect(within(o12).queryByTestId('base-O12')).not.toBeInTheDocument()
    const o3 = await screen.findByTestId('metrica-O3')
    expect(within(o3).queryByTestId('estado-sem-dado-real-O3')).not.toBeInTheDocument()
  })

  it('no Tático todos os cartões estão sem dado real e a nota conta todos', async () => {
    renderizarApp('/tatico', fonteApi())
    const nota = await screen.findByTestId('nota-sem-dado-real-tatico')
    expect(nota).toHaveTextContent(`${contarSemDadoReal('tatico', 'api')} cartões sem dado real`)
    const t2 = await screen.findByTestId('metrica-T2')
    expect(await within(t2).findByTestId('estado-sem-dado-real-T2')).toBeInTheDocument()
    expect(within(t2).queryByTestId('selo-ficticio')).not.toBeInTheDocument()
    // Faixa de atenção: nunca afirma que nada pede atenção sem dado.
    expect(await screen.findByTestId('faixa-atencao-sem-dado-real')).toHaveTextContent(
      'Sem dado real',
    )
  })

  it('com a fonte mock não há nota nem estado de sem dado real (o aviso global cobre)', async () => {
    renderizarApp('/operacional?cadencia=diaria')
    await screen.findByTestId('metrica-O2')
    expect(screen.queryByTestId('nota-sem-dado-real-operacional')).not.toBeInTheDocument()
    expect(screen.queryByTestId('estado-sem-dado-real-O2')).not.toBeInTheDocument()
  })

  it('acessibilidade: o estado e a nota dizem em texto, com ícone decorativo (nunca só cor)', async () => {
    renderizarApp('/operacional?cadencia=semanal', fonteApi())
    const nota = await screen.findByTestId('nota-sem-dado-real-operacional')
    expect(nota.textContent.trim()).toMatch(/cartões sem dado real$/)
    expect(nota.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    const o18 = await screen.findByTestId('metrica-O18')
    const estado = await within(o18).findByTestId('estado-sem-dado-real-O18')
    expect(estado.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(estado).toHaveTextContent('Sem dado real')
    expect(estado).toHaveTextContent('aguardando campo no quadro')
  })

  it('o parâmetro ?mock= é ignorado contra a API: não simula erro de painel', async () => {
    renderizarApp('/operacional?cadencia=semanal&mock=erro', fonteApi())
    expect(await screen.findByTestId('metrica-O12')).toBeInTheDocument()
    expect(screen.queryByText(/Erro simulado/)).not.toBeInTheDocument()
  })
})

describe('Visão geral sem dado real', () => {
  it('com a API real mostra o estado com o motivo, sem número nem selo fictício', async () => {
    renderizarApp('/', fonteApi())
    const estado = await screen.findByTestId('estado-sem-dado-real-VISAO_GERAL')
    expect(estado).toHaveTextContent('Sem dado real')
    expect(estado).toHaveTextContent(corpoSemDadoReal('VISAO_GERAL').motivo)
    expect(screen.queryByTestId('selo-ficticio')).not.toBeInTheDocument()
    expect(screen.queryByTestId('recorte-visao-geral')).not.toBeInTheDocument()
  })

  it('com a fonte mock não há estado de sem dado real (o aviso global cobre)', async () => {
    renderizarApp('/')
    await screen.findByTestId('recorte-visao-geral')
    expect(screen.queryByTestId('estado-sem-dado-real-VISAO_GERAL')).not.toBeInTheDocument()
    expect(screen.queryByTestId('selo-ficticio')).not.toBeInTheDocument()
  })
})

describe('painel com todas as métricas ocultas (P-5 = B)', () => {
  it('a faixa "Dados de calibração", o selo de frescor e a nota de sem dado real continuam visíveis', async () => {
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
    expect(screen.getByTestId('nota-sem-dado-real-operacional')).toBeInTheDocument()
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
