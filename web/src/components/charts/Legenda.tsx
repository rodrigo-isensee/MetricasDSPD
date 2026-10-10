import { useId } from 'react'
import { corSerie, idPadrao, uidSvg, type IndiceCor, type Padrao } from './tema'

export interface ItemLegenda {
  rotulo: string
  cor: IndiceCor
  padrao?: Padrao
  /** Linhas: tracejado ajuda a distinguir (P50 sólido, P85 tracejado...). */
  traco?: 'solido' | 'tracejado' | 'pontilhado'
}

/** Legenda em HTML (texto + amostra com o mesmo padrão do gráfico): cor nunca é o único canal. */
export function Legenda({ itens }: { itens: readonly ItemLegenda[] }) {
  const uid = uidSvg(useId())
  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-texto-2" aria-label="Legenda">
      {itens.map((i) => (
        <li key={i.rotulo} className="inline-flex items-center gap-1.5">
          <svg width={22} height={12} aria-hidden="true" focusable="false">
            {i.traco ? (
              <line
                x1={1}
                x2={21}
                y1={6}
                y2={6}
                stroke={corSerie(i.cor)}
                strokeWidth={2.5}
                strokeDasharray={
                  i.traco === 'tracejado' ? '6 3' : i.traco === 'pontilhado' ? '1.5 3' : undefined
                }
              />
            ) : (
              <>
                <defs>
                  <pattern
                    id={`lg-${idPadrao(i.padrao ?? 'liso', i.cor, uid)}`}
                    patternUnits="userSpaceOnUse"
                    width={8}
                    height={8}
                  >
                    <rect width={8} height={8} fill="var(--superficie)" />
                    {(i.padrao === 'listras' || i.padrao === 'hachura') && (
                      <path
                        d="M-1 9l10-10M-1 5l6-6M3 9l6-6"
                        stroke={corSerie(i.cor)}
                        strokeWidth={2}
                      />
                    )}
                    {i.padrao === 'pontos' && (
                      <circle cx={4} cy={4} r={1.8} fill={corSerie(i.cor)} />
                    )}
                    {i.padrao === 'cruzado' && (
                      <path d="M0 0l8 8M8 0l-8 8" stroke={corSerie(i.cor)} strokeWidth={1.5} />
                    )}
                  </pattern>
                </defs>
                <rect
                  x={1}
                  y={1}
                  width={20}
                  height={10}
                  rx={2}
                  fill={
                    !i.padrao || i.padrao === 'liso'
                      ? corSerie(i.cor)
                      : i.padrao === 'contorno'
                        ? 'none'
                        : `url(#lg-${idPadrao(i.padrao, i.cor, uid)})`
                  }
                  stroke={corSerie(i.cor)}
                  strokeWidth={1.5}
                />
              </>
            )}
          </svg>
          {i.rotulo}
        </li>
      ))}
    </ul>
  )
}
