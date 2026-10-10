import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { Link } from 'react-router'
import { fmtData, fmtDataCurta } from '@/lib/formatar'
import { Icone } from './Icone'

/** "T2" e "EI-SUST" viram o id de métrica ("T2", "EI_SUST"). */
export const idDeMetrica = (codigo: string): string => codigo.toUpperCase().replace(/-/g, '_')

interface Calibracao {
  /** Ids de métrica em calibração, das duas fontes (os ids nunca se repetem entre elas). */
  metricas: ReadonlySet<string>
  /** false enquanto o estado de coleta carrega: nenhum status de meta aparece antes de saber (CA-05). */
  pronta: boolean
  /** A leitura do estado de coleta falhou: sem saber se há calibração, o status de meta fica oculto (conservador). */
  statusOculto?: boolean
}
const SEM_CALIBRACAO: Calibracao = { metricas: new Set(), pronta: true, statusOculto: false }
const CalibracaoCtx = createContext<Calibracao>(SEM_CALIBRACAO)

/** O cartão atual está em calibração: o `StatusMeta` dentro dele vira o selo, nunca "Dentro/Fora da meta". */
const CartaoCalibracaoCtx = createContext(false)

export function ProvedorCalibracao({
  metricas,
  pronta,
  statusOculto = false,
  children,
}: Calibracao & { children: ReactNode }) {
  const valor = useMemo(
    () => ({ metricas, pronta, statusOculto }),
    [metricas, pronta, statusOculto],
  )
  return <CalibracaoCtx.Provider value={valor}>{children}</CalibracaoCtx.Provider>
}

export function ProvedorCartaoCalibracao({
  ativo,
  children,
}: {
  ativo: boolean
  children: ReactNode
}) {
  return <CartaoCalibracaoCtx.Provider value={ativo}>{children}</CartaoCalibracaoCtx.Provider>
}

export const useCartaoCalibracao = (): boolean => useContext(CartaoCalibracaoCtx)

/** `(codigo) => está em calibração?`. Sem provedor, nada está (componentes isolados). */
export function useEmCalibracao(): (codigo: string) => boolean {
  const { metricas } = useContext(CalibracaoCtx)
  return (codigo) => metricas.has(idDeMetrica(codigo))
}

export const useStatusOculto = (): boolean => !!useContext(CalibracaoCtx).statusOculto

export const useCalibracaoPronta = (): boolean => useContext(CalibracaoCtx).pronta

/** Selo "Em calibração": ícone + texto (nunca só cor). */
export function SeloCalibracao({
  texto = 'Em calibração',
  testid = 'selo-calibracao',
}: {
  texto?: string
  testid?: string
}) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded border border-acento bg-acento-fundo px-2 py-0.5 text-xs font-semibold text-acento"
      data-testid={testid}
    >
      <Icone nome="info" className="size-3.5" />
      {texto}
    </span>
  )
}

interface FaixaProps {
  fonte: string
  janelas: readonly { inicio: string; fim: string }[]
  /** Destino de "Saiba mais" (a janela em `/dados`). */
  saibaMais: string
  testid?: string
}

/**
 * Faixa de calibração (W2): o painel continua visível; dados de calibração não servem para cobrar
 * ninguém. `role="status"`, ícone + texto. A janela é definida pelo sistema, nunca cadastrada.
 */
export function FaixaCalibracao({ fonte, janelas, saibaMais, testid }: FaixaProps) {
  const periodo = janelas.map((j) => `${fmtDataCurta(j.inicio)} a ${fmtData(j.fim)}`).join('; ')
  return (
    <div
      role="status"
      className="flex flex-wrap items-start gap-2 rounded-md border border-acento bg-acento-fundo p-3 text-sm text-texto"
      data-testid={testid ?? 'faixa-calibracao'}
    >
      <Icone nome="info" className="mt-0.5 size-4 shrink-0 text-acento" />
      <p className="min-w-0 flex-1">
        Dados de calibração ({fonte}, {periodo}, janela definida automaticamente). Servem para
        ajustar o processo, não para cobrar pessoas ou times. Metas não são avaliadas neste período.
      </p>
      <Link to={saibaMais} className="alvo whitespace-nowrap text-acento underline">
        Saiba mais sobre a calibração
      </Link>
    </div>
  )
}
