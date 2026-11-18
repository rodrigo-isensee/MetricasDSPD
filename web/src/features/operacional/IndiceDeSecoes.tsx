import { useRef } from 'react'
import { usePreferenciasPainel } from '@/components/ui'
import { useAlturaCss } from '@/lib/useAlturaCss'

export type SecaoDoIndice = readonly [id: string, nome: string, cartoes: readonly string[]]

/** Âncora de "Mais métricas": aparece quando há algum complementar visível. */
export const SECAO_MAIS_METRICAS: SecaoDoIndice = ['mais-metricas', 'Mais métricas', []]

/**
 * Índice "Ir para" da visão: só as seções dela, sem a que está toda oculta (CA-12). "Mais métricas" aparece
 * quando há complementar visível. Nenhum cálculo: só leva às âncoras.
 */
const SEM_REF = { current: null } as const

export function IndiceDeSecoes({
  secoes,
  fixo = false,
}: {
  secoes: readonly SecaoDoIndice[]
  /** Fixo sob cabeçalho e filtros (md+). Só o Apontamento (K-416): nos painéis o índice fixo cobria alvos rolados. */
  fixo?: boolean
}) {
  const prefs = usePreferenciasPainel()
  const nav = useRef<HTMLElement>(null)
  useAlturaCss(fixo ? nav : SEM_REF, '--h-indice')
  const visiveis = secoes.filter(([id, , ids]) => {
    if (!prefs) return true
    if (id === SECAO_MAIS_METRICAS[0])
      return prefs.cartoes.some((c) => c.grupo === 'complementar' && !prefs.estaOculto(c.id))
    return ids.some((c) => !prefs.estaOculto(c))
  })
  return (
    // K-416 (medido; só com `fixo`, usado no Apontamento; Operacional e Sustentação seguem o fluxo): cabeçalho e barra de filtros são fixos em md+; sem isto o índice rola para baixo deles e os
    // alvos ficam cobertos (WCAG 2.5.8). Fixa logo abaixo dos dois, pelas variáveis CSS medidas em execução.
    // Como o índice também é fixo, publica a própria altura em --h-indice: o scroll-padding-top de md+ a soma, para
    // que o título da seção e o foco por Tab não parem sob ele (WCAG 2.4.11). Abaixo de 768 px não é fixo e o
    // scroll-padding não a usa.
    <nav
      ref={nav}
      aria-label="Ir para"
      className={`flex flex-wrap items-center gap-2 bg-fundo text-sm ${fixo ? 'z-20 md:sticky md:top-[calc(var(--h-cabecalho)+var(--h-filtros))]' : ''}`}
    >
      <span className="text-texto-2">Ir para:</span>
      {visiveis.map(([id, nome]) => (
        <a key={id} href={`#${id}`} className="alvo inline-flex items-center text-acento underline">
          {nome}
        </a>
      ))}
    </nav>
  )
}
