import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderizarApp } from '@/test/helpers'
import { COMUM, FonteFixa, J, JANELA, insuf, ok } from './testes/fonteFixa'

const cartao = async (c: string) => {
  const el = await screen.findByTestId(`metrica-${c}`)
  await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'), { timeout: 4000 })
  return el
}
const comTabela = async (c: string) => {
  const el = await cartao(c)
  await userEvent.click(await within(el).findByRole('button', { name: 'Ver como tabela' }))
  return el
}
const SEM_PESSOA = /respons[aá]vel|assignee|atribu[ií]do|ranking/i

const item = (id: string, o: Record<string, unknown> = {}) => ({
  cardId: id,
  titulo: `Titulo ${id}`,
  tipo: 'Melhoria',
  etapa: 'Execução',
  idadeDiasUteis: 5,
  semMoverHaDiasUteis: 1,
  situacao: 'dentro',
  bloqueioMotivo: null,
  ...o,
})
const o2 = (itens: unknown[], referencia: unknown, extra: Record<string, unknown> = {}) => ({
  ...COMUM,
  janelaPercentis: JANELA,
  etapas: ['Fila', 'Execução'],
  agrupadoPorColuna: false,
  tipos: [{ tipo: 'Melhoria', abertos: itens.length, acimaP85: 0, acimaP95: 1, referencia }],
  tipoSugerido: 'Melhoria',
  itens,
  acimaP95: 1,
  statusMeta: 'fora',
  ...extra,
})

describe('Operacional diária: ordem, pergunta e link', () => {
  it('abre na cadência diária: ordem O2, Bloqueados, O1, pergunta da daily e link para a semanal', async () => {
    renderizarApp('/operacional')
    await cartao('O2')
    const ids = screen
      .getAllByTestId(/^metrica-/)
      .map((e) => e.getAttribute('data-testid')?.replace('metrica-', ''))
    expect(ids).toEqual(['O2', 'Bloqueados', 'O1'])
    expect(screen.getByTestId('pergunta-cadencia')).toHaveTextContent(
      'Qual item mais velho não andou desde ontem?',
    )
    const link = screen.getByRole('link', { name: /Ver também a visão semanal/ })
    expect(link.getAttribute('href')).toContain('cadencia=semanal')
    expect(link.getAttribute('href')).not.toContain('mock')
  })

  it('alternar para Semanal grava a URL e mostra O3 e O4, sem os cartões da daily', async () => {
    const { roteador } = renderizarApp('/operacional')
    await cartao('O2')
    await userEvent.click(screen.getByRole('radio', { name: 'Semanal' }))
    await cartao('O3')
    expect(roteador.state.location.search).toContain('cadencia=semanal')
    expect(screen.queryByTestId('metrica-O2')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Tempo' })).toBeInTheDocument()
  })
})

describe('O1 WIP e limite (A1, A2)', () => {
  const dto = (porColuna: unknown) => ({
    ...COMUM,
    hoje: { total: 4, limite: 3, bloqueados: 1, acimaDoLimite: 1 },
    porColuna,
    porTipoColuna: [
      { tipoColuna: 'fila', itens: 1, bloqueados: 0 },
      { tipoColuna: 'execucao', itens: 3, bloqueados: 1 },
    ],
    equipesConsideradas: 2,
    serie: [{ data: '2026-10-08', wip: 4, bloqueados: 1, limite: 3, acimaDoLimite: true }],
    diasDentroDoLimite: { status: 'insuficiente', k: 0, n: 1, minimo: 20 },
    statusMeta: 'fora',
  })
  it('A1/A2: bloqueado conta no WIP; excedido é dito em texto e no status, não só em cor', async () => {
    renderizarApp(
      '/operacional?equipe=fluig',
      new FonteFixa({
        O1: dto([
          { coluna: 'Execução', tipoColuna: 'execucao', itens: 3, bloqueados: 1, limite: 3 },
          { coluna: 'Aguardando QA', tipoColuna: 'fila', itens: 1, bloqueados: 0, limite: null },
        ]),
      }),
    )
    const el = await cartao('O1')
    expect(within(el).getByTestId('leitura-O1')).toHaveTextContent(
      'Hoje há 4 itens em progresso para um limite de 3 (1 acima), 1 deles bloqueado',
    )
    expect(within(el).getByText('Fora da meta')).toBeInTheDocument()
    await userEvent.click(within(el).getByRole('button', { name: 'Ver como tabela' }))
    const tab = within(el).getAllByRole('table')[0] as HTMLElement
    expect(tab).toHaveTextContent('Fila · Aguardando QA')
    expect(tab).toHaveTextContent('limite 3')
  })
  it('sem coluna única: "Fila" x "Execução" e a mensagem de selecionar uma equipe; "k de n dias" sem percentual', async () => {
    renderizarApp('/operacional', new FonteFixa({ O1: dto(null) }))
    const el = await cartao('O1')
    expect(within(el).getByTestId('o1-selecione-equipe')).toHaveTextContent(
      'Selecione uma equipe para ver por coluna. Limite somado de 2 equipes.',
    )
    expect(within(el).getByTestId('o1-dias-dentro')).toHaveTextContent('0 de 1')
    expect(within(el).getByTestId('o1-dias-dentro')).not.toHaveTextContent('%')
  })
})

describe('O2 idade (B1 a B3)', () => {
  const itens = [
    item('B', { idadeDiasUteis: 21, semMoverHaDiasUteis: 2, situacao: 'acima-p95', etapa: 'Fila' }),
    item('A', { idadeDiasUteis: 5, semMoverHaDiasUteis: 9 }),
    item('C', {
      idadeDiasUteis: 12,
      situacao: 'entre-p85-p95',
      bloqueioMotivo: 'Aguardando fornecedor',
    }),
  ]
  it('B3: ordem do mais velho ao mais novo, sinalização acima do P95, sem coluna de pessoa; ordena por "Sem mover há"', async () => {
    renderizarApp(
      '/operacional',
      new FonteFixa({ O2: o2(itens, ok(87, { p50: 4, p85: 9, p95: 15 })) }),
    )
    const lista = await screen.findByTestId('o2-lista')
    const nomes = () =>
      within(lista)
        .getAllByRole('row')
        .slice(1)
        .map((r) => r.textContent.slice(0, 8))
    expect(nomes()).toEqual(['B Titulo', 'C Titulo', 'A Titulo'].map((x) => x.slice(0, 8)))
    expect(lista).toHaveTextContent('Acima do P95 do tipo')
    expect(lista).toHaveTextContent('Aguardando fornecedor')
    expect(lista).not.toHaveTextContent(SEM_PESSOA)
    await userEvent.click(within(lista).getByRole('button', { name: 'Sem mover há' }))
    expect(within(lista).getAllByRole('row')[1]).toHaveTextContent('A Titulo')
    expect(screen.getByTestId('leitura-O2')).toHaveTextContent(
      '1 item está acima do P95 do seu tipo. O mais velho tem 21 dias úteis e está em "Fila"',
    )
  })
  it('B2: com menos de 20 concluídos no tipo, mostra "Amostra insuficiente", sem linhas de percentil, e a lista fica', async () => {
    renderizarApp('/operacional', new FonteFixa({ O2: o2(itens, insuf(12)) }))
    const el = await cartao('O2')
    expect(await within(el).findByTestId('amostra-insuficiente-O2')).toHaveTextContent(
      '12 de 20 itens mínimos',
    )
    expect(within(el).getByRole('tab', { name: /amostra insuficiente/ })).toBeInTheDocument()
    expect(within(el).getByTestId('o2-lista')).toHaveTextContent('Titulo A')
    await userEvent.click(within(el).getByRole('button', { name: 'Ver como tabela' }))
    expect(within(el).queryByText('P95')).not.toBeInTheDocument()
  })
})

describe('Bloqueados agora (E1)', () => {
  it('lista com motivo e "Bloqueado há", do mais antigo, sem responsável', async () => {
    const b = (id: string, ha: number, motivo: string) => ({
      cardId: id,
      titulo: `T${id}`,
      tipo: 'Melhoria',
      etapa: 'Execução',
      motivo,
      fornecedor: null,
      bloqueadoHaDiasUteis: ha,
    })
    renderizarApp(
      '/operacional',
      new FonteFixa({
        BLOQUEADOS: {
          ...COMUM,
          base: { n: 2, unidade: 'itens bloqueados', janela: J },
          itens: [b('1', 2, 'Janela de mudança'), b('2', 6, 'Aguardando fornecedor')],
        },
      }),
    )
    const el = await cartao('Bloqueados')
    expect(within(el).getByTestId('leitura-Bloqueados')).toHaveTextContent(
      '2 itens estão bloqueados. O mais antigo está bloqueado há 6 dias úteis por "Aguardando fornecedor"',
    )
    const linhas = within(el).getAllByRole('row').slice(1)
    expect(linhas[0]).toHaveTextContent('Aguardando fornecedor')
    expect(el).not.toHaveTextContent(SEM_PESSOA)
  })
  it('zero bloqueados é sucesso: "Nenhum item bloqueado hoje."', async () => {
    renderizarApp(
      '/operacional',
      new FonteFixa({
        BLOQUEADOS: { ...COMUM, base: { n: 0, unidade: 'itens bloqueados', janela: J }, itens: [] },
      }),
    )
    expect(await screen.findByTestId('bloqueados-nenhum')).toHaveTextContent(
      'Nenhum item bloqueado hoje.',
    )
  })
})

describe('Faixa "Pede atenção hoje"', () => {
  it('lista itens acima do P95, bloqueados e WIP acima do limite, cada um com link ao cartão', async () => {
    renderizarApp('/operacional')
    const faixa = await screen.findByTestId('faixa-atencao')
    await waitFor(() => expect(within(faixa).getAllByRole('link').length).toBeGreaterThan(0))
    for (const l of within(faixa).getAllByRole('link'))
      expect(l.getAttribute('href')).toMatch(/^#(o2|bloqueados|o1)$/)
  })
})

describe('O3 tempo de ciclo (C1 a C3)', () => {
  const classe = (tipo: string, n: number, est: unknown, pontos: unknown[] = []) => ({
    tipo,
    n,
    estatistica: est,
    pontos,
    serieP85: [{ semana: '2026-09-28', n, p85: n >= 20 ? 9 : null }],
    variacaoP85: {
      status: 'indisponivel',
      atual: null,
      anterior: null,
      variacaoPct: null,
      janelaAnterior: J,
    },
  })
  const pt = (id: string, c: number) => ({
    cardId: id,
    titulo: id,
    dataEntrega: '2026-09-30',
    cicloDiasUteis: c,
  })
  const dto = {
    ...COMUM,
    janelaPercentis: JANELA,
    classes: [
      classe('Melhoria', 20, ok(20, { p50: 4, p85: 9, p95: 15, media: 6 }), [
        pt('x1', 3),
        pt('x2', 20),
      ]),
      classe('Incidente', 19, insuf(19), [pt('i1', 2)]),
    ],
  }
  it('C1/C2/C3: n=20 publica P50/P85/P95 e nunca a média; n=19 só pontos; uma classe por vez', async () => {
    renderizarApp('/operacional?cadencia=semanal', new FonteFixa({ O3: dto }))
    const el = await cartao('O3')
    expect(within(el).getByTestId('leitura-O3')).toHaveTextContent(
      'Melhoria: 85% ficam prontos em até 9 dias úteis; metade em até 4 dias úteis. 1 item passou do P95.',
    )
    expect(within(el).queryByText(/^m[eé]dia/i)).not.toBeInTheDocument()
    expect(within(el).getByText('50% em até 4 dias úteis')).toBeInTheDocument()
    await userEvent.click(within(el).getByRole('tab', { name: /Incidente/ }))
    expect(await within(el).findByTestId('amostra-insuficiente-O3')).toHaveTextContent(
      '19 de 20 itens mínimos',
    )
    expect(within(el).queryByText(/50% em até/)).not.toBeInTheDocument()
    expect(within(el).getAllByRole('tab').length).toBe(2)
  })
})

describe('O4 na cadência semanal (D2)', () => {
  it('semana sem entregas aparece como 0 na tabela', async () => {
    renderizarApp(
      '/operacional?cadencia=semanal',
      new FonteFixa({
        O4: {
          ...COMUM,
          semanas: [
            { semana: '2026-09-21', itens: 0, emAndamento: false, porTipo: [] },
            { semana: '2026-09-28', itens: 4, emAndamento: true, porTipo: [] },
          ],
          janelaFaixa: J,
          faixa: insuf(4),
        },
      }),
    )
    const el = await comTabela('O4')
    expect(within(el).getAllByRole('row')[1]).toHaveTextContent('0')
  })
})
