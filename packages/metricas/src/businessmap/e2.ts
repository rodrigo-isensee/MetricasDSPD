import type { ResultadoE2 } from '@metricas-dspd/contratos'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal } from '../core/calendario'
import { pctOuNulo, taxa } from '../core/estatistica'
import { trimestresEntre } from '../core/series'
import { baseAmostral, criterios, ehDemanda, periodoDe, selecionar } from './comum'
import type { ContextoBM, MarcosCard } from './indice'

type Tipo = 'objetivo' | 'obrigacao-legal' | 'manutencao' | 'fora-de-objetivo'
const META_VINCULADA = 60

/** Evolução (briefing 4.3, decisão Q5): Melhoria, Iniciativa e Dívida técnica. */
const EVOLUCAO: ReadonlySet<string> = new Set(['Melhoria', 'Iniciativa', 'Dívida técnica'])

/** Categoria de um item entregue: objetivo do projeto de origem; sem projeto = Manutenção ou Fora de objetivo. */
function categoria(ctx: ContextoBM, m: MarcosCard): { nome: string; tipo: Tipo } {
  if (m.projetoId !== null) {
    const obj = ctx.idx.porId.get(m.projetoId)?.objetivo_estrategico ?? null
    if (obj === null) return { nome: 'Fora de objetivo', tipo: 'fora-de-objetivo' }
    if (obj === 'Obrigação legal') return { nome: 'Obrigação legal', tipo: 'obrigacao-legal' }
    return { nome: obj, tipo: 'objetivo' }
  }
  return EVOLUCAO.has(m.card.tipo)
    ? { nome: 'Fora de objetivo', tipo: 'fora-de-objetivo' }
    : { nome: 'Manutenção', tipo: 'manutencao' }
}

/** E2: capacidade entregue por objetivo estratégico, por trimestre. */
export function calcularE2(ctx: ContextoBM, f: FiltrosFluxo): ResultadoE2 {
  const periodo = periodoDe(ctx, f)
  const itens = selecionar(ctx, f, 'story', { semEquipe: true, semTipo: true })
    .filter(ehDemanda)
    .filter((m) => m.entrega !== null)
    .map((m) => ({ m, dia: diaLocal(m.entrega ?? 0, ctx.cal), cat: categoria(ctx, m) }))
  const objetivos = ctx.idx.base.config.objetivos
  const ordem: { nome: string; tipo: Tipo }[] = [
    ...objetivos.map((nome) => ({ nome, tipo: 'objetivo' as const })),
    { nome: 'Obrigação legal', tipo: 'obrigacao-legal' },
    { nome: 'Manutenção', tipo: 'manutencao' },
    { nome: 'Fora de objetivo', tipo: 'fora-de-objetivo' },
  ]
  const vinc = (xs: typeof itens) => {
    const evol = xs.filter(
      (x) =>
        EVOLUCAO.has(x.m.card.tipo) &&
        x.cat.tipo !== 'obrigacao-legal' &&
        x.cat.tipo !== 'manutencao',
    )
    return taxa(evol.filter((x) => x.cat.tipo === 'objetivo').length, evol.length)
  }
  const tris = trimestresEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
  const noPeriodo = itens.filter(
    (x) => x.dia >= diaDeIso(periodo.inicio) && x.dia <= diaDeIso(periodo.fim),
  )
  const global = vinc(noPeriodo)
  return {
    base: baseAmostral(noPeriodo.length, 'itens entregues', periodo),
    criterios: criterios('E2', periodo, periodo, ctx),
    trimestres: tris.map((t) => {
      const xs = itens.filter(
        (x) =>
          x.dia >= Math.max(t.inicioDia, diaDeIso(periodo.inicio)) &&
          x.dia <= Math.min(t.fimDia, diaDeIso(periodo.fim)),
      )
      return {
        trimestre: t.chave,
        emAndamento: t.emAndamento,
        n: xs.length,
        segmentos: ordem.map((o) => {
          const n = xs.filter((x) => x.cat.nome === o.nome).length
          return { categoria: o.nome, tipo: o.tipo, n, pct: pctOuNulo(n, xs.length) }
        }),
        evolucaoVinculada: vinc(xs),
      }
    }),
    evolucaoVinculada: global,
    statusMeta:
      global.status === 'ok'
        ? global.pct >= META_VINCULADA
          ? 'dentro'
          : 'fora'
        : 'sem-referencia',
  }
}
