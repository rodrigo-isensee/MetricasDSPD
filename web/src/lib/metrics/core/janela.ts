import { JANELA_PERCENTIS_PADRAO, type Intervalo, type Janela } from '@/contracts/comum'
import {
  diaDeIso,
  diaLocal,
  inicioDaSemana,
  isoDeDia,
  somarMeses,
  type Calendario,
} from './calendario'

export type EspecJanela = { unidade: 'semanas' | 'meses'; quantidade: number }
export type ClasseJanela = 'story' | 'frente' | 'projeto' | 'chamado'

/**
 * Janela móvel de percentis por granularidade, numa única constante. O briefing manda 12 semanas
 * para tudo (`JANELA_PERCENTIS_PADRAO`, em contracts, que a interface também lê). A spec de UX sugere
 * 12 meses (provisório) para frente e projeto: é pergunta em aberto ao usuário (P3 / pergunta 2);
 * para mudar, edite UMA linha abaixo.
 */
export const JANELA_POR_GRANULARIDADE: Record<ClasseJanela, EspecJanela> = {
  story: JANELA_PERCENTIS_PADRAO,
  frente: JANELA_PERCENTIS_PADRAO,
  projeto: JANELA_PERCENTIS_PADRAO,
  chamado: JANELA_PERCENTIS_PADRAO,
}

/** Início (dia) da janela que termina em `fimDia` (inclusive). 12 semanas = 84 dias corridos. */
export function inicioDaJanela(fimDia: number, espec: EspecJanela): number {
  if (espec.unidade === 'semanas') return fimDia - espec.quantidade * 7 + 1
  return somarMeses(fimDia, -espec.quantidade) + 1
}

export function janelaMovel(fimIso: string, espec: EspecJanela): Janela {
  const fim = diaDeIso(fimIso)
  return {
    inicio: isoDeDia(inicioDaJanela(fim, espec)),
    fim: fimIso,
    unidade: espec.unidade,
    quantidade: espec.quantidade,
  }
}

export function janelaMovelDia(fimDia: number, espec: EspecJanela): Janela {
  return janelaMovel(isoDeDia(fimDia), espec)
}

/** Dia 84 está dentro da janela de 12 semanas; o dia 85 está fora. */
export function dentroDoIntervalo(ms: number, j: Intervalo, cal: Calendario): boolean {
  const d = diaLocal(ms, cal)
  return d >= diaDeIso(j.inicio) && d <= diaDeIso(j.fim)
}

export function diaDentro(dia: number, j: Intervalo): boolean {
  return dia >= diaDeIso(j.inicio) && dia <= diaDeIso(j.fim)
}

/** Janela equivalente deslocada para trás (comparações semestrais/anuais, pergunta 20). */
export function janelaDeslocada(j: Janela, meses: number): Janela {
  const fim = somarMeses(diaDeIso(j.fim), -meses)
  return janelaMovelDia(fim, { unidade: j.unidade, quantidade: j.quantidade })
}

/** Fins de semana (domingos) das semanas completas até `fimDia`. */
export function domingosAte(inicioDia: number, fimDia: number): number[] {
  const out: number[] = []
  for (let d = inicioDaSemana(inicioDia) + 6; d <= fimDia; d += 7) out.push(d)
  return out
}
