/**
 * Calendário útil e aritmética de datas civis, sem depender do fuso da máquina nem de `Date`.
 * Instantes são epoch ms; "dia" é o número de dias desde 1970-01-01 no fuso do calendário
 * (padrão -03:00, sem horário de verão desde 2019). Expediente e feriados são PROVISÓRIOS (P2).
 */
export const MS_MINUTO = 60_000
export const MS_HORA = 3_600_000
export const MS_DIA = 86_400_000

export interface Turno {
  /** Minutos desde 00:00 local. */
  inicioMin: number
  fimMin: number
}

export interface Calendario {
  /** `corrido` = horas corridas (exceção de plantão, 4.2); não está ligado a nenhuma prioridade. */
  modo: 'expediente' | 'corrido'
  turnos: readonly Turno[]
  /** Feriados como AAAA-MM-DD. */
  feriados: ReadonlySet<string>
  offsetMinutos: number
  horasPorDia: number
}

/** Feriados nacionais 2025-2026 (provisório, P2). */
export const FERIADOS_NACIONAIS: readonly string[] = [
  '2025-01-01',
  '2025-03-03',
  '2025-03-04',
  '2025-04-18',
  '2025-04-21',
  '2025-05-01',
  '2025-06-19',
  '2025-09-07',
  '2025-10-12',
  '2025-11-02',
  '2025-11-15',
  '2025-11-20',
  '2025-12-25',
  '2026-01-01',
  '2026-02-16',
  '2026-02-17',
  '2026-04-03',
  '2026-04-21',
  '2026-05-01',
  '2026-06-04',
  '2026-09-07',
  '2026-10-12',
  '2026-11-02',
  '2026-11-15',
  '2026-11-20',
  '2026-12-25',
]

export function criarCalendario(opcoes: Partial<Calendario> = {}): Calendario {
  const turnos = opcoes.turnos ?? [
    { inicioMin: 8 * 60, fimMin: 12 * 60 },
    { inicioMin: 13 * 60, fimMin: 17 * 60 },
  ]
  const horasPorDia = turnos.reduce((s, t) => s + (t.fimMin - t.inicioMin), 0) / 60
  return {
    modo: opcoes.modo ?? 'expediente',
    turnos,
    feriados: opcoes.feriados ?? new Set(FERIADOS_NACIONAIS),
    offsetMinutos: opcoes.offsetMinutos ?? -180,
    horasPorDia: opcoes.horasPorDia ?? horasPorDia,
  }
}

export const CALENDARIO_PADRAO: Calendario = criarCalendario()

export function calendarioCorrido(cal: Calendario): Calendario {
  return { ...cal, modo: 'corrido', horasPorDia: 24 }
}

/* ---------- datas civis (algoritmos de Howard Hinnant) ---------- */

export function diasDesdeCivil(ano: number, mes: number, dia: number): number {
  const y = mes <= 2 ? ano - 1 : ano
  const era = Math.floor(y / 400)
  const yoe = y - era * 400
  const doy = Math.floor((153 * (mes + (mes > 2 ? -3 : 9)) + 2) / 5) + dia - 1
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy
  return era * 146097 + doe - 719468
}

export function civilDeDias(dias: number): { ano: number; mes: number; dia: number } {
  const z = dias + 719468
  const era = Math.floor(z / 146097)
  const doe = z - era * 146097
  const yoe = Math.floor(
    (doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365,
  )
  const y = yoe + era * 400
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100))
  const mp = Math.floor((5 * doy + 2) / 153)
  const dia = doy - Math.floor((153 * mp + 2) / 5) + 1
  const mes = mp < 10 ? mp + 3 : mp - 9
  return { ano: mes <= 2 ? y + 1 : y, mes, dia }
}

const dois = (n: number) => String(n).padStart(2, '0')

export function isoDeDia(dia: number): string {
  const c = civilDeDias(dia)
  return `${String(c.ano).padStart(4, '0')}-${dois(c.mes)}-${dois(c.dia)}`
}

export function diaDeIso(iso: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) throw new Error(`Data inválida: ${iso}`)
  return diasDesdeCivil(Number(m[1]), Number(m[2]), Number(m[3]))
}

export function mesDeDia(dia: number): string {
  return isoDeDia(dia).slice(0, 7)
}

/** Primeiro dia (número) do mês AAAA-MM. */
export function primeiroDiaDoMes(mesIso: string): number {
  return diaDeIso(`${mesIso}-01`)
}

export function ultimoDiaDoMes(mesIso: string): number {
  const [a, m] = mesIso.split('-').map(Number) as [number, number]
  return (m === 12 ? diasDesdeCivil(a + 1, 1, 1) : diasDesdeCivil(a, m + 1, 1)) - 1
}

/** Soma `n` meses a um dia, mantendo o dia do mês (limitado ao último dia do mês de destino). */
export function somarMeses(dia: number, n: number): number {
  const c = civilDeDias(dia)
  const total = c.ano * 12 + (c.mes - 1) + n
  const ano = Math.floor(total / 12)
  const mes = (total % 12) + 1
  const ult = ultimoDiaDoMes(`${ano}-${dois(mes)}`) - primeiroDiaDoMes(`${ano}-${dois(mes)}`) + 1
  return diasDesdeCivil(ano, mes, Math.min(c.dia, ult))
}

/** 0 = segunda ... 6 = domingo. */
export function diaDaSemana(dia: number): number {
  return (((dia + 3) % 7) + 7) % 7
}

export function inicioDaSemana(dia: number): number {
  return dia - diaDaSemana(dia)
}

export function trimestreDeDia(dia: number): string {
  const c = civilDeDias(dia)
  return `${c.ano}-T${Math.floor((c.mes - 1) / 3) + 1}`
}

/* ---------- instantes <-> dias locais ---------- */

export function diaLocal(ms: number, cal: Calendario): number {
  return Math.floor((ms + cal.offsetMinutos * MS_MINUTO) / MS_DIA)
}

export function dataIso(ms: number, cal: Calendario): string {
  return isoDeDia(diaLocal(ms, cal))
}

/** Instante de um dia local no minuto dado (0 = 00:00 local). */
export function instanteDe(dia: number, minutos: number, cal: Calendario): number {
  return dia * MS_DIA + minutos * MS_MINUTO - cal.offsetMinutos * MS_MINUTO
}

/** Fim do expediente do dia (último turno; calendário corrido = fim do dia). Nada de 17:00 fixo no cálculo. */
export function fimDoExpediente(dia: number, cal: Calendario): number {
  const fimMin =
    cal.modo === 'corrido' ? 24 * 60 : cal.turnos.reduce((m, t) => (t.fimMin > m ? t.fimMin : m), 0)
  return instanteDe(dia, fimMin, cal)
}

/** Converte "AAAA-MM-DDTHH:mm:ss-03:00" (ou data simples) em epoch ms, sem usar Date. */
export function instanteDeIso(texto: string, cal: Calendario): number {
  const m =
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?(?:([+-])(\d{2}):(\d{2}))?)?$/.exec(
      texto,
    )
  if (!m) throw new Error(`Instante inválido: ${texto}`)
  const dia = diasDesdeCivil(Number(m[1]), Number(m[2]), Number(m[3]))
  const min = Number(m[4] ?? 0) * 60 + Number(m[5] ?? 0)
  const seg = Number(m[6] ?? 0)
  const off = m[7]
    ? (m[7] === '-' ? -1 : 1) * (Number(m[8]) * 60 + Number(m[9]))
    : cal.offsetMinutos
  return dia * MS_DIA + min * MS_MINUTO + seg * 1000 - off * MS_MINUTO
}

export function ehDiaUtil(dia: number, cal: Calendario): boolean {
  if (cal.modo === 'corrido') return true
  return diaDaSemana(dia) < 5 && !cal.feriados.has(isoDeDia(dia))
}

export function proximoDiaUtil(dia: number, cal: Calendario): number {
  let d = dia
  while (!ehDiaUtil(d, cal)) d++
  return d
}

/** Dias úteis (número do dia) no intervalo [inicioDia, fimDia], inclusivo. */
export function diasUteisNoIntervalo(inicioDia: number, fimDia: number, cal: Calendario): number[] {
  const out: number[] = []
  for (let d = inicioDia; d <= fimDia; d++) if (ehDiaUtil(d, cal)) out.push(d)
  return out
}

/**
 * Horas úteis entre dois instantes (aditiva em intervalos contíguos).
 * Lança erro se `fim < inicio`. Intervalo nulo devolve 0.
 */
export function horasUteisEntre(inicio: number, fim: number, cal: Calendario): number {
  if (fim < inicio) throw new RangeError('horasUteisEntre: fim anterior ao início')
  if (fim === inicio) return 0
  if (cal.modo === 'corrido') return (fim - inicio) / MS_HORA
  const d0 = diaLocal(inicio, cal)
  const d1 = diaLocal(fim, cal)
  const turnos = cal.turnos
  let ms = 0
  for (let d = d0; d <= d1; d++) {
    if (!ehDiaUtil(d, cal)) continue
    for (const t of turnos) {
      const a = Math.max(inicio, instanteDe(d, t.inicioMin, cal))
      const b = Math.min(fim, instanteDe(d, t.fimMin, cal))
      if (b > a) ms += b - a
    }
  }
  return ms / MS_HORA
}

/** Instante em que `horas` úteis a partir de `inicio` se completam. `horas = 0` devolve `inicio`. */
export function somarHorasUteis(inicio: number, horas: number, cal: Calendario): number {
  if (horas < 0) throw new RangeError('somarHorasUteis: horas negativas')
  if (horas === 0) return inicio
  if (cal.modo === 'corrido') return inicio + horas * MS_HORA
  const turnos = cal.turnos
  let restante = horas * MS_HORA
  let d = diaLocal(inicio, cal)
  for (let guarda = 0; guarda < 100_000; guarda++, d++) {
    if (!ehDiaUtil(d, cal)) continue
    for (const t of turnos) {
      const ini = Math.max(inicio, instanteDe(d, t.inicioMin, cal))
      const fim = instanteDe(d, t.fimMin, cal)
      if (fim <= ini) continue
      const disp = fim - ini
      if (restante <= disp) return ini + restante
      restante -= disp
    }
  }
  throw new RangeError('somarHorasUteis: horizonte excedido')
}

export function diasUteis(horas: number, cal: Calendario): number {
  return horas / cal.horasPorDia
}
