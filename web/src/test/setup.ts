import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { cloneElement, isValidElement, type ReactElement } from 'react'
import { afterEach, vi } from 'vitest'
import { limparBuscaPendente } from '@/features/filtros/buscaPendente'
import { lerEsperaAsync } from './espera'

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
// 5 s na estação; maior só no CI, pela variável que o workflow define (E7.541, `test.env` em vite.config.ts).
// Esperas explícitas passam por `limiteEspera(n)` (./espera), que respeita esta global (E7.548).
configure({ asyncUtilTimeout: lerEsperaAsync(process.env.METRICAS_DSPD_ESPERA_ASYNC_MS) })

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
