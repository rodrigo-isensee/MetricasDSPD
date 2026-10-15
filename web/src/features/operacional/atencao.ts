import type { ResultadoDe } from '@metricas-dspd/contratos'
import type { ItemAtencao } from '@/components/ui'
import { fmtInteiro, fmtPct, plural } from '@/lib/formatar'

/**
 * Regras dos itens de "Pede atenção" (Diária, Semanal e Sustentação) e do Resumo. Funções puras sobre os DTOs que os
 * cartões já carregam: nada é recalculado aqui, e as visões e o Resumo usam as mesmas regras (nunca divergem).
 */
type Ou<T> = T | undefined

/** Itens de "Pede atenção hoje": acima do P95 (O2), bloqueados e WIP acima do limite (O1). */
export function itensDiaria(
  o2: Ou<ResultadoDe<'O2'>>,
  bloqueados: Ou<ResultadoDe<'BLOQUEADOS'>>,
  o1: Ou<ResultadoDe<'O1'>>,
): ItemAtencao[] {
  const itens: ItemAtencao[] = []
  if (o2 && o2.acimaP95 > 0)
    itens.push({
      id: 'o2',
      codigo: 'O2',
      para: '#o2',
      texto: `${fmtInteiro(o2.acimaP95)} ${plural(o2.acimaP95, 'item acima', 'itens acima')} do P95`,
    })
  if (bloqueados && bloqueados.itens.length > 0)
    itens.push({
      id: 'bloqueados',
      codigo: 'BLOQUEADOS',
      para: '#bloqueados',
      texto: `${fmtInteiro(bloqueados.itens.length)} ${plural(bloqueados.itens.length, 'bloqueado', 'bloqueados')}`,
    })
  if (o1 && o1.hoje.acimaDoLimite > 0)
    itens.push({
      id: 'o1',
      codigo: 'O1',
      para: '#o1',
      texto: `WIP ${fmtInteiro(o1.hoje.acimaDoLimite)} acima do limite`,
    })
  return itens
}

/** Itens de "Pede atenção na semana": P85 que subiu (O3), backlog parado há mais de 180 dias (O10) e vencidos por causa interna (O12). */
export function itensSemanal(
  o3: Ou<ResultadoDe<'O3'>>,
  o10: Ou<ResultadoDe<'O10'>>,
  o12: Ou<ResultadoDe<'O12'>>,
): ItemAtencao[] {
  const itens: ItemAtencao[] = []
  // A decisão "subiu" vem do DTO (variação publicada só com 20 itens ou mais nas duas janelas).
  const subiu = (o3?.classes ?? []).filter(
    (c) => c.variacaoP85.status === 'ok' && (c.variacaoP85.variacaoPct ?? 0) > 0,
  )
  if (subiu.length > 0)
    itens.push({
      id: 'o3',
      codigo: 'O3',
      para: '#o3',
      texto: `P85 do tempo de ciclo subiu: ${subiu
        .map((c) => `${c.tipo} (+${fmtPct(c.variacaoP85.variacaoPct as number, 0)})`)
        .join(', ')}`,
    })
  if (o10 && o10.acimaDe180.time > 0)
    itens.push({
      id: 'o10',
      codigo: 'O10',
      para: '#o10',
      texto: `${fmtInteiro(o10.acimaDe180.time)} ${plural(o10.acimaDe180.time, 'item do backlog com', 'itens do backlog com')} mais de 180 dias`,
    })
  if (o12 && o12.vencidosCausaInterna > 0)
    itens.push({
      id: 'o12',
      codigo: 'O12',
      para: '#o12',
      texto: `${fmtInteiro(o12.vencidosCausaInterna)} ${plural(o12.vencidosCausaInterna, 'vencido', 'vencidos')} por causa interna`,
    })
  return itens
}

type PrioridadesS2 = ResultadoDe<'S2'>['prioridades']
type PrioridadesS1 = ResultadoDe<'S1'>['prioridades']

/** Prioridades com aderência ao SLA fora da meta (primeiro atendimento ou restauração): a regra do "Pede atenção" do S2. */
export const contarForaS2 = (prioridades: PrioridadesS2 | undefined): number =>
  prioridades?.filter(
    (p) => p.primeiroAtendimento.statusMeta === 'fora' || p.restauracao.statusMeta === 'fora',
  ).length ?? 0

/** Prioridades com aderência publicada (20 chamados ou mais na janela): o `m` de "k de m avaliadas". */
export const contarAvaliadasS2 = (prioridades: PrioridadesS2 | undefined): number =>
  prioridades?.filter(
    (p) => p.primeiroAtendimento.taxa.status === 'ok' || p.restauracao.taxa.status === 'ok',
  ).length ?? 0

/** Prioridades com mediana de restauração acima do alvo: a regra do "Pede atenção" do S1. */
export const contarForaS1 = (prioridades: PrioridadesS1 | undefined): number =>
  prioridades?.filter((p) => p.restauracao.statusMeta === 'fora').length ?? 0

/** Prioridades com mediana de restauração publicada (20 chamados ou mais). */
export const contarAvaliadasS1 = (prioridades: PrioridadesS1 | undefined): number =>
  prioridades?.filter((p) => p.restauracao.estatistica.status === 'ok').length ?? 0

const prioridades = (n: number) => plural(n, 'prioridade', 'prioridades')

/** Itens de "Pede atenção" da Sustentação: aderência ao SLA abaixo de 90% (S2) e mediana acima do alvo (S1). */
export function itensSustentacao(
  s2: Ou<ResultadoDe<'S2'>>,
  s1: Ou<ResultadoDe<'S1'>>,
): ItemAtencao[] {
  const itens: ItemAtencao[] = []
  const fora2 = contarForaS2(s2?.prioridades)
  if (fora2)
    itens.push({
      id: 's2',
      texto: `Aderência ao SLA abaixo de 90% em ${fora2} ${prioridades(fora2)}`,
      para: '#s2',
    })
  const fora1 = contarForaS1(s1?.prioridades)
  if (fora1)
    itens.push({
      id: 's1',
      texto: `Mediana acima do alvo em ${fora1} ${prioridades(fora1)}`,
      para: '#s1',
    })
  return itens
}
