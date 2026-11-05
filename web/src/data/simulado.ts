import type { MetricaId, ResultadoDe } from '@metricas-dspd/contratos'
import type { ContratoMetricas } from '@metricas-dspd/contratos'
import type { FonteMetricas } from './FonteMetricas'

/**
 * Dado simulado por cartão (pedido 070, ADR 0028). O simulado só existe no navegador: a API nunca devolve número
 * simulado, só o aviso `sem-dado-real` com `simulavel`. Nada aqui calcula métrica: o número vem do núcleo do mock.
 */

/** Por que o cartão está simulado: o motivo do `sem-dado-real` da própria resposta da API. */
export interface OrigemSimulada {
  motivo: string
}

/** Quais métricas estão sendo mostradas como simuladas agora. Lido pelo contexto de origem dos cartões (selo). */
export interface OrigensSimuladas {
  subscribe: (ouvinte: () => void) => () => void
  /** Imutável: troca de referência a cada mudança (serve ao `useSyncExternalStore`). */
  getSnapshot: () => ReadonlyMap<MetricaId, OrigemSimulada>
}

export interface FonteSimuladora extends FonteMetricas {
  readonly origensSimuladas: OrigensSimuladas
  /**
   * O dado simulado da métrica, só com o período da tela (filtros de dimensão não se aplicam, Q-070-1). O
   * `motivo` é o da resposta `sem-dado-real` que autorizou a simulação. Rejeita se o núcleo falhar ou o DTO
   * não passar pelo schema da métrica: o cartão volta a "Sem dado real" (falha fechada).
   */
  obterSimulado<K extends MetricaId>(
    id: K,
    filtros: ContratoMetricas[K]['filtros'],
    motivo: string,
  ): Promise<ResultadoDe<K>>
}

export const ehFonteSimuladora = (f: FonteMetricas): f is FonteSimuladora =>
  'obterSimulado' in f && 'origensSimuladas' in f

/** Mantém só o período: listas de dimensão (equipe, tipo, sistema, prioridade) voltam a "Todos". */
export function filtrosSoPeriodo<F extends object>(filtros: F): F {
  const saida: Record<string, unknown> = {}
  for (const [chave, valor] of Object.entries(filtros))
    saida[chave] = Array.isArray(valor) ? [] : valor
  return saida as F
}

/** Registro (store externo) das métricas simuladas. */
export class RegistroSimulados implements OrigensSimuladas {
  private mapa: ReadonlyMap<MetricaId, OrigemSimulada> = new Map()
  private readonly ouvintes = new Set<() => void>()

  subscribe = (ouvinte: () => void): (() => void) => {
    this.ouvintes.add(ouvinte)
    return () => {
      this.ouvintes.delete(ouvinte)
    }
  }

  getSnapshot = (): ReadonlyMap<MetricaId, OrigemSimulada> => this.mapa

  /** `null` tira a métrica do conjunto (voltou a ser real ou sem dado). Só notifica se algo mudou. */
  marcar(id: MetricaId, origem: OrigemSimulada | null): void {
    const atual = this.mapa.get(id)
    if (origem === null ? atual === undefined : atual?.motivo === origem.motivo) return
    const novo = new Map(this.mapa)
    if (origem === null) novo.delete(id)
    else novo.set(id, origem)
    this.mapa = novo
    for (const o of this.ouvintes) o()
  }
}

/** Sem fonte simuladora (mock, testes): nenhum cartão é simulado. */
export const SEM_SIMULADOS: OrigensSimuladas = {
  subscribe: () => () => undefined,
  getSnapshot: (() => {
    const vazio: ReadonlyMap<MetricaId, OrigemSimulada> = new Map()
    return () => vazio
  })(),
}
