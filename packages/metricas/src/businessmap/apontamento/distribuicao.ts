import type { RespostaApontamento } from '@metricas-dspd/contratos'
import { ordenarNeutro } from '../../core/ordenar'
import { agrupar, pctComPiso, somaSegundos } from './comum'
import type { DimApontamento, LinhaApontamento } from './tipos'

type Distribuicao = RespostaApontamento['distribuicao']

/**
 * Horas por dimensão (projeto, tipo, subgrupo). `participacao` é a parte das horas do bloco, com o piso de 20
 * apontamentos sobre a base do bloco. Ordem: mais horas primeiro (são dimensões de trabalho, não pessoas; o1 não se
 * aplica), com o rótulo e o id como desempate. Story, frente e projeto não se misturam: "projeto" aqui é só rótulo
 * de agrupamento das horas, não há histograma de tempo de ciclo.
 */
function porDimensao<L extends DimApontamento>(
  linhas: readonly LinhaApontamento[],
  dim: (l: LinhaApontamento) => L,
  extra: (d: L) => object,
): Distribuicao['porTipo'] {
  const total = somaSegundos(linhas)
  const n = linhas.length
  const itens = [...agrupar(linhas, (l) => dim(l).id)].map(([id, ls]) => {
    const d = dim(ls[0] as LinhaApontamento)
    const segundos = somaSegundos(ls)
    return {
      id,
      rotulo: d.rotulo,
      segundos,
      apontamentos: ls.length,
      participacao: pctComPiso(segundos, total, n),
      ...extra(d),
    }
  })
  return ordenarNeutro(itens, (i) => [-i.segundos, i.rotulo, i.id])
}

export function calcularDistribuicao(linhas: readonly LinhaApontamento[]): Distribuicao {
  return {
    base: { n: linhas.length, unidade: 'apontamentos' },
    porProjeto: porDimensao(
      linhas,
      (l) => l.projeto,
      (d) => ({ foraDoEscopo: d.foraDoEscopo }),
    ),
    porTipo: porDimensao(
      linhas,
      (l) => l.tipo,
      () => ({}),
    ),
    porSubgrupo: porDimensao(
      linhas,
      (l) => l.subgrupo,
      () => ({}),
    ),
  }
}
