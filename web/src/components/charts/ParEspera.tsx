import { fmtNumero, fmtPct } from '@/lib/formatar'
import { TabelaDados, useModoTabela } from '../ui'

interface Props {
  /** Mediana da visão do cliente. */
  cliente: number
  /** Mediana da visão do time. */
  time: number
  /** (cliente - time) / cliente, em %. */
  indicePct: number
  /** Unidade escrita ("dias úteis", "horas úteis"). */
  unidade: string
  descricao: string
  /**
   * Segmento do par (tipo de demanda ou prioridade), nomeado: o par é sempre de UM segmento, nunca
   * uma mediana misturada. O painel escolhe o segmento por abas (`SeletorLocal`).
   */
  segmento?: string | null
  /** Eixo próprio de cada nível: nunca compartilhado entre blocos. */
  escalaMax?: number
}

/**
 * Par de barras na MESMA escala: visão do cliente (cheia) e visão do time (clara), com a faixa
 * entre elas rotulada "Espera invisível: N%". Exige as duas medidas: não existe versão com uma só.
 */
export function ParEspera({
  cliente,
  time,
  indicePct,
  unidade,
  descricao,
  segmento,
  escalaMax,
}: Props) {
  const legendaCompleta = segmento ? `${descricao} (${segmento})` : descricao
  const { modo, codigo } = useModoTabela()
  const max = Math.max(escalaMax ?? 0, cliente, time, 0.0001)
  const larg = (v: number) => `${Math.max(2, (v / max) * 100)}%`
  if (modo === 'tabela') {
    return (
      <TabelaDados
        {...(codigo ? { codigo } : {})}
        legenda={legendaCompleta}
        colunas={[
          { chave: 'visao', titulo: 'Visão' },
          { chave: 'mediana', titulo: `Mediana (${unidade})`, alinhar: 'direita' },
        ]}
        linhas={[
          { visao: 'Visão do cliente', mediana: fmtNumero(cliente, 1) },
          { visao: 'Visão do time', mediana: fmtNumero(time, 1) },
          { visao: 'Espera invisível', mediana: fmtPct(indicePct, 0) },
        ]}
      />
    )
  }
  return (
    <figure
      className="m-0 flex flex-col gap-2"
      aria-label={legendaCompleta}
      {...(segmento ? { 'data-segmento': segmento } : {})}
    >
      {segmento && (
        <p className="text-sm font-semibold" data-testid="par-segmento">
          {segmento}
        </p>
      )}
      <div>
        <p className="mb-1 flex justify-between text-xs">
          <span className="font-medium">Visão do cliente</span>
          <span className="tabular-nums" data-testid="par-cliente">
            {fmtNumero(cliente, 1)} {unidade}
          </span>
        </p>
        <div className="h-6 rounded bg-superficie-2">
          <div
            className="h-6 rounded border border-acento bg-acento"
            style={{ width: larg(cliente) }}
          />
        </div>
      </div>
      <div>
        <p className="mb-1 flex justify-between text-xs">
          <span className="font-medium">Visão do time</span>
          <span className="tabular-nums" data-testid="par-time">
            {fmtNumero(time, 1)} {unidade}
          </span>
        </p>
        <div className="h-6 rounded bg-superficie-2">
          <div
            className="h-6 rounded border border-acento"
            style={{
              width: larg(time),
              backgroundImage:
                'repeating-linear-gradient(45deg, var(--acento-fundo) 0 4px, var(--superficie) 4px 8px)',
            }}
          />
        </div>
      </div>
      <p className="text-sm font-semibold" data-testid="par-indice">
        Espera invisível: {fmtPct(indicePct, 0)}
        {indicePct > 50 && (
          <span className="ml-2 rounded bg-atencao-fundo px-2 py-0.5 text-xs text-atencao">
            Acima de 50%
          </span>
        )}
      </p>
    </figure>
  )
}
