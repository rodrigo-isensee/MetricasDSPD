import { fmtData } from '@/lib/formatar'
import { Botao, Icone } from '@/components/ui'
import { useCriterios } from '@/data'
import type { PreferenciasPainel } from '@/components/ui'

/** Mudança de critério em métrica oculta nunca some: gera aviso no painel com "Mostrar X" (CA-11). */
export function AvisosCriterioOcultas({ p }: { p: PreferenciasPainel }) {
  const versoes = useCriterios().data ?? []
  const avisos = p.cartoes
    .filter((c) => p.ocultos.has(c.id))
    .flatMap((c) =>
      versoes.filter((v) => v.afeta.some((m) => c.metricas.includes(m))).map((v) => ({ c, v })),
    )
  if (avisos.length === 0) return null
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0" data-testid="avisos-criterio-ocultas">
      {avisos.map(({ c, v }) => (
        <li key={`${c.id}-${v.id}`}>
          <div
            role="note"
            className="flex flex-wrap items-center gap-2 rounded-md border border-atencao bg-atencao-fundo px-3 py-2 text-sm text-texto"
          >
            <Icone nome="alerta" className="size-4 text-atencao" />
            <span>
              Critério alterado em {c.codigo} (oculta) em {fmtData(v.data)}.
            </span>
            <Botao onClick={() => p.mostrar(c.id)}>Mostrar {c.codigo}</Botao>
          </div>
        </li>
      ))}
    </ul>
  )
}
