import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { cloneElement, isValidElement, type ReactElement } from 'react'
import { afterEach, vi } from 'vitest'
import { limparBuscaPendente } from '@/features/filtros/buscaPendente'

// jsdom não mede layout: o ResponsiveContainer recebe um tamanho fixo para o gráfico renderizar.
vi.mock('recharts', async (importar) => {
  const real = await importar<typeof import('recharts')>()
  return {
    ...real,
    ResponsiveContainer: ({ children }: { children: ReactElement }) =>
      isValidElement(children)
        ? cloneElement(children as ReactElement<{ width?: number; height?: number }>, {
            width: 640,
            height: 300,
          })
        : null,
  }
})

// A primeira chamada gera a base fictícia (import dinâmico + geração): folga para esperas assíncronas.
configure({ asyncUtilTimeout: 5000 })

afterEach(() => {
  cleanup()
  limparBuscaPendente()
  window.localStorage.clear()
})

// Recharts e Radix precisam destes recursos de navegador, ausentes no jsdom.
class ResizeObserverFalso {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverFalso as unknown as typeof ResizeObserver

if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}

Element.prototype.scrollIntoView ??= () => {}
Element.prototype.hasPointerCapture ??= () => false
Element.prototype.setPointerCapture ??= () => {}
Element.prototype.releasePointerCapture ??= () => {}
