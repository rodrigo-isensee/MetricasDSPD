import type {
  BaseAmostral,
  ClasseServico,
  Granularidade,
  Intervalo,
  Janela,
  MetricaId,
  TipoCard,
} from '@/contracts/comum'
import type { FiltrosFluxo } from '@/contracts/filtros'
import { diasUteis, diaDeIso, diaLocal } from '../core/calendario'
import { criteriosDe } from '../core/criterios'
import { JANELA_POR_GRANULARIDADE, janelaMovel } from '../core/janela'
import { resolverPeriodo } from '../core/series'
import type { ContextoBM, MarcosCard } from './indice'
import { ordenarNeutro } from '../core/ordenar'

export const GRAN_JANELA = {
  story: 'story',
  frente: 'frente',
  projeto: 'projeto',
} as const satisfies Record<Granularidade, Granularidade>

export const periodoDe = (ctx: ContextoBM, f: FiltrosFluxo): Intervalo =>
  resolverPeriodo(f.periodo, ctx.hojeIso)

/** Janela de percentis: termina no fim do período, com a largura da granularidade. */
export const janelaPercentis = (ctx: ContextoBM, f: FiltrosFluxo, g: Granularidade): Janela =>
  janelaMovel(periodoDe(ctx, f).fim, JANELA_POR_GRANULARIDADE[g])

export interface OpcoesSelecao {
  /** Ignora o filtro de tipo (métricas em que ele não atua). */
  semTipo?: boolean
  semEquipe?: boolean
  semSistema?: boolean
  incluirInativos?: boolean
}

/** Memória da seleção por contexto: vários cartões do mesmo painel pedem os mesmos filtros. */
const memoSelecao = new WeakMap<ContextoBM, Map<string, readonly MarcosCard[]>>()

/**
 * Cards de uma granularidade que passam pelos filtros e estão ativos (4.2). Memoizada por
 * (contexto, granularidade, filtros, opções): o resultado é compartilhado e não pode ser alterado.
 */
export function selecionar(
  ctx: ContextoBM,
  f: FiltrosFluxo,
  g: Granularidade,
  o: OpcoesSelecao = {},
): readonly MarcosCard[] {
  const eq = o.semEquipe ? [] : f.equipe
  const si = o.semSistema ? [] : f.sistema
  const ti = o.semTipo ? [] : f.tipo
  const chave = `${g}|${o.incluirInativos ? 1 : 0}|${ordenarNeutro(eq, (x) => [x]).join(',')}|${ordenarNeutro(si, (x) => [x]).join(',')}|${ordenarNeutro(ti, (x) => [x]).join(',')}`
  let memo = memoSelecao.get(ctx)
  if (!memo) {
    memo = new Map()
    memoSelecao.set(ctx, memo)
  }
  const pronto = memo.get(chave)
  if (pronto) return pronto
  const r = ctx.idx.marcos.filter(
    (m) =>
      m.card.granularidade === g &&
      (o.incluirInativos || m.ativo) &&
      (eq.length === 0 || eq.includes(m.slugEquipe)) &&
      (si.length === 0 || si.includes(m.slugSistema)) &&
      (ti.length === 0 || g !== 'story' || (ti as readonly TipoCard[]).includes(m.card.tipo)),
  )
  memo.set(chave, r)
  return r
}

/** Demanda entregável ao solicitante: story que não é bug interno (4.2). */
export const ehDemanda = (m: MarcosCard): boolean =>
  m.card.granularidade === 'story' && m.card.tipo !== 'Bug interno'

export const diaDe = (ctx: ContextoBM, ms: number): number => diaLocal(ms, ctx.cal)
export const dentro = (ctx: ContextoBM, ms: number | null, j: Intervalo): boolean => {
  if (ms === null) return false
  const d = diaLocal(ms, ctx.cal)
  return d >= diaDeIso(j.inicio) && d <= diaDeIso(j.fim)
}
export const du = (ctx: ContextoBM, horas: number): number => diasUteis(horas, ctx.cal)

export const baseAmostral = (
  n: number,
  unidade: string,
  janela: Intervalo | null,
  complemento?: { n: number; unidade: string },
): BaseAmostral => (complemento ? { n, unidade, janela, complemento } : { n, unidade, janela })

export const criterios = (id: MetricaId, serie: Intervalo, janela: Intervalo, ctx: ContextoBM) =>
  criteriosDe(id, serie, janela, ctx.criterios)

export const CLASSES_T: readonly ClasseServico[] = ['Urgente', 'Prazo fixo', 'Padrão', 'Intangível']
export const r2 = (v: number): number => Math.round(v * 100) / 100
