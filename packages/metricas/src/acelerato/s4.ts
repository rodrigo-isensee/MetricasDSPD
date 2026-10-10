import type { ResultadoS4 } from '@metricas-dspd/contratos'
import { NIVEIS_RESOLUCAO } from '@metricas-dspd/contratos'
import type { FiltrosSustentacao } from '@metricas-dspd/contratos'
import { percentisDe, estatistica, pctOuNulo } from '../core/estatistica'
import { amostraAC } from './amostra'
import {
  baseAmostral,
  criterios,
  janelaPercentis,
  noIntervalo,
  periodoDe,
  r2,
  selecionarAC,
} from './comum'
import { prioridadesAlvo } from './s1'
import type { ContextoAC } from './indice'

const ETAPA_DO_NIVEL = {
  N1: 'Em atendimento N1',
  N2: 'Em atendimento N2',
  N3: 'Em atendimento N3',
} as const

/**
 * S4: onde o chamado foi resolvido, por prioridade e, dentro dela, por nível (nunca agregado: matriz,
 * Q2 e briefing T5.3). O nível vem da etapa de atendimento (fonte da verdade), não da equipe.
 * Percentual e tempo somem com menos de 20 chamados na célula (prioridade x nível) ou na prioridade.
 */
export function calcularS4(ctx: ContextoAC, f: FiltrosSustentacao): ResultadoS4 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f)
  const todos = selecionarAC(ctx, f)
  const fechados = todos.filter((x) => x.fechado && noIntervalo(ctx, x.c.data_finalizado, periodo))
  return {
    base: baseAmostral(fechados.length, 'chamados fechados', periodo),
    criterios: criterios('S4', periodo, janela, ctx),
    prioridades: prioridadesAlvo(f).map((prioridade) => {
      const daPrioridade = fechados.filter((x) => x.c.prioridade === prioridade)
      return {
        prioridade,
        n: daPrioridade.length,
        niveis: NIVEIS_RESOLUCAO.map((nivel) => {
          const dele = daPrioridade.filter((x) => x.c.nivel_resolucao === nivel)
          const pct = pctOuNulo(dele.length, daPrioridade.length)
          let tempoEtapa = null
          if (nivel !== 'Fornecedor') {
            const naJanela = todos.filter(
              (x) =>
                x.fechado &&
                x.c.prioridade === prioridade &&
                x.c.nivel_resolucao === nivel &&
                noIntervalo(ctx, x.c.data_finalizado, janela),
            )
            const vals = naJanela.map((x) => x.porEtapa.get(ETAPA_DO_NIVEL[nivel]) ?? 0)
            tempoEtapa = estatistica(vals.length, janela, () => {
              const p = percentisDe(amostraAC(prioridade, vals, janela))
              return { p50: r2(p.p50), p85: r2(p.p85), p95: r2(p.p95) }
            })
          }
          return { nivel, n: dele.length, pct: pct === null ? null : r2(pct), tempoEtapa }
        }),
      }
    }),
  }
}
