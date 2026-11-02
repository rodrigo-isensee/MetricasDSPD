import { fmtData, fmtNumero } from '@/lib/formatar'
import type { PctComPiso } from './types'

/** Horas chegam em segundos inteiros: só aqui viram texto ("7,5 h"). Nenhum cálculo de métrica. */
export const fmtHoras = (segundos: number, casas = 1): string =>
  `${fmtNumero(segundos / 3600, casas)} h`

export const fmtApontamentos = (n: number): string =>
  `${fmtNumero(n, 0)} ${n === 1 ? 'apontamento' : 'apontamentos'}`

/** Percentual pronto da biblioteca; `null` quando o piso de 20 não foi atingido (o3). */
export const pctOuNulo = (p: PctComPiso): number | null => (p.status === 'ok' ? p.pct : null)

/** "12/08" a partir de AAAA-MM-DD, para a dica do mapa diário. */
export const diaMes = (iso: string): string => fmtData(iso).slice(0, 5)

/** Horas decorridas entre o instante da última coleta e `agora`, para o texto do selo "Atrasado". */
export function horasDesde(instante: string | null, agora: number = Date.now()): number | null {
  if (instante === null) return null
  const t = Date.parse(instante)
  return Number.isNaN(t) ? null : Math.max(0, (agora - t) / 3_600_000)
}
