import { useId } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MarcacaoCriterio } from '@metricas-dspd/contratos'
import { fmtData, fmtDataCurta, fmtInteiro } from '@/lib/formatar'
import { GraficoBase } from './GraficoBase'
import { Legenda, type ItemLegenda } from './Legenda'
import { PadroesSvg } from './PadroesSvg'
import type { PontoSerie } from './SerieLinhas'
import {
  EIXO,
  rotuloEixoY,
  PADROES,
  corNaPosicao,
  corSerie,
  preenchimento,
  uidSvg,
  type IndiceCor,
  type Padrao,
} from './tema'
import { TooltipTema } from './TooltipTema'

export interface SerieArea {
  chave: string
  rotulo: string
  cor?: IndiceCor
  padrao?: Padrao
}

interface Props {
  pontos: readonly PontoSerie[]
  series: readonly SerieArea[]
  formatarX: (x: string) => string
  formatar?: (v: number) => string
  unidade: string
  descricao: string
  /** Mudanças de critério (T2.6): linha vertical tracejada no primeiro ponto em/depois da data. */
  marcacoes?: readonly MarcacaoCriterio[]
  altura?: number
}

function pontoDaMarcacao(pontos: readonly PontoSerie[], m: MarcacaoCriterio): string | null {
  for (const p of pontos) if (p.x >= m.data.slice(0, p.x.length)) return p.x
  return null
}

/** Área empilhada (ex.: fluxo acumulado/CFD): uma faixa por classe, com cor + padrão + legenda. */
export function AreaEmpilhada({
  pontos,
  series,
  formatarX,
  formatar = (v) => fmtInteiro(v),
  unidade,
  descricao,
  marcacoes = [],
  altura = 260,
}: Props) {
  const uid = uidSvg(useId())
  const cfg = series.map((s, i) => ({
    ...s,
    cor: s.cor ?? corNaPosicao(i),
    padrao: s.padrao ?? (PADROES[(i + 1) % PADROES.length] as Padrao),
  }))
  const dados = pontos.map((p) => ({ __x: p.x, ...p.valores }))
  const marcadas = marcacoes
    .map((m) => ({ m, x: pontoDaMarcacao(pontos, m) }))
    .filter((x): x is { m: MarcacaoCriterio; x: string } => x.x !== null)
  const legenda: ItemLegenda[] = cfg.map((s) => ({
    rotulo: s.rotulo,
    cor: s.cor,
    padrao: s.padrao,
  }))
  return (
    <GraficoBase
      altura={altura}
      tabela={{
        legenda: descricao,
        colunas: [
          { chave: '__x', titulo: 'Período' },
          ...cfg.map((s) => ({
            chave: s.chave,
            titulo: `${s.rotulo} (${unidade})`,
            alinhar: 'direita' as const,
          })),
        ],
        linhas: pontos.map((p) => ({
          __x: formatarX(p.x),
          ...Object.fromEntries(
            cfg.map((s) => [
              s.chave,
              p.valores[s.chave] == null ? '—' : formatar(p.valores[s.chave] as number),
            ]),
          ),
        })),
      }}
      legenda={<Legenda itens={legenda} />}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 640, height: altura }}
      >
        <ComposedChart data={dados} margin={{ top: 12, right: 12, bottom: 4, left: 4 }}>
          <PadroesSvg uid={uid} />
          <CartesianGrid stroke={EIXO.grade} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="__x" tick={EIXO.tick} stroke={EIXO.stroke} tickFormatter={formatarX} />
          <YAxis
            tick={EIXO.tick}
            stroke={EIXO.stroke}
            tickFormatter={formatar}
            width={64}
            label={rotuloEixoY(unidade)}
          />
          <Tooltip
            content={
              <TooltipTema formatar={(v) => formatar(v)} rotuloX={(x) => formatarX(String(x))} />
            }
          />
          {marcadas.map(({ m, x }) => (
            <ReferenceLine
              key={m.id}
              x={x}
              className="marca-criterio"
              stroke="var(--atencao)"
              strokeDasharray="4 3"
              strokeWidth={2}
              label={({ viewBox }: { viewBox: { x: number; y: number } }) => (
                <text x={viewBox.x + 4} y={viewBox.y + 12} fill="var(--atencao)" fontSize={11}>
                  <title>{`Mudança de critério em ${fmtData(m.data)}: ${m.descricao}`}</title>
                  {`⚑ ${fmtDataCurta(m.data)}`}
                </text>
              )}
            />
          ))}
          {cfg.map((s) => (
            <Area
              key={s.chave}
              dataKey={s.chave}
              name={s.rotulo}
              stackId="a"
              type="monotone"
              stroke={corSerie(s.cor)}
              strokeWidth={1.5}
              fill={preenchimento(s.padrao, s.cor, uid)}
              isAnimationActive={false}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </GraficoBase>
  )
}
