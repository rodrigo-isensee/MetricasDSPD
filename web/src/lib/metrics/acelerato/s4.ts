import type { ResultadoS4 } from '@/contracts/metricas'
import { NIVEIS_RESOLUCAO } from '@/contracts/comum'
import type { FiltrosSustentacao } from '@/contracts/filtros'
import { calcularPercentis, estatistica, pctOuNulo } from '../core/estatistica'
import {
  baseAmostral,
  criterios,
  janelaPercentis,
  noIntervalo,
  periodoDe,
  r2,
  selecionarAC,
} from './comum'
import type { ContextoAC } from './indice'

const ETAPA_DO_NIVEL = {
  N1: 'Em atendimento N1',
  N2: 'Em atendimento N2',
  N3: 'Em atendimento N3',
} as const

/** S4: onde o chamado foi resolvido. O nível vem da etapa de atendimento (fonte da verdade), não da equipe. */
export function calcularS4(ctx: ContextoAC, f: FiltrosSustentacao): ResultadoS4 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f)
  const fechados = selecionarAC(ctx, f).filter(
    (x) => x.fechado && noIntervalo(ctx, x.c.data_finalizado, periodo),
  )
  return {
    base: baseAmostral(fechados.length, 'chamados fechados', periodo),
    criterios: criterios('S4', periodo, janela, ctx),
    niveis: NIVEIS_RESOLUCAO.map((nivel) => {
      const dele = fechados.filter((x) => x.c.nivel_resolucao === nivel)
      const pct = pctOuNulo(dele.length, fechados.length)
      let tempoEtapa = null
      if (nivel !== 'Fornecedor') {
        const naJanela = selecionarAC(ctx, f).filter(
          (x) =>
            x.fechado &&
            x.c.nivel_resolucao === nivel &&
            noIntervalo(ctx, x.c.data_finalizado, janela),
        )
        const vals = naJanela.map((x) => x.porEtapa.get(ETAPA_DO_NIVEL[nivel]) ?? 0)
        tempoEtapa = estatistica(vals.length, janela, () => {
          const p = calcularPercentis(vals)
          return { p50: r2(p.p50), p85: r2(p.p85), p95: r2(p.p95) }
        })
      }
      return { nivel, n: dele.length, pct: pct === null ? null : r2(pct), tempoEtapa }
    }),
  }
}
