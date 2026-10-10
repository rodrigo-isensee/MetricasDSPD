import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMemo } from 'react'
import { RouterProvider, type DataRouter } from 'react-router'
import { FonteMetricasProvider, MockFonteMetricas, type FonteMetricas } from '@/data'
import { ProvedorMemoriaFiltros } from '@/features/filtros'
import { criarRoteador } from './router'
import { ProvedorTema } from './tema'

export function criarQueryClient(): QueryClient {
  // Fonte mock é estática e síncrona em essência: sem retries nem refetch automático (nada se atualiza sozinho, WCAG 2.2.2).
  return new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity, refetchOnWindowFocus: false } },
  })
}

const env = import.meta.env as Record<string, string | undefined>

export function criarFontePadrao(): FonteMetricas {
  const semente = env.VITE_MOCK_SEMENTE
  return new MockFonteMetricas({
    ...(semente ? { semente: Number(semente) } : {}),
    ...(env.VITE_MOCK_HOJE ? { hoje: env.VITE_MOCK_HOJE } : {}),
    // Sem a variável: latência simulada de 150 a 400 ms (D7). `VITE_MOCK_LATENCIA=0` desliga (E2E).
    ...(env.VITE_MOCK_LATENCIA ? { latenciaMs: Number(env.VITE_MOCK_LATENCIA) } : {}),
  })
}

export function Provedores({
  fonte,
  children,
}: {
  fonte: FonteMetricas
  children: React.ReactNode
}) {
  const client = useMemo(() => criarQueryClient(), [])
  return (
    <QueryClientProvider client={client}>
      <FonteMetricasProvider fonte={fonte}>
        <ProvedorTema>
          <ProvedorMemoriaFiltros>{children}</ProvedorMemoriaFiltros>
        </ProvedorTema>
      </FonteMetricasProvider>
    </QueryClientProvider>
  )
}

export function App() {
  const fonte = useMemo(() => criarFontePadrao(), [])
  const roteador: DataRouter = useMemo(() => criarRoteador(), [])
  return (
    <Provedores fonte={fonte}>
      <RouterProvider router={roteador} />
    </Provedores>
  )
}
