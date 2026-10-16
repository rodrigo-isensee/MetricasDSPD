import type { ResultadoVisaoGeral } from '@metricas-dspd/contratos'
import { MINIMO_AMOSTRA } from '@metricas-dspd/contratos'
import { fmtInteiro, fmtPct } from '@/lib/formatar'

export type Alerta = ResultadoVisaoGeral['alertas'][number]
export type Indicador = ResultadoVisaoGeral['niveis'][number]['indicadores'][number]
export type NivelId = Alerta['nivel']
export type SegmentoEI = ResultadoVisaoGeral['esperaInvisivel'][number]['segmentos'][number]

export const ROTA_DO_NIVEL: Record<NivelId, string> = {
  // O padrão de `/operacional` agora é o Resumo: os links da Visão geral levam a uma visão de detalhe (nunca ao Resumo).
  operacional: '/operacional?cadencia=diaria',
  tatico: '/tatico',
  estrategico: '/estrategico',
  sustentacao: '/operacional?cadencia=sustentacao',
}

export const NOME_DO_NIVEL: Record<NivelId, string> = {
  operacional: 'Operacional',
  tatico: 'Tático',
  estrategico: 'Estratégico',
  sustentacao: 'Sustentação',
}

const kde = (v: number, d: number | null) =>
  d === null ? fmtInteiro(v) : `${fmtInteiro(v)} de ${fmtInteiro(d)}`

/** Texto de cada alerta (o DTO traz só o código e os números; o texto é do painel). */
export function textoAlerta(a: Alerta): string {
  switch (a.codigo) {
    case 'O2_ACIMA_P95':
      return `${kde(a.valor, a.de)} itens acima do P95 de idade`
    case 'O1_WIP_ACIMA_LIMITE':
      return `WIP dentro do limite em ${kde(a.valor, a.de)} dias úteis (meta: 90% dos dias)`
    case 'O12_VENCIDOS_INTERNOS':
      return `${fmtInteiro(a.valor)} itens vencidos por causa interna`
    case 'O10_BACKLOG_180':
      return `${fmtInteiro(a.valor)} itens do backlog com mais de 180 dias`
    case 'T2_ABAIXO_85':
      return `Aderência ao SLE abaixo de 85% em ${kde(a.valor, a.de)} classes`
    case 'T4_RAZAO_FORA':
      return `Razão chegada/vazão fora de 0,9 a 1,0 em ${kde(a.valor, a.de)} classes`
    case 'T3_DESVIO':
      return `Desvio de alocação acima de 10 p.p. em ${kde(a.valor, a.de)} naturezas`
    case 'T9_ESCOPO':
      return `${kde(a.valor, a.de)} projetos com escopo adicionado depois do início`
    case 'E2_ABAIXO_60':
      return `Evolução vinculada a objetivo em ${fmtPct(a.valor, 0)} (meta: 60% ou mais)`
    case 'E3_SEM_RESULTADO':
      return `${kde(a.valor, a.de)} iniciativas sem resultado declarado`
    case 'S2_ABAIXO_90':
      return `Aderência ao SLA abaixo de 90% em ${kde(a.valor, a.de)} prioridades`
    case 'S1_MEDIANA_ACIMA_ALVO':
      return `Mediana acima do alvo em ${kde(a.valor, a.de)} prioridades`
  }
}

/** Frase de um indicador do cartão de nível. Nunca um número quando a amostra é insuficiente (B3). */
export function textoIndicador(i: Indicador): string {
  if (i.status === 'insuficiente') {
    return i.amostra
      ? `Amostra insuficiente (${fmtInteiro(i.amostra.n)} de ${MINIMO_AMOSTRA} itens mínimos)`
      : 'Amostra insuficiente'
  }
  const v = i.valor ?? 0
  switch (i.codigo) {
    case 'O2':
      return `${kde(v, i.de)} acima do P95 de idade (O2)`
    case 'O1':
      return `WIP dentro do limite em ${fmtPct(v, 0)} dos dias (O1)`
    case 'BLOQUEADOS':
      return `${fmtInteiro(v)} bloqueados agora`
    case 'T2':
      return `${kde(v, i.de)} classes com aderência abaixo de 85% (T2)`
    case 'T4':
      return `${kde(v, i.de)} classes fora de 0,9 a 1,0 (T4)`
    case 'T9':
      return `${kde(v, i.de)} projetos com escopo crescido (T9)`
    case 'E3':
      return `${kde(v, i.de)} iniciativas sem resultado declarado (E3)`
    case 'E2':
      return `Evolução vinculada a objetivo: ${fmtPct(v, 0)} (E2)`
    case 'S2':
      return `${kde(v, i.de)} prioridades abaixo de 90% (S2)`
    case 'S1':
      return `${kde(v, i.de)} prioridades com mediana acima do alvo (S1)`
    case 'S2_P1':
      return `P1: ${fmtPct(v, 0)} das restaurações no prazo (S2)`
    default:
      return `${fmtInteiro(v)} (${i.codigo})`
  }
}

export interface ResumoEI {
  /** Segmento nomeado de maior índice com amostra suficiente (Q1); null = nenhum. */
  escolhido: {
    rotulo: string | null
    est: Extract<SegmentoEI['estatistica'], { status: 'ok' }>
  } | null
  /** Sem segmento publicável: o de maior n, só para dizer o quanto falta (nunca número misturado). */
  maiorInsuficiente: { rotulo: string | null; n: number } | null
}

/**
 * Q1 (spec rev. 3): cada nível mostra UM segmento nomeado, o de maior índice entre os com n >= 20
 * nas duas visões. Nunca mediana ou índice de tipos misturados. Empate: o primeiro da lista.
 */
export function resumirEspera(segmentos: readonly SegmentoEI[]): ResumoEI {
  let escolhido: ResumoEI['escolhido'] = null
  let maior: ResumoEI['maiorInsuficiente'] = null
  for (const s of segmentos) {
    const e = s.estatistica
    if (e.status === 'ok') {
      if (!escolhido || e.valor.indicePct > escolhido.est.valor.indicePct)
        escolhido = { rotulo: s.rotulo, est: e }
    } else if (!maior || e.n > maior.n) maior = { rotulo: s.rotulo, n: e.n }
  }
  return { escolhido, maiorInsuficiente: escolhido ? null : maior }
}
