import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import {
  achadoApontamentoSchema,
  capacidadeApontamentoSchema,
  diarioApontamentoSchema,
  distribuicaoApontamentoSchema,
  kpisApontamentoSchema,
  matrizApontamentoSchema,
  qualidadeApontamentoSchema,
  type FlagQualidade,
  type PctComPiso,
  type PessoaApontamento,
  type Taxa,
} from '@metricas-dspd/contratos'
import { criarCalendario } from '../../core/calendario'
import {
  LIMIARES_ACHADO_PADRAO,
  LIMITE_ATIPICO_SEGUNDOS_PADRAO,
  calcularApontamento,
  calcularCapacidade,
  calcularDiario,
  calcularDistribuicao,
  calcularMatriz,
  calcularQualidade,
  capacidadeMensal,
  capacidadePessoa,
  diasAtipicos,
  type FiltrosApontamento,
  ehAtipico,
  faixaDoDia,
  filtrar,
  flagsEfetivas,
  gerarAchados,
  horas,
  horasPorDiaSegundos,
  ordenarPorPessoa,
  pctComPiso,
  somaSegundos,
  utilizacao,
  type EntradaApontamento,
  type LinhaApontamento,
} from './index'

// ---------- fixtures sintéticas: pessoas fictícias, nenhum nome real ----------
const H = 3600
const CAL = criarCalendario({ feriados: new Set(['2026-09-07']) }) // jornada 8 h; 07/09/2026 é segunda
const TAREFA = { id: '7', rotulo: 'Tarefa' }
const BUG = { id: '8', rotulo: 'Correção' }
const TIME_A = { id: 'time-a', rotulo: 'Time A' }
const TIME_B = { id: 'time-b', rotulo: 'Time B' }
const SEM_TIME = { id: 'sem-time', rotulo: 'Sem time' }
const PROJ_A = { id: '100', rotulo: 'Projeto A', foraDoEscopo: false }
const PROJ_B = { id: '200', rotulo: 'Projeto B', foraDoEscopo: true }
const TESTES = { id: 'testes', rotulo: 'Testes' }
const NAO_CLASS = { id: 'nao-classificado', rotulo: 'Sem comentário' }
const DIRETO = { id: 'direto-no-card', rotulo: 'Direto no card' }
const EM_SUB = { id: 'em-subtarefa', rotulo: 'Em subtarefa' }

function linha(o: Partial<LinhaApontamento> = {}): LinhaApontamento {
  return {
    pessoaRef: 'p1',
    data: '2026-09-01',
    segundos: H,
    tipo: TAREFA,
    equipe: TIME_A,
    projeto: PROJ_A,
    subgrupo: TESTES,
    subtarefa: DIRETO,
    semIniciativa: false,
    flags: [],
    ...o,
  }
}
const muitas = (n: number, o: Partial<LinhaApontamento> = {}) =>
  Array.from({ length: n }, () => linha(o))

/** Dias úteis de setembro de 2026 sem o feriado de 07/09: 21 dias. */
const UTEIS_SET = [
  '01',
  '02',
  '03',
  '04',
  '08',
  '09',
  '10',
  '11',
  '14',
  '15',
  '16',
  '17',
  '18',
  '21',
  '22',
  '23',
  '24',
  '25',
  '28',
  '29',
  '30',
].map((d) => `2026-09-${d}`)

const PESSOAS: PessoaApontamento[] = [1, 2, 3, 4].map((n) => ({
  pessoaRef: `p${String(n)}`,
  rotulo: `Pessoa ${String(n)}`,
  identificada: true,
}))

function entrada(
  linhas: readonly LinhaApontamento[],
  o: Partial<EntradaApontamento> = {},
): EntradaApontamento {
  return {
    linhas,
    periodo: { de: '2026-09-01', ate: '2026-09-30' },
    diario: { de: '2026-09-01', ate: '2026-09-30' },
    filtros: { anomalos: 'incluir' },
    nivelMatriz: 'tipo',
    calendario: CAL,
    limiteAtipicoSegundos: 10 * H,
    ultimaColetaOk: null,
    pessoas: PESSOAS,
    nomesReais: false,
    ...o,
  }
}

/** Cenário de referência: p1 com 25 apontamentos (acima do piso), p2 com 5 (abaixo) e 2 sem pessoa. */
function cenario(): LinhaApontamento[] {
  const p1 = Array.from({ length: 25 }, (_, i) =>
    linha({
      pessoaRef: 'p1',
      data: UTEIS_SET[i % 21] as string,
      segundos: 2 * H,
      tipo: i % 5 === 0 ? BUG : TAREFA,
      flags: i % 5 === 0 ? ['sem-comentario'] : [],
    }),
  )
  const p2 = Array.from({ length: 5 }, (_, i) =>
    linha({
      pessoaRef: 'p2',
      data: UTEIS_SET[i] as string,
      segundos: H,
      projeto: PROJ_B,
      subgrupo: NAO_CLASS,
      subtarefa: EM_SUB,
      semIniciativa: true,
      flags: ['sem-vinculo', 'generico'],
    }),
  )
  return [
    ...p1,
    ...p2,
    linha({ pessoaRef: null, segundos: H }),
    linha({ pessoaRef: null, segundos: H }),
  ]
}

// ---------- comum ----------
describe('comum: segundos, piso de 20 e ordem neutra de pessoas', () => {
  it('horas e soma em segundos inteiros', () => {
    expect(horas(5400)).toBe(1.5)
    expect(somaSegundos([{ segundos: 1 }, { segundos: 2 }])).toBe(3)
    expect(somaSegundos([])).toBe(0)
  })

  it('percentual com piso: abaixo de 20 só a contagem; sem teto; total zero publica 0%', () => {
    expect(pctComPiso(1, 4, 19)).toEqual({ status: 'insuficiente', n: 19, minimo: 20 })
    expect(pctComPiso(1, 4, 20)).toEqual({ status: 'ok', n: 20, pct: 25 })
    expect(pctComPiso(30, 10, 40)).toEqual({ status: 'ok', n: 40, pct: 300 })
    expect(pctComPiso(5, 0, 25)).toEqual({ status: 'ok', n: 25, pct: 0 })
  })

  it('ordem neutra (o1): numérica com nomes desligados, alfabética sem acento com nomes ligados', () => {
    const itens = [
      { pessoaRef: 'p10' },
      { pessoaRef: 'p2' },
      { pessoaRef: 'p1' },
      { pessoaRef: 'p7' },
    ]
    const rotulos = new Map([
      ['p1', 'Zeca'],
      ['p2', 'Álvaro'],
      ['p10', 'bia'],
    ])
    const ref = (xs: { pessoaRef: string }[]) => xs.map((x) => x.pessoaRef)
    expect(ref(ordenarPorPessoa(itens, rotulos, false))).toEqual(['p1', 'p2', 'p7', 'p10'])
    // ref desconhecida (p7, rótulo vazio) vem antes; Álvaro vale como "alvaro"
    expect(ref(ordenarPorPessoa(itens, rotulos, true))).toEqual(['p7', 'p2', 'p10', 'p1'])
  })

  it('`outra-area` (soma de quem não é do time) vai sempre por último, com ou sem nomes', () => {
    const itens = [
      { pessoaRef: 'outra-area' as const },
      { pessoaRef: 'p10' as const },
      { pessoaRef: 'p2' as const },
    ]
    const rotulos = new Map([
      ['p2', 'Zeca'],
      ['p10', 'Ana'],
      ['outra-area', 'Aaa Outra área'],
    ])
    const ref = (xs: { pessoaRef: string }[]) => xs.map((x) => x.pessoaRef)
    expect(ref(ordenarPorPessoa(itens, rotulos, false))).toEqual(['p2', 'p10', 'outra-area'])
    expect(ref(ordenarPorPessoa(itens, rotulos, true))).toEqual(['p10', 'p2', 'outra-area'])
  })
})

// ---------- filtros e atípicos ----------
describe('valor atípico e filtros', () => {
  const dia = (ref: string | null, segundos: number[], data = '2026-09-01') =>
    segundos.map((s) => linha({ pessoaRef: ref, data, segundos: s }))

  it('soma do dia da pessoa acima do limite (estrito); linha sem pessoa não entra', () => {
    const ls = [
      ...dia('p1', [9 * H, 9 * H]), // 18 h
      ...dia('p2', [10 * H]), // exatamente o limite: não é atípico
      ...dia(null, [20 * H]),
      ...dia('p3', [10 * H], '2026-09-02'),
    ]
    const at = diasAtipicos(ls, 10 * H)
    expect([...at]).toEqual(['p1|2026-09-01'])
    expect(ehAtipico(ls[0] as LinhaApontamento, at)).toBe(true)
    expect(ehAtipico(ls[2] as LinhaApontamento, at)).toBe(false)
    expect(ehAtipico(ls[3] as LinhaApontamento, at)).toBe(false) // sem pessoa
  })

  it('pedido 067: o limite padrão é 10 h; 10 h e 1 min do dia é atípico, 10 h exatas não', () => {
    expect(LIMITE_ATIPICO_SEGUNDOS_PADRAO).toBe(10 * H)
    const ls = [...dia('p1', [10 * H + 60]), ...dia('p2', [10 * H])]
    expect([...diasAtipicos(ls, LIMITE_ATIPICO_SEGUNDOS_PADRAO)]).toEqual(['p1|2026-09-01'])
  })

  it('outra-area soma várias pessoas: três pessoas de 6 h no mesmo dia não dão dia atípico', () => {
    const ls = [
      ...dia('outra-area', [6 * H, 6 * H, 6 * H]), // 18 h somadas de três pessoas
      ...dia('p1', [17 * H]),
    ]
    const at = diasAtipicos(ls, 10 * H)
    expect([...at]).toEqual(['p1|2026-09-01'])
    expect(ehAtipico(ls[0] as LinhaApontamento, at)).toBe(false)
    expect(flagsEfetivas(ls[0] as LinhaApontamento, at)).toEqual([])
  })

  it('flags efetivas: classificação mais sem-iniciativa e valor-atipico, sem repetir', () => {
    const l = linha({ flags: ['generico', 'sem-iniciativa'], semIniciativa: true })
    const at = new Set(['p1|2026-09-01'])
    expect(flagsEfetivas(l, at)).toEqual(['generico', 'sem-iniciativa', 'valor-atipico'])
    expect(flagsEfetivas(linha(), new Set())).toEqual([])
  })

  const base = [
    linha({ pessoaRef: 'p1', projeto: PROJ_A, tipo: TAREFA, subgrupo: TESTES, subtarefa: DIRETO }),
    linha({
      pessoaRef: 'p2',
      projeto: PROJ_B,
      tipo: BUG,
      subgrupo: NAO_CLASS,
      subtarefa: EM_SUB,
      flags: ['sem-vinculo'],
    }),
    linha({ pessoaRef: null }),
    linha({ pessoaRef: 'p1', data: '2026-09-02', segundos: 20 * H }), // atípico
  ]
  const at = diasAtipicos(base, 10 * H)
  const ids = (ls: LinhaApontamento[]) => ls.map((l) => `${l.pessoaRef ?? '-'}@${l.data}`)

  it('097 L2: o filtro equipe restringe pelo time do card (e "sem-time"); lista vazia = sem filtro; só recorte, a soma do recorte bate', () => {
    const ls = [
      linha({ equipe: TIME_A }),
      linha({ equipe: TIME_B, segundos: 2 * H }),
      linha({ equipe: SEM_TIME, segundos: 3 * H }),
    ]
    const f = (equipe: string[]) => filtrar(ls, { anomalos: 'incluir', equipe }, new Set())
    expect(f(['time-b']).map((l) => l.segundos)).toEqual([2 * H])
    expect(f(['time-a', 'sem-time'])).toHaveLength(2)
    expect(f(['inexistente'])).toHaveLength(0)
    expect(f([])).toHaveLength(3)
  })

  it('sem filtro, lista vazia ou chave ausente: tudo passa (inclusive linha sem pessoa)', () => {
    expect(filtrar(base, { anomalos: 'incluir' }, at)).toHaveLength(4)
    expect(
      filtrar(base, { anomalos: 'incluir', pessoa: [], qualidade: [], projeto: [] }, at),
    ).toHaveLength(4)
  })

  it('cada filtro restringe: pessoa (sem pessoa sai), projeto, tipo, subtarefa e subgrupo', () => {
    expect(ids(filtrar(base, { anomalos: 'incluir', pessoa: ['p2'] }, at))).toEqual([
      'p2@2026-09-01',
    ])
    expect(filtrar(base, { anomalos: 'incluir', pessoa: ['p1', 'p2'] }, at)).toHaveLength(3)
    expect(filtrar(base, { anomalos: 'incluir', projeto: ['200'] }, at)).toHaveLength(1)
    expect(filtrar(base, { anomalos: 'incluir', tipo: ['8'] }, at)).toHaveLength(1)
    expect(filtrar(base, { anomalos: 'incluir', subtarefa: ['em-subtarefa'] }, at)).toHaveLength(1)
    expect(filtrar(base, { anomalos: 'incluir', subgrupo: ['nao-classificado'] }, at)).toHaveLength(
      1,
    )
  })

  it('qualidade: "completo" pega quem não tem flag; uma flag pega quem a tem (inclusive derivada)', () => {
    expect(filtrar(base, { anomalos: 'incluir', qualidade: ['completo'] }, at)).toHaveLength(2)
    expect(filtrar(base, { anomalos: 'incluir', qualidade: ['sem-vinculo'] }, at)).toHaveLength(1)
    expect(filtrar(base, { anomalos: 'incluir', qualidade: ['valor-atipico'] }, at)).toHaveLength(1)
    expect(
      filtrar(base, { anomalos: 'incluir', qualidade: ['completo', 'valor-atipico'] }, at),
    ).toHaveLength(3)
  })

  it('anômalos: incluir mantém e ocultar tira o dia atípico', () => {
    expect(filtrar(base, { anomalos: 'incluir' }, at)).toHaveLength(4)
    expect(filtrar(base, { anomalos: 'ocultar' }, at)).toHaveLength(3)
  })

  it("modo 'diario' (mapa diário): aplica pessoa e equipe e ignora os demais filtros", () => {
    const f = {
      anomalos: 'ocultar' as const,
      pessoa: ['p1'],
      tipo: ['8'],
      qualidade: ['sem-vinculo' as const],
    }
    expect(filtrar(base, f, at, 'diario')).toHaveLength(2)
    expect(filtrar(base, { anomalos: 'ocultar' }, at, 'diario')).toHaveLength(4)
  })

  it("097 K-286: modo 'diario' recorta pela equipe (e 'sem-time'), junto com a pessoa, sem olhar projeto, tipo nem anômalos", () => {
    const ls = [
      linha({ pessoaRef: 'p1', equipe: TIME_A }),
      linha({ pessoaRef: 'p1', equipe: TIME_B, segundos: 2 * H }),
      linha({ pessoaRef: 'p2', equipe: TIME_B, segundos: 3 * H }),
      linha({ pessoaRef: 'p2', equipe: SEM_TIME, segundos: 4 * H }),
    ]
    const d = (f: Partial<FiltrosApontamento>) =>
      filtrar(ls, { anomalos: 'ocultar', ...f }, new Set(), 'diario').map((l) => l.segundos)
    expect(d({ equipe: ['time-b'] })).toEqual([2 * H, 3 * H])
    expect(d({ equipe: ['time-a', 'sem-time'] })).toHaveLength(2)
    expect(d({ equipe: ['time-b'], pessoa: ['p1'] })).toEqual([2 * H])
    expect(d({ equipe: ['time-b'], tipo: ['999'], projeto: ['999'] })).toHaveLength(2)
    expect(d({ equipe: [] })).toHaveLength(4)
  })

  it('097 K-286: o atípico do mapa é decidido sobre o dia inteiro, antes do filtro de equipe', () => {
    const ls = [
      linha({ pessoaRef: 'p1', data: '2026-09-03', equipe: TIME_A, segundos: 6 * H }),
      linha({ pessoaRef: 'p1', data: '2026-09-03', equipe: TIME_B, segundos: 6 * H }),
    ]
    const atip = diasAtipicos(ls, 10 * H)
    const [so] = filtrar(ls, { anomalos: 'incluir', equipe: ['time-a'] }, atip, 'diario')
    expect(so).toBeDefined()
    expect(ehAtipico(so as LinhaApontamento, atip)).toBe(true)
  })
})

// ---------- distribuição, qualidade, matriz ----------
describe('distribuição por projeto, tipo e subgrupo', () => {
  it('soma as horas por dimensão, ordena por horas e aplica o piso sobre a base do bloco', () => {
    const d = calcularDistribuicao(cenario())
    expect(d.base).toEqual({ n: 32, unidade: 'apontamentos' })
    const a = d.porProjeto.find((l) => l.id === '100')
    const b = d.porProjeto.find((l) => l.id === '200')
    expect(a).toMatchObject({ segundos: 50 * H + 2 * H, apontamentos: 27, foraDoEscopo: false })
    expect(b).toMatchObject({ segundos: 5 * H, apontamentos: 5, foraDoEscopo: true })
    expect(d.porProjeto.map((l) => l.id)).toEqual(['100', '200'])
    expect(a?.participacao).toEqual({ status: 'ok', n: 32, pct: (52 / 57) * 100 })
    expect(d.porTipo.map((l) => l.id)).toEqual(['7', '8']) // ordem por horas: 47 h contra 10 h
    expect(d.porTipo[0]).not.toHaveProperty('foraDoEscopo')
    expect(d.porSubgrupo.map((l) => l.id)).toEqual(['testes', 'nao-classificado'])
  })

  it('base abaixo de 20: só contagem, nunca percentual', () => {
    const d = calcularDistribuicao(muitas(5))
    expect(d.porTipo[0]?.participacao).toEqual({ status: 'insuficiente', n: 5, minimo: 20 })
  })

  it('recorte vazio: listas vazias e base zero', () => {
    expect(calcularDistribuicao([])).toEqual({
      base: { n: 0, unidade: 'apontamentos' },
      porProjeto: [],
      porTipo: [],
      porSubgrupo: [],
    })
  })

  it('empate de horas: desempate pelo rótulo e pelo id', () => {
    const d = calcularDistribuicao([
      linha({ tipo: { id: '2', rotulo: 'B' } }),
      linha({ tipo: { id: '1', rotulo: 'B' } }),
      linha({ tipo: { id: '3', rotulo: 'A' } }),
    ])
    expect(d.porTipo.map((l) => l.id)).toEqual(['3', '1', '2'])
  })
})

describe('qualidade: flags não excludentes, completo e o3', () => {
  it('geral: completos k de n e as cinco flags na ordem do contrato', () => {
    const q = calcularQualidade(cenario(), new Set())
    expect(q.flagsNaoExcludentes).toBe(true)
    // completos: p1 sem flag = 20, sem pessoa = 2; p2 e p1 "sem-comentario" têm flag
    expect(q.geral.completos).toEqual({ status: 'ok', k: 22, n: 32, pct: (22 / 32) * 100 })
    expect(q.geral.porFlag.map((f) => f.flag)).toEqual([
      'sem-comentario',
      'generico',
      'sem-vinculo',
      'sem-iniciativa',
      'valor-atipico',
    ])
    expect(q.geral.porFlag.map((f) => f.apontamentos)).toEqual([5, 5, 5, 5, 0])
    expect(q.geral.porFlag[0]?.pct).toEqual({ status: 'ok', n: 32, pct: (5 / 32) * 100 })
  })

  it('por pessoa: percentual só com 20 apontamentos ou mais; abaixo, só contagem; sem pessoa fica fora', () => {
    const q = calcularQualidade(cenario(), new Set())
    expect(q.porPessoa.map((p) => p.pessoaRef)).toEqual(['p1', 'p2'])
    const [p1, p2] = q.porPessoa
    expect(p1?.completos).toMatchObject({ status: 'ok', k: 20, n: 25 })
    expect(p2?.completos).toEqual({ status: 'insuficiente', k: 0, n: 5, minimo: 20 })
    expect(p2?.porFlag.every((f) => f.pct.status === 'insuficiente')).toBe(true)
    expect(p1?.porFlag.every((f) => f.pct.status === 'ok')).toBe(true)
  })

  it('valor atípico entra como flag e tira o apontamento de "completo"', () => {
    const ls = muitas(20, { pessoaRef: 'p1', segundos: 2 * H })
    const q = calcularQualidade(ls, diasAtipicos(ls, 10 * H)) // 40 h no mesmo dia
    expect(q.geral.completos).toMatchObject({ k: 0, n: 20 })
    expect(q.geral.porFlag.find((f) => f.flag === 'valor-atipico')?.apontamentos).toBe(20)
  })

  it('outra-area conta na qualidade geral e não tem linha por pessoa', () => {
    const ls = [...muitas(20, { pessoaRef: 'outra-area', flags: ['generico'] }), linha()]
    const q = calcularQualidade(ls, diasAtipicos(ls, 10 * H))
    expect(q.geral.porFlag.find((f) => f.flag === 'generico')?.apontamentos).toBe(20)
    expect(q.porPessoa.map((p) => p.pessoaRef)).toEqual(['p1'])
  })

  it('vazio: zero apontamentos, sem pessoa', () => {
    const q = calcularQualidade([], new Set())
    expect(q.geral.completos).toEqual({ status: 'insuficiente', k: 0, n: 0, minimo: 20 })
    expect(q.porPessoa).toEqual([])
  })
})

describe('matriz pessoa x categoria (um nível por vez)', () => {
  it('nível tipo: células densas na ordem das colunas e participação da linha com o piso da pessoa', () => {
    const m = calcularMatriz(cenario(), 'tipo')
    expect(m.nivel).toBe('tipo')
    expect(m.colunas).toEqual([
      { id: '7', rotulo: 'Tarefa' },
      { id: '8', rotulo: 'Correção' },
    ])
    expect(m.linhas.map((l) => l.pessoaRef)).toEqual(['p1', 'p2'])
    const [p1, p2] = m.linhas
    expect(p1).toMatchObject({ segundos: 50 * H, apontamentos: 25 })
    expect(p1?.celulas.map((c) => c.colunaId)).toEqual(['7', '8'])
    expect(p1?.celulas[1]).toMatchObject({ segundos: 10 * H }) // 5 apontamentos de 2 h
    expect(p1?.celulas[0]?.participacao).toEqual({ status: 'ok', n: 25, pct: 80 })
    // p2 só tem tipo 7: a célula do tipo 8 existe, zerada, sem percentual (5 apontamentos)
    expect(p2?.celulas[1]).toEqual({
      colunaId: '8',
      segundos: 0,
      participacao: { status: 'insuficiente', n: 5, minimo: 20 },
    })
  })

  it('níveis subtarefa e subgrupo trocam só a dimensão', () => {
    expect(calcularMatriz(cenario(), 'subtarefa').colunas.map((c) => c.id)).toEqual([
      'direto-no-card',
      'em-subtarefa',
    ])
    expect(calcularMatriz(cenario(), 'subgrupo').colunas.map((c) => c.id)).toEqual([
      'testes',
      'nao-classificado',
    ])
  })

  it('vazio: nível, sem colunas nem linhas', () => {
    expect(calcularMatriz([], 'tipo')).toEqual({ nivel: 'tipo', colunas: [], linhas: [] })
  })
})

// ---------- capacidade ----------
describe('capacidade com calendário e feriados', () => {
  it('jornada do calendário em segundos e utilização sem teto', () => {
    expect(horasPorDiaSegundos(CAL)).toBe(8 * H)
    expect(utilizacao(10 * H, 5 * H, 40)).toEqual({ status: 'ok', n: 40, pct: 200 })
    expect(utilizacao(10 * H, 5 * H, 3)).toEqual({ status: 'insuficiente', n: 3, minimo: 20 })
  })

  it('por pessoa: dias úteis do intervalo (sem fim de semana nem feriado) x jornada', () => {
    // de 03/09 (qui) a 09/09 (qua): 03, 04, 08, 09 = 4 dias úteis (05 e 06 fim de semana, 07 feriado)
    const ls = [
      ...muitas(10, { pessoaRef: 'p2', data: '2026-09-03' }),
      ...muitas(10, { pessoaRef: 'p2', data: '2026-09-09' }),
    ]
    const [p] = capacidadePessoa(ls, CAL)
    expect(p).toEqual({
      pessoaRef: 'p2',
      inicio: '2026-09-03',
      fim: '2026-09-09',
      diasUteis: 4,
      capacidadeSegundos: 4 * 8 * H,
      realizadoSegundos: 20 * H,
      apontamentos: 20,
      utilizacao: { status: 'ok', n: 20, pct: (20 / 32) * 100 },
    })
  })

  it('pessoa que só apontou em fim de semana ou feriado fica de fora (utilização indefinida); sem pessoa também', () => {
    const ls = [
      ...muitas(3, { pessoaRef: 'p1', data: '2026-09-05' }), // sábado
      ...muitas(3, { pessoaRef: 'p2', data: '2026-09-07' }), // feriado
      ...muitas(3, { pessoaRef: null, data: '2026-09-02' }),
      linha({ pessoaRef: 'p3', data: '2026-09-02' }),
    ]
    expect(capacidadePessoa(ls, CAL).map((p) => p.pessoaRef)).toEqual(['p3'])
  })

  it('outra-area fica fora da capacidade por pessoa (três pessoas de 6 h no mesmo dia)', () => {
    const ls = [
      ...muitas(3, { pessoaRef: 'outra-area', data: '2026-09-01', segundos: 6 * H }),
      ...muitas(20, { pessoaRef: 'p1', data: '2026-09-01', segundos: H }),
    ]
    expect(capacidadePessoa(ls, CAL).map((p) => p.pessoaRef)).toEqual(['p1'])
    expect(capacidadePessoa(muitas(3, { pessoaRef: 'outra-area', segundos: 6 * H }), CAL)).toEqual(
      [],
    )
  })

  it('a utilização por pessoa pode passar de 100%', () => {
    const [p] = capacidadePessoa(muitas(30, { data: '2026-09-01', segundos: 2 * H }), CAL)
    expect(p?.diasUteis).toBe(1)
    expect(p?.utilizacao).toEqual({ status: 'ok', n: 30, pct: (60 / 8) * 100 })
  })

  describe('mensal (C-8 e C-7)', () => {
    const periodo = { de: '2026-08-01', ate: '2026-09-30' }
    // p1: 03/08 a 30/09 (fica ativa nos dois meses); p2: só setembro
    const ls = [
      linha({ pessoaRef: 'p1', data: '2026-08-03' }),
      linha({ pessoaRef: 'p1', data: '2026-09-30' }),
      linha({ pessoaRef: 'p2', data: '2026-09-01' }),
      linha({ pessoaRef: 'p2', data: '2026-09-02' }),
      linha({ pessoaRef: null, data: '2026-09-02' }),
    ]

    it('soma por pessoa os dias úteis do mês dentro do intervalo dela; mês sem pessoa ativa sai', () => {
      const m = capacidadeMensal(ls, CAL, periodo, null)
      // agosto/2026: 03 a 31 = 21 dias úteis (p1 ativa); setembro: p1 21 dias + p2 (01 a 02) 2 dias
      expect(m.map((x) => x.mes)).toEqual(['2026-08', '2026-09'])
      expect(m[0]).toMatchObject({
        capacidadeSegundos: 21 * 8 * H,
        realizadoSegundos: H,
        apontamentos: 1,
      })
      expect(m[1]).toMatchObject({
        capacidadeSegundos: (21 + 2) * 8 * H,
        realizadoSegundos: 3 * H,
        apontamentos: 3, // a linha sem pessoa não conta
        parcialAte: null,
      })
      const soSetembro = capacidadeMensal(ls.slice(2, 4), CAL, periodo, null)
      expect(soSetembro.map((x) => x.mes)).toEqual(['2026-09']) // agosto: ninguém ativo
    })

    it('outra-area fica fora da capacidade e do realizado do mês (três pessoas de 6 h no mesmo dia)', () => {
      const com = [
        ...ls,
        ...muitas(3, { pessoaRef: 'outra-area', data: '2026-09-01', segundos: 6 * H }),
      ]
      expect(capacidadeMensal(com, CAL, periodo, null)).toEqual(
        capacidadeMensal(ls, CAL, periodo, null),
      )
      expect(
        capacidadeMensal(
          muitas(3, { pessoaRef: 'outra-area', data: '2026-09-01', segundos: 6 * H }),
          CAL,
          periodo,
          null,
        ),
      ).toEqual([])
    })

    it('corta na última coleta ok: mês corrente parcial, meses seguintes fora (C-7)', () => {
      const m = capacidadeMensal(ls, CAL, periodo, '2026-09-10')
      expect(m).toHaveLength(2)
      expect(m[0]?.parcialAte).toBeNull() // agosto inteiro
      // setembro até 10/09: p1 (01 a 10: 01,02,03,04,08,09,10 = 7) + p2 (2) = 9 dias
      expect(m[1]).toMatchObject({ capacidadeSegundos: 9 * 8 * H, parcialAte: '2026-09-10' })
    })

    it('coleta no último dia do mês ou depois do fim do período: sem parcial', () => {
      expect(capacidadeMensal(ls, CAL, periodo, '2026-09-30')[1]?.parcialAte).toBeNull()
      expect(capacidadeMensal(ls, CAL, periodo, '2026-10-15')[1]?.parcialAte).toBeNull()
      // coleta em 31/08: setembro nem entra, agosto sai sem parcial (é o último dia)
      const m = capacidadeMensal(ls, CAL, periodo, '2026-08-31')
      expect(m.map((x) => [x.mes, x.parcialAte])).toEqual([['2026-08', null]])
    })

    it('coleta anterior ao início do período: nenhuma capacidade', () => {
      expect(capacidadeMensal(ls, CAL, periodo, '2026-07-15')).toEqual([])
    })

    it('período que começa no meio do mês só conta dali em diante', () => {
      const m = capacidadeMensal(ls, CAL, { de: '2026-09-29', ate: '2026-09-30' }, null)
      expect(m[0]?.capacidadeSegundos).toBe(2 * 8 * H) // p1 ativa em 29 e 30; p2 já tinha acabado
    })

    it('mês com apontamento só em fim de semana não tem capacidade e sai', () => {
      const m = capacidadeMensal(
        [linha({ pessoaRef: 'p1', data: '2026-09-05' })],
        CAL,
        { de: '2026-09-05', ate: '2026-09-06' },
        null,
      )
      expect(m).toEqual([])
    })

    it('calcularCapacidade junta jornada, mensal, por pessoa e o selo de leitura relativa', () => {
      const c = calcularCapacidade(ls, CAL, periodo, null)
      expect(c.horasPorDiaSegundos).toBe(8 * H)
      expect(c.leituraRelativa).toBe(true)
      expect(c.mensal).toHaveLength(2)
      expect(c.porPessoa.map((p) => p.pessoaRef)).toEqual(['p1', 'p2'])
    })
  })
})

// ---------- diário ----------
describe('mapa diário com faixas fixas', () => {
  it('faixas: zero, até 4 h, de 4 a 8 h e mais de 8 h; 4 h e 8 h ficam na faixa de baixo', () => {
    expect(faixaDoDia(0)).toBe('zero')
    expect(faixaDoDia(1)).toBe('ate-4h')
    expect(faixaDoDia(4 * H)).toBe('ate-4h')
    expect(faixaDoDia(4 * H + 1)).toBe('4h-a-8h')
    expect(faixaDoDia(8 * H)).toBe('4h-a-8h')
    expect(faixaDoDia(8 * H + 1)).toBe('mais-de-8h')
  })

  it('outra-area não tem linha no mapa diário (três pessoas de 6 h no mesmo dia)', () => {
    const ls = muitas(3, { pessoaRef: 'outra-area', data: '2026-09-04', segundos: 6 * H })
    const d = calcularDiario(
      ls,
      CAL,
      { de: '2026-09-04', ate: '2026-09-04' },
      10 * H,
      diasAtipicos(ls, 10 * H),
    )
    expect(d.linhas).toEqual([])
    expect(d.dias).toHaveLength(1)
  })

  it('uma coluna por dia (fim de semana e feriado marcados) e célula em todos os dias da pessoa', () => {
    const ls = [
      linha({ pessoaRef: 'p1', data: '2026-09-04', segundos: 3 * H }),
      linha({ pessoaRef: 'p1', data: '2026-09-04', segundos: 6 * H }), // 9 h no dia: mais de 8 h
      linha({ pessoaRef: 'p1', data: '2026-09-07', segundos: H }), // feriado
      linha({ pessoaRef: 'p2', data: '2026-09-05', segundos: 20 * H }), // sábado, atípico
      linha({ pessoaRef: null, data: '2026-09-04' }), // sem pessoa: sem linha
    ]
    const at = diasAtipicos(ls, 10 * H)
    const d = calcularDiario(ls, CAL, { de: '2026-09-04', ate: '2026-09-08' }, 10 * H, at)
    expect(d).toMatchObject({ de: '2026-09-04', ate: '2026-09-08', limiteAtipicoSegundos: 10 * H })
    expect(d.dias).toEqual([
      { data: '2026-09-04', util: true, feriado: false },
      { data: '2026-09-05', util: false, feriado: false },
      { data: '2026-09-06', util: false, feriado: false },
      { data: '2026-09-07', util: false, feriado: true },
      { data: '2026-09-08', util: true, feriado: false },
    ])
    expect(d.linhas.map((l) => l.pessoaRef)).toEqual(['p1', 'p2'])
    const [p1, p2] = d.linhas
    expect(p1?.segundos).toBe(10 * H)
    expect(p1?.celulas.map((c) => c.faixa)).toEqual([
      'mais-de-8h',
      'zero',
      'zero',
      'ate-4h',
      'zero',
    ])
    expect(p1?.celulas.every((c) => !c.atipico)).toBe(true)
    expect(p2?.celulas[1]).toEqual({
      data: '2026-09-05',
      segundos: 20 * H,
      faixa: 'mais-de-8h',
      atipico: true,
    })
  })

  it('janela de um dia e sem linhas', () => {
    const d = calcularDiario([], CAL, { de: '2026-09-01', ate: '2026-09-01' }, 10 * H, new Set())
    expect(d.dias).toHaveLength(1)
    expect(d.linhas).toEqual([])
  })
})

// ---------- achados ----------
describe('achados gerados por regra (limiares provisórios)', () => {
  const ok = (n: number, pct: number): PctComPiso => ({ status: 'ok', n, pct })
  const poucos = (n: number): PctComPiso => ({ status: 'insuficiente', n, minimo: 20 })
  const taxaOk = (k: number, n: number): Taxa => ({ status: 'ok', k, n, pct: (k / n) * 100 })
  const taxaPoucos = (k: number, n: number): Taxa => ({ status: 'insuficiente', k, n, minimo: 20 })
  const linhaDist = (id: string, rotulo: string, segundos: number, participacao = ok(40, 10)) => ({
    id,
    rotulo,
    segundos,
    apontamentos: 7,
    participacao,
  })
  const mes = (m: string, utilizacao = ok(30, 50)) => ({
    mes: m,
    capacidadeSegundos: 1,
    realizadoSegundos: 1,
    apontamentos: 30,
    utilizacao,
    parcialAte: null,
  })
  const base = (o: Record<string, unknown> = {}) => ({
    distribuicao: {
      base: { n: 40, unidade: 'apontamentos' as const },
      porProjeto: [linhaDist('1', 'Projeto X', 100, ok(40, 10))],
      porTipo: [],
      porSubgrupo: [linhaDist('nao-classificado', 'Sem comentário', 10, ok(40, 5))],
    },
    qualidade: {
      geral: {
        completos: taxaOk(20, 40),
        porFlag: [{ flag: 'sem-comentario' as FlagQualidade, apontamentos: 2, pct: ok(40, 5) }],
      },
      porPessoa: [],
      flagsNaoExcludentes: true as const,
    },
    capacidade: {
      horasPorDiaSegundos: 8 * H,
      mensal: [mes('2026-08'), mes('2026-09')],
      porPessoa: [],
      leituraRelativa: true as const,
    },
    diasAtipicos: 0,
    limiteAtipicoSegundos: 10 * H,
    ...o,
  })

  it('nada se destaca: nenhum achado', () => {
    expect(gerarAchados(base())).toEqual([])
  })

  it('cada regra dispara no limiar, com o rótulo citado (nunca pessoa) e os números', () => {
    const b = base({
      distribuicao: {
        base: { n: 40, unidade: 'apontamentos' },
        porProjeto: [
          linhaDist('2', 'Projeto menor', 10, ok(40, 25)),
          linhaDist('1', 'Projeto X', 100, ok(40, 50)),
        ],
        porTipo: [],
        porSubgrupo: [linhaDist('nao-classificado', 'Sem comentário', 10, ok(40, 20))],
      },
      qualidade: {
        geral: {
          completos: taxaOk(20, 40),
          porFlag: [{ flag: 'sem-comentario', apontamentos: 8, pct: ok(40, 20) }],
        },
        porPessoa: [],
        flagsNaoExcludentes: true,
      },
      capacidade: {
        horasPorDiaSegundos: 8 * H,
        mensal: [mes('2026-07'), mes('2026-08', ok(30, 40)), mes('2026-09', ok(30, 50))],
        porPessoa: [],
        leituraRelativa: true,
      },
      diasAtipicos: 3,
    })
    const a = gerarAchados(b)
    expect(a.map((x) => x.codigo)).toEqual([
      'nao-classificado-alto',
      'sem-comentario-alto',
      'concentracao-em-projeto',
      'dias-atipicos',
      'utilizacao-mensal-variou',
    ])
    expect(a[0]).toEqual({
      codigo: 'nao-classificado-alto',
      valores: { pct: 20, n: 7 },
      rotuloRef: 'Sem comentário',
    })
    expect(a[1]).toEqual({
      codigo: 'sem-comentario-alto',
      valores: { pct: 20, n: 8 },
      rotuloRef: null,
    })
    expect(a[2]).toEqual({
      codigo: 'concentracao-em-projeto',
      valores: { pct: 50 },
      rotuloRef: 'Projeto X',
    })
    expect(a[3]).toEqual({
      codigo: 'dias-atipicos',
      valores: { n: 3, limite: 10 },
      rotuloRef: null,
    })
    expect(a[4]).toEqual({
      codigo: 'utilizacao-mensal-variou',
      valores: { pctAnterior: 40, pct: 50, mesAnterior: '2026-08', mes: '2026-09' },
      rotuloRef: null,
    })
    for (const x of a) expect(achadoApontamentoSchema.safeParse(x).success).toBe(true)
  })

  it('achado com percentual não sai sem a base de 20 (piso)', () => {
    const b = base({
      distribuicao: {
        base: { n: 5, unidade: 'apontamentos' },
        porProjeto: [linhaDist('1', 'Projeto X', 100, poucos(5))],
        porTipo: [],
        porSubgrupo: [linhaDist('nao-classificado', 'Sem comentário', 10, poucos(5))],
      },
      qualidade: {
        geral: {
          completos: taxaPoucos(1, 5),
          porFlag: [{ flag: 'sem-comentario', apontamentos: 5, pct: poucos(5) }],
        },
        porPessoa: [],
        flagsNaoExcludentes: true,
      },
      capacidade: {
        horasPorDiaSegundos: 8 * H,
        mensal: [mes('2026-08', poucos(3)), mes('2026-09', ok(30, 99))],
        porPessoa: [],
        leituraRelativa: true,
      },
    })
    expect(gerarAchados(b)).toEqual([])
    // o mesmo vale para o mês anterior ok e o atual sem piso
    const c = base({
      capacidade: {
        horasPorDiaSegundos: 8 * H,
        mensal: [mes('2026-08', ok(30, 10)), mes('2026-09', poucos(4))],
        porPessoa: [],
        leituraRelativa: true,
      },
    })
    expect(gerarAchados(c)).toEqual([])
  })

  it('variação abaixo do limiar, um mês só ou nenhum: sem achado; limiares configuráveis', () => {
    const um = base({
      capacidade: {
        horasPorDiaSegundos: 8 * H,
        mensal: [mes('2026-09')],
        porPessoa: [],
        leituraRelativa: true,
      },
    })
    const nenhum = base({
      capacidade: { horasPorDiaSegundos: 8 * H, mensal: [], porPessoa: [], leituraRelativa: true },
    })
    expect(gerarAchados(um)).toEqual([])
    expect(gerarAchados(nenhum)).toEqual([])
    const pouca = base({
      capacidade: {
        horasPorDiaSegundos: 8 * H,
        mensal: [mes('2026-08', ok(30, 50)), mes('2026-09', ok(30, 59.9))],
        porPessoa: [],
        leituraRelativa: true,
      },
    })
    expect(gerarAchados(pouca)).toEqual([])
    expect(gerarAchados(pouca, { variacaoUtilizacaoPp: 5 }).map((a) => a.codigo)).toEqual([
      'utilizacao-mensal-variou',
    ])
    expect(gerarAchados(base({ diasAtipicos: 1 }), { diasAtipicos: 2 })).toEqual([])
    expect(LIMIARES_ACHADO_PADRAO.diasAtipicos).toBe(1)
  })

  it('queda de utilização também é variação (valor absoluto)', () => {
    const queda = base({
      capacidade: {
        horasPorDiaSegundos: 8 * H,
        mensal: [mes('2026-08', ok(30, 80)), mes('2026-09', ok(30, 60))],
        porPessoa: [],
        leituraRelativa: true,
      },
    })
    expect(gerarAchados(queda)[0]?.valores).toMatchObject({ pctAnterior: 80, pct: 60 })
  })

  it('sem o subgrupo, sem a flag e sem projeto no bloco: sem achado', () => {
    const vazio = base({
      distribuicao: {
        base: { n: 0, unidade: 'apontamentos' },
        porProjeto: [],
        porTipo: [],
        porSubgrupo: [],
      },
      qualidade: {
        geral: { completos: taxaPoucos(0, 0), porFlag: [] },
        porPessoa: [],
        flagsNaoExcludentes: true,
      },
    })
    expect(gerarAchados(vazio)).toEqual([])
  })
})

// ---------- orquestração ----------
describe('calcularApontamento (blocos da resposta)', () => {
  const calc = (ls = cenario(), o: Partial<EntradaApontamento> = {}) =>
    calcularApontamento(entrada(ls, o))

  it('KPIs: segundos, apontamentos, pessoas ativas (sem pessoa não conta), completos e atípicos', () => {
    const r = calc()
    expect(r.kpis).toMatchObject({
      segundos: 57 * H,
      apontamentos: 32,
      pessoasAtivas: 2,
      atipicos: 0,
    })
    expect(r.kpis.completos).toMatchObject({ status: 'ok', k: 22, n: 32 })
  })

  it('outra-area não é pessoa ativa: três pessoas de outra área no mesmo dia contam nas horas e não nas pessoas', () => {
    const ls = [
      ...muitas(3, { pessoaRef: 'outra-area', segundos: 6 * H }),
      linha({ pessoaRef: 'p1' }),
    ]
    const r = calc(ls)
    expect(r.kpis).toMatchObject({
      segundos: 19 * H,
      apontamentos: 4,
      pessoasAtivas: 1,
      atipicos: 0,
    })
    expect(r.achados.map((a) => a.codigo)).not.toContain('dias-atipicos')
  })

  it('pessoa sem apontamento atípico no recorte filtrado ainda é marcada pelo dia inteiro', () => {
    // p1 aponta 10 h + 10 h no mesmo dia: atípico; o filtro de tipo deixa só uma linha (10 h), ainda marcada
    const ls = [
      linha({ pessoaRef: 'p1', segundos: 10 * H, tipo: TAREFA }),
      linha({ pessoaRef: 'p1', segundos: 10 * H, tipo: BUG }),
    ]
    const r = calc(ls, { filtros: { anomalos: 'incluir', tipo: ['8'] } })
    expect(r.kpis.atipicos).toBe(1)
    expect(r.achados.map((a) => a.codigo)).toEqual(['dias-atipicos'])
    const oculto = calc(ls, { filtros: { anomalos: 'ocultar' } })
    expect(oculto.kpis).toMatchObject({ apontamentos: 0, atipicos: 0, segundos: 0 })
  })

  it('o recorte é o período; o mapa diário usa a própria janela e só o filtro de pessoa', () => {
    const ls = [
      linha({ pessoaRef: 'p1', data: '2026-08-31', tipo: BUG }),
      linha({ pessoaRef: 'p1', data: '2026-09-02', tipo: TAREFA }),
      linha({ pessoaRef: 'p2', data: '2026-09-02', tipo: TAREFA }),
    ]
    const r = calc(ls, {
      periodo: { de: '2026-09-01', ate: '2026-09-30' },
      diario: { de: '2026-08-31', ate: '2026-09-02' },
      filtros: { anomalos: 'incluir', pessoa: ['p1'], tipo: ['7'] },
    })
    expect(r.kpis.apontamentos).toBe(1) // só 02/09, só p1, só tipo 7
    expect(r.diario.linhas.map((l) => l.pessoaRef)).toEqual(['p1'])
    expect(r.diario.linhas[0]?.segundos).toBe(2 * H) // inclui 31/08 (tipo 8) e 02/09: ignora o filtro de tipo
    expect(r.diario.dias).toHaveLength(3)
  })

  it('outra-area (três pessoas de 6 h no mesmo dia) entra na distribuição, na matriz e nos totais; fica fora dos blocos por pessoa e dia', () => {
    const ls = [
      ...muitas(3, { pessoaRef: 'outra-area', segundos: 6 * H }),
      ...muitas(20, { pessoaRef: 'p1', data: '2026-09-02', segundos: H / 2 }),
    ]
    const r = calc(ls)
    expect(r.kpis).toMatchObject({
      segundos: 28 * H,
      apontamentos: 23,
      pessoasAtivas: 1,
      atipicos: 0,
    })
    expect(r.distribuicao.porProjeto.map((l) => l.segundos)).toEqual([28 * H])
    expect(r.matriz.linhas.map((l) => l.pessoaRef)).toEqual(['p1', 'outra-area'])
    expect(r.qualidade.geral.porFlag.find((f) => f.flag === 'valor-atipico')?.apontamentos).toBe(0)
    expect(r.qualidade.porPessoa.map((p) => p.pessoaRef)).toEqual(['p1'])
    expect(r.capacidade.porPessoa.map((p) => p.pessoaRef)).toEqual(['p1'])
    expect(r.capacidade.mensal.map((m) => m.realizadoSegundos)).toEqual([10 * H])
    expect(r.diario.linhas.map((l) => l.pessoaRef)).toEqual(['p1'])
    expect(r.achados.map((a) => a.codigo)).not.toContain('dias-atipicos')
  })

  it('o3: nenhuma estatística por pessoa abaixo de 20 apontamentos, em nenhum bloco', () => {
    const r = calc()
    const p2q = r.qualidade.porPessoa.find((p) => p.pessoaRef === 'p2')
    expect(p2q?.completos.status).toBe('insuficiente')
    const p2m = r.matriz.linhas.find((p) => p.pessoaRef === 'p2')
    expect(p2m?.celulas.every((c) => c.participacao.status === 'insuficiente')).toBe(true)
    const p2c = r.capacidade.porPessoa.find((p) => p.pessoaRef === 'p2')
    expect(p2c?.utilizacao.status).toBe('insuficiente')
    expect(r.capacidade.porPessoa.find((p) => p.pessoaRef === 'p1')?.utilizacao.status).toBe('ok')
  })

  it('o1: listas por pessoa em ordem neutra (alfabética com nomes), nunca por total', () => {
    const ls = [
      ...muitas(3, { pessoaRef: 'p1', segundos: 10 * H }), // maior total, rótulo "Zélia"
      ...muitas(1, { pessoaRef: 'p2' }),
      ...muitas(2, { pessoaRef: 'p3', segundos: 5 * H }),
    ]
    const pessoas: PessoaApontamento[] = [
      { pessoaRef: 'p1', rotulo: 'Zélia', identificada: true },
      { pessoaRef: 'p2', rotulo: 'Ana', identificada: true },
      { pessoaRef: 'p3', rotulo: 'Bruno', identificada: true },
    ]
    const nomes = calc(ls, { pessoas, nomesReais: true })
    const refs = (xs: { pessoaRef: string }[]) => xs.map((x) => x.pessoaRef)
    expect(refs(nomes.qualidade.porPessoa)).toEqual(['p2', 'p3', 'p1'])
    expect(refs(nomes.matriz.linhas)).toEqual(['p2', 'p3', 'p1'])
    expect(refs(nomes.capacidade.porPessoa)).toEqual(['p2', 'p3', 'p1'])
    expect(refs(nomes.diario.linhas)).toEqual(['p2', 'p3', 'p1'])
    const anonimo = calc(ls, { pessoas, nomesReais: false })
    expect(refs(anonimo.matriz.linhas)).toEqual(['p1', 'p2', 'p3'])
  })

  it('o2: nenhuma média, meta, faixa ou comparação por pessoa na saída', () => {
    const r = JSON.stringify(calc())
    expect(r).not.toMatch(/"(media|mediaEquipe|meta|semaforo|ranking|statusMeta|status_meta)":/i)
    expect(r).not.toMatch(/"(user_id|userId|usuario|comment|comentario|email|responsavel_id)":/i)
  })

  it('os blocos passam nos schemas do contrato', () => {
    const r = calc(cenario(), { ultimaColetaOk: '2026-09-20' })
    expect(kpisApontamentoSchema.safeParse(r.kpis).success).toBe(true)
    expect(distribuicaoApontamentoSchema.safeParse(r.distribuicao).success).toBe(true)
    expect(qualidadeApontamentoSchema.safeParse(r.qualidade).success).toBe(true)
    expect(matrizApontamentoSchema.safeParse(r.matriz).success).toBe(true)
    expect(capacidadeApontamentoSchema.safeParse(r.capacidade).success).toBe(true)
    expect(diarioApontamentoSchema.safeParse(r.diario).success).toBe(true)
    for (const a of r.achados) expect(achadoApontamentoSchema.safeParse(a).success).toBe(true)
  })

  it('recorte vazio (CA-2): blocos vazios e zerados', () => {
    const r = calc([])
    expect(r.kpis).toMatchObject({ segundos: 0, apontamentos: 0, pessoasAtivas: 0, atipicos: 0 })
    expect(r.achados).toEqual([])
    expect(r.matriz.linhas).toEqual([])
    expect(r.capacidade.mensal).toEqual([])
  })

  it('achados com limiares do chamador', () => {
    const tem = (r: ReturnType<typeof calc>) =>
      r.achados.some((a) => a.codigo === 'concentracao-em-projeto')
    expect(tem(calc())).toBe(true) // o Projeto A tem 91% das horas
    expect(tem(calc(cenario(), { limiares: { concentracaoPct: 95 } }))).toBe(false)
  })
})

// ---------- propriedades ----------
const pessoaArb = fc.constantFrom('p1', 'p2', 'p3', 'p4', null)
const diaArb = fc.integer({ min: 0, max: 60 }).map((i) => {
  const d = new Date(Date.UTC(2026, 7, 1 + i)) // 01/08 a 30/09
  return d.toISOString().slice(0, 10)
})
const flagsArb = fc.subarray(['sem-comentario', 'generico', 'sem-vinculo'] as FlagQualidade[])
const linhaArb: fc.Arbitrary<LinhaApontamento> = fc.record({
  pessoaRef: pessoaArb,
  data: diaArb,
  segundos: fc.integer({ min: 1, max: 12 * H }),
  tipo: fc.constantFrom(TAREFA, BUG),
  equipe: fc.constantFrom(TIME_A, TIME_B, SEM_TIME),
  projeto: fc.constantFrom(PROJ_A, PROJ_B),
  subgrupo: fc.constantFrom(TESTES, NAO_CLASS),
  subtarefa: fc.constantFrom(DIRETO, EM_SUB),
  semIniciativa: fc.boolean(),
  flags: flagsArb,
})
const OPCOES = { numRuns: 150, seed: 20261101 }
const FILTROS_ARB = fc.record(
  {
    pessoa: fc.subarray(['p1', 'p2', 'p3', 'p4']),
    tipo: fc.subarray(['7', '8']),
    qualidade: fc.subarray(['completo', 'generico', 'valor-atipico'] as const, { maxLength: 3 }),
    anomalos: fc.constantFrom('incluir', 'ocultar'),
  },
  { requiredKeys: ['anomalos'] },
)

describe('propriedades do cálculo da aba', () => {
  const rodar = (
    ls: LinhaApontamento[],
    filtros: EntradaApontamento['filtros'] = { anomalos: 'incluir' },
  ) =>
    calcularApontamento(
      entrada(ls, {
        periodo: { de: '2026-08-01', ate: '2026-09-30' },
        diario: { de: '2026-09-01', ate: '2026-09-30' },
        filtros,
        nivelMatriz: 'subgrupo',
      }),
    )

  it('as horas se conservam: projeto, tipo e subgrupo somam o total do recorte; matriz e diário somam as linhas', () => {
    fc.assert(
      fc.property(fc.array(linhaArb, { maxLength: 60 }), FILTROS_ARB, (ls, filtros) => {
        const r = rodar(ls, filtros)
        const total = r.kpis.segundos
        const soma = (xs: { segundos: number }[]) => xs.reduce((s, x) => s + x.segundos, 0)
        expect(soma(r.distribuicao.porProjeto)).toBe(total)
        expect(soma(r.distribuicao.porTipo)).toBe(total)
        expect(soma(r.distribuicao.porSubgrupo)).toBe(total)
        const comPessoa = soma(r.matriz.linhas)
        for (const l of r.matriz.linhas) {
          expect(l.celulas).toHaveLength(r.matriz.colunas.length)
          expect(soma(l.celulas)).toBe(l.segundos)
        }
        expect(comPessoa).toBeLessThanOrEqual(total)
        for (const l of r.diario.linhas) expect(soma(l.celulas)).toBe(l.segundos)
        expect(Number.isInteger(total)).toBe(true)
      }),
      OPCOES,
    )
  })

  it('a ordem de chegada das linhas não muda nada', () => {
    fc.assert(
      fc.property(fc.array(linhaArb, { maxLength: 40 }), (ls) => {
        expect(rodar([...ls].reverse())).toEqual(rodar(ls))
      }),
      OPCOES,
    )
  })

  it('o3: quem tem menos de 20 apontamentos nunca recebe percentual, em bloco nenhum', () => {
    fc.assert(
      fc.property(fc.array(linhaArb, { maxLength: 60 }), (ls) => {
        const r = rodar(ls)
        const sem = (p: { status: string }, n: number) =>
          n < 20 ? p.status === 'insuficiente' : p.status === 'ok'
        for (const p of r.qualidade.porPessoa) {
          expect(p.completos.status === 'ok').toBe(p.apontamentos >= 20)
          for (const f of p.porFlag) expect(sem(f.pct, p.apontamentos)).toBe(true)
        }
        for (const l of r.matriz.linhas)
          for (const c of l.celulas) expect(sem(c.participacao, l.apontamentos)).toBe(true)
        for (const p of r.capacidade.porPessoa) expect(sem(p.utilizacao, p.apontamentos)).toBe(true)
        for (const m of r.capacidade.mensal) expect(sem(m.utilizacao, m.apontamentos)).toBe(true)
      }),
      OPCOES,
    )
  })

  it('utilização = realizado ÷ capacidade (sem teto) e capacidade = dias úteis x jornada', () => {
    fc.assert(
      fc.property(fc.array(linhaArb, { maxLength: 80 }), (ls) => {
        const r = rodar(ls)
        for (const p of [...r.capacidade.porPessoa, ...r.capacidade.mensal]) {
          expect(p.capacidadeSegundos).toBeGreaterThan(0)
          expect(p.capacidadeSegundos % (8 * H)).toBe(0)
          if (p.utilizacao.status === 'ok')
            expect(p.utilizacao.pct).toBeCloseTo(
              (p.realizadoSegundos / p.capacidadeSegundos) * 100,
              9,
            )
        }
      }),
      OPCOES,
    )
  })

  it('todo bloco passa no contrato e nenhum achado cita pessoa', () => {
    fc.assert(
      fc.property(fc.array(linhaArb, { maxLength: 60 }), FILTROS_ARB, (ls, filtros) => {
        const r = rodar(ls, filtros)
        expect(kpisApontamentoSchema.safeParse(r.kpis).success).toBe(true)
        expect(distribuicaoApontamentoSchema.safeParse(r.distribuicao).success).toBe(true)
        expect(qualidadeApontamentoSchema.safeParse(r.qualidade).success).toBe(true)
        expect(matrizApontamentoSchema.safeParse(r.matriz).success).toBe(true)
        expect(capacidadeApontamentoSchema.safeParse(r.capacidade).success).toBe(true)
        expect(diarioApontamentoSchema.safeParse(r.diario).success).toBe(true)
        for (const a of r.achados) {
          expect(achadoApontamentoSchema.safeParse(a).success).toBe(true)
          expect(JSON.stringify(a)).not.toMatch(/"p\d+"|Pessoa/)
        }
      }),
      OPCOES,
    )
  })

  it('completos mais os apontamentos com alguma flag dão o total', () => {
    fc.assert(
      fc.property(fc.array(linhaArb, { maxLength: 60 }), (ls) => {
        const r = rodar(ls)
        const ats = diasAtipicos(ls, 10 * H)
        const noPeriodo = ls
        expect(r.kpis.completos.n).toBe(r.kpis.apontamentos)
        const comFlag = noPeriodo.filter((l) => flagsEfetivas(l, ats).length > 0).length
        expect(r.kpis.completos.k + comFlag).toBe(noPeriodo.length)
      }),
      OPCOES,
    )
  })
})
