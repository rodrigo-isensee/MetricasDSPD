import { Popover } from 'radix-ui'
import { useRef, useState, type ReactNode } from 'react'
import { Icone } from './Icone'

/**
 * Dica de regra (não enfeite): abre por clique, toque ou Enter/Espaço (funciona em celular e
 * tablet), e também por foco e passagem do mouse; fecha com Esc e não some ao passar o ponteiro
 * sobre ela (WCAG 1.4.13: dispensável, persistente, pairável). O foco permanece no gatilho.
 */
export function Dica({
  texto,
  rotulo = 'Mais informações',
  children,
}: {
  texto: ReactNode
  rotulo?: string
  children?: ReactNode
}) {
  const [aberto, setAberto] = useState(false)
  const fechar = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Aberta pelo hover: o clique seguinte (do mesmo mouse) mantém aberta em vez de fechar logo após abrir.
  const porHover = useRef(false)
  const cancelar = () => {
    if (fechar.current) clearTimeout(fechar.current)
    fechar.current = null
  }
  const abrirPorHover = (e: { pointerType?: string }) => {
    if (e.pointerType && e.pointerType !== 'mouse') return
    cancelar()
    porHover.current = true
    setAberto(true)
  }
  const fecharPorHover = (e: { pointerType?: string }) => {
    if (e.pointerType && e.pointerType !== 'mouse') return
    cancelar()
    fechar.current = setTimeout(() => {
      porHover.current = false
      setAberto(false)
    }, 150)
  }
  return (
    <Popover.Root open={aberto} onOpenChange={setAberto}>
      <Popover.Trigger
        asChild
        onPointerEnter={abrirPorHover}
        onPointerLeave={fecharPorHover}
        onClick={(e) => {
          if (porHover.current) e.preventDefault()
          porHover.current = false
        }}
      >
        {children ?? (
          <button
            type="button"
            aria-label={rotulo}
            className="alvo inline-flex items-center justify-center rounded text-texto-2 hover:text-texto"
          >
            <Icone nome="info" />
          </button>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          sideOffset={6}
          role="note"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onPointerEnter={abrirPorHover}
          onPointerLeave={fecharPorHover}
          className="z-50 max-w-xs rounded-md border border-borda-controle bg-superficie px-3 py-2 text-sm text-texto shadow-lg"
        >
          {texto}
          <Popover.Arrow className="fill-superficie" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
