import {
  PRIORIDADES,
  type BaseAmostral,
  type Intervalo,
  type Janela,
  type MetricaId,
  type Prioridade,
} from '@metricas-dspd/contratos'
import type { FiltrosSustentacao } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal } from '../core/calendario'
import { criteriosDe } from '../core/criterios'
import { arredondar } from '../core/estatistica'
import { JANELA_POR_GRANULARIDADE, janelaMovel } from '../core/janela'
import { resolverPeriodo } from '../core/series'
import type { ChamadoCalc, ContextoAC } from './indice'

export const periodoDe = (ctx: ContextoAC, f: FiltrosSustentacao): Intervalo =>
  resolverPeriodo(f.periodo, ctx.hojeIso)
export const janelaPercentis = (ctx: ContextoAC, f: FiltrosSustentacao): Janela =>
  janelaMovel(periodoDe(ctx, f).fim, JANELA_POR_GRANULARIDADE.chamado)

/** Chamados da população DSPD-SSSC (não excluídos) que passam pelos filtros de equipe e prioridade. */
export function selecionarAC(
  ctx: ContextoAC,
  f: FiltrosSustentacao,
  o: { semPrioridade?: boolean } = {},
): ChamadoCalc[] {
  return ctx.idx.chamados.filter(
    (x) =>
      !x.c.excluido &&
      (f.equipe.length === 0 || f.equipe.includes(x.equipeId)) &&
      (o.semPrioridade ||
        f.prioridade.length === 0 ||
        (x.c.prioridade !== undefined && f.prioridade.includes(x.c.prioridade))),
  )
}

export const noIntervalo = (ctx: ContextoAC, ms: number | null, j: Intervalo): boolean => {
  if (ms === null) return false
  const d = diaLocal(ms, ctx.cal)
  return d >= diaDeIso(j.inicio) && d <= diaDeIso(j.fim)
}

export const baseAmostral = (
  n: number,
  unidade: string,
  janela: Intervalo | null,
  complemento?: { n: number; unidade: string },
): BaseAmostral => (complemento ? { n, unidade, janela, complemento } : { n, unidade, janela })

export const criterios = (id: MetricaId, serie: Intervalo, janela: Intervalo, ctx: ContextoAC) =>
  criteriosDe(id, serie, janela, ctx.criterios)

export const r2 = (v: number): number => arredondar(v)

export function prioridadesAlvo(f: FiltrosSustentacao): readonly Prioridade[] {
  return f.prioridade.length === 0
    ? PRIORIDADES
    : PRIORIDADES.filter((p) => f.prioridade.includes(p))
}
