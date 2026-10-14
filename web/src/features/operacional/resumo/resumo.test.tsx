import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import {
  CHAVE_PREFERENCIAS,
  type EstadoColeta,
  type FiltrosDe,
  type MetricaId,
  type ResultadoDe,
} from '@metricas-dspd/contratos'
import { MockFonteMetricas } from '@/data'
import { FonteAjustada } from '@/features/painel/testes/fonteFixa'
import { renderizarApp } from '@/test/helpers'

afterEach(() => window.localStorage.clear())

const bloco = async (id: 'resumo-fluxo' | 'resumo-sustentacao') => {
  const el = await screen.findByTestId(id, undefined, { timeout: 8000 })
  return el
}
/** Espera os números do bloco saírem do esqueleto. */
const numero = async (id: string) => {
  const el = await screen.findByTestId(`numero-${id}`, undefined, { timeout: 8000 })
  await waitFor(() => expect(within(el).queryByTestId(`numero-${id}-carregando`)).toBeNull(), {
    timeout: 8000,
  })
  return el
}
const guardarPrefs = (paineis: Record<string, string[]>) =>
  window.localStorage.setItem(
    CHAVE_PREFERENCIAS,
    JSON.stringify({
      versao: 1,
      paineis: Object.fromEntries(Object.entries(paineis).map(([k, v]) => [k, { ocultar: v }])),
      atualizadoEm: '2026-10-10T00:00:00.000Z',
    }),
  )

describe('Resumo: padrão e estrutura (CA-23, CA-25)', () => {
  it('sem parâmetro marca Resumo, mostra os dois blocos nessa ordem e a URL não tem cadencia', async () => {
    const r = renderizarApp('/operacional')
    const fluxo = await bloco('resumo-fluxo')
    const sust = await bloco('resumo-sustentacao')
    expect(screen.getByRole('radio', { name: 'Resumo' })).toBeChecked()
    expect(fluxo.compareDocumentPosition(sust) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(r.roteador.state.location.search).not.toContain('cadencia')
    expect(screen.getByRole('heading', { level: 1, name: 'Operacional' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Fluxo de projeto · BusinessMap' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Sustentação · Acelerato' }),
    ).toBeInTheDocument()
    await waitFor(() => expect(document.title).toContain('Operacional · Resumo · Métricas DSPD'))
  })

  it('cadencia=resumo é aceito e normalizado sem entrada no histórico', async () => {
    const r = renderizarApp('/operacional?cadencia=resumo')
    await bloco('resumo-fluxo')
    await waitFor(() => expect(r.roteador.state.location.search).toBe(''))
    expect(r.roteador.state.historyAction).toBe('REPLACE')
  })

  it('valor de visão desconhecido cai no Resumo com o aviso de valor inválido', async () => {
    const r = renderizarApp('/operacional?cadencia=xyz')
    expect(
      await screen.findByTestId('aviso-filtros-invalidos', undefined, { timeout: 15000 }),
    ).toHaveTextContent('visão "xyz"')
    expect(r.roteador.state.location.search).toBe('')
    await userEvent.click(screen.getByRole('button', { name: 'Entendi' }))
    await waitFor(() => expect(screen.queryByTestId('aviso-filtros-invalidos')).toBeNull())
  })

  it('cada bloco tem o seu selo de fonte e frescor; nenhum código da outra fonte aparece (CA-25)', async () => {
    renderizarApp('/operacional')
    const fluxo = await bloco('resumo-fluxo')
    const sust = await bloco('resumo-sustentacao')
    await waitFor(() =>
      expect(within(fluxo).getByTestId('resumo-fluxo-fonte')).toHaveTextContent(
        /Fonte: BusinessMap · Dados até \d{2}\/\d{2}\/\d{4} · 12 semanas/,
      ),
    )
    expect(within(sust).getByTestId('resumo-sustentacao-fonte')).toHaveTextContent(
      /Fonte: Acelerato · Dados até \d{2}\/\d{2}\/\d{4} · 12 semanas/,
    )
    await numero('p85')
    await numero('s2')
    await screen.findByTestId('tendencia-sustentacao', undefined, { timeout: 8000 })
    await screen.findByTestId('tendencia-fluxo', undefined, { timeout: 8000 })
    expect(fluxo.textContent).not.toMatch(/\bS(?:\d{1,2})\b|EI-SUST|PV1|Acelerato/)
    expect(sust.textContent).not.toMatch(/\bO(?:\d{1,2})\b|BusinessMap|BLOQUEADOS/)
    expect(screen.queryByText(/total geral|combinado/i)).toBeNull()
    expect(screen.queryByText('Também nesta aba', { exact: false })).toBeNull()
  })
})

describe('Resumo: números-chave (CA-26)', () => {
  it('o fluxo tem O3, O4, O2 e O12; a Sustentação, S2, S1 e S3, cada um com base, unidade e link para a visão dona', async () => {
    renderizarApp('/operacional?equipe=fluig&sust_prioridade=p1&mock=sem-calibracao')
    const p85 = await numero('p85')
    expect(p85).toHaveTextContent(/P85 do tempo de ciclo · Melhoria/)
    expect(within(p85).getByTestId('numero-p85-valor')).toHaveTextContent(/\d+ dias úteis/)
    expect(p85).toHaveTextContent(/P50: \d+ dias úteis/)
    expect(p85).toHaveTextContent(/Base: \d+ itens concluídos/)
    const link = within(p85).getByRole('link', { name: 'Ver O3 na Semanal' })
    const href = link.getAttribute('href') as string
    expect(href.startsWith('/operacional?')).toBe(true)
    expect(href.endsWith('#o3')).toBe(true)
    const q = new URLSearchParams(href.split('#')[0]?.split('?')[1])
    // preserva os filtros guardados e não leva o mock
    expect(q.get('cadencia')).toBe('semanal')
    expect(q.get('equipe')).toBe('fluig')
    expect(q.get('sust_prioridade')).toBe('p1')
    expect(q.has('mock')).toBe(false)

    const vazao = await numero('vazao')
    expect(within(vazao).getByTestId('numero-vazao-valor')).toHaveTextContent(/itens? concluídos?/)
    expect(vazao).toHaveTextContent(/Faixa das semanas da janela: \d+ a \d+ por semana/)
    expect(within(vazao).getByRole('link', { name: 'Ver O4 na Semanal' })).toBeInTheDocument()
    const acima = await numero('acima-p95')
    expect(acima).toHaveTextContent('Meta: nenhum sem plano')
    expect(
      within(acima).getByRole('link', { name: 'Ver O2 na Diária' }).getAttribute('href'),
    ).toContain('cadencia=diaria')
    const venc = await numero('vencidos-internos')
    expect(venc).toHaveTextContent('Meta: zero')
    expect(venc.querySelector('[data-status]')).not.toBeNull()
    expect(within(venc).getByRole('link', { name: 'Ver O12 na Semanal' })).toBeInTheDocument()

    const s2 = await numero('s2')
    expect(within(s2).getByTestId('numero-s2-valor')).toHaveTextContent(
      /\d+ de \d+ prioridades avaliadas/,
    )
    expect(
      within(s2).getByRole('link', { name: 'Ver S2 na Sustentação' }).getAttribute('href'),
    ).toContain('cadencia=sustentacao')
    const s1 = await numero('s1')
    expect(within(s1).getByTestId('numero-s1-valor')).toHaveTextContent(/\d+ de \d+/)
    const vol = await numero('volume')
    expect(vol).toHaveTextContent(/chamados abertos/)
    expect(vol).toHaveTextContent(/P1\+P2: [\d,]+% \(\d+ de \d+\)/)
    expect(within(vol).getByRole('link', { name: 'Ver S3 na Sustentação' })).toBeInTheDocument()
  })

  it('com menos de 20 itens o número não é publicado (Poucos itens, n=14), e a faixa e a vazão seguem', async () => {
    const fonte = new FonteAjustada({
      O3: (r: ResultadoDe<'O3'>) => {
        for (const c of r.classes)
          c.estatistica = {
            status: 'insuficiente',
            n: 14,
            minimo: 20,
            janela: c.estatistica.janela,
          }
        for (const c of r.classes) c.n = 14
      },
      O4: (r: ResultadoDe<'O4'>) => {
        r.faixa = { status: 'insuficiente', n: 5, minimo: 20, janela: r.faixa.janela }
      },
      S2: (r: ResultadoDe<'S2'>) => {
        for (const p of r.prioridades) {
          const t = { status: 'insuficiente' as const, k: 1, n: 3, minimo: 20 as const }
          p.primeiroAtendimento = { taxa: t, statusMeta: 'sem-referencia' }
          p.restauracao = { taxa: t, statusMeta: 'sem-referencia' }
        }
      },
      S3: (r: ResultadoDe<'S3'>) => {
        r.janela = { total: 9, p1p2: { status: 'insuficiente', k: 2, n: 9, minimo: 20 } }
      },
    })
    renderizarApp('/operacional', fonte)
    const p85 = await numero('p85')
    expect(within(p85).getByTestId('numero-p85-insuficiente')).toHaveTextContent(
      'Poucos itens (n=14). Estatística não publicada.',
    )
    expect(within(p85).queryByTestId('numero-p85-valor')).toBeNull()
    expect(await numero('vazao')).toHaveTextContent('Faixa não publicada (n=5).')
    const s2 = await numero('s2')
    expect(within(s2).getByTestId('numero-s2-insuficiente')).toHaveTextContent(
      'Nenhuma prioridade com 20 chamados ou mais na janela. Estatística não publicada.',
    )
    const vol = await numero('volume')
    expect(vol).toHaveTextContent('9 chamados abertos')
    expect(vol).toHaveTextContent('P1+P2: 2 de 9 (percentual só com 20 chamados ou mais)')
  })
})

describe('Resumo: tendência (CA-27)', () => {
  it('cada série tem 6 meses, título com a janela, tabela alternativa e frase de leitura', async () => {
    renderizarApp('/operacional')
    const p85 = await screen.findByTestId('tendencia-fluxo-p85', undefined, { timeout: 15000 })
    expect(within(p85).getByRole('heading', { level: 3 })).toHaveTextContent(
      /P85 do tempo de ciclo · Melhoria, em dias úteis, últimos 6 meses/,
    )
    expect(p85).toHaveTextContent('Cada ponto: janela de 12 semanas até o fim do mês')
    expect(within(p85).getByRole('img')).toHaveAccessibleName(/abril: .*setembro: /)
    expect(within(p85).getByTestId('tendencia-fluxo-p85-frase')).toHaveTextContent(
      /^Em setembro: \d+ dias úteis, \d+ a (mais|menos) que em agosto\.$|^Em setembro: \d+ dias úteis, igual a agosto\.$/,
    )
    await userEvent.click(within(p85).getByRole('button', { name: 'Ver como tabela' }))
    const t = within(p85).getByRole('table')
    expect(within(t).getAllByRole('row')).toHaveLength(7)
    expect(within(t).getByRole('columnheader', { name: 'P85 (dias úteis)' })).toBeInTheDocument()
    await userEvent.click(within(p85).getByRole('button', { name: 'Ver como gráfico' }))
    expect(within(p85).queryByRole('table')).toBeNull()
    const concl = screen.getByTestId('tendencia-fluxo-concluidos')
    expect(concl).toHaveTextContent('Itens concluídos por mês, últimos 6 meses')
    expect(screen.getByTestId('tendencia-sustentacao-volume')).toHaveTextContent(
      'pela data de abertura',
    )
    const sla = screen.getByTestId('tendencia-sustentacao-sla')
    expect(sla).toHaveTextContent('Cada ponto: janela de 12 semanas até o fim do mês')
    expect(within(sla).getByTestId('tendencia-sustentacao-sla-frase')).toHaveTextContent(
      /^Em setembro: \d+ de \d+ avaliadas\.$/,
    )
  })

  it('mês com poucos itens aparece sem valor, com marcador vazado e rótulo "poucos itens (n=14)", sem ligar os vizinhos', async () => {
    renderizarApp('/operacional?mock=tendencia-poucos')
    const p85 = await screen.findByTestId('tendencia-fluxo-p85', undefined, { timeout: 15000 })
    expect(within(p85).getByTestId('tendencia-fluxo-p85-sem-valor')).toHaveTextContent(
      'jun/2026 · poucos itens (n=14)',
    )
    expect(within(p85).getByTestId('marcador-vazado')).toBeInTheDocument()
    await userEvent.click(within(p85).getByRole('button', { name: 'Ver como tabela' }))
    const linha = within(within(p85).getByRole('table')).getByRole('row', { name: /jun\/2026/ })
    expect(linha).toHaveTextContent('n=14 · não publicado')
    // Sustentação: junho "k de 3 avaliadas" e julho sem nenhuma prioridade publicada
    const sla = await screen.findByTestId('tendencia-sustentacao-sla')
    await userEvent.click(within(sla).getByRole('button', { name: 'Ver como tabela' }))
    const t = within(sla).getByRole('table')
    expect(within(t).getByRole('row', { name: /jun\/2026/ })).toHaveTextContent(/\d de 3 avaliadas/)
    expect(within(t).getByRole('row', { name: /jul\/2026/ })).toHaveTextContent(
      'n=0 · não publicado',
    )
    expect(within(sla).getByTestId('tendencia-sustentacao-sla-sem-valor')).toHaveTextContent(
      'jul/2026 · não publicado',
    )
  })

  it('sem histórico (mock=vazio): texto de vazio total, sem 400 e sem filtro na consulta', async () => {
    const chamadas: [string, unknown][] = []
    class Espiao extends MockFonteMetricas {
      override async obter<K extends MetricaId>(id: K, f: FiltrosDe<K>) {
        chamadas.push([id, f])
        return super.obter(id, f)
      }
    }
    renderizarApp(
      '/operacional?mock=vazio&equipe=fluig&sust_prioridade=p1',
      new Espiao({ latenciaMs: 0 }),
    )
    expect(
      await screen.findByTestId('tendencia-fluxo-p85-vazio', undefined, { timeout: 15000 }),
    ).toHaveTextContent(
      'Ainda não há histórico suficiente: nenhum dos últimos 6 meses atinge 20 itens.',
    )
    const t = chamadas.filter(([id]) => id.startsWith('TENDENCIA'))
    expect(t.length).toBeGreaterThan(0)
    for (const [, f] of t)
      expect(Object.keys(f as object).filter((k) => k !== 'dataReferencia')).toEqual([])
  })

  it('a tendência só dispara depois dos números do bloco e as duas usam a mesma data de referência (a mais antiga das coletas)', async () => {
    const chamadas: [string, unknown][] = []
    class Espiao extends MockFonteMetricas {
      override async obter<K extends MetricaId>(id: K, f: FiltrosDe<K>) {
        chamadas.push([id, f])
        return super.obter(id, f)
      }
      override async estadoColeta(d: 'businessmap' | 'acelerato'): Promise<EstadoColeta> {
        const e = await super.estadoColeta(d)
        const fim = d === 'businessmap' ? '2026-09-30T23:00:00-03:00' : '2026-10-02T10:00:00-03:00'
        return { ...e, ultimaOk: { ...(e.ultimaOk as NonNullable<typeof e.ultimaOk>), fim } }
      }
    }
    renderizarApp('/operacional', new Espiao({ latenciaMs: 0 }))
    await screen.findByTestId('tendencia-sustentacao', undefined, { timeout: 15000 })
    await screen.findByTestId('tendencia-fluxo', undefined, { timeout: 15000 })
    const ids = chamadas.map(([id]) => id)
    const t = chamadas.filter(([id]) => id.startsWith('TENDENCIA'))
    expect(t.map(([, f]) => (f as { dataReferencia: string }).dataReferencia)).toEqual([
      '2026-09-30',
      '2026-09-30',
    ])
    for (const n of ['O3', 'O4', 'O2', 'O12', 'BLOQUEADOS', 'O1', 'O10'])
      expect(ids.indexOf(n)).toBeLessThan(ids.indexOf('TENDENCIA_FLUXO'))
    for (const n of ['S1', 'S2', 'S3'])
      expect(ids.indexOf(n)).toBeLessThan(ids.indexOf('TENDENCIA_SUST'))
  })

  it('mudança de critério na série aparece rotulada com a data', async () => {
    const fonte = new FonteAjustada({
      TENDENCIA_FLUXO: (r: ResultadoDe<'TENDENCIA_FLUXO'>) => {
        r.criterios.serie = [
          { id: 'c1', data: '2026-06-10', descricao: 'Novo critério de conclusão' },
        ]
        r.criterios.janela = [
          { id: 'c1', data: '2026-06-10', descricao: 'Novo critério de conclusão' },
        ]
      },
    })
    renderizarApp('/operacional', fonte)
    const p85 = await screen.findByTestId('tendencia-fluxo-p85', undefined, { timeout: 15000 })
    expect(within(p85).getAllByTestId('marcador-criterio')).toHaveLength(1)
    expect(p85).toHaveTextContent('Mudança de critério em 10/06/2026: Novo critério de conclusão')
  })
})

describe('Resumo: alertas por fonte (CA-28)', () => {
  it('títulos por fonte, itens das regras atuais e links que levam à visão dona com o hash', async () => {
    renderizarApp('/operacional?mock=sem-calibracao')
    const fluxo = await bloco('resumo-fluxo')
    const sust = await bloco('resumo-sustentacao')
    const faixaF = await within(fluxo).findByRole('region', {
      name: 'Pede atenção · Fluxo de projeto (BusinessMap)',
    })
    const faixaS = await within(sust).findByRole('region', {
      name: 'Pede atenção · Sustentação (Acelerato)',
    })
    await waitFor(() => expect(within(faixaF).queryAllByRole('link').length).toBeGreaterThan(0), {
      timeout: 8000,
    })
    await waitFor(() => expect(within(faixaS).queryAllByRole('link').length).toBeGreaterThan(0), {
      timeout: 8000,
    })
    for (const l of within(faixaF).getAllByRole('link')) {
      const h = l.getAttribute('href') as string
      expect(h).toMatch(
        /^\/operacional\?.*cadencia=(diaria|semanal).*#(o1|o2|bloqueados|o3|o10|o12)$/,
      )
    }
    for (const l of within(faixaS).getAllByRole('link'))
      expect(l.getAttribute('href')).toMatch(/cadencia=sustentacao.*#s[12]$/)
    // clicar leva à visão dona com o cartão
    await userEvent.click(within(faixaS).getAllByRole('link')[0] as HTMLElement)
    expect(
      await screen.findByTestId('metrica-S2', undefined, { timeout: 8000 }),
    ).toBeInTheDocument()
  })

  it('sem alertas: texto de vazio de cada fonte', async () => {
    const fonte = new FonteAjustada({
      O2: (r: ResultadoDe<'O2'>) => {
        r.acimaP95 = 0
      },
      BLOQUEADOS: (r: ResultadoDe<'BLOQUEADOS'>) => {
        r.itens = []
      },
      O1: (r: ResultadoDe<'O1'>) => {
        r.hoje.acimaDoLimite = 0
      },
      O3: (r: ResultadoDe<'O3'>) => {
        for (const c of r.classes) c.variacaoP85.variacaoPct = -1
      },
      O10: (r: ResultadoDe<'O10'>) => {
        r.acimaDe180.time = 0
      },
      O12: (r: ResultadoDe<'O12'>) => {
        r.vencidosCausaInterna = 0
      },
      S2: (r: ResultadoDe<'S2'>) => {
        for (const p of r.prioridades) {
          p.primeiroAtendimento.statusMeta = 'dentro'
          p.restauracao.statusMeta = 'dentro'
        }
      },
      S1: (r: ResultadoDe<'S1'>) => {
        for (const p of r.prioridades) p.restauracao.statusMeta = 'dentro'
      },
    })
    renderizarApp('/operacional?mock=sem-calibracao', fonte)
    expect(
      await screen.findByText('Nada pede atenção no fluxo de projeto agora.', undefined, {
        timeout: 8000,
      }),
    ).toBeInTheDocument()
    expect(
      await screen.findByText('Nada pede atenção na Sustentação na semana.', undefined, {
        timeout: 8000,
      }),
    ).toBeInTheDocument()
    expect((await numero('s2')).querySelector('[data-status="dentro"]')).not.toBeNull()
  })
})

describe('Resumo: filtros, preferências e exportação (CA-29, CA-30)', () => {
  it('sem barra de filtros; com filtros guardados, diz que não se aplicam', async () => {
    renderizarApp('/operacional?equipe=fluig&periodo=4s&sust_prioridade=p1')
    await bloco('resumo-fluxo')
    expect(screen.queryByTestId('barra-filtros')).toBeNull()
    expect(screen.queryByTestId('legenda-filtros')).toBeNull()
    expect(screen.queryByTestId('botao-metricas')).toBeNull()
    expect(screen.getByTestId('filtros-guardados')).toHaveTextContent(
      'Os filtros guardados (fluxo de projeto: 2 ativos · Sustentação: 1 ativo) não se aplicam ao Resumo.',
    )
  })

  it('cartão oculto vira marcador, a série some, "Mostrar" volta, e nenhuma chave nova é gravada', async () => {
    guardarPrefs({ operacional: ['o3'], sustentacao: ['s2'] })
    const antes = window.localStorage.getItem(CHAVE_PREFERENCIAS)
    renderizarApp('/operacional')
    const p85 = await numero('p85')
    expect(within(p85).getByTestId('numero-p85-oculto')).toHaveTextContent(
      'O3 oculta nas suas preferências.',
    )
    expect(within(p85).queryByRole('link')).toBeNull()
    const s2 = await numero('s2')
    expect(within(s2).getByTestId('numero-s2-oculto')).toBeInTheDocument()
    await screen.findByTestId('tendencia-fluxo-concluidos', undefined, { timeout: 15000 })
    expect(screen.queryByTestId('tendencia-fluxo-p85')).toBeNull()
    expect(screen.queryByTestId('tendencia-sustentacao-sla')).toBeNull()
    expect(screen.getByTestId('tendencia-sustentacao-volume')).toBeInTheDocument()
    await userEvent.click(within(p85).getByRole('button', { name: 'Mostrar O3 nesta visita' }))
    expect(await screen.findByTestId('numero-p85-valor')).toBeInTheDocument()
    expect(await screen.findByTestId('tendencia-fluxo-p85')).toBeInTheDocument()
    expect(window.localStorage.getItem(CHAVE_PREFERENCIAS)).toBe(antes)
    expect(window.localStorage.length).toBe(1)
  })

  it('com as duas séries de um bloco ocultas, a tendência dele some inteira', async () => {
    guardarPrefs({ operacional: ['o3', 'o4'], sustentacao: ['s2', 's3'] })
    renderizarApp('/operacional')
    await numero('p85')
    await numero('volume')
    expect(screen.queryByTestId('tendencia-fluxo')).toBeNull()
    expect(screen.queryByTestId('tendencia-sustentacao')).toBeNull()
  })

  it('só existe a exportação de vários painéis, com Operacional e Operacional · Sustentação já marcados', async () => {
    renderizarApp('/operacional')
    await bloco('resumo-fluxo')
    expect(screen.queryByTestId('botao-exportar')).toBeNull()
    await userEvent.click(await screen.findByTestId('botao-exportar-personalizada'))
    const dialogo = await screen.findByTestId('dialogo-exportar')
    const marcado = (nome: RegExp) =>
      within(dialogo).getByRole<HTMLInputElement>('checkbox', { name: nome }).checked
    await waitFor(() => expect(marcado(/O3/)).toBe(true))
    for (const c of [/O4/, /O2/, /O12/, /S2/, /S1 /, /S3/]) expect(marcado(c)).toBe(true)
    expect(marcado(/O9/)).toBe(false)
    expect(marcado(/T2/)).toBe(false)
    expect(within(dialogo).getByText('Operacional · Sustentação')).toBeInTheDocument()
  })
})

describe('Resumo: estados e anúncio (CA-31)', () => {
  it('erro de um número não derruba o bloco nem o outro; "Tentar de novo" recarrega só ele', async () => {
    renderizarApp('/operacional?mock=erro-uma-vez:s2')
    const s2 = await screen.findByTestId('numero-s2-erro', undefined, { timeout: 8000 })
    expect(await numero('p85')).toBeInTheDocument()
    expect(await numero('s1')).toBeInTheDocument()
    await userEvent.click(within(s2).getByRole('button', { name: 'Tentar de novo' }))
    expect(
      await screen.findByTestId('numero-s2-valor', undefined, { timeout: 8000 }),
    ).toBeInTheDocument()
  })

  it('erro só na tendência: o bloco continua e o "Tentar de novo" é da série', async () => {
    renderizarApp('/operacional?mock=erro-uma-vez:tendencia-sust')
    const erro = await screen.findByTestId('tendencia-sustentacao-erro', undefined, {
      timeout: 15000,
    })
    expect(await numero('s2')).toBeInTheDocument()
    expect(screen.getByTestId('tendencia-fluxo', undefined)).toBeInTheDocument()
    await userEvent.click(within(erro).getByRole('button', { name: 'Tentar de novo' }))
    expect(
      await screen.findByTestId('tendencia-sustentacao-sla', undefined, { timeout: 8000 }),
    ).toBeInTheDocument()
  })

  it('fonte sem coleta: SemDadosDaFonte só no bloco dela', async () => {
    renderizarApp('/operacional?mock=coleta-vazia:ac')
    const sust = await bloco('resumo-sustentacao')
    expect(await within(sust).findByTestId('sem-dados-acelerato')).toBeInTheDocument()
    const fluxo = await bloco('resumo-fluxo')
    expect(within(fluxo).queryByTestId('sem-dados-businessmap')).toBeNull()
    expect(await numero('p85')).toBeInTheDocument()
  })

  it('carregando: cada bloco mostra o esqueleto (mock=carregando)', async () => {
    renderizarApp('/operacional?mock=carregando')
    expect(await screen.findByTestId('numero-p85-carregando')).toBeInTheDocument()
    expect(screen.getByTestId('numero-s2-carregando')).toBeInTheDocument()
  })

  it('mock=erro: erro de painel', async () => {
    renderizarApp('/operacional?mock=erro')
    expect(
      await screen.findByText('Erro simulado (mock=erro)', { exact: false }),
    ).toBeInTheDocument()
  })

  it('voltar ao Resumo anuncia a visão e as duas fontes em blocos separados', async () => {
    const r = renderizarApp('/operacional?cadencia=semanal')
    await userEvent.click(await screen.findByRole('radio', { name: 'Resumo' }))
    await bloco('resumo-fluxo')
    expect(screen.getByTestId('anuncio-visao')).toHaveTextContent(
      'Visão Resumo. Fontes: BusinessMap e Acelerato, em blocos separados.',
    )
    expect(r.roteador.state.location.search).not.toContain('cadencia')
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Resumo' }))
  })
})

describe('nunca avalia pessoas nem compara equipes', () => {
  it('o Resumo não tem ranking, nem nome de pessoa, nem comparação entre equipes', async () => {
    renderizarApp('/operacional')
    await numero('p85')
    await numero('s2')
    expect(
      screen.queryByText(/ranking|respons[aá]vel|atribu[ií]do|compar(a|ar) (as )?equipes/i),
    ).toBeNull()
  })
})
