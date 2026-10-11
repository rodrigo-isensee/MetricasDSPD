import { render } from '@testing-library/react'
import { beforeAll } from 'vitest'
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router'
import { BarraFiltros, useFiltros, type PainelId } from '@/features/filtros'
import { Provedores } from '@/app/App'
import { criarRoteadorMemoria } from '@/app/router'
import { MockFonteMetricas } from '@/data'
import type { FontePreferencias } from '@/features/preferencias'

/** Uma fonte para todos os testes: a base fictícia é gerada uma única vez; latência 0 (D7 se testa à parte). */
export const fonteDeTeste = new MockFonteMetricas({ latenciaMs: 0 })

export function renderizarApp(
  url: string,
  fonte: MockFonteMetricas = fonteDeTeste,
  fontePreferencias?: FontePreferencias,
) {
  const roteador = criarRoteadorMemoria([url])
  const r = render(
    <Provedores fonte={fonte} {...(fontePreferencias ? { fontePreferencias } : {})}>
      <RouterProvider router={roteador} />
    </Provedores>,
  )
  return { ...r, roteador }
}

/**
 * Aquecimento (K-054): a primeira renderização de cada arquivo paga a geração da base e o import
 * dos painéis lazy. Isso sai do relógio dos testes e vai para o `beforeAll`, que roda uma vez.
 */
beforeAll(async () => {
  await Promise.all([
    fonteDeTeste.opcoesFiltro('businessmap'),
    import('@/features/visao-geral/VisaoGeralPage'),
    import('@/features/operacional/OperacionalPage'),
    import('@/features/tatico/TaticoPage'),
    import('@/features/estrategico/EstrategicoPage'),
    import('@/features/sustentacao/SustentacaoPage'),
    import('@/features/espera-invisivel/EsperaInvisivelPage'),
    import('@/features/dados/DadosPage'),
    import('@/features/preferencias/PreferenciasPage'),
  ])
}, 60000)

function BarraIsolada() {
  const { pathname } = useLocation()
  const painel = pathname.slice(1) as PainelId
  const uso = useFiltros(painel as 'operacional')
  return <BarraFiltros uso={uso} estrategico={painel === 'estrategico'} />
}

/** Só a barra de filtros do painel indicado pela URL (sem cabeçalho nem cartões): leve para testar filtros e URL. */
export function renderizarBarra(url: string, fonte: MockFonteMetricas = fonteDeTeste) {
  const roteador = createMemoryRouter([{ path: '*', element: <BarraIsolada /> }], {
    initialEntries: [url],
  })
  const r = render(
    <Provedores fonte={fonte}>
      <RouterProvider router={roteador} />
    </Provedores>,
  )
  return { ...r, roteador }
}

/** Um cartão isolado (sem o painel): só a fonte, a URL e os provedores. Muito mais leve que `renderizarApp`. */
export function renderizarCartao(
  cartao: React.ReactElement,
  { url = '/', fonte = fonteDeTeste }: { url?: string; fonte?: MockFonteMetricas } = {},
) {
  const roteador = createMemoryRouter([{ path: '*', element: cartao }], { initialEntries: [url] })
  const r = render(
    <Provedores fonte={fonte}>
      <RouterProvider router={roteador} />
    </Provedores>,
  )
  return { ...r, roteador }
}
