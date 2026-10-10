import type { ResultadoO18 } from '@metricas-dspd/contratos'
import type { Estatistica } from '@metricas-dspd/contratos'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal, isoDeDia, MS_DIA, ultimoDiaDoMes } from '../core/calendario'
import { estatistica, taxa } from '../core/estatistica'
import { mesesEntre } from '../core/series'
import { baseAmostral, criterios, ehDemanda, periodoDe, r2, selecionar } from './comum'
import type { ContextoBM, MarcosCard } from './indice'
import { ehBug } from './o15'

/** Janela de atribuição de bug (4.2): bug vinculado até 30 dias após a entrega conta para o mês da entrega. */
export const JANELA_ATRIBUICAO_BUG_DIAS = 30

/** O18: entregas com e sem bug, densidade geral e entre os afetados. */
export function calcularO18(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO18 {
  const periodo = periodoDe(ctx, f)
  const j = { inicio: periodo.inicio, fim: periodo.fim }
  const entregues = selecionar(ctx, f, 'story', { semTipo: true })
    .filter(ehDemanda)
    .filter((m) => m.entrega !== null && m.card.tipo !== 'Defeito em produção')
  const bugs = ctx.idx.marcos.filter(ehBug)
  const bugsPorOrigem = new Map<string, MarcosCard[]>()
  for (const b of bugs) {
    const o = b.card.origem_bug
    if (!o) continue
    const lista = bugsPorOrigem.get(o)
    if (lista) lista.push(b)
    else bugsPorOrigem.set(o, [b])
  }
  const vinculados = (m: MarcosCard): number => {
    const lim = (m.entrega as number) + JANELA_ATRIBUICAO_BUG_DIAS * MS_DIA
    return (bugsPorOrigem.get(m.card.card_id) ?? []).filter((b) => b.card.criado_em <= lim).length
  }
  const dens = (n: number, bugsN: number): Estatistica<number> =>
    estatistica(n, j, () => r2(bugsN / Math.max(n, 1)))

  const linhaDe = (xs: readonly MarcosCard[]) => {
    const por = xs.map(vinculados)
    const comBug = por.filter((n) => n > 0).length
    const nb = por.reduce((s, n) => s + n, 0)
    return { entregues: xs.length, comBug, semBug: xs.length - comBug, bugs: nb }
  }
  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
  const linhas = meses.map((b) => {
    const xs = entregues.filter((m) => {
      const d = diaLocal(m.entrega as number, ctx.cal)
      return d >= b.inicioDia && d <= b.fimDia
    })
    const l = linhaDe(xs)
    const fechaEm = ultimoDiaDoMes(b.chave) + JANELA_ATRIBUICAO_BUG_DIAS
    return {
      mes: b.chave,
      emAndamento: b.emAndamento,
      emApuracaoAte: fechaEm > ctx.hojeDia ? isoDeDia(fechaEm) : null,
      ...l,
      taxaLimpa: taxa(l.semBug, l.entregues),
      densidadeGeral: dens(l.entregues, l.bugs),
      densidadeAfetados: densAfetados(l.entregues, l.comBug, l.bugs, j),
    }
  })

  const doPeriodo = entregues.filter((m) => {
    const d = diaLocal(m.entrega as number, ctx.cal)
    return d >= diaDeIso(periodo.inicio) && d <= diaDeIso(periodo.fim)
  })
  const t = linhaDe(doPeriodo)
  return {
    base: baseAmostral(t.entregues, 'cards entregues', periodo, {
      n: t.bugs,
      unidade: 'bugs vinculados',
    }),
    criterios: criterios('O18', periodo, periodo, ctx),
    meses: linhas,
    totais: {
      entregues: t.entregues,
      comBug: t.comBug,
      bugs: t.bugs,
      taxaLimpa: taxa(t.semBug, t.entregues),
      densidadeGeral: dens(t.entregues, t.bugs),
      densidadeAfetados: densAfetados(t.entregues, t.comBug, t.bugs, j),
    },
  }
}

/** Densidade entre os afetados = bugs / cards com bug; sujeita ao mínimo de 20 cards entregues. */
function densAfetados(
  entregues: number,
  comBug: number,
  bugs: number,
  j: { inicio: string; fim: string },
): Estatistica<number> {
  return estatistica(entregues, j, () => r2(comBug === 0 ? 0 : bugs / comBug))
}
