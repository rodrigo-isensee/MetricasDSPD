import { render } from '@testing-library/react'
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
