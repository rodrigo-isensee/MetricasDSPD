import type {
  Dominio,
  EstadoColeta,
  MetricaId,
  PaginaColetas,
  VersaoCriterio,
} from '@metricas-dspd/contratos'
import type { OpcoesFiltro } from '@metricas-dspd/contratos'
import type { ContratoMetricas, ResultadoDe } from '@metricas-dspd/contratos'

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
  /** Estado de coleta de UMA fonte: selo de frescor, janela de calibração e falhas recentes (nunca somadas). */
  estadoColeta(dominio: Dominio): Promise<EstadoColeta>
  /** Histórico de coletas de uma fonte, mais recente primeiro, 20 por página (a partir da 1). */
  historicoColetas(dominio: Dominio, pagina: number): Promise<PaginaColetas>
}
