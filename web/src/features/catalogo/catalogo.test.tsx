import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CHAVE_PREFERENCIAS } from '@metricas-dspd/contratos'
import { renderizarApp } from '@/test/helpers'
import { linhasDoCatalogo } from './linhas'

describe('Catálogo de métricas (/metricas)', () => {
  it('lista 46 métricas (45 do briefing + a PV1; 29 do núcleo, 17 complementares), espera invisível uma vez', () => {
    const l = linhasDoCatalogo()
    expect(l).toHaveLength(46)
    expect(l.filter((x) => x.grupo === 'Complementar')).toHaveLength(17)
    expect(l.filter((x) => x.painel === 'espera-invisivel')).toHaveLength(1)
    expect(l.some((x) => x.codigo === 'BLOQUEADOS')).toBe(false)
    const pv1 = l.find((x) => x.codigo === 'PV1')
    expect(pv1).toMatchObject({
      fonte: 'Pesquisa de percepção',
      grupo: 'Núcleo',
      destino: '/sustentacao',
    })
  })

  it('mostra a tabela com status escrito e link que abre o cartão; filtros por painel e grupo', async () => {
    const u = userEvent.setup()
    renderizarApp('/metricas')
    await screen.findByRole('heading', { level: 1, name: 'Catálogo de métricas' })
    expect(screen.getByTestId('contagem-catalogo')).toHaveTextContent('46 de 46 métricas')
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
    expect(linhas).toHaveLength(46)
    for (const l of linhas) expect(l).toHaveTextContent('Fictícios')
    expect(within(tabela).getByRole('row', { name: /^O17 / })).toHaveTextContent('Sustentação')
    expect(within(tabela).getByRole('row', { name: /^PV1 / })).toHaveTextContent(
      'Pesquisa de percepção',
    )
    await u.selectOptions(screen.getByLabelText('Grupo'), 'Complementar')
    expect(screen.getByTestId('contagem-catalogo')).toHaveTextContent('17 de 46 métricas')
    await u.selectOptions(screen.getByLabelText('Painel'), 'sustentacao')
    expect(screen.getByTestId('contagem-catalogo')).toHaveTextContent('6 de 46 métricas')
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
