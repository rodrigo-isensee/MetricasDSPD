import { useId } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MarcacaoCriterio } from '@metricas-dspd/contratos'
import { fmtData, fmtNumero } from '@/lib/formatar'
import { GraficoBase } from './GraficoBase'
import { Legenda, type ItemLegenda } from './Legenda'
import { PadroesSvg } from './PadroesSvg'
import { EIXO, corNaPosicao, corSerie, uidSvg, type IndiceCor } from './tema'
import { TooltipTema } from './TooltipTema'

export interface SerieLinha {
  chave: string
  rotulo: string
  cor?: IndiceCor
  traco?: 'solido' | 'tracejado' | 'pontilhado'
  /** Desenha a série no eixo da direita (unidade diferente). */
  eixoDireito?: boolean
}

export interface FaixaEntre {
  /** Chaves das duas séries que delimitam a faixa (ex.: P50 e P95, ou cliente e time). */
  de: string
  ate: string
  rotulo: string
  cor?: IndiceCor
}

export interface PontoSerie {
  /** AAAA-MM (mês) ou AAAA-MM-DD (semana/dia): também posiciona as marcações de critério. */
  x: string
  emAndamento?: boolean
  valores: Record<string, number | null>
}

export interface SerieLinhasProps {
  pontos: readonly PontoSerie[]
  series: readonly SerieLinha[]
  faixas?: readonly FaixaEntre[]
  /** Mudanças de critério (T2.6): linha vertical tracejada com rótulo + lista em texto. */
  marcacoes?: readonly MarcacaoCriterio[]
  formatarX: (x: string) => string
  formatar?: (v: number) => string
  unidade: string
  unidadeDireita?: string
  descricao: string
  altura?: number
}

const dash = (t?: SerieLinha['traco']) =>
  t === 'tracejado' ? '7 4' : t === 'pontilhado' ? '2 4' : undefined

/** Posição (x) em que a mudança de critério cruza a série: o primeiro ponto em/depois da data. */
function pontoDaMarcacao(pontos: readonly PontoSerie[], m: MarcacaoCriterio): string | null {
  for (const p of pontos) if (p.x >= m.data.slice(0, p.x.length)) return p.x
  return null
}

/**
 * Série temporal com várias linhas, faixas entre linhas (percentis, cliente x time) e marcadores
 * de mudança de critério. Pontos nulos viram lacuna (nunca interpolados: amostra insuficiente).
 */
export function SerieLinhas({
  pontos,
  series,
  faixas = [],
  marcacoes = [],
  formatarX,
  formatar = (v) => fmtNumero(v, 1),
  unidade,
  unidadeDireita,
  descricao,
  altura = 260,
}: SerieLinhasProps) {
  const uid = uidSvg(useId())
  const cfg = series.map((s, i) => ({ ...s, cor: s.cor ?? corNaPosicao(i) }))
  const dados = pontos.map((p) => {
    const linha: Record<string, unknown> = { __x: p.x, ...p.valores }
    faixas.forEach((f, i) => {
      const a = p.valores[f.de]
      const b = p.valores[f.ate]
      linha[`__faixa${i}`] = a != null && b != null ? [Math.min(a, b), Math.max(a, b)] : null
    })
    return linha
  })
  const colunas = [
    { chave: '__x', titulo: 'Período' },
    ...cfg.map((s) => ({
      chave: s.chave,
      titulo: `${s.rotulo} (${s.eixoDireito ? (unidadeDireita ?? unidade) : unidade})`,
      alinhar: 'direita' as const,
    })),
  ]
  const linhas = pontos.map((p) => ({
    __x: p.emAndamento ? `${formatarX(p.x)} (em andamento)` : formatarX(p.x),
    ...Object.fromEntries(
      cfg.map((s) => [
        s.chave,
        p.valores[s.chave] == null
          ? '— amostra insuficiente'
          : formatar(p.valores[s.chave] as number),
      ]),
    ),
  }))
  const legenda: ItemLegenda[] = [
    ...cfg.map((s) => ({ rotulo: s.rotulo, cor: s.cor, traco: s.traco ?? ('solido' as const) })),
    ...faixas.map((f, i) => ({
      rotulo: f.rotulo,
      cor: f.cor ?? corNaPosicao(cfg.length + i),
      padrao: 'listras' as const,
    })),
  ]
  const direita = cfg.some((s) => s.eixoDireito)
  const marcadas = marcacoes
    .map((m) => ({ m, x: pontoDaMarcacao(pontos, m) }))
    .filter((x): x is { m: MarcacaoCriterio; x: string } => x.x !== null)

  return (
    <GraficoBase
      altura={altura}
      tabela={{ legenda: descricao, colunas, linhas }}
      legenda={
        <>
          <Legenda itens={legenda} />
          {marcadas.length > 0 && (
            <ul className="mt-2 list-none space-y-1 p-0 text-xs text-texto-2">
              {marcadas.map(({ m }) => (
                <li key={m.id} data-testid="marcador-criterio">
                  <span aria-hidden="true">⚑ </span>
                  Mudança de critério em {fmtData(m.data)}: {m.descricao}
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
        <ComposedChart data={dados} margin={{ top: 12, right: 12, bottom: 4, left: 4 }}>
          <PadroesSvg uid={uid} />
          <CartesianGrid stroke={EIXO.grade} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="__x"
            tick={EIXO.tick}
            stroke={EIXO.stroke}
            tickFormatter={formatarX}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="esq"
            tick={EIXO.tick}
            stroke={EIXO.stroke}
            tickFormatter={formatar}
            width={48}
          />
          {direita && (
            <YAxis
              yAxisId="dir"
              orientation="right"
              tick={EIXO.tick}
              stroke={EIXO.stroke}
              width={48}
            />
          )}
          <Tooltip
            content={
              <TooltipTema formatar={(v) => formatar(v)} rotuloX={(x) => formatarX(String(x))} />
            }
          />
          {faixas.map((f, i) => (
            <Area
              key={`f${i}`}
              yAxisId="esq"
              dataKey={`__faixa${i}`}
              name={f.rotulo}
              stroke="none"
              fill={corSerie(f.cor ?? corNaPosicao(cfg.length + i))}
              fillOpacity={0.18}
              isAnimationActive={false}
              connectNulls={false}
              legendType="none"
            />
          ))}
          {marcadas.map(({ m, x }) => (
            <ReferenceLine
              key={m.id}
              yAxisId="esq"
              x={x}
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
          {cfg.map((s) => (
            <Line
              key={s.chave}
              yAxisId={s.eixoDireito ? 'dir' : 'esq'}
              dataKey={s.chave}
              name={s.rotulo}
              type="linear"
              stroke={corSerie(s.cor)}
              strokeWidth={2.5}
              {...(dash(s.traco) ? { strokeDasharray: dash(s.traco) as string } : {})}
              dot={{ r: 3, fill: corSerie(s.cor) }}
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </GraficoBase>
  )
}
