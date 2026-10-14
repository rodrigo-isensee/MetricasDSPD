import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderizarApp } from '@/test/helpers'
import { resumirEspera, textoAlerta, textoIndicador, type SegmentoEI } from './textos'

const janela = { inicio: '2026-07-18', fim: '2026-10-09' }
const seg = (
  rotulo: string,
  n: number,
  indicePct: number | null,
  cliente = 45,
  time = 18,
): SegmentoEI => ({
  chave: rotulo.toLowerCase(),
  rotulo,
  estatistica:
    indicePct === null
      ? { status: 'insuficiente', n, minimo: 20, janela }
      : { status: 'ok', n, janela, valor: { cliente, time, indicePct, acimaDe50: indicePct > 50 } },
})

describe('Q1: espera invisível na Visão geral, um segmento nomeado por nível', () => {
  it('escolhe o de maior índice entre os com n >= 20; o de n < 20 não concorre', () => {
    const r = resumirEspera([
      seg('Incidente', 31, 60),
      seg('Requisição', 25, 40),
      seg('Melhoria', 12, null),
    ])
    expect(r.escolhido?.rotulo).toBe('Incidente')
    expect(r.escolhido?.est.n).toBe(31)
    expect(r.maiorInsuficiente).toBeNull()
  })

  it('segmento de índice maior mas com n < 20 nunca é escolhido', () => {
    const r = resumirEspera([seg('Incidente', 31, 60), seg('Melhoria', 19, null)])
    expect(r.escolhido?.rotulo).toBe('Incidente')
  })

  it('sem nenhum segmento com amostra: nada é escolhido, e só se informa o maior n', () => {
    const r = resumirEspera([seg('Melhoria', 3, null), seg('Iniciativa', 7, null)])
    expect(r.escolhido).toBeNull()
    expect(r.maiorInsuficiente).toEqual({ rotulo: 'Iniciativa', n: 7 })
  })

  it('FL2 sem segmentação: um segmento sem nome', () => {
    const r = resumirEspera([{ ...seg('x', 27, 64), chave: null, rotulo: null }])
    expect(r.escolhido?.rotulo).toBeNull()
  })
})

describe('textos', () => {
  it('indicador insuficiente nunca mostra número', () => {
    const t = textoIndicador({
      metrica: 'S2',
      codigo: 'S2_P1',
      valor: null,
      de: 12,
      base: { n: 12, unidade: 'chamados P1' },
      status: 'insuficiente',
      amostra: { n: 12, minimo: 20 },
    })
    expect(t).toBe('Amostra insuficiente (12 de 20 itens mínimos)')
  })
  it('alerta com "k de n"', () => {
    expect(
      textoAlerta({
        nivel: 'sustentacao',
        metrica: 'S2',
        ancora: 's2',
        codigo: 'S2_ABAIXO_90',
        valor: 1,
        de: 5,
      }),
    ).toBe('Aderência ao SLA abaixo de 90% em 1 de 5 prioridades')
  })
})

describe('tela Visão geral', () => {
  it('mostra atenção, quatro níveis (máx. 3 indicadores), espera invisível e por reunião, sem filtros', async () => {
    renderizarApp('/')
    const faixa = await screen.findByTestId('faixa-atencao', undefined, { timeout: 8000 })
    expect(within(faixa).getAllByRole('listitem').length).toBeLessThanOrEqual(6)
    for (const n of ['operacional', 'tatico', 'estrategico', 'sustentacao']) {
      const c = await screen.findByTestId(`nivel-${n}`)
      expect(within(c).getAllByRole('listitem').length).toBeLessThanOrEqual(3)
      expect(within(c).getByRole('link', { name: /^Abrir / })).toBeInTheDocument()
      expect(within(c).getByText(/^Fonte: /)).toBeInTheDocument()
    }
    expect(
      within(screen.getByTestId('nivel-sustentacao')).getByText('Fonte: Acelerato'),
    ).toBeInTheDocument()
    expect(
      within(screen.getByTestId('nivel-operacional')).getByText('Fonte: BusinessMap'),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('filtro-equipe')).toBeNull()
    const recorte = screen.getByTestId('recorte-visao-geral')
    expect(recorte).toHaveTextContent('Consolidado de todas as equipes · últimas 12 semanas')
    expect(recorte.textContent).toMatch(/\d{2}\/\d{2}\/\d{4} a \d{2}\/\d{2}\/\d{4}/)
    expect(screen.getByText(/o sistema não compara equipes/)).toBeInTheDocument()
    expect(screen.queryByText(/ranking/i)).toBeNull()
    expect(screen.getByRole('link', { name: 'Daily de fluxo' })).toHaveAttribute(
      'href',
      '/operacional?cadencia=diaria',
    )
    // Nenhum link da Visão geral leva ao Resumo: o destino de cada nível é uma visão de detalhe.
    expect(
      within(screen.getByTestId('nivel-sustentacao')).getByRole('link', {
        name: 'Abrir Operacional · Sustentação',
      }),
    ).toHaveAttribute('href', '/operacional?cadencia=sustentacao')
    expect(
      within(screen.getByTestId('nivel-operacional')).getByRole('link', {
        name: 'Abrir Operacional',
      }),
    ).toHaveAttribute('href', '/operacional?cadencia=diaria')
    const reunioes = within(screen.getByRole('region', { name: 'Por reunião' })).getAllByRole(
      'link',
    )
    expect(reunioes.map((l) => l.textContent).slice(0, 3)).toEqual([
      'Daily de fluxo',
      'Revisão de fluxo semanal',
      'Revisão da sustentação · semanal',
    ])
    expect(screen.getByRole('link', { name: 'Revisão da sustentação · semanal' })).toHaveAttribute(
      'href',
      '/operacional?cadencia=sustentacao',
    )
    for (const l of screen.getByRole('main').querySelectorAll('a[href^="/operacional"]'))
      expect(l.getAttribute('href'), l.textContent).toMatch(/cadencia=(diaria|semanal|sustentacao)/)
  })

  it('itens de atenção levam ao cartão do painel, sem filtro nem parâmetro mock', async () => {
    renderizarApp('/')
    const faixa = await screen.findByTestId('faixa-atencao', undefined, { timeout: 8000 })
    const links = within(faixa).getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
    for (const l of links) {
      expect(l.getAttribute('href')).toMatch(
        /^\/(operacional\?cadencia=(diaria|semanal|sustentacao)|tatico|estrategico)#[a-z0-9]+$/,
      )
      expect(l.getAttribute('href')).not.toContain('mock')
    }
  })

  it('espera invisível: Operacional com um tipo nomeado e links "Ver todos os tipos"; FL3 insuficiente; Sustentação separada', async () => {
    renderizarApp('/')
    const ei = await screen.findByTestId('ei-resumo', undefined, { timeout: 8000 })
    await waitFor(() => expect(within(ei).getByTestId('ei-resumo-fl1')).toBeInTheDocument())
    const fl1 = within(ei).getByTestId('ei-resumo-fl1')
    // mock: Requisição (54%) tem o maior índice entre os tipos com n >= 20
    expect(fl1).toHaveTextContent(
      /Requisição: cliente .* time .* espera invisível 54% \(79 demandas\)/,
    )
    expect(within(fl1).getByRole('link', { name: 'Ver todos os tipos' })).toHaveAttribute(
      'href',
      '/operacional?cadencia=semanal#ei-fl1',
    )
    const rota = (id: string) => within(within(ei).getByTestId(id)).getByRole('link')
    expect(rota('ei-resumo-fl2')).toHaveAttribute('href', '/tatico#ei-fl2')
    expect(rota('ei-resumo-fl3')).toHaveAttribute('href', '/estrategico#ei-fl3')
    expect(rota('ei-resumo-sust')).toHaveAttribute(
      'href',
      '/operacional?cadencia=sustentacao#ei-sust',
    )
    expect(within(ei).getByTestId('ei-resumo-fl3')).toHaveTextContent('Amostra insuficiente')
    expect(within(ei).getByTestId('ei-resumo-fl3')).not.toHaveTextContent('%')
    expect(within(ei).getByTestId('ei-resumo-fl2')).toHaveTextContent('64%')
    expect(within(ei).getByTestId('ei-fonte-sust')).toHaveTextContent(
      'Fonte diferente (Acelerato). Não comparável com os níveis acima.',
    )
    expect(within(ei).getByTestId('ei-resumo-sust')).toHaveTextContent(/h úteis/)
  })

  it('erro de carregamento: mensagem e "Tentar de novo" recupera a tela', async () => {
    renderizarApp('/?mock=erro-uma-vez:visao-geral')
    const alerta = await screen.findByRole('alert', undefined, { timeout: 8000 })
    expect(alerta).toHaveTextContent('Não foi possível carregar a visão geral')
    await userEvent.click(within(alerta).getByRole('button', { name: 'Tentar de novo' }))
    expect(
      await screen.findByTestId('faixa-atencao', undefined, { timeout: 8000 }),
    ).toBeInTheDocument()
  })

  it('mock=carregando mostra o esqueleto e nenhum número', async () => {
    renderizarApp('/?mock=carregando')
    expect(await screen.findByTestId('estado-carregando-VISAO_GERAL')).toBeInTheDocument()
    expect(screen.queryByTestId('faixa-atencao')).toBeNull()
  })
})
