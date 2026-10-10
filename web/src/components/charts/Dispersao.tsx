import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fmtNumero } from '@/lib/formatar'
import { GraficoBase } from './GraficoBase'
import { Legenda, type ItemLegenda } from './Legenda'
import { EIXO, rotuloEixoY } from './tema'

export type FormaPonto = 'circulo' | 'losango' | 'triangulo' | 'anel'

export interface PontoDispersao {
  id: string
  /** Data (dia numérico) ou índice da categoria (0..n-1). */
  x: number
  y: number
  forma?: FormaPonto
  rotulo?: string
}

export type EixoXDispersao =
  | { tipo: 'data'; formatar: (x: number) => string }
  | { tipo: 'categorias'; categorias: readonly string[] }

export interface ReferenciaDispersao {
  valor: number
  rotulo: string
  traco: 'tracejado' | 'pontilhado' | 'solido'
}

interface Props {
  pontos: readonly PontoDispersao[]
  eixoX: EixoXDispersao
  /** Ex.: "Tempo de ciclo (dias úteis)". */
  rotuloY: string
  referencias?: readonly ReferenciaDispersao[]
  /** Legenda das formas, quando usadas ("Acima do P95", "Bloqueado"). */
  legendaFormas?: Partial<Record<FormaPonto, string>>
  descricao: string
  altura?: number
}

const DASH = { solido: undefined, tracejado: '7 4', pontilhado: '2 4' } as const

interface ShapeProps {
  cx?: number
  cy?: number
  payload?: { forma?: FormaPonto }
}

/** Marca por forma: círculo, losango, triângulo e anel duplo (a forma carrega o significado, não a cor). */
function Marca({ cx = 0, cy = 0, payload }: ShapeProps) {
  const cor = 'var(--serie-1)'
  switch (payload?.forma) {
    case 'losango':
      return (
        <path
          d={`M${cx} ${cy - 6}L${cx + 6} ${cy}L${cx} ${cy + 6}L${cx - 6} ${cy}Z`}
          fill="var(--atencao)"
          stroke="var(--texto)"
          strokeWidth={1}
        />
      )
    case 'triangulo':
      return (
        <path
          d={`M${cx} ${cy - 7}L${cx + 7} ${cy + 6}L${cx - 7} ${cy + 6}Z`}
          fill="var(--alerta)"
          stroke="var(--texto)"
          strokeWidth={1}
        />
      )
    case 'anel':
      return (
        <g>
          <circle cx={cx} cy={cy} r={7} fill="none" stroke="var(--texto)" strokeWidth={1.5} />
          <circle cx={cx} cy={cy} r={3.5} fill={cor} />
        </g>
      )
    default:
      return <circle cx={cx} cy={cy} r={4} fill={cor} fillOpacity={0.8} stroke={cor} />
  }
}

const ROTULO_FORMA: Record<FormaPonto, string> = {
  circulo: 'círculo',
  losango: 'losango',
  triangulo: 'triângulo',
  anel: 'anel (bloqueado)',
}

/** Dispersão (ex.: tempo de ciclo por data de entrega; idade por etapa). Gráfico denso: tabela como equivalente. */
export function Dispersao({
  pontos,
  eixoX,
  rotuloY,
  referencias = [],
  legendaFormas,
  descricao,
  altura = 300,
}: Props) {
  const cats = eixoX.tipo === 'categorias' ? eixoX.categorias : []
  // espalha deterministicamente os pontos de uma mesma categoria para não sobrepor
  const dados = pontos.map((p, i) => ({
    ...p,
    x: eixoX.tipo === 'categorias' ? p.x + (((i * 0.618) % 1) - 0.5) * 0.5 : p.x,
  }))
  const rotuloX = (x: number) =>
    eixoX.tipo === 'data' ? eixoX.formatar(x) : (cats[Math.round(x)] ?? '')
  const legenda: ItemLegenda[] = referencias.map((r) => ({
    rotulo: r.rotulo,
    cor: 7,
    traco: r.traco,
  }))
  return (
    <GraficoBase
      altura={altura}
      densa
      tabela={{
        legenda: descricao,
        colunas: [
          { chave: 'item', titulo: 'Item' },
          { chave: 'x', titulo: eixoX.tipo === 'data' ? 'Data' : 'Etapa' },
          { chave: 'y', titulo: rotuloY, alinhar: 'direita' },
          { chave: 'marca', titulo: 'Marca' },
        ],
        linhas: pontos.map((p) => ({
          item: p.rotulo ?? p.id,
          x: rotuloX(p.x),
          y: fmtNumero(p.y, 1),
          marca: ROTULO_FORMA[p.forma ?? 'circulo'],
        })),
      }}
      legenda={
        <>
          <Legenda itens={legenda} />
          {legendaFormas && (
            <ul
              className="mt-1 flex flex-wrap gap-x-4 text-xs text-texto-2"
              aria-label="Significado das marcas"
            >
              {Object.entries(legendaFormas).map(([f, t]) => (
                <li key={f}>
                  <strong>{ROTULO_FORMA[f as FormaPonto]}</strong>: {t}
                </li>
              ))}
            </ul>
          )}
        </>
      }
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 640, height: altura }}
      >
        <ScatterChart margin={{ top: 12, right: 16, bottom: 4, left: 4 }}>
          <CartesianGrid stroke={EIXO.grade} strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            name="x"
            tick={EIXO.tick}
            stroke={EIXO.stroke}
            tickFormatter={rotuloX}
            {...(eixoX.tipo === 'categorias'
              ? {
                  domain: [-0.5, cats.length - 0.5] as [number, number],
                  ticks: cats.map((_, i) => i),
                  interval: 0,
                }
              : { domain: ['dataMin', 'dataMax'] as ['dataMin', 'dataMax'] })}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={rotuloY}
            tick={EIXO.tick}
            stroke={EIXO.stroke}
            width={60}
            label={rotuloEixoY(rotuloY)}
          />
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              const p = payload[0]?.payload as PontoDispersao | undefined
              if (!active || !p) return null
              return (
                <div
                  role="status"
                  className="rounded-md border border-borda-controle bg-superficie px-3 py-2 text-xs text-texto shadow-lg"
                >
                  <p className="font-semibold">{p.rotulo ?? p.id}</p>
                  <p>
                    {rotuloY}: {fmtNumero(p.y, 1)}
                  </p>
                </div>
              )
            }}
          />
          {referencias.map((r) => (
            <ReferenceLine
              key={r.rotulo}
              y={r.valor}
              stroke="var(--texto)"
              strokeDasharray={DASH[r.traco]}
              label={{
                value: r.rotulo,
                fill: 'var(--texto)',
                fontSize: 11,
                position: 'insideTopRight',
              }}
            />
          ))}
          <Scatter
            data={dados}
            shape={(p: unknown) => <Marca {...(p as ShapeProps)} />}
            isAnimationActive={false}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </GraficoBase>
  )
}
