import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { RouterProvider, type DataRouter } from 'react-router'
import { FonteMetricasProvider, HttpFonteMetricas, type FonteMetricas } from '@/data'
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

/**
 * Fonte mock (testes, E2E, homologação). O `import()` fica só neste ramo, que o build `api` descarta por inteiro:
 * o código do mock não entra no bundle de produção (ADR 0030, D6, guarda G1).
 */
async function criarFonteMock(): Promise<FonteMetricas> {
  const { MockFonteMetricas } = await import('@/data/mock/MockFonteMetricas')
  const semente = env.VITE_MOCK_SEMENTE
  return new MockFonteMetricas({
    ...(semente ? { semente: Number(semente) } : {}),
    ...(env.VITE_MOCK_HOJE ? { hoje: env.VITE_MOCK_HOJE } : {}),
    // Sem a variável: latência simulada de 150 a 400 ms (D7). `VITE_MOCK_LATENCIA=0` desliga (E2E).
    ...(env.VITE_MOCK_LATENCIA ? { latenciaMs: Number(env.VITE_MOCK_LATENCIA) } : {}),
  })
}

/**
 * `VITE_FONTE=api|mock` (padrão `api`, pedido 060): o mock só liga com `VITE_FONTE=mock` explícito e chega por
 * `Promise` (carga sob demanda). Valor inválido falha na partida: nunca cai no mock em silêncio.
 * O teste literal `import.meta.env.VITE_FONTE === 'mock'` é o que o build troca por constante (ver `vite.config.ts`).
 */
export function criarFontePadrao(): FonteMetricas | Promise<FonteMetricas> {
  if (import.meta.env.VITE_FONTE === 'mock') return criarFonteMock()
  // Pedido 099: nenhum número inventado na web de uso diário; sem dado real, o cartão mostra "Sem dado real" e o motivo.
  const fonte = (import.meta.env.VITE_FONTE as string | undefined) ?? 'api'
  if (fonte !== 'api') throw new Error(`VITE_FONTE inválida: "${fonte}" (use "api" ou "mock")`)
  return new HttpFonteMetricas({ base: baseDaApi(env.VITE_API_BASE) })
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

/** A fonte da API chega na hora; a do mock, depois da carga sob demanda (`null` enquanto carrega). */
function useFontePadrao(): FonteMetricas | null {
  const inicial = useMemo(() => criarFontePadrao(), [])
  const [carregada, setCarregada] = useState<FonteMetricas | null>(null)
  const [falha, setFalha] = useState<Error | null>(null)
  useEffect(() => {
    if (!(inicial instanceof Promise)) return
    let vivo = true
    inicial.then(
      (f) => vivo && setCarregada(f),
      (e: unknown) => vivo && setFalha(e as Error),
    )
    return () => {
      vivo = false
    }
  }, [inicial])
  if (falha) throw falha
  return inicial instanceof Promise ? carregada : inicial
}

export function App() {
  const fonte = useFontePadrao()
  const roteador: DataRouter = useMemo(() => criarRoteador(), [])
  if (!fonte)
    return (
      <p role="status" className="p-6 text-sm">
        Carregando…
      </p>
    )
  return (
    <Provedores fonte={fonte}>
      <RouterProvider router={roteador} />
    </Provedores>
  )
}
