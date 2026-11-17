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
export function NotaForaDoFluxo({
  n,
  testid,
  variante = 'proc',
  vazio = false,
}: {
  n: number
  testid: string
  /** `proc` (S5 a S7): só os cinco fluxos do PROC. `sem-fluxo` (S11): a regra da avaliação depende do fluxo do chamado. */
  variante?: 'proc' | 'sem-fluxo'
  /** Cartão vazio: a nota abre com "Fora da conta:" (K-404). */
  vazio?: boolean
}) {
  if (n <= 0) return null
  const um = n === 1
  const fora = vazio ? '' : um ? 'ficou fora desta métrica: ' : 'ficaram fora desta métrica: '
  const texto =
    variante === 'sem-fluxo'
      ? `${um ? 'chamado' : 'chamados'} ${fora}${um ? 'não tem' : 'não têm'} fluxo definido ou ${um ? 'tem' : 'têm'} mais de um. Sem fluxo definido, não há regra de avaliação para ${um ? 'ele' : 'eles'}.`
      : `${um ? 'chamado' : 'chamados'} ${fora}${um ? 'é de outro fluxo, não tem fluxo ou tem mais de um.' : 'são de outro fluxo, não têm fluxo ou têm mais de um.'} Ela vale só para os cinco fluxos do PROC.`
  return (
    <p className="flex items-start gap-1 text-sm text-texto-2" data-testid={testid}>
      <Icone nome="info" className="mt-1 size-3.5 shrink-0" />
      {vazio && 'Fora da conta: '}
      {fmtInteiro(n)} {texto}
    </p>
  )
}
