import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderizarApp } from '@/test/helpers'
import { COMUM, FonteFixa, J, JANELA, insuf, ok } from '@/features/painel/testes/fonteFixa'

const cartao = async (c: string) => {
  const el = await screen.findByTestId(`metrica-${c}`)
  await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'), { timeout: 4000 })
  return el
}
const URL = '/operacional?cadencia=semanal'
const taxaOk = (k: number, n: number) => ({ status: 'ok' as const, k, n, pct: (k / n) * 100 })
const taxaIns = (k: number, n: number) => ({
  status: 'insuficiente' as const,
  k,
  n,
  minimo: 20 as const,
})

describe('Operacional semanal: estrutura', () => {
  it('seções com h2 e ids, ordem O3, O9, O4, O12, O10, O7, O15, O18, EI-FL1; O12 só em Compromissos; "Ir para"', async () => {
    renderizarApp(URL)
    await cartao('O3')
    const ordem = screen
      .getAllByTestId(/^metrica-/)
      .map((e) => e.getAttribute('data-testid')?.replace('metrica-', ''))
    expect(ordem).toEqual(['O3', 'O9', 'O4', 'O12', 'O10', 'O7', 'O15', 'O18', 'EI-FL1'])
    const secoes: [string, string][] = [
      ['tempo', 'Tempo'],
      ['fluxo', 'Fluxo'],
      ['compromissos', 'Compromissos'],
      ['backlog', 'Backlog'],
      ['qualidade', 'Qualidade'],
      ['espera-invisivel', 'Quanto do tempo do solicitante fica fora da nossa gestão?'],
    ]
    for (const [id, nome] of secoes) {
      const sec = document.getElementById(id) as HTMLElement
      expect(within(sec).getByRole('heading', { level: 2, name: nome })).toBeInTheDocument()
    }
    expect(
      within(document.getElementById('fluxo') as HTMLElement).queryByTestId('metrica-O12'),
    ).toBeNull()
    const nav = screen.getByRole('navigation', { name: 'Ir para' })
    expect(
      within(nav)
        .getAllByRole('link')
        .map((l) => l.textContent),
    ).toEqual([
      'Tempo',
      'Fluxo',
      'Compromissos',
      'Backlog',
      'Qualidade',
      'Espera invisível',
      'Mais métricas',
    ])
  })
})

describe('O7 entrada x saída (A1 a A5, R9)', () => {
  const mes = (m: string, e: number, s: number, andamento = false) => ({
    mes: m,
    emAndamento: andamento,
    entrada: e,
    saida: s,
    saldoAcumulado: 0,
  })
  const tipo = (t: string, entrou: number, saiu: number, acima: boolean, acum = 0) => ({
    tipo: t,
    entrou,
    saiu,
    saldoPeriodo: entrou - saiu,
    saldoAcumulado: acum,
    situacao: acima ? 'cresce' : 'estavel',
    entradaAcimaDaSaidaNoTrimestre: acima,
    meses: [mes('2026-08', 3, 2), mes('2026-09', 2, 1), mes('2026-10', 1, 0, true)],
  })
  const dto = {
    ...COMUM,
    base: { n: 8, unidade: 'cards', janela: J },
    mesesExibidos: 6,
    totais: { entrou: 8, saiu: 3 },
    porTipo: [tipo('Melhoria', 5, 3, true, 7), tipo('Incidente', 3, 3, false, 1)],
  }
  it('saldo +2 com selo em texto, um múltiplo por tipo com escala própria, aviso de 6 meses, saldo acumulado (F4) na ordem da biblioteca', async () => {
    renderizarApp(`${URL}&periodo=4s`, new FonteFixa({ O7: dto }))
    const el = await cartao('O7')
    const resumo = within(el).getByTestId('tabela-O7-resumo')
    expect(resumo).toHaveTextContent('+2')
    expect(resumo).toHaveTextContent('Entrada acima da saída')
    expect(within(el).getByTestId('o7-aviso-6-meses')).toHaveTextContent(
      'Este gráfico mostra no mínimo 6 meses.',
    )
    expect(within(el).getAllByText('(escala própria)')).toHaveLength(2)
    expect(within(el).getByRole('columnheader', { name: /Saldo acumulado/i })).toBeInTheDocument()
    const linhas = within(resumo).getAllByRole('row').slice(1)
    expect(linhas[0]).toHaveTextContent('Melhoria')
    expect(linhas[0]).toHaveTextContent('+7')
    expect(linhas[1]).toHaveTextContent('Incidente')
  })
})

describe('O9 três relógios (B2)', () => {
  const p = (a: number, b: number, c: number) => ({ p50: a, p85: b, p95: c })
  const faixas = [
    { rotulo: '0-5', min: 0, max: 5, contagem: 4 },
    { rotulo: '6-10', min: 6, max: 10, contagem: 6 },
  ]
  const dto = {
    ...COMUM,
    janelaPercentis: JANELA,
    classes: [
      {
        tipo: 'Melhoria',
        n: 20,
        relogios: ok(20, {
          cliente: p(45, 60, 80),
          equipe: p(18, 25, 30),
          ciclo: p(9, 12, 15),
          distanciaClienteCicloP50: 36,
        }),
        histogramas: ok(20, { cliente: faixas, equipe: faixas, ciclo: faixas }),
        serieMensal: [{ mes: '2026-09', n: 20, cliente: null, equipe: null, ciclo: null }],
      },
      {
        tipo: 'Incidente',
        n: 12,
        relogios: insuf(12),
        histogramas: insuf(12),
        serieMensal: [],
      },
    ],
  }
  it('publica P50/P85/P95 com n=20 e, no tipo com n<20, só "Amostra insuficiente"; um tipo por vez', async () => {
    renderizarApp(URL, new FonteFixa({ O9: dto }))
    const el = await cartao('O9')
    expect(within(el).getByTestId('leitura-O9')).toHaveTextContent(
      'Para Melhoria, o cliente espera 45 dias úteis (mediana), a equipe tem a demanda por 18 e trabalha nela por 9.',
    )
    expect(within(el).getByTestId('tabela-O9-relogios')).toHaveTextContent('80')
    expect(within(el).getAllByRole('heading', { level: 4 })).toHaveLength(3)
    await userEvent.click(within(el).getByRole('tab', { name: /Incidente/ }))
    expect(await within(el).findByTestId('amostra-insuficiente-O9')).toHaveTextContent(
      '12 de 20 itens mínimos',
    )
    expect(within(el).queryByTestId('tabela-O9-relogios')).toBeNull()
    expect(within(el).queryAllByRole('heading', { level: 4 })).toHaveLength(0)
  })
})

describe('O10 backlog (C1, C2)', () => {
  const faixas = [
    {
      rotulo: '0-30',
      min: 0,
      max: 30,
      contagem: 5,
      empilhado: [{ classe: 'Melhoria', contagem: 5 }],
    },
  ]
  const ev = [{ tipo: 'Melhoria', serie: [{ mes: '2026-09', n: 25, p50: 40, p85: 120 }] }]
  const base = {
    ...COMUM,
    referencia: '2026-10-09',
    evolucao: ev,
    statusMeta: 'fora',
  }
  it('n<20: contador >180 dias permanece, histogramas e evolução somem (Amostra insuficiente)', async () => {
    renderizarApp(
      URL,
      new FonteFixa({
        O10: {
          ...base,
          acimaDe180: { time: 3, cliente: 2 },
          time: { n: 12, histograma: insuf(12) },
          cliente: { n: 10, histograma: insuf(10) },
        },
      }),
    )
    const el = await cartao('O10')
    expect(within(el).getByTestId('o10-time-180')).toHaveTextContent('3')
    expect(within(el).getByText('Fora da meta')).toBeInTheDocument()
    expect(within(el).getByTestId('amostra-insuficiente-O10-time')).toBeInTheDocument()
    expect(within(el).getByTestId('amostra-insuficiente-O10-cliente')).toBeInTheDocument()
    expect(within(el).getByTestId('amostra-insuficiente-O10-evolucao')).toBeInTheDocument()
    expect(within(el).queryByRole('tab')).toBeNull()
  })
  it('n>=20: dois histogramas lado a lado e evolução com mediana e P85, nunca média', async () => {
    renderizarApp(
      URL,
      new FonteFixa({
        O10: {
          ...base,
          acimaDe180: { time: 0, cliente: 0 },
          time: { n: 30, histograma: ok(30, { faixas }) },
          cliente: { n: 25, histograma: ok(25, { faixas }) },
        },
      }),
    )
    const el = await cartao('O10')
    expect(within(el).getByText('Tudo o que está registrado')).toBeInTheDocument()
    expect(within(el).getByText('O que alguém de fora ainda espera')).toBeInTheDocument()
    expect(within(el).getByRole('tab', { name: /Melhoria/ })).toBeInTheDocument()
    expect(within(el).queryByText(/^m[eé]dia/i)).toBeNull()
  })
})

describe('O12 acordos e vencidos (D1 a D4)', () => {
  const resp = (i: number, s: number, t: number, n: number) => ({
    Interno: i,
    Solicitante: s,
    Terceiro: t,
    naoClassificado: n,
  })
  const mesesDto = (n: number) => ({
    mes: '2026-09',
    emAndamento: false,
    acordos: n,
    vencidos: 4,
    porResponsabilidade: resp(0, 2, 1, 1),
    pctVencidos: n >= 20 ? taxaOk(4, n) : taxaIns(4, n),
  })
  const dto = (interno: number, n: number) => ({
    ...COMUM,
    meses: [mesesDto(n)],
    totais: {
      acordos: n,
      vencidos: 4,
      porResponsabilidade: resp(interno, 2, 1, 1),
      pctVencidos: n >= 20 ? taxaOk(4, n) : taxaIns(4, n),
    },
    vencidosCausaInterna: interno,
    statusMeta: interno === 0 ? 'dentro' : 'fora',
  })
  it('D2/D3: zero internos = Dentro da meta; k de n quando o mês tem menos de 20 acordos', async () => {
    renderizarApp(URL, new FonteFixa({ O12: dto(0, 12) }))
    const el = await cartao('O12')
    expect(within(el).getByText('Dentro da meta')).toBeInTheDocument()
    expect(within(el).getByTestId('o12-causa-interna')).toHaveTextContent('0')
    expect(within(el).getByTestId('o12-mes-2026-09')).toHaveTextContent('4 de 12')
    expect(within(el).getByTestId('o12-mes-2026-09')).not.toHaveTextContent('%')
    expect(el).toHaveTextContent('Não classificado')
  })
  it('D3: mais de zero internos = Fora da meta; com 20 acordos o percentual aparece', async () => {
    renderizarApp(URL, new FonteFixa({ O12: dto(2, 20) }))
    const el = await cartao('O12')
    expect(within(el).getByText('Fora da meta')).toBeInTheDocument()
    expect(within(el).getByTestId('o12-mes-2026-09')).toHaveTextContent('20%')
  })
})

describe('O15 bugs por fase (E1 a E3)', () => {
  const fases = [
    ['Desenvolvimento', 'contido', 5],
    ['Revisão de código', 'contido', 4],
    ['Teste interno', 'contido', 3],
    ['Homologação do negócio', 'negocio', 2],
    ['Produção', 'producao', 1],
  ].map(([fase, grupo, contagem]) => ({ fase, grupo, contagem }))
  const dto = (n: number) => ({
    ...COMUM,
    base: { n, unidade: 'bugs', janela: J },
    fases,
    contencao: n >= 20 ? taxaOk(12, n) : taxaIns(12, n),
    escape: n >= 20 ? taxaOk(1, n) : taxaIns(1, n),
    serieMensal: [],
  })
  it('E1: 20 bugs publicam percentuais; 19 só contagens ("k de n"); texto fixo; sem status de meta', async () => {
    renderizarApp(URL, new FonteFixa({ O15: dto(20) }))
    const el = await cartao('O15')
    expect(within(el).getByTestId('o15-contencao')).toHaveTextContent('60%')
    expect(within(el).getByTestId('o15-texto-fixo')).toHaveTextContent(
      'O que se cobra é a taxa de escape, não o volume de bugs internos.',
    )
    expect(within(el).queryByText(/Dentro da meta|Fora da meta/)).toBeNull()
  })
  it('E1: com 19 bugs só contagens', async () => {
    renderizarApp(URL, new FonteFixa({ O15: dto(19) }))
    const el = await cartao('O15')
    expect(within(el).getByTestId('o15-contencao')).toHaveTextContent('12 de 19')
    expect(within(el).getByTestId('o15-contencao')).not.toHaveTextContent('%')
    await userEvent.click(within(el).getByRole('button', { name: 'Ver como tabela' }))
    const linhas = within(el)
      .getAllByRole('row')
      .slice(1)
      .map((r) => r.textContent)
    expect(linhas[0]).toContain('Desenvolvimento')
    expect(linhas[4]).toContain('Produção')
  })
})

describe('O18 entregas com e sem bug (F1 a F4)', () => {
  const mes = (m: string, extra: Record<string, unknown> = {}) => ({
    mes: m,
    emAndamento: false,
    emApuracaoAte: null,
    entregues: 25,
    comBug: 5,
    semBug: 20,
    bugs: 7,
    taxaLimpa: taxaOk(20, 25),
    densidadeGeral: ok(25, 0.28),
    densidadeAfetados: ok(25, 1.4),
    ...extra,
  })
  const dto = {
    ...COMUM,
    meses: [
      mes('2026-08'),
      mes('2026-09', {
        emApuracaoAte: '2026-10-20',
        entregues: 8,
        comBug: 1,
        semBug: 7,
        taxaLimpa: taxaIns(7, 8),
        densidadeGeral: insuf(8),
        densidadeAfetados: insuf(8),
      }),
    ],
    totais: {
      entregues: 33,
      comBug: 6,
      bugs: 8,
      taxaLimpa: taxaOk(27, 33),
      densidadeGeral: ok(33, 0.24),
      densidadeAfetados: ok(33, 1.3),
    },
  }
  it('F2/F3/F4: "em apuração até", sem percentual no mês com menos de 20, KPIs e link para a vazão', async () => {
    renderizarApp(URL, new FonteFixa({ O18: dto }))
    const el = await cartao('O18')
    expect(within(el).getByTestId('leitura-O18')).toHaveTextContent(
      'Em ago/2026, 80% das entregas saíram sem bug.',
    )
    expect(within(el).getByTestId('o18-dens-afetados')).toHaveTextContent('1,3')
    expect(within(el).getByRole('link', { name: 'Ver vazão (O4)' })).toHaveAttribute('href', '#o4')
    await userEvent.click(within(el).getByRole('button', { name: 'Ver como tabela' }))
    expect(within(el).getByText(/em apuração até 20\/10/)).toBeInTheDocument()
  })
})

describe('T-PROIB / T-T5 no Operacional semanal', () => {
  it('nenhum campo de pessoa, ranking ou "% de conclusão"', async () => {
    renderizarApp(URL)
    await cartao('O18')
    await cartao('O7')
    // A nota da espera invisível proíbe o ranking por escrito ("Nunca compare ... como ranking").
    const texto = document.body.textContent.replace(/Nunca compare[^.]*ranking\./i, '')
    expect(texto).not.toMatch(/respons[aá]vel por|assignee|ranking|% de conclus[aã]o/i)
  })
})

describe('Faixa "Pede atenção na semana": P85 subiu', () => {
  const variacao = (status: 'ok' | 'indisponivel', pct: number | null) => ({
    status,
    atual: pct === null ? null : 10,
    anterior: pct === null ? null : 9,
    variacaoPct: pct,
    janelaAnterior: J,
  })
  const classe = (tipo: string, v: ReturnType<typeof variacao>) => ({
    tipo,
    n: 30,
    estatistica: insuf(30),
    pontos: [],
    serieP85: [],
    variacaoP85: v,
  })
  it('aponta o tipo cujo P85 subiu (variação publicada) com link ao O3; sem variação publicada, nada', async () => {
    const dto = {
      ...COMUM,
      janelaPercentis: JANELA,
      classes: [
        classe('Melhoria', variacao('ok', 8)),
        classe('Incidente', variacao('indisponivel', null)),
        classe('Requisição', variacao('ok', -5)),
      ],
    }
    renderizarApp(URL, new FonteFixa({ O3: dto }))
    const faixa = await screen.findByTestId('faixa-atencao')
    const link = await within(faixa).findByRole('link', { name: /P85 do tempo de ciclo subiu/ })
    expect(link).toHaveTextContent('Melhoria (+8%)')
    expect(link).not.toHaveTextContent('Incidente')
    expect(link).not.toHaveTextContent('Requisição')
    expect(link.getAttribute('href')).toBe('#o3')
  })
})
