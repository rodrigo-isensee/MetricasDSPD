import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderizarApp } from '@/test/helpers'
import { propsCartao, diaNum, isoDoDia, slug, textoTaxa } from './propsCartao'

describe('PainelPagina: erro simulado (?mock=erro)', () => {
  it('o painel todo falha dentro do shell e "Tentar de novo" não derruba nada', async () => {
    renderizarApp('/operacional?mock=erro')
    const erro = await screen.findByTestId('erro-pagina')
    expect(erro).toHaveTextContent('Não foi possível abrir este painel')
    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(screen.getByTestId('erro-pagina')).toBeInTheDocument()
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
