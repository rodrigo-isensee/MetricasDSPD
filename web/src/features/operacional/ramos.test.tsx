import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { Periodo } from '@metricas-dspd/contratos'
import { FILTROS_FLUXO, FonteAjustada } from '@/features/painel/testes/fonteFixa'
import { renderizarApp, renderizarCartao } from '@/test/helpers'
import { CartaoBloqueados } from './components/CartaoBloqueados'
import { CartaoO1 } from './components/CartaoO1'
import { CartaoO18 } from './components/CartaoO18'
import { CartaoO2 } from './components/CartaoO2'
import { CartaoO4 } from './components/CartaoO4'
import { CartaoO7 } from './components/CartaoO7'

const pronto = async (codigo: string) => {
  const el = await screen.findByTestId(`metrica-${codigo}`)
  await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
  return el
}

describe('O1: variações da leitura', () => {
  it('sem equipe única mostra a orientação e só soma o limite com mais de uma equipe', async () => {
    renderizarCartao(<CartaoO1 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        O1: (r: { porColuna: unknown; equipesConsideradas: number }) => {
          r.porColuna = null
          r.equipesConsideradas = 1
        },
      }),
    })
    const el = await pronto('O1')
    expect(within(el).getByTestId('o1-selecione-equipe')).toHaveTextContent(
      /^Selecione uma equipe para ver por coluna\.$/,
    )
  })

  it('com várias equipes somadas, avisa o limite somado; sem janela, não escreve o intervalo', async () => {
    renderizarCartao(<CartaoO1 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        O1: (r: { porColuna: unknown; equipesConsideradas: number; base: { janela: unknown } }) => {
          r.porColuna = null
          r.equipesConsideradas = 3
          r.base.janela = null
        },
      }),
    })
    const el = await pronto('O1')
    expect(within(el).getByTestId('o1-selecione-equipe')).toHaveTextContent(
      'Limite somado de 3 equipes.',
    )
    expect(within(el).getByText(/Dias acima do limite no período:/)).toHaveTextContent(/\(\)\.$/)
  })

  it('percentual dos dias dentro do limite só com 20 dias ou mais; abaixo mostra "k de n"', async () => {
    renderizarCartao(<CartaoO1 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        O1: (r: { diasDentroDoLimite: unknown }) => {
          r.diasDentroDoLimite = { status: 'insuficiente', k: 7, n: 12, minimo: 20, janela: null }
        },
      }),
    })
    const el = await pronto('O1')
    expect(within(el).getByTestId('o1-dias-dentro')).toHaveTextContent('7 de 12')
  })
})

describe('Bloqueados', () => {
  it('um só item bloqueado: singular; nenhum: estado positivo sem frase de leitura', async () => {
    const um = renderizarCartao(<CartaoBloqueados filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        BLOQUEADOS: (r: { itens: unknown[] }) => {
          r.itens = r.itens.slice(0, 1)
        },
      }),
    })
    const el = await pronto('BLOQUEADOS')
    expect(within(el).getByTestId('leitura-BLOQUEADOS')).toHaveTextContent(
      /^1 item está bloqueado\./,
    )
    um.unmount()
    renderizarCartao(<CartaoBloqueados filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        BLOQUEADOS: (r: { itens: unknown[] }) => {
          r.itens = []
        },
      }),
    })
    const vazio = await pronto('BLOQUEADOS')
    expect(within(vazio).getByTestId('bloqueados-nenhum')).toBeInTheDocument()
    expect(within(vazio).queryByTestId('leitura-BLOQUEADOS')).toBeNull()
  })
})

describe('O2: idade do WIP', () => {
  it('troca de tipo pela aba e ordena a lista por idade ou por tempo parado', async () => {
    const r = renderizarCartao(<CartaoO2 filtros={FILTROS_FLUXO} />)
    const el = await pronto('O2')
    await userEvent.click(within(el).getAllByRole('tab')[1] as HTMLElement)
    expect(r.roteador.state.location.search).toContain('o2=')
    await userEvent.click(within(el).getByRole('button', { name: 'Sem mover há' }))
    expect(within(el).getByRole('button', { name: 'Sem mover há' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await userEvent.click(within(el).getByRole('button', { name: 'Idade' }))
    expect(within(el).getByRole('button', { name: 'Idade' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('com mais itens em andamento que a página, avisa que a dispersão mostra só os mais velhos', async () => {
    renderizarCartao(<CartaoO2 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        O2: (r: { itens: unknown[]; itensMeta: { total: number } }) => {
          r.itensMeta = { ...r.itensMeta, total: r.itens.length + 311 }
        },
      }),
    })
    const el = await pronto('O2')
    expect(within(el).getByTestId('o2-amostra')).toHaveTextContent(
      /mostram os \d+ itens mais velhos de \d+ em andamento\./,
    )
  })

  it('com todos os itens na página, não mostra o aviso de amostra', async () => {
    renderizarCartao(<CartaoO2 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        O2: (r: { itens: unknown[]; itensMeta: { total: number } }) => {
          r.itensMeta = { ...r.itensMeta, total: r.itens.length }
        },
      }),
    })
    const el = await pronto('O2')
    expect(within(el).queryByTestId('o2-amostra')).toBeNull()
  })

  it('sem nenhum item em andamento, a leitura não cita o mais velho', async () => {
    renderizarCartao(<CartaoO2 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        O2: (r: { itens: unknown[]; acimaP95: number }) => {
          r.itens = []
          r.acimaP95 = 0
        },
      }),
    })
    const el = await pronto('O2')
    expect(within(el).getByTestId('leitura-O2')).toHaveTextContent(
      /^Nenhum item está acima do P95 do seu tipo\.$/,
    )
  })

  it('vários itens acima do P95: a leitura cita o mais velho entre eles', async () => {
    renderizarCartao(<CartaoO2 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        O2: (r: { itens: { situacao: string }[]; acimaP95: number }) => {
          r.itens.slice(0, 3).forEach((i) => (i.situacao = 'acima-p95'))
          r.acimaP95 = 3
        },
      }),
    })
    const el = await pronto('O2')
    expect(within(el).getByTestId('leitura-O2')).toHaveTextContent(
      /^3 itens estão acima do P95 do seu tipo\. O mais velho entre eles/,
    )
  })

  it('itens em andamento, nenhum acima do P95: cita o mais velho', async () => {
    renderizarCartao(<CartaoO2 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        O2: (r: { itens: { situacao: string }[]; acimaP95: number }) => {
          r.itens.forEach((i) => (i.situacao = 'dentro'))
          r.acimaP95 = 0
        },
      }),
    })
    const el = await pronto('O2')
    expect(within(el).getByTestId('leitura-O2')).toHaveTextContent(/O mais velho tem/)
  })
})

describe('O4: empilhar por tipo', () => {
  it('liga e desliga o empilhamento por tipo, com legenda dos tipos', async () => {
    renderizarCartao(<CartaoO4 filtros={FILTROS_FLUXO} />)
    const el = await pronto('O4')
    expect(within(el).queryByRole('list', { name: 'Legenda' })?.textContent ?? '').not.toContain(
      'Melhoria',
    )
    await userEvent.click(within(el).getByRole('checkbox', { name: 'Empilhar por tipo' }))
    await waitFor(() =>
      expect(within(el).getByRole('list', { name: 'Legenda' })).toHaveTextContent(/Melhoria/),
    )
    await userEvent.click(within(el).getByRole('checkbox', { name: 'Empilhar por tipo' }))
    expect(within(el).queryByRole('list', { name: 'Legenda' })).toBeNull()
  })
})

describe('O7: aviso de período curto', () => {
  const caso = async (periodo: Periodo) => {
    const r = renderizarCartao(<CartaoO7 filtros={{ ...FILTROS_FLUXO, periodo }} />)
    const el = await pronto('O7')
    const tem = within(el).queryByTestId('o7-aviso-6-meses') !== null
    r.unmount()
    return tem
  }
  it('avisa abaixo de 6 meses (4s, 12s, personalizado curto) e não avisa de 6 meses em diante', async () => {
    expect(await caso({ tipo: '4s' })).toBe(true)
    expect(await caso({ tipo: '12s' })).toBe(true)
    expect(await caso({ tipo: 'custom', de: '2026-09-01', ate: '2026-09-30' })).toBe(true)
    expect(await caso({ tipo: '6m' })).toBe(false)
    expect(await caso({ tipo: 'custom', de: '2026-01-01', ate: '2026-09-30' })).toBe(false)
  })
})

describe('O18: leitura sem mês fechado', () => {
  it('sem nenhum mês fechado com taxa publicada, resume o período todo', async () => {
    renderizarCartao(<CartaoO18 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        O18: (r: { meses: { emAndamento: boolean }[] }) => {
          r.meses.forEach((m) => (m.emAndamento = true))
        },
      }),
    })
    const el = await pronto('O18')
    expect(within(el).getByTestId('leitura-O18')).toHaveTextContent(
      /^No período, \d+ de \d+ cards entregues tiveram bug vinculado\./,
    )
  })

  it('mês fechado com densidade indisponível mostra só a taxa', async () => {
    renderizarCartao(<CartaoO18 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteAjustada({
        O18: (r: {
          meses: {
            emAndamento: boolean
            emApuracaoAte: null
            taxaLimpa: unknown
            densidadeGeral: unknown
          }[]
        }) => {
          r.meses.forEach((m) => {
            m.emAndamento = false
            m.emApuracaoAte = null
            m.taxaLimpa = { status: 'ok', k: 18, n: 20, pct: 90, minimo: 20, janela: null }
            m.densidadeGeral = { status: 'insuficiente', n: 3, minimo: 20, janela: null }
          })
        },
      }),
    })
    const el = await pronto('O18')
    expect(within(el).getByTestId('leitura-O18')).toHaveTextContent(
      /das entregas saíram sem bug\.$/,
    )
  })
})

describe('Painel Operacional: faixa semanal', () => {
  it('variação do P85 publicada mas sem percentual não conta como "subiu"', async () => {
    renderizarApp(
      '/operacional?cadencia=semanal',
      new FonteAjustada({
        O3: (r: { classes: { variacaoP85: { status: string; variacaoPct: number | null } }[] }) => {
          r.classes.forEach((c) => (c.variacaoP85 = { status: 'ok', variacaoPct: null }))
        },
      }),
    )
    await screen.findByTestId('metrica-O3')
    await screen.findByTestId('faixa-atencao')
    await waitFor(() => expect(screen.queryByTestId('faixa-atencao-carregando')).toBeNull())
    expect(screen.queryByText(/P85 do tempo de ciclo subiu/)).toBeNull()
  })
})
