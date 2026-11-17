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
  MOTIVO_O26_HISTORICO_RESPONSAVEIS,
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
        if (origemDaMetrica(id) === 'sem-dado') {
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
    expect(origemDoCartao('O14', 'api')).toEqual({
      ficticio: false,
      semDadoReal: true,
      motivo: 'aguardando campo no quadro',
    })
    // Pedido 105 (E7.5): o O15 é real pela fase de detecção.
    expect(origemDoCartao('O15', 'api')).toEqual({
      ficticio: false,
      semDadoReal: false,
      motivo: null,
    })
    // Pedido 099 (E3.223): o O12 é real pelo prazo do card; a parte de responsabilidade é dita dentro do cartão.
    expect(origemDoCartao('O12', 'api')).toEqual({
      ficticio: false,
      semDadoReal: false,
      motivo: null,
    })
    expect(origemDoCartao('O2', 'api')).toEqual({
      ficticio: false,
      semDadoReal: false,
      motivo: null,
    })
    // pedido 099 (lote A2): o O20 Fluxo cumulativo tem dado real
    expect(origemDoCartao('O20', 'api')).toEqual({
      ficticio: false,
      semDadoReal: false,
      motivo: null,
    })
    // pedido 075 (lote 6b): BLOQUEADOS, O5 e O19 voltaram ao mapa real
    for (const id of ['BLOQUEADOS', 'O5', 'O19']) {
      expect(origemDoCartao(id, 'api'), id).toEqual({
        ficticio: false,
        semDadoReal: false,
        motivo: null,
      })
    }
    // Pedido 105 (E7.100): T1, T2, T4, T6, O6 e O24 separam pela prioridade e estão no mapa real; o T5 segue sem dado real.
    expect(origemDoCartao('T2', 'api').semDadoReal).toBe(false)
    expect(origemDoCartao('T5', 'api').semDadoReal).toBe(true)
    // Pedido 105 (E7.55): o O26 segue sem dado real, com o motivo próprio que diz a data.
    expect(origemDoCartao('O26', 'api')).toEqual({
      ficticio: false,
      semDadoReal: true,
      motivo: MOTIVO_O26_HISTORICO_RESPONSAVEIS,
    })
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

  it('Sustentação: S1, S2, S3, S4, S8, S9, S10 e S12 têm dado real; S5, S6, S7 e S11 também (pedido 105, D2 e D6); só a EI_SUST está sem dado real', () => {
    for (const c of ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12']) {
      expect(origemDoCartao(c, 'api').semDadoReal, c).toBe(false)
    }
    expect(origemDoCartao('EI-SUST', 'api').semDadoReal).toBe(true)
    expect(origemDoCartao('S2', 'mock').semDadoReal).toBe(false)
  })

  it('a contagem do cabeçalho da Sustentação só conta os cartões sem dado real', () => {
    const n = cartoesDoPainel('sustentacao').filter(
      (c) => origemDoCartao(c.codigo, 'api').semDadoReal,
    ).length
    expect(contarSemDadoReal('sustentacao', 'api')).toBe(n)
    expect(n).toBeLessThan(cartoesDoPainel('sustentacao').length)
    expect(n).toBeGreaterThanOrEqual(1) // EI_SUST
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
    // O número vem da lista de origem real (contratos/origem.ts), não de uma constante (o cartão conta se alguma métrica dele está sem dado): cada métrica que ganha dado real tira um cartão daqui.
    const esperado = cartoesDoPainel('operacional').filter((c) =>
      c.metricas.some((m) => origemDaMetrica(m) === 'sem-dado'),
    ).length
    expect(n).toBe(esperado)
    expect(n).toBeGreaterThan(0)
    // Tático: o T10, o T9 e o T11 ganharam dado real (pedido 105, E7.77, E7.68 e E7.64), então os cartões deles saem da contagem; os demais seguem sem dado.
    const semDadoTatico = cartoesDoPainel('tatico').filter((c) =>
      c.metricas.some((m) => origemDaMetrica(m) === 'sem-dado'),
    ).length
    expect(contarSemDadoReal('tatico', 'api')).toBe(semDadoTatico)
    expect(semDadoTatico).toBeLessThan(cartoesDoPainel('tatico').length)
    expect(origemDoCartao('T9', 'api').semDadoReal).toBe(false)
    expect(origemDoCartao('T11', 'api').semDadoReal).toBe(false)
  })
})

describe('painel com API real: estado "Sem dado real" por cartão e nota do cabeçalho', () => {
  it('O14 mostra Sem dado real e o motivo, sem número nem selo fictício; O2 segue com dado; o cabeçalho conta', async () => {
    renderizarApp('/operacional?cadencia=semanal#o14', fonteApi())
    const nota = await screen.findByTestId('nota-sem-dado-real-operacional')
    const n = contarSemDadoReal('operacional', 'api')
    expect(nota).toHaveTextContent(`${n} cartões sem dado real`)
    const o12 = await screen.findByTestId('metrica-O14')
    const estado = await within(o12).findByTestId('estado-sem-dado-real-O14')
    expect(estado).toHaveTextContent('Sem dado real')
    expect(within(o12).getByTestId('motivo-sem-dado-real-O14')).toHaveTextContent(
      'Motivo: aguardando campo no quadro',
    )
    expect(o12).toHaveAttribute('data-estado', 'sem-dado-real')
    expect(within(o12).queryByTestId('selo-ficticio')).not.toBeInTheDocument()
    expect(within(o12).queryByTestId('leitura-O14')).not.toBeInTheDocument()
    expect(within(o12).queryByTestId('base-O14')).not.toBeInTheDocument()
    const o3 = await screen.findByTestId('metrica-O3')
    expect(within(o3).queryByTestId('estado-sem-dado-real-O3')).not.toBeInTheDocument()
  })

  it('no Tático a nota conta os cartões sem dado real, e o T5 está entre eles', async () => {
    renderizarApp('/tatico', fonteApi())
    const nota = await screen.findByTestId('nota-sem-dado-real-tatico')
    expect(nota).toHaveTextContent(`${contarSemDadoReal('tatico', 'api')} cartões sem dado real`)
    const t5 = await screen.findByTestId('metrica-T5')
    expect(await within(t5).findByTestId('estado-sem-dado-real-T5')).toBeInTheDocument()
    expect(within(t5).queryByTestId('selo-ficticio')).not.toBeInTheDocument()
    // Faixa de atenção: com T2, T4, T9 e T11 reais e T3 sem dado, a faixa lista o que há ou diz que a lacuna é parcial; nunca afirma que nada pede atenção.
    expect(screen.queryByText(/Nada pede atenção/)).not.toBeInTheDocument()
    expect(
      await within(await screen.findByTestId('metrica-T9')).findByTestId('tabela-T9'),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('faixa-atencao-sem-dado-real')).not.toBeInTheDocument()
  })

  it('com a fonte mock não há nota nem estado de sem dado real (o aviso global cobre)', async () => {
    renderizarApp('/operacional?cadencia=diaria')
    await screen.findByTestId('metrica-O2')
    expect(screen.queryByTestId('nota-sem-dado-real-operacional')).not.toBeInTheDocument()
    expect(screen.queryByTestId('estado-sem-dado-real-O2')).not.toBeInTheDocument()
  })

  it('acessibilidade: o estado e a nota dizem em texto, com ícone decorativo (nunca só cor)', async () => {
    renderizarApp('/operacional?cadencia=semanal#o14', fonteApi())
    const nota = await screen.findByTestId('nota-sem-dado-real-operacional')
    expect(nota.textContent.trim()).toMatch(/cartões sem dado real$/)
    expect(nota.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    const o15 = await screen.findByTestId('metrica-O14')
    const estado = await within(o15).findByTestId('estado-sem-dado-real-O14')
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

  it('O6 mostra "sem prioridade fica fora" pelo texto do contrato', () => {
    cartao('O6')
    expect(screen.getByTestId('notas-cartao-O6')).toHaveTextContent(
      'Cartões sem prioridade ficam fora da separação por prioridade e são contados à parte.',
    )
  })

  it('o T2 mostra a nota de cartões sem prioridade, pelo texto do contrato', () => {
    cartao('T2')
    expect(screen.getByTestId('notas-cartao-T2')).toHaveTextContent(
      'Cartões sem prioridade ficam fora da separação por prioridade e são contados à parte.',
    )
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
