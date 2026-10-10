import type { ResultadoT2 } from '@metricas-dspd/contratos'
import { CLASSES_SERVICO, META_ADERENCIA_SLE_PCT } from '@metricas-dspd/contratos'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { publicavel, taxa } from '../core/estatistica'
import { maximo } from '../core/extremos'
import {
  baseAmostral,
  criterios,
  dentro,
  du,
  ehDemanda,
  janelaPercentis,
  periodoDe,
  selecionar,
} from './comum'
import { blocosDe } from './blocos'
import type { ContextoBM } from './indice'

const ETAPAS = ['Fila', 'Espera', 'Execução', 'Homologação'] as const

/** T2: aderência ao SLE publicado por classe e etapa onde o tempo foi perdido (maior bloco). */
export function calcularT2(ctx: ContextoBM, f: FiltrosFluxo): ResultadoT2 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f, 'story')
  const cards = selecionar(ctx, f, 'story')
    .filter(ehDemanda)
    .filter((m) => m.cicloHU !== null && dentro(ctx, m.entrega, janela))
  let total = 0
  const classes = CLASSES_SERVICO.map((classe) => {
    const xs = cards.filter((m) => m.card.classe_servico === classe)
    total += xs.length
    const cfg = ctx.idx.base.config.sle.find((s) => s.classe === classe)
    const sleDias = cfg?.dias_uteis ?? null
    const suficiente = publicavel(xs.length)
    if (sleDias === null) {
      return {
        classe,
        sle: null,
        n: xs.length,
        dentroDoSle: null,
        statusMeta: 'sem-referencia' as const,
        estouros: { total: 0, porEtapa: ETAPAS.map((etapa) => ({ etapa, contagem: 0 })) },
      }
    }
    const fora = xs.filter((m) => du(ctx, m.cicloHU as number) > sleDias)
    const por = [0, 0, 0, 0]
    for (const m of fora) {
      const b = blocosDe(ctx, m)
      if (!b) continue
      const v = [b.fila, b.espera, b.execucao, b.homologacao]
      const i = v.indexOf(maximo(v))
      por[i] = (por[i] as number) + 1
    }
    const t = taxa(xs.length - fora.length, xs.length)
    return {
      classe,
      sle: suficiente && cfg ? { diasUteis: sleDias, publicadoEm: cfg.publicado_em } : null,
      n: xs.length,
      dentroDoSle: t,
      statusMeta:
        t.status === 'ok'
          ? t.pct >= META_ADERENCIA_SLE_PCT
            ? ('dentro' as const)
            : ('fora' as const)
          : ('sem-referencia' as const),
      estouros: {
        total: fora.length,
        porEtapa: ETAPAS.map((etapa, i) => ({ etapa, contagem: por[i] as number })),
      },
    }
  })
  return {
    base: baseAmostral(total, 'demandas entregues', janela),
    criterios: criterios('T2', periodo, janela, ctx),
    janelaPercentis: janela,
    classes,
  }
}
