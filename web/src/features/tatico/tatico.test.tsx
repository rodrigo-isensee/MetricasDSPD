import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderizarApp } from '@/test/helpers'
import { COMUM, FonteFixa, J, JANELA } from '@/features/painel/testes/fonteFixa'

const ok = <T,>(n: number, valor: T) => ({ status: 'ok' as const, n, valor, janela: J })
const insuf = (n: number) => ({
  status: 'insuficiente' as const,
  n,
  minimo: 20 as const,
  janela: J,
})
const cartao = async (c: string) => screen.findByTestId(`metrica-${c}`)

const blocos = { fila: 22, espera: 4, execucao: 9, homologacao: 3 }
const t1 = {
  ...COMUM,
  janelaPercentis: JANELA,
  classes: [
    { classe: 'Urgente', n: 12, estatistica: insuf(12) },
    {
      classe: 'Padrão',
      n: 64,
      estatistica: ok(64, { blocos, total: { p50: 38, p85: 60, p95: 80 }, fracaoFilaPct: 58 }),
    },
    {
      classe: 'Prazo fixo',
      n: 20,
      estatistica: ok(20, { blocos, total: { p50: 30, p85: 50, p95: 70 }, fracaoFilaPct: 40 }),
    },
    { classe: 'Intangível', n: 5, estatistica: insuf(5) },
  ],
}

describe('T1 lead time por classe', () => {
  it('A1/A2/A3: blocos e P85 por classe, n<20 sem barra, n=20 publica, só papéis como donos', async () => {
    renderizarApp('/tatico', new FonteFixa({ T1: t1 }))
    const el = await cartao('T1')
    expect(await within(el).findByTestId('amostra-insuficiente-T1-urgente')).toHaveTextContent(
      'Amostra insuficiente (12 de 20 itens mínimos)',
    )
    expect(within(el).getByTestId('amostra-insuficiente-T1-intangivel')).toBeInTheDocument()
    expect(within(el).getByTestId('leitura-T1')).toHaveTextContent(
      'mediana do lead time é 38 dias úteis',
    )
    expect(within(el).getByRole('tab', { name: /Prazo fixo/ })).toBeInTheDocument()
    expect(within(el).getByText('Validação do negócio')).toBeInTheDocument()
    // a soma das medianas (38) só aparece como mediana do total quando for o P50 real; nunca como "soma"
    await userEvent.click(within(el).getByRole('button', { name: 'Ver como tabela' }))
    const tab = within(el).getByTestId('tabela-T1')
    expect(within(tab).getByText(/Padrão \(P85 do total: 60 dias úteis\)/)).toBeInTheDocument()
    expect(within(tab).queryByText(/Urgente/)).not.toBeInTheDocument()
    expect(el).toHaveTextContent('Leia junto com Demanda × capacidade (T4)')
  })
})

const classeT2 = (classe: string, k: number, n: number, status: 'dentro' | 'fora') => ({
  classe,
  sle: { diasUteis: 9, publicadoEm: '2026-03-02' },
  n,
  dentroDoSle: { status: 'ok' as const, k, n, pct: (k / n) * 100 },
  statusMeta: status,
  estouros: { total: n - k, porEtapa: [{ etapa: 'Homologação' as const, contagem: n - k }] },
})
const t2 = {
  ...COMUM,
  janelaPercentis: JANELA,
  classes: [
    classeT2('Padrão', 54, 64, 'fora'),
    classeT2('Prazo fixo', 55, 64, 'dentro'),
    {
      classe: 'Urgente',
      sle: null,
      n: 10,
      dentroDoSle: { status: 'insuficiente' as const, k: 8, n: 10, minimo: 20 as const },
      statusMeta: 'sem-referencia',
      estouros: { total: 0, porEtapa: [] },
    },
    {
      classe: 'Intangível',
      sle: null,
      n: 30,
      dentroDoSle: null,
      statusMeta: 'sem-referencia',
      estouros: { total: 0, porEtapa: [] },
    },
  ],
}

describe('T2 aderência ao SLE', () => {
  it('B1/B2/B3', async () => {
    renderizarApp('/tatico', new FonteFixa({ T2: t2 }))
    const el = await cartao('T2')
    const padrao = await within(el).findByTestId('t2-Padrão')
    expect(padrao).toHaveTextContent('84,4%')
    expect(padrao).toHaveTextContent('Fora da meta')
    expect(within(el).getByTestId('t2-Prazo fixo')).toHaveTextContent('Dentro da meta')
    expect(within(el).getByTestId('t2-Intangível')).toHaveTextContent(
      'Sem SLE (cota fixa de capacidade)',
    )
    expect(within(el).getByTestId('t2-Urgente')).toHaveTextContent('SLE: não publicado')
    expect(padrao).toHaveTextContent('publicado em 02/03/2026')
    const mapa = within(el).getByRole('region', { name: /Estouros do SLE/ })
    expect(within(mapa).getByRole('row', { name: /Padrão/ })).toHaveTextContent('10')
  })
})

const nat = (natureza: string, ac: number, pct: number, st: 'dentro' | 'fora') => ({
  natureza,
  acordadoPct: ac,
  itens: { quantidade: 10, pct, desvioPP: pct - ac, statusMeta: st },
  tempo: { quantidade: 80, pct: ac, desvioPP: 0, statusMeta: 'dentro' as const },
})
const t3 = (st: 'ok' | 'insuficiente') => ({
  ...COMUM,
  status: st,
  naturezas: [
    nat('Sustentação', 40, 51, 'fora'),
    nat('Evolução', 40, 50, 'dentro'),
    nat('Dívida técnica', 5, 1, 'dentro'),
  ],
})

describe('T3 alocação', () => {
  it('C1/C2: selo só acima de 10 p.p.; alternador com padrão Itens', async () => {
    renderizarApp('/tatico', new FonteFixa({ T3: t3('ok') }))
    const el = await cartao('T3')
    expect(await within(el).findByText('Desvio acima de 10 p.p.')).toBeInTheDocument()
    expect(within(el).getAllByText('Desvio acima de 10 p.p.')).toHaveLength(1)
    expect(within(el).getByRole('radio', { name: 'Itens' })).toBeChecked()
    await userEvent.click(within(el).getByRole('radio', { name: 'Tempo em execução' }))
    expect(within(el).queryByText('Desvio acima de 10 p.p.')).not.toBeInTheDocument()
  })
  it('percentuais somem com menos de 20 itens (T-N20)', async () => {
    renderizarApp('/tatico', new FonteFixa({ T3: t3('insuficiente') }))
    const el = await cartao('T3')
    expect(await within(el).findByTestId('amostra-insuficiente-T3')).toBeInTheDocument()
    expect(el).not.toHaveTextContent('realizado')
  })
})

const faixa = (m: number) => ({ min: 1, max: 20, mediana: m, media: m })
const semanas = [{ semana: '2026-09-28', emAndamento: false, chegada: 5, vazao: 4 }]
const t4 = {
  ...COMUM,
  classes: [
    {
      classe: 'Padrão',
      n: 100,
      estatistica: ok(100, {
        chegada: faixa(11),
        vazao: faixa(8),
        razao: 1.01,
        backlog: 36,
        semanasParaZerar: null,
        filaCresce: true,
        saldo: -3,
      }),
      statusMeta: 'fora' as const,
      totais: { chegadas: 132, saidas: 96, backlog: 36 },
      semanas,
    },
    {
      classe: 'Urgente',
      n: 16,
      estatistica: insuf(16),
      statusMeta: 'sem-referencia' as const,
      totais: { chegadas: 9, saidas: 7, backlog: 4 },
      semanas: [{ semana: '2026-09-28', emAndamento: false, chegada: 9, vazao: 7 }],
    },
    {
      classe: 'Prazo fixo',
      n: 40,
      estatistica: ok(40, {
        chegada: faixa(0),
        vazao: faixa(3),
        razao: null,
        backlog: 0,
        semanasParaZerar: 0,
        filaCresce: false,
        saldo: 3,
      }),
      statusMeta: 'sem-referencia' as const,
      totais: { chegadas: 0, saidas: 36, backlog: 0 },
      semanas,
    },
  ],
}

describe('T4 demanda x capacidade', () => {
  it('D1/D2: sempre por classe, razão indefinida sem chegada, contagens abaixo de 20', async () => {
    renderizarApp('/tatico', new FonteFixa({ T4: t4 }))
    const el = await cartao('T4')
    const tab = await within(el).findByTestId('tabela-T4-classes')
    expect(
      within(within(tab).getByRole('row', { name: /Padrão/ })).getByText('1,01'),
    ).toBeInTheDocument()
    expect(within(tab).getByRole('row', { name: /Prazo fixo/ })).toHaveTextContent('Indefinida')
    expect(within(tab).getByRole('row', { name: /Urgente/ })).toHaveTextContent('Chegadas: 9')
    expect(within(tab).getByRole('row', { name: /Urgente/ })).toHaveTextContent(
      '16 de 20 itens mínimos',
    )
    expect(within(tab).queryByRole('row', { name: /Total|Todas/ })).not.toBeInTheDocument()
    expect(within(el).getByTestId('leitura-T4')).toHaveTextContent(
      'A fila cresce: chegam mais itens do que saem',
    )
    expect(el).not.toHaveTextContent(/semanas para zerar fila/i)
  })
})

const grupo = (id: string, nome: string, n: number, st: 'ok' | 'insuf', pct = 40) => ({
  id,
  nome,
  n,
  estatistica:
    st === 'ok'
      ? ok(n, {
          pctFalha: pct,
          origens: [
            { origem: 'Demanda de valor' as const, n: n * (1 - pct / 100), pct: 100 - pct },
            { origem: 'Falta de treinamento do usuário' as const, n: (n * pct) / 100, pct },
          ],
          origemMaior: 'Falta de treinamento do usuário' as const,
        })
      : insuf(n),
})
const t5 = {
  ...COMUM,
  porSistema: [
    grupo('a', 'Alfa', 30, 'ok', 80),
    grupo('b', 'Beta', 90, 'ok', 10),
    grupo('c', 'Fluig', 11, 'insuf'),
  ],
  porArea: [grupo('x', 'Fiscal', 25, 'ok'), grupo('y', 'Contábil', 25, 'ok', 90)],
  variacaoSemestre: [
    { sistema: 'Alfa', atualPct: 80, anteriorPct: 90, variacaoPct: -15 },
    { sistema: 'Beta', atualPct: 10, anteriorPct: null, variacaoPct: null },
  ],
}

describe('T5 demanda de falha', () => {
  it('E1/E2: ordem por volume, selo só em sistemas, sem pessoas/equipes', async () => {
    renderizarApp('/tatico', new FonteFixa({ T5: t5 }))
    const el = await cartao('T5')
    const linhas = await within(el).findAllByRole('row')
    const nomes = linhas.map((l) => l.textContent)
    expect(nomes.findIndex((t) => t.startsWith('Beta'))).toBeLessThan(
      nomes.findIndex((t) => t.startsWith('Alfa')),
    )
    // Alfa e Beta são os dois sistemas da variação semestral (meta)
    expect(within(el).getAllByText('Foco da meta')).toHaveLength(2)
    expect(within(el).getByText(/−15%|-15%/, { selector: 'li' })).toBeInTheDocument()
    expect(within(el).getByText(/Comparação indisponível/)).toBeInTheDocument()
    expect(within(el).getByTestId('t5-sem-amostra')).toHaveTextContent(
      'Fluig: 11 de 20 itens mínimos',
    )
    expect(el).toHaveTextContent('Ordem por volume de demanda. Não é um ranking.')
    await userEvent.click(within(el).getByRole('tab', { name: 'Por área' }))
    expect(within(el).queryByText('Foco da meta')).not.toBeInTheDocument()
    expect(el).toHaveTextContent('não das áreas')
    // desempate/ordem das áreas: volume igual -> alfabética
    const l2 = within(el)
      .getAllByRole('row')
      .map((l) => l.textContent)
    expect(l2.findIndex((t) => t.startsWith('Contábil'))).toBeLessThan(
      l2.findIndex((t) => t.startsWith('Fiscal')),
    )
  })
  it('T-T5 e T-PROIB: nenhum nome de equipe no cartão', async () => {
    renderizarApp('/tatico')
    const el = await cartao('T5')
    await waitFor(() => expect(within(el).getByTestId('base-T5')).toBeInTheDocument())
    expect(el.textContent).not.toMatch(/SSSC|Equipe\b/i)
  })
})

const t7 = (n: number) => ({
  ...COMUM,
  janelaPercentis: JANELA,
  kpis: { frentesEmAndamento: 11, projetosComFrentes: 4, limiteFrentes: 8, acimaDoLimite: true },
  porProjeto: [
    { projetoId: 'p1', projeto: 'Alfa', abertas: 6 },
    { projetoId: 'p2', projeto: 'Beta', abertas: 5 },
  ],
  idades: [
    {
      cardId: 'c1',
      titulo: 'Frente nova',
      projeto: 'Alfa',
      idadeDiasUteis: 3,
      situacao: 'dentro' as const,
    },
    {
      cardId: 'c2',
      titulo: 'Frente velha',
      projeto: 'Beta',
      idadeDiasUteis: 90,
      situacao: 'acima-p95' as const,
    },
  ],
  referencia: n >= 20 ? ok(n, { p50: 10, p85: 30, p95: 50 }) : insuf(n),
  histograma:
    n >= 20 ? ok(n, { faixas: [{ rotulo: '0-10', min: 0, max: 10, contagem: n }] }) : insuf(n),
})

describe('T7 fluxo de frentes', () => {
  it('F1: com n<20 somem percentis e histograma; KPIs e lista permanecem; ordem temporal', async () => {
    renderizarApp('/tatico', new FonteFixa({ T7: t7(7) }))
    const el = await cartao('T7')
    const am = await within(el).findByTestId('amostra-insuficiente-T7')
    expect(am).toHaveAttribute('data-variante', 'lenta')
    expect(am).toHaveTextContent('Foram concluídos 7 frentes')
    expect(within(el).queryByRole('alert')).not.toBeInTheDocument()
    expect(el).toHaveTextContent('frentes em andamento')
    const rows = within(
      within(el).getByRole('region', { name: /Frentes abertas, da mais antiga/ }),
    ).getAllByRole('row')
    expect(rows[1]).toHaveTextContent('Frente velha')
  })
  it('com n>=20 publica referência e histograma só de frentes', async () => {
    renderizarApp('/tatico', new FonteFixa({ T7: t7(27) }))
    const el = await cartao('T7')
    await waitFor(() =>
      expect(within(el).queryByTestId('amostra-insuficiente-T7')).not.toBeInTheDocument(),
    )
    expect(el).toHaveTextContent(/frentes/i)
  })
})

const t9 = {
  ...COMUM,
  projetosComEscopoCrescido: 1,
  projetos: [
    {
      projetoId: 'p',
      projeto: 'Alfa',
      totalFrentes: 21,
      originais: 16,
      adicionadas: 5,
      concluidas: 8,
      emAndamento: 5,
      aFazer: 8,
      avancoPct: 38.1,
      crescimentoEscopoPct: 31.25,
    },
  ],
}
describe('T9 avanço e escopo', () => {
  it('G1/G2: avanço e escopo na mesma linha, sem campo de avanço manual', async () => {
    renderizarApp('/tatico', new FonteFixa({ T9: t9 }))
    const el = await cartao('T9')
    const linha = await within(el).findByRole('row', { name: /Alfa/ })
    expect(linha).toHaveTextContent('8 de 21 frentes (38%)')
    expect(linha).toHaveTextContent('Escopo cresceu 31%')
    expect(within(el).queryByRole('textbox')).not.toBeInTheDocument()
    expect(within(el).queryByRole('spinbutton')).not.toBeInTheDocument()
    expect(within(el).queryByRole('slider')).not.toBeInTheDocument()
  })
})

describe('painel Tático', () => {
  it('mostra seções A, B e C e todos os cartões (sem placeholder), em dados mock', async () => {
    renderizarApp('/tatico')
    for (const c of ['T1', 'T2', 'T3', 'T4', 'T5', 'T7', 'T9']) await cartao(c)
    expect(screen.queryByTestId('placeholder-painel')).not.toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThanOrEqual(3)
  })
  it('?mock=erro:t2: só T2 falha', async () => {
    renderizarApp('/tatico?mock=erro:t2')
    expect(await screen.findByTestId('estado-erro-T2')).toBeInTheDocument()
    expect(await screen.findByTestId('metrica-T1')).toBeInTheDocument()
  })
})

describe('Espera invisível no painel (K-042)', () => {
  it('o Tático traz a seção com o cartão compacto EI-FL2', async () => {
    renderizarApp('/tatico')
    const el = await cartao('EI-FL2')
    const secao = document.getElementById('espera-invisivel') as HTMLElement
    expect(
      within(secao).getByRole('heading', {
        level: 2,
        name: /Quanto do tempo do solicitante fica fora da nossa gestão/,
      }),
    ).toBeInTheDocument()
    expect(secao).toContainElement(el)
  })
})
