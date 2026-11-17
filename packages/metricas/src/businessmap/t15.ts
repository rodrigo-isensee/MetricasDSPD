import type { FiltrosFluxo, ResultadoT15 } from '@metricas-dspd/contratos'
import { diasUteisNoIntervalo, diaDeIso } from '../core/calendario'
import { resumoComMedia } from '../core/estatistica'
import { amostraBM } from './amostra'
import { baseAmostral, criterios, r2 } from './comum'
import { EXTENSAO_BM_VAZIA, TETO_DIAS_UTEIS_SPRINT, type ExtensaoBM } from './extensao'
import type { ContextoBM } from './indice'
import { sprintsDoRecorte } from './t8'

/**
 * T15: tamanho das sprints (pedido 105, E7.504). A duração de cada sprint em dias úteis, do primeiro início de execução à primeira conclusão do card Sprint
 * (a janela é a mesma função do T8: `sprintsDoRecorte`, com o teto de 30 dias úteis; sem as duas datas ou acima do teto a sprint fica fora da conta e é contada).
 * P50, P85 e a média juntos (nunca a média sozinha, 7.1), pela biblioteca (`resumoComMedia`). Um time por vez, só pelo filtro de equipe: não há quebra por
 * time, ranking nem comparação. Abaixo de 20 sprints no recorte só a contagem, sem estatística. Só BusinessMap.
 */
export function calcularT15(
  ctx: ContextoBM,
  f: FiltrosFluxo,
  ext: ExtensaoBM = EXTENSAO_BM_VAZIA,
): ResultadoT15 {
  const { periodo, dentro, semDatas, acimaDoTeto } = sprintsDoRecorte(ctx, f, ext)
  const dias = dentro.map(
    ({ janela }) =>
      diasUteisNoIntervalo(diaDeIso(janela.inicio), diaDeIso(janela.fim), ctx.cal).length,
  )
  // o recorte é o período do T8 (sprints que tocam o período); a janela da estatística é esse mesmo período
  const res = resumoComMedia(amostraBM('sprint', dias, periodo))
  const estatistica =
    res.status === 'ok'
      ? {
          ...res,
          valor: {
            p50: r2(res.valor.p50),
            p85: r2(res.valor.p85),
            p95: r2(res.valor.p95),
            media: r2(res.valor.media),
          },
        }
      : res
  return {
    base: baseAmostral(dias.length, 'sprints', periodo),
    criterios: criterios('T15', periodo, periodo, ctx),
    sprintsNoRecorte: dias.length,
    estatistica,
    foraDaConta: { semDatas, acimaDoTeto, tetoDiasUteis: TETO_DIAS_UTEIS_SPRINT },
  }
}
