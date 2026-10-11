import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CATALOGO_CARTOES } from '@metricas-dspd/contratos'
import {
  FILTROS_FLUXO,
  FILTROS_SUSTENTACAO,
  FonteAjustada,
} from '@/features/painel/testes/fonteFixa'
import { renderizarApp, renderizarCartao } from '@/test/helpers'
import { MemoryRouter } from 'react-router'
import { PREFERENCIAS_PADRAO } from '@metricas-dspd/contratos'
import type { FontePreferencias } from '@/features/preferencias/fonte'
import { ProvedorPainelPreferencias } from '@/features/preferencias/ProvedorPainelPreferencias'
import { ProvedorPreferencias } from '@/features/preferencias/ProvedorPreferencias'
import { LeiaJunto } from './LeiaJunto'
import { MaisMetricas } from './MaisMetricas'
import { ListaInsuficientes } from './comuns'
import { CartaoO14, CartaoO5 } from './fluxo'
import { CartaoE4, CartaoE5, CartaoT6 } from './previsao'
import { CartaoS10, CartaoS8 } from './sustentacao'

vi.setConfig({ testTimeout: 45000 })

type Qualquer = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

describe('ramos dos componentes complementares', () => {
  it('lista de insuficientes vazia não desenha nada; seção fora de um painel não desenha nada', () => {
    const a = render(<ListaInsuficientes itens={[]} />)
    expect(a.container).toBeEmptyDOMElement()
    const b = render(<MaisMetricas fonte="BusinessMap" renderizar={() => null} />)
    expect(b.container).toBeEmptyDOMElement()
  })

  it('com todas as métricas do painel ocultas, a seção também some', async () => {
    window.localStorage.setItem(
      'metricas-dspd:preferencias:v1',
      JSON.stringify({
        versao: 1,
        paineis: { estrategico: { ocultar: ['e1', 'e2', 'e3', 'ei-fl3', 'e4', 'e5'] } },
        atualizadoEm: '2026-10-10T00:00:00.000Z',
      }),
    )
    renderizarApp('/estrategico')
    await screen.findByTestId('painel-oculto-vazio')
    expect(screen.queryByTestId('mais-metricas')).not.toBeInTheDocument()
  })

  it('o selo "Dados fictícios" só aparece quando o catálogo diz que o status é mock', async () => {
    const c = CATALOGO_CARTOES.find((x) => x.id === 'o5') as { status: string }
    const original = c.status
    c.status = 'disponivel'
    try {
      renderizarCartao(<CartaoO5 filtros={FILTROS_FLUXO} />)
      const el = await screen.findByTestId('metrica-O5')
      await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'))
      expect(within(el).queryByTestId('selo-ficticio')).not.toBeInTheDocument()
    } finally {
      c.status = original
    }
  })

  it('O14 mostra a linha "demais" quando existe', async () => {
    const fonte = new FonteAjustada({
      O14: (r: Qualquer) => {
        r.porArea.demais = structuredClone(r.porArea.itens[0])
        r.porArea.demais.nome = 'Demais'
      },
    })
    renderizarCartao(<CartaoO14 filtros={FILTROS_FLUXO} />, { fonte })
    const el = await screen.findByTestId('metrica-O14')
    await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'))
  })

  it('Leia junto com id fora do catálogo do painel não desenha nada', async () => {
    const fonte: FontePreferencias = {
      origem: 'navegador',
      obter: () => Promise.resolve(PREFERENCIAS_PADRAO),
      salvar: () => Promise.resolve(),
    }
    render(
      <MemoryRouter>
        <ProvedorPreferencias fonte={fonte}>
          <ProvedorPainelPreferencias painel="operacional">
            <LeiaJunto id="inexistente" />
          </ProvedorPainelPreferencias>
        </ProvedorPreferencias>
      </MemoryRouter>,
    )
    await Promise.resolve()
    expect(screen.queryByTestId('leia-junto-inexistente')).not.toBeInTheDocument()
  })

  it('Leia junto fora de um painel não desenha nada', () => {
    const a = render(<LeiaJunto id="O3" />)
    expect(a.container).toBeEmptyDOMElement()
  })

  it('O14 troca de área para sistema', async () => {
    const u = userEvent.setup()
    renderizarCartao(<CartaoO14 filtros={FILTROS_FLUXO} />)
    const el = await screen.findByTestId('metrica-O14')
    await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'))
    await u.click(within(el).getByRole('tab', { name: 'Sistema' }))
    expect(within(el).getByRole('tab', { name: 'Sistema' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('T6 e E5 em granularidade diária escrevem dias', async () => {
    const aDia = (v: Qualquer) => {
      for (const c of v.classes ?? []) {
        for (const t of c.termino) if (t.previsao.valor) t.previsao.valor.granularidade = 'dia'
      }
      for (const p of v.projetos ?? []) if (p.previsao.valor) p.previsao.valor.granularidade = 'dia'
    }
    const fonte = new FonteAjustada({ T6: aDia, E5: aDia })
    renderizarCartao(<CartaoT6 filtros={FILTROS_FLUXO} />, { fonte })
    const t6 = await screen.findByTestId('metrica-T6')
    await waitFor(() => expect(t6).toHaveAttribute('data-estado', 'ok'))
    expect(t6.textContent).toMatch(/\d+ dias?/)
    renderizarCartao(<CartaoE5 filtros={FILTROS_FLUXO} />, { fonte })
    const e5 = await screen.findAllByTestId('metrica-E5')
    await waitFor(() => expect(e5[0]).toHaveAttribute('data-estado', 'ok'))
  })

  it('E4 sem registro de natureza conta zero', async () => {
    const fonte = new FonteAjustada({
      E4: (r: Qualquer) => {
        for (const t of r.trimestres) t.iniciadosPorNatureza = []
      },
    })
    renderizarCartao(<CartaoE4 filtros={FILTROS_FLUXO} />, { fonte })
    expect(await screen.findByTestId('natureza-E4')).toHaveTextContent(
      '0 para manter e 0 para evoluir',
    )
  })

  it('S8 acima da referência diz "Acima de 5%"', async () => {
    const fonte = new FonteAjustada({
      S8: (r: Qualquer) => {
        r.statusMeta = 'fora'
        r.total = { status: 'ok', k: 10, n: 40, pct: 25 }
      },
    })
    renderizarCartao(<CartaoS8 filtros={FILTROS_SUSTENTACAO} />, { fonte })
    expect(await screen.findByText('Acima de 5%')).toBeInTheDocument()
  })

  it('S10 com percentis publicados mostra os três e o histograma só quando existe', async () => {
    const ajuste = (histograma: unknown) => ({
      S10: ((r: Qualquer) => {
        r.prioridades[0].estatistica = {
          status: 'ok',
          n: 30,
          valor: { p50: 1, p85: 2, p95: 3 },
          janela: r.base.janela,
        }
        r.prioridades[0].histograma = histograma
      }) as never,
    })
    const a = renderizarCartao(<CartaoS10 filtros={FILTROS_SUSTENTACAO} />, {
      fonte: new FonteAjustada(ajuste(null)),
    })
    expect(await screen.findByTestId('percentis-S10')).toHaveTextContent(/P50.*P85.*P95/)
    a.unmount()
    renderizarCartao(<CartaoS10 filtros={FILTROS_SUSTENTACAO} />, {
      fonte: new FonteAjustada(ajuste([{ rotulo: '0 a 1 h', min: 0, max: 1, contagem: 12 }])),
    })
    expect(await screen.findByTestId('percentis-S10')).toBeInTheDocument()
  })
})
