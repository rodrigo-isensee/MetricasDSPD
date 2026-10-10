import type { z } from 'zod'
import type { MetricaId } from './comum'
import type { FiltrosFluxo, FiltrosSustentacao } from './filtros'
import type * as s from './schemas'

export type ResultadoO1 = z.infer<typeof s.resultadoO1>
export type ResultadoBloqueados = z.infer<typeof s.resultadoBloqueados>
export type ResultadoO2 = z.infer<typeof s.resultadoO2>
export type ResultadoO3 = z.infer<typeof s.resultadoO3>
export type ResultadoO4 = z.infer<typeof s.resultadoO4>
export type ResultadoO7 = z.infer<typeof s.resultadoO7>
export type ResultadoO9 = z.infer<typeof s.resultadoO9>
export type ResultadoO10 = z.infer<typeof s.resultadoO10>
export type ResultadoO12 = z.infer<typeof s.resultadoO12>
export type ResultadoO15 = z.infer<typeof s.resultadoO15>
export type ResultadoO18 = z.infer<typeof s.resultadoO18>
export type ResultadoT1 = z.infer<typeof s.resultadoT1>
export type ResultadoT2 = z.infer<typeof s.resultadoT2>
export type ResultadoT3 = z.infer<typeof s.resultadoT3>
export type ResultadoT4 = z.infer<typeof s.resultadoT4>
export type ResultadoT5 = z.infer<typeof s.resultadoT5>
export type ResultadoT7 = z.infer<typeof s.resultadoT7>
export type ResultadoT9 = z.infer<typeof s.resultadoT9>
export type ResultadoE1 = z.infer<typeof s.resultadoE1>
export type ResultadoE2 = z.infer<typeof s.resultadoE2>
export type ResultadoE3 = z.infer<typeof s.resultadoE3>
export type ResultadoS1 = z.infer<typeof s.resultadoS1>
export type ResultadoS2 = z.infer<typeof s.resultadoS2>
export type ResultadoS3 = z.infer<typeof s.resultadoS3>
export type ResultadoS4 = z.infer<typeof s.resultadoS4>
export type ResultadoS5 = z.infer<typeof s.resultadoS5>
export type ResultadoS6 = z.infer<typeof s.resultadoS6>
export type ResultadoS7 = z.infer<typeof s.resultadoS7>
export type ResultadoEI = z.infer<typeof s.resultadoEI>
export type ResultadoVisaoGeral = z.infer<typeof s.resultadoVisaoGeral>
export type AlertaCodigo = z.infer<typeof s.alertaCodigo>

interface Par<F, R> {
  filtros: F
  resultado: R
}
type Fluxo<R> = Par<FiltrosFluxo, R>
type Sust<R> = Par<FiltrosSustentacao, R>

/** Mapa MetricaId -> { filtros, resultado }. O TypeScript impede pedir S* com filtros de fluxo. */
export interface ContratoMetricas {
  O1: Fluxo<ResultadoO1>
  O2: Fluxo<ResultadoO2>
  BLOQUEADOS: Fluxo<ResultadoBloqueados>
  O3: Fluxo<ResultadoO3>
  O4: Fluxo<ResultadoO4>
  O7: Fluxo<ResultadoO7>
  O9: Fluxo<ResultadoO9>
  O10: Fluxo<ResultadoO10>
  O12: Fluxo<ResultadoO12>
  O15: Fluxo<ResultadoO15>
  O18: Fluxo<ResultadoO18>
  T1: Fluxo<ResultadoT1>
  T2: Fluxo<ResultadoT2>
  T3: Fluxo<ResultadoT3>
  T4: Fluxo<ResultadoT4>
  T5: Fluxo<ResultadoT5>
  T7: Fluxo<ResultadoT7>
  T9: Fluxo<ResultadoT9>
  E1: Fluxo<ResultadoE1>
  E2: Fluxo<ResultadoE2>
  E3: Fluxo<ResultadoE3>
  S1: Sust<ResultadoS1>
  S2: Sust<ResultadoS2>
  S3: Sust<ResultadoS3>
  S4: Sust<ResultadoS4>
  S5: Sust<ResultadoS5>
  S6: Sust<ResultadoS6>
  S7: Sust<ResultadoS7>
  EI_FL1: Fluxo<ResultadoEI>
  EI_FL2: Fluxo<ResultadoEI>
  EI_FL3: Fluxo<ResultadoEI>
  EI_SUST: Sust<ResultadoEI>
  /** Sem filtros: sempre os padrões de cada painel (spec 3.1). */
  VISAO_GERAL: Par<Record<string, never>, ResultadoVisaoGeral>
}

export type FiltrosDe<K extends MetricaId> = ContratoMetricas[K]['filtros']
export type ResultadoDe<K extends MetricaId> = ContratoMetricas[K]['resultado']

/** Métricas de sustentação (Acelerato) usam FiltrosSustentacao. */
export const METRICAS_SUSTENTACAO: readonly MetricaId[] = [
  'S1',
  'S2',
  'S3',
  'S4',
  'S5',
  'S6',
  'S7',
  'EI_SUST',
]

/**
 * Quais filtros do fluxo atuam em cada métrica (tabela 2.2 da spec de UX).
 * Usado pelo rodapé do cartão: "Filtros aplicados" / "Não afetado por".
 */
export type FiltroFluxoChave = 'equipe' | 'tipo' | 'sistema' | 'periodo'
export const APLICABILIDADE_FLUXO: Partial<Record<MetricaId, readonly FiltroFluxoChave[]>> = {
  O1: ['equipe', 'tipo', 'sistema', 'periodo'],
  O2: ['equipe', 'tipo', 'sistema', 'periodo'],
  BLOQUEADOS: ['equipe', 'tipo', 'sistema', 'periodo'],
  O3: ['equipe', 'tipo', 'sistema', 'periodo'],
  O4: ['equipe', 'tipo', 'sistema', 'periodo'],
  O7: ['equipe', 'tipo', 'sistema', 'periodo'],
  O9: ['equipe', 'tipo', 'sistema', 'periodo'],
  O10: ['equipe', 'tipo', 'sistema', 'periodo'],
  O12: ['equipe', 'sistema', 'periodo'],
  O15: ['equipe', 'sistema', 'periodo'],
  O18: ['equipe', 'sistema', 'periodo'],
  T1: ['equipe', 'tipo', 'sistema', 'periodo'],
  T2: ['equipe', 'tipo', 'sistema', 'periodo'],
  T3: ['equipe', 'sistema', 'periodo'],
  T4: ['equipe', 'tipo', 'sistema', 'periodo'],
  T5: ['equipe', 'tipo', 'periodo'],
  T7: ['equipe', 'sistema', 'periodo'],
  T9: ['equipe', 'sistema', 'periodo'],
  E1: ['sistema', 'periodo'],
  E2: ['sistema', 'periodo'],
  E3: ['sistema', 'periodo'],
  // EI-FL1 e EI-FL3: o tipo é a dimensão (abas, um por vez), não filtro. EI-FL2 não usa tipo (tipos são de story); EI-FL3 tem o tipo de projeto como dimensão (abas).
  EI_FL1: ['equipe', 'sistema', 'periodo'],
  EI_FL2: ['equipe', 'sistema', 'periodo'],
  EI_FL3: ['sistema', 'periodo'],
}
