import { createContext, useContext, type ReactNode } from 'react'
import { CATALOGO_CARTOES } from '@metricas-dspd/contratos'
import { Icone } from './Icone'

/** Situação de origem de UM cartão: dado fictício (com o motivo, quando o contrato o guarda) ou real. */
export interface OrigemCartao {
  /** Dado fictício: só na fonte mock (selo "Dados fictícios"). */
  ficticio: boolean
  /** Sem fonte real (mapa de origem do contrato): na API o cartão mostra "Sem dado real", sem número. */
  semDadoReal?: boolean
  /**
   * Pedido 070 (ADR 0028): o cartão mostra o dado SIMULADO do mock, com o selo "Simulado". Só a camada de dados liga isto
   * (a fonte decoradora), nunca uma prop de cada cartão. Nunca vale com dado real, nem com a fonte mock.
   */
  simulado?: boolean
  motivo: string | null
}

const MOCK_DO_CATALOGO: ReadonlySet<string> = new Set(
  CATALOGO_CARTOES.filter((c) => c.status === 'mock').map((c) => c.id),
)

/** Sem provedor (componentes isolados): vale o status do catálogo único de cartões. */
const porCatalogo = (codigo: string): OrigemCartao => ({
  ficticio: MOCK_DO_CATALOGO.has(codigo.toLowerCase()),
  semDadoReal: false,
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

/** O selo "Dados fictícios" do cartão (só na fonte mock). O motivo da falta de dado vive no estado "Sem dado real". */
export function SeloOrigem({ origem }: { origem: OrigemCartao }) {
  return origem.ficticio ? <SeloFicticio /> : null
}
