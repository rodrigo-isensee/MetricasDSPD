import { usePreferenciasPainel } from '@/components/ui'

export type SecaoDoIndice = readonly [id: string, nome: string, cartoes: readonly string[]]

/** Âncora de "Mais métricas": aparece quando há algum complementar visível. */
export const SECAO_MAIS_METRICAS: SecaoDoIndice = ['mais-metricas', 'Mais métricas', []]

/**
 * Índice "Ir para" da visão: só as seções dela, sem a que está toda oculta (CA-12). "Mais métricas" aparece
 * quando há complementar visível. Nenhum cálculo: só leva às âncoras.
 */
export function IndiceDeSecoes({ secoes }: { secoes: readonly SecaoDoIndice[] }) {
  const prefs = usePreferenciasPainel()
  const visiveis = secoes.filter(([id, , ids]) => {
    if (!prefs) return true
    if (id === SECAO_MAIS_METRICAS[0])
      return prefs.cartoes.some((c) => c.grupo === 'complementar' && !prefs.estaOculto(c.id))
    return ids.some((c) => !prefs.estaOculto(c))
  })
  return (
    <nav aria-label="Ir para" className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-texto-2">Ir para:</span>
      {visiveis.map(([id, nome]) => (
        <a key={id} href={`#${id}`} className="alvo inline-flex items-center text-acento underline">
          {nome}
        </a>
      ))}
    </nav>
  )
}
