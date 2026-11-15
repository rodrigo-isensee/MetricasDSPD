import { Icone } from '@/components/ui'
import { MINIMO_AMOSTRA } from '@metricas-dspd/contratos'
import { fmtInteiro } from '@/lib/formatar'

/** "Amostra insuficiente (12 de 20 itens mínimos)": ícone + texto, nunca número parcial (6.3). */
export function TextoInsuficiente({ n, testid }: { n: number; testid?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-atencao" data-testid={testid}>
      <Icone nome="alerta" className="size-3.5" />
      Amostra insuficiente ({fmtInteiro(n)} de {MINIMO_AMOSTRA} itens mínimos)
    </span>
  )
}

/**
 * Pedido 105 (D2, P1 = B do dono): S5, S6 e S7 só contam os cinco fluxos do PROC; quantos chamados do período ficaram de fora vem do contrato
 * (`foraDoFluxo`). Some quando é zero (a base não separa fluxo, ou nenhum ficou de fora).
 */
export function NotaForaDoFluxo({ n, testid }: { n: number; testid: string }) {
  if (n <= 0) return null
  return (
    <p className="flex items-start gap-1 text-xs text-texto-2" data-testid={testid}>
      <Icone nome="info" className="mt-0.5 size-3.5 shrink-0" />
      {fmtInteiro(n)}{' '}
      {n === 1 ? 'chamado de outro fluxo ficou' : 'chamados de outros fluxos ficaram'} fora: esta
      métrica vale só para os cinco fluxos do PROC.
    </p>
  )
}
