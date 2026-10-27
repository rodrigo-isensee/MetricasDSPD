import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { FiltrosDe, MetricaId, ResultadoDe } from '@metricas-dspd/contratos'
import { MockFonteMetricas } from '@/data'
import { COMUM, FILTROS_FLUXO, FonteFixa, JANELA, insuf } from '@/features/painel/testes/fonteFixa'
import { renderizarCartao } from '@/test/helpers'
import { CartaoO2 } from '@/features/operacional/components/CartaoO2'
import { FonteAjustada } from '@/features/painel/testes/fonteFixa'
import {
  CartaoO19,
  CartaoO20,
  CartaoO21,
  CartaoO22,
  CartaoO24,
  CartaoO25,
  CartaoO26,
} from './operacionais'

vi.setConfig({ testTimeout: 45000 })

async function abrir(codigo: string, ui: React.ReactElement, fonte: MockFonteMetricas) {
  renderizarCartao(ui, { fonte })
  const el = await screen.findByTestId(`metrica-${codigo}`)
  await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'))
  return el
}

const taxaOk = (k: number, n: number) => ({
  status: 'ok' as const,
  k,
  n,
  pct: Math.round((k / n) * 1000) / 10,
})
const taxaInsuf = (k: number, n: number) => ({
  status: 'insuficiente' as const,
  k,
  n,
  minimo: 20 as const,
})
const dur = (n: number, p50: number, p85: number) => ({
  status: 'ok' as const,
  n,
  valor: { p50, p85, p95: p85 + 2 },
  janela: JANELA,
})
const p85 = (n: number, v: number) => ({
  status: 'ok' as const,
  n,
  valor: { p85: v },
  janela: JANELA,
})

class FonteErro extends MockFonteMetricas {
  constructor() {
    super({ latenciaMs: 0 })
  }
  override obter<K extends MetricaId>(_id: K, _f: FiltrosDe<K>): Promise<ResultadoDe<K>> {
    return Promise.reject(new Error('falha simulada'))
  }
}

const base = (n: number, unidade = 'itens') => ({ ...COMUM, base: { ...COMUM.base, n, unidade } })

describe('O19 Bloqueios por causa', () => {
  const motivo = (m: string, b: number, d: number, pct: unknown, duracao: unknown) => ({
    motivo: m,
    bloqueios: b,
    diasUteis: d,
    pctDoTotal: pct,
    duracao,
  })
  const dto = (abertos = 3) => ({
    ...base(40, 'bloqueios'),
    motivos: [
      motivo(
        'Aguardando fornecedor',
        8,
        12,
        { status: 'insuficiente', bloqueios: 8, diasUteis: 12, totalDiasUteis: 100, minimo: 20 },
        insuf(8),
      ),
      motivo(
        'Aguardando validação do negócio',
        30,
        64,
        { status: 'ok', bloqueios: 30, diasUteis: 64, totalDiasUteis: 100, pct: 64 },
        dur(30, 2, 6),
      ),
    ],
    abertosForaDaSoma: abertos,
    totalDiasUteis: 100,
  })

  it('ordena por dias somados, publica o percentual só com 20 bloqueios e cita os abertos', async () => {
    const el = await abrir(
      'O19',
      <CartaoO19 filtros={FILTROS_FLUXO} />,
      new FonteFixa({ O19: dto() }),
    )
    expect(el).toHaveTextContent(
      'Aguardando validação do negócio somou 64 dias úteis de bloqueio no período, 64% do total.',
    )
    const linhas = within(within(el).getByTestId('tabela-O19')).getAllByRole('row').slice(1)
    expect(linhas[0]).toHaveTextContent(
      /Aguardando validação do negócio\s*30\s*64\s*64%\s*P50 2 · P85 6 dias úteis/,
    )
    expect(linhas[1]).toHaveTextContent(
      /Aguardando fornecedor\s*8\s*12\s*— menos de 20 bloqueios\s*— amostra insuficiente/,
    )
    expect(within(el).getByTestId('o19-abertos')).toHaveTextContent(
      '3 bloqueios ainda abertos não entram na soma',
    )
    expect(el).toHaveTextContent('Fonte: BusinessMap')
  })

  it('sem bloqueios abertos, não mostra o aviso', async () => {
    const el = await abrir(
      'O19',
      <CartaoO19 filtros={FILTROS_FLUXO} />,
      new FonteFixa({ O19: dto(0) }),
    )
    expect(within(el).queryByTestId('o19-abertos')).toBeNull()
  })

  it('estado vazio', async () => {
    renderizarCartao(<CartaoO19 filtros={FILTROS_FLUXO} />, {
      fonte: new FonteFixa({ O19: { ...dto(), base: { ...dto().base, n: 0 } } }),
    })
    const v = await screen.findByTestId('metrica-O19')
    await waitFor(() => expect(v).toHaveAttribute('data-estado', 'vazio'))
  })

  it('erro oferece tentar de novo', async () => {
    renderizarCartao(<CartaoO19 filtros={FILTROS_FLUXO} />, { fonte: new FonteErro() })
    expect(await screen.findByRole('button', { name: /tentar de novo/i })).toBeInTheDocument()
  })
})

describe('O20 Fluxo cumulativo', () => {
  const dto = (destaque: unknown, dias = 2) => ({
    ...base(30),
    agrupamento: 'papel',
    faixas: [
      { chave: 'backlog', rotulo: 'Backlog', ordem: 0, tipoColuna: 'fila' },
      { chave: 'homolog', rotulo: 'Aguardando homologação', ordem: 1, tipoColuna: 'fila' },
    ],
    dias: Array.from({ length: dias }, (_, i) => ({
      dia: `2026-10-0${i + 1}`,
      contagens: [5, 6 + i],
      emProgresso: 6 + i,
    })),
    destaque,
    mudancasCriterio: [{ id: 'v2', data: '2026-10-02', descricao: 'Novo critério de início' }],
  })

  it('frase de leitura aponta a faixa que cresceu e lista a mudança de critério', async () => {
    const el = await abrir(
      'O20',
      <CartaoO20 filtros={FILTROS_FLUXO} />,
      new FonteFixa({ O20: dto({ faixa: 'homolog', de: 6, para: 15 }) }),
    )
    expect(el).toHaveTextContent('a faixa "Aguardando homologação" cresceu de 6 para 15 itens')
    expect(within(el).getByTestId('marcacoes-criterio')).toHaveTextContent(
      'Novo critério de início',
    )
    expect(el).toHaveTextContent('o acúmulo está nessa etapa.')
  })

  it('marca a mudança de critério no gráfico com linha vertical e rótulo acessível', async () => {
    const el = await abrir(
      'O20',
      <CartaoO20 filtros={FILTROS_FLUXO} />,
      new FonteFixa({ O20: dto({ faixa: 'homolog', de: 6, para: 15 }) }),
    )
    const linha = el.querySelector('.marca-criterio')
    expect(linha).not.toBeNull()
    expect(linha?.querySelector('title')?.textContent).toBe(
      'Mudança de critério em 02/10/2026: Novo critério de início',
    )
  })

  it('sem destaque: "Nenhuma etapa acumulou trabalho no período."', async () => {
    const el = await abrir(
      'O20',
      <CartaoO20 filtros={FILTROS_FLUXO} />,
      new FonteFixa({ O20: dto(null) }),
    )
    expect(el).toHaveTextContent('Nenhuma etapa acumulou trabalho no período.')
  })

  it('sem nenhum dia no período, explica em vez de desenhar um gráfico vazio', async () => {
    const el = await abrir(
      'O20',
      <CartaoO20 filtros={FILTROS_FLUXO} />,
      new FonteFixa({ O20: dto(null, 0) }),
    )
    expect(within(el).getByTestId('o20-sem-transicao')).toBeInTheDocument()
  })
})

describe('O21 Fluxo reverso', () => {
  const comp = (tipo: string, com: unknown, sem: unknown, g: unknown = null) => ({
    tipo,
    com,
    sem,
    grupoAbaixoDoMinimo: g,
  })
  const dto = (comparacoes: unknown[], entregas: unknown = taxaOk(31, 96)) => ({
    ...base(96, 'entregas'),
    entregas,
    matriz: {
      eixo: 'papel',
      celulas: [
        { origem: 'Em teste', destino: 'Em desenvolvimento', retornos: 14, reaberto: false },
        { origem: 'Entregue', destino: 'Em desenvolvimento', retornos: 2, reaberto: true },
      ],
    },
    reaberturas: 2,
    segmentoPor: 'tipo',
    comparacoes,
  })

  it('destaque, matriz com a linha "reaberto" e o par com × sem do tipo', async () => {
    const el = await abrir(
      'O21',
      <CartaoO21 filtros={FILTROS_FLUXO} />,
      new FonteFixa({ O21: dto([comp('Melhoria', dur(25, 5, 14), dur(40, 4, 8))]) }),
    )
    expect(within(el).getByTestId('o21-destaque')).toHaveTextContent(
      '31 de 96 entregas (32%) voltaram ao menos uma vez',
    )
    expect(el).toHaveTextContent(
      'A volta mais comum é de "Em teste" para "Em desenvolvimento" (14 vezes)',
    )
    expect(el).toHaveTextContent(
      'Em Melhoria, quem volta tem P85 de 14 dias úteis contra 8 de quem não volta.',
    )
    const matriz = within(el).getByTestId('o21-matriz')
    expect(
      within(matriz).getByRole('rowheader', { name: /Entregue.*reaberto/ }),
    ).toBeInTheDocument()
    expect(within(el).getByTestId('o21-reaberturas')).toHaveTextContent('2 vezes')
    const linhas = within(el).getByTestId('tabela-O21')
    expect(linhas).toHaveTextContent(/Com retorno\s*25\s*5\s*14/)
    expect(linhas).toHaveTextContent(/Sem retorno\s*40\s*4\s*8/)
  })

  it('a "volta mais comum" ignora a reabertura, mesmo quando ela é a maior célula', async () => {
    const o21 = dto([comp('Melhoria', dur(25, 5, 14), dur(40, 4, 8))])
    o21.matriz.celulas = [
      { origem: 'Em teste', destino: 'Em desenvolvimento', retornos: 3, reaberto: false },
      { origem: 'Entregue', destino: 'Em desenvolvimento', retornos: 9, reaberto: true },
    ]
    const el = await abrir(
      'O21',
      <CartaoO21 filtros={FILTROS_FLUXO} />,
      new FonteFixa({ O21: o21 }),
    )
    expect(el).toHaveTextContent(
      'A volta mais comum é de "Em teste" para "Em desenvolvimento" (3 vezes)',
    )
    expect(el.textContent).not.toContain('A volta mais comum é de "Entregue"')
    expect(within(el).getByTestId('o21-reaberturas')).toBeInTheDocument()
  })

  it('só com reabertura, a frase "A volta mais comum" não aparece', async () => {
    const o21 = dto([comp('Melhoria', dur(25, 5, 14), dur(40, 4, 8))])
    o21.matriz.celulas = [
      { origem: 'Entregue', destino: 'Em desenvolvimento', retornos: 9, reaberto: true },
    ]
    const el = await abrir(
      'O21',
      <CartaoO21 filtros={FILTROS_FLUXO} />,
      new FonteFixa({ O21: o21 }),
    )
    expect(el.textContent).not.toContain('A volta mais comum')
    expect(within(el).getByTestId('o21-reaberturas')).toBeInTheDocument()
  })

  it('grupo abaixo de 20: o par não sai e mostra a amostra insuficiente', async () => {
    const el = await abrir(
      'O21',
      <CartaoO21 filtros={FILTROS_FLUXO} />,
      new FonteFixa({
        O21: dto([comp('Melhoria', insuf(7), dur(40, 4, 8), 'com')], taxaInsuf(7, 12)),
      }),
    )
    expect(within(el).getByTestId('o21-destaque')).toHaveTextContent(
      '7 de 12 entregas voltaram ao menos uma vez (percentual não publicado, menos de 20)',
    )
    expect(within(el).getByTestId('o21-par-insuficiente')).toHaveTextContent(
      '7 de 20 itens mínimos',
    )
    expect(within(el).queryByTestId('tabela-O21')).toBeNull()
    expect(within(el).getByTestId('o21-grupo-abaixo')).toHaveTextContent(
      'Comparação não exibida em Melhoria: o grupo com retorno tem menos de 20 itens no tipo.',
    )
  })

  it.each([
    ['sem', 'o grupo sem retorno tem menos de 20 itens no tipo.'],
    ['ambos', 'os dois grupos, com e sem retorno, têm menos de 20 itens no tipo.'],
    [null, 'os dois grupos, com e sem retorno, têm menos de 20 itens no tipo.'],
  ] as const)('diz qual grupo do par está abaixo de 20: %s', async (g, texto) => {
    const el = await abrir(
      'O21',
      <CartaoO21 filtros={FILTROS_FLUXO} />,
      new FonteFixa({
        O21: dto([comp('Melhoria', dur(40, 4, 8), insuf(7), g)], taxaInsuf(7, 12)),
      }),
    )
    expect(within(el).getByTestId('o21-grupo-abaixo')).toHaveTextContent(texto)
  })

  it('troca o tipo do par com o seletor local, um por vez', async () => {
    const u = userEvent.setup()
    const el = await abrir(
      'O21',
      <CartaoO21 filtros={FILTROS_FLUXO} />,
      new FonteFixa({
        O21: dto([
          comp('Melhoria', dur(25, 5, 14), dur(40, 4, 8)),
          comp('Requisição', dur(30, 2, 3), dur(50, 1, 2)),
        ]),
      }),
    )
    await u.click(within(el).getByRole('tab', { name: /Requisição/ }))
    expect(within(el).getByTestId('tabela-O21')).toHaveTextContent(/Com retorno\s*30\s*2\s*3/)
  })
})

describe('O22 Primeiro toque', () => {
  const bloco = (tipo: string, distribuicao: unknown, histograma: unknown, semToque: unknown) => ({
    tipo,
    distribuicao,
    histograma,
    semToque,
  })
  const hist = ['0–0,5', '0,5–1', '1–2', '2–5', '5–10', '10+'].map((faixa, i) => ({
    faixa,
    itens: 10 - i,
  }))
  const dto = (porTipo: unknown[]) => ({ ...base(60, 'pedidos'), segmentoPor: 'tipo', porTipo })

  it('P50/P85/P95, histograma e o bloco "Ainda sem toque"', async () => {
    const el = await abrir(
      'O22',
      <CartaoO22 filtros={FILTROS_FLUXO} />,
      new FonteFixa({
        O22: dto([
          bloco('Requisição', dur(40, 0.8, 3.5), hist, { itens: 6, maisAntigoDiasUteis: 9 }),
        ]),
      }),
    )
    expect(el).toHaveTextContent(
      'Metade dos pedidos de Requisição recebe a primeira reação em até 0,8 dia útil; 85% em até 3,5. Há 6 pedidos ainda sem nenhuma reação, o mais antigo há 9 dias úteis.',
    )
    expect(within(el).getByTestId('o22-faixa')).toHaveTextContent(
      'P50 0,8 · P85 3,5 · P95 5,5 dias úteis',
    )
    expect(within(el).getByTestId('o22-sem-toque')).toHaveTextContent(
      '6 pedidos abertos sem nenhuma reação; o mais antigo espera há 9 dias úteis',
    )
  })

  it('tipo com menos de 20 tocados: amostra insuficiente, sem percentil nem histograma; o retrato de hoje segue', async () => {
    const el = await abrir(
      'O22',
      <CartaoO22 filtros={FILTROS_FLUXO} />,
      new FonteFixa({
        O22: dto([bloco('Incidente', insuf(8), null, { itens: 1, maisAntigoDiasUteis: 2 })]),
      }),
    )
    expect(within(el).queryByTestId('o22-faixa')).toBeNull()
    expect(el).toHaveTextContent('8 de 20 itens mínimos')
    expect(within(el).getByTestId('o22-sem-toque')).toHaveTextContent(
      '1 pedido aberto sem nenhuma reação',
    )
  })

  it('com 1 pedido tocado a frase concorda no singular', async () => {
    const el = await abrir(
      'O22',
      <CartaoO22 filtros={FILTROS_FLUXO} />,
      new FonteFixa({
        O22: dto([bloco('Incidente', insuf(1), null, { itens: 0, maisAntigoDiasUteis: null })]),
      }),
    )
    expect(el).toHaveTextContent('Em Incidente, só 1 pedido foi tocado:')
  })

  it('com vários pedidos tocados abaixo de 20 a frase concorda no plural', async () => {
    const el = await abrir(
      'O22',
      <CartaoO22 filtros={FILTROS_FLUXO} />,
      new FonteFixa({
        O22: dto([bloco('Incidente', insuf(8), null, { itens: 0, maisAntigoDiasUteis: null })]),
      }),
    )
    expect(el).toHaveTextContent('Em Incidente, só 8 pedidos foram tocados:')
  })

  it('um tipo por vez, trocado pelo seletor', async () => {
    const u = userEvent.setup()
    const el = await abrir(
      'O22',
      <CartaoO22 filtros={FILTROS_FLUXO} />,
      new FonteFixa({
        O22: dto([
          bloco('Requisição', dur(40, 0.8, 3.5), hist, { itens: 6, maisAntigoDiasUteis: 9 }),
          bloco('Incidente', dur(30, 0.2, 1), hist, { itens: 0, maisAntigoDiasUteis: null }),
        ]),
      }),
    )
    await u.click(within(el).getByRole('tab', { name: /Incidente/ }))
    expect(within(el).getByTestId('o22-faixa')).toHaveTextContent('P50 0,2 · P85 1')
  })

  it('na fonte de mock do navegador a métrica traz dados (extensão ligada)', async () => {
    renderizarCartao(<CartaoO22 filtros={FILTROS_FLUXO} />)
    const el = await screen.findByTestId('metrica-O22')
    await waitFor(() =>
      expect(el).toHaveAttribute('data-estado', expect.stringMatching(/^(ok|vazio)$/)),
    )
    expect(el).toHaveTextContent('Dados fictícios')
  })
})

describe('O24 Ordem de chegada', () => {
  const dto = (inicios: unknown, porTipo: unknown[]) => ({
    ...base(64, 'inícios'),
    inicios,
    meses: [
      { mes: '2026-08', emOrdem: 20, foraDeOrdem: 8, emAndamento: false },
      { mes: '2026-09', emOrdem: 22, foraDeOrdem: 10, emAndamento: true },
    ],
    marcacoes: [],
    custo: { segmentoPor: 'tipo', porTipo },
    grupo: 'equipe-tipo-padrao',
  })

  it('destaque, custo dos ultrapassados e a nota fixa da classe Padrão', async () => {
    const el = await abrir(
      'O24',
      <CartaoO24 filtros={FILTROS_FLUXO} />,
      new FonteFixa({
        O24: dto(taxaOk(18, 64), [
          { tipo: 'Melhoria', ultrapassados: 22, estatistica: dur(22, 4, 9) },
        ]),
      }),
    )
    expect(within(el).getByTestId('o24-destaque')).toHaveTextContent(
      '18 de 64 inícios (28%) passaram na frente de um pedido mais antigo',
    )
    expect(el).toHaveTextContent(
      'os ultrapassados esperaram, depois de ultrapassados, 9 dias úteis até começar (P85)',
    )
    expect(within(el).getByTestId('o24-custo')).toHaveTextContent(
      'depois de ultrapassados, P50 4 e P85 9 dias úteis até começar',
    )
    expect(el).toHaveTextContent('O cartão mostra o custo de passar na frente, não um erro.')
    expect(el.textContent).not.toMatch(/dias a mais/i)
  })

  it('menos de 20 inícios e menos de 20 ultrapassados: "k de n" e amostra insuficiente', async () => {
    const el = await abrir(
      'O24',
      <CartaoO24 filtros={FILTROS_FLUXO} />,
      new FonteFixa({
        O24: dto(taxaInsuf(3, 12), [{ tipo: 'Melhoria', ultrapassados: 3, estatistica: insuf(3) }]),
      }),
    )
    expect(within(el).getByTestId('o24-destaque')).toHaveTextContent(
      '3 de 12 inícios passaram na frente de um pedido mais antigo (percentual não publicado, menos de 20)',
    )
    expect(el).toHaveTextContent('3 de 20 itens mínimos')
  })
})

describe('O25 Descarte', () => {
  const dto = (extra: Record<string, unknown> = {}, enc: unknown = taxaOk(9, 105)) => ({
    ...base(105, 'encerrados'),
    encerrados: enc,
    meses: [
      { mes: '2026-08', taxa: taxaOk(4, 50), emAndamento: false },
      { mes: '2026-09', taxa: taxaInsuf(1, 5), emAndamento: true },
    ],
    marcacoes: [],
    consumido: {
      antesDoInicio: { itens: 6 },
      depoisDoInicio: {
        itens: 3,
        diasUteis: 38,
        segmentoPor: 'tipo',
        porTipo: [{ tipo: 'Melhoria', itens: 3, diasUteis: 38, estatistica: insuf(3) }],
      },
    },
    instanteAproximado: { itens: 0 },
    avisoPreenchimento: { itens: 0 },
    porMotivo: null,
    ...extra,
  })

  it('destaque, leitura e consumo antes e depois do início, sem tabela por motivo nesta fase', async () => {
    const el = await abrir(
      'O25',
      <CartaoO25 filtros={FILTROS_FLUXO} />,
      new FonteFixa({ O25: dto() }),
    )
    expect(within(el).getByTestId('o25-destaque')).toHaveTextContent(
      '9 descartados de 105 encerrados (8,6%)',
    )
    expect(el).toHaveTextContent(
      '9 itens foram descartados no período (8,6% do que encerrou). Eles tinham consumido 38 dias úteis depois de começar; 6 foram descartados ainda na fila, sem trabalho iniciado.',
    )
    const c = within(el).getByTestId('o25-consumido')
    expect(c).toHaveTextContent('Antes do início (decidido na fila): 6 itens')
    expect(c).toHaveTextContent(
      'Depois do início (trabalho jogado fora): 3 itens, somando 38 dias úteis',
    )
    expect(within(el).getByTestId('o25-percentis')).toHaveTextContent(
      'P50 e P85 não publicados (menos de 20).',
    )
    expect(within(el).queryByTestId('tabela-O25')).toBeNull()
    expect(el).toHaveTextContent('Nesta fase não há divisão por motivo.')
    expect(el).toHaveTextContent('Descartar cedo é saudável')
    expect(within(el).getByTestId('o25-meses-sem-taxa')).toHaveTextContent(
      'Meses com menos de 20 encerrados não mostram a taxa.',
    )
  })

  it('avisos de preenchimento e de instante aproximado só aparecem quando existem', async () => {
    const el = await abrir(
      'O25',
      <CartaoO25 filtros={FILTROS_FLUXO} />,
      new FonteFixa({
        O25: dto({ avisoPreenchimento: { itens: 2 }, instanteAproximado: { itens: 1 } }),
      }),
    )
    expect(within(el).getByTestId('o25-aviso-preenchimento')).toHaveTextContent(
      '2 cards têm motivo de descarte',
    )
    expect(within(el).getByTestId('o25-aproximado')).toHaveTextContent(
      '1 descarte tem instante aproximado',
    )
  })

  it('menos de 20 encerrados: "k de n", sem percentual', async () => {
    const el = await abrir(
      'O25',
      <CartaoO25 filtros={FILTROS_FLUXO} />,
      new FonteFixa({ O25: dto({}, taxaInsuf(2, 15)) }),
    )
    expect(within(el).getByTestId('o25-destaque')).toHaveTextContent(
      '2 descartados de 15 encerrados (percentual não publicado, menos de 20)',
    )
  })
})

describe('O26 Passagens de mão', () => {
  const faixa = (f: string, itens: number, pct: unknown, c: unknown) => ({
    faixa: f,
    itens,
    pct,
    cicloP85: c,
  })
  const dto = (semDado = 0) => ({
    ...base(70, 'entregas'),
    segmentoPor: 'tipo',
    porTipo: [
      {
        tipo: 'Melhoria',
        entregas: 70,
        semDado,
        faixas: [
          faixa('0', 30, taxaOk(30, 70), p85(30, 7)),
          faixa('1', 25, taxaOk(25, 70), p85(25, 9)),
          faixa('2', 10, taxaInsuf(10, 70), insuf(10)),
          faixa('3', 4, taxaInsuf(4, 70), insuf(4)),
          faixa('4+', 1, taxaInsuf(1, 70), insuf(1)),
        ],
      },
    ],
  })

  it('histograma por faixa com o selo "Conta trocas, nunca quem." e P85 só com 20', async () => {
    const el = await abrir(
      'O26',
      <CartaoO26 filtros={FILTROS_FLUXO} />,
      new FonteFixa({ O26: dto() }),
    )
    expect(within(el).getByTestId('o26-selo')).toHaveTextContent('Conta trocas, nunca quem.')
    const linhas = within(within(el).getByTestId('tabela-O26')).getAllByRole('row').slice(1)
    expect(linhas[0]).toHaveTextContent(/0\s*30\s*42,9%\s*7 dias úteis/)
    expect(linhas[2]).toHaveTextContent(/2\s*10\s*— menos de 20\s*— amostra insuficiente/)
    expect(linhas[4]).toHaveTextContent(/4 ou mais\s*1/)
    expect(el).toHaveTextContent('Dados fictícios')
  })

  it('entregas sem a contagem ficam à parte e nunca viram zero passagens', async () => {
    const el = await abrir(
      'O26',
      <CartaoO26 filtros={FILTROS_FLUXO} />,
      new FonteFixa({ O26: dto(5) }),
    )
    expect(within(el).getByTestId('o26-sem-dado')).toHaveTextContent(
      '5 entregas sem a contagem de passagens ficam à parte',
    )
  })

  it('nenhum controle de filtro ou abertura por pessoa', async () => {
    const el = await abrir(
      'O26',
      <CartaoO26 filtros={FILTROS_FLUXO} />,
      new FonteFixa({ O26: dto() }),
    )
    expect(el.textContent).not.toMatch(/respons[aá]vel:|por pessoa:|ranking/i)
    expect(within(el).queryByRole('combobox')).toBeNull()
  })
})

describe('O23, bloco do O2: estoque parado', () => {
  const comParados = (parados: unknown) =>
    new FonteAjustada({
      O2: (r: { parados: unknown }) => {
        r.parados = parados
      },
    })

  it('com 20 itens ou mais em andamento: "k de n (pct%)" e barra por etapa; "Ver os parados" ordena por tempo sem mover', async () => {
    const u = userEvent.setup()
    const el = await abrir(
      'O2',
      <CartaoO2 filtros={FILTROS_FLUXO} />,
      comParados({
        limiteDiasUteis: 5,
        taxa: taxaOk(7, 31),
        porEtapa: [
          { etapa: 'Em teste', k: 4 },
          { etapa: 'Em desenvolvimento', k: 3 },
        ],
      }),
    )
    expect(within(el).getByTestId('o23-destaque')).toHaveTextContent(
      '7 de 31 itens em andamento (23%) sem mover há mais de 5 dias úteis',
    )
    expect(within(el).getByTestId('o23-parados')).toHaveTextContent('Em teste: 4')
    await u.click(within(el).getByRole('button', { name: 'Ver os parados' }))
    expect(within(el).getByRole('button', { name: 'Sem mover há' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('abaixo de 20 itens: só "k de n", sem percentual; sem parados, sem botão', async () => {
    const el = await abrir(
      'O2',
      <CartaoO2 filtros={FILTROS_FLUXO} />,
      comParados({ limiteDiasUteis: 5, taxa: taxaInsuf(0, 12), porEtapa: [] }),
    )
    expect(within(el).getByTestId('o23-destaque')).toHaveTextContent(
      '0 de 12 itens em andamento sem mover há mais de 5 dias úteis (percentual não publicado, menos de 20)',
    )
    expect(within(el).queryByRole('button', { name: 'Ver os parados' })).toBeNull()
  })

  it('cada etapa da lista leva o quadrado de cor da barra', async () => {
    const el = await abrir(
      'O2',
      <CartaoO2 filtros={FILTROS_FLUXO} />,
      comParados({
        limiteDiasUteis: 5,
        taxa: taxaOk(7, 31),
        porEtapa: [
          { etapa: 'Em teste', k: 4 },
          { etapa: 'Em desenvolvimento', k: 3 },
        ],
      }),
    )
    const itens = within(within(el).getByTestId('o23-parados')).getAllByRole('listitem')
    expect(itens).toHaveLength(2)
    for (const li of itens) expect(li.querySelector('span[aria-hidden="true"]')).not.toBeNull()
  })

  it('sem nenhum item em andamento: "Nenhum item em andamento"', async () => {
    const el = await abrir(
      'O2',
      <CartaoO2 filtros={FILTROS_FLUXO} />,
      comParados({ limiteDiasUteis: 5, taxa: taxaInsuf(0, 0), porEtapa: [] }),
    )
    expect(within(el).getByTestId('o23-destaque')).toHaveTextContent('Nenhum item em andamento')
  })
})

describe('ramos de borda dos complementares operacionais', () => {
  const zero = taxaInsuf(0, 0)
  const matriz = (eixo: string) => ({
    eixo,
    celulas: [{ origem: 'A', destino: 'B', retornos: 1, reaberto: false }],
  })

  it('O19: motivo com percentual não publicado abre a leitura sem o "% do total"', async () => {
    const el = await abrir(
      'O19',
      <CartaoO19 filtros={FILTROS_FLUXO} />,
      new FonteFixa({
        O19: {
          ...base(25, 'bloqueios'),
          motivos: [
            {
              motivo: 'Aguardando fornecedor',
              bloqueios: 8,
              diasUteis: 12,
              pctDoTotal: {
                status: 'insuficiente',
                bloqueios: 8,
                diasUteis: 12,
                totalDiasUteis: 12,
                minimo: 20,
              },
              duracao: insuf(8),
            },
          ],
          abertosForaDaSoma: 0,
          totalDiasUteis: 12,
        },
      }),
    )
    expect(el).toHaveTextContent(
      'Aguardando fornecedor somou 12 dias úteis de bloqueio no período.',
    )
  })

  it('O20: agrupamento por coluna e destaque de faixa que não está na lista usam o texto de coluna e a chave', async () => {
    const el = await abrir(
      'O20',
      <CartaoO20 filtros={FILTROS_FLUXO} />,
      new FonteFixa({
        O20: {
          ...base(30),
          agrupamento: 'coluna',
          faixas: [{ chave: 'backlog', rotulo: 'Backlog', ordem: 0, tipoColuna: 'fila' }],
          dias: [{ dia: '2026-10-01', contagens: [5], emProgresso: 5 }],
          destaque: { faixa: 'outra', de: 1, para: 9 },
          mudancasCriterio: [],
        },
      }),
    )
    expect(el).toHaveTextContent('a faixa "outra" cresceu de 1 para 9 itens')
  })

  it('O21: sem entregas na taxa não há frase de leitura; matriz por coluna', async () => {
    const el = await abrir(
      'O21',
      <CartaoO21 filtros={FILTROS_FLUXO} />,
      new FonteFixa({
        O21: {
          ...base(10, 'entregas'),
          entregas: zero,
          matriz: matriz('coluna'),
          reaberturas: 0,
          segmentoPor: 'tipo',
          comparacoes: [],
        },
      }),
    )
    expect(within(el).getByTestId('o21-matriz')).toHaveTextContent('por coluna')
  })

  it('O22: pedidos sem reação sem o mais antigo informado não inventam a idade', async () => {
    const el = await abrir(
      'O22',
      <CartaoO22 filtros={FILTROS_FLUXO} />,
      new FonteFixa({
        O22: {
          ...base(60, 'pedidos'),
          segmentoPor: 'tipo',
          porTipo: [
            {
              tipo: 'Requisição',
              distribuicao: dur(40, 1, 2),
              histograma: [{ faixa: '0–0,5', itens: 4 }],
              semToque: { itens: 2, maisAntigoDiasUteis: null },
            },
          ],
        },
      }),
    )
    expect(el).toHaveTextContent('Há 2 pedidos ainda sem nenhuma reação.')
  })

  it('O24: sem inícios na taxa não há frase de leitura', async () => {
    const el = await abrir(
      'O24',
      <CartaoO24 filtros={FILTROS_FLUXO} />,
      new FonteFixa({
        O24: {
          ...base(10, 'inícios'),
          inicios: zero,
          meses: [{ mes: '2026-09', emOrdem: 1, foraDeOrdem: 0, emAndamento: false }],
          marcacoes: [],
          custo: { segmentoPor: 'tipo', porTipo: [] },
          grupo: 'equipe-tipo-padrao',
        },
      }),
    )
    expect(within(el).queryByTestId('o24-destaque')).not.toBeNull()
    expect(within(el).getByTestId('o24-sem-ultrapassado')).toHaveTextContent(
      'Nenhum pedido ultrapassado no período.',
    )
  })

  it('O25: percentis publicados com 20 descartes depois do início e tabela por motivo quando vier', async () => {
    const el = await abrir(
      'O25',
      <CartaoO25 filtros={FILTROS_FLUXO} />,
      new FonteFixa({
        O25: {
          ...base(105, 'encerrados'),
          encerrados: zero,
          meses: [{ mes: '2026-08', taxa: taxaOk(4, 50), emAndamento: false }],
          marcacoes: [],
          consumido: {
            antesDoInicio: { itens: 1 },
            depoisDoInicio: {
              itens: 25,
              diasUteis: 90,
              segmentoPor: 'tipo',
              porTipo: [{ tipo: 'Melhoria', itens: 25, diasUteis: 90, estatistica: dur(25, 3, 8) }],
            },
          },
          instanteAproximado: { itens: 0 },
          avisoPreenchimento: { itens: 0 },
          porMotivo: [{ motivo: 'Duplicado', itens: 4 }],
        },
      }),
    )
    expect(within(el).getByTestId('o25-percentis')).toHaveTextContent(
      'P50 3 e P85 8 dias úteis consumidos',
    )
    expect(within(el).getByTestId('tabela-O25')).toHaveTextContent('Duplicado')
    expect(within(el).queryByTestId('o25-meses-sem-taxa')).toBeNull()
    expect(el).not.toHaveTextContent(/divisão por motivo\./)
  })

  it('O26: faixa de 1 passagem no singular e tipo sem faixas não gera leitura', async () => {
    const faixas = [
      { faixa: '0', itens: 5, pct: taxaOk(5, 70), cicloP85: p85(5, 3) },
      { faixa: '1', itens: 60, pct: taxaOk(60, 70), cicloP85: p85(60, 6) },
    ]
    const um = await abrir(
      'O26',
      <CartaoO26 filtros={FILTROS_FLUXO} />,
      new FonteFixa({
        O26: {
          ...base(70, 'entregas'),
          segmentoPor: 'tipo',
          porTipo: [{ tipo: 'Melhoria', entregas: 70, semDado: 0, faixas }],
        },
      }),
    )
    expect(um).toHaveTextContent(
      'Em Melhoria, 70 entregas; o mais comum é 1 passagem de mão: 60 entregas (86%).',
    )
  })

  it.each([
    ['0', 'nenhuma passagem de mão'],
    ['2', '2 passagens de mão'],
    ['4+', '4 ou mais passagens de mão'],
  ])('O26: a faixa %s é lida como "%s"', async (f, rotulo) => {
    const el = await abrir(
      'O26',
      <CartaoO26 filtros={FILTROS_FLUXO} />,
      new FonteFixa({
        O26: {
          ...base(87, 'entregas'),
          segmentoPor: 'tipo',
          porTipo: [
            {
              tipo: 'Melhoria',
              entregas: 87,
              semDado: 0,
              faixas: [{ faixa: f, itens: 1, pct: taxaInsuf(1, 87), cicloP85: insuf(1) }],
            },
          ],
        },
      }),
    )
    expect(el).toHaveTextContent(`o mais comum é ${rotulo}: 1 entrega.`)
  })

  it('O26: no empate vale a faixa de menor número e o exemplo da ficha sai por extenso', async () => {
    const el = await abrir(
      'O26',
      <CartaoO26 filtros={FILTROS_FLUXO} />,
      new FonteFixa({
        O26: {
          ...base(87, 'entregas'),
          segmentoPor: 'tipo',
          porTipo: [
            {
              tipo: 'Melhoria',
              entregas: 87,
              semDado: 0,
              faixas: [
                { faixa: '1', itens: 36, pct: taxaOk(36, 87), cicloP85: p85(36, 5) },
                { faixa: '2', itens: 36, pct: taxaOk(36, 87), cicloP85: p85(36, 8) },
              ],
            },
          ],
        },
      }),
    )
    expect(el).toHaveTextContent(
      'Em Melhoria, 87 entregas; o mais comum é 1 passagem de mão: 36 entregas (41%).',
    )
  })

  it('O26: tipo com entregas mas sem nenhuma faixa não gera leitura', async () => {
    const el = await abrir(
      'O26',
      <CartaoO26 filtros={FILTROS_FLUXO} />,
      new FonteFixa({
        O26: {
          ...base(70, 'entregas'),
          segmentoPor: 'tipo',
          porTipo: [{ tipo: 'Melhoria', entregas: 70, semDado: 70, faixas: [] }],
        },
      }),
    )
    expect(el).not.toHaveTextContent('o mais comum é')
  })
})
