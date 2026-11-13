import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { z } from 'zod'
import { Botao } from './Botao'

/** Chave da memória de "Recolher cartão" no navegador (pedido 097, E5). Só códigos de cartão; nada vai à URL nem ao servidor. */
export const CHAVE_RECOLHIDOS = 'metricas-dspd:recolhidos:v1'
/** Teto de códigos por painel na leitura: o que passar é descartado em silêncio. */
export const TETO_RECOLHIDOS = 100

const CODIGO_CARTAO = /^[A-Z0-9-]{1,20}$/
const ID_PAINEL = /^[a-z0-9-]{1,30}$/

const memoriaSchema = z.object({
  versao: z.literal(1),
  paineis: z.record(z.string(), z.array(z.unknown())),
})

type Memoria = Record<string, string[]>

/** Lê e valida a memória inteira; JSON quebrado, forma inválida ou armazenamento indisponível = nada recolhido. */
function lerMemoria(): Memoria {
  try {
    const bruto = localStorage.getItem(CHAVE_RECOLHIDOS)
    const lida = memoriaSchema.safeParse(JSON.parse(bruto ?? 'null'))
    if (!lida.success) return {}
    const memoria: Memoria = {}
    for (const [painel, lista] of Object.entries(lida.data.paineis)) {
      const codigos = lista.filter(
        (c): c is string => typeof c === 'string' && CODIGO_CARTAO.test(c),
      )
      if (ID_PAINEL.test(painel) && codigos.length > 0) {
        memoria[painel] = [...new Set(codigos)].slice(0, TETO_RECOLHIDOS)
      }
    }
    return memoria
  } catch {
    return {}
  }
}

/** Grava a escolha de um painel, preservando os demais; lista vazia apaga a entrada do painel. */
function gravarPainel(painel: string, codigos: readonly string[]): void {
  const memoria = lerMemoria()
  const { [painel]: _antigo, ...outros } = memoria
  const proxima: Memoria =
    codigos.length > 0 ? { ...outros, [painel]: codigos.slice(0, TETO_RECOLHIDOS) } : outros
  try {
    if (Object.keys(proxima).length > 0) {
      localStorage.setItem(CHAVE_RECOLHIDOS, JSON.stringify({ versao: 1, paineis: proxima }))
    } else {
      localStorage.removeItem(CHAVE_RECOLHIDOS)
    }
  } catch {
    /* armazenamento indisponível: a escolha vale só para esta visita */
  }
}

interface ValorRecolhidos {
  recolhidos: ReadonlySet<string>
  alternar: (codigo: string) => void
  restaurar: () => void
}

const Ctx = createContext<ValorRecolhidos | null>(null)

/** Memória de cartões recolhidos de UM painel (`painel` é o id da página: `resumo`, `operacional`...). */
export function ProvedorRecolhidos({ painel, children }: { painel: string; children: ReactNode }) {
  const [recolhidos, setRecolhidos] = useState<ReadonlySet<string>>(
    () => new Set(lerMemoria()[painel] ?? []),
  )
  const alternar = useCallback(
    (codigo: string) => {
      const proximo = new Set(recolhidos)
      if (!proximo.delete(codigo)) proximo.add(codigo)
      setRecolhidos(proximo)
      gravarPainel(painel, [...proximo])
    },
    [recolhidos, painel],
  )
  const restaurar = useCallback(() => {
    setRecolhidos(new Set())
    gravarPainel(painel, [])
  }, [painel])
  const valor = useMemo(
    () => ({ recolhidos, alternar, restaurar }),
    [recolhidos, alternar, restaurar],
  )
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

export interface EstadoRecolhido {
  recolhido: boolean
  alternar: () => void
}

/** `null` fora de um provedor: o cartão não mostra o botão (testes isolados, Visão geral). */
export function useRecolhido(codigo: string): EstadoRecolhido | null {
  const v = useContext(Ctx)
  return v ? { recolhido: v.recolhidos.has(codigo), alternar: () => v.alternar(codigo) } : null
}

/** "Restaurar cartões recolhidos": só com ao menos um recolhido; expande todos, apaga a memória e leva o foco ao primeiro título (CA-30). */
export function RestaurarRecolhidos() {
  const v = useContext(Ctx)
  const [aviso, setAviso] = useState('')
  if (!v) return null
  const restaurar = () => {
    v.restaurar()
    setAviso('Cartões restaurados.')
    document.querySelector<HTMLElement>('[data-cartao-titulo]')?.focus()
  }
  return (
    <div data-testid="restaurar-recolhidos">
      {v.recolhidos.size > 0 && <Botao onClick={restaurar}>Restaurar cartões recolhidos</Botao>}
      <p role="status" className="sr-only">
        {aviso}
      </p>
    </div>
  )
}
