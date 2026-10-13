import { FAIXAS_ESCALA, type ResultadoPV1 } from '@metricas-dspd/contratos'
import { fmtInteiro, fmtPct } from '@/lib/formatar'

export type ResultadoPV1Ok = Extract<ResultadoPV1, { status: 'ok' }>
export type TaxaPesquisa = ResultadoPV1Ok['participacao']['taxa']

/** `2026-T3` -> `3T/2026`. */
export function fmtTri(trimestre: string): string {
  const [ano, n] = trimestre.split('-T')
  return `${n}T/${ano}`
}

/** "k de n"; o percentual só existe quando a base já passou de 20 (a taxa vem com `status: ok`). */
export function textoContagem(t: TaxaPesquisa): string {
  const base = `${fmtInteiro(t.k)} de ${fmtInteiro(t.n)}`
  return t.status === 'ok' ? `${base} (${fmtPct(t.pct)})` : base
}

export const nomeDaFaixa = (faixa: number): string =>
  `${faixa} ${FAIXAS_ESCALA[faixa - 1] ?? ''}`.trim()
