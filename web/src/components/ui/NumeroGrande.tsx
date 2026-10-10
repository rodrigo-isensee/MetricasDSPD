import clsx from 'clsx'
import type { ReactNode } from 'react'

interface Props {
  /** A cifra: "9", "85%". */
  valor: ReactNode
  /** Rótulo e unidade: "dias úteis". */
  rotulo: ReactNode
  /** Texto completo para leitores de tela ("P85: 9 dias úteis"); a cifra sozinha não basta (8.4). */
  textoCompleto: string
  complemento?: ReactNode
  className?: string
  'data-testid'?: string
}

/** Número grande (KPI) sempre com rótulo, unidade e texto completo. */
export function NumeroGrande({
  valor,
  rotulo,
  textoCompleto,
  complemento,
  className,
  ...resto
}: Props) {
  return (
    <div
      className={clsx('rounded-md border border-borda bg-superficie-2 p-3', className)}
      {...resto}
    >
      <p className="sr-only">{textoCompleto}</p>
      <p aria-hidden="true" className="text-2xl font-bold tabular-nums text-texto">
        {valor}
      </p>
      <p aria-hidden="true" className="text-xs text-texto-2">
        {rotulo}
      </p>
      {complemento && <div className="mt-1 text-xs text-texto-2">{complemento}</div>}
    </div>
  )
}
