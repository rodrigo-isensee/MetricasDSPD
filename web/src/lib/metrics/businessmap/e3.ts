import type { ResultadoE3 } from '@/contracts/metricas'
import type { FiltrosFluxo } from '@/contracts/filtros'
import { baseAmostral, criterios, periodoDe, r2, selecionar } from './comum'
import type { ContextoBM } from './indice'
import { ordenarNeutro } from '../core/ordenar'

/** E3: entrega x resultado por iniciativa. Censo (sem mínimo de 20); iniciativas sem ficha vêm primeiro. */
export function calcularE3(ctx: ContextoBM, f: FiltrosFluxo): ResultadoE3 {
  const periodo = periodoDe(ctx, f)
  const ini = selecionar(ctx, f, 'projeto', { semEquipe: true, semTipo: true }).filter(
    (m) => m.card.tipo === 'Iniciativa',
  )
  const iniciativasBrutas = ini.map((m) => {
    const ficha = ctx.idx.base.fichas.find((x) => x.card_id === m.card.card_id) ?? null
    return {
      cardId: m.card.card_id,
      nome: m.card.titulo,
      situacao: m.entrega !== null ? ('concluída' as const) : ('em andamento' as const),
      ficha: ficha
        ? {
            resultadoEsperado: ficha.resultado_esperado,
            declaradoAntesDoInicio: ficha.declarado_antes_do_inicio,
            unidade: ficha.unidade,
            ganhoPrevisto: ficha.ganho_previsto,
            ganhoMedido: ficha.ganho_medido,
            medida: ficha.medida,
            dataDeclaracao: ficha.data_declaracao,
          }
        : null,
      atingimentoPct:
        ficha && ficha.ganho_medido !== null && ficha.ganho_previsto > 0
          ? r2((ficha.ganho_medido / ficha.ganho_previsto) * 100)
          : null,
    }
  })
  const iniciativas = ordenarNeutro(iniciativasBrutas, (i) => [Number(i.ficha !== null), i.cardId])
  const com = iniciativas.filter((i) => i.ficha !== null).length
  return {
    base: baseAmostral(iniciativas.length, 'iniciativas', null),
    criterios: criterios('E3', periodo, periodo, ctx),
    comFicha: { k: com, n: iniciativas.length },
    semFicha: iniciativas.length - com,
    statusMeta:
      iniciativas.length === 0 ? 'sem-referencia' : com === iniciativas.length ? 'dentro' : 'fora',
    iniciativas,
  }
}
