import {
  METRICAS_SUSTENTACAO,
  METRICA_IDS,
  type Dominio,
  type JanelaCalibracao,
  type MetricaId,
  type VersaoCriterio,
} from '@metricas-dspd/contratos'
import { diaDeIso, isoDeDia } from './calendario'

/** Único lugar do número (D3; provisório até o usuário confirmar). */
export const DURACAO_CALIBRACAO_DIAS = 60

/** Métricas de cada fonte; a Visão geral não pertence a nenhuma (nunca mistura as duas). */
export function metricasDaFonte(dominio: Dominio): MetricaId[] {
  const sust = new Set<MetricaId>(METRICAS_SUSTENTACAO)
  return METRICA_IDS.filter(
    (m) => m !== 'VISAO_GERAL' && (dominio === 'acelerato' ? sust.has(m) : !sust.has(m)),
  )
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
