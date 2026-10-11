import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CHAVE_PREFERENCIAS } from '@metricas-dspd/contratos'
import { renderizarApp } from '@/test/helpers'
import { linhasDoCatalogo } from './linhas'

describe('Catálogo de métricas (/metricas)', () => {
  it('lista as 45 métricas (28 do núcleo, 17 complementares), espera invisível uma vez', () => {
    const l = linhasDoCatalogo()
    expect(l).toHaveLength(45)
    expect(l.filter((x) => x.grupo === 'Complementar')).toHaveLength(17)
    expect(l.filter((x) => x.painel === 'espera-invisivel')).toHaveLength(1)
    expect(l.some((x) => x.codigo === 'BLOQUEADOS')).toBe(false)
  })

  it('mostra a tabela com status escrito e link que abre o cartão; filtros por painel e grupo', async () => {
    const u = userEvent.setup()
    renderizarApp('/metricas')
    await screen.findByRole('heading', { level: 1, name: 'Catálogo de métricas' })
    expect(screen.getByTestId('contagem-catalogo')).toHaveTextContent('45 de 45 métricas')
    const tabela = screen.getByRole('table')
    const linha = within(tabela).getByRole('row', { name: /O5 Eficiência de fluxo/ })
    expect(linha).toHaveTextContent('Complementar')
    expect(linha).toHaveTextContent('Da coleta')
    expect(within(linha).getByRole('link')).toHaveAttribute('href', '/operacional#o5')
    expect(within(tabela).getByRole('row', { name: /O3 Tempo de ciclo/ })).toHaveTextContent(
      'Da coleta',
    )
    // Só o status `mock` do contrato (falta fonte real) vira "Fictícios".
    for (const c of ['O17', 'T8', 'E4', 'S8', 'S11', 'S12'])
      expect(within(tabela).getByRole('row', { name: new RegExp(`^${c} `) })).toHaveTextContent(
        'Fictícios',
      )
    const ficticios = within(tabela)
      .getAllByRole('row')
      .filter((r) => /Fictícios/.test(r.textContent))
    expect(ficticios).toHaveLength(6)
    expect(within(tabela).getByRole('row', { name: /^O17 / })).toHaveTextContent('Sustentação')
    await u.selectOptions(screen.getByLabelText('Grupo'), 'Complementar')
    expect(screen.getByTestId('contagem-catalogo')).toHaveTextContent('17 de 45 métricas')
    await u.selectOptions(screen.getByLabelText('Painel'), 'sustentacao')
    expect(screen.getByTestId('contagem-catalogo')).toHaveTextContent('6 de 45 métricas')
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
