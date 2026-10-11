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
import { EXTENSAO_AC_VAZIA, type ExtensaoAC } from './extensao'
import type { ContextoAC } from './indice'

/** Recorrente = pelo menos K chamados do mesmo sistema e sintoma na janela (K provisório, pendente-usuario). */
export const K_RECORRENTE = 5
const TOP_RECORRENTES = 10

/** S12: volume por sistema (categoria), recorrentes destacados e % com exceção de SLA por registro posterior. */
export function calcularS12(
  ctx: ContextoAC,
  f: FiltrosSustentacao,
  ext: ExtensaoAC = EXTENSAO_AC_VAZIA,
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
  const pares = new Map<string, { sistema: string; sintoma: string; n: number }>()
  for (const x of naJanela) {
    const sintoma = ext.sintomas[x.c.chamado_id] ?? 'Não informado'
    const k = `${x.c.categoria_sistema}|${sintoma}`
    const p = pares.get(k)
    if (p) p.n++
    else pares.set(k, { sistema: x.c.categoria_sistema, sintoma, n: 1 })
  }
  const fechados = xs.filter((x) => x.fechado && noIntervalo(ctx, x.c.data_finalizado, periodo))
  return {
    base: baseAmostral(
      linhas.reduce((t, l) => t + l.total, 0),
      'chamados abertos',
      periodo,
    ),
    criterios: criterios('S12', periodo, janela, ctx),
    parametros: { kRecorrente: K_RECORRENTE, janelaSemanas: janela.quantidade },
    meses: linhas,
    recorrentes: ordenarNeutro(
      [...pares.values()].filter((p) => p.n >= K_RECORRENTE),
      (p) => [-p.n, p.sistema, p.sintoma],
    ).slice(0, TOP_RECORRENTES),
    excecaoSla: taxa(
      fechados.filter((x) => x.c.excecao_sla_registro_posterior).length,
      fechados.length,
    ),
  }
}
