/**
 * QA intensivo de FILTROS (docs/qa/intensivo-filtros.md, seção "Invariantes por métrica").
 * Propriedades sobre a biblioteca única + mock, com combinações de filtros sorteadas pelo fast-check
 * (semente fixa: a execução é reprodutível). Complementa `varredura.test.ts`, que usa recortes fixos.
 *
 * INV-F1  filtrar nunca aumenta a base: recorte mais estreito <= recorte mais largo <= sem filtro.
 * INV-F2  filtro que não se aplica à métrica (APLICABILIDADE_FLUXO) é ignorado: resultado idêntico.
 * INV-F3  BusinessMap x Acelerato: prioridade não altera fluxo; tipo/sistema não alteram sustentação.
 * INV-F4  abaixo de 20 itens nunca há percentil publicado (p50/p85/p95 com n < 20, ou status insuficiente).
 * INV-F5  nenhum dado individual (nome de pessoa, usuário, responsável) aparece em nenhum resultado.
 * INV-F6  a ordem dos valores na URL não altera o resultado (equipe=a,b == equipe=b,a).
 * INV-F7  consolidado de equipes: base(a+b) >= max(base(a), base(b)) e <= base(a) + base(b).
 *         Exceção única, do O20 (011-back, ratificada pelo QA com restrição): o limite superior (aditividade) não vale
 *         quando alguma das duas equipes está no estado vazio (`dias` vazio: sem transição no período, base 0 por
 *         ausência de dado, não por contagem). O limite inferior vale sempre, e o estado vazio tem teste próprio
 *         (INV-F7b). Motivo: a base do O20 é o pico diário, e o consolidado troca as faixas por papel.
 */
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import {
  APLICABILIDADE_FLUXO,
  EQUIPES_SUSTENTACAO_ID,
  METRICA_IDS,
  MINIMO_AMOSTRA,
  PRIORIDADES,
  TIPOS_FILTRO,
  fonteDaMetrica,
  type MetricaId,
  type Periodo,
} from '@metricas-dspd/contratos'
import { gerarBaseMock, gerarExtensoesMock, gerarPesquisaMock } from '@metricas-dspd/mock'
import { acelerato, businessmap, calcularMetrica, CALENDARIO_PADRAO, pesquisa } from '.'
import type { ContextosMetricas } from './calcular'

const SEMENTE_FC = 20261013
const RUNS = Number(process.env.INTENSIVO_RUNS ?? 25)

interface Cenario {
  nome: string
  ctx: ContextosMetricas
  equipes: string[]
  sistemas: string[]
  pessoas: Set<string>
}

const montar = (nome: string, cfg: Parameters<typeof gerarBaseMock>[0]): Cenario => {
  const b = gerarBaseMock(cfg)
  const ctx: ContextosMetricas = {
    bm: businessmap.criarContextoBM(b.bm, b.config.hoje, CALENDARIO_PADRAO),
    ac: acelerato.criarContextoAC(b.ac, b.config.hoje, CALENDARIO_PADRAO),
    ext: gerarExtensoesMock(b),
    pesq: pesquisa.criarContextoPesquisa(gerarPesquisaMock(b.config), b.config.hoje),
  }
  const pessoas = new Set<string>()
  for (const c of b.bm.cards) for (const r of c.responsaveis) pessoas.add(r)
  for (const t of b.bm.transicoes) pessoas.add(t.usuario)
  return {
    nome,
    ctx,
    equipes: [...new Set(ctx.bm.idx.marcos.map((m) => m.slugEquipe))].sort(),
    sistemas: [...new Set(ctx.bm.idx.marcos.map((m) => m.slugSistema))].sort(),
    pessoas,
  }
}

// Base padrão (a mesma do app, escala 1) e uma base pequena, para exercitar o regime de amostra < 20.
const CENARIOS: Cenario[] = [
  montar('base do app (escala padrão)', {}),
  montar('base pequena (escala 0,1, corte em maio)', {
    escala: 0.1,
    semente: 9,
    hoje: '2026-05-15T18:00:00-03:00',
  }),
]

const FLUXO = METRICA_IDS.filter((id) => fonteDaMetrica(id) === 'businessmap')
const SUST = METRICA_IDS.filter((id) => fonteDaMetrica(id) === 'acelerato')

const PERIODOS: Periodo[] = [
  { tipo: '4s' },
  { tipo: '12s' },
  { tipo: '6m' },
  { tipo: '12m' },
  { tipo: 'custom', de: '2026-03-02', ate: '2026-05-31' },
  { tipo: 'custom', de: '2026-09-01', ate: '2026-09-30' },
]

type FF = { equipe: string[]; tipo: string[]; sistema: string[]; periodo: Periodo }
type FS = { equipe: string[]; prioridade: string[]; periodo: Periodo }

const plano = (x: unknown): unknown => JSON.parse(JSON.stringify(x))
const calc = (id: MetricaId, f: unknown, ctx: ContextosMetricas): unknown =>
  plano(calcularMetrica(id, f as never, ctx))
const baseN = (r: unknown): number | null => {
  const b = (r as { base?: { n?: unknown } }).base
  return b && typeof b.n === 'number' ? b.n : null
}

const diasO20 = (r: unknown): number => ((r as { dias?: unknown[] }).dias ?? []).length

/** Subconjunto (pode ser vazio = "Todos"). */
const sub = <T>(xs: readonly T[]) => fc.subarray([...xs])
/** Subconjunto não vazio. */
const subNV = <T>(xs: readonly T[]) => fc.subarray([...xs], { minLength: 1 })

/** Estreita uma seleção: "Todos" vira qualquer subconjunto não vazio; uma lista vira um subconjunto não vazio dela. */
const estreitar = <T>(sel: readonly T[], universo: readonly T[]) =>
  sel.length === 0 ? subNV(universo) : subNV(sel)

const arbFluxo = (c: Cenario) =>
  fc.record({
    equipe: sub(c.equipes),
    tipo: sub(TIPOS_FILTRO),
    sistema: sub(c.sistemas),
    periodo: fc.constantFrom(...PERIODOS),
  }) as fc.Arbitrary<FF>

const arbSust = fc.record({
  equipe: sub(EQUIPES_SUSTENTACAO_ID),
  prioridade: sub(PRIORIDADES),
  periodo: fc.constantFrom(...PERIODOS),
}) as fc.Arbitrary<FS>

const opcoesFc = (n = RUNS) => ({ seed: SEMENTE_FC, numRuns: n, endOnFailure: true })

// ---------------------------------------------------------------------------------------------
// Varreduras genéricas do resultado (INV-F4 e INV-F5)
// ---------------------------------------------------------------------------------------------

const CHAVES_PERCENTIL = ['p50', 'p85', 'p95'] as const
const CHAVES_PESSOA =
  /^(responsave(l|is)|usuario|usuarioKey|pessoa|pessoas|email|autor|assignee|agente|nome_pessoa)$/i

/** Caminhos que violam a regra dos 20: objeto com `n` < 20 e percentil numérico, ou `status: insuficiente` com percentil. */
function violacoesMinimo(x: unknown, caminho = '$', out: string[] = []): string[] {
  if (Array.isArray(x)) x.forEach((v, i) => violacoesMinimo(v, `${caminho}[${i}]`, out))
  else if (x && typeof x === 'object') {
    const o = x as Record<string, unknown>
    const temPercentil = CHAVES_PERCENTIL.some((k) => typeof o[k] === 'number')
    if (temPercentil && typeof o.n === 'number' && o.n < MINIMO_AMOSTRA)
      out.push(`${caminho} (n=${o.n} com percentil)`)
    if (temPercentil && o.status === 'insuficiente')
      out.push(`${caminho} (insuficiente com percentil)`)
    for (const [k, v] of Object.entries(o)) violacoesMinimo(v, `${caminho}.${k}`, out)
  }
  return out
}

function violacoesPessoa(
  x: unknown,
  pessoas: Set<string>,
  caminho = '$',
  out: string[] = [],
): string[] {
  if (Array.isArray(x)) x.forEach((v, i) => violacoesPessoa(v, pessoas, `${caminho}[${i}]`, out))
  else if (x && typeof x === 'object') {
    for (const [k, v] of Object.entries(x as Record<string, unknown>)) {
      if (CHAVES_PESSOA.test(k)) out.push(`${caminho}.${k} (chave de pessoa)`)
      violacoesPessoa(v, pessoas, `${caminho}.${k}`, out)
    }
  } else if (typeof x === 'string' && (pessoas.has(x) || /\bPessoa \d+\b/.test(x)))
    out.push(`${caminho} = "${x}"`)
  return out
}

describe.each(CENARIOS)('QA intensivo de filtros: $nome', (c) => {
  const { ctx } = c

  it('INV-F1 fluxo: recorte mais estreito nunca tem base maior (e nunca passa do total sem filtro)', () => {
    const violacoes: string[] = []
    fc.assert(
      fc.property(
        arbFluxo(c).chain((f) =>
          fc.record({
            largo: fc.constant(f),
            estreito: fc.record({
              equipe: estreitar(f.equipe, c.equipes),
              tipo: estreitar(f.tipo, TIPOS_FILTRO),
              sistema: estreitar(f.sistema, c.sistemas),
              periodo: fc.constant(f.periodo),
            }),
          }),
        ),
        ({ largo, estreito }) => {
          for (const id of FLUXO) {
            const total = baseN(
              calc(id, { equipe: [], tipo: [], sistema: [], periodo: largo.periodo }, ctx),
            )
            const nl = baseN(calc(id, largo, ctx))
            const ne = baseN(calc(id, estreito, ctx))
            if (nl !== null && ne !== null && ne > nl)
              violacoes.push(
                `${id}: estreito ${ne} > largo ${nl} | ${JSON.stringify(estreito)} vs ${JSON.stringify(largo)}`,
              )
            if (total !== null && nl !== null && nl > total)
              violacoes.push(`${id}: filtrado ${nl} > total ${total} | ${JSON.stringify(largo)}`)
          }
        },
      ),
      opcoesFc(),
    )
    expect(violacoes.slice(0, 10)).toEqual([])
  }, 600_000)

  it('INV-F1 sustentação: recorte mais estreito nunca tem base maior', () => {
    const violacoes: string[] = []
    fc.assert(
      fc.property(
        arbSust.chain((f) =>
          fc.record({
            largo: fc.constant(f),
            estreito: fc.record({
              equipe: estreitar(f.equipe, EQUIPES_SUSTENTACAO_ID),
              prioridade: estreitar(f.prioridade, PRIORIDADES),
              periodo: fc.constant(f.periodo),
            }),
          }),
        ),
        ({ largo, estreito }) => {
          for (const id of SUST) {
            const total = baseN(
              calc(id, { equipe: [], prioridade: [], periodo: largo.periodo }, ctx),
            )
            const nl = baseN(calc(id, largo, ctx))
            const ne = baseN(calc(id, estreito, ctx))
            if (nl !== null && ne !== null && ne > nl)
              violacoes.push(
                `${id}: estreito ${ne} > largo ${nl} | ${JSON.stringify(estreito)} vs ${JSON.stringify(largo)}`,
              )
            if (total !== null && nl !== null && nl > total)
              violacoes.push(`${id}: filtrado ${nl} > total ${total} | ${JSON.stringify(largo)}`)
          }
        },
      ),
      opcoesFc(),
    )
    expect(violacoes.slice(0, 10)).toEqual([])
  }, 600_000)

  it('INV-F2 filtro que não se aplica à métrica (tabela 2.2) é ignorado', () => {
    const violacoes: string[] = []
    const comExcecao = FLUXO.filter((id) => (APLICABILIDADE_FLUXO[id] ?? []).length < 4)
    expect(comExcecao.length).toBeGreaterThan(0)
    fc.assert(
      fc.property(arbFluxo(c), subNV(c.equipes), subNV(TIPOS_FILTRO), (f, eq, tp) => {
        for (const id of comExcecao) {
          const ap = APLICABILIDADE_FLUXO[id] ?? []
          const limpo: FF = {
            ...f,
            equipe: ap.includes('equipe') ? f.equipe : [],
            tipo: ap.includes('tipo') ? f.tipo : [],
          }
          const sujo: FF = {
            ...limpo,
            equipe: ap.includes('equipe') ? limpo.equipe : eq,
            tipo: ap.includes('tipo') ? limpo.tipo : tp,
          }
          if (JSON.stringify(calc(id, limpo, ctx)) !== JSON.stringify(calc(id, sujo, ctx)))
            violacoes.push(`${id} (aplica ${ap.join('/')}) mudou com ${JSON.stringify(sujo)}`)
        }
      }),
      opcoesFc(),
    )
    expect(violacoes.slice(0, 10)).toEqual([])
  }, 600_000)

  it('INV-F3 domínios separados: prioridade não altera fluxo; tipo/sistema não alteram sustentação', () => {
    const violacoes: string[] = []
    fc.assert(
      fc.property(arbFluxo(c), arbSust, (ff, fs) => {
        for (const id of FLUXO) {
          const r = JSON.stringify(calc(id, ff, ctx))
          const comPrio = JSON.stringify(calc(id, { ...ff, prioridade: ['P1'] }, ctx))
          if (r !== comPrio) violacoes.push(`${id} mudou com prioridade`)
        }
        for (const id of SUST) {
          const r = JSON.stringify(calc(id, fs, ctx))
          const comFluxo = JSON.stringify(
            calc(id, { ...fs, tipo: ['Incidente'], sistema: [c.sistemas[0]] }, ctx),
          )
          if (r !== comFluxo) violacoes.push(`${id} mudou com tipo/sistema do fluxo`)
        }
      }),
      opcoesFc(Math.max(5, Math.floor(RUNS / 3))),
    )
    expect(violacoes.slice(0, 10)).toEqual([])
  }, 600_000)

  it('INV-F4 e INV-F5: nenhuma combinação publica percentil abaixo de 20 nem dado individual', () => {
    const violacoes: string[] = []
    fc.assert(
      fc.property(arbFluxo(c), arbSust, (ff, fs) => {
        for (const id of FLUXO) {
          const r = calc(id, ff, ctx)
          for (const v of violacoesMinimo(r)) violacoes.push(`${id} ${v} | ${JSON.stringify(ff)}`)
          for (const v of violacoesPessoa(r, c.pessoas)) violacoes.push(`${id} ${v}`)
        }
        for (const id of SUST) {
          const r = calc(id, fs, ctx)
          for (const v of violacoesMinimo(r)) violacoes.push(`${id} ${v} | ${JSON.stringify(fs)}`)
          for (const v of violacoesPessoa(r, c.pessoas)) violacoes.push(`${id} ${v}`)
        }
      }),
      opcoesFc(),
    )
    for (const id of ['VISAO_GERAL', 'PV1'] as const) {
      const r = calc(id, {}, ctx)
      for (const v of violacoesMinimo(r)) violacoes.push(`${id} ${v}`)
      for (const v of violacoesPessoa(r, c.pessoas)) violacoes.push(`${id} ${v}`)
    }
    expect(violacoes.slice(0, 15)).toEqual([])
  }, 600_000)

  it('INV-F6 a ordem dos valores selecionados não altera o resultado', () => {
    const violacoes: string[] = []
    fc.assert(
      fc.property(arbFluxo(c), arbSust, (ff, fs) => {
        const rev = <T>(xs: T[]) => [...xs].reverse()
        for (const id of FLUXO) {
          const a = JSON.stringify(calc(id, ff, ctx))
          const b = JSON.stringify(
            calc(
              id,
              { ...ff, equipe: rev(ff.equipe), tipo: rev(ff.tipo), sistema: rev(ff.sistema) },
              ctx,
            ),
          )
          if (a !== b) violacoes.push(`${id} depende da ordem | ${JSON.stringify(ff)}`)
        }
        for (const id of SUST) {
          const a = JSON.stringify(calc(id, fs, ctx))
          const b = JSON.stringify(
            calc(id, { ...fs, equipe: rev(fs.equipe), prioridade: rev(fs.prioridade) }, ctx),
          )
          if (a !== b) violacoes.push(`${id} depende da ordem | ${JSON.stringify(fs)}`)
        }
      }),
      opcoesFc(Math.max(5, Math.floor(RUNS / 3))),
    )
    expect(violacoes.slice(0, 10)).toEqual([])
  }, 600_000)

  it('INV-F7 consolidado de duas equipes fica entre o maior e a soma das bases individuais', () => {
    const violacoes: string[] = []
    const pares = fc
      .tuple(fc.constantFrom(...c.equipes), fc.constantFrom(...c.equipes))
      .filter(([a, b]) => a !== b)
    fc.assert(
      fc.property(pares, fc.constantFrom(...PERIODOS), ([a, b], periodo) => {
        for (const id of FLUXO) {
          const ap = APLICABILIDADE_FLUXO[id] ?? []
          if (!ap.includes('equipe')) continue
          const f = (equipe: string[]) => ({ equipe, tipo: [], sistema: [], periodo })
          const na = baseN(calc(id, f([a]), ctx))
          const nb = baseN(calc(id, f([b]), ctx))
          const nab = baseN(calc(id, f([a, b]), ctx))
          if (na === null || nb === null || nab === null) continue
          // O20: só o estado vazio de fato (lista `dias` vazia) fica fora do limite superior; o inferior vale sempre.
          const vazio =
            id === 'O20' &&
            (diasO20(calc(id, f([a]), ctx)) === 0 || diasO20(calc(id, f([b]), ctx)) === 0)
          if (nab < Math.max(na, nb) || (!vazio && nab > na + nb))
            violacoes.push(`${id}: ${a}=${na}, ${b}=${nb}, ${a}+${b}=${nab} (${periodo.tipo})`)
        }
      }),
      opcoesFc(Math.max(5, Math.floor(RUNS / 2))),
    )
    expect(violacoes.slice(0, 10)).toEqual([])
  }, 600_000)

  it('INV-F7b O20 vazio: sem transição no período o consolidado é vazio; vazio mais dados não perde os dados', () => {
    const futuro: Periodo = { tipo: 'custom', de: '2027-01-04', ate: '2027-01-29' }
    const f = (equipe: string[], periodo: Periodo) => ({ equipe, tipo: [], sistema: [], periodo })
    let ambosVazios = 0
    let misto = 0
    const pares = c.equipes.flatMap((x) =>
      c.equipes.filter((y) => y > x).map((y) => [x, y] as const),
    )
    for (const [a, b] of pares) {
      // ambos vazios: período sem transição
      const v = calc('O20', f([a, b], futuro), c.ctx)
      expect(diasO20(v), `${a}+${b}`).toBe(0)
      expect(baseN(v), `${a}+${b}`).toBe(0)
      ambosVazios++
      for (const periodo of PERIODOS) {
        const ra = calc('O20', f([a], periodo), c.ctx)
        const rb = calc('O20', f([b], periodo), c.ctx)
        if ((diasO20(ra) === 0) === (diasO20(rb) === 0)) continue
        const comDados = diasO20(ra) === 0 ? rb : ra
        const rab = calc('O20', f([a, b], periodo), c.ctx)
        expect(
          diasO20(rab),
          `${a}+${b} (${periodo.tipo}): vazio mais dados não fica vazio`,
        ).toBeGreaterThan(0)
        expect(baseN(rab)!, `${a}+${b} (${periodo.tipo})`).toBeGreaterThanOrEqual(baseN(comDados)!)
        misto++
      }
    }
    expect(ambosVazios, 'guarda de suíte vazia: pares ambos vazios').toBeGreaterThanOrEqual(1)
    process.stdout.write(`INV-F7b ${c.nome}: ${ambosVazios} pares vazios, ${misto} casos mistos\n`)
  }, 600_000)
})
