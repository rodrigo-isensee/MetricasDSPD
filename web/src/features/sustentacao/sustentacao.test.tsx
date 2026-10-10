import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderizarApp } from '@/test/helpers'
import { fmtTempoPrioridade, fmtHU } from './formatar'

async function cartao(codigo: string, url = '/sustentacao') {
  const r = renderizarApp(url)
  const el = await screen.findByTestId(`metrica-${codigo}`)
  await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
  return { ...r, el: el }
}

describe('formatação da Sustentação (J2)', () => {
  it('P1 a P3 em h úteis; P4 e P5 em dias úteis; nunca minutos', () => {
    expect(fmtTempoPrioridade(0.25, 'P1')).toBe('0,25 h úteis')
    expect(fmtTempoPrioridade(16, 'P3')).toBe('16 h úteis')
    expect(fmtTempoPrioridade(4, 'P4')).toBe('0,5 dia útil')
    expect(fmtTempoPrioridade(8, 'P5')).toBe('1 dia útil')
    expect(fmtTempoPrioridade(12, 'P4')).toBe('1,5 dias úteis')
    expect(fmtHU(0.25)).toBe('0,25 h úteis')
  })
})

describe('painel Sustentação', () => {
  it('mostra os sete cartões com fonte Acelerato e granularidade chamado, e nada do BusinessMap', async () => {
    renderizarApp('/sustentacao')
    for (const c of ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7']) {
      const el = await screen.findByTestId(`metrica-${c}`)
      await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
      expect(el).toHaveAttribute('id', c.toLowerCase())
      expect(within(el).getByText('Fonte: Acelerato')).toBeInTheDocument()
      expect(within(el).getByText('Granularidade: chamado')).toBeInTheDocument()
      expect(within(el).queryByText(/BusinessMap/)).toBeNull()
    }
    expect(screen.queryByText(/minutos|\bmin\b|horas corridas/)).toBeNull()
  })

  it('S1: sempre por prioridade; P1 com amostra insuficiente sem barra; exceções à parte; alvo com status em ícone e texto', async () => {
    const { el } = await cartao('S1')
    const mttr = within(el).getByTestId('s1-mttr')
    expect(within(mttr).getByTestId('s1-insuficiente-mttr-p1')).toHaveTextContent(
      'Amostra insuficiente (9 de 20 itens mínimos)',
    )
    expect(within(el).getByTestId('s1-excecoes')).toHaveTextContent(
      /\d+ chamados com exceção de registro posterior \(fora/,
    )
    const tabela = within(mttr).getByTestId('tabela-S1-MTTR-detalhe')
    expect(within(tabela).getByRole('row', { name: /^P2/ })).toHaveTextContent(
      'Mediana dentro do alvo',
    )
    expect(within(tabela).getByRole('row', { name: /^P4/ })).toHaveTextContent(/dias? úteis/)
    expect(within(tabela).getByRole('row', { name: /^P1/ })).toHaveTextContent(
      'Amostra insuficiente',
    )
    // a média só aparece ao lado da mediana, nunca sozinha
    expect(
      within(tabela).getByRole('columnheader', { name: 'Média (referência)' }),
    ).toBeInTheDocument()
    expect(within(tabela).getByRole('columnheader', { name: 'Mediana' })).toBeInTheDocument()
  })

  it('S2: primeiro atendimento e restauração separados, com "k de n" e status por célula', async () => {
    const { el } = await cartao('S2')
    const t = within(el).getByTestId('tabela-S2-detalhe')
    const p2 = within(t).getByRole('row', { name: /^P2/ })
    expect(p2).toHaveTextContent('88,9% · 144 de 162')
    expect(p2).toHaveTextContent('73,5% · 119 de 162')
    expect(p2).toHaveTextContent('Abaixo de 90%')
    expect(within(t).getByRole('row', { name: /^P5/ })).toHaveTextContent('Acima de 90%')
  })

  it('S2: célula com menos de 20 chamados perde o percentual e mantém "k de n"', async () => {
    const { el } = await cartao('S2', '/sustentacao?periodo=4s')
    const t = within(el).getByTestId('tabela-S2-detalhe')
    const insuf = within(t).getAllByText(/Amostra insuficiente \(\d+ de 20 itens mínimos\)/)
    expect(insuf.length).toBeGreaterThan(0)
    const linha = insuf[0]?.closest('tr') as HTMLElement
    expect(linha.textContent).toMatch(/\d+ de \d+/)
    expect(linha.textContent).not.toMatch(/%/)
  })

  it('S3: absoluto por padrão e proporção pela URL, com ajustes manuais na tabela', async () => {
    const { el, roteador } = await cartao('S3')
    expect(within(el).getByRole('button', { name: 'Absoluto' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(within(el).getByTestId('tabela-S3-resumo')).toHaveTextContent(
      'Ajustes manuais de prioridade no mês (S7)',
    )
    await userEvent.click(within(el).getByRole('button', { name: 'Proporção' }))
    expect(roteador.state.location.search).toContain('s3=proporcao')
    expect(within(el).getByRole('button', { name: 'Proporção' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('S4: uma prioridade por vez, sem aba "Todos"; célula prioridade x nível com menos de 20 não mostra tempo', async () => {
    const { el } = await cartao('S4')
    const abas = within(el).getAllByRole('tab')
    expect(abas.map((a) => a.textContent.replace(/\s*\(.*$/, ''))).toEqual([
      'P1',
      'P2',
      'P3',
      'P4',
      'P5',
    ])
    expect(within(el).queryByRole('tab', { name: /todos/i })).toBeNull()
    await userEvent.click(within(el).getByRole('tab', { name: /^P2/ }))
    const t = within(el).getByTestId('tabela-S4-detalhe')
    expect(within(t).getByRole('row', { name: /^N1/ })).toHaveTextContent(/h úteis/)
    expect(within(t).getByRole('row', { name: /^N3/ })).toHaveTextContent('Amostra insuficiente')
    expect(within(t).getByRole('row', { name: /^Fornecedor/ })).toHaveTextContent('não se aplica')
    expect(
      within(el).getByText('Leia ao lado de S1 (tempo) e da reabertura; sem meta isolada.'),
    ).toBeInTheDocument()
    expect(within(el).queryByText(/ranking/i)).toBeNull()
  })

  it('S5: cinco motivos do domínio fechado e alternador de evolução', async () => {
    const { el, roteador } = await cartao('S5')
    const t = within(el).getByTestId('tabela-S5-detalhe')
    expect(within(t).getAllByRole('row')).toHaveLength(6)
    expect(
      within(t).getByText(/Sem conhecimento técnico no N1 \(Foco da meta\)/),
    ).toBeInTheDocument()
    await userEvent.click(within(el).getByRole('button', { name: 'Evolução mensal' }))
    expect(roteador.state.location.search).toContain('s5=evolucao')
  })

  it('S6: exatamente cinco motivos (a vírgula faz parte do rótulo), "Não informado" à parte e taxa de contorno', async () => {
    const { el } = await cartao('S6')
    const t = within(el).getByTestId('tabela-S6-detalhe')
    const linhas = within(t).getAllByRole('row').slice(1)
    expect(linhas).toHaveLength(6)
    expect(
      within(t).getByRole('row', { name: /Reclassificado, não é incidente/ }),
    ).toBeInTheDocument()
    expect(within(t).getByRole('row', { name: /Não informado/ })).toBeInTheDocument()
    expect(within(el).getByTestId('s6-taxa-contorno')).toHaveTextContent('Taxa de contorno')
  })

  it('S7: dois blocos separados (prioridade e tipo), com "k de n" de justificativa e status só nele', async () => {
    const { el } = await cartao('S7')
    expect(within(el).getByTestId('s7-prioridade')).toBeInTheDocument()
    expect(within(el).getByTestId('s7-tipo')).toBeInTheDocument()
    expect(within(el).getByTestId('s7-justificados')).toHaveTextContent(/Justificados: \d+ de \d+/)
    expect(within(within(el).getByTestId('s7-tipo')).queryByText(/justificad/i)).toBeNull()
  })

  it('erro em um cartão não derruba os outros e "Tentar de novo" o recupera', async () => {
    renderizarApp('/sustentacao?mock=erro-uma-vez:s2')
    const s2 = await screen.findByTestId('metrica-S2')
    await waitFor(() => expect(s2).toHaveAttribute('data-estado', 'erro'), { timeout: 8000 })
    const s3 = await screen.findByTestId('metrica-S3')
    await waitFor(() => expect(s3).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
    await userEvent.click(within(s2).getByRole('button', { name: /Tentar de novo/ }))
    await waitFor(() => expect(s2).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
  })

  it('mock=vazio: cada cartão mostra o estado vazio com orientação', async () => {
    renderizarApp('/sustentacao?mock=vazio')
    expect(
      await screen.findByTestId('estado-vazio-S1', undefined, { timeout: 8000 }),
    ).toBeInTheDocument()
    expect(
      await screen.findByTestId('estado-vazio-S4', undefined, { timeout: 8000 }),
    ).toBeInTheDocument()
  })
})
