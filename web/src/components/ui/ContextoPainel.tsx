import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export interface FiltroAtivo {
  /** Chave do filtro (equipe, tipo, sistema, periodo, prioridade). */
  chave: string
  /** Rótulo legível: "Equipe". */
  rotulo: string
  /** Valor legível: "Protheus". */
  valor: string
  /** Id do valor (o que a URL e `removerFiltro` entendem); `null` em filtros de valor único (período). */
  valorId?: string | null
}

export interface ContextoPainelValor {
  filtrosAtivos: readonly FiltroAtivo[]
  removerFiltro: (chave: string, valorId?: string) => void
  limparFiltros: () => void
  /** O primeiro erro de cartão da página é `role="alert"`; os demais, `status` (spec 6.4). */
  reivindicarAlerta: (id: string) => boolean
  /** O cartão informa que está atualizando (conteúdo anterior esmaecido); o painel anuncia uma vez. */
  reportarAtualizando: (id: string, atualizando: boolean) => void
}

const Ctx = createContext<ContextoPainelValor | null>(null)

interface Props {
  filtrosAtivos: readonly FiltroAtivo[]
  removerFiltro: (chave: string, valorId?: string) => void
  limparFiltros: () => void
  children: ReactNode
}

/**
 * Liga os cartões aos filtros do painel sem acoplá-los à feature de filtros: quem sabe quais
 * filtros estão ativos e como removê-los (a feature `filtros`) fornece; cartões e estados consomem.
 */
export function ProvedorContextoPainel({
  filtrosAtivos,
  removerFiltro,
  limparFiltros,
  children,
}: Props) {
  const primeiro = useRef<string | null>(null)
  const [ocupados, setOcupados] = useState<ReadonlySet<string>>(new Set())
  const [houve, setHouve] = useState(false)
  const reportarAtualizando = useCallback((id: string, atualizando: boolean) => {
    setOcupados((atual) => {
      if (atual.has(id) === atualizando) return atual
      const prox = new Set(atual)
      if (atualizando) prox.add(id)
      else prox.delete(id)
      return prox
    })
    if (atualizando) setHouve(true)
  }, [])
  const valor = useMemo<ContextoPainelValor>(
    () => ({
      filtrosAtivos,
      removerFiltro,
      limparFiltros,
      reivindicarAlerta: (id) => {
        primeiro.current ??= id
        return primeiro.current === id
      },
      reportarAtualizando,
    }),
    [filtrosAtivos, removerFiltro, limparFiltros, reportarAtualizando],
  )
  const anuncio = ocupados.size > 0 ? 'Atualizando painel' : houve ? 'Painel atualizado' : ''
  return (
    <Ctx.Provider value={valor}>
      {children}
      {/* Região única por painel: "Atualizando painel" ao começar e "Painel atualizado" ao terminar (6.1). */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
        data-testid="anuncio-painel"
        data-atualizando={ocupados.size > 0}
      >
        {anuncio}
      </div>
    </Ctx.Provider>
  )
}

/** Um botão por filtro (não por valor): "Remover filtro Equipe" tira o filtro inteiro (spec 6.2). */
export function filtrosUnicos(filtros: readonly FiltroAtivo[]): FiltroAtivo[] {
  const vistos = new Set<string>()
  return filtros.filter((f) => (vistos.has(f.chave) ? false : (vistos.add(f.chave), true)))
}

/** Fora de um painel devolve um contexto vazio (os componentes funcionam isolados, ex.: testes). */
export function useContextoPainel(): ContextoPainelValor {
  return (
    useContext(Ctx) ?? {
      filtrosAtivos: [],
      removerFiltro: () => undefined,
      limparFiltros: () => undefined,
      reivindicarAlerta: () => true,
      reportarAtualizando: () => undefined,
    }
  )
}
