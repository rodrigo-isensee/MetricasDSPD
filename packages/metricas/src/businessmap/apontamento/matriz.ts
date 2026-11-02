import type { NivelMatriz, RespostaApontamento } from '@metricas-dspd/contratos'
import { ordenarNeutro } from '../../core/ordenar'
import { agrupar, comPessoa, pctComPiso, somaSegundos } from './comum'
import type { DimApontamento, LinhaApontamento } from './tipos'

type Matriz = RespostaApontamento['matriz']

const dimDoNivel = (l: LinhaApontamento, nivel: NivelMatriz): DimApontamento =>
  nivel === 'tipo' ? l.tipo : nivel === 'subtarefa' ? l.subtarefa : l.subgrupo

/**
 * Matriz pessoa x categoria, um nível por vez (CA-5, M-10). Colunas: as categorias do nível com horas no recorte, mais
 * horas primeiro. Linhas: uma por pessoa, com TODAS as colunas na mesma ordem (célula zerada inclusa), para a tabela
 * não precisar casar chaves. A participação é a parte da linha, com o piso de 20 apontamentos da PESSOA (o3). Linha sem
 * pessoa (eliminada a pedido) não entra: ela fica só no agregado do time. A ordem das linhas é a do chamador (o1).
 */
export function calcularMatriz(linhas: readonly LinhaApontamento[], nivel: NivelMatriz): Matriz {
  const dims = (l: LinhaApontamento) => dimDoNivel(l, nivel)
  const daPessoa = comPessoa(linhas)
  const colunas = ordenarNeutro(
    [...agrupar(daPessoa, (l) => dims(l).id)].map(([id, ls]) => ({
      id,
      rotulo: dims(ls[0] as LinhaApontamento).rotulo,
      segundos: somaSegundos(ls),
    })),
    (c) => [-c.segundos, c.rotulo, c.id],
  )
  const porPessoa = [...agrupar(daPessoa, (l) => l.pessoaRef)].map(([ref, ls]) => {
    const total = somaSegundos(ls)
    const porColuna = agrupar(ls, (l) => dims(l).id)
    return {
      pessoaRef: ref,
      segundos: total,
      apontamentos: ls.length,
      celulas: colunas.map((c) => {
        const segundos = somaSegundos(porColuna.get(c.id) ?? [])
        return { colunaId: c.id, segundos, participacao: pctComPiso(segundos, total, ls.length) }
      }),
    }
  })
  return {
    nivel,
    colunas: colunas.map(({ id, rotulo }) => ({ id, rotulo })),
    linhas: ordenarNeutro(porPessoa, (p) => [Number(p.pessoaRef.slice(1))]),
  }
}
