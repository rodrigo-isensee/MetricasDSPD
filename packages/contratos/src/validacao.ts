import { z } from 'zod'
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
  O5: s.resultadoO5,
  O6: s.resultadoO6,
  O8: s.resultadoO8,
  O11: s.resultadoO11,
  O13: s.resultadoO13,
  O14: s.resultadoO14,
  O16: s.resultadoO16,
  O17: s.resultadoO17,
  T1: s.resultadoT1,
  T2: s.resultadoT2,
  T3: s.resultadoT3,
  T4: s.resultadoT4,
  T5: s.resultadoT5,
  T7: s.resultadoT7,
  T9: s.resultadoT9,
  T6: s.resultadoT6,
  T8: s.resultadoT8,
  E1: s.resultadoE1,
  E2: s.resultadoE2,
  E3: s.resultadoE3,
  E4: s.resultadoE4,
  E5: s.resultadoE5,
  S1: s.resultadoS1,
  S2: s.resultadoS2,
  S3: s.resultadoS3,
  S4: s.resultadoS4,
  S5: s.resultadoS5,
  S6: s.resultadoS6,
  S7: s.resultadoS7,
  S8: s.resultadoS8,
  S9: s.resultadoS9,
  S10: s.resultadoS10,
  S11: s.resultadoS11,
  S12: s.resultadoS12,
  PV1: s.resultadoPV1,
  EI_FL1: s.resultadoEI,
  EI_FL2: s.resultadoEI,
  EI_FL3: s.resultadoEI,
  EI_SUST: s.resultadoEI,
  VISAO_GERAL: s.resultadoVisaoGeral,
  TENDENCIA_FLUXO: s.resultadoTendenciaFluxo,
  TENDENCIA_SUST: s.resultadoTendenciaSust,
}

/** Metadados de paginação do O2 (`itensMeta`): a API pagina só `itens`; o resto é do conjunto completo. */
export const itensMetaSchema = z
  .object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().min(0),
  })
  .strict()
export type ItensMeta = z.infer<typeof itensMetaSchema>

/** O2 como a API devolve (e como o mock se alinha): o DTO do contrato mais `itensMeta`. */
export const resultadoO2PaginadoSchema = s.resultadoO2.extend({ itensMeta: itensMetaSchema })
export type ResultadoO2Paginado = z.infer<typeof resultadoO2PaginadoSchema>
