import { Botao, Icone } from '@/components/ui'
import { usePreferenciasPainel } from '@/components/ui'

/** Painel com todas as métricas ocultas (CA-12): a faixa "Pede atenção" e os avisos continuam. */
export function PainelOcultoVazio() {
  const p = usePreferenciasPainel()
  if (!p?.tudoOculto) return null
  return (
    <div
      className="flex flex-col items-start gap-2 rounded-md border border-dashed border-borda-controle p-4 text-sm"
      data-testid="painel-oculto-vazio"
    >
      <p className="flex items-center gap-2 font-semibold">
        <Icone nome="info" /> Você ocultou todas as métricas deste painel.
      </p>
      <p className="text-texto-2">A faixa Pede atenção e os avisos continuam.</p>
      <Botao onClick={p.mostrarTodas}>Mostrar todas</Botao>
    </div>
  )
}
