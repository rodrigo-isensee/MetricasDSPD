import { render } from '@testing-library/react'
import { beforeAll } from 'vitest'
import { RouterProvider } from 'react-router'
import { Provedores } from '@/app/App'
import { criarRoteadorMemoria } from '@/app/router'
import { MockFonteMetricas } from '@/data'

/** Uma fonte para todos os testes: a base fictícia é gerada uma única vez; latência 0 (D7 se testa à parte). */
export const fonteDeTeste = new MockFonteMetricas({ latenciaMs: 0 })

export function renderizarApp(url: string, fonte: MockFonteMetricas = fonteDeTeste) {
  const roteador = criarRoteadorMemoria([url])
  const r = render(
    <Provedores fonte={fonte}>
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
  ])
}, 60000)
