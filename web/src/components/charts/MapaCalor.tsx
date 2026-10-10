import { fmtInteiro } from '@/lib/formatar'

interface Props {
  linhas: readonly string[]
  colunas: readonly string[]
  /** valores[linha][coluna] */
  valores: readonly (readonly number[])[]
  descricao: string
  rotuloLinhas: string
}

/** Mapa de calor classe x etapa: o NÚMERO está em cada célula (a cor só reforça). */
export function MapaCalor({ linhas, colunas, valores, descricao, rotuloLinhas }: Props) {
  const max = valores.reduce((m, linha) => linha.reduce((x, v) => (v > x ? v : x), m), 1)
  const nivel = (v: number) =>
    v === 0 ? 0 : (Math.min(5, Math.max(1, Math.ceil((v / max) * 5))) as 1 | 2 | 3 | 4 | 5)
  return (
    <div
      role="region"
      aria-label={`Tabela de ${descricao}, role para os lados`}
      tabIndex={0}
      className="max-w-full overflow-x-auto rounded-md border border-borda"
    >
      <table className="w-full min-w-max border-collapse text-sm">
        <caption className="px-3 py-2 text-left text-xs text-texto-2">{descricao}</caption>
        <thead className="bg-superficie-2">
          <tr>
            <th scope="col" className="px-3 py-2 text-left font-semibold">
              {rotuloLinhas}
            </th>
            {colunas.map((c) => (
              <th key={c} scope="col" className="px-3 py-2 text-right font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l, i) => (
            <tr key={l} className="border-t border-borda">
              <th scope="row" className="px-3 py-2 text-left font-medium">
                {l}
              </th>
              {colunas.map((c, j) => {
                const v = valores[i]?.[j] ?? 0
                const n = nivel(v)
                return (
                  <td
                    key={c}
                    className="px-3 py-2 text-right font-semibold tabular-nums"
                    style={
                      n === 0
                        ? undefined
                        : { background: `var(--rampa-${n})`, color: `var(--rampa-${n}-fg)` }
                    }
                  >
                    {fmtInteiro(v)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
