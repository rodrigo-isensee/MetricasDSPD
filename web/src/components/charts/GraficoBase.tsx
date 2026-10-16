import type { ReactNode } from 'react'
import { useVezDoGrafico } from './filaDeGraficos'
import { TabelaDados, useModoTabela, type TabelaDadosProps } from '../ui'

interface Props {
  /** Tabela equivalente: é a alternativa textual principal do gráfico (ADR 0001). */
  tabela: TabelaDadosProps
  altura?: number
  /** Gráfico denso (dispersões): o SVG fica oculto aos leitores de tela e a tabela é a equivalente. */
  densa?: boolean
  legenda?: ReactNode
  children: ReactNode
}

/**
 * Contêiner `figure` de todo gráfico. Dentro de um `CartaoMetrica`, alterna entre o gráfico e a
 * tabela de dados equivalente ("Ver como tabela"). A frase de leitura do cartão é a descrição
 * curta (`aria-describedby`).
 */
export function GraficoBase({ tabela, altura = 260, densa = false, legenda, children }: Props) {
  const { modo, idLeitura, legenda: cap, codigo } = useModoTabela()
  const vez = useVezDoGrafico()
  if (modo === 'tabela') return <TabelaDados {...(codigo ? { codigo } : {})} {...tabela} />
  return (
    <figure aria-describedby={idLeitura} className="m-0">
      <figcaption className="sr-only">{cap ?? tabela.legenda}</figcaption>
      <div
        style={{ height: altura, minHeight: 200 }}
        aria-hidden={densa || undefined}
        className="w-full text-xs"
      >
        {vez ? children : null}
      </div>
      {legenda}
    </figure>
  )
}
