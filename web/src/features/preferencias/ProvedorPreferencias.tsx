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
  PREFERENCIAS_PADRAO,
  type CartaoId,
  type Papel,
  type PainelComCartoes,
  type PreferenciasMetricas,
} from '@metricas-dspd/contratos'
import { ocultosDaSugestao, ocultosValidos, type FontePreferencias } from './fonte'

export type EstadoSalvar = 'ocioso' | 'salvo' | 'erro'

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
  /** `null` volta ao perfil ("Usar minhas preferências"); lista vazia = "Mostrar todas". */
  definirNaVisita: (painel: PainelComCartoes, ocultos: readonly CartaoId[] | null) => void
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
        () => setEstadoSalvar('erro'),
      )
    },
    [fonte],
  )

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
      restaurarPadrao: () => {
        gravar({})
        setVisita({})
      },
      definirNaVisita: (p, ocultos) =>
        setVisita((v) => {
          const prox = Object.fromEntries(Object.entries(v).filter(([k]) => k !== p))
          if (ocultos !== null) prox[p] = ocultosValidos(p, ocultos)
          return prox
        }),
    }
  }, [prefs, pronto, estadoSalvar, visita, fonte.origem, gravar])

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}
