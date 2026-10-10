import { createBrowserRouter, createMemoryRouter, type RouteObject } from 'react-router'
import { AppShell } from './AppShell'
import { ErroDeRota, PaginaNaoEncontrada } from './Erros'

const lazy =
  (carregar: () => Promise<{ default: React.ComponentType; handle?: unknown }>) => async () => {
    const m = await carregar()
    return { Component: m.default, handle: m.handle }
  }

/** Rotas lazy por painel (chunks separados). */
export const ROTAS: RouteObject[] = [
  {
    path: '/',
    Component: AppShell,
    children: [
      {
        // Rota sem caminho só para o `errorElement`: o erro de um painel (falha ao carregar o chunk)
        // aparece no `Outlet` do shell, que mantém cabeçalho, selo, navegação e rodapé (A4).
        errorElement: <ErroDeRota />,
        children: [
          { index: true, lazy: lazy(() => import('@/features/visao-geral/VisaoGeralPage')) },
          {
            path: 'operacional',
            lazy: lazy(() => import('@/features/operacional/OperacionalPage')),
          },
          { path: 'tatico', lazy: lazy(() => import('@/features/tatico/TaticoPage')) },
          {
            path: 'estrategico',
            lazy: lazy(() => import('@/features/estrategico/EstrategicoPage')),
          },
          {
            path: 'sustentacao',
            lazy: lazy(() => import('@/features/sustentacao/SustentacaoPage')),
          },
          {
            path: 'espera-invisivel',
            lazy: lazy(() => import('@/features/espera-invisivel/EsperaInvisivelPage')),
          },
          { path: 'dados', lazy: lazy(() => import('@/features/dados/DadosPage')) },
          { path: 'ajuda', lazy: lazy(() => import('@/features/ajuda/AjudaPage')) },
          {
            path: '*',
            Component: PaginaNaoEncontrada,
            handle: { titulo: 'Página não encontrada' },
          },
        ],
      },
    ],
  },
]

export const criarRoteador = () => createBrowserRouter(ROTAS)
export const criarRoteadorMemoria = (entradas: string[]) =>
  createMemoryRouter(ROTAS, { initialEntries: entradas })
