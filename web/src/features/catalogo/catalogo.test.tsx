import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CHAVE_PREFERENCIAS } from '@metricas-dspd/contratos'
import { renderizarApp } from '@/test/helpers'
import { linhasDoCatalogo } from './linhas'

describe('Catálogo de métricas (/metricas)', () => {
  it('lista 53 linhas (45 do briefing + a PV1 + 3 níveis extras de espera invisível; 21 complementares), espera invisível uma por nível', () => {
    const l = linhasDoCatalogo()
    expect(l).toHaveLength(53)
    expect(l.filter((x) => x.grupo === 'Complementar')).toHaveLength(21)
    const ei = l.filter((x) => x.codigo === 'EI')
    expect(ei.map((x) => [x.nome, x.painelRotulo, x.fonte, x.destino])).toEqual([
      [
        'Espera invisível · Operacional',
        'Operacional',
        'BusinessMap',
        '/operacional?cadencia=semanal#ei-fl1',
      ],
      ['Espera invisível · Tático', 'Tático', 'BusinessMap', '/tatico#ei-fl2'],
      ['Espera invisível · Estratégico', 'Estratégico', 'BusinessMap', '/estrategico#ei-fl3'],
      [
        'Espera invisível · Sustentação',
        'Operacional · Sustentação',
        'Acelerato',
        '/operacional?cadencia=sustentacao#ei-sust',
      ],
    ])
    expect(l.some((x) => (x.painel as string) === 'espera-invisivel')).toBe(false)
    expect(l.some((x) => x.codigo === 'BLOQUEADOS')).toBe(false)
    const pv1 = l.find((x) => x.codigo === 'PV1')
    expect(pv1).toMatchObject({
      fonte: 'Pesquisa de percepção',
      grupo: 'Núcleo',
      destino: '/operacional?cadencia=sustentacao#pv1',
    })
  })

  it('"Ir ao painel" leva ao cartão da métrica, no núcleo também (IS-005)', () => {
    const l = linhasDoCatalogo()
    expect(l.filter((x) => !x.destino.includes('#')).map((x) => x.codigo)).toEqual([])
    const o3 = l.find((x) => x.codigo === 'O3')
    expect(o3?.destino).toBe('/operacional?cadencia=semanal#o3')
    expect(l.find((x) => x.codigo === 'T1')?.destino).toBe('/tatico#t1')
    // a faixa do dia existe só na visão diária; a Sustentação vive na visão dela (hash → visão)
    expect(l.find((x) => x.codigo === 'O1')?.destino).toBe('/operacional?cadencia=diaria#o1')
    expect(l.find((x) => x.codigo === 'O2')?.destino).toBe('/operacional?cadencia=diaria#o2')
    for (const c of [
      'S1',
      'S2',
      'S3',
      'S4',
      'S5',
      'S6',
      'S7',
      'S8',
      'S9',
      'S10',
      'S11',
      'S12',
      'O17',
      'PV1',
    ]) {
      const x = l.find((y) => y.codigo === c)
      expect(x?.destino, c).toBe(`/operacional?cadencia=sustentacao#${c.toLowerCase()}`)
      expect(x?.painelRotulo, c).toBe('Operacional · Sustentação')
    }
  })

  it('mostra a tabela com status escrito e link que abre o cartão; filtros por painel e grupo', async () => {
    const u = userEvent.setup()
    renderizarApp('/metricas')
    await screen.findByRole('heading', { level: 1, name: 'Catálogo de métricas' })
    expect(screen.getByTestId('contagem-catalogo')).toHaveTextContent('53 de 53 métricas')
    const tabela = screen.getByRole('table')
    const linha = within(tabela).getByRole('row', { name: /O5 Eficiência de fluxo/ })
    expect(linha).toHaveTextContent('Complementar')
    // Decisão 20: todos os dados são fictícios até a coleta real, no núcleo e nos complementares.
    expect(linha).toHaveTextContent('Fictícios')
    expect(within(linha).getByRole('link')).toHaveAttribute(
      'href',
      '/operacional?cadencia=semanal#o5',
    )
    expect(within(tabela).getByRole('row', { name: /O3 Tempo de ciclo/ })).toHaveTextContent(
      'Fictícios',
    )
    expect(within(tabela).queryByText('Da coleta')).not.toBeInTheDocument()
    const linhas = within(tabela).getAllByRole('row').slice(1)
    expect(linhas).toHaveLength(53)
    for (const l of linhas) expect(l).toHaveTextContent('Fictícios')
    expect(within(tabela).getByRole('row', { name: /^O17 / })).toHaveTextContent('Sustentação')
    expect(within(tabela).getByRole('row', { name: /^PV1 / })).toHaveTextContent(
      'Pesquisa de percepção',
    )
    await u.selectOptions(screen.getByLabelText('Grupo'), 'Complementar')
    expect(screen.getByTestId('contagem-catalogo')).toHaveTextContent('21 de 53 métricas')
    const opcoes = within(screen.getByLabelText('Painel'))
      .getAllByRole('option')
      .map((o) => o.textContent)
    expect(opcoes).toContain('Operacional · Sustentação')
    expect(opcoes).not.toContain('Sustentação')
    await u.selectOptions(screen.getByLabelText('Painel'), 'sustentacao')
    expect(screen.getByTestId('contagem-catalogo')).toHaveTextContent('6 de 53 métricas')
  })

  it('o link do catálogo leva ao painel com a seção aberta no cartão', async () => {
    const u = userEvent.setup()
    renderizarApp('/metricas')
    await u.click(await screen.findByRole('link', { name: /Ir ao painel de T6/ }))
    expect(await screen.findByTestId('metrica-T6')).toBeInTheDocument()
  })

  it('"Restaurar padrão" abre a seção na visita', async () => {
    const u = userEvent.setup()
    window.localStorage.setItem(
      CHAVE_PREFERENCIAS,
      JSON.stringify({
        versao: 1,
        paineis: { estrategico: { ocultar: ['e1'] } },
        atualizadoEm: '2026-10-10T00:00:00.000Z',
      }),
    )
    const { roteador } = renderizarApp('/preferencias')
    await u.click(await screen.findByRole('button', { name: 'Restaurar padrão' }))
    await u.click(await screen.findByRole('button', { name: 'Restaurar' }))
    await roteador.navigate('/estrategico')
    expect(await screen.findByTestId('metrica-E4')).toBeInTheDocument()
  })
})
