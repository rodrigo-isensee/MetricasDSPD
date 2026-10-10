import { diaDeIso } from './calendario'
import type {
  Intervalo,
  MarcacaoCriterio,
  MetricaId,
  VersaoCriterio,
} from '@metricas-dspd/contratos'

export type { VersaoCriterio }

/**
 * Mudanças de critério de cálculo (T2.6). A lista vive na configuração da base; aqui só se
 * decide quais cruzam um período. Percentil tipo 7 e janela de 12 semanas são o critério v1.
 */
export function marcacoesNoPeriodo(
  metrica: MetricaId,
  periodo: Intervalo,
  versoes: readonly VersaoCriterio[],
): MarcacaoCriterio[] {
  const a = diaDeIso(periodo.inicio)
  const b = diaDeIso(periodo.fim)
  return versoes
    .filter((v) => v.afeta.includes(metrica))
    .filter((v) => {
      const d = diaDeIso(v.data)
      return d > a && d <= b
    })
    .map(({ id, data, descricao }) => ({ id, data, descricao }))
    .sort((x, y) => x.data.localeCompare(y.data))
}

export function criteriosDe(
  metrica: MetricaId,
  serie: Intervalo,
  janela: Intervalo,
  versoes: readonly VersaoCriterio[],
) {
  return {
    serie: marcacoesNoPeriodo(metrica, serie, versoes),
    janela: marcacoesNoPeriodo(metrica, janela, versoes),
  }
}
