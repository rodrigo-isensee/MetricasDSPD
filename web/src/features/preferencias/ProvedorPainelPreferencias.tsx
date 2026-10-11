import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  cartaoPorId,
  cartoesDoPainel,
  type CartaoId,
  type PainelComCartoes,
} from '@metricas-dspd/contratos'
import { Botao, ContextoPreferenciasPainel as Ctx, type PreferenciasPainel } from '@/components/ui'
import { usePreferencias } from './ProvedorPreferencias'

type Foco = { tipo: 'indice'; i: number } | { tipo: 'id'; id: string }

const TITULOS = 'main [data-cartao-titulo]'

function focar(f: Foco) {
  if (f.tipo === 'id') {
    document.querySelector<HTMLElement>(`[id="${f.id}"] [data-cartao-titulo]`)?.focus()
    return
  }
  const todos = [...document.querySelectorAll<HTMLElement>(TITULOS)]
  // Sem título depois do cartão ocultado, o foco vai ao último título que sobrou ou ao h1.
  const alvo = todos[Math.min(f.i, todos.length - 1)] ?? document.querySelector<HTMLElement>('h1')
  alvo?.focus()
}

const MS_AVISO = 10_000

interface Aviso {
  id: CartaoId
  texto: string
}

/**
 * Preferências de UM painel: recorte efetivo da visita, ocultar/mostrar com Desfazer, anúncio em
 * `aria-live` e gestão de foco. O recorte vale só na renderização (a faixa "Pede atenção", os
 * avisos e o payload nunca dependem dele).
 */
export function ProvedorPainelPreferencias({
  painel,
  children,
}: {
  painel: PainelComCartoes
  children: ReactNode
}) {
  const prefs = usePreferencias()
  const cartoes = useMemo(() => cartoesDoPainel(painel), [painel])
  const lista = prefs.ocultosNaVisita(painel)
  const ocultos = useMemo(() => new Set(lista), [lista])
  const [aviso, setAviso] = useState<Aviso | null>(null)
  const [anuncio, setAnuncio] = useState('')
  const foco = useRef<Foco | null>(null)
  const { definirNaVisita } = prefs

  useEffect(() => {
    const f = foco.current
    if (!f) return
    foco.current = null
    focar(f)
  }, [ocultos])

  useEffect(() => {
    if (!aviso) return undefined
    const t = setTimeout(() => setAviso(null), MS_AVISO)
    return () => clearTimeout(t)
  }, [aviso])

  const definir = useCallback(
    (prox: readonly CartaoId[]) => definirNaVisita(painel, prox),
    [definirNaVisita, painel],
  )

  const valor = useMemo<PreferenciasPainel>(() => {
    const total = cartoes.length
    const ocultar = (id: CartaoId) => {
      const c = cartaoPorId(painel, id)
      if (!c || ocultos.has(id)) return
      const titulos = [...document.querySelectorAll<HTMLElement>(TITULOS)]
      const meu = document.querySelector<HTMLElement>(`[id="${id}"] [data-cartao-titulo]`)
      foco.current = { tipo: 'indice', i: Math.max(0, meu ? titulos.indexOf(meu) : 0) }
      const restantes = total - ocultos.size - 1
      setAnuncio(`${c.codigo} oculta. ${restantes} de ${total} métricas visíveis. Desfazer`)
      setAviso({ id, texto: `${c.codigo} oculta. ${restantes} de ${total} métricas visíveis.` })
      definir([...ocultos, id])
    }
    const mostrar = (id: CartaoId) => definir(lista.filter((x) => x !== id))
    return {
      painel,
      cartoes,
      ocultos,
      visiveis: total - ocultos.size,
      total,
      tudoOculto: ocultos.size === total,
      estaOculto: (id) => ocultos.has(id),
      ocultarCartao: ocultar,
      mostrar,
      mostrarVarios: (ids) => definir(lista.filter((x) => !ids.includes(x))),
      alternar: (id, visivel) => (visivel ? mostrar(id) : definir([...ocultos, id])),
      mostrarTodas: () => definir([]),
      usarMinhas: () => definirNaVisita(painel, null),
    }
  }, [painel, cartoes, ocultos, lista, definir, definirNaVisita])

  const desfazer = ({ id }: Aviso) => {
    foco.current = { tipo: 'id', id }
    setAnuncio('')
    setAviso(null)
    valor.mostrar(id)
  }

  return (
    <Ctx.Provider value={valor}>
      {children}
      {/* Região única e permanente: o texto muda e o leitor de tela anuncia (CA-5). */}
      <div role="status" aria-live="polite" className="sr-only" data-testid="anuncio-preferencias">
        {anuncio}
      </div>
      {aviso && (
        <div
          className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md flex-wrap items-center justify-between gap-2 rounded-lg border border-borda-controle bg-superficie p-3 text-sm shadow-lg"
          data-testid="aviso-desfazer"
        >
          <span>{aviso.texto}</span>
          <Botao onClick={() => desfazer(aviso)}>Desfazer</Botao>
        </div>
      )}
    </Ctx.Provider>
  )
}
