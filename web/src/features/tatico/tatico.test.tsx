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
  semPrioridade: { n: 445, total: 900 },
  classes: [
    { classe: 'Crítica', n: 12, estatistica: insuf(12) },
    {
      classe: 'Média',
      n: 64,
      estatistica: ok(64, { blocos, total: { p50: 38, p85: 60, p95: 80 }, fracaoFilaPct: 58 }),
    },
    {
      classe: 'Alta',
      n: 20,
      estatistica: ok(20, { blocos, total: { p50: 30, p85: 50, p95: 70 }, fracaoFilaPct: 40 }),
    },
    { classe: 'Baixa', n: 5, estatistica: insuf(5) },
  ],
}

describe('T1 lead time por prioridade', () => {
  it('B1: sem nenhuma prioridade publicável e a faixa sendo a maioria, a leitura diz que a maior parte está sem prioridade', async () => {
    const dto = {
      ...t1,
      semPrioridade: { n: 60, total: 100 },
      classes: [{ classe: 'Alta', n: 5, estatistica: insuf(5) }],
    }
    renderizarApp('/tatico', new FonteFixa({ T1: dto }))
    const el = await cartao('T1')
    expect(await within(el).findByTestId('leitura-T1')).toHaveTextContent(
      'A maior parte dos cartões deste recorte está sem prioridade; nenhuma prioridade tem amostra suficiente',
    )
  })

  it('A1/A2/A3: blocos e P85 por prioridade, n<20 sem barra, n=20 publica, só papéis como donos', async () => {
    renderizarApp('/tatico', new FonteFixa({ T1: t1 }))
    const el = await cartao('T1')
    expect(await within(el).findByTestId('amostra-insuficiente-T1-critica')).toHaveTextContent(
      'Amostra insuficiente (12 de 20 itens mínimos)',
    )
    expect(within(el).getByTestId('amostra-insuficiente-T1-baixa')).toBeInTheDocument()
    expect(within(el).getByTestId('leitura-T1')).toHaveTextContent(
      'mediana do lead time é 38 dias úteis',
    )
    expect(within(el).getByRole('tab', { name: /Alta/ })).toBeInTheDocument()
    expect(within(el).getByText('Validação do negócio')).toBeInTheDocument()
    // a soma das medianas (38) só aparece como mediana do total quando for o P50 real; nunca como "soma"
    await userEvent.click(within(el).getByRole('button', { name: 'Ver como tabela' }))
    const tab = within(el).getByTestId('tabela-T1')
    expect(within(tab).getByText(/Média \(P85 do total: 60 dias úteis\)/)).toBeInTheDocument()
    expect(within(tab).queryByText(/Crítica/)).not.toBeInTheDocument()
    expect(el).toHaveTextContent('Leia junto com Demanda × capacidade (T4)')
    const faixa = within(el).getByTestId('sem-prioridade-T1')
    expect(faixa).toHaveTextContent('Sem prioridade (BusinessMap): 445 de 900 entregues (49%).')
    expect(faixa).toHaveTextContent('só não têm prioridade preenchida no BusinessMap')
    expect(faixa).toHaveAttribute('data-destaque', 'sim') // 49% >= 20%: destaque com ícone e texto
    expect(el).not.toHaveTextContent(/etiqueta|classe de serviço/i)
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
  semPrioridade: { n: 1, total: 120 },
  classes: [
    classeT2('Média', 54, 64, 'fora'),
    classeT2('Alta', 55, 64, 'dentro'),
    {
      classe: 'Crítica',
      sle: null,
      n: 10,
      dentroDoSle: { status: 'insuficiente' as const, k: 8, n: 10, minimo: 20 as const },
      statusMeta: 'sem-referencia',
      estouros: { total: 0, porEtapa: [] },
    },
    {
      classe: 'Baixa',
      sle: null,
      n: 30,
      dentroDoSle: null,
      statusMeta: 'sem-referencia',
      estouros: { total: 0, porEtapa: [] },
    },
  ],
}

describe('T2 aderência ao SLE', () => {
  it('B1: sem nenhuma prioridade publicável e a faixa sendo a maioria, a leitura diz que a maior parte está sem prioridade', async () => {
    const dto = { ...t2, semPrioridade: { n: 60, total: 100 }, classes: [] }
    renderizarApp('/tatico', new FonteFixa({ T2: dto }))
    const el = await cartao('T2')
    expect(await within(el).findByTestId('leitura-T2')).toHaveTextContent(
      'A maior parte dos cartões deste recorte está sem prioridade; nenhuma prioridade tem amostra suficiente',
    )
  })

  it('B1/B2/B3', async () => {
    renderizarApp('/tatico', new FonteFixa({ T2: t2 }))
    const el = await cartao('T2')
    const padrao = await within(el).findByTestId('t2-Média')
    expect(padrao).toHaveTextContent('84,4%')
    expect(padrao).toHaveTextContent('Fora da meta')
    expect(within(el).getByTestId('t2-Alta')).toHaveTextContent('Dentro da meta')
    expect(within(el).getByTestId('t2-Baixa')).toHaveTextContent(
      'SLE ainda não definido para esta prioridade.',
    )
    expect(within(el).getByTestId('t2-Crítica')).toHaveTextContent(
      'Amostra insuficiente (10 de 20 itens mínimos). SLE: não publicado.',
    )
    expect(padrao).toHaveTextContent('publicado em 02/03/2026')
    const mapa = within(el).getByRole('region', { name: /Estouros do SLE/ })
    expect(within(mapa).getByRole('row', { name: /Média/ })).toHaveTextContent('10')
    const faixa = within(el).getByTestId('sem-prioridade-T2')
    expect(faixa).toHaveTextContent('Sem prioridade (BusinessMap): 1 de 120 entregues (1%).')
    expect(faixa).toHaveAttribute('data-destaque', 'nao')
  })
})

const nat = (natureza: string, pct: number | null, quantidade = 30) => ({
  natureza,
  abaixoDe20: pct === null,
  itens: { quantidade, pct },
  tempo: { quantidade: 80, pct },
})
const t3 = (st: 'ok' | 'insuficiente') => ({
  ...COMUM,
  status: st,
  naturezas: [
    nat('Produto', 51),
    nat('Habilitador', 30),
    nat('Correção em produção', 19),
    nat('Saúde técnica e de processo', null, 4),
  ],
})

describe('T3 alocação', () => {
  it('E7.496: quatro fatias, só a divisão realizada, sem acordado, desvio nem selo', async () => {
    renderizarApp('/tatico', new FonteFixa({ T3: t3('ok') }))
    const el = await cartao('T3')
    expect((await within(el).findAllByText(/^realizado 51/)).length).toBeGreaterThan(0)
    for (const f of [
      'Produto',
      'Habilitador',
      'Correção em produção',
      'Saúde técnica e de processo',
    ])
      expect(within(el).getAllByText(new RegExp(`^${f}`)).length).toBeGreaterThan(0)
    expect(within(el).queryByText(/acordado/i)).not.toBeInTheDocument()
    expect(within(el).queryByText(/desvio [+\d-]/i)).not.toBeInTheDocument()
    expect(within(el).queryByText(/Desvio acima/)).not.toBeInTheDocument()
    expect(within(el).getByRole('radio', { name: 'Itens' })).toBeChecked()
  })
  it('fatia com menos de 20 entregas mostra a contagem e "menos de 20 entregas", sem percentual', async () => {
    renderizarApp('/tatico', new FonteFixa({ T3: t3('ok') }))
    const el = await cartao('T3')
    expect(await within(el).findByText(/^4 itens · menos de 20 entregas$/)).toBeInTheDocument()
    expect(within(el).getByTestId('leitura-T3')).toHaveTextContent('abaixo de 100%')
  })
  it('alternador Tempo em execução troca a unidade; sem 20 itens no total, a fatia não cita "menos de 20 entregas" quando não está abaixo', async () => {
    renderizarApp('/tatico', new FonteFixa({ T3: t3('ok') }))
    const el = await cartao('T3')
    await userEvent.click(await within(el).findByRole('radio', { name: 'Tempo em execução' }))
    expect((await within(el).findAllByText(/dias úteis em execução/)).length).toBeGreaterThan(0)
  })
  it('todas as fatias com 20 ou mais entregas: a leitura não cita fatia abaixo de 20', async () => {
    const base = t3('ok')
    const naturezas = base.naturezas.map((n) => nat(n.natureza, 25, 30))
    renderizarApp('/tatico', new FonteFixa({ T3: { ...base, naturezas } }))
    const el = await cartao('T3')
    await within(el).findAllByText(/^realizado 25/)
    expect(within(el).getByTestId('leitura-T3')).not.toHaveTextContent('menos de 20 entregas')
  })
  it('total >= 20 com todas as fatias abaixo de 20: uma frase no lugar do gráfico vazio', async () => {
    const base = t3('ok')
    const naturezas = base.naturezas.map((n) => nat(n.natureza, null, 5))
    renderizarApp('/tatico', new FonteFixa({ T3: { ...base, naturezas } }))
    const el = await cartao('T3')
    expect(await within(el).findByTestId('t3-sem-fatia')).toHaveTextContent(
      'Nenhuma fatia chegou a 20 entregas',
    )
    expect(within(el).queryByRole('img')).not.toBeInTheDocument()
  })
  it('total insuficiente com fatia não marcada abaixo de 20: só a contagem', async () => {
    const base = t3('insuficiente')
    const naturezas = base.naturezas.map((n) => ({
      ...nat(n.natureza, null, 3),
      abaixoDe20: false,
    }))
    renderizarApp('/tatico', new FonteFixa({ T3: { ...base, naturezas } }))
    const el = await cartao('T3')
    expect((await within(el).findAllByText(/^3 itens$/)).length).toBe(4)
  })
  it('percentuais somem com menos de 20 itens no total (T-N20)', async () => {
    const base = t3('insuficiente')
    const naturezas = base.naturezas.map((n) => nat(n.natureza, null, 3))
    renderizarApp('/tatico', new FonteFixa({ T3: { ...base, naturezas } }))
    const el = await cartao('T3')
    expect(await within(el).findByTestId('amostra-insuficiente-T3')).toBeInTheDocument()
    expect(el).not.toHaveTextContent('realizado')
    expect(within(el).getAllByText(/^3 itens · menos de 20 entregas$/).length).toBe(4)
  })
})

const faixa = (m: number) => ({ min: 1, max: 20, mediana: m, media: m })
const semanas = [{ semana: '2026-09-28', emAndamento: false, chegada: 5, vazao: 4 }]
const t4 = {
  ...COMUM,
  semPrioridade: { n: 0, total: 80 },
  classes: [
    {
      classe: 'Média',
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
      classe: 'Crítica',
      n: 16,
      estatistica: insuf(16),
      statusMeta: 'sem-referencia' as const,
      totais: { chegadas: 9, saidas: 7, backlog: 4 },
      semanas: [{ semana: '2026-09-28', emAndamento: false, chegada: 9, vazao: 7 }],
    },
    {
      classe: 'Alta',
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
  it('D1/D2: sempre por prioridade, razão indefinida sem chegada, contagens abaixo de 20', async () => {
    renderizarApp('/tatico', new FonteFixa({ T4: t4 }))
    const el = await cartao('T4')
    const tab = await within(el).findByTestId('tabela-T4-classes')
    expect(
      within(within(tab).getByRole('row', { name: /Média/ })).getByText('1,01'),
    ).toBeInTheDocument()
    expect(within(tab).getByRole('row', { name: /Alta/ })).toHaveTextContent('Indefinida')
    expect(within(tab).getByRole('row', { name: /Crítica/ })).toHaveTextContent('Chegadas: 9')
    expect(within(tab).getByRole('row', { name: /Crítica/ })).toHaveTextContent(
      '16 de 20 itens mínimos',
    )
    expect(within(tab).queryByRole('row', { name: /Total|Todas/ })).not.toBeInTheDocument()
    expect(within(el).getByTestId('leitura-T4')).toHaveTextContent(
      'A fila cresce: chegam mais itens do que saem',
    )
    expect(el).not.toHaveTextContent(/semanas para zerar fila/i)
    const faixa = within(el).getByTestId('sem-prioridade-T4')
    expect(faixa).toHaveTextContent(
      'Sem prioridade (BusinessMap): nenhum cartão sem prioridade neste recorte.',
    )
    expect(faixa).not.toHaveTextContent('A chegada total é maior que a soma das prioridades acima.')
    // a faixa vem logo depois da tabela de razão (M2), não depois do seletor
    expect(
      within(el).getByTestId('tabela-T4-classes').compareDocumentPosition(faixa) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
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
  it('E7.498: sem limite de frentes, sem comparação nem selo de limite', async () => {
    const base = t7(27)
    renderizarApp(
      '/tatico',
      new FonteFixa({
        T7: { ...base, kpis: { ...base.kpis, limiteFrentes: null, acimaDoLimite: null } },
      }),
    )
    const el = await cartao('T7')
    expect(await within(el).findByText('Sem limite de frentes')).toBeInTheDocument()
    expect(within(el).queryByText('sem limite')).not.toBeInTheDocument()
    expect(within(el).getByText('projetos com frentes em andamento')).toBeInTheDocument()
    expect(within(el).queryByText(/não definido/)).not.toBeInTheDocument()
    expect(within(el).queryByText('Sem meta numérica')).not.toBeInTheDocument()
    expect(within(el).queryByText('Acima do limite')).not.toBeInTheDocument()
    expect(within(el).queryByText('Dentro do limite')).not.toBeInTheDocument()
  })
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
