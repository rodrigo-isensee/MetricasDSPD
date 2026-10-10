import clsx from 'clsx'
import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react'

export interface ItemSeletor {
  valor: string
  rotulo: string
  /** Contagem exibida na aba (ex.: itens abertos do tipo). */
  contagem?: number
  /** Marca "(amostra insuficiente)" na aba. */
  insuficiente?: boolean
}

interface Props {
  codigo: string
  rotulo: string
  valor: string
  onChange: (valor: string) => void
  itens: readonly ItemSeletor[]
  children: ReactNode
}

/**
 * Abas locais (tipo, classe...). Uma distribuição por vez: o conteúdo do painel muda com a aba.
 * Setas movem o foco e selecionam; Tab sai para o conteúdo (spec 8.5).
 */
export function SeletorLocal({ codigo, rotulo, valor, onChange, itens, children }: Props) {
  const base = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const idx = Math.max(
    0,
    itens.findIndex((i) => i.valor === valor),
  )

  const mover = (e: KeyboardEvent, para: number) => {
    e.preventDefault()
    const n = (para + itens.length) % itens.length
    // `mover` só roda a partir de uma aba existente, então `n` sempre aponta para um item.
    onChange((itens[n] as ItemSeletor).valor)
    refs.current[n]?.focus()
  }
  const aoTeclar = (e: KeyboardEvent, i: number) => {
    if (e.key === 'ArrowRight') mover(e, i + 1)
    else if (e.key === 'ArrowLeft') mover(e, i - 1)
    else if (e.key === 'Home') mover(e, 0)
    else if (e.key === 'End') mover(e, itens.length - 1)
  }

  return (
    <div data-testid={`seletor-local-${codigo}`}>
      <div
        role="tablist"
        aria-label={rotulo}
        className="flex flex-wrap gap-1 border-b border-borda"
      >
        {itens.map((it, i) => {
          const ativo = i === idx
          return (
            <button
              key={it.valor}
              ref={(el) => {
                refs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`${base}-aba-${it.valor}`}
              aria-selected={ativo}
              aria-controls={`${base}-painel`}
              tabIndex={ativo ? 0 : -1}
              onClick={() => onChange(it.valor)}
              onKeyDown={(e) => aoTeclar(e, i)}
              className={clsx(
                'alvo -mb-px rounded-t-md border-b-2 px-3 py-1.5 text-sm',
                ativo
                  ? 'border-acento bg-acento-fundo font-semibold text-texto'
                  : 'border-transparent text-texto-2 hover:bg-superficie-2',
              )}
            >
              {it.rotulo}
              {it.contagem !== undefined && (
                <span className="ml-1 text-xs tabular-nums">({it.contagem})</span>
              )}
              {it.insuficiente && (
                <span className="ml-1 text-xs text-atencao">(amostra insuficiente)</span>
              )}
            </button>
          )
        })}
      </div>
      <div
        role="tabpanel"
        id={`${base}-painel`}
        aria-labelledby={`${base}-aba-${itens[idx]?.valor ?? ''}`}
        className="pt-3"
      >
        {children}
      </div>
    </div>
  )
}
