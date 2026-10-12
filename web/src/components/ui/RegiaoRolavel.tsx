import type { ReactNode } from 'react'

/**
 * Região com rolagem horizontal: rótulo, foco por teclado e sombra de borda quando há mais conteúdo.
 * `relative` é necessário: o texto `sr-only` (absolute) dentro da tabela só é recortado pelo overflow
 * se a região for seu bloco contêiner; sem isso ele alarga a página (MC-001).
 */
export function RegiaoRolavel({
  rotulo,
  testid,
  children,
}: {
  rotulo: string
  testid?: string | undefined
  children: ReactNode
}) {
  return (
    <div
      role="region"
      aria-label={`${rotulo}, role para os lados`}
      tabIndex={0}
      className="rolagem-sombra relative max-w-full overflow-x-auto rounded-md border border-borda"
      data-testid={testid}
    >
      {children}
    </div>
  )
}
