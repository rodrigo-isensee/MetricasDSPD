import { describe, expect, it } from 'vitest'
import {
  EQUIPES_SUSTENTACAO_ID,
  METRICA_IDS,
  METRICAS_TENDENCIA,
  fonteDaMetrica,
  PRIORIDADES,
  TIPOS_FILTRO,
  type MetricaId,
  type Periodo,
} from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { gerarBaseMock, gerarPesquisaMock } from '@metricas-dspd/mock'
import { acelerato, businessmap, calcularMetrica, CALENDARIO_PADRAO, pesquisa } from '.'
import type { ContextosMetricas } from './calcular'

/**
 * Varredura sistêmica de filtros: as 33 métricas, com períodos, equipes, tipos, sistemas e
 * prioridades variados, sobre bases de tamanhos e datas de corte diferentes. Cada resultado precisa
 * obedecer ao contrato (inclui a regra dos 20 itens) e a seleção mais estreita nunca ganha itens.
 */
const PERIODOS: Periodo[] = [
  { tipo: '4s' },
  { tipo: '12s' },
  { tipo: '6m' },
  { tipo: '12m' },
  { tipo: 'custom', de: '2026-03-02', ate: '2026-05-31' },
]

const contextos = (cfg: Parameters<typeof gerarBaseMock>[0]): ContextosMetricas => {
  const b = gerarBaseMock(cfg)
  return {
    bm: businessmap.criarContextoBM(b.bm, b.config.hoje, CALENDARIO_PADRAO),
    ac: acelerato.criarContextoAC(b.ac, b.config.hoje, CALENDARIO_PADRAO),
    pesq: pesquisa.criarContextoPesquisa(gerarPesquisaMock(b.config), b.config.hoje),
  }
}

const CENARIOS: [string, ContextosMetricas][] = [
  ['escala 0,4, corte padrão', contextos({ escala: 0.4 })],
  [
    'escala 0,1, corte em maio',
    contextos({ escala: 0.1, semente: 9, hoje: '2026-05-15T18:00:00-03:00' }),
  ],
]

const calc = (id: MetricaId, filtros: unknown, ctx: ContextosMetricas) =>
  calcularMetrica(id, filtros as never, ctx) as { base?: { n: number } }

/** As tendências do Resumo não têm filtro (só a data de corte): a varredura de filtros não se aplica (`tendencia.test.ts`). */
const ehTendencia = (id: MetricaId): boolean => METRICAS_TENDENCIA.includes(id)

it('tendências: o resultado respeita o contrato e é determinístico em cada cenário', () => {
  for (const [, ctx] of CENARIOS)
    for (const id of ['TENDENCIA_FLUXO', 'TENDENCIA_SUST'] as const) {
      const r = calc(id, {}, ctx)
      expect(SCHEMAS_RESULTADO[id].safeParse(r).success, id).toBe(true)
      expect(calc(id, {}, ctx)).toEqual(r)
    }
})

const valida = (id: MetricaId, resultado: unknown) => {
  const r = SCHEMAS_RESULTADO[id].safeParse(resultado)
  expect(r.success, `${id}: ${r.success ? '' : r.error.message.slice(0, 300)}`).toBe(true)
}

describe.each(CENARIOS)('varredura de filtros (%s)', (_nome, ctx) => {
  const equipes = [...new Set(ctx.bm.idx.marcos.map((m) => m.slugEquipe))].sort()
  const sistemas = [...new Set(ctx.bm.idx.marcos.map((m) => m.slugSistema))].sort()

  // Uma execução por métrica (it.each): a varredura inteira numa só passava de 15 s com a máquina carregada;
  // cada métrica isolada leva uma fração disso e uma falha aponta a métrica.
  const idsB = METRICA_IDS.filter((id) => fonteDaMetrica(id) === 'businessmap' && !ehTendencia(id))
  it.each(idsB)('fluxo: todo resultado respeita o contrato em qualquer combinação de filtros (%s)', (id) => {
    for (const periodo of PERIODOS) {
      const todos = { equipe: [], tipo: [], sistema: [], periodo }
      const recortes = [
        todos,
        { ...todos, equipe: equipes.slice(0, 1) },
        { ...todos, equipe: equipes.slice(0, 3), sistema: sistemas.slice(0, 2) },
        { ...todos, tipo: [TIPOS_FILTRO[0]] },
        { ...todos, tipo: [TIPOS_FILTRO[1], TIPOS_FILTRO[3]], sistema: sistemas.slice(2, 3) },
      ]
      for (const f of recortes) {
        const r = calc(id, f, ctx)
        valida(id, r)
        expect(calc(id, f, ctx)).toEqual(r)
      }
    }
  })

  // Uma execução por métrica (it.each): a varredura inteira numa só passava de 15 s com a máquina carregada;
  // cada métrica isolada leva uma fração disso e uma falha aponta a métrica.
  const idsA = METRICA_IDS.filter((id) => fonteDaMetrica(id) === 'acelerato' && !ehTendencia(id))
  it.each(idsA)('sustentação: todo resultado respeita o contrato com equipes e prioridades (%s)', (id) => {
    for (const periodo of PERIODOS) {
      const todos = { equipe: [], prioridade: [], periodo }
      const recortes = [
        todos,
        { ...todos, equipe: [EQUIPES_SUSTENTACAO_ID[0]] },
        { ...todos, prioridade: [PRIORIDADES[0]] },
        {
          ...todos,
          equipe: [...EQUIPES_SUSTENTACAO_ID.slice(1)],
          prioridade: [PRIORIDADES[2], PRIORIDADES[4]],
        },
      ]
      for (const f of recortes) valida(id, calc(id, f, ctx))
    }
  })

  it('pesquisa (PV1): só aceita a data de corte, ignora os filtros do fluxo e respeita o contrato', () => {
    const r = calc('PV1', {}, ctx)
    valida('PV1', r)
    for (const f of [{ equipe: ['x'], tipo: ['Story'], sistema: ['y'], periodo: { tipo: '4s' } }])
      expect(calc('PV1', f, ctx)).toEqual(r)
  })

  it('visão geral respeita o contrato e não recebe filtros', () => {
    valida('VISAO_GERAL', calc('VISAO_GERAL', {}, ctx))
  })

  it('filtrar por uma equipe nunca aumenta o WIP do O1, e o consolidado soma as equipes', () => {
    const todos = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
    const wip = (f: unknown) =>
      (calc('O1', f, ctx) as unknown as { hoje: { total: number } }).hoje.total
    const total = wip(todos)
    const porEquipe = equipes.map((e) => wip({ ...todos, equipe: [e] }))
    expect(porEquipe.every((n) => n <= total)).toBe(true)
    expect(porEquipe.reduce((s, n) => s + n, 0)).toBe(total)
  })
})
