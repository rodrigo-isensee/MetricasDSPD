import { useEffect, useRef, useState } from 'react'
import { Botao } from './Botao'
import { Icone } from './Icone'

/**
 * "Copiar link desta visão". Se a Clipboard API falhar, mostra o endereço selecionado num campo.
 * Vive na barra única de ações (P2); o aviso "Link copiado." é anunciado por `role="status"` e o rótulo muda por 5 s.
 */
export function BotaoCopiarLink() {
  const [aviso, setAviso] = useState('')
  const [manual, setManual] = useState<string | null>(null)
  const campo = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!aviso) return undefined
    const t = setTimeout(() => setAviso(''), 5000)
    return () => clearTimeout(t)
  }, [aviso])
  useEffect(() => {
    if (manual) campo.current?.select()
  }, [manual])

  async function copiar() {
    // O parâmetro oculto `mock` nunca vai no link copiado (spec 6.6).
    const alvo = new URL(window.location.href)
    alvo.searchParams.delete('mock')
    const url = alvo.toString()
    try {
      await navigator.clipboard.writeText(url)
      setManual(null)
      setAviso('Link copiado.')
    } catch {
      setManual(url)
    }
  }

  return (
    <>
      <Botao onClick={() => void copiar()} data-testid="copiar-link" className="text-xs">
        <Icone nome="link" /> Copiar link
        <span className="sr-only sm:not-sr-only"> desta visão</span>
      </Botao>
      <span role="status" className={aviso ? 'text-sm text-ok' : 'sr-only'}>
        {aviso}
      </span>
      {manual && (
        <label className="flex basis-full flex-col gap-1 text-sm">
          Copie o endereço desta visão:
          <input
            ref={campo}
            readOnly
            value={manual}
            className="w-full rounded-md border border-borda-controle bg-superficie px-2 py-1"
          />
        </label>
      )}
    </>
  )
}
