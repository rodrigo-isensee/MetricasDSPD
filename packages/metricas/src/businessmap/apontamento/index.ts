/**
 * Cálculos da aba Apontamento (pedido 059, plano §3.7), todos pela biblioteca T2.5: nenhum na rota nem no front.
 * Exceção à regra de métrica individual aprovada pelo dono (2026-11-01), com as cláusulas o1 a o4: ordem neutra das
 * pessoas, utilização sem semáforo nem média por pessoa, percentual por pessoa só com 20 apontamentos ou mais. As
 * horas servem a capacidade, utilização e distribuição do tempo, nunca a esforço de entrega, velocidade, custo de
 * card ou meta. Não há percentil nem Monte Carlo aqui. Só BusinessMap.
 */
import type { PessoaRef, RespostaApontamento } from '@metricas-dspd/contratos'
import { gerarAchados } from './achados'
import { calcularCapacidade } from './capacidade'
import { comPessoa, ordenarPorPessoa } from './comum'
import { calcularDiario } from './diario'
import { calcularDistribuicao } from './distribuicao'
import { diasAtipicos, ehAtipico, filtrar } from './filtros'
import { calcularMatriz } from './matriz'
import { calcularQualidade } from './qualidade'
import type { EntradaApontamento } from './tipos'
import { somaSegundos } from './comum'

export { gerarAchados, LIMIARES_ACHADO_PADRAO } from './achados'
export {
  calcularCapacidade,
  capacidadeMensal,
  capacidadePessoa,
  horasPorDiaSegundos,
  utilizacao,
} from './capacidade'
export { horas, ordenarPorPessoa, pctComPiso, somaSegundos } from './comum'
export { calcularDiario, faixaDoDia } from './diario'
export { calcularDistribuicao } from './distribuicao'
export { diasAtipicos, ehAtipico, filtrar, flagsEfetivas } from './filtros'
export { calcularMatriz } from './matriz'
export { calcularQualidade } from './qualidade'
export type {
  DimApontamento,
  EntradaApontamento,
  FiltrosApontamento,
  LimiaresAchado,
  LinhaApontamento,
} from './tipos'

export type CalculoApontamento = Pick<
  RespostaApontamento,
  'kpis' | 'distribuicao' | 'qualidade' | 'matriz' | 'capacidade' | 'diario' | 'achados'
>

/**
 * Calcula os blocos da resposta de `GET /api/apontamento` a partir das linhas sem filtro. O recorte principal é o
 * período com todos os filtros; o mapa diário usa a própria janela e só o filtro de pessoa (CA-4); o valor atípico é
 * decidido sobre o dia inteiro da pessoa, antes dos filtros. Moldura da resposta (versão, frescor, opções, critérios)
 * é da rota.
 */
export function calcularApontamento(e: EntradaApontamento): CalculoApontamento {
  const atipicos = diasAtipicos(e.linhas, e.limiteAtipicoSegundos)
  const rotulos = new Map(e.pessoas.map((p) => [p.pessoaRef, p.rotulo]))
  const emOrdem = <T extends { pessoaRef: PessoaRef }>(itens: readonly T[]) =>
    ordenarPorPessoa(itens, rotulos, e.nomesReais)

  const noPeriodo = e.linhas.filter((l) => l.data >= e.periodo.de && l.data <= e.periodo.ate)
  const recorte = filtrar(noPeriodo, e.filtros, atipicos)
  const naJanela = e.linhas.filter((l) => l.data >= e.diario.de && l.data <= e.diario.ate)
  const doDiario = filtrar(naJanela, e.filtros, atipicos, true)

  const distribuicao = calcularDistribuicao(recorte)
  const qualidade = calcularQualidade(recorte, atipicos)
  const matriz = calcularMatriz(recorte, e.nivelMatriz)
  const capacidade = calcularCapacidade(recorte, e.calendario, e.periodo, e.ultimaColetaOk)
  const diario = calcularDiario(doDiario, e.calendario, e.diario, e.limiteAtipicoSegundos, atipicos)

  const marcadas = recorte.filter((l) => ehAtipico(l, atipicos))
  const kpis = {
    segundos: somaSegundos(recorte),
    apontamentos: recorte.length,
    pessoasAtivas: new Set(recorte.map((l) => l.pessoaRef).filter((r) => r !== null)).size,
    completos: qualidade.geral.completos,
    atipicos: marcadas.length,
  }
  const diasAtipicosNoRecorte = new Set(comPessoa(marcadas).map((l) => `${l.pessoaRef}|${l.data}`))
    .size

  return {
    kpis,
    distribuicao,
    qualidade: { ...qualidade, porPessoa: emOrdem(qualidade.porPessoa) },
    matriz: { ...matriz, linhas: emOrdem(matriz.linhas) },
    capacidade: { ...capacidade, porPessoa: emOrdem(capacidade.porPessoa) },
    diario: { ...diario, linhas: emOrdem(diario.linhas) },
    achados: gerarAchados(
      {
        distribuicao,
        qualidade,
        capacidade,
        diasAtipicos: diasAtipicosNoRecorte,
        limiteAtipicoSegundos: e.limiteAtipicoSegundos,
      },
      e.limiares,
    ),
  }
}
