import { describe, expect, it } from 'vitest'
import { resultadoPV1, type LinhaPesquisa } from '@metricas-dspd/contratos'
import { gerarPesquisaMock, CONFIG_PADRAO } from '@metricas-dspd/mock'
import { calcularMetrica } from '../calcular'
import { agruparAreas, blocoConsolidado, concordam, somarGrupos, type Grupo } from './anonimato'
import { criarContextoPesquisa, type BasePesquisa, type CargaPesquisa } from './modelo'
import { calcularPV1 } from './pv1'

const COD = ['p1', 'p2']
const grupo = (rotulo: string, n: number, f: [number, number, number, number, number]): Grupo => ({
  rotulo,
  n,
  contagens: { p1: f, p2: f },
})
/** n respondentes todos na faixa 4. */
const g4 = (rotulo: string, n: number) => grupo(rotulo, n, [0, 0, 0, n, 0])

describe('anonimato: consolidado (5 / 20)', () => {
  it('abaixo de 5 só informa n e mínimo, sem faixas', () => {
    expect(blocoConsolidado(g4('x', 4), COD)).toEqual({
      status: 'base-insuficiente',
      n: 4,
      minimo: 5,
    })
    expect(blocoConsolidado(g4('x', 0), COD)).toEqual({
      status: 'base-insuficiente',
      n: 0,
      minimo: 5,
    })
  })
  it('de 5 a 19 publica k de n; com 20 ou mais, percentual', () => {
    for (const [n, status] of [
      [5, 'insuficiente'],
      [19, 'insuficiente'],
      [20, 'ok'],
    ] as const) {
      const b = blocoConsolidado(g4('x', n), COD)
      expect(b.status).toBe('publicado')
      if (b.status !== 'publicado') return
      expect(b.perguntas[0]?.faixas).toHaveLength(5)
      expect(b.perguntas[0]?.faixas.every((f) => f.contagem.status === status)).toBe(true)
    }
  })
  it('pergunta sem contagem entra zerada', () => {
    const g: Grupo = { rotulo: 'x', n: 5, contagens: {} }
    const b = blocoConsolidado(g, ['p1'])
    expect(b.status === 'publicado' && b.perguntas[0]?.faixas[0]?.contagem.k).toBe(0)
    expect(concordam(g, ['p1'])[0]?.contagem.k).toBe(0)
  })
  it('concordam soma as faixas 4 e 5', () => {
    const c = concordam(grupo('x', 10, [1, 1, 2, 3, 3]), COD)
    expect(c[0]?.contagem).toMatchObject({ k: 6, n: 10, status: 'insuficiente' })
  })
  it('somarGrupos ignora grupo sem a pergunta e não altera os originais', () => {
    const a = g4('a', 3)
    const vazio: Grupo = { rotulo: 'v', n: 2, contagens: {} }
    const s = somarGrupos('t', [a, vazio], COD)
    expect(s.n).toBe(5)
    expect(s.contagens.p1).toEqual([0, 0, 0, 3, 0])
    expect(a.contagens.p1).toEqual([0, 0, 0, 3, 0])
  })
})

describe('anonimato: por área (3, ciclo 2, A10)', () => {
  const ns = (r: ReturnType<typeof agruparAreas>) =>
    r.status === 'publicado' ? r.areas.map((a) => [a.rotulo, a.bloco.n]) : r
  it('ciclo 1 não publica', () => {
    expect(agruparAreas([g4('A', 5), g4('B', 5)], 1, COD)).toEqual({
      status: 'nao-publicado',
      motivo: 'primeiro-ciclo',
    })
  })
  it('área com menos de 3 vai para Outras áreas, por último', () => {
    const r = agruparAreas([g4('Z', 4), g4('B', 3), g4('A', 2), g4('C', 1), g4('D', 1)], 2, COD)
    expect(ns(r)).toEqual([
      ['B', 3],
      ['Z', 4],
      ['Outras áreas', 4],
    ])
    expect(r.status === 'publicado' && r.areas.map((a) => a.outras)).toEqual([false, false, true])
  })
  it('fronteira 2/3: n=3 publica, n=2 vai para Outras', () => {
    expect(ns(agruparAreas([g4('A', 3), g4('B', 3), g4('C', 2), g4('D', 1)], 2, COD))).toEqual([
      ['A', 3],
      ['B', 3],
      ['Outras áreas', 3],
    ])
  })
  it('A10: resto de 1 ou 2 arrasta a menor área publicada (empate alfabético)', () => {
    // 4,3,3,3,1: resto 1 -> a menor (3, 'B' pelo alfabeto) vai para Outras (4).
    const r = agruparAreas([g4('A', 4), g4('B', 3), g4('C', 3), g4('D', 3), g4('E', 1)], 2, COD)
    expect(ns(r)).toEqual([
      ['A', 4],
      ['C', 3],
      ['D', 3],
      ['Outras áreas', 4],
    ])
  })
  it('A10 repete até o resto ser 0 ou 3 ou mais', () => {
    // 3,3,2: Outras=2 -> arrasta A (3) -> 5.
    expect(ns(agruparAreas([g4('A', 3), g4('B', 4), g4('C', 2)], 2, COD))).toEqual([
      ['B', 4],
      ['Outras áreas', 5],
    ])
  })
  it('menos de 2 grupos publicáveis: não publica', () => {
    expect(agruparAreas([g4('A', 9)], 2, COD)).toEqual({
      status: 'nao-publicado',
      motivo: 'base-insuficiente',
    })
    expect(agruparAreas([g4('A', 2), g4('B', 1)], 2, COD)).toEqual({
      status: 'nao-publicado',
      motivo: 'base-insuficiente',
    })
    expect(agruparAreas([], 2, COD)).toEqual({
      status: 'nao-publicado',
      motivo: 'base-insuficiente',
    })
  })
  it('sem resto (todas as áreas com 3 ou mais) não cria Outras áreas', () => {
    expect(ns(agruparAreas([g4('B', 3), g4('A', 5)], 2, COD))).toEqual([
      ['A', 5],
      ['B', 3],
    ])
  })
  it('ordem alfabética pt-BR, com acento', () => {
    const r = agruparAreas([g4('Operações', 3), g4('Jurídico', 3), g4('Atendimento', 3)], 2, COD)
    expect(ns(r)).toEqual([
      ['Atendimento', 3],
      ['Jurídico', 3],
      ['Operações', 3],
    ])
  })
})

describe('calcularPV1 sobre o mock', () => {
  const base = gerarPesquisaMock(CONFIG_PADRAO)
  const em = (hoje: string) => calcularPV1(criarContextoPesquisa(base, hoje))
  const ok = (hoje: string) => {
    const r = em(hoje)
    if (r.status !== 'ok') throw new Error('esperava ok')
    return r
  }

  it('sem contexto ou antes da primeira carga: sem-pesquisa (nunca erro)', () => {
    expect(calcularPV1()).toEqual({ status: 'sem-pesquisa', fonte: 'pesquisa' })
    expect(em('2025-07-09')).toEqual({ status: 'sem-pesquisa', fonte: 'pesquisa' })
    expect(calcularMetrica('PV1', {}, {} as never)).toEqual({
      status: 'sem-pesquisa',
      fonte: 'pesquisa',
    })
  })

  it('todos os cortes passam pelo schema do contrato (inclui a supressão A10)', () => {
    for (const d of [
      '2025-07-10',
      '2025-12-31',
      '2026-01-12',
      '2026-04-09',
      '2026-07-10',
      '2026-07-20',
      '2026-10-09',
    ])
      expect(resultadoPV1.safeParse(em(d)).success, d).toBe(true)
  })

  it('ciclo 1: só consolidado, com 9 respondentes em k de n', () => {
    const r = ok('2025-07-10T10:00:00-03:00')
    expect(r.ciclo).toBe(1)
    expect(r.porArea).toEqual({ status: 'nao-publicado', motivo: 'primeiro-ciclo' })
    expect(r.consolidado).toMatchObject({ status: 'publicado', n: 9 })
    expect(r.tendencia).toHaveLength(1)
  })

  it('ciclo 2 (11): por área com Outras áreas', () => {
    const r = ok('2025-12-01')
    expect(r.trimestre).toBe('2025-T3')
    expect(r.porArea.status === 'publicado' && r.porArea.areas.at(-1)?.outras).toBe(true)
  })

  it('4T/2025 (n=4): consolidado base insuficiente e tendência sem faixas', () => {
    const r = ok('2026-02-01')
    expect(r.consolidado).toEqual({ status: 'base-insuficiente', n: 4, minimo: 5 })
    expect(r.porArea).toEqual({ status: 'nao-publicado', motivo: 'base-insuficiente' })
    expect(r.tendencia.at(-1)?.bloco).toEqual({ status: 'base-insuficiente', n: 4, minimo: 5 })
    expect(r.participacao.taxa.status).toBe('insuficiente')
  })

  it('1T/2026 (14): supressão complementar mantém o resto fora de 1 e 2', () => {
    const r = ok('2026-05-01')
    expect(r.consolidado).toMatchObject({ n: 14 })
    if (r.porArea.status !== 'publicado') throw new Error('esperava por área')
    const soma = r.porArea.areas.reduce((s, a) => s + a.bloco.n, 0)
    expect(soma).toBe(14)
    expect(r.porArea.areas.every((a) => a.bloco.n >= 3)).toBe(true)
  })

  it('2T/2026 reenviado: a carga substituída (17) nunca é publicada, em nenhuma data de referência', () => {
    // Antes e depois do reenvio (08/07 e 20/07) o painel é idêntico: a diferença de 2 respondentes não aparece.
    const depois = ok('2026-07-31')
    for (const d of ['2026-07-08', '2026-07-10', '2026-07-19', '2026-07-20'])
      expect(ok(d), d).toEqual(depois)
    expect(depois.consolidado).toMatchObject({ n: 19 })
    const c = depois.consolidado
    expect(c.status === 'publicado' && c.perguntas[0]?.faixas[0]?.contagem.status).toBe(
      'insuficiente',
    )
    expect(base.cargas.filter((c) => c.trimestre === '2026-T2')).toHaveLength(2)
    // Antes da primeira carga do trimestre, ele ainda não existe.
    expect(ok('2026-07-07').trimestre).toBe('2026-T1')
  })

  it('3T/2026 (24): percentual no consolidado, Outras = 5, questionário v2, quebra de série', () => {
    const r = ok('2026-10-09')
    expect(r.trimestre).toBe('2026-T3')
    expect(r.ciclo).toBe(6)
    expect(
      r.consolidado.status === 'publicado' &&
        r.consolidado.perguntas[0]?.faixas[0]?.contagem.status,
    ).toBe('ok')
    expect(r.questionario.versaoId).toBe('q-v2')
    expect(r.questionario.perguntas.map((p) => p.ordem)).toEqual([1, 2, 3, 4, 5])
    if (r.porArea.status !== 'publicado') throw new Error('esperava por área')
    expect(r.porArea.areas.at(-1)).toMatchObject({ outras: true, bloco: { n: 5 } })
    expect(r.tendencia.map((t) => t.trimestre)).toEqual([
      '2025-T4',
      '2026-T1',
      '2026-T2',
      '2026-T3',
    ])
    expect(r.tendencia.map((t) => t.versaoId)).toEqual(['q-v1', 'q-v1', 'q-v2', 'q-v2'])
    expect(r.criterios.serie.map((m) => m.id)).toEqual(['pesquisa-q-v2'])
    expect(r.criterios.janela).toEqual([])
    expect(r.oQueMudou).toEqual({ trimestre: '2026-T3', texto: expect.any(String) })
    expect(r.participacao.convidados).toBeGreaterThanOrEqual(r.participacao.respondentes)
    expect(r.base).toEqual({ n: 24, unidade: 'respostas', janela: null })
  })

  it('a ordem das cargas, linhas e áreas na entrada não muda o resultado', () => {
    const inv: BasePesquisa = {
      ...base,
      areas: [...base.areas].reverse(),
      versoes: [...base.versoes].reverse(),
      cargas: [...base.cargas].reverse().map((c) => ({ ...c, linhas: [...c.linhas].reverse() })),
    }
    expect(calcularPV1(criarContextoPesquisa(inv, '2026-10-09'))).toEqual(em('2026-10-09'))
  })
})

describe('calcularPV1: bordas do modelo', () => {
  const carga = (
    extra: Partial<CargaPesquisa> = {},
    linhas: LinhaPesquisa[] = [],
  ): CargaPesquisa => ({
    cargaId: 1,
    trimestre: '2026-T1',
    versaoId: 'v',
    recebidaEm: '2026-04-01',
    oQueMudou: null,
    linhas,
    ...extra,
  })
  const linha = (extra: Partial<LinhaPesquisa> = {}): LinhaPesquisa => ({
    trimestre: '2026-T1',
    area: 'a',
    pergunta: 'p',
    f1: 0,
    f2: 0,
    f3: 0,
    f4: 6,
    f5: 0,
    convidados: 8,
    ...extra,
  })
  const base = (cargas: CargaPesquisa[]): BasePesquisa => ({
    areas: [{ codigo: 'a', rotulo: 'Área A' }],
    versoes: [
      { id: 'v', vigenteDesde: '2026-01-01', perguntas: [{ codigo: 'p', ordem: 1, texto: 't' }] },
    ],
    cargas,
    criterios: [],
  })

  it('versão inexistente é erro de dados, não resultado', () => {
    expect(() =>
      calcularPV1(criarContextoPesquisa(base([carga({ versaoId: 'x' })]), '2026-05-01')),
    ).toThrow(/Versão de questionário/)
  })

  it('linha de pergunta fora do questionário é ignorada; área desconhecida usa o código', () => {
    const b = base([
      carga({}, [
        linha(),
        linha({ pergunta: 'fora', f4: 99 }),
        linha({ area: 'zz', f4: 1, convidados: 2 }),
      ]),
    ])
    const r = calcularPV1(criarContextoPesquisa(b, '2026-05-01'))
    expect(r.status === 'ok' && r.consolidado).toMatchObject({ n: 7 })
    expect(r.status === 'ok' && r.participacao).toMatchObject({ respondentes: 7, convidados: 10 })
  })

  it('o maior id do trimestre vence mesmo chegando antes na lista', () => {
    const b = base([
      carga({ cargaId: 2, oQueMudou: 'novo' }, [linha()]),
      carga({ cargaId: 1, oQueMudou: 'velho' }, [linha()]),
    ])
    const r = calcularPV1(criarContextoPesquisa(b, '2026-05-01'))
    expect(r.status === 'ok' && r.oQueMudou?.texto).toBe('novo')
  })

  it('trimestre do 4T termina em dezembro e carga sem linhas dá n=0', () => {
    const b = base([carga({ trimestre: '2025-T4' }, [])])
    const r = calcularPV1(criarContextoPesquisa(b, '2026-05-01'))
    expect(r.status === 'ok' && r.consolidado).toEqual({
      status: 'base-insuficiente',
      n: 0,
      minimo: 5,
    })
  })
})
