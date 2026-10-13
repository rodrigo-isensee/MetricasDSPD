import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { COMUM, FonteFixa, J, JANELA } from '@/features/painel/testes/fonteFixa'
import { renderizarApp } from '@/test/helpers'

const cartao = async (c: string) => screen.findByTestId(`metrica-${c}`)
const ponto = (i: number, tri = '2026-T2') => ({
  cardId: `c${i}`,
  titulo: `Projeto ${i}`,
  concluidoEm: '2026-05-01',
  trimestre: tri,
  leadTimeDiasUteis: 50 + i,
})
const insuf = (n: number) => ({
  status: 'insuficiente' as const,
  n,
  minimo: 20 as const,
  janela: J,
})
const segmento = (chave: string, n: number, ok: boolean) => ({
  chave,
  rotulo: chave,
  n,
  pontos: Array.from({ length: n }, (_, i) => ponto(i)),
  estatistica: ok
    ? {
        status: 'ok' as const,
        n,
        janela: J,
        valor: {
          total: { p50: 98, p85: 140, p95: 170 },
          medianaAntesDoInicio: 40,
          medianaExecucao: 58,
          fracaoAntesPct: 40,
        },
      }
    : insuf(n),
  variacaoMediana: ok
    ? { status: 'ok' as const, atual: 98, anterior: 130, variacaoPct: -25 }
    : { status: 'indisponivel' as const, atual: null, anterior: null, variacaoPct: null },
})
const e1 = (ok: boolean) => ({
  ...COMUM,
  base: { n: 23, unidade: 'projetos concluídos', janela: J },
  janelaPercentis: JANELA,
  segmentoPor: 'tipo' as const,
  segmentos: [segmento('Iniciativa', ok ? 22 : 7, ok), segmento('Melhoria', 3, false)],
})

describe('E1 lead time de projetos', () => {
  it('A1/A2/A3: n<20 mantém pontos e some estatística (variante lenta, sem alerta); um tipo por vez', async () => {
    renderizarApp('/estrategico', new FonteFixa({ E1: e1(false) }))
    const el = await cartao('E1')
    const am = await within(el).findByTestId('amostra-insuficiente-E1')
    expect(am).toHaveAttribute('data-variante', 'lenta')
    expect(am).toHaveTextContent('Foram concluídos 7 projetos')
    expect(within(el).queryByRole('alert')).not.toBeInTheDocument()
    expect(within(el).getByTestId('e1-bases')).toHaveTextContent('Pontos: 7 projetos concluídos')
    expect(within(el).getByTestId('e1-variacao')).toHaveTextContent(
      'Comparação indisponível: amostra insuficiente',
    )
    expect(within(el).queryByText(/Fração antes do início/)).not.toBeInTheDocument()
    expect(within(el).getAllByRole('tab')).toHaveLength(2)
    await userEvent.click(within(el).getByRole('tab', { name: /Melhoria/ }))
    expect(within(el).getByTestId('e1-bases')).toHaveTextContent('Pontos: 3 projetos')
    expect(within(el).getByTestId('leitura-E1')).toHaveTextContent('projetos de Melhoria')
  })
  it('com n>=20 publica mediana, P85, fração antes do início e variação -25%', async () => {
    renderizarApp('/estrategico', new FonteFixa({ E1: e1(true) }))
    const el = await cartao('E1')
    await waitFor(() =>
      expect(within(el).getByText(/Fração antes do início: 40%/)).toBeInTheDocument(),
    )
    expect(within(el).getByTestId('leitura-E1')).toHaveTextContent('98 dias úteis')
    expect(within(el).getByTestId('e1-variacao')).toHaveTextContent('−25%')
    expect(within(el).queryByTestId('amostra-insuficiente-E1')).not.toBeInTheDocument()
  })
})

const tri = (t: string, n: number, pct: number | null, fora = 14) => ({
  trimestre: t,
  emAndamento: false,
  n,
  segmentos: [
    {
      categoria: 'Objetivo A',
      tipo: 'objetivo' as const,
      n: n - 5,
      pct: pct === null ? null : 100 - fora,
    },
    {
      categoria: 'Fora de objetivo',
      tipo: 'fora-de-objetivo' as const,
      n: 5,
      pct: pct === null ? null : fora,
    },
    { categoria: 'Manutenção', tipo: 'manutencao' as const, n: 0, pct: pct === null ? null : 0 },
  ],
  evolucaoVinculada:
    pct === null
      ? { status: 'insuficiente' as const, k: 3, n, minimo: 20 as const }
      : { status: 'ok' as const, k: 61, n: 100, pct },
})
const e2 = (pct: number, st: 'dentro' | 'fora') => ({
  ...COMUM,
  trimestres: [tri('2026-T1', 12, null), tri('2026-T2', 180, pct)],
  evolucaoVinculada: { status: 'ok' as const, k: pct, n: 100, pct },
  statusMeta: st,
})

describe('E2 capacidade por objetivo', () => {
  it('B1/B2: 61% dentro, 59% fora; Fora de objetivo destacado; Manutenção é categoria legítima', async () => {
    const r = renderizarApp('/estrategico', new FonteFixa({ E2: e2(61, 'dentro') }))
    let el = await cartao('E2')
    expect(await within(el).findByTestId('e2-kpi')).toHaveTextContent('61%')
    expect(el).toHaveTextContent('Dentro da meta')
    expect(within(el).getAllByText(/Fora de objetivo/).length).toBeGreaterThan(0)
    expect(within(el).getByTestId('leitura-E2')).toHaveTextContent(
      '14% está fora de qualquer objetivo',
    )
    r.unmount()
    renderizarApp('/estrategico', new FonteFixa({ E2: e2(59, 'fora') }))
    el = await cartao('E2')
    await waitFor(() => expect(within(el).getByTestId('e2-kpi')).toHaveTextContent('59%'))
    expect(el).toHaveTextContent('Fora da meta')
  })
  it('B3: trimestre com <20 itens mostra contagem e não percentual', async () => {
    renderizarApp('/estrategico', new FonteFixa({ E2: e2(61, 'dentro') }))
    const el = await cartao('E2')
    expect(await within(el).findByTestId('e2-sem-percentual')).toHaveTextContent(
      '12 itens entregues; percentuais indisponíveis (12 de 20 itens mínimos)',
    )
  })
})

const ini = (id: string, nome: string, ficha: boolean, pct: number | null, antes = true) => ({
  cardId: id,
  nome,
  situacao: 'concluída' as const,
  ficha: ficha
    ? {
        resultadoEsperado: 'Reduzir tempo',
        declaradoAntesDoInicio: antes,
        unidade: 'h',
        ganhoPrevisto: 10,
        ganhoMedido: pct === null ? null : 8,
        medida: 'tempo de fechamento: 3 dias → 4 h',
        dataDeclaracao: '2026-01-10',
      }
    : null,
  atingimentoPct: pct,
})
const e3 = {
  ...COMUM,
  base: { n: 11, unidade: 'iniciativas', janela: null },
  comFicha: { k: 9, n: 11 },
  semFicha: 2,
  statusMeta: 'fora' as const,
  iniciativas: [
    ini('a', 'Fechamento mensal', true, 82),
    ini('b', 'Zeta sem ficha', false, null),
    ini('c', 'Alfa sem previsto', true, 90, false),
  ],
}

describe('E3 entrega x resultado', () => {
  it('C1/C2/C3: 9 de 11 fora da meta; sem ficha primeiro com selo; sem barra se previsto não foi declarado antes', async () => {
    renderizarApp('/estrategico', new FonteFixa({ E3: e3 }))
    const el = await cartao('E3')
    expect(await within(el).findByTestId('e3-contador')).toHaveTextContent(
      '9 de 11 iniciativas com resultado declarado',
    )
    expect(el).toHaveTextContent('Fora da meta')
    const linhas = within(within(el).getByTestId('tabela-E3')).getAllByRole('row')
    expect(linhas[1]).toHaveTextContent('Zeta sem ficha')
    expect(linhas[1]).toHaveTextContent('Sem resultado declarado')
    expect(linhas[3]).toHaveTextContent('Fechamento mensal')
    expect(linhas[3]).toHaveTextContent('82%')
    expect(linhas[2]).toHaveTextContent('Sem medição comparável')
    expect(linhas[2]).not.toHaveTextContent('90%')
    expect(within(el).getByTestId('leitura-E3')).toHaveTextContent(
      '2 de 11 iniciativas não têm resultado declarado',
    )
  })
})

describe('painel Estratégico (mock)', () => {
  it('mostra E1, E2 e E3, só períodos de 6 e 12 meses e sem filtros de equipe e tipo', async () => {
    renderizarApp('/estrategico')
    for (const c of ['E1', 'E2', 'E3']) await cartao(c)
    expect(screen.queryByTestId('placeholder-painel')).not.toBeInTheDocument()
    expect(screen.queryByTestId('filtro-equipe')).not.toBeInTheDocument()
    expect(screen.queryByTestId('filtro-tipo')).not.toBeInTheDocument()
    const e1 = await cartao('E1')
    await waitFor(() =>
      expect(within(e1).queryByTestId('estado-carregando-E1')).not.toBeInTheDocument(),
    )
    // no mock, projetos na janela < 20: estado normal (variante lenta)
    expect(await within(e1).findByTestId('amostra-insuficiente-E1')).toHaveAttribute(
      'data-variante',
      'lenta',
    )
  })
  it('?mock=erro:e2: só E2 falha', async () => {
    renderizarApp('/estrategico?mock=erro:e2')
    expect(await screen.findByTestId('estado-erro-E2')).toBeInTheDocument()
    expect(await cartao('E1')).toBeInTheDocument()
  })
  it('?mock=vazio: estado vazio sem mensagem de amostra insuficiente', async () => {
    renderizarApp('/estrategico?mock=vazio')
    const v = await screen.findByTestId('estado-vazio-E1')
    expect(v).toBeInTheDocument()
    expect(screen.queryByTestId('amostra-insuficiente-E1')).not.toBeInTheDocument()
  })
})

describe('Espera invisível no painel (K-042)', () => {
  it('o Estratégico traz a seção com o cartão compacto EI-FL3', async () => {
    renderizarApp('/estrategico')
    const el = await cartao('EI-FL3')
    const secao = document.getElementById('espera-invisivel') as HTMLElement
    expect(secao).toContainElement(el)
    expect(
      within(secao).getByRole('heading', {
        level: 2,
        name: /Quanto do tempo do solicitante fica fora da nossa gestão/,
      }),
    ).toBeInTheDocument()
  })
})

describe('faixa "Pede atenção" (FA-006: sem salto de layout)', () => {
  it('reserva em desktop a altura da faixa com itens (98 px) enquanto carrega', async () => {
    const pendente = new FonteFixa({})
    pendente.obter = () => new Promise(() => {})
    renderizarApp('/estrategico', pendente)
    const faixa = await screen.findByTestId('faixa-atencao')
    expect(within(faixa).getByTestId('faixa-atencao-carregando')).toBeInTheDocument()
    expect(faixa).toHaveStyle({ '--fa-m': '108px', '--fa-d': '98px' })
  })
})
