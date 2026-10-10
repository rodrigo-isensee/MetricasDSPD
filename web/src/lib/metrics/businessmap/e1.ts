import type { ResultadoE1 } from '@/contracts/metricas'
import type { FiltrosFluxo } from '@/contracts/filtros'
import { diaLocal, horasUteisEntre, isoDeDia, trimestreDeDia } from '../core/calendario'
import { medianaDe, percentisDe, estatistica, publicavel } from '../core/estatistica'
import { janelaDeslocada } from '../core/janela'
import { ordenarNeutro } from '../core/ordenar'
import { amostraBM } from './amostra'
import {
  baseAmostral,
  criterios,
  dentro,
  du,
  janelaPercentis,
  periodoDe,
  r2,
  selecionar,
} from './comum'
import { slug } from '../slug'
import type { ContextoBM } from './indice'

/** Tipos de projeto (decisão Q4): cada um tem a própria estatística. */
const TIPOS_PROJETO = ['Iniciativa', 'Melhoria'] as const

/**
 * E1: lead time de projetos (criação do card aprovado → entrega), antes e depois do início.
 * Segmentado por tipo de projeto (4.2): Iniciativa e Melhoria nunca entram na mesma mediana.
 */
export function calcularE1(ctx: ContextoBM, f: FiltrosFluxo): ResultadoE1 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f, 'projeto')
  const concl = selecionar(ctx, f, 'projeto', { semEquipe: true, semTipo: true }).filter(
    (m) => m.entrega !== null && m.inicio !== null,
  )
  const todos = concl.map((m) => {
    const entrega = m.entrega ?? 0
    const inicio = m.inicio ?? entrega
    const total = du(ctx, horasUteisEntre(m.entrada, entrega, ctx.cal))
    const antes = du(ctx, horasUteisEntre(m.entrada, inicio, ctx.cal))
    return { m, entrega, total, antes, exec: Math.max(0, total - antes) }
  })
  const ant = janelaDeslocada(janela, 12)
  const am = (vs: readonly number[]) => amostraBM('projeto', vs, janela)
  const segmentos = TIPOS_PROJETO.map((tipo) => {
    const itens = todos.filter((i) => i.m.card.tipo === tipo)
    const naJanela = itens.filter((i) => dentro(ctx, i.entrega, janela))
    const noPeriodo = itens.filter((i) => dentro(ctx, i.entrega, periodo))
    const antVals = itens.filter((i) => dentro(ctx, i.entrega, ant)).map((i) => i.total)
    const atualMed = publicavel(naJanela.length)
      ? medianaDe(am(naJanela.map((i) => i.total)))
      : null
    const antMed = publicavel(antVals.length) ? medianaDe(am(antVals)) : null
    const ok = atualMed !== null && antMed !== null && antMed !== 0
    return {
      chave: slug(tipo),
      rotulo: tipo,
      n: naJanela.length,
      pontos: ordenarNeutro(
        noPeriodo.map((i) => ({
          cardId: i.m.card.card_id,
          titulo: i.m.card.titulo,
          concluidoEm: isoDeDia(diaLocal(i.entrega, ctx.cal)),
          trimestre: trimestreDeDia(diaLocal(i.entrega, ctx.cal)),
          leadTimeDiasUteis: r2(i.total),
        })),
        (x) => [x.cardId],
      ),
      estatistica: estatistica(naJanela.length, janela, () => {
        const p = percentisDe(am(naJanela.map((i) => i.total)))
        return {
          total: { p50: r2(p.p50), p85: r2(p.p85), p95: r2(p.p95) },
          medianaAntesDoInicio: r2(medianaDe(am(naJanela.map((i) => i.antes)))),
          medianaExecucao: r2(medianaDe(am(naJanela.map((i) => i.exec)))),
          fracaoAntesPct: r2(
            medianaDe(am(naJanela.map((i) => (i.total > 0 ? (i.antes / i.total) * 100 : 0)))),
          ),
        }
      }),
      variacaoMediana: {
        status: ok ? ('ok' as const) : ('indisponivel' as const),
        atual: atualMed === null ? null : r2(atualMed),
        anterior: antMed === null ? null : r2(antMed),
        variacaoPct: ok ? r2(((atualMed - antMed) / antMed) * 100) : null,
      },
    }
  })
  return {
    base: baseAmostral(
      segmentos.reduce((s, x) => s + x.n, 0),
      'projetos concluídos',
      janela,
    ),
    criterios: criterios('E1', periodo, janela, ctx),
    janelaPercentis: janela,
    segmentoPor: 'tipo',
    segmentos,
  }
}
