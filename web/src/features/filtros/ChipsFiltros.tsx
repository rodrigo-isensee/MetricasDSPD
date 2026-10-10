import { Icone } from '@/components/ui'
import type { ChipFiltro } from './useFiltros'

/** Chips dos filtros ativos (só os fora do padrão). Cada um tem botão de remover acessível. */
export function ChipsFiltros({
  chips,
  onRemover,
}: {
  chips: readonly ChipFiltro[]
  onRemover: (chave: string, valorId?: string) => void
}) {
  if (chips.length === 0) return null
  return (
    <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Filtros ativos">
      {chips.map((c) => (
        <li
          key={`${c.chave}:${c.valorId ?? ''}`}
          className="inline-flex items-center gap-1 rounded-full border border-borda-controle bg-acento-fundo py-0.5 pl-3 pr-1 text-sm"
          data-testid={`chip-filtro-${c.chave}`}
        >
          {c.rotulo}: {c.valor}
          <button
            type="button"
            className="alvo inline-flex items-center justify-center rounded-full hover:bg-superficie-2"
            aria-label={`Remover filtro ${c.rotulo}: ${c.valor}`}
            onClick={() => onRemover(c.chave, c.valorId ?? undefined)}
          >
            <Icone nome="x" className="size-3.5" />
          </button>
        </li>
      ))}
    </ul>
  )
}
