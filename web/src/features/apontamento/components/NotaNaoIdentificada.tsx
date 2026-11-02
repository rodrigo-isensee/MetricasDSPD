import { useRotulos } from '../dados'
import { DICA_NAO_IDENTIFICADA, PESSOA_NAO_IDENTIFICADA } from '../textos'
import type { RespostaApontamento } from '../types'

/** Explica "Pessoa não identificada" (CA-10) uma vez por cartão, quando ela aparece. */
export function NotaNaoIdentificada({ r }: { r: RespostaApontamento }) {
  const { haNaoIdentificada } = useRotulos(r)
  if (!haNaoIdentificada) return null
  return (
    <p className="text-xs text-texto-2" data-testid="nota-nao-identificada">
      {PESSOA_NAO_IDENTIFICADA}: {DICA_NAO_IDENTIFICADA}
    </p>
  )
}
