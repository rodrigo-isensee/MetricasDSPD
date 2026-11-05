import { MOTIVO_FONTE_REAL_NAO_DEFINIDA } from '@metricas-dspd/contratos'

/**
 * A API respondeu 200 com `{ estado: 'sem-dado-real', metrica, motivo }` (pedido 060, P3): a métrica não tem fonte real.
 * Não é falha: o painel mostra "Sem dado real" e o motivo, sem número. Viaja como erro só para não haver resultado nenhum
 * (nenhum número, percentil nem histograma) no cache; `useMetrica` o converte no estado `sem-dado-real`.
 */
export class SemDadoRealErro extends Error {
  readonly motivo: string
  readonly metrica: string
  /** A API autoriza a web a mostrar o dado simulado deste cartão (pedido 070). Ausente na resposta = `false`. */
  readonly simulavel: boolean
  constructor(metrica: string, motivo: string, simulavel = false) {
    super(`Sem dado real: ${metrica} (${motivo})`)
    this.name = 'SemDadoRealErro'
    this.metrica = metrica
    this.motivo = motivo
    this.simulavel = simulavel
  }
}

/** Motivo do estado sem dado real: o da resposta da API, ou o genérico do contrato quando o erro não o traz. */
export const motivoSemDadoReal = (erro: Error | null | undefined): string =>
  erro instanceof SemDadoRealErro ? erro.motivo : MOTIVO_FONTE_REAL_NAO_DEFINIDA
