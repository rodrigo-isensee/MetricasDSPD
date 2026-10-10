import { useId } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fmtInteiro } from '@/lib/formatar'
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
  altura?: number
}

/** Área empilhada (ex.: fluxo acumulado/CFD): uma faixa por classe, com cor + padrão + legenda. */
export function AreaEmpilhada({
  pontos,
  series,
  formatarX,
  formatar = (v) => fmtInteiro(v),
  unidade,
  descricao,
  altura = 260,
}: Props) {
  const uid = uidSvg(useId())
  const cfg = series.map((s, i) => ({
    ...s,
    cor: s.cor ?? corNaPosicao(i),
    padrao: s.padrao ?? (PADROES[(i + 1) % PADROES.length] as Padrao),
  }))
  const dados = pontos.map((p) => ({ __x: p.x, ...p.valores }))
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
