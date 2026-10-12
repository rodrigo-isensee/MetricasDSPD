import type { ResultadoS10, FiltrosSustentacao } from '@metricas-dspd/contratos'
import { estatistica, percentisDe, taxa } from '../core/estatistica'
import { FAIXAS, histograma } from '../core/histograma'
import { amostraAC } from './amostra'
import {
  baseAmostral,
  criterios,
  janelaPercentis,
  noIntervalo,
  periodoDe,
  prioridadesAlvo,
  r2,
  selecionarAC,
} from './comum'
import type { ContextoAC } from './indice'

const ETAPA = 'Aguardando atribuição'
/** "% aceitos em até 15 min": 0,25 hora útil. */
const ACEITE_RAPIDO_HORAS = 0.25

/** S10: fila de atribuição (escalação até o aceite), horas úteis em `Aguardando atribuição`, por prioridade. */
export function calcularS10(ctx: ContextoAC, f: FiltrosSustentacao): ResultadoS10 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f)
  const xs = selecionarAC(ctx, f).filter((x) => {
    const es = x.etapas.filter((e) => e.etapa === ETAPA)
    const ultima = es[es.length - 1]
    return (
      ultima !== undefined &&
      es.every((e) => e.saida !== null) &&
      noIntervalo(ctx, ultima.saida, janela)
    )
  })
  const horasDe = (x: (typeof xs)[number]) => x.porEtapa.get(ETAPA) as number
  let total = 0
  const prioridades = prioridadesAlvo(f).map((prioridade) => {
    const doP = xs.filter((x) => x.c.prioridade === prioridade)
    total += doP.length
    const amostra = amostraAC(prioridade, doP.map(horasDe), janela)
    return {
      prioridade,
      n: doP.length,
      estatistica: estatistica(doP.length, janela, () => {
        const p = percentisDe(amostra)
        return { p50: r2(p.p50), p85: r2(p.p85), p95: r2(p.p95) }
      }),
      histograma: histograma(amostra, FAIXAS.atribuicao),
      aceitosEm15min: taxa(doP.filter((x) => horasDe(x) <= ACEITE_RAPIDO_HORAS).length, doP.length),
    }
  })
  return {
    base: baseAmostral(total, 'chamados com fila de atribuição', janela),
    criterios: criterios('S10', periodo, janela, ctx),
    janelaPercentis: janela,
    prioridades,
  }
}
