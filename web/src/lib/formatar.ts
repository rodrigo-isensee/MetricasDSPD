/** Formatação pt-BR para a interface. Datas civis (AAAA-MM-DD) sem passar pelo fuso da máquina. */

const nf = (casas: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: casas })

export const fmtNumero = (n: number, casas = 1): string => nf(casas).format(n)
export const fmtInteiro = (n: number): string => nf(0).format(n)
export const fmtPct = (n: number, casas = 0): string => `${nf(casas).format(n)}%`

export function plural(n: number, singular: string, pluralTxt: string): string {
  return n === 1 ? singular : pluralTxt
}

/** 2026-10-09 -> 09/10/2026 */
export function fmtData(iso: string): string {
  const [a, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${a}`
}

/** 2026-10-09T06:10:00-03:00 -> 09/10/2026 06:10 (hora local do ISO, sem converter fuso). */
export function fmtDataHora(iso: string): string {
  return `${fmtData(iso)} ${iso.slice(11, 16)}`
}

/** 2026-10-09T06:10:00-03:00 -> 09/10 06:10 */
export function fmtDataHoraCurta(iso: string): string {
  return `${fmtDataCurta(iso)} ${iso.slice(11, 16)}`
}

/** 2026-10-09 -> 09/10 */
export function fmtDataCurta(iso: string): string {
  const [, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}`
}

/** Intervalo "09/07 a 09/10/2026"; com anos diferentes, o início leva o ano ("10/10/2025 a 09/10/2026"). */
export function fmtIntervalo(inicio: string, fim: string): string {
  const mesmoAno = inicio.slice(0, 4) === fim.slice(0, 4)
  return `${mesmoAno ? fmtDataCurta(inicio) : fmtData(inicio)} a ${fmtData(fim)}`
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/** 2026-06 -> jun/2026 */
export function fmtMes(mes: string): string {
  const [a, m] = mes.split('-')
  return `${MESES[Number(m) - 1] ?? m}/${a}`
}

/** 2026-T3 -> 3º tri/2026 */
export function fmtTrimestre(t: string): string {
  const [a, n] = t.split('-T')
  return `${n}º tri/${a}`
}

export function fmtDiasUteis(n: number, casas = 1): string {
  const v = Math.round(n * 10 ** casas) / 10 ** casas
  return `${fmtNumero(n, casas)} ${v === 1 ? 'dia útil' : 'dias úteis'}`
}

export function fmtDiasCorridos(n: number): string {
  return `${fmtInteiro(n)} ${n === 1 ? 'dia' : 'dias'}`
}

/**
 * Duração em horas úteis da sustentação: minutos abaixo de 1 h, horas úteis até 24 h
 * e dias úteis (8 h = 1 dia) acima disso.
 */
export function fmtHorasUteis(h: number, horasPorDia = 8): string {
  if (h < 1) return `${fmtInteiro(Math.round(h * 60))} min`
  if (h < horasPorDia * 3) return `${fmtNumero(h, 1)} h úteis`
  return fmtDiasUteis(h / horasPorDia)
}

/** Diferença em dias corridos entre duas datas civis. */
export function diffDias(deIso: string, ateIso: string): number {
  const p = (s: string) => {
    const [a, m, d] = s.split('-').map(Number) as [number, number, number]
    return Date.UTC(a, m - 1, d)
  }
  return Math.round((p(ateIso) - p(deIso)) / 86_400_000)
}

export function dataValida(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false
  const [a, m, d] = iso.split('-').map(Number) as [number, number, number]
  const t = new Date(Date.UTC(a, m - 1, d))
  return t.getUTCFullYear() === a && t.getUTCMonth() === m - 1 && t.getUTCDate() === d
}

/** "12 semanas" / "1 mês" / "6 meses", gerado do parâmetro da janela (nunca escrito à mão). */
export function textoJanela(j: { unidade: 'semanas' | 'meses'; quantidade: number }): string {
  const q = j.quantidade === 1
  const plural = j.unidade === 'semanas' ? (q ? 'semana' : 'semanas') : q ? 'mês' : 'meses'
  return `${fmtInteiro(j.quantidade)} ${plural}`
}

/** Semanas inteiras de um intervalo de datas civis (inclusivo nas duas pontas): 84 dias = 12. */
export function semanasDoIntervalo(j: { inicio: string; fim: string }): number {
  return Math.round((diffDias(j.inicio, j.fim) + 1) / 7)
}
