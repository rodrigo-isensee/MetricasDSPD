import { useEffect, useRef, useState, type CSSProperties } from 'react'

/** Altura reservada do corpo do cartão: gráfico (260 px) + faixa da frase de leitura (spec 6.1: sem salto de layout). */
export const ALTURA_ESQUELETO_PADRAO = 300

/**
 * Tempo mínimo do esqueleto (spec 6.1): só aparece se o carregamento passar de `atrasoMs` (150 ms)
 * e, uma vez mostrado, fica pelo menos `minimoMs` (300 ms) para não piscar. Precisa ser chamado por
 * quem continua montado quando os dados chegam (o `CartaoMetrica`), senão o ramo dos 300 ms nunca roda.
 *
 * `mostrar`: o cartão deve continuar no estado "carregando" (carregando de fato OU segurando o mínimo).
 * `brilho`: o esqueleto já passou dos 150 ms e deve animar.
 */
export function useEsqueleto(
  ativo: boolean,
  atrasoMs = 150,
  minimoMs = 300,
): { mostrar: boolean; brilho: boolean } {
  const [visivel, setVisivel] = useState(false)
  const desde = useRef<number | null>(null)
  useEffect(() => {
    if (ativo) {
      const t = setTimeout(() => {
        desde.current = performance.now()
        setVisivel(true)
      }, atrasoMs)
      return () => clearTimeout(t)
    }
    if (desde.current === null) return undefined
    const restante = Math.max(0, minimoMs - (performance.now() - desde.current))
    const t = setTimeout(() => {
      desde.current = null
      setVisivel(false)
    }, restante)
    return () => clearTimeout(t)
  }, [ativo, atrasoMs, minimoMs])
  return { mostrar: ativo || visivel, brilho: visivel }
}

interface Props {
  codigo: string
  titulo: string
  altura?: number
  /** Altura em coluna única (abaixo de `lg`); sem ela vale `altura` em todos os tamanhos. */
  alturaMobile?: number
  atrasoMs?: number
  /** Quando o cartão controla o tempo (useEsqueleto), passa o brilho; sem isto o próprio esqueleto controla. */
  brilho?: boolean
}

export function EsqueletoCartao({
  codigo,
  titulo,
  altura = ALTURA_ESQUELETO_PADRAO,
  alturaMobile,
  atrasoMs = 150,
  brilho,
}: Props) {
  const proprio = useEsqueleto(brilho === undefined, atrasoMs)
  const visivel = brilho ?? proprio.brilho
  // Reserva por breakpoint: coluna única abaixo de `lg`, grid de 12 colunas a partir dele.
  const vars = {
    '--alt-m': `${alturaMobile ?? altura}px`,
    '--alt-d': `${altura}px`,
  } as CSSProperties
  const reserva = 'min-h-[var(--alt-m)] lg:min-h-[var(--alt-d)]'
  return (
    <div
      data-testid={`estado-carregando-${codigo}`}
      className={reserva}
      style={vars}
      aria-busy="true"
    >
      <span className="sr-only">
        Carregando {codigo} {titulo}…
      </span>
      <div
        aria-hidden="true"
        className={`${visivel ? 'esqueleto h-full rounded-md' : 'rounded-md'} ${reserva}`}
        style={vars}
        data-visivel={visivel}
      />
    </div>
  )
}
