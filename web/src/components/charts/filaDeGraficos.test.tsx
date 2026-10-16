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

    // Cada liberação é uma tarefa: um MutationObserver (entrega por microtask, depois de cada tarefa) registra
    // a contagem de gráficos após cada mudança, que deve subir 1, 2, 3 e nunca saltar de 0 para 3.
    const contagens: number[] = []
    const obs = new MutationObserver(() => {
      const n = container.querySelectorAll('svg').length
      if (contagens[contagens.length - 1] !== n) contagens.push(n)
    })
    obs.observe(container, { childList: true, subtree: true })
    await waitFor(() => expect(container.querySelectorAll('svg')).toHaveLength(3))
    obs.disconnect()
    expect(contagens).toEqual([1, 2, 3])
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
