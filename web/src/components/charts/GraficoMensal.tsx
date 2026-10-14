import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { fmtData, fmtMes } from '@/lib/formatar'
import { corSerie, EIXO, rotuloEixoY } from './tema'

export interface DadoMensal {
  /** AAAA-MM */
  mes: string
  /** `null`: não publicado (poucos itens). */
  valor: number | null
}

export interface MarcaMensal {
  id: string
  /** AAAA-MM do eixo em que a linha vertical cai. */
  mes: string
  /** AAAA-MM-DD da mudança de critério. */
  data: string
}

const COR = corSerie(1)

/** Ponto vazado: círculo aberto sobre o eixo, a forma (e o texto do mês) dizem "não publicado", nunca só a cor. */
function MarcadorVazado(p: { cx?: number; cy?: number; payload?: { vazio?: number | null } }) {
  if (p.payload?.vazio == null || p.cx === undefined || p.cy === undefined) return <g />
  return (
    <circle
      cx={p.cx}
      cy={p.cy}
      r={5}
      fill="var(--fundo)"
      stroke={COR}
      strokeWidth={2}
      data-testid="marcador-vazado"
    />
  )
}

function TickMes({
  x,
  y,
  payload,
  semValor,
}: {
  x: string | number
  y: string | number
  payload: { value: unknown }
  semValor: ReadonlySet<string>
}) {
  const mes = String(payload.value)
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fill="var(--texto-2)" fontSize={12}>
        <tspan x={0} dy={12}>
          {fmtMes(mes)}
        </tspan>
        {semValor.has(mes) && (
          <tspan x={0} dy={14} fontSize={11}>
            poucos itens
          </tspan>
        )}
      </text>
    </g>
  )
}

/**
 * Gráfico mensal pequeno (Resumo): linha para estatística (ponto sem valor = marcador vazado, sem linha ligando os
 * vizinhos) ou barras para contagem (zero na base). Mudança de critério como linha vertical com a data.
 */
export function GraficoMensal({
  dados,
  forma,
  unidade,
  eixoMax,
  marcas,
}: {
  dados: readonly DadoMensal[]
  forma: 'linha' | 'barras'
  unidade: string
  eixoMax?: number
  marcas: readonly MarcaMensal[]
}) {
  const semValor = new Set(dados.filter((d) => d.valor === null).map((d) => d.mes))
  const linhas = dados.map((d) => ({ ...d, vazio: d.valor === null ? 0 : null }))
  return (
    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 640, height: 160 }}>
      <ComposedChart data={linhas} margin={{ top: 12, right: 12, bottom: 4, left: 4 }}>
        <CartesianGrid stroke={EIXO.grade} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="mes"
          stroke={EIXO.stroke}
          interval={0}
          height={semValor.size > 0 ? 44 : 28}
          tick={(p) => <TickMes x={p.x} y={p.y} payload={p.payload} semValor={semValor} />}
        />
        <YAxis
          stroke={EIXO.stroke}
          tick={EIXO.tick}
          width={56}
          domain={[0, eixoMax ?? 'auto']}
          allowDecimals={false}
          label={rotuloEixoY(unidade)}
        />
        {marcas.map((m) => (
          <ReferenceLine
            key={m.id}
            x={m.mes}
            stroke="var(--atencao)"
            strokeDasharray="4 3"
            strokeWidth={2}
            label={{
              value: `⚑ ${fmtData(m.data)}`,
              fill: 'var(--atencao)',
              fontSize: 11,
              position: 'insideTopLeft',
            }}
          />
        ))}
        {forma === 'barras' ? (
          <Bar dataKey="valor" fill={COR} isAnimationActive={false} />
        ) : (
          <>
            <Line
              dataKey="valor"
              type="linear"
              stroke={COR}
              strokeWidth={2.5}
              dot={{ r: 4, fill: COR }}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="vazio"
              stroke="none"
              dot={<MarcadorVazado />}
              activeDot={false}
              connectNulls={false}
              isAnimationActive={false}
              legendType="none"
            />
          </>
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
