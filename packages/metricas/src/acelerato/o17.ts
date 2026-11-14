import type { FiltrosSustentacao, ResultadoO17 } from '@metricas-dspd/contratos'
import { CAUSAS_RAIZ, MOTIVO_O17_CAUSA_RAIZ_SEM_DADO_REAL } from '@metricas-dspd/contratos'
import { ordenarNeutro } from '../core/ordenar'
import { baseAmostral, criterios, noIntervalo, periodoDe, selecionarAC } from './comum'
import type { ExtensaoAC } from './extensao'
import type { ContextoAC } from './indice'

/**
 * O17 (Sustentação, fonte Acelerato): incidentes encerrados no período por causa raiz e por sistema
 * (`categoria_sistema`, dado real). Contagem, sem mínimo. Pedido 099 (B' da Q-099-7): a causa raiz é do Registro de
 * Problemas e a base não tem o vínculo ao incidente; sem extensão (base real), `porCausa` é nulo com o motivo em
 * `motivoCausaRaiz`, nunca lista vazia nem "Não informada" inflado, e a causa aparente não entra no lugar dela.
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
    motivoCausaRaiz: ext === undefined ? MOTIVO_O17_CAUSA_RAIZ_SEM_DADO_REAL : null,
    porCausa:
      ext === undefined
        ? null
        : [...CAUSAS_RAIZ, 'Não informada' as const]
            .map((c) => ({
              causa: c,
              n: defeitos.filter((x) => causa(x.c.chamado_id) === c).length,
            }))
            .filter((x) => x.causa !== 'Não informada' || x.n > 0),
    porSistema: ordenarNeutro(sistemas, (s) => [-s.n, s.sistema]),
  }
}
