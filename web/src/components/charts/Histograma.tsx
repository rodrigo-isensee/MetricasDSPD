import type { FaixaHistograma } from '@/contracts/comum'
import { Barras, type CategoriaBarra, type SerieBarra } from './Barras'
import { PADROES, corNaPosicao } from './tema'

interface Props {
  faixas: readonly FaixaHistograma[]
  /** Unidade do eixo x ("dias úteis", "dias"). */
  unidadeX: string
  /** O que cada item é ("itens", "frentes"). */
  unidadeY?: string
  descricao: string
  altura?: number
}

/**
 * Histograma de UMA granularidade e UMA classe (nunca story, frente e projeto juntos). As faixas
 * já vêm calculadas pela biblioteca: este componente só desenha. Com `empilhado`, uma série por classe
 * (cor + padrão + legenda).
 */
export function Histograma({
  faixas,
  unidadeX,
  unidadeY = 'itens',
  descricao,
  altura = 220,
}: Props) {
  const classes = [...new Set(faixas.flatMap((f) => (f.empilhado ?? []).map((e) => e.classe)))]
  const empilhado = classes.length > 0
  const series: SerieBarra[] = empilhado
    ? classes.map((c, i) => ({
        chave: c,
        rotulo: c,
        cor: corNaPosicao(i),
        padrao: PADROES[i % PADROES.length] ?? 'liso',
      }))
    : [{ chave: 'contagem', rotulo: unidadeY, cor: 1 }]
  const categorias: CategoriaBarra[] = faixas.map((f) => ({
    rotulo: f.rotulo,
    valores: empilhado
      ? Object.fromEntries(
          classes.map((c) => [c, f.empilhado?.find((e) => e.classe === c)?.contagem ?? 0]),
        )
      : { contagem: f.contagem },
  }))
  return (
    <Barras
      categorias={categorias}
      series={series}
      modo={empilhado ? 'empilhado' : 'agrupado'}
      unidade={unidadeY}
      descricao={`${descricao} (faixas em ${unidadeX})`}
      altura={altura}
      espaco={2}
      semLegenda={!empilhado}
    />
  )
}
