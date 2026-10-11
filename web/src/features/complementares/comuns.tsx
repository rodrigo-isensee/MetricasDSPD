import type { ReactNode } from 'react'
import { MINIMO_AMOSTRA } from '@metricas-dspd/contratos'
import { Icone } from '@/components/ui'
import { fmtInteiro } from '@/lib/formatar'

/** Itens de uma lista que ficaram sem estatística publicada (menos de 20): nunca o número parcial. */
export function ListaInsuficientes({ itens }: { itens: readonly { rotulo: string; n: number }[] }) {
  if (itens.length === 0) return null
  return (
    <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm" data-testid="lista-insuficientes">
      {itens.map((i) => (
        <li key={i.rotulo} className="inline-flex items-center gap-1 text-atencao">
          <Icone nome="alerta" className="size-3.5" />
          {i.rotulo}: amostra insuficiente ({fmtInteiro(i.n)} de {MINIMO_AMOSTRA} itens mínimos)
        </li>
      ))}
    </ul>
  )
}

/** Orientação de leitura (regras anti-meta do briefing 7.2), sempre visível no cartão. */
export function Leia({ children }: { children: ReactNode }) {
  return <p className="text-sm text-texto-2">{children}</p>
}
