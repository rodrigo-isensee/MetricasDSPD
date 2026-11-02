import { createContext, useContext, type ReactNode } from 'react'
import { CATALOGO_CARTOES } from '@metricas-dspd/contratos'
import { Icone } from './Icone'

/** Situação de origem de UM cartão: dado fictício (com o motivo, quando o contrato o guarda) ou real. */
export interface OrigemCartao {
  ficticio: boolean
  motivo: string | null
}

const MOCK_DO_CATALOGO: ReadonlySet<string> = new Set(
  CATALOGO_CARTOES.filter((c) => c.status === 'mock').map((c) => c.id),
)

/** Sem provedor (componentes isolados): vale o status do catálogo único de cartões. */
const porCatalogo = (codigo: string): OrigemCartao => ({
  ficticio: MOCK_DO_CATALOGO.has(codigo.toLowerCase()),
  motivo: null,
})

const OrigemCtx = createContext<(codigo: string) => OrigemCartao>(porCatalogo)

export function ProvedorOrigemCartoes({
  origem,
  children,
}: {
  origem: (codigo: string) => OrigemCartao
  children: ReactNode
}) {
  return <OrigemCtx.Provider value={origem}>{children}</OrigemCtx.Provider>
}

/** `(codigo) => origem do cartão`. */
export const useOrigemCartao = (): ((codigo: string) => OrigemCartao) => useContext(OrigemCtx)

/** Selo "Dados fictícios": ícone + texto (nunca só cor). Sai do cartão só quando ele tiver dado real (P-1). */
export function SeloFicticio() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded border border-atencao bg-atencao-fundo px-2 py-0.5 text-xs font-semibold text-atencao"
      data-testid="selo-ficticio"
    >
      <Icone nome="info" className="size-3.5" />
      Dados fictícios
    </span>
  )
}

/** O selo e, quando o mapa de origem guarda, o motivo ("aguardando campo no quadro"), em texto visível. */
export function SeloOrigem({ origem }: { origem: OrigemCartao }) {
  if (!origem.ficticio) return null
  return (
    <>
      <SeloFicticio />
      {origem.motivo && (
        <span className="text-xs text-texto-2" data-testid="motivo-ficticio">
          {origem.motivo}
        </span>
      )}
    </>
  )
}
