import type { MetricaId } from '@metricas-dspd/contratos'
import type { ContratoMetricas, ResultadoDe } from '@metricas-dspd/contratos'
import * as AC from './acelerato'
import * as BM from './businessmap'
import * as PESQ from './pesquisa'
import type { ExtensoesMetricas } from './extensoes'
import { calcularVisaoGeral } from './visaoGeral'

/** Contexto de cálculo: um por domínio (BusinessMap e Acelerato nunca se misturam). */
export interface ContextosMetricas {
  bm: BM.ContextoBM
  ac: AC.ContextoAC
  /** Extensões das métricas complementares (mock). Sem elas, o cálculo complementar devolve vazio/insuficiente. */
  ext?: ExtensoesMetricas
  /**
   * Extensão só de mock do pedido 011 (T11, O22, O26, T13, E6, E8 e T14). Sem ela, essas métricas devolvem vazio ou
   * insuficiente, nunca erro.
   */
  tambem?: BM.ExtensaoTambemBM
  /** Custo total do DSPD (E7, D-1' = A). Só chega por fixture de teste no mock (CA-13); sem ele o E7 não traz R$. */
  custo?: BM.ConfigCustoDspd
  /** Contexto da pesquisa de percepção (terceira fonte, separada). Sem ele, a PV1 devolve `sem-pesquisa`. */
  pesq?: PESQ.ContextoPesquisa
}

/**
 * Despacho tipado: cada métrica recebe exatamente os filtros do seu contrato e devolve o seu
 * resultado (sem cast). Um `MetricaId` novo sem entrada aqui não compila.
 */
const CALCULOS: {
  [K in MetricaId]: (f: ContratoMetricas[K]['filtros'], c: ContextosMetricas) => ResultadoDe<K>
} = {
  O1: (f, c) => BM.calcularO1(c.bm, f),
  O2: (f, c) => BM.calcularO2(c.bm, f),
  BLOQUEADOS: (f, c) => BM.calcularBloqueados(c.bm, f),
  O3: (f, c) => BM.calcularO3(c.bm, f),
  O4: (f, c) => BM.calcularO4(c.bm, f),
  O7: (f, c) => BM.calcularO7(c.bm, f),
  O9: (f, c) => BM.calcularO9(c.bm, f),
  O10: (f, c) => BM.calcularO10(c.bm, f),
  O12: (f, c) => BM.calcularO12(c.bm, f),
  O15: (f, c) => BM.calcularO15(c.bm, f),
  O18: (f, c) => BM.calcularO18(c.bm, f),
  O5: (f, c) => BM.calcularO5(c.bm, f),
  O6: (f, c) => BM.calcularO6(c.bm, f),
  O8: (f, c) => BM.calcularO8(c.bm, f),
  O11: (f, c) => BM.calcularO11(c.bm, f),
  O13: (f, c) => BM.calcularO13(c.bm, f),
  O14: (f, c) => BM.calcularO14(c.bm, f),
  O16: (f, c) => BM.calcularO16(c.bm, f),
  O19: (f, c) => BM.calcularO19(c.bm, f),
  O22: (f, c) => BM.calcularO22(c.bm, f, c.tambem),
  O26: (f, c) => BM.calcularO26(c.bm, f, c.tambem),
  T1: (f, c) => BM.calcularT1(c.bm, f),
  T2: (f, c) => BM.calcularT2(c.bm, f),
  T3: (f, c) => BM.calcularT3(c.bm, f),
  T4: (f, c) => BM.calcularT4(c.bm, f),
  T5: (f, c) => BM.calcularT5(c.bm, f),
  T7: (f, c) => BM.calcularT7(c.bm, f),
  T9: (f, c) => BM.calcularT9(c.bm, f),
  T6: (f, c) => BM.calcularT6(c.bm, f),
  T8: (f, c) => BM.calcularT8(c.bm, f, c.ext?.bm),
  T10: (f, c) => BM.calcularT10(c.bm, f),
  T11: (f, c) => BM.calcularT11(c.bm, f, c.tambem),
  T12: (f, c) => BM.calcularT12(c.bm, f),
  T13: (f, c) => BM.calcularT13(c.bm, f, c.tambem),
  T14: (f, c) => BM.calcularT14(c.bm, f, c.tambem),
  O20: (f, c) => BM.calcularO20(c.bm, f),
  O21: (f, c) => BM.calcularO21(c.bm, f),
  O24: (f, c) => BM.calcularO24(c.bm, f),
  O25: (f, c) => BM.calcularO25(c.bm, f),
  E1: (f, c) => BM.calcularE1(c.bm, f),
  E2: (f, c) => BM.calcularE2(c.bm, f),
  E3: (f, c) => BM.calcularE3(c.bm, f),
  E4: (f, c) => BM.calcularE4(c.bm, f, c.ext?.bm),
  E5: (f, c) => BM.calcularE5(c.bm, f),
  E6: (f, c) => BM.calcularE6(c.bm, f, c.tambem),
  E7: (f, c) => BM.calcularE7(c.bm, f, c.custo),
  E8: (f, c) => BM.calcularE8(c.bm, f, c.tambem),
  E9: (f, c) => BM.calcularE9(c.bm, f),
  EI_FL1: (f, c) => BM.calcularEIBM(c.bm, f, 'FL1'),
  EI_FL2: (f, c) => BM.calcularEIBM(c.bm, f, 'FL2'),
  EI_FL3: (f, c) => BM.calcularEIBM(c.bm, f, 'FL3'),
  S1: (f, c) => AC.calcularS1(c.ac, f),
  S2: (f, c) => AC.calcularS2(c.ac, f),
  S3: (f, c) => AC.calcularS3(c.ac, f),
  S4: (f, c) => AC.calcularS4(c.ac, f),
  S5: (f, c) => AC.calcularS5(c.ac, f),
  S6: (f, c) => AC.calcularS6(c.ac, f),
  S7: (f, c) => AC.calcularS7(c.ac, f),
  S8: (f, c) => AC.calcularS8(c.ac, f, c.ext?.ac),
  S9: (f, c) => AC.calcularS9(c.ac, f),
  S10: (f, c) => AC.calcularS10(c.ac, f),
  S11: (f, c) => AC.calcularS11(c.ac, f, c.ext?.ac),
  S12: (f, c) => AC.calcularS12(c.ac, f, c.ext?.ac),
  O17: (f, c) => AC.calcularO17(c.ac, f, c.ext?.ac),
  EI_SUST: (f, c) => AC.calcularEIAcelerato(c.ac, f),
  PV1: (_f, c) => PESQ.calcularPV1(c.pesq),
  TENDENCIA_FLUXO: (_f, c) => BM.calcularTendenciaFluxo(c.bm),
  TENDENCIA_SUST: (_f, c) => AC.calcularTendenciaSust(c.ac),
  VISAO_GERAL: (_f, ctx) => calcularVisaoGeral(ctx.bm, ctx.ac),
}

/** Despacha uma métrica pelo id. Único ponto de entrada da biblioteca para a fonte mock. */
export function calcularMetrica<K extends MetricaId>(
  id: K,
  filtros: ContratoMetricas[K]['filtros'],
  ctx: ContextosMetricas,
): ResultadoDe<K> {
  return CALCULOS[id](filtros, ctx)
}
