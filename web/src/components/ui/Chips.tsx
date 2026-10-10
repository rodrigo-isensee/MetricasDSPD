import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Icone } from './Icone'

const base =
  'inline-flex items-center gap-1 rounded-full border border-borda bg-superficie-2 px-2 py-0.5 text-sm text-texto-2'

export function ChipFonte({ fonte }: { fonte: 'BusinessMap' | 'Acelerato' }) {
  return <span className={base}>Fonte: {fonte}</span>
}

export function ChipGranularidade({
  granularidade,
}: {
  granularidade: 'demanda' | 'frente' | 'projeto' | 'chamado'
}) {
  return <span className={base}>Granularidade: {granularidade}</span>
}

export function ChipMeta({ children }: { children: ReactNode }) {
  return <span className={clsx(base, 'text-texto')}>Meta: {children}</span>
}

/** Rodapé do cartão: "Filtros aplicados: ..." e "Não afetado por: ..." (tabela 2.2 da spec de UX). */
export function ChipFiltros({
  aplicados,
  naoAfetam,
}: {
  aplicados: readonly string[]
  naoAfetam: readonly string[]
}) {
  return (
    <>
      {aplicados.length > 0 && (
        <span className={base}>Filtros aplicados: {aplicados.join(' · ')}</span>
      )}
      {naoAfetam.length > 0 && (
        <span className={base}>
          <Icone nome="info" className="size-3" />
          Não afetado por: {naoAfetam.join(', ')}
        </span>
      )}
    </>
  )
}
