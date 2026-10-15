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

/**
 * P-1 = A (pedido 011): "descartado" passa a ser o estado nativo `discarded` do BusinessMap ou o card excluído, em todas
 * as métricas. Card com motivo de descarte preenchido e sem descarte deixa de sair dos cálculos e vira aviso no O25.
 */
export const VERSAO_CRITERIO_DESCARTE_NATIVO: VersaoCriterio = {
  id: 'criterio-2026-10-15-descarte-nativo',
  data: '2026-10-15',
  descricao:
    'Descartado passou a ser o estado nativo do BusinessMap (descartado ou excluído); motivo preenchido sem descarte não sai mais dos cálculos',
  afeta: [
    'O1',
    'O2',
    'BLOQUEADOS',
    'O3',
    'O4',
    'O5',
    'O6',
    'O7',
    'O8',
    'O9',
    'O10',
    'O11',
    'O12',
    'O13',
    'O14',
    'O15',
    'O16',
    'O18',
    'O19',
    'O20',
    'O21',
    'O24',
    'O25',
    'T1',
    'T2',
    'T3',
    'T4',
    'T5',
    'T6',
    'T7',
    'T8',
    'T9',
    'T10',
    'T12',
    'E1',
    'E2',
    'E3',
    'E4',
    'E5',
    'E7',
    'E9',
    'EI_FL1',
    'EI_FL2',
    'EI_FL3',
  ],
}

/** Versões de critério que pertencem à biblioteca (constantes únicas); somam-se às da base, sem repetir id. */
export const VERSOES_DA_BIBLIOTECA: readonly VersaoCriterio[] = [
  VERSAO_CRITERIO_PARADOS_V1,
  VERSAO_CRITERIO_DESCARTE_NATIVO,
]

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
