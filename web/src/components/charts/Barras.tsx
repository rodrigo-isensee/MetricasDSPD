/* eslint-disable @typescript-eslint/no-deprecated -- Cell ainda é a forma suportada de pintar barras individuais (padrão listrado em período em andamento) */
import { useId, type ReactNode } from 'react'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fmtInteiro } from '@/lib/formatar'
import { GraficoBase } from './GraficoBase'
import { Legenda, type ItemLegenda } from './Legenda'
import { PadroesSvg } from './PadroesSvg'
import {
  EIXO,
  PADROES,
  rotuloEixoY,
  corNaPosicao,
  corSerie,
  preenchimento,
  uidSvg,
  type IndiceCor,
  type Padrao,
} from './tema'
import { TooltipTema } from './TooltipTema'

export interface SerieBarra {
  chave: string
  rotulo: string
  cor?: IndiceCor
  padrao?: Padrao
}

export interface CategoriaBarra {
  rotulo: string
  /** Mês/semana em andamento: desenhado com padrão listrado e rótulo (D9). */
  emAndamento?: boolean
  valores: Record<string, number | null>
}

export interface ReferenciaBarra {
  valor: number
  rotulo: string
  traco?: 'tracejado' | 'pontilhado'
}

export interface BarrasProps {
  categorias: readonly CategoriaBarra[]
  series: readonly SerieBarra[]
  /** `vertical` = colunas; `horizontal` = barras horizontais. */
  orientacao?: 'vertical' | 'horizontal'
  modo?: 'agrupado' | 'empilhado' | 'percentual'
  /** Unidade para eixo e tabela ("itens", "dias úteis", "%"). */
  unidade?: string
  formatar?: (v: number) => string
  referencias?: readonly ReferenciaBarra[]
  /**
   * Faixa sombreada entre um mínimo e um máximo (ex.: vazão O4, e o molde de O3, O9 e T4), com a linha
   * de mediana em `referencias`. Entra na legenda; é desenhada atrás das barras.
   */
  faixa?: { min: number; max: number; rotulo: string }
  /** Série sobreposta como linha, em eixo à direita (ex.: "% vencidos"). */
  linha?: { chave: string; rotulo: string; unidade?: string; formatar?: (v: number) => string }
  /** Legenda e caption da tabela equivalente. */
  descricao: string
  altura?: number
  espaco?: number
  larguraRotulos?: number
  /** Esconde a legenda HTML (série única). */
  semLegenda?: boolean
  extra?: ReactNode
}

const traco = (t?: 'tracejado' | 'pontilhado') =>
  t === 'pontilhado' ? '2 4' : t === 'tracejado' ? '6 4' : undefined

/** Colunas ou barras (simples, agrupadas, empilhadas, 100%). Padrão listrado em períodos em andamento. */
export function Barras({
  categorias,
  series,
  orientacao = 'vertical',
  modo = 'agrupado',
  unidade = 'itens',
  formatar = (v) => fmtInteiro(v),
  referencias = [],
  faixa,
  linha,
  descricao,
  altura = 260,
  espaco,
  larguraRotulos = 110,
  semLegenda,
  extra,
}: BarrasProps) {
  const horizontal = orientacao === 'horizontal'
  const dados = categorias.map((c) => ({
    __rotulo: c.rotulo,
    __andamento: c.emAndamento ?? false,
    ...c.valores,
  }))
  const uid = uidSvg(useId())
  // Duas ou mais séries sem padrão informado: cada uma recebe um padrão por posição (cor nunca é o único canal, A6).
  const semPadrao = series.filter((s) => !s.padrao).length
  const cfg = series.map((s, i) => ({
    ...s,
    cor: s.cor ?? corNaPosicao(i),
    padrao: s.padrao ?? (semPadrao >= 2 ? (PADROES[i % PADROES.length] ?? 'liso') : 'liso'),
  }))
  const empilha = modo !== 'agrupado'
  const fmtEixo = (v: number) => (modo === 'percentual' ? `${Math.round(v * 100)}%` : formatar(v))

  const colunas = [
    { chave: '__cat', titulo: 'Categoria' },
    ...cfg.map((s) => ({
      chave: s.chave,
      titulo: `${s.rotulo} (${unidade})`,
      alinhar: 'direita' as const,
    })),
    ...(linha
      ? [
          {
            chave: '__linha',
            titulo: `${linha.rotulo}${linha.unidade ? ` (${linha.unidade})` : ''}`,
            alinhar: 'direita' as const,
          },
        ]
      : []),
  ]
  const linhas = categorias.map((c) => ({
    __cat: c.emAndamento ? `${c.rotulo} (em andamento)` : c.rotulo,
    ...Object.fromEntries(
      cfg.map((s) => [
        s.chave,
        c.valores[s.chave] == null ? '—' : formatar(c.valores[s.chave] as number),
      ]),
    ),
    ...(linha
      ? {
          __linha:
            c.valores[linha.chave] == null
              ? '—'
              : (linha.formatar ?? formatar)(c.valores[linha.chave] as number),
        }
      : {}),
  }))

  const legenda: ItemLegenda[] = cfg.map((s) => ({
    rotulo: s.rotulo,
    cor: s.cor,
    padrao: s.padrao,
  }))
  if (faixa) legenda.push({ rotulo: faixa.rotulo, cor: 7, padrao: 'pontos' })
  for (const r of referencias)
    legenda.push({ rotulo: r.rotulo, cor: 7, traco: r.traco ?? 'tracejado' })
  if (linha) legenda.push({ rotulo: linha.rotulo, cor: 7, traco: 'solido' })
  if (categorias.some((c) => c.emAndamento))
    legenda.push({ rotulo: 'Em andamento (fora das estatísticas)', cor: 7, padrao: 'listras' })

  return (
    <GraficoBase
      altura={altura}
      tabela={{ legenda: descricao, colunas, linhas }}
      legenda={
        <>
          {!semLegenda && <Legenda itens={legenda} />}
          {extra}
        </>
      }
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 640, height: altura }}
      >
        <ComposedChart
          data={dados}
          layout={horizontal ? 'vertical' : 'horizontal'}
          {...(modo === 'percentual' ? { stackOffset: 'expand' as const } : {})}
          {...(espaco !== undefined ? { barCategoryGap: espaco } : {})}
          margin={{ top: 8, right: linha ? 8 : 16, bottom: 4, left: 4 }}
        >
          <PadroesSvg uid={uid} />
          <CartesianGrid
            stroke={EIXO.grade}
            strokeDasharray="3 3"
            vertical={horizontal}
            horizontal={!horizontal}
          />
          {horizontal ? (
            <>
              <XAxis
                type="number"
                tick={EIXO.tick}
                stroke={EIXO.stroke}
                tickFormatter={fmtEixo}
                label={{
                  value: modo === 'percentual' ? '%' : unidade,
                  position: 'insideBottomRight',
                  offset: -2,
                  style: { fill: 'var(--texto-2)', fontSize: 12 },
                }}
              />
              <YAxis
                type="category"
                dataKey="__rotulo"
                tick={EIXO.tick}
                stroke={EIXO.stroke}
                width={larguraRotulos}
              />
            </>
          ) : (
            <>
              <XAxis
                type="category"
                dataKey="__rotulo"
                tick={EIXO.tick}
                stroke={EIXO.stroke}
                interval="preserveStartEnd"
                minTickGap={8}
              />
              <YAxis
                yAxisId="esq"
                type="number"
                tick={EIXO.tick}
                stroke={EIXO.stroke}
                tickFormatter={fmtEixo}
                width={60}
                label={rotuloEixoY(modo === 'percentual' ? '%' : unidade)}
              />
              {linha && (
                <YAxis
                  yAxisId="dir"
                  orientation="right"
                  type="number"
                  tick={EIXO.tick}
                  stroke={EIXO.stroke}
                  width={60}
                  label={rotuloEixoY(linha.unidade ?? unidade, 'dir')}
                  tickFormatter={(v: number) => (linha.formatar ?? formatar)(v)}
                />
              )}
            </>
          )}
          <Tooltip
            content={
              <TooltipTema
                formatar={(v, k) =>
                  k === linha?.chave ? (linha.formatar ?? formatar)(v) : formatar(v)
                }
              />
            }
            cursor={{ fill: 'var(--superficie-2)' }}
          />
          {faixa && (
            <ReferenceArea
              {...(horizontal
                ? { x1: faixa.min, x2: faixa.max }
                : { y1: faixa.min, y2: faixa.max, yAxisId: 'esq' })}
              fill="var(--serie-7)"
              fillOpacity={0.14}
              stroke="var(--serie-7)"
              strokeOpacity={0.5}
              strokeDasharray="2 3"
              ifOverflow="extendDomain"
            />
          )}
          {referencias.map((r) => (
            <ReferenceLine
              key={r.rotulo}
              {...(horizontal ? { x: r.valor } : { y: r.valor, yAxisId: 'esq' })}
              stroke="var(--texto)"
              strokeDasharray={traco(r.traco) ?? '6 4'}
            />
          ))}
          {cfg.map((s) => (
            <Bar
              key={s.chave}
              dataKey={s.chave}
              name={s.rotulo}
              {...(horizontal ? {} : { yAxisId: 'esq' })}
              {...(empilha ? { stackId: 'pilha' } : {})}
              fill={preenchimento(s.padrao, s.cor, uid)}
              stroke={corSerie(s.cor)}
              strokeWidth={s.padrao === 'contorno' ? 2 : 1}
              isAnimationActive={false}
            >
              {dados.map((d, i) => (
                <Cell
                  key={i}
                  fill={
                    d.__andamento
                      ? preenchimento('listras', s.cor, uid)
                      : preenchimento(s.padrao, s.cor, uid)
                  }
                  stroke={corSerie(s.cor)}
                />
              ))}
            </Bar>
          ))}
          {linha && !horizontal && (
            <Line
              yAxisId="dir"
              dataKey={linha.chave}
              name={linha.rotulo}
              type="monotone"
              stroke="var(--texto)"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </GraficoBase>
  )
}
