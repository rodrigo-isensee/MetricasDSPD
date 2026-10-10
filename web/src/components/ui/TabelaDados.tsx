import type { ReactNode } from 'react'

export interface ColunaTabela {
  chave: string
  titulo: string
  alinhar?: 'esquerda' | 'direita'
}

export type LinhaTabela = Record<string, ReactNode>

export interface TabelaDadosProps {
  /** Vira o `caption` e o rótulo da região rolável. */
  legenda: string
  colunas: readonly ColunaTabela[]
  linhas: readonly LinhaTabela[]
  codigo?: string
  /** Texto exibido quando não há linhas. */
  vazio?: string
}

/**
 * Tabela de dados equivalente a um gráfico. A região rola na horizontal, tem rótulo e
 * `tabindex="0"` (critério 101). Primeira coluna como `th scope="row"`.
 */
export function TabelaDados({
  legenda,
  colunas,
  linhas,
  codigo,
  vazio = 'Sem dados.',
}: TabelaDadosProps) {
  return (
    <div
      role="region"
      aria-label={`Tabela de ${legenda}, role para os lados`}
      tabIndex={0}
      className="max-w-full overflow-x-auto rounded-md border border-borda"
      data-testid={codigo ? `tabela-${codigo}` : undefined}
    >
      <table className="w-full min-w-max border-collapse text-sm">
        <caption className="px-3 py-2 text-left text-xs text-texto-2">{legenda}</caption>
        <thead className="bg-superficie-2">
          <tr>
            {colunas.map((c) => (
              <th
                key={c.chave}
                scope="col"
                className={`px-3 py-2 font-semibold ${c.alinhar === 'direita' ? 'text-right' : 'text-left'}`}
              >
                {c.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.length === 0 && (
            <tr>
              <td colSpan={colunas.length} className="px-3 py-2 text-texto-2">
                {vazio}
              </td>
            </tr>
          )}
          {linhas.map((l, i) => (
            <tr key={i} className="border-t border-borda">
              {colunas.map((c, j) =>
                j === 0 ? (
                  <th
                    key={c.chave}
                    scope="row"
                    className="sticky left-0 bg-superficie px-3 py-2 text-left font-medium"
                  >
                    {l[c.chave]}
                  </th>
                ) : (
                  <td
                    key={c.chave}
                    className={`px-3 py-2 tabular-nums ${c.alinhar === 'direita' ? 'text-right' : ''}`}
                  >
                    {l[c.chave]}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
