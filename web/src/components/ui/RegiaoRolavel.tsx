import type { ReactNode } from 'react'

/** Região com rolagem horizontal: rótulo, foco por teclado e sombra de borda quando há mais conteúdo. */
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
      className="rolagem-sombra max-w-full overflow-x-auto rounded-md border border-borda"
      data-testid={testid}
    >
      {children}
    </div>
  )
}
