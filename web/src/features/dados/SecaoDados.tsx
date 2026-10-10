import type { ReactNode } from 'react'

/** Bloco de `/dados`: `h2` focável (âncora, "Saiba mais") dentro de um cartão. */
export function SecaoDados({
  id,
  titulo,
  children,
}: {
  id: string
  titulo: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titulo`}
      tabIndex={-1}
      className="rounded-lg border border-borda bg-superficie p-4 outline-none focus-visible:outline-2"
    >
      <h2
        id={`${id}-titulo`}
        tabIndex={-1}
        data-cartao-titulo
        className="mb-2 text-base font-semibold"
      >
        {titulo}
      </h2>
      <div className="flex flex-col gap-2 text-sm">{children}</div>
    </section>
  )
}
