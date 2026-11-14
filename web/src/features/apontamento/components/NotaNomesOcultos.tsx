import { LINHA_NOMES_OCULTOS } from '../textos'
import type { RespostaApontamento } from '../types'

/** Explica "Pessoa n" onde a tela lista pessoas; some quando os nomes reais estão ligados (097, Q-3, A3). */
export function NotaNomesOcultos({ r }: { r: Pick<RespostaApontamento, 'nomesReais'> }) {
  if (r.nomesReais) return null
  return (
    <p className="text-xs text-texto-2" data-testid="linha-nomes-ocultos">
      {LINHA_NOMES_OCULTOS}
    </p>
  )
}
