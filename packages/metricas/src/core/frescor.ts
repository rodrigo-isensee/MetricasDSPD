import type { EventoColeta, SeloFrescor } from '@metricas-dspd/contratos'
import { CALENDARIO_PADRAO, MS_MINUTO, dataIso, diaLocal, instanteDe } from './calendario'

/** Agendador diário (America/Sao_Paulo). */
export const HORARIO_COLETA = '06:00'
/** PROVISÓRIO: tolerância do "Atrasado" é pergunta ao usuário (plano §7 R1). */
export const TOLERANCIA_ATRASO_HORAS = 0

const MIN_COLETA = Number(HORARIO_COLETA.slice(0, 2)) * 60 + Number(HORARIO_COLETA.slice(3))

/** ISO com o offset do calendário padrão (-03:00, sem horário de verão). */
export function isoLocal(ms: number): string {
  const local = ms + CALENDARIO_PADRAO.offsetMinutos * MS_MINUTO
  const hora = new Date(local).toISOString().slice(11, 19)
  return `${dataIso(ms, CALENDARIO_PADRAO)}T${hora}-03:00`
}

/** Próxima coleta estritamente depois de `agoraMs`. */
export function proximaColeta(agoraMs: number): number {
  const dia = diaLocal(agoraMs, CALENDARIO_PADRAO)
  const hoje = instanteDe(dia, MIN_COLETA, CALENDARIO_PADRAO)
  return hoje > agoraMs ? hoje : instanteDe(dia + 1, MIN_COLETA, CALENDARIO_PADRAO)
}

/** Precedência: sem-coleta > falha (última tentativa falhou) > atrasado > atual. */
export function seloFrescor(
  ultimaOk: EventoColeta | null,
  ultimaTentativa: EventoColeta | null,
  agoraMs: number,
): SeloFrescor {
  if (ultimaTentativa === null && ultimaOk === null) return 'sem-coleta'
  if (ultimaTentativa?.resultado === 'falha') return 'falha'
  if (ultimaOk === null) return 'sem-coleta'
  const limite = proximaColeta(Date.parse(ultimaOk.fim)) + TOLERANCIA_ATRASO_HORAS * 3_600_000
  return agoraMs > limite ? 'atrasado' : 'atual'
}
