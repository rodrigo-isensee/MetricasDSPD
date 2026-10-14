import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  cartaoPorId,
  cartoesDoPainel,
  type CartaoId,
  type PainelComCartoes,
} from '@metricas-dspd/contratos'
import { useLocation } from 'react-router'
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
  const [alvo, setAlvo] = useState<string | null>(null)
  const { hash } = useLocation()
  const foco = useRef<Foco | null>(null)
  const { definirNaVisita, definirSecaoAberta } = prefs

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

  const irParaComplementar = useCallback(
    (id: CartaoId) => {
      // Se a pessoa ocultou o cartão, pedir para ir até ele o mostra nesta visita.
      if (ocultos.has(id)) definir(lista.filter((x) => x !== id))
      definirSecaoAberta(painel, true)
      setAlvo(id)
    },
    [ocultos, lista, definir, definirSecaoAberta, painel],
  )

  // Link direto (`/operacional#o5`, vindo do catálogo): abre a seção e leva ao cartão. O hash de uma seção de
  // complementares (`#compl-sust-qualidade`, também o destino do redirecionador da antiga `/sustentacao`) abre a
  // seção e leva ao primeiro cartão dela.
  useEffect(() => {
    const id = hash.slice(1).toLowerCase()
    const c = cartaoPorId(painel, id)
    const secaoDeComplementares = cartoes.some(
      (x) => x.grupo === 'complementar' && `compl-${x.secao}` === id,
    )
    // Sincroniza com a URL (sistema externo): abrir a seção é a reação ao hash.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (c?.grupo === 'complementar') irParaComplementar(id)
    else if (secaoDeComplementares) {
      definirSecaoAberta(painel, true)
      setAlvo(id)
    }
    // Só o hash dispara; `irParaComplementar` muda a cada recorte e reabriria a seção à toa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, painel])

  const valor = useMemo<PreferenciasPainel>(() => {
    const nucleo = cartoes.filter((c) => c.grupo === 'nucleo')
    const compl = cartoes.filter((c) => c.grupo === 'complementar')
    const total = nucleo.length
    const ocultar = (id: CartaoId) => {
      const c = cartaoPorId(painel, id)
      if (!c || ocultos.has(id)) return
      const titulos = [...document.querySelectorAll<HTMLElement>(TITULOS)]
      const meu = document.querySelector<HTMLElement>(`[id="${id}"] [data-cartao-titulo]`)
      foco.current = { tipo: 'indice', i: Math.max(0, meu ? titulos.indexOf(meu) : 0) }
      // O contador é do grupo do cartão: núcleo e complementares nunca se somam.
      // A pesquisa de percepção é um cartão à parte: não entra em nenhum dos dois contadores.
      const doGrupo = c.grupo === 'nucleo' ? nucleo : compl
      const restantes = doGrupo.filter((n) => !ocultos.has(n.id) && n.id !== id).length
      const qual = c.grupo === 'nucleo' ? 'métricas' : 'complementares'
      const resumo =
        c.grupo === 'percepcao'
          ? `${c.codigo} oculta.`
          : `${c.codigo} oculta. ${restantes} de ${doGrupo.length} ${qual} visíveis.`
      setAnuncio(`${resumo} Desfazer`)
      setAviso({ id, texto: resumo })
      definir([...ocultos, id])
    }
    const mostrar = (id: CartaoId) => definir(lista.filter((x) => x !== id))
    return {
      painel,
      cartoes,
      ocultos,
      visiveis: nucleo.filter((c) => !ocultos.has(c.id)).length,
      total,
      complementaresVisiveis: compl.filter((c) => !ocultos.has(c.id)).length,
      complementaresTotal: compl.length,
      tudoOculto: ocultos.size === cartoes.length,
      secaoAberta: prefs.secaoAberta(painel),
      definirSecaoAberta: (aberta) => definirSecaoAberta(painel, aberta),
      alvoComplementar: alvo,
      irParaComplementar,
      alvoAtendido: () => setAlvo(null),
      estaOculto: (id) => ocultos.has(id),
      ocultarCartao: ocultar,
      mostrar,
      mostrarVarios: (ids) => definir(lista.filter((x) => !ids.includes(x))),
      alternar: (id, visivel) => (visivel ? mostrar(id) : definir([...ocultos, id])),
      mostrarTodas: () => definir([]),
      usarMinhas: () => definirNaVisita(painel, null),
    }
  }, [
    painel,
    cartoes,
    ocultos,
    lista,
    definir,
    definirNaVisita,
    definirSecaoAberta,
    prefs,
    alvo,
    irParaComplementar,
  ])

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
