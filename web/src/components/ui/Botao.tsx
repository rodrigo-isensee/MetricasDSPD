import clsx from 'clsx'
import type { ComponentProps, ReactNode } from 'react'

type Variante = 'primario' | 'secundario' | 'fantasma'

interface Props extends ComponentProps<'button'> {
  variante?: Variante
  children: ReactNode
}

const ESTILOS: Record<Variante, string> = {
  primario: 'bg-acento text-acento-texto border-transparent hover:opacity-90',
  secundario: 'bg-superficie text-texto border-borda-controle hover:bg-superficie-2',
  fantasma: 'bg-transparent text-acento border-transparent hover:bg-acento-fundo',
}

/** Botão padrão. Alvo mínimo de 24 px (44 px abaixo de 768 px). */
export function Botao({
  variante = 'secundario',
  className,
  type = 'button',
  children,
  ...resto
}: Props) {
  return (
    <button
      type={type}
      className={clsx(
        'alvo inline-flex items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium disabled:opacity-50',
        ESTILOS[variante],
        className,
      )}
      {...resto}
    >
      {children}
    </button>
  )
}
