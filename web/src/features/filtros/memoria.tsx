import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react'

/**
 * Memória de sessão dos filtros de FLUXO (spec 1.2 e 2.6.1): equipe, tipo, sistema e período
 * (+ de/ate). Fica só em memória (nunca `localStorage`; recarregar zera). Alimenta os links entre
 * painéis de fluxo, de modo que um parâmetro que o painel atual não usa (equipe no Estratégico)
 * volte quando o usuário abrir outro painel de fluxo. Prioridade e filtros da Sustentação não
 * entram aqui (a Sustentação é independente).
 */
export const CHAVES_MEMORIA = ['equipe', 'tipo', 'sistema', 'periodo', 'de', 'ate'] as const
export type ChaveMemoria = (typeof CHAVES_MEMORIA)[number]
export type Memoria = Partial<Record<ChaveMemoria, string>>

export interface MemoriaFiltros {
  ler: () => Memoria
  /** Define as chaves informadas (valor `null` apaga). Só notifica se algo mudou. */
  atualizar: (parcial: Partial<Record<ChaveMemoria, string | null>>) => void
  assinar: (aviso: () => void) => () => void
}

export function criarMemoriaFiltros(): MemoriaFiltros {
  let atual: Memoria = {}
  const avisos = new Set<() => void>()
  return {
    ler: () => atual,
    atualizar: (parcial) => {
      const prox: Memoria = {}
      for (const k of CHAVES_MEMORIA) {
        const v = k in parcial ? parcial[k] : atual[k]
        if (v !== null && v !== undefined && v !== '') prox[k] = v
      }
      const mudou = CHAVES_MEMORIA.some((k) => prox[k] !== atual[k])
      if (!mudou) return
      atual = prox
      for (const a of avisos) a()
    },
    assinar: (aviso) => {
      avisos.add(aviso)
      return () => avisos.delete(aviso)
    },
  }
}

const Ctx = createContext<MemoriaFiltros | null>(null)

/** Uma memória por aplicação (e por teste): criada no provedor, não em módulo global. */
export function ProvedorMemoriaFiltros({ children }: { children: ReactNode }) {
  const memoria = useMemo(() => criarMemoriaFiltros(), [])
  return <Ctx.Provider value={memoria}>{children}</Ctx.Provider>
}

const SEM_PROVEDOR = criarMemoriaFiltros()

export function useMemoriaFiltros(): MemoriaFiltros {
  return useContext(Ctx) ?? SEM_PROVEDOR
}

/** Valores guardados, reativos (a navegação global remonta os links quando mudam). */
export function useMemoriaAtual(): Memoria {
  const m = useMemoriaFiltros()
  return useSyncExternalStore(m.assinar, m.ler)
}
