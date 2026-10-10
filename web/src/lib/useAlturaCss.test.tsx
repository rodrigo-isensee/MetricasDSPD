import { render } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useAlturaCss } from './useAlturaCss'

function Caixa({ montar = true }: { montar?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useAlturaCss(ref, '--h-teste')
  return montar ? <div ref={ref}>conteúdo</div> : null
}

const lerVar = () => document.documentElement.style.getPropertyValue('--h-teste')

afterEach(() => vi.unstubAllGlobals())

describe('useAlturaCss', () => {
  it('publica a altura na raiz, atualiza quando o elemento muda e limpa ao desmontar', () => {
    let notificar: () => void = () => undefined
    const desconectar = vi.fn()
    class Observador {
      constructor(cb: () => void) {
        notificar = cb
      }
      observe() {}
      disconnect = desconectar
    }
    vi.stubGlobal('ResizeObserver', Observador)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      height: 42,
    } as DOMRect)
    const { unmount } = render(<Caixa />)
    expect(lerVar()).toBe('42px')
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      height: 80,
    } as DOMRect)
    notificar()
    expect(lerVar()).toBe('80px')
    unmount()
    expect(desconectar).toHaveBeenCalled()
    expect(lerVar()).toBe('')
  })

  it('sem ResizeObserver, acompanha o resize da janela', () => {
    vi.stubGlobal('ResizeObserver', undefined)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      height: 10,
    } as DOMRect)
    const { unmount } = render(<Caixa />)
    expect(lerVar()).toBe('10px')
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      height: 20,
    } as DOMRect)
    window.dispatchEvent(new Event('resize'))
    expect(lerVar()).toBe('20px')
    unmount()
    expect(lerVar()).toBe('')
    window.dispatchEvent(new Event('resize'))
    expect(lerVar()).toBe('')
  })

  it('sem elemento, não publica nada', () => {
    render(<Caixa montar={false} />)
    expect(lerVar()).toBe('')
  })
})
