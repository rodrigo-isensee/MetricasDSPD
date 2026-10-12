import { MINIMOS_PESQUISA, type ResultadoPV1 } from '@metricas-dspd/contratos'
import { isoDeDia, ultimoDiaDoMes } from '../core/calendario'
import { criteriosDe } from '../core/criterios'
import { taxa } from '../core/estatistica'
import {
  agruparAreas,
  blocoConsolidado,
  concordam,
  somarGrupos,
  type Faixas,
  type Grupo,
} from './anonimato'
import type { CargaPesquisa, ContextoPesquisa, VersaoQuestionario } from './modelo'

/**
 * PV1 (percepção de valor): pesquisa trimestral com os gestores das áreas atendidas. Fonte própria,
 * sem tempo nem percentil; nada aqui lê BusinessMap ou Acelerato. Sem pesquisa carregada até a data de
 * corte, o resultado é `sem-pesquisa` (nunca erro).
 */

const TENDENCIA_MAX = 4

const cmp = (a: string, b: string) => a.localeCompare(b, 'pt-BR')

/** Trimestre vigente = a carga de maior id recebida até o corte; uma por trimestre, em ordem cronológica. */
function vigentes(cargas: readonly CargaPesquisa[], hojeIso: string): CargaPesquisa[] {
  const porTrimestre = new Map<string, CargaPesquisa>()
  for (const c of cargas) {
    if (c.recebidaEm > hojeIso) continue
    const atual = porTrimestre.get(c.trimestre)
    if (!atual || c.cargaId > atual.cargaId) porTrimestre.set(c.trimestre, c)
  }
  return [...porTrimestre.values()].sort((a, b) => cmp(a.trimestre, b.trimestre))
}

function versaoDe(versoes: readonly VersaoQuestionario[], id: string): VersaoQuestionario {
  const v = versoes.find((x) => x.id === id)
  if (!v) throw new Error(`Versão de questionário inexistente: ${id}`)
  return v
}

/** Contagens por área da carga. `n` = respondentes da área (a maior soma de faixas entre as perguntas). */
function gruposPorArea(
  carga: CargaPesquisa,
  codigos: readonly string[],
  rotuloDe: (codigo: string) => string,
): { grupos: Grupo[]; convidados: number } {
  const porArea = new Map<string, Map<string, [number, number, number, number, number]>>()
  const conv = new Map<string, number>()
  for (const l of carga.linhas) {
    if (!codigos.includes(l.pergunta)) continue
    const perguntas =
      porArea.get(l.area) ?? new Map<string, [number, number, number, number, number]>()
    porArea.set(l.area, perguntas)
    perguntas.set(l.pergunta, [l.f1, l.f2, l.f3, l.f4, l.f5])
    conv.set(l.area, Math.max(conv.get(l.area) ?? 0, l.convidados))
  }
  const grupos: Grupo[] = []
  for (const [area, perguntas] of porArea) {
    const contagens: Record<string, Faixas> = {}
    let n = 0
    for (const [codigo, f] of perguntas) {
      contagens[codigo] = f
      n = Math.max(
        n,
        f.reduce((s, x) => s + x, 0),
      )
    }
    grupos.push({ rotulo: rotuloDe(area), n, contagens })
  }
  // Ordem de entrada nunca altera o resultado.
  grupos.sort((a, b) => cmp(a.rotulo, b.rotulo))
  return { grupos, convidados: [...conv.values()].reduce((s, x) => s + x, 0) }
}

function inicioDoTrimestre(tri: string): string {
  const [ano, t] = tri.split('-T') as [string, string]
  return `${ano}-${String((Number(t) - 1) * 3 + 1).padStart(2, '0')}-01`
}
function fimDoTrimestre(tri: string): string {
  const [ano, t] = tri.split('-T') as [string, string]
  return isoDeDia(ultimoDiaDoMes(`${ano}-${String(Number(t) * 3).padStart(2, '0')}`))
}

export function calcularPV1(ctx?: ContextoPesquisa): ResultadoPV1 {
  if (!ctx) return { status: 'sem-pesquisa', fonte: 'pesquisa' }
  const { base, hojeIso } = ctx
  const lista = vigentes(base.cargas, hojeIso)
  const atual = lista[lista.length - 1]
  if (!atual) return { status: 'sem-pesquisa', fonte: 'pesquisa' }

  const rotuloDe = (codigo: string) => base.areas.find((a) => a.codigo === codigo)?.rotulo ?? codigo
  const ordenadas = (v: VersaoQuestionario) => [...v.perguntas].sort((a, b) => a.ordem - b.ordem)
  const versao = versaoDe(base.versoes, atual.versaoId)
  const codigos = ordenadas(versao).map((p) => p.codigo)

  const { grupos, convidados } = gruposPorArea(atual, codigos, rotuloDe)
  const total = somarGrupos('Consolidado', grupos, codigos)
  const ciclo = lista.length

  const pontos = lista.slice(-TENDENCIA_MAX)
  const tendencia = pontos.map((c) => {
    const v = versaoDe(base.versoes, c.versaoId)
    const cods = ordenadas(v).map((p) => p.codigo)
    const g = somarGrupos('Consolidado', gruposPorArea(c, cods, rotuloDe).grupos, cods)
    const bloco =
      g.n < MINIMOS_PESQUISA.consolidado
        ? ({ status: 'base-insuficiente', n: g.n, minimo: MINIMOS_PESQUISA.consolidado } as const)
        : ({ status: 'publicado', n: g.n, concordam: concordam(g, cods) } as const)
    return { trimestre: c.trimestre, versaoId: c.versaoId, bloco }
  })

  const primeiro = pontos[0] as CargaPesquisa
  const criterios = criteriosDe(
    'PV1',
    { inicio: inicioDoTrimestre(primeiro.trimestre), fim: fimDoTrimestre(atual.trimestre) },
    { inicio: inicioDoTrimestre(atual.trimestre), fim: fimDoTrimestre(atual.trimestre) },
    base.criterios,
  )

  return {
    status: 'ok',
    fonte: 'pesquisa',
    trimestre: atual.trimestre,
    ciclo,
    questionario: {
      versaoId: versao.id,
      vigenteDesde: versao.vigenteDesde,
      perguntas: ordenadas(versao),
    },
    participacao: {
      respondentes: total.n,
      convidados,
      taxa: taxa(total.n, convidados),
    },
    consolidado: blocoConsolidado(total, codigos),
    porArea: agruparAreas(grupos, ciclo, codigos),
    tendencia,
    oQueMudou:
      atual.oQueMudou === null ? null : { trimestre: atual.trimestre, texto: atual.oQueMudou },
    criterios,
    base: { n: total.n, unidade: 'respostas', janela: null },
  }
}
