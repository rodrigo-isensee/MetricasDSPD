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
    <span className="relative inline-flex items-center">
      <Botao onClick={() => void copiar()} data-testid="copiar-link" className="text-xs">
        <Icone nome="link" /> Copiar link
        <span className="sr-only sm:not-sr-only"> desta visão</span>
      </Botao>
      {/* Sobreposto, fora do fluxo: aparece e some sem refluir a barra (CLS, ADR 0003 F2) e sem largura reservada,
          que estourava a página a 375 px com fonte a 200% (bug 048-02). */}
      <span
        role="status"
        className={`absolute right-0 top-full z-40 mt-1 w-max max-w-[90vw] text-sm ${
          aviso ? 'rounded-md border border-borda bg-superficie px-2 py-1 text-ok shadow-md' : ''
        }`}
      >
        {aviso}
      </span>
      {manual && (
        <label className="absolute right-0 top-full z-40 mt-1 flex w-80 max-w-[90vw] flex-col gap-1 rounded-md border border-borda bg-superficie p-2 text-sm shadow-md">
          Copie o endereço desta visão:
          <input
            ref={campo}
            readOnly
            value={manual}
            className="w-full rounded-md border border-borda-controle bg-superficie px-2 py-1"
          />
        </label>
      )}
    </span>
  )
}
