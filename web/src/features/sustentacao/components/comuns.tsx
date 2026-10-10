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
