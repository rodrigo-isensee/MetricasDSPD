import { Link, isRouteErrorResponse, useRouteError } from 'react-router'
import { ErroPagina } from '@/components/ui'

export function PaginaNaoEncontrada() {
  return (
    <div className="flex flex-col items-start gap-3" data-testid="pagina-404">
      <h1 tabIndex={-1} data-foco-rota className="text-2xl font-bold">
        Página não encontrada
      </h1>
      <Link to="/" className="text-acento underline">
        Ir para a Visão geral
      </Link>
    </div>
  )
}

/** Erro de rota (falha ao abrir o painel): renderiza dentro do shell, sem substituí-lo (A4). */
export function ErroDeRota() {
  const erro = useRouteError()
  if (isRouteErrorResponse(erro) && erro.status === 404) return <PaginaNaoEncontrada />
  return <ErroPagina erro={erro} onTentarDeNovo={() => window.location.reload()} />
}
