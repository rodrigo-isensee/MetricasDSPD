import { createContext, useContext, type ReactNode } from 'react'
import type { FonteMetricas } from './FonteMetricas'

const FonteContext = createContext<FonteMetricas | null>(null)

export function FonteMetricasProvider({
  fonte,
  children,
}: {
  fonte: FonteMetricas
  children: ReactNode
}) {
  return <FonteContext.Provider value={fonte}>{children}</FonteContext.Provider>
}

export function useFonte(): FonteMetricas {
  const f = useContext(FonteContext)
  if (!f) throw new Error('useFonte fora de <FonteMetricasProvider>')
  return f
}
