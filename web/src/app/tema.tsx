import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type PreferenciaTema = 'claro' | 'escuro' | 'sistema'
const CHAVE = 'metricas-dspd:tema'

interface TemaValor {
  preferencia: PreferenciaTema
  /** Tema efetivamente aplicado. */
  efetivo: 'light' | 'dark'
  definir: (p: PreferenciaTema) => void
}

const Ctx = createContext<TemaValor | null>(null)

function lerPreferencia(): PreferenciaTema {
  try {
    const v = localStorage.getItem(CHAVE)
    return v === 'claro' || v === 'escuro' ? v : 'sistema'
  } catch {
    return 'sistema'
  }
}

const sistemaEscuro = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches

/**
 * Tema claro/escuro/sistema. A escolha persiste em localStorage; o `index.html` aplica o tema antes
 * da primeira pintura (sem flash). O atributo `data-theme` no <html> troca as variáveis CSS.
 */
export function ProvedorTema({ children }: { children: ReactNode }) {
  const [preferencia, setPreferencia] = useState<PreferenciaTema>(lerPreferencia)
  const [escuroSistema, setEscuroSistema] = useState(sistemaEscuro)

  useEffect(() => {
    if (typeof matchMedia !== 'function') return undefined
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const aoMudar = () => setEscuroSistema(mq.matches)
    mq.addEventListener('change', aoMudar)
    return () => mq.removeEventListener('change', aoMudar)
  }, [])

  const efetivo: 'light' | 'dark' =
    preferencia === 'escuro' || (preferencia === 'sistema' && escuroSistema) ? 'dark' : 'light'
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', efetivo)
  }, [efetivo])

  const definir = useCallback((p: PreferenciaTema) => {
    setPreferencia(p)
    try {
      if (p === 'sistema') localStorage.removeItem(CHAVE)
      else localStorage.setItem(CHAVE, p)
    } catch {
      /* armazenamento indisponível: vale só para esta sessão */
    }
  }, [])

  const valor = useMemo(() => ({ preferencia, efetivo, definir }), [preferencia, efetivo, definir])
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

export function useTema(): TemaValor {
  const v = useContext(Ctx)
  if (!v) throw new Error('useTema fora de <ProvedorTema>')
  return v
}
