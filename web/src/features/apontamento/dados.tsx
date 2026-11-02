import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { EstadoCartao } from '@/components/ui'
import { PESSOA_NAO_IDENTIFICADA } from './textos'
import type { ChaveLista } from './filtros'
import type { Ordem } from './ordem'
import type { NivelMatriz, PessoaApontamento, RespostaApontamento } from './types'

/** O que os cartões leem da aba: a resposta (ou o estado de quem ainda não a tem), a ordem e as ações de filtro. */
export interface DadosAba {
  resposta: RespostaApontamento | undefined
  estado: EstadoCartao
  erro: Error | null
  atualizando: boolean
  tentarDeNovo: () => void
  ordem: Ordem
  nivelMatriz: NivelMatriz
  definirNivel: (n: NivelMatriz) => void
  definirLista: (chave: ChaveLista, ids: string[]) => void
  diarioDe: string | undefined
  diarioAte: string | undefined
  definirDiario: (de: string | null, ate: string | null) => void
}

const Ctx = createContext<DadosAba | null>(null)

export function ProvedorDadosAba({ valor, children }: { valor: DadosAba; children: ReactNode }) {
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

export function useDadosAba(): DadosAba {
  const v = useContext(Ctx)
  if (!v) throw new Error('useDadosAba fora de ProvedorDadosAba')
  return v
}

export interface Rotulos {
  /** Rótulo exibido da pessoa; sem de-para: "Pessoa não identificada" (CA-10), nunca juntada a outra. */
  de: (ref: string) => string
  haNaoIdentificada: boolean
}

export function useRotulos(r: RespostaApontamento): Rotulos {
  const pessoas = r.opcoes.pessoas
  return useMemo(() => {
    const mapa = new Map<string, PessoaApontamento>(pessoas.map((p) => [p.pessoaRef, p]))
    return {
      de: (ref) => {
        const p = mapa.get(ref)
        return p && p.identificada ? p.rotulo : PESSOA_NAO_IDENTIFICADA
      },
      haNaoIdentificada: pessoas.some((p) => !p.identificada),
    }
  }, [pessoas])
}

/** Total de segundos por pessoa, para a ordenação local "Total de horas" (a mesma em todos os blocos). */
export function useTotaisPorPessoa(r: RespostaApontamento): (ref: string) => number {
  const porPessoa = r.capacidade.porPessoa
  return useMemo(() => {
    const mapa = new Map<string, number>(porPessoa.map((p) => [p.pessoaRef, p.realizadoSegundos]))
    return (ref) => mapa.get(ref) ?? 0
  }, [porPessoa])
}
