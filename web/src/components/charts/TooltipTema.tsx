interface Item {
  name?: string | number | undefined
  value?: unknown
  color?: string | undefined
  dataKey?: unknown
}

interface Props {
  active?: boolean | undefined
  payload?: readonly Item[] | undefined
  label?: string | number | undefined
  formatar?: ((v: number, chave: string) => string) | undefined
  rotuloX?: ((x: string | number) => string) | undefined
}

/**
 * Tooltip do tema: repete os valores em texto (WCAG 1.4.13: dispensável, persistente e legível).
 * Sem `role="status"`: o leitor de tela falaria a cada passagem do ponteiro; a tabela equivalente é a alternativa.
 */
export function TooltipTema({ active, payload, label, formatar, rotuloX }: Props) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-md border border-borda-controle bg-superficie px-3 py-2 text-xs text-texto shadow-lg">
      {label !== undefined && (
        <p className="mb-1 font-semibold">{rotuloX ? rotuloX(label) : String(label)}</p>
      )}
      <ul className="m-0 list-none p-0">
        {payload
          .filter(
            (p) => p.value !== null && p.value !== undefined && !String(p.dataKey).startsWith('__'),
          )
          .map((p, i) => {
            const v = Array.isArray(p.value) ? undefined : p.value
            return (
              <li key={i}>
                {String(p.name)}:{' '}
                {typeof v === 'number'
                  ? formatar
                    ? formatar(v, String(p.dataKey))
                    : String(v)
                  : typeof v === 'string'
                    ? v
                    : ''}
              </li>
            )
          })}
      </ul>
    </div>
  )
}
