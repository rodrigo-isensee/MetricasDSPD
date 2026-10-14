import { Botao, Icone } from '@/components/ui'

const PERIODO_PERSONALIZADO = 'período personalizado'

/** Aviso de link com filtros inexistentes (spec 2.6). `role="status"`; dispensável. */
export function AvisoFiltrosInvalidos({
  invalidos,
  onEntendi,
  onde,
}: {
  invalidos: readonly string[]
  onEntendi: () => void
  /** Onde os valores não existem, quando a página tem duas fontes ("na Sustentação", "no fluxo de projeto"). */
  onde?: string
}) {
  if (invalidos.length === 0) return null
  const outros = invalidos.filter((i) => i !== PERIODO_PERSONALIZADO)
  const periodoInvalido = outros.length !== invalidos.length
  const partes: string[] = []
  if (outros.length > 0)
    partes.push(
      `Alguns filtros do link não existem${onde ? ` ${onde}` : ''} e foram ignorados: ${outros.join(', ')}.`,
    )
  if (periodoInvalido)
    partes.push(
      'O período personalizado do link é inválido (datas ausentes, invertidas, fora do histórico ou curtas demais) e foi ignorado.',
    )
  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-2 rounded-md border border-atencao bg-atencao-fundo px-3 py-2 text-sm"
      data-testid="aviso-filtros-invalidos"
    >
      <Icone nome="alerta" className="size-4 text-atencao" />
      <span>{partes.join(' ')}</span>
      <Botao onClick={onEntendi} className="text-xs">
        Entendi
      </Botao>
    </div>
  )
}
