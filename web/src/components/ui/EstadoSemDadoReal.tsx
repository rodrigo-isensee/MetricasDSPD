import { Icone } from './Icone'

/**
 * Métrica sem fonte real (pedido 060, P4): "Sem dado real" e o motivo em texto, sem número, percentil nem histograma.
 * Ícone + texto, nunca só cor. Não é erro: não há "Tentar de novo".
 */
export function EstadoSemDadoReal({ codigo, motivo }: { codigo: string; motivo: string }) {
  return (
    <div
      className="flex flex-col items-start gap-1 rounded-md border border-dashed border-borda-controle p-4 text-sm"
      data-testid={`estado-sem-dado-real-${codigo}`}
    >
      <p className="flex items-center gap-2 font-semibold text-texto">
        <Icone nome="info" /> Sem dado real
      </p>
      <p className="text-texto-2" data-testid={`motivo-sem-dado-real-${codigo}`}>
        {motivo}
      </p>
    </div>
  )
}
