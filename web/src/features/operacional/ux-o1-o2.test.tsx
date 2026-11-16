import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FILTROS_FLUXO, FonteAjustada } from '@/features/painel/testes/fonteFixa'
import { renderizarCartao } from '@/test/helpers'
import { CartaoO1 } from './components/CartaoO1'
import { CartaoO2 } from './components/CartaoO2'

vi.setConfig({ testTimeout: 45000 })

type Q = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

async function abrirO1(ajuste: (r: Q) => void) {
  renderizarCartao(<CartaoO1 filtros={FILTROS_FLUXO} />, {
    fonte: new FonteAjustada({ O1: ajuste }),
  })
  const c = await screen.findByTestId('metrica-O1')
  await waitFor(() => expect(c).toHaveAttribute('data-estado', 'ok'))
  return c
}

async function abrirO2(ajuste: (r: Q) => void) {
  renderizarCartao(<CartaoO2 filtros={FILTROS_FLUXO} />, {
    fonte: new FonteAjustada({ O2: ajuste }),
  })
  const c = await screen.findByTestId('metrica-O2')
  await waitFor(() => expect(c).toHaveAttribute('data-estado', 'ok'))
  return c
}

describe('O1: coluna sem dado de bloqueio (achado 2 da revisão de UX)', () => {
  it('hoje com número e uma coluna com null: a barra avisa', async () => {
    const c = await abrirO1((r) => {
      r.hoje.bloqueados = 1
      r.porTipoColuna = r.porTipoColuna.map((x: Q, i: number) => ({
        ...x,
        bloqueados: i === 0 ? null : 0,
      }))
    })
    expect(within(c).getByTestId('o1-coluna-sem-bloqueio')).toHaveTextContent(
      'Há colunas sem dado real de bloqueio',
    )
    expect(within(c).queryByTestId('o1-bloqueados-sem-dado')).not.toBeInTheDocument()
  })

  it('com equipe, olha a coluna e avisa', async () => {
    const c = await abrirO1((r) => {
      r.hoje.bloqueados = 0
      r.porColuna = [
        { coluna: 'Em execução', tipoColuna: 'execucao', limite: 5, itens: 3, bloqueados: null },
      ]
    })
    expect(within(c).getByTestId('o1-coluna-sem-bloqueio')).toBeInTheDocument()
  })

  it('sem null em nenhuma coluna, não avisa', async () => {
    const c = await abrirO1((r) => {
      r.hoje.bloqueados = 0
      r.porColuna = null
      r.porTipoColuna = r.porTipoColuna.map((x: Q) => ({ ...x, bloqueados: 0 }))
    })
    expect(within(c).queryByTestId('o1-coluna-sem-bloqueio')).not.toBeInTheDocument()
  })

  it('hoje nulo segue no ramo "sem dado real" e não duplica o aviso', async () => {
    const c = await abrirO1((r) => {
      r.hoje.bloqueados = null
    })
    expect(within(c).getByTestId('o1-bloqueados-sem-dado')).toBeInTheDocument()
    expect(within(c).queryByTestId('o1-coluna-sem-bloqueio')).not.toBeInTheDocument()
  })
})

describe('O2: bloqueio no gráfico e na tabela (achados 3 a 6)', () => {
  const marcar = (r: Q, motivo: string | null): void => {
    for (const i of r.itens as Q[]) i.bloqueioMotivo = motivo
  }

  it('achado 4: sem item bloqueado, a legenda não traz "anel"', async () => {
    const c = await abrirO2((r) => marcar(r, null))
    const legenda = within(c).getByRole('list', { name: 'Significado das marcas' })
    expect(legenda).not.toHaveTextContent('anel')
    expect(legenda).toHaveTextContent('triângulo')
  })

  it('achados 3 e 4: com item bloqueado, a legenda traz o anel e a forma da situação segue', async () => {
    const c = await abrirO2((r) => {
      marcar(r, 'Dependência Externa')
      for (const i of r.itens as Q[]) {
        i.situacao = 'acima-p95'
        i.tipo = r.tipoSugerido ?? r.tipos[0].tipo
      }
    })
    expect(within(c).getByRole('list', { name: 'Significado das marcas' })).toHaveTextContent(
      'anel (bloqueado)',
    )
    const grafico = within(c).getByTestId('o2-grafico')
    await waitFor(() =>
      expect(grafico.querySelector('.recharts-scatter circle[r="11"]')).not.toBeNull(),
    )
    expect(grafico.querySelector('.recharts-scatter path')).not.toBeNull()
  })

  it('achado 5: o apoio de "não classificado" é text-sm text-texto-2', async () => {
    const c = await abrirO2((r) => marcar(r, 'não classificado'))
    const apoio = within(c).getByTestId('apoio-nao-classificado').closest('#o2-apoio-motivo')
    expect(apoio).toHaveClass('text-sm', 'text-texto-2')
    expect(apoio).not.toHaveClass('text-xs')
  })

  it('achado 6: o travessão da coluna Bloqueado tem texto para leitor de tela', async () => {
    const c = await abrirO2((r) => marcar(r, null))
    const lista = within(c).getByTestId('o2-lista')
    const celula = within(lista).getAllByText('não bloqueado')[0] as HTMLElement
    expect(celula).toHaveClass('sr-only')
    expect(celula.previousElementSibling).toHaveAttribute('aria-hidden', 'true')
    expect(celula.previousElementSibling).toHaveTextContent('—')
  })
})
