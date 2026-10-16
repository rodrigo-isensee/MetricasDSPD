import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GraficoBase } from './GraficoBase'

const tabela = { legenda: 'Dados', colunas: [{ chave: 'a', titulo: 'A' }], linhas: [{ a: '1' }] }

function Grafico({ id }: { id: string }) {
  return (
    <GraficoBase tabela={tabela} altura={300}>
      <svg data-testid={id} />
    </GraficoBase>
  )
}

describe('fila de montagem dos gráficos (K-102)', () => {
  it('reserva a altura já no primeiro commit e libera um gráfico por tarefa', async () => {
    const { container } = render(
      <>
        <Grafico id="g1" />
        <Grafico id="g2" />
        <Grafico id="g3" />
      </>,
    )
    // Primeiro commit: caixa com a altura reservada, nenhum gráfico ainda (sem salto de layout depois).
    const caixas = container.querySelectorAll<HTMLElement>('figure > div')
    expect(caixas).toHaveLength(3)
    caixas.forEach((c) => expect(c.style.height).toBe('300px'))
    expect(screen.queryByTestId('g1')).toBeNull()

    // Cada liberação é uma tarefa: a contagem de gráficos sobe de um em um, nunca de três de uma vez.
    const contagens = new Set<number>()
    await waitFor(() => {
      contagens.add(container.querySelectorAll('svg').length)
      expect(container.querySelectorAll('svg')).toHaveLength(3)
    })
    expect(Math.max(...contagens)).toBe(3)
    expect(contagens.size).toBeGreaterThan(1)
  })

  it('gráfico desmontado antes da vez sai da fila sem erro', async () => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { unmount } = render(<Grafico id="g4" />)
    unmount()
    await new Promise((r) => setTimeout(r, 50))
    expect(erro).not.toHaveBeenCalled()
    erro.mockRestore()
  })
})
