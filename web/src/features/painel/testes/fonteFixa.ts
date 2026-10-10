import type { FiltrosDe, MetricaId, ResultadoDe } from '@metricas-dspd/contratos'
import { MockFonteMetricas } from '@/data'

/** Fonte de teste: devolve o DTO montado no teste para as métricas informadas; o resto vem do mock. */
export class FonteFixa extends MockFonteMetricas {
  private readonly fixos: Partial<Record<MetricaId, unknown>>
  constructor(fixos: Partial<Record<MetricaId, unknown>>) {
    super({ latenciaMs: 0 })
    this.fixos = fixos
  }
  override async obter<K extends MetricaId>(id: K, filtros: FiltrosDe<K>): Promise<ResultadoDe<K>> {
    if (id in this.fixos) return this.fixos[id] as ResultadoDe<K>
    return super.obter(id, filtros)
  }
}

export const J = { inicio: '2026-07-18', fim: '2026-10-09' }
export const JANELA = { ...J, unidade: 'semanas' as const, quantidade: 12 }
export const COMUM = {
  base: { n: 64, unidade: 'itens', janela: J },
  criterios: { serie: [], janela: [] },
}
export const ok = <T>(n: number, valor: T) => ({ status: 'ok' as const, n, valor, janela: J })
export const insuf = (n: number) => ({
  status: 'insuficiente' as const,
  n,
  minimo: 20 as const,
  janela: J,
})
