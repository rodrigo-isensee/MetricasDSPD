import type { z } from 'zod'
import type { MetricaId } from './comum'
import type { ResultadoDe } from './metricas'
import * as s from './schemas'

/**
 * Módulo próprio (review R18): só a validação em tempo de execução (fonte HTTP e testes) importa
 * os schemas. A interface usa apenas os tipos e a aplicabilidade, e não carrega o zod por isso.
 */
/** Schema de cada resultado, para validar na fonte HTTP e nos testes da fonte mock. */
export const SCHEMAS_RESULTADO: { [K in MetricaId]: z.ZodType<ResultadoDe<K>> } = {
  O1: s.resultadoO1,
  O2: s.resultadoO2,
  BLOQUEADOS: s.resultadoBloqueados,
  O3: s.resultadoO3,
  O4: s.resultadoO4,
  O7: s.resultadoO7,
  O9: s.resultadoO9,
  O10: s.resultadoO10,
  O12: s.resultadoO12,
  O15: s.resultadoO15,
  O18: s.resultadoO18,
  T1: s.resultadoT1,
  T2: s.resultadoT2,
  T3: s.resultadoT3,
  T4: s.resultadoT4,
  T5: s.resultadoT5,
  T7: s.resultadoT7,
  T9: s.resultadoT9,
  E1: s.resultadoE1,
  E2: s.resultadoE2,
  E3: s.resultadoE3,
  S1: s.resultadoS1,
  S2: s.resultadoS2,
  S3: s.resultadoS3,
  S4: s.resultadoS4,
  S5: s.resultadoS5,
  S6: s.resultadoS6,
  S7: s.resultadoS7,
  EI_FL1: s.resultadoEI,
  EI_FL2: s.resultadoEI,
  EI_FL3: s.resultadoEI,
  EI_SUST: s.resultadoEI,
  VISAO_GERAL: s.resultadoVisaoGeral,
}
