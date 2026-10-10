import { Botao, Icone } from '@/components/ui'

/** Aviso de link com filtros inexistentes (spec 2.6). `role="status"`; dispensável. */
export function AvisoFiltrosInvalidos({
  invalidos,
  onEntendi,
}: {
  invalidos: readonly string[]
  onEntendi: () => void
}) {
  if (invalidos.length === 0) return null
  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-2 rounded-md border border-atencao bg-atencao-fundo px-3 py-2 text-sm"
      data-testid="aviso-filtros-invalidos"
    >
      <Icone nome="alerta" className="size-4 text-atencao" />
      <span>Alguns filtros do link não existem e foram ignorados: {invalidos.join(', ')}.</span>
      <Botao onClick={onEntendi} className="text-xs">
        Entendi
      </Botao>
    </div>
  )
}
