import type { ResultadoT3 } from '@metricas-dspd/contratos'
import type { StatusMeta } from '@metricas-dspd/contratos'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { publicavel } from '../core/estatistica'
import { baseAmostral, criterios, dentro, du, ehDemanda, periodoDe, r2, selecionar } from './comum'
import type { ContextoBM, MarcosCard } from './indice'

type Natureza = 'Sustentação' | 'Evolução' | 'Projetos' | 'Dívida técnica'
const NATUREZAS: readonly Natureza[] = ['Sustentação', 'Evolução', 'Projetos', 'Dívida técnica']
const DESVIO_MAXIMO_PP = 10

/** Mapeamento tipo → natureza (P8 provisório): item com projeto acima = Projetos; senão pelo tipo. */
export function naturezaDe(m: MarcosCard): Natureza {
  if (m.projetoId !== null) return 'Projetos'
  switch (m.card.tipo) {
    case 'Incidente':
    case 'Requisição':
    case 'Defeito em produção':
      return 'Sustentação'
    case 'Dívida técnica':
      return 'Dívida técnica'
    default:
      return 'Evolução'
  }
}

/** T3: alocação da capacidade, acordado x realizado, por itens e por tempo em execução. */
export function calcularT3(ctx: ContextoBM, f: FiltrosFluxo): ResultadoT3 {
  const periodo = periodoDe(ctx, f)
  const xs = selecionar(ctx, f, 'story', { semTipo: true })
    .filter(ehDemanda)
    .filter((m) => m.cicloHU !== null && dentro(ctx, m.entrega, periodo))
  const totalItens = xs.length
  const totalHoras = xs.reduce((s, m) => s + (m.cicloHU ?? 0), 0)
  const ok = publicavel(totalItens)
  const medida = (q: number, total: number, acordado: number) => {
    const pct = ok && total > 0 ? r2((q / total) * 100) : null
    const desvio = pct === null ? null : r2(pct - acordado)
    const statusMeta: StatusMeta =
      desvio === null ? 'sem-referencia' : Math.abs(desvio) <= DESVIO_MAXIMO_PP ? 'dentro' : 'fora'
    return { quantidade: r2(q), pct, desvioPP: desvio, statusMeta }
  }
  return {
    base: baseAmostral(totalItens, 'itens entregues', periodo),
    criterios: criterios('T3', periodo, periodo, ctx),
    status: ok ? 'ok' : 'insuficiente',
    naturezas: NATUREZAS.map((natureza) => {
      const acordado = ctx.idx.base.config.alocacao.find((a) => a.natureza === natureza)?.pct ?? 0
      const dele = xs.filter((m) => naturezaDe(m) === natureza)
      return {
        natureza,
        acordadoPct: acordado,
        itens: medida(dele.length, totalItens, acordado),
        tempo: medida(
          du(
            ctx,
            dele.reduce((s, m) => s + (m.cicloHU ?? 0), 0),
          ),
          du(ctx, totalHoras),
          acordado,
        ),
      }
    }),
  }
}
