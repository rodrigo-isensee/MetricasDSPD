import { useEffect, type RefObject } from 'react'

/**
 * Publica a altura REAL de um elemento numa variável CSS da raiz (ex.: `--h-cabecalho`), para que
 * o que fica fixo abaixo dele (`top`) e o `scroll-padding-top` não dependam de uma altura fixa
 * quando o cabeçalho quebra em duas linhas (WCAG 2.4.11: o foco nunca fica escondido). Ao
 * desmontar, volta ao valor padrão do CSS.
 */
export function useAlturaCss(ref: RefObject<HTMLElement | null>, variavel: string): void {
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const raiz = document.documentElement
    const publicar = () =>
      raiz.style.setProperty(variavel, `${el.getBoundingClientRect().height}px`)
    publicar()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', publicar)
      return () => {
        window.removeEventListener('resize', publicar)
        raiz.style.removeProperty(variavel)
      }
    }
    const obs = new ResizeObserver(publicar)
    obs.observe(el)
    return () => {
      obs.disconnect()
      raiz.style.removeProperty(variavel)
    }
  }, [ref, variavel])
}
