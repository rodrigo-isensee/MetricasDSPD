import type { FiltrosSustentacao, ResultadoO17 } from '@metricas-dspd/contratos'
import { CAUSAS_RAIZ } from '@metricas-dspd/contratos'
import { ordenarNeutro } from '../core/ordenar'
import { baseAmostral, criterios, noIntervalo, periodoDe, selecionarAC } from './comum'
import type { ExtensaoAC } from './extensao'
import type { ContextoAC } from './indice'

/**
 * O17 (Sustentação, fonte Acelerato): incidentes encerrados no período por causa raiz e por sistema
 * (categoria do chamado). O campo causa raiz vem do Metabase na coleta real; até lá é mock. Contagem,
 * sem mínimo. Sem extensão, a causa não é publicada (lista vazia), nunca "Não informada" inflado.
 */
export function calcularO17(
  ctx: ContextoAC,
  f: FiltrosSustentacao,
  ext?: ExtensaoAC,
): ResultadoO17 {
  const periodo = periodoDe(ctx, f)
  const defeitos = selecionarAC(ctx, f).filter(
    (x) =>
      x.fechado && x.c.natureza === 'incidente' && noIntervalo(ctx, x.c.data_finalizado, periodo),
  )
  const causa = (id: string) => ext?.causasRaiz[id] ?? 'Não informada'
  const sistemas = [...new Set(defeitos.map((x) => x.c.categoria_sistema))].map((sistema) => ({
    sistema,
    n: defeitos.filter((x) => x.c.categoria_sistema === sistema).length,
  }))
  return {
    base: baseAmostral(defeitos.length, 'incidentes encerrados', periodo),
    criterios: criterios('O17', periodo, periodo, ctx),
    campoDisponivel: ext !== undefined,
    porCausa:
      ext === undefined
        ? []
        : [...CAUSAS_RAIZ, 'Não informada' as const]
            .map((c) => ({
              causa: c,
              n: defeitos.filter((x) => causa(x.c.chamado_id) === c).length,
            }))
            .filter((x) => x.causa !== 'Não informada' || x.n > 0),
    porSistema: ordenarNeutro(sistemas, (s) => [-s.n, s.sistema]),
  }
}
