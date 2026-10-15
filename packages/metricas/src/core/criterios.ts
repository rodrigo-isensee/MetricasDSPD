import { diaDeIso } from './calendario'
import {
  METRICA_IDS,
  fonteDaMetrica,
  type Intervalo,
  type MarcacaoCriterio,
  type MetricaId,
  type VersaoCriterio,
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
 * Ids nascidas depois de 2026-10-15 (data da versão do descarte nativo): não entram no `afeta` dela, mesmo sendo do
 * BusinessMap. Quem criar uma métrica nova a lista aqui, nominalmente (T11 no B11b, T14...).
 */
export const NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO: readonly MetricaId[] = []

/** `afeta` do descarte nativo, derivado do catálogo: toda métrica de fonte BusinessMap, menos as nascidas depois. */
const METRICAS_DO_DESCARTE_NATIVO: MetricaId[] = METRICA_IDS.filter(
  (id) => fonteDaMetrica(id) === 'businessmap' && !NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO.includes(id),
)

/**
 * P-1 = A (pedido 011): "descartado" passa a ser o estado nativo `discarded` do BusinessMap ou o card excluído, em todas
 * as métricas. Card com motivo de descarte preenchido e sem descarte deixa de sair dos cálculos e vira aviso no O25.
 */
export const VERSAO_CRITERIO_DESCARTE_NATIVO: VersaoCriterio = {
  id: 'criterio-2026-10-15-descarte-nativo',
  data: '2026-10-15',
  descricao:
    'Descartado passou a ser o estado nativo do BusinessMap (descartado ou excluído); motivo preenchido sem descarte não sai mais dos cálculos',
  afeta: METRICAS_DO_DESCARTE_NATIVO,
}

/**
 * O25(b) = B (pedido 011, 2026-10-16): card entregue e excluído depois deixa de ser descarte e continua como entrega na
 * vazão e no ciclo. Mesma abrangência do descarte nativo (todas as métricas de fonte BusinessMap).
 */
export const VERSAO_CRITERIO_EXCLUIDO_ENTREGUE: VersaoCriterio = {
  id: 'criterio-2026-10-16-excluido-entregue',
  data: '2026-10-16',
  descricao:
    'Card entregue e depois excluído deixou de contar como descarte: segue como entrega na vazão e no ciclo',
  afeta: METRICAS_DO_DESCARTE_NATIVO,
}

/** O20-destaque = A (pedido 011, 2026-10-16): o destaque do fluxo cumulativo não considera mais o Backlog. */
export const VERSAO_CRITERIO_O20_DESTAQUE_V2: VersaoCriterio = {
  id: 'criterio-2026-10-16-o20-destaque-sem-backlog',
  data: '2026-10-16',
  descricao:
    'Destaque do fluxo cumulativo considera só as filas a partir do compromisso (sem o Backlog)',
  afeta: ['O20'],
}

/** Versões de critério que pertencem à biblioteca (constantes únicas); somam-se às da base, sem repetir id. */
export const VERSOES_DA_BIBLIOTECA: readonly VersaoCriterio[] = [
  VERSAO_CRITERIO_PARADOS_V1,
  VERSAO_CRITERIO_DESCARTE_NATIVO,
  VERSAO_CRITERIO_EXCLUIDO_ENTREGUE,
  VERSAO_CRITERIO_O20_DESTAQUE_V2,
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
