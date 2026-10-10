import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { CartaoMetrica } from '@/components/ui'
import { useMetrica } from '@/data'
import { propsCartao } from '@/features/painel/propsCartao'
import { fmtInteiro, fmtPct } from '@/lib/formatar'
import { NOTAS_ESTRATEGICO } from '../notas'

const TETO = 150

function BarraAtingimento({ pct }: { pct: number }) {
  return (
    <div
      aria-hidden="true"
      className="relative h-3 w-48 rounded border border-borda-controle bg-superficie-2"
    >
      <div
        className="h-full bg-[var(--serie-1)]"
        style={{ width: `${(Math.min(pct, TETO) / TETO) * 100}%` }}
      />
      <div
        className="absolute inset-y-0 w-0.5 bg-texto"
        style={{ left: `${(100 / TETO) * 100}%` }}
      />
    </div>
  )
}

export function CartaoE3({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('E3', filtros)
  const d = q.dados
  // Sem ficha primeiro (é o que pede ação); depois pelo nome (ordem neutra).
  const lista = d
    ? [...d.iniciativas].sort(
        (a, b) =>
          Number(a.ficha !== null) - Number(b.ficha !== null) ||
          a.nome.localeCompare(b.nome, 'pt-BR'),
      )
    : []
  const medida = lista.find((i) => i.atingimentoPct !== null)
  const leitura = d
    ? `${fmtInteiro(d.semFicha)} de ${fmtInteiro(d.comFicha.n)} iniciativas não têm resultado declarado.${medida?.atingimentoPct != null ? ` Entre as medidas, a iniciativa "${medida.nome}" atingiu ${fmtPct(medida.atingimentoPct)} do ganho previsto.` : ''}`
    : undefined
  return (
    <CartaoMetrica
      {...propsCartao('E3', q, NOTAS_ESTRATEGICO.E3)}
      baseVariante="censo"
      {...(d ? { baseK: d.comFicha.k, statusMeta: d.statusMeta } : {})}
      {...(leitura ? { leitura } : {})}
      semTabela
      className="lg:col-span-6"
    >
      {d && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium" data-testid="e3-contador">
            {fmtInteiro(d.comFicha.k)} de {fmtInteiro(d.comFicha.n)} iniciativas com resultado
            declarado
          </p>
          <div
            role="region"
            aria-label="Iniciativas e resultados, role para os lados"
            tabIndex={0}
            className="overflow-x-auto"
            data-testid="tabela-E3"
          >
            <table className="w-full min-w-max text-sm">
              <caption className="sr-only">Entrega × resultado por iniciativa</caption>
              <thead>
                <tr>
                  <th scope="col" className="px-2 py-1 text-left">
                    Iniciativa
                  </th>
                  <th scope="col" className="px-2 py-1 text-left">
                    Resultado esperado
                  </th>
                  <th scope="col" className="px-2 py-1 text-left">
                    Ganho medido ÷ previsto
                  </th>
                </tr>
              </thead>
              <tbody>
                {lista.map((i) => (
                  <tr key={i.cardId} className="border-t border-borda align-top">
                    <th scope="row" className="px-2 py-1 text-left font-medium">
                      {i.nome} <span className="font-normal text-texto-2">({i.situacao})</span>
                    </th>
                    <td className="px-2 py-1">
                      {i.ficha ? (
                        <>
                          {i.ficha.resultadoEsperado}
                          <br />
                          Declarado antes do início:{' '}
                          {i.ficha.declaradoAntesDoInicio ? 'sim' : 'não'}
                        </>
                      ) : (
                        <span className="rounded bg-atencao-fundo px-2 py-0.5 font-semibold text-atencao">
                          Sem resultado declarado
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-1">
                      {i.ficha && i.ficha.declaradoAntesDoInicio && i.atingimentoPct !== null ? (
                        <div className="flex items-center gap-2">
                          <BarraAtingimento pct={i.atingimentoPct} />
                          <span>
                            {fmtPct(i.atingimentoPct)} · {i.ficha.medida}
                          </span>
                        </div>
                      ) : (
                        <span className="text-texto-2">
                          {i.ficha
                            ? 'Sem medição comparável com o previsto declarado antes do início'
                            : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </CartaoMetrica>
  )
}
