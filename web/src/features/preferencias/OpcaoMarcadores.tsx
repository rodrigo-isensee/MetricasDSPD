import { usePreferencias } from './ProvedorPreferencias'

/**
 * "Marcadores de métricas ocultas": ligados por padrão (U2). Desligados, o cartão oculto some sem deixar marcador;
 * a linha do topo continua dizendo quantas estão ocultas e o título da seção mostra "N de M visíveis".
 */
export function OpcaoMarcadores() {
  const { marcadores, definirMarcadores } = usePreferencias()
  return (
    <label className="alvo flex cursor-pointer items-start gap-2 rounded px-1 py-1 text-sm hover:bg-superficie-2">
      <input
        type="checkbox"
        className="mt-0.5 size-4 accent-[var(--acento)]"
        checked={marcadores}
        onChange={(e) => definirMarcadores(e.target.checked)}
      />
      <span>
        Mostrar um marcador no lugar da métrica oculta
        <span className="block text-xs text-texto-2">
          Desligado, a métrica oculta some sem deixar marcador; a linha do topo continua dizendo
          quantas estão ocultas.
        </span>
      </span>
    </label>
  )
}
