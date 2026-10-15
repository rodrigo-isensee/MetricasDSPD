import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useMatches, type Location } from 'react-router'
import { Icone, TituloErroContext } from '@/components/ui'
import { useFonte } from '@/data'
import { CalibracaoDasFontes } from '@/features/coleta/CalibracaoDasFontes'
import { useAlturaCss } from '@/lib/useAlturaCss'
import { AvisoDadosFicticios } from './AvisoDadosFicticios'
import { NavegacaoGlobal } from './NavegacaoGlobal'
import { Rodape } from './Rodape'
import { SeletorTema } from './SeletorTema'

/** Metadados de rota (`handle.titulo`) usados no <title> e no foco do h1. */
export interface HandleRota {
  /** Texto fixo ou função da URL (o Operacional troca o título por visão). */
  titulo?: string | ((local: Location) => string)
}

/** Foco no h1 ao trocar de rota e no título do cartão ao abrir uma âncora (#t9). */
function useFocoDeRota() {
  const { pathname, hash } = useLocation()
  const primeira = useRef(true)
  useEffect(() => {
    // Na carga inicial o foco fica no início da página (link "Pular"); só trocas de rota movem o foco ao h1.
    if (primeira.current) {
      primeira.current = false
      return undefined
    }
    if (hash) return undefined
    const t = setTimeout(
      () =>
        document
          .querySelector<HTMLElement>('main h1[data-foco-rota], main h1')
          ?.focus({ preventScroll: false }),
      50,
    )
    return () => clearTimeout(t)
  }, [pathname, hash])

  useEffect(() => {
    if (!hash) return undefined
    const id = decodeURIComponent(hash.slice(1))
    let tentativas = 0
    const buscar = () => {
      const alvo = document.getElementById(id)
      if (alvo) {
        alvo.scrollIntoView({ block: 'start' })
        const titulo = alvo.querySelector<HTMLElement>('[data-cartao-titulo]') ?? alvo
        titulo.focus({ preventScroll: true })
        return true
      }
      return false
    }
    if (buscar()) return undefined
    const t = setInterval(() => {
      if (buscar() || ++tentativas > 40) clearInterval(t)
    }, 50)
    return () => clearInterval(t)
  }, [pathname, hash])
}

function useTituloDaPagina(emErro: boolean) {
  const ficticios = useFonte().tipo === 'mock'
  const matches = useMatches()
  const local = useLocation()
  const bruto = [...matches]
    .reverse()
    .map((m) => (m.handle as HandleRota | undefined)?.titulo)
    .find(Boolean)
  const titulo = emErro
    ? 'Não foi possível abrir este painel'
    : typeof bruto === 'function'
      ? bruto(local)
      : bruto
  useEffect(() => {
    document.title = `${titulo ?? 'Métricas DSPD'} · Métricas DSPD${ficticios ? ' · Dados fictícios' : ''}`
  }, [titulo, ficticios])
}

export function AppShell() {
  useFocoDeRota()
  const [emErro, setEmErro] = useState(false)
  const definirErro = useCallback((ativo: boolean) => setEmErro(ativo), [])
  useTituloDaPagina(emErro)
  const cabecalho = useRef<HTMLElement>(null)
  useAlturaCss(cabecalho, '--h-cabecalho')
  return (
    <div className="flex min-h-dvh flex-col bg-fundo text-texto">
      <a
        href="#conteudo"
        className="sr-only-focusable fixed left-2 top-2 z-[60] rounded-md bg-acento px-3 py-2 text-acento-texto"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('conteudo')?.focus()
        }}
      >
        Pular para o conteúdo
      </a>
      <header
        ref={cabecalho}
        className="z-40 border-b border-borda bg-superficie md:sticky md:top-0"
      >
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/"
              className="alvo inline-flex items-center whitespace-nowrap text-lg font-bold text-texto"
            >
              Métricas DSPD
            </Link>
            <NavegacaoGlobal />
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <AvisoDadosFicticios />
            <SeletorTema />
            <Link
              to="/preferencias"
              className="alvo hidden items-center rounded-md px-2 py-1 text-sm font-medium text-acento underline md:inline-flex"
            >
              Preferências
            </Link>
            <Link
              to="/ajuda"
              className="alvo hidden items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-acento underline md:inline-flex"
            >
              <Icone nome="livro" /> Ajuda
            </Link>
          </div>
        </div>
      </header>
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-4 outline-none sm:px-6"
      >
        <TituloErroContext.Provider value={definirErro}>
          <CalibracaoDasFontes>
            <Outlet />
          </CalibracaoDasFontes>
        </TituloErroContext.Provider>
      </main>
      <Rodape />
    </div>
  )
}
