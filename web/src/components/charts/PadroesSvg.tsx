import { idPadrao, PADROES, type IndiceCor } from './tema'

const CORES: IndiceCor[] = [1, 2, 3, 4, 5, 6, 7]

/**
 * Definições SVG de padrões (listras, pontos, hachura, cruzado) por cor de série. Existem para que
 * nenhuma série dependa só de cor (critério 98). Inclua uma vez dentro de cada gráfico Recharts.
 */
export function PadroesSvg({ uid = '' }: { uid?: string }) {
  return (
    <defs>
      {CORES.flatMap((c) =>
        PADROES.filter((p) => p !== 'liso').map((p) => {
          const cor = `var(--serie-${c})`
          return (
            <pattern
              key={idPadrao(p, c, uid)}
              id={idPadrao(p, c, uid)}
              patternUnits="userSpaceOnUse"
              width={8}
              height={8}
            >
              <rect width={8} height={8} fill="var(--superficie)" />
              {p === 'listras' && (
                <path d="M-1 1l2-2M0 8l8-8M7 9l2-2" stroke={cor} strokeWidth={2.5} />
              )}
              {p === 'hachura' && <path d="M-1 9l10-10" stroke={cor} strokeWidth={1.5} />}
              {p === 'pontos' && <circle cx={4} cy={4} r={1.8} fill={cor} />}
              {p === 'cruzado' && <path d="M0 0l8 8M8 0l-8 8" stroke={cor} strokeWidth={1.5} />}
            </pattern>
          )
        }),
      )}
    </defs>
  )
}
