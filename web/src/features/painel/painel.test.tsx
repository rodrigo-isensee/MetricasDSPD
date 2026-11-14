import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderizarApp } from '@/test/helpers'
import { propsCartao, diaNum, isoDoDia, slug, textoTaxa } from './propsCartao'

describe('PainelPagina: erro simulado (?mock=erro)', () => {
  it('o painel todo falha dentro do shell e "Tentar de novo" não derruba nada', async () => {
    renderizarApp('/operacional?cadencia=diaria&mock=erro')
    const erro = await screen.findByTestId('erro-pagina')
    expect(erro).toHaveTextContent('Não foi possível abrir este painel')
    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(screen.getByTestId('erro-pagina')).toBeInTheDocument()
  })

  it('o Resumo e a visão Sustentação também falham inteiros, dentro do shell', async () => {
    for (const url of ['/operacional?mock=erro', '/operacional?cadencia=sustentacao&mock=erro']) {
      const r = renderizarApp(url)
      const erro = await screen.findByTestId('erro-pagina')
      expect(erro).toHaveTextContent('Não foi possível abrir este painel')
      await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
      expect(screen.getByTestId('erro-pagina')).toBeInTheDocument()
      r.unmount()
    }
  })
})

describe('propsCartao e utilitários de cartão', () => {
  const q = {
    estado: 'ok',
    atualizando: false,
    dados: undefined,
    recarregar: () => undefined,
    erro: null,
  } as never
  const nota = { oQueE: 'a', comoSeCalcula: 'b', comoLer: 'c', meta: 'd', cuidados: 'e' }

  it('filtros aplicáveis vêm do contrato; métrica sem aplicabilidade declarada não recebe filtro', () => {
    expect(propsCartao('O3', q, nota).aplicaveis).toContain('equipe')
    expect(propsCartao('S1', q, nota).aplicaveis).toEqual([])
  })

  it('slug, dia numérico e taxa', () => {
    expect(slug('Dívida técnica')).toBe('divida-tecnica')
    expect(isoDoDia(diaNum('2026-10-09'))).toBe('2026-10-09')
    expect(textoTaxa({ status: 'ok', k: 5, n: 25, pct: 20.04 })).toBe('20%')
    expect(textoTaxa({ status: 'insuficiente', k: 3, n: 10 })).toBe('3 de 10')
  })
})

describe('PainelFluxo sem público informado', () => {
  it('o cabeçalho mostra só a pergunta', async () => {
    const { PainelFluxo } = await import('./PainelPagina')
    const { renderizarCartao } = await import('@/test/helpers')
    renderizarCartao(
      <PainelFluxo painel="operacional" titulo="Painel X" pergunta="Pergunta?" slug="x">
        {() => <p>conteúdo</p>}
      </PainelFluxo>,
      { url: '/operacional' },
    )
    expect(await screen.findByText('Pergunta?')).toBeInTheDocument()
    expect(await screen.findByText('conteúdo')).toBeInTheDocument()
  })
})

describe('recolher cartão nos painéis (097 E5, L8b)', () => {
  it.each([
    '/operacional?cadencia=diaria',
    '/tatico',
    '/estrategico',
    '/operacional?cadencia=sustentacao',
  ])('%s: o cartão recolhe, o "Restaurar" aparece e devolve o cartão', async (url) => {
    localStorage.clear()
    renderizarApp(url)
    const botoes = await screen.findAllByRole(
      'button',
      { name: /^Recolher cartão:/ },
      { timeout: 8000 },
    )
    expect(screen.queryByRole('button', { name: 'Restaurar cartões recolhidos' })).toBeNull()
    await userEvent.click(botoes[0]!)
    const restaurar = await screen.findByRole('button', { name: 'Restaurar cartões recolhidos' })
    expect(screen.getAllByRole('button', { name: /^Expandir cartão:/ })).toHaveLength(1)
    await userEvent.click(restaurar)
    expect(screen.queryByRole('button', { name: /^Expandir cartão:/ })).toBeNull()
    localStorage.clear()
  })
})
