import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  cartaoPorId,
  cartoesDoPainel,
  type CartaoId,
  type PainelComCartoes,
} from '@metricas-dspd/contratos'
import { useLocation } from 'react-router'
import { ContextoPreferenciasPainel as Ctx, type PreferenciasPainel } from '@/components/ui'
import { MarcadorOculto } from './MarcadorOculto'
import { usePreferencias } from './ProvedorPreferencias'

type Foco = { tipo: 'indice'; i: number } | { tipo: 'id'; id: string } | { tipo: 'metricas' }

const TITULOS = 'main [data-cartao-titulo]'

function focar(f: Foco) {
  if (f.tipo === 'metricas') {
    // Sem marcador no lugar do cartão, o controle estável mais próximo é o botão que abre as preferências do painel.
    document.querySelector<HTMLElement>('[data-testid="botao-metricas"]')?.focus()
    return
  }
  if (f.tipo === 'id') {
    document.querySelector<HTMLElement>(`[id="${f.id}"] [data-cartao-titulo]`)?.focus()
    return
  }
  const todos = [...document.querySelectorAll<HTMLElement>(TITULOS)]
  // Sem título depois do cartão ocultado, o foco vai ao último título que sobrou ou ao h1.
  const alvo = todos[Math.min(f.i, todos.length - 1)] ?? document.querySelector<HTMLElement>('h1')
  alvo?.focus()
}

/**
 * Preferências de UM painel: recorte efetivo da visita, ocultar/mostrar no lugar (o marcador é o desfazer, sem prazo), anúncio em
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
  const [anuncio, setAnuncio] = useState('')
  const [alvo, setAlvo] = useState<string | null>(null)
  const [comMarcador, setComMarcador] = useState<ReadonlySet<CartaoId>>(new Set())
  const { hash } = useLocation()
  const foco = useRef<Foco | null>(null)
  const { definirNaVisita, definirSecaoAberta, definirSalvos } = prefs

  useEffect(() => {
    const f = foco.current
    if (!f) return
    foco.current = null
    focar(f)
  }, [ocultos])

  const definir = useCallback(
    (prox: readonly CartaoId[]) => definirNaVisita(painel, prox),
    [definirNaVisita, painel],
  )

  // U1: ocultar e mostrar pelo cartão (ou pelo marcador) valem para sempre neste navegador, até a pessoa mandar
  // mostrar; o ajuste só da visita (caixas do popover) é descartado, porque o perfil passa a ser o que ela acabou de fazer.
  const lembrar = useCallback(
    (prox: readonly CartaoId[]) => {
      definirSalvos(painel, prox)
      definirNaVisita(painel, null)
    },
    [definirSalvos, definirNaVisita, painel],
  )

  const registrarMarcador = useCallback((ids: readonly CartaoId[]) => {
    setComMarcador((a) => (ids.every((x) => a.has(x)) ? a : new Set([...a, ...ids])))
    return () =>
      setComMarcador((a) =>
        ids.some((x) => a.has(x)) ? new Set([...a].filter((x) => !ids.includes(x))) : a,
      )
  }, [])

  const irParaComplementar = useCallback(
    (id: CartaoId) => {
      // Complementar oculto não tem marcador: ir até ele o mostra só nesta visita, sem mexer no que a pessoa guardou.
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

  // Link para um cartão oculto: cai no marcador e explica, sem mostrar sozinho (respeita a escolha).
  const idDoLink = hash.slice(1).toLowerCase()
  const chegadaPorLink =
    ocultos.has(idDoLink) && cartaoPorId(painel, idDoLink)?.grupo !== 'complementar'
      ? idDoLink
      : null

  const valor = useMemo<PreferenciasPainel>(() => {
    const nucleo = cartoes.filter((c) => c.grupo === 'nucleo')
    const compl = cartoes.filter((c) => c.grupo === 'complementar')
    const total = nucleo.length
    const ocultar = (id: CartaoId) => {
      const c = cartaoPorId(painel, id)
      if (!c || ocultos.has(id)) return
      const titulos = [...document.querySelectorAll<HTMLElement>(TITULOS)]
      const meu = document.querySelector<HTMLElement>(`[id="${id}"] [data-cartao-titulo]`)
      foco.current = prefs.marcadores
        ? { tipo: 'indice', i: Math.max(0, meu ? titulos.indexOf(meu) : 0) }
        : { tipo: 'metricas' }
      // O contador é do grupo do cartão: núcleo e complementares nunca se somam.
      // A pesquisa de percepção é um cartão à parte: não entra em nenhum dos dois contadores.
      const doGrupo = c.grupo === 'nucleo' ? nucleo : compl
      const restantes = doGrupo.filter((n) => !ocultos.has(n.id) && n.id !== id).length
      const qual = c.grupo === 'nucleo' ? 'métricas' : 'complementares'
      const nome = `${c.rotulo} (${c.codigo})`
      setAnuncio(
        c.grupo === 'percepcao'
          ? `${nome} oculta.`
          : `${nome} oculta. ${restantes} de ${doGrupo.length} ${qual} visíveis.`,
      )
      lembrar([...ocultos, id])
    }
    const mostrar = (id: CartaoId) => {
      const c = cartaoPorId(painel, id)
      foco.current = { tipo: 'id', id }
      if (c) setAnuncio(`${c.rotulo} (${c.codigo}) visível de novo.`)
      lembrar(lista.filter((x) => x !== id))
    }
    return {
      painel,
      cartoes,
      ocultos,
      visiveis: nucleo.filter((c) => !ocultos.has(c.id)).length,
      total,
      complementaresVisiveis: compl.filter((c) => !ocultos.has(c.id)).length,
      complementaresTotal: compl.length,
      tudoOculto: ocultos.size === cartoes.length,
      marcadores: prefs.marcadores,
      ocultaNoPadrao: (id) => prefs.ocultosSalvos(painel).includes(id),
      chegada: chegadaPorLink,
      marcador: (id, className) =>
        prefs.marcadores ? <MarcadorOculto id={id} {...(className ? { className } : {})} /> : null,
      comMarcador,
      registrarMarcador,
      secaoAberta: prefs.secaoAberta(painel),
      definirSecaoAberta: (aberta) => definirSecaoAberta(painel, aberta),
      alvoComplementar: alvo,
      irParaComplementar,
      alvoAtendido: () => setAlvo(null),
      estaOculto: (id) => ocultos.has(id),
      ocultarCartao: ocultar,
      mostrar,
      mostrarVarios: (ids) => lembrar(lista.filter((x) => !ids.includes(x))),
      alternar: (id, visivel) => (visivel ? mostrar(id) : definir([...ocultos, id])),
      mostrarTodas: () => lembrar([]),
      mostrarTodasNestaVisita: () => definir([]),
      usarMinhas: () => definirNaVisita(painel, null),
    }
  }, [
    painel,
    cartoes,
    ocultos,
    lista,
    definir,
    lembrar,
    definirNaVisita,
    definirSecaoAberta,
    prefs,
    alvo,
    irParaComplementar,
    chegadaPorLink,
    comMarcador,
    registrarMarcador,
  ])

  return (
    <Ctx.Provider value={valor}>
      {children}
      {/* Região única e permanente: o texto muda e o leitor de tela anuncia (CA-5). */}
      <div role="status" aria-live="polite" className="sr-only" data-testid="anuncio-preferencias">
        {anuncio}
      </div>
    </Ctx.Provider>
  )
}
