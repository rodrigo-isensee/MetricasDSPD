import { useEffect, useRef, useState } from 'react'
import { fmtData } from '@/lib/formatar'
import { Botao } from './Botao'
import { Icone } from './Icone'

interface Props {
  titulo: string
  /** Pergunta central do painel. */
  pergunta: string
  /** Público e cadência: "Para times · diária e semanal". */
  publico?: string
  /** Data de corte (AAAA-MM-DD). */
  dataCorte?: string | undefined
  /** Fonte de dados do painel; omitida em páginas de texto (Ajuda). */
  fonte?: string
  slug: string
  /** "Copiar link desta visão" (padrão: sim; páginas de texto não têm visão para copiar). */
  copiarLink?: boolean
  /** Frescor da fonte (selo, "Atualizado em", "Entenda"), abaixo da pergunta central. */
  frescor?: React.ReactNode
  /** Conteúdo extra no cabeçalho (seletor de cadência, recorte). */
  children?: React.ReactNode
}

/**
 * `h1` do painel (recebe o foco ao trocar de rota), pergunta central, "Dados até" e "Copiar link".
 * Se a Clipboard API falhar, mostra o endereço selecionado num campo.
 */
export function CabecalhoPainel({
  titulo,
  pergunta,
  publico,
  dataCorte,
  fonte,
  slug,
  copiarLink = true,
  frescor,
  children,
}: Props) {
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
    <div className="flex flex-col gap-2" data-testid={`painel-${slug}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h1 tabIndex={-1} data-foco-rota className="text-2xl font-bold">
          {titulo}
        </h1>
        <p className="min-h-5 w-full text-sm text-texto-2 sm:w-auto">
          {[dataCorte ? `Dados até ${fmtData(dataCorte)}` : null, fonte ? `Fonte: ${fonte}` : null]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-texto-2">
          {pergunta}
          {publico ? ` ${publico}` : ''}
        </p>
        {copiarLink && (
          <Botao onClick={() => void copiar()} data-testid="copiar-link" className="text-xs">
            <Icone nome="link" /> Copiar link
            <span className="sr-only sm:not-sr-only"> desta visão</span>
          </Botao>
        )}
      </div>
      {frescor}
      <div role="status" className="min-h-5 text-sm text-ok">
        {aviso}
      </div>
      {manual && (
        <label className="flex flex-col gap-1 text-sm">
          Copie o endereço desta visão:
          <input
            ref={campo}
            readOnly
            value={manual}
            className="w-full rounded-md border border-borda-controle bg-superficie px-2 py-1"
          />
        </label>
      )}
      {children}
    </div>
  )
}
