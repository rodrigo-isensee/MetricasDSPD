import type { ReactNode } from 'react'

/** Seção de painel: `h2` + pergunta do ritual (3.4) + conteúdo. Cartões dentro dela usam `h3`. */
export function Secao({
  titulo,
  pergunta,
  id,
  contagem,
  children,
}: {
  titulo: string
  pergunta?: string
  id?: string
  /** "2 de 3 visíveis": só quando alguma métrica da seção está oculta (P1). */
  contagem?: string
  children: ReactNode
}) {
  return (
    <section
      aria-labelledby={id ? `${id}-titulo` : undefined}
      id={id}
      className="flex flex-col gap-3"
    >
      <div>
        <h2
          id={id ? `${id}-titulo` : undefined}
          tabIndex={-1}
          data-cartao-titulo
          className="text-lg font-bold outline-offset-2"
        >
          {titulo}
        </h2>
        {contagem && (
          <p className="text-sm text-texto-2" data-testid={id ? `contagem-${id}` : undefined}>
            {contagem}
          </p>
        )}
        {pergunta && <p className="text-sm text-texto-2">{pergunta}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">{children}</div>
    </section>
  )
}
