import { diaDeIso } from './calendario'
import type {
  Intervalo,
  MarcacaoCriterio,
  MetricaId,
  VersaoCriterio,
} from '@metricas-dspd/contratos'

export type { VersaoCriterio }

/**
 * O23 (estoque parado dentro do WIP, bloco do O2): limite em dias úteis, em constante única (A8).
 * Mudar o valor é mudar esta constante e registrar nova VersaoCriterio no mesmo commit (T2.6).
 */
export const LIMITE_PARADO_DIAS_UTEIS = 5

/** v1 do limite do O23: registro do critério que as bases (mock e real) incluem na sua lista de versões. */
export const VERSAO_CRITERIO_PARADOS_V1: VersaoCriterio = {
  id: 'criterio-2026-10-14-parados-v1',
  data: '2026-10-14',
  descricao: 'Estoque parado do O2: item sem mudar de coluna há mais de 5 dias úteis (v1)',
  afeta: ['O2'],
}

/** Versões de critério que pertencem à biblioteca (constantes únicas); somam-se às da base, sem repetir id. */
export const VERSOES_DA_BIBLIOTECA: readonly VersaoCriterio[] = [VERSAO_CRITERIO_PARADOS_V1]

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
  const todas = [
    ...versoes,
    ...VERSOES_DA_BIBLIOTECA.filter((l) => !versoes.some((v) => v.id === l.id)),
  ]
  return todas
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
