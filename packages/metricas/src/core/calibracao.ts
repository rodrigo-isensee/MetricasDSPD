import {
  METRICA_IDS,
  fonteDaMetrica,
  type Dominio,
  type JanelaCalibracao,
  type MetricaId,
  type VersaoCriterio,
} from '@metricas-dspd/contratos'
import { diaDeIso, isoDeDia } from './calendario'

/** Único lugar do número: 60 dias corridos, confirmado pelo dono (Q-7a, 2026-10-29; a D3 do 006 deixou de ser provisória). */
export const DURACAO_CALIBRACAO_DIAS = 60

/** Métricas de cada fonte; a Visão geral não pertence a nenhuma (nunca mistura as duas). */
export function metricasDaFonte(dominio: Dominio): MetricaId[] {
  // fonteDaMetrica exclui a Visão geral ('ambos') e a PV1 ('pesquisa'): a pesquisa não passa por calibração.
  return METRICA_IDS.filter((m) => fonteDaMetrica(m) === dominio)
}

function janela(
  inicioIso: string,
  origem: JanelaCalibracao['origem'],
  criterioId: string | null,
  metricas: MetricaId[],
): JanelaCalibracao {
  const inicio = diaDeIso(inicioIso)
  return {
    inicio: isoDeDia(inicio),
    fim: isoDeDia(inicio + DURACAO_CALIBRACAO_DIAS - 1),
    origem,
    criterioId,
    metricas,
  }
}

/**
 * (a) primeira coleta ok da fonte: todas as métricas da fonte; (b) cada versão de critério:
 * só as métricas afetadas que pertencem à fonte. Intervalo fechado [inicio, inicio + 59].
 */
export function janelasCalibracao(
  dominio: Dominio,
  primeiraOkIso: string | null,
  versoes: readonly VersaoCriterio[],
): JanelaCalibracao[] {
  const daFonte = metricasDaFonte(dominio)
  const janelas: JanelaCalibracao[] = []
  if (primeiraOkIso !== null) janelas.push(janela(primeiraOkIso, 'inicio-coleta', null, daFonte))
  for (const v of versoes) {
    const metricas = v.afeta.filter((m) => daFonte.includes(m))
    if (metricas.length > 0) janelas.push(janela(v.data, 'criterio', v.id, metricas))
  }
  return janelas
}

export function vigentes(
  janelas: readonly JanelaCalibracao[],
  hojeIso: string,
): JanelaCalibracao[] {
  return janelas.filter((j) => j.inicio <= hojeIso && hojeIso <= j.fim)
}

export function metricasEmCalibracao(vig: readonly JanelaCalibracao[]): MetricaId[] {
  const em = new Set(vig.flatMap((j) => j.metricas))
  return METRICA_IDS.filter((m) => em.has(m))
}
