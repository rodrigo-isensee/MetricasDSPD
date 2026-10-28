import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  PAINEIS_COM_CARTOES,
  PREFERENCIAS_PADRAO,
  type CartaoId,
  type Papel,
  type PainelComCartoes,
  type PreferenciasMetricas,
} from '@metricas-dspd/contratos'
import {
  ErroVersaoMaisNova,
  ocultosDaSugestao,
  ocultosValidos,
  type FontePreferencias,
} from './fonte'

/** Opção do aparelho (como o tema): ligar ou desligar os marcadores de métrica oculta. Padrão: ligados (U2). */
export const CHAVE_MARCADORES = 'metricas-dspd:marcadores-ocultas'

function lerMarcadores(): boolean {
  try {
    return window.localStorage.getItem(CHAVE_MARCADORES) !== 'desligados'
  } catch {
    return true
  }
}

export type EstadoSalvar = 'ocioso' | 'salvo' | 'erro' | 'versao-nova'

export interface PreferenciasValor {
  /** false até a primeira leitura da fonte: os painéis esperam para não piscar com o recorte errado. */
  pronto: boolean
  origem: FontePreferencias['origem']
  estadoSalvar: EstadoSalvar
  /** Ocultos do perfil (o padrão pessoal). */
  ocultosSalvos: (painel: PainelComCartoes) => readonly CartaoId[]
  /** Ocultos na visita atual: o ajuste feito no painel, ou o perfil se não houve ajuste. */
  ocultosNaVisita: (painel: PainelComCartoes) => readonly CartaoId[]
  definirSalvos: (painel: PainelComCartoes, ocultos: readonly CartaoId[]) => void
  aplicarSugestao: (papel: Papel) => void
  restaurarPadrao: () => void
  /** Marcadores de métrica oculta no lugar do cartão (U2). */
  marcadores: boolean
  definirMarcadores: (ligados: boolean) => void
  /** `null` volta ao perfil ("Usar minhas preferências"); lista vazia = "Mostrar todas". */
  definirNaVisita: (painel: PainelComCartoes, ocultos: readonly CartaoId[] | null) => void
  /** Seção "Mais métricas deste painel" aberta na visita (fechada por padrão; vale na sessão, não no perfil). */
  secaoAberta: (painel: PainelComCartoes) => boolean
  definirSecaoAberta: (painel: PainelComCartoes, aberta: boolean) => void
}

const Ctx = createContext<PreferenciasValor | null>(null)

export function usePreferencias(): PreferenciasValor {
  const v = useContext(Ctx)
  if (!v) throw new Error('usePreferencias fora do ProvedorPreferencias')
  return v
}

/**
 * Estado das preferências no navegador: perfil (persistido pela `FontePreferencias`) e ajustes da
 * visita (só em memória, nunca persistidos nem na URL). Nada aqui chega a cálculo, alerta ou aviso.
 */
export function ProvedorPreferencias({
  fonte,
  children,
}: {
  fonte: FontePreferencias
  children: ReactNode
}) {
  const [prefs, setPrefs] = useState<PreferenciasMetricas>(PREFERENCIAS_PADRAO)
  const [pronto, setPronto] = useState(false)
  const [estadoSalvar, setEstadoSalvar] = useState<EstadoSalvar>('ocioso')
  const [visita, setVisita] = useState<Partial<Record<PainelComCartoes, readonly CartaoId[]>>>({})
  const [abertas, setAbertas] = useState<Partial<Record<PainelComCartoes, boolean>>>({})
  const [marcadores, setMarcadores] = useState(lerMarcadores)
  const atual = useRef(prefs)

  useEffect(() => {
    let vivo = true
    void fonte
      .obter()
      .catch(() => PREFERENCIAS_PADRAO)
      .then((p) => {
        if (!vivo) return
        atual.current = p
        setPrefs(p)
        setPronto(true)
      })
    return () => {
      vivo = false
    }
  }, [fonte])

  const gravar = useCallback(
    (paineis: PreferenciasMetricas['paineis']) => {
      const prox: PreferenciasMetricas = {
        versao: 1,
        paineis,
        atualizadoEm: new Date().toISOString(),
      }
      // A escolha fica na tela mesmo se salvar falhar (spec, fluxo 5).
      atual.current = prox
      setPrefs(prox)
      fonte.salvar(prox).then(
        () => setEstadoSalvar('salvo'),
        (e: unknown) => setEstadoSalvar(e instanceof ErroVersaoMaisNova ? 'versao-nova' : 'erro'),
      )
    },
    [fonte],
  )

  const definirMarcadores = useCallback((ligados: boolean) => {
    setMarcadores(ligados)
    try {
      window.localStorage.setItem(CHAVE_MARCADORES, ligados ? 'ligados' : 'desligados')
    } catch {
      // Sem armazenamento a escolha vale só nesta sessão.
    }
  }, [])

  const valor = useMemo<PreferenciasValor>(() => {
    const salvos = (p: PainelComCartoes) => ocultosValidos(p, prefs.paineis[p]?.ocultar)
    return {
      pronto,
      origem: fonte.origem,
      estadoSalvar,
      ocultosSalvos: salvos,
      ocultosNaVisita: (p) => visita[p] ?? salvos(p),
      definirSalvos: (p, ocultos) =>
        gravar({ ...atual.current.paineis, [p]: { ocultar: ocultosValidos(p, ocultos) } }),
      aplicarSugestao: (papel) => {
        const o = ocultosDaSugestao(papel)
        gravar(Object.fromEntries(Object.entries(o).map(([p, ocultar]) => [p, { ocultar }])))
        setVisita({})
      },
      // "Mostrar tudo" inclui os complementares: a seção abre na visita (D-4), sem entrar no perfil.
      restaurarPadrao: () => {
        gravar({})
        setVisita({})
        setAbertas(Object.fromEntries(PAINEIS_COM_CARTOES.map((p) => [p, true])))
      },
      marcadores,
      definirMarcadores,
      secaoAberta: (p) => abertas[p] ?? false,
      definirSecaoAberta: (p, aberta) => setAbertas((a) => ({ ...a, [p]: aberta })),
      definirNaVisita: (p, ocultos) =>
        setVisita((v) => {
          const prox = Object.fromEntries(Object.entries(v).filter(([k]) => k !== p))
          if (ocultos !== null) prox[p] = ocultosValidos(p, ocultos)
          return prox
        }),
    }
  }, [
    prefs,
    pronto,
    estadoSalvar,
    visita,
    abertas,
    marcadores,
    definirMarcadores,
    fonte.origem,
    gravar,
  ])

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}
