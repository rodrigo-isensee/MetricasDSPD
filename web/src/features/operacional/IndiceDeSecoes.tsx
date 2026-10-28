import { useEffect, useRef, useState } from 'react'
import { usePreferenciasPainel } from '@/components/ui'
import { useAlturaCss } from '@/lib/useAlturaCss'

export type SecaoDoIndice = readonly [id: string, nome: string, cartoes: readonly string[]]

/** Âncora de "Mais métricas": aparece quando há algum complementar visível. */
export const SECAO_MAIS_METRICAS: SecaoDoIndice = ['mais-metricas', 'Mais métricas', []]

/** Leva ao título da seção (que recebe o foco), em vez de só rolar a página. O `scroll-padding-top` da raiz soma a
 * altura medida do índice (`--h-indice`), então o título para abaixo dele e não sob ele (bug 048-01). */
function irPara(alvo: HTMLElement) {
  const titulo = alvo.querySelector<HTMLElement>('h2') ?? alvo
  if (!titulo.hasAttribute('tabindex')) titulo.tabIndex = -1
  titulo.focus({ preventScroll: true })
  alvo.scrollIntoView({ block: 'start' })
}

/**
 * Índice fixo "Ir para": só as seções da visão, sem a que está toda oculta (CA-12). Destaca a seção em vista,
 * diz quantas métricas da seção estão ocultas e leva o foco ao título. Nenhum indicador novo: o que pede
 * atenção continua só na faixa "Pede atenção". Nenhum cálculo.
 */
export function IndiceDeSecoes({ secoes }: { secoes: readonly SecaoDoIndice[] }) {
  const prefs = usePreferenciasPainel()
  const [atual, setAtual] = useState<string | null>(null)
  const [topo, setTopo] = useState(0)
  const [fixo, setFixo] = useState(false)
  // Altura medida de tudo o que fica fixo acima do conteúdo: cabeçalho + filtros (só em telas médias) + o próprio índice.
  const [reservado, setReservado] = useState(0)
  const nav = useRef<HTMLElement>(null)
  useAlturaCss(nav, '--h-indice')
  const visiveis = secoes.filter(([id, , ids]) => {
    if (!prefs) return true
    if (id === SECAO_MAIS_METRICAS[0])
      return prefs.cartoes.some((c) => c.grupo === 'complementar' && !prefs.estaOculto(c.id))
    return ids.some((c) => !prefs.estaOculto(c))
  })
  const chave = visiveis.map(([id]) => id).join('|')
  useEffect(() => {
    // Abaixo do cabeçalho fixo (só fixo em telas médias para cima).
    const cab = document.querySelector('header')
    const raiz = document.documentElement
    const medir = () => {
      const sticky = !!cab && getComputedStyle(cab).position === 'sticky'
      const alto = sticky ? cab.offsetHeight : 0
      const filtros = sticky ? parseFloat(raiz.style.getPropertyValue('--h-filtros')) || 0 : 0
      const indice = (nav.current as HTMLElement).offsetHeight
      setFixo(sticky)
      setTopo(alto)
      setReservado(alto + filtros + indice)
    }
    medir()
    window.addEventListener('resize', medir)
    // --h-filtros e --h-indice mudam quando a barra de filtros ou o índice quebram de linha.
    const mut = new MutationObserver(medir)
    mut.observe(raiz, { attributes: true, attributeFilter: ['style'] })
    return () => {
      window.removeEventListener('resize', medir)
      mut.disconnect()
    }
  }, [])
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const vistas = new Set<string>()
    const ordem = chave.split('|')
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) vistas.add(e.target.id)
          else vistas.delete(e.target.id)
        }
        setAtual(ordem.find((id) => vistas.has(id)) ?? null)
      },
      { rootMargin: `-${reservado}px 0px -60% 0px` },
    )
    for (const id of ordem) {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    }
    return () => obs.disconnect()
  }, [chave, reservado])
  return (
    <nav
      ref={nav}
      aria-label="Ir para"
      data-testid="indice-secoes"
      // A BarraFiltros também é sticky logo abaixo do cabeçalho: o índice fica abaixo dela, não sobre ela.
      style={{ top: fixo ? `calc(${topo}px + var(--h-filtros))` : 0 }}
      className="sticky z-30 -mx-1 flex items-center gap-2 overflow-x-auto border-b border-borda bg-fundo px-1 py-1 text-sm"
    >
      <span className="shrink-0 text-texto-2">Ir para:</span>
      {visiveis.map(([id, nome, ids]) => {
        const ocultas = prefs ? ids.filter((c) => prefs.estaOculto(c)).length : 0
        return (
          <a
            key={id}
            href={`#${id}`}
            aria-current={atual === id ? 'location' : undefined}
            onClick={(e) => {
              const alvo = document.getElementById(id)
              if (!alvo) return
              e.preventDefault()
              history.replaceState(null, '', `#${id}`)
              irPara(alvo)
            }}
            className={`alvo inline-flex shrink-0 items-center gap-1 whitespace-nowrap underline ${
              atual === id ? 'font-bold text-texto' : 'text-acento'
            }`}
          >
            {nome}
            {ocultas > 0 && (
              <span className="text-xs font-normal text-texto-2 no-underline">
                {` (${ocultas} ${ocultas === 1 ? 'oculta' : 'ocultas'})`}
              </span>
            )}
          </a>
        )
      })}
    </nav>
  )
}
