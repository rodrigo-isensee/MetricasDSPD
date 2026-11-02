import { NOTA_OUTRA_AREA } from '../textos'
import { PESSOA_OUTRA_AREA } from '../types'

/** Explica "Outra área" uma vez por cartão, quando a linha aparece (A-3): soma de várias pessoas, sem nome. */
export function NotaOutraArea({ linhas }: { linhas: readonly { pessoaRef: string }[] }) {
  if (!linhas.some((l) => l.pessoaRef === PESSOA_OUTRA_AREA)) return null
  return (
    <p className="text-xs text-texto-2" data-testid="nota-outra-area">
      {NOTA_OUTRA_AREA}
    </p>
  )
}
