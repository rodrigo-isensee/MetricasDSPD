import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMemo } from 'react'
import { RouterProvider, type DataRouter } from 'react-router'
import {
  FonteMetricasProvider,
  HttpFonteMetricas,
  MockFonteMetricas,
  type FonteMetricas,
} from '@/data'
import { ProvedorMemoriaFiltros } from '@/features/filtros'
import {
  LocalStoragePreferencias,
  ProvedorPreferencias,
  type FontePreferencias,
} from '@/features/preferencias'
import { criarRoteador } from './router'
import { ProvedorTema } from './tema'

export function criarQueryClient(): QueryClient {
  // Fonte mock é estática e síncrona em essência: sem retries nem refetch automático (nada se atualiza sozinho, WCAG 2.2.2).
  return new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity, refetchOnWindowFocus: false } },
  })
}

const env = import.meta.env as Record<string, string | undefined>

/** `VITE_API_BASE`: só caminho relativo (mesma origem, sem CORS); URL absoluta ou `//host` falha na partida. */
export function baseDaApi(valor: string | undefined): string {
  if (!valor) return '/api/v1'
  if (!valor.startsWith('/') || valor.startsWith('//'))
    throw new Error(`VITE_API_BASE inválida: "${valor}" (use um caminho relativo, como "/api/v1")`)
  return valor
}

/** `VITE_FONTE=mock|api` (padrão `mock`). Valor inválido falha na partida: nunca cai no mock em silêncio. */
export function criarFontePadrao(): FonteMetricas {
  const fonte = env.VITE_FONTE ?? 'mock'
  if (fonte === 'api') return new HttpFonteMetricas({ base: baseDaApi(env.VITE_API_BASE) })
  if (fonte !== 'mock') throw new Error(`VITE_FONTE inválida: "${fonte}" (use "mock" ou "api")`)
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
  fontePreferencias,
  children,
}: {
  fonte: FonteMetricas
  /** Porta das preferências de métricas; padrão: localStorage do navegador (sem login). */
  fontePreferencias?: FontePreferencias
  children: React.ReactNode
}) {
  const preferencias = useMemo(
    () => fontePreferencias ?? new LocalStoragePreferencias(),
    [fontePreferencias],
  )
  const client = useMemo(() => criarQueryClient(), [])
  return (
    <QueryClientProvider client={client}>
      <FonteMetricasProvider fonte={fonte}>
        <ProvedorTema>
          <ProvedorPreferencias fonte={preferencias}>
            <ProvedorMemoriaFiltros>{children}</ProvedorMemoriaFiltros>
          </ProvedorPreferencias>
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
