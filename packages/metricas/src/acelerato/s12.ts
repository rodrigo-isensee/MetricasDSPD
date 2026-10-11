import type { ResultadoS12, FiltrosSustentacao } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal } from '../core/calendario'
import { taxa } from '../core/estatistica'
import { mesesEntre } from '../core/series'
import { ordenarNeutro } from '../core/ordenar'
import {
  baseAmostral,
  criterios,
  janelaPercentis,
  noIntervalo,
  periodoDe,
  selecionarAC,
} from './comum'
import type { ExtensaoAC } from './extensao'
import type { ContextoAC } from './indice'

/**
 * S12: volume por sistema (categoria); na janela de 12 semanas, contagem e proporção de chamados
 * reincidentes por sistema (campo `reincidente` preenchido já conta, sem limite K nem sintoma);
 * e % com exceção de SLA por registro posterior. A proporção usa só chamados com o campo informado;
 * `cobertura` expõe "n de N". Sem extensão, só a reincidência fica sem fonte: volume e exceção de SLA seguem reais.
 */
export function calcularS12(
  ctx: ContextoAC,
  f: FiltrosSustentacao,
  ext?: ExtensaoAC,
): ResultadoS12 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f)
  const xs = selecionarAC(ctx, f)
  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
  const linhas = meses.map((b) => {
    const doMes = xs.filter((x) => {
      const d = diaLocal(x.c.aberto_em, ctx.cal)
      return d >= b.inicioDia && d <= b.fimDia
    })
    const sistemas = [...new Set(doMes.map((x) => x.c.categoria_sistema))].map((sistema) => ({
      sistema,
      n: doMes.filter((x) => x.c.categoria_sistema === sistema).length,
    }))
    return {
      mes: b.chave,
      emAndamento: b.emAndamento,
      total: doMes.length,
      porSistema: ordenarNeutro(sistemas, (s) => [-s.n, s.sistema]),
    }
  })
  const naJanela = xs.filter((x) => noIntervalo(ctx, x.c.aberto_em, janela))
  const ausente = ext?.reincidenteAusente ?? {}
  const porSistema = new Map<
    string,
    { chamados: number; informados: number; reincidentes: number }
  >()
  let informadosTotal = 0
  for (const x of naJanela) {
    const p = porSistema.get(x.c.categoria_sistema) ?? {
      chamados: 0,
      informados: 0,
      reincidentes: 0,
    }
    p.chamados++
    // Ausente nunca vira "não reincidente" (decisão 13): fica fora do denominador e entra na cobertura.
    if (ext !== undefined && ausente[x.c.chamado_id] !== true) {
      p.informados++
      informadosTotal++
      if (ext.reabertoDe[x.c.chamado_id] !== undefined) p.reincidentes++
    }
    porSistema.set(x.c.categoria_sistema, p)
  }
  const fechados = xs.filter((x) => x.fechado && noIntervalo(ctx, x.c.data_finalizado, periodo))
  return {
    base: baseAmostral(
      linhas.reduce((t, l) => t + l.total, 0),
      'chamados abertos',
      periodo,
    ),
    criterios: criterios('S12', periodo, janela, ctx),
    campoDisponivel: ext !== undefined,
    cobertura: { n: informadosTotal, total: naJanela.length },
    parametros: { janelaSemanas: janela.quantidade },
    meses: linhas,
    reincidencia: ordenarNeutro(
      [...porSistema].map(([sistema, p]) => ({
        sistema,
        ...p,
        proporcao: ext === undefined ? taxa(0, 0) : taxa(p.reincidentes, p.informados),
      })),
      (p) => [-p.chamados, p.sistema],
    ),
    excecaoSla: taxa(
      fechados.filter((x) => x.c.excecao_sla_registro_posterior).length,
      fechados.length,
    ),
  }
}
