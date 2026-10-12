import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { PREFERENCIAS_PADRAO } from '@metricas-dspd/contratos'
import { usePreferenciasPainel } from '@/components/ui'
import { BotaoMetricas } from './BotaoMetricas'
import type { FontePreferencias } from './fonte'
import { ProvedorPainelPreferencias } from './ProvedorPainelPreferencias'
import { ProvedorPreferencias, usePreferencias } from './ProvedorPreferencias'

const fonteLocal = (): FontePreferencias => ({
  origem: 'navegador',
  obter: () => Promise.resolve(PREFERENCIAS_PADRAO),
  salvar: () => Promise.resolve(),
})

function Sonda() {
  const p = usePreferenciasPainel()
  return (
    <div>
      <button onClick={() => p?.ocultarCartao('inexistente')}>ocultar-inexistente</button>
      <button onClick={() => p?.ocultarCartao('o2')}>ocultar-o2</button>
      <button onClick={() => p?.mostrar('o2')}>mostrar-o2</button>
      <output data-testid="n">{p?.visiveis}</output>
    </div>
  )
}

describe('ProvedorPreferencias e ProvedorPainelPreferencias', () => {
  it('usePreferencias fora do provedor falha com mensagem clara', () => {
    function Sem() {
      usePreferencias()
      return null
    }
    const erro = console.error
    console.error = () => undefined
    expect(() => render(<Sem />)).toThrow('fora do ProvedorPreferencias')
    console.error = erro
  })

  it('desmontar antes da leitura terminar não atualiza estado', async () => {
    let resolver: (p: typeof PREFERENCIAS_PADRAO) => void = () => undefined
    const f: FontePreferencias = {
      ...fonteLocal(),
      obter: () => new Promise((r) => (resolver = r)),
    }
    const { unmount } = render(
      <ProvedorPreferencias fonte={f}>
        <span />
      </ProvedorPreferencias>,
    )
    unmount()
    resolver(PREFERENCIAS_PADRAO)
    await Promise.resolve()
    expect(true).toBe(true)
  })

  it('ocultar id fora do catálogo ou já oculto não faz nada; sem título na página, o foco cai no h1; sem h1, em lugar nenhum', async () => {
    const u = userEvent.setup()
    render(
      <MemoryRouter>
        <ProvedorPreferencias fonte={fonteLocal()}>
          <ProvedorPainelPreferencias painel="operacional">
            <Sonda />
          </ProvedorPainelPreferencias>
        </ProvedorPreferencias>
      </MemoryRouter>,
    )
    await screen.findByTestId('n')
    await u.click(await screen.findByRole('button', { name: 'ocultar-inexistente' }))
    expect(screen.getByTestId('n')).toHaveTextContent('12')
    await u.click(screen.getByRole('button', { name: 'ocultar-o2' }))
    expect(screen.getByTestId('n')).toHaveTextContent('11')
    await u.click(screen.getByRole('button', { name: 'ocultar-o2' }))
    expect(screen.getByTestId('n')).toHaveTextContent('11')
    await u.click(screen.getByRole('button', { name: 'mostrar-o2' }))
    expect(screen.getByTestId('n')).toHaveTextContent('12')
    // com h1 na página, o foco vai para ele
    const h1 = document.createElement('h1')
    h1.tabIndex = -1
    document.body.append(h1)
    await u.click(screen.getByRole('button', { name: 'ocultar-o2' }))
    expect(h1).toHaveFocus()
    h1.remove()
  })

  it('"Desfazer" sem o cartão na página (id ausente) não quebra', async () => {
    const u = userEvent.setup()
    render(
      <MemoryRouter>
        <ProvedorPreferencias fonte={fonteLocal()}>
          <ProvedorPainelPreferencias painel="operacional">
            <Sonda />
          </ProvedorPainelPreferencias>
        </ProvedorPreferencias>
      </MemoryRouter>,
    )
    await u.click(await screen.findByRole('button', { name: 'ocultar-o2' }))
    await u.click(screen.getByRole('button', { name: 'Desfazer' }))
    expect(screen.getByTestId('n')).toHaveTextContent('12')
  })

  it('BotaoMetricas fora de um painel com preferências não desenha nada', () => {
    const { container } = render(<BotaoMetricas />)
    expect(container).toBeEmptyDOMElement()
  })
})
