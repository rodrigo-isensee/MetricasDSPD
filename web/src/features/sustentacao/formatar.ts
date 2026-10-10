import type { Prioridade } from '@metricas-dspd/contratos'
import { fmtNumero } from '@/lib/formatar'

const HORAS_POR_DIA = 8

/** "h úteis" com até 2 casas e sem zeros sobrando (15 min = "0,25 h úteis"). Nunca minutos nem horas corridas (J2). */
export function fmtHU(h: number): string {
  return `${fmtNumero(h, 2)} h úteis`
}

/** Unidade fixa por prioridade (J2): P1 a P3 em h úteis; P4 e P5 em dias úteis (até 1 casa; singular até 1,0). */
export function fmtTempoPrioridade(h: number, p: Prioridade): string {
  if (p === 'P4' || p === 'P5') {
    const d = Math.round((h / HORAS_POR_DIA) * 10) / 10
    return `${fmtNumero(d, 1)} ${d <= 1 ? 'dia útil' : 'dias úteis'}`
  }
  return fmtHU(h)
}

export const minusculo = (p: string) => p.toLowerCase()
