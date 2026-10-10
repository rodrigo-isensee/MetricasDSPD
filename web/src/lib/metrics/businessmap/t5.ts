import type { ResultadoT5 } from '@/contracts/metricas'
import { ORIGENS_DEMANDA, type Intervalo, type OrigemDemanda } from '@/contracts/comum'
import type { FiltrosFluxo } from '@/contracts/filtros'
import { diaDeIso, diaLocal } from '../core/calendario'
import { estatistica, publicavel } from '../core/estatistica'
import { somarMeses, isoDeDia } from '../core/calendario'
import { slug } from '../slug'
import { baseAmostral, criterios, ehDemanda, periodoDe, r2, selecionar } from './comum'
import type { ContextoBM, MarcosCard } from './indice'

function grupos(xs: readonly MarcosCard[], chave: (m: MarcosCard) => string, janela: Intervalo) {
  const nomes = [...new Set(xs.map(chave))].sort()
  return nomes
    .map((nome) => {
      const g = xs.filter((m) => chave(m) === nome)
      const falhas = g.filter((m) => m.card.origem_demanda !== null)
      const est = estatistica(g.length, janela, () => {
        const cont = new Map<OrigemDemanda, number>()
        for (const m of falhas)
          if (m.card.origem_demanda)
            cont.set(m.card.origem_demanda, (cont.get(m.card.origem_demanda) ?? 0) + 1)
        const origens = [
          {
            origem: 'Demanda de valor' as const,
            n: g.length - falhas.length,
            pct: r2(((g.length - falhas.length) / g.length) * 100),
          },
          ...ORIGENS_DEMANDA.map((o) => ({
            origem: o,
            n: cont.get(o) ?? 0,
            pct: r2(((cont.get(o) ?? 0) / g.length) * 100),
          })),
        ]
        const maior = [...ORIGENS_DEMANDA].sort(
          (a, b) => (cont.get(b) ?? 0) - (cont.get(a) ?? 0),
        )[0]
        return {
          pctFalha: r2((falhas.length / g.length) * 100),
          origens,
          origemMaior: falhas.length > 0 && maior ? maior : null,
        }
      })
      return { id: slug(nome), nome, n: g.length, estatistica: est }
    })
    .sort(ordemNeutra)
}

/** Ordem neutra (spec L10): por volume decrescente, desempate alfabético. Nunca pela parcela de falha. */
const ordemNeutra = (a: { n: number; nome: string }, b: { n: number; nome: string }): number =>
  b.n - a.n || a.nome.localeCompare(b.nome, 'pt-BR')

/** T5: demanda de falha por sistema e por área. Mostra sistemas e áreas, nunca pessoas ou equipes. */
export function calcularT5(ctx: ContextoBM, f: FiltrosFluxo): ResultadoT5 {
  const periodo = periodoDe(ctx, f)
  const todos = selecionar(ctx, f, 'story', { semSistema: true }).filter(ehDemanda)
  const noPeriodo = (j: Intervalo) =>
    todos.filter((m) => {
      const d = diaLocal(m.entrada, ctx.cal)
      return d >= diaDeIso(j.inicio) && d <= diaDeIso(j.fim)
    })
  const atual = noPeriodo(periodo)
  const porSistema = grupos(atual, (m) => m.card.sistema, periodo)
  const porArea = grupos(atual, (m) => m.card.area_solicitante, periodo)

  const anteriorJ: Intervalo = {
    inicio: isoDeDia(somarMeses(diaDeIso(periodo.inicio), -6)),
    fim: isoDeDia(somarMeses(diaDeIso(periodo.fim), -6)),
  }
  const ant = noPeriodo(anteriorJ)
  // Seleção separada da ordem de exibição: os 2 sistemas com maior parcela de falha, só para a variação.
  const pctDe = (g: (typeof porSistema)[number]): number =>
    g.estatistica.status === 'ok' ? g.estatistica.valor.pctFalha : -1
  const piores = porSistema
    .filter((g) => g.estatistica.status === 'ok')
    .sort((a, b) => pctDe(b) - pctDe(a) || ordemNeutra(a, b))
    .slice(0, 2)
  const variacaoSemestre = piores.map((g) => {
    const doAnt = ant.filter((m) => m.card.sistema === g.nome)
    const atualPct = g.estatistica.status === 'ok' ? g.estatistica.valor.pctFalha : null
    const anteriorPct = publicavel(doAnt.length)
      ? r2((doAnt.filter((m) => m.card.origem_demanda !== null).length / doAnt.length) * 100)
      : null
    const ok = atualPct !== null && anteriorPct !== null && anteriorPct !== 0
    return {
      sistema: g.nome,
      atualPct,
      anteriorPct,
      variacaoPct: ok ? r2(((atualPct - anteriorPct) / anteriorPct) * 100) : null,
    }
  })
  return {
    base: baseAmostral(atual.length, 'demandas', periodo),
    criterios: criterios('T5', periodo, periodo, ctx),
    porSistema,
    porArea,
    variacaoSemestre,
  }
}
