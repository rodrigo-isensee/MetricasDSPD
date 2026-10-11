import { usePreferenciasPainel } from '@/components/ui'

/**
 * "Leia junto: O5, O8": do cartão do núcleo para os complementares que o completam. O link abre a
 * seção "Mais métricas deste painel" e leva ao cartão. Some quando o par está oculto (regra do 007).
 */
export function LeiaJunto({ id }: { id: string }) {
  const p = usePreferenciasPainel()
  if (!p) return null
  const pares = (p.cartoes.find((c) => c.id === id)?.leiaJunto ?? []).flatMap((x) => {
    const c = p.cartoes.find((y) => y.id === x)
    return c?.grupo === 'complementar' && !p.estaOculto(c.id) ? [c] : []
  })
  if (pares.length === 0) return null
  return (
    <div
      className="mt-3 flex flex-wrap items-center gap-x-2 text-sm"
      data-testid={`leia-junto-${id}`}
    >
      <span>Leia junto:</span>
      <ul className="m-0 flex list-none flex-wrap gap-x-3 p-0">
        {pares.map((c) => (
          <li key={c.id}>
            <a
              href={`#${c.id}`}
              className="alvo inline-flex items-center text-acento underline"
              aria-label={`${c.codigo} ${c.rotulo}, abre Mais métricas deste painel`}
              onClick={(e) => {
                e.preventDefault()
                p.irParaComplementar(c.id)
              }}
            >
              {c.codigo}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
