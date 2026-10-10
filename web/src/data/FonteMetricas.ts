import type { Dominio, MetricaId, VersaoCriterio } from '@/contracts/comum'
import type { OpcoesFiltro } from '@/contracts/filtros'
import type { ContratoMetricas, ResultadoDe } from '@/contracts/metricas'

/**
 * Fronteira entre a interface e os dados. A UI só conhece esta interface e os DTOs de `contracts/`.
 * Hoje a implementação é `MockFonteMetricas`; amanhã, uma `HttpFonteMetricas` (GET /api/v1/metricas/:id).
 */
export interface FonteMetricas {
  /** 'mock' liga o aviso permanente de dados fictícios. */
  readonly tipo: 'mock' | 'api'
  obter<K extends MetricaId>(
    id: K,
    filtros: ContratoMetricas[K]['filtros'],
  ): Promise<ResultadoDe<K>>
  opcoesFiltro<D extends Dominio>(dominio: D): Promise<Extract<OpcoesFiltro, { dominio: D }>>
  /** Mudanças de critério de cálculo registradas (T2.6), de todos os domínios. */
  criterios(): Promise<VersaoCriterio[]>
  /** Data de corte (AAAA-MM-DD): "Dados até DD/MM/AAAA". */
  dataReferencia(): Promise<string>
}
