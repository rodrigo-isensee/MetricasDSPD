import clsx from 'clsx'
import { FAIXAS_ESCALA, type ResultadoPV1 } from '@metricas-dspd/contratos'
import { Icone, TabelaDados, useModoTabela } from '@/components/ui'
import { fmtInteiro } from '@/lib/formatar'
import { nomeDaFaixa, textoContagem } from './formatar'

type Ok = Extract<ResultadoPV1, { status: 'ok' }>
type Pergunta = Ok['questionario']['perguntas'][number]
type Publicado = Extract<Ok['consolidado'], { status: 'publicado' }>

/**
 * Uma cor por faixa, mas a faixa nunca depende dela: cada trecho traz o número de respostas e a legenda
 * escrita vem acima (a tabela equivalente traz o resto). Contraste conferido nos dois temas.
 */
const CLASSE_FAIXA = [
  'bg-alerta text-acento-texto',
  'bg-alerta-fundo text-texto',
  'bg-superficie-2 text-texto',
  'bg-acento-fundo text-texto',
  'bg-acento text-acento-texto',
] as const

/** Legenda textual das 5 faixas (a mesma para todas as barras do cartão). */
export function LegendaFaixas() {
  return (
    <ul
      className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-xs text-texto-2"
      data-testid="legenda-faixas"
    >
      {FAIXAS_ESCALA.map((rotulo, i) => (
        <li key={rotulo} className="inline-flex items-center gap-1">
          <span
            aria-hidden="true"
            className={clsx(
              'inline-block size-3 rounded-sm border border-borda-controle',
              CLASSE_FAIXA[i]?.split(' ')[0],
            )}
          />
          {i + 1} {rotulo}
        </li>
      ))}
      <li>Os números são quantidade de respostas.</li>
    </ul>
  )
}

/** Aviso do bloco que não chegou ao mínimo: só o total de respostas, nunca as faixas (U2, provisório). */
export function BaseInsuficiente({
  n,
  minimo,
  testid,
}: {
  n: number
  minimo: number
  testid?: string
}) {
  return (
    <p
      className="flex items-center gap-2 rounded-md border border-dashed border-atencao bg-atencao-fundo p-3 text-sm text-texto"
      data-testid={testid}
    >
      <Icone nome="alerta" className="size-4 shrink-0 text-atencao" />
      <span>
        Base insuficiente: {fmtInteiro(n)} {n === 1 ? 'resposta' : 'respostas'}. Mínimo{' '}
        {fmtInteiro(minimo)} para publicar.
      </span>
    </p>
  )
}

/** Barras empilhadas, uma por pergunta, ou a tabela equivalente quando o cartão está em "Ver como tabela". */
export function Distribuicao({
  bloco,
  perguntas,
  codigo,
}: {
  bloco: Publicado
  perguntas: readonly Pergunta[]
  codigo: string
}) {
  const { modo } = useModoTabela()
  const ordenadas = [...perguntas].sort((a, b) => a.ordem - b.ordem)
  const linhas = ordenadas.flatMap((p) => {
    const r = bloco.perguntas.find((x) => x.codigo === p.codigo)
    return r ? [{ pergunta: p, faixas: r.faixas }] : []
  })
  if (modo === 'tabela')
    return (
      <TabelaDados
        codigo={`PV1-${codigo}`}
        legenda={`Respostas por pergunta e faixa da escala (${fmtInteiro(bloco.n)} respostas)`}
        colunas={[
          { chave: 'p', titulo: 'Pergunta' },
          ...FAIXAS_ESCALA.map((_, i) => ({
            chave: `f${i + 1}`,
            titulo: nomeDaFaixa(i + 1),
            alinhar: 'direita' as const,
          })),
        ]}
        linhas={linhas.map(({ pergunta, faixas }) => ({
          p: pergunta.texto,
          ...Object.fromEntries(
            [1, 2, 3, 4, 5].map((f) => {
              const x = faixas.find((y) => y.faixa === f)
              return [`f${f}`, x ? textoContagem(x.contagem) : '—']
            }),
          ),
        }))}
      />
    )
  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0" data-testid={`distribuicao-${codigo}`}>
      {linhas.map(({ pergunta, faixas }) => {
        const descricao = `${pergunta.texto}: ${faixas
          .map((f) => `${f.contagem.k} ${FAIXAS_ESCALA[f.faixa - 1]}`)
          .join(', ')}. Total de ${fmtInteiro(bloco.n)} respostas.`
        return (
          <li
            key={pergunta.codigo}
            className="grid grid-cols-1 items-center gap-1 sm:grid-cols-[minmax(0,16rem)_1fr] sm:gap-3"
          >
            <span className="text-sm">{pergunta.texto}</span>
            <div
              role="img"
              aria-label={descricao}
              className="flex h-7 overflow-hidden rounded border border-borda-controle text-xs font-semibold"
            >
              {faixas.map((f) => (
                <span
                  key={f.faixa}
                  data-faixa={f.faixa}
                  style={{ flexGrow: f.contagem.k, flexBasis: 0 }}
                  className={clsx(
                    'flex items-center justify-center border-r border-superficie last:border-r-0',
                    CLASSE_FAIXA[f.faixa - 1],
                    f.contagem.k > 0 ? 'min-w-5' : 'hidden',
                  )}
                >
                  {f.contagem.k}
                </span>
              ))}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
