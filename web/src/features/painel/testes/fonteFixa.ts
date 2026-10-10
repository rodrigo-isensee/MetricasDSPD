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

/**
 * Fonte de teste que parte do DTO real calculado pelo mock e aplica um ajuste mínimo por métrica
 * (sobre uma cópia): permite forçar um ramo de tela sem montar o DTO inteiro à mão.
 */
export class FonteAjustada extends MockFonteMetricas {
  private readonly ajustes: Partial<Record<MetricaId, (r: never) => void>>
  constructor(ajustes: Partial<Record<MetricaId, (r: never) => void>>) {
    super({ latenciaMs: 0 })
    this.ajustes = ajustes
  }
  override async obter<K extends MetricaId>(id: K, filtros: FiltrosDe<K>): Promise<ResultadoDe<K>> {
    const r = await super.obter(id, filtros)
    const ajustar = this.ajustes[id]
    if (!ajustar) return r
    const copia = structuredClone(r)
    // O ajuste só muda a cópia no lugar; o valor que ele devolver é ignorado.
    ajustar(copia as never)
    return copia as ResultadoDe<K>
  }
}

export const FILTROS_FLUXO = {
  equipe: [],
  tipo: [],
  sistema: [],
  periodo: { tipo: '12s' as const },
}
export const FILTROS_SUSTENTACAO = { equipe: [], prioridade: [], periodo: { tipo: '6m' as const } }
