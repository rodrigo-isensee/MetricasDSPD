import type { Intervalo, Periodo } from '@metricas-dspd/contratos'
import {
  diaDeIso,
  inicioDaSemana,
  isoDeDia,
  mesDeDia,
  primeiroDiaDoMes,
  somarMeses,
  trimestreDeDia,
  ultimoDiaDoMes,
} from './calendario'

export interface Balde {
  /** Segunda-feira (AAAA-MM-DD) na semana; AAAA-MM no mês; AAAA-Tn no trimestre. */
  chave: string
  inicioDia: number
  fimDia: number
  /** Ainda não terminou na data de corte (D9): listrado, fora de estatísticas. */
  emAndamento: boolean
}

/** Converte o filtro de período em intervalo, sempre terminando na data de corte (exceto custom). */
export function resolverPeriodo(periodo: Periodo, hojeIso: string): Intervalo {
  const hoje = diaDeIso(hojeIso)
  switch (periodo.tipo) {
    case '4s':
      return { inicio: isoDeDia(hoje - 27), fim: hojeIso }
    case '12s':
      return { inicio: isoDeDia(hoje - 83), fim: hojeIso }
    case '6m':
      return { inicio: isoDeDia(somarMeses(hoje, -6) + 1), fim: hojeIso }
    case '12m':
      return { inicio: isoDeDia(somarMeses(hoje, -12) + 1), fim: hojeIso }
    case 'custom':
      return { inicio: periodo.de, fim: periodo.ate }
  }
}

/** Semanas (seg a dom) cuja segunda-feira está dentro do intervalo; a corrente fica "em andamento". */
export function semanasEntre(inicioDia: number, fimDia: number, hojeDia: number): Balde[] {
  const out: Balde[] = []
  let seg = inicioDaSemana(inicioDia)
  if (seg < inicioDia) seg += 7
  for (; seg <= fimDia; seg += 7) {
    out.push({
      chave: isoDeDia(seg),
      inicioDia: seg,
      fimDia: seg + 6,
      emAndamento: seg + 6 > hojeDia,
    })
  }
  return out
}

/** Meses cujo primeiro dia está dentro do intervalo (o mês do corte fica "em andamento"). */
export function mesesEntre(inicioDia: number, fimDia: number, hojeDia: number): Balde[] {
  const out: Balde[] = []
  let m = mesDeDia(inicioDia)
  if (primeiroDiaDoMes(m) < inicioDia) m = mesDeDia(ultimoDiaDoMes(m) + 1)
  while (primeiroDiaDoMes(m) <= fimDia) {
    const f = ultimoDiaDoMes(m)
    out.push({ chave: m, inicioDia: primeiroDiaDoMes(m), fimDia: f, emAndamento: f > hojeDia })
    m = mesDeDia(f + 1)
  }
  return out
}

/** Trimestres civis que tocam o intervalo. */
export function trimestresEntre(inicioDia: number, fimDia: number, hojeDia: number): Balde[] {
  const out: Balde[] = []
  let d = inicioDia
  while (d <= fimDia) {
    const c = trimestreDeDia(d)
    const [ano, t] = c.split('-T').map(Number) as [number, number]
    const ini = primeiroDiaDoMes(`${ano}-${String((t - 1) * 3 + 1).padStart(2, '0')}`)
    const fim = ultimoDiaDoMes(`${ano}-${String(t * 3).padStart(2, '0')}`)
    out.push({ chave: c, inicioDia: ini, fimDia: fim, emAndamento: fim > hojeDia })
    d = fim + 1
  }
  return out
}

/** Meses da tendência do Resumo (ADR 0019): os 6 últimos meses-calendário fechados. */
export const MESES_TENDENCIA = 6

/**
 * Os `n` últimos meses-calendário cujo último dia é menor ou igual ao dia de referência, do mais antigo ao mais
 * recente. O mês em curso fica de fora; se a referência é o último dia do mês, esse mês já está fechado.
 */
export function mesesFechados(hojeDia: number, n: number): Balde[] {
  let m = mesDeDia(hojeDia)
  if (ultimoDiaDoMes(m) > hojeDia) m = mesDeDia(primeiroDiaDoMes(m) - 1)
  const out: Balde[] = []
  for (let i = 0; i < n; i++) {
    const f = ultimoDiaDoMes(m)
    out.unshift({ chave: m, inicioDia: primeiroDiaDoMes(m), fimDia: f, emAndamento: false })
    m = mesDeDia(primeiroDiaDoMes(m) - 1)
  }
  return out
}

/** Do primeiro dia do mais antigo ao último dia do mais recente de uma lista de meses (não vazia). */
export function limitesDosMeses(baldes: readonly Balde[]): {
  inicioDia: number
  primeiroFimDia: number
  fimDia: number
} {
  return {
    inicioDia: (baldes[0] as Balde).inicioDia,
    primeiroFimDia: (baldes[0] as Balde).fimDia,
    fimDia: (baldes[baldes.length - 1] as Balde).fimDia,
  }
}
