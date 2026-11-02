import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
  CODIGOS_ACHADO,
  FAIXAS_DIARIO,
  FLAGS_QUALIDADE,
  NIVEIS_MATRIZ,
  VERSAO_CONTRATO_APONTAMENTO,
  achadoApontamentoSchema,
  consultaApontamentoSchema,
  pctComPisoSchema,
  PESSOA_OUTRA_AREA,
  pessoaRefSchema,
  respostaApontamentoSchema,
  type RespostaApontamento,
} from './index'

// Fixture sintética: pessoas fictícias ("Pessoa 1", "Pessoa 2"), nenhum nome real.
const ok = (n: number, pct: number) => ({ status: 'ok' as const, n, pct })
const pouco = (n: number) => ({ status: 'insuficiente' as const, n, minimo: 20 as const })

function resposta(): RespostaApontamento {
  return {
    versaoContrato: 1,
    dominio: 'businessmap',
    periodo: { de: '2026-08-01', ate: '2026-09-30' },
    frescor: { selo: 'atual', ultimaColetaOk: '2026-09-30T06:00:00-03:00' },
    nomesReais: false,
    opcoes: {
      pessoas: [
        { pessoaRef: 'p1', rotulo: 'Pessoa 1', identificada: true },
        { pessoaRef: 'p2', rotulo: 'Pessoa 2', identificada: false },
      ],
      projetos: [{ id: '100', rotulo: 'Projeto A', foraDoEscopo: false }],
      tipos: [{ id: '7', rotulo: 'Tarefa' }],
      subtarefas: [{ id: 'em-subtarefa', rotulo: 'Em subtarefa' }],
      subgrupos: [{ id: 'testes', rotulo: 'Testes' }],
      historico: { inicio: '2025-10-01', fim: '2026-09-30' },
    },
    kpis: {
      segundos: 72000,
      apontamentos: 30,
      pessoasAtivas: 2,
      completos: { status: 'ok', k: 20, n: 30, pct: 66.6 },
      atipicos: 0,
    },
    distribuicao: {
      base: { n: 30, unidade: 'apontamentos' },
      porProjeto: [
        {
          id: '100',
          rotulo: 'Projeto A',
          segundos: 72000,
          apontamentos: 30,
          participacao: ok(30, 100),
          foraDoEscopo: false,
        },
      ],
      porTipo: [],
      porSubgrupo: [],
    },
    qualidade: {
      geral: {
        completos: { status: 'insuficiente', k: 1, n: 5, minimo: 20 },
        porFlag: [{ flag: 'generico', apontamentos: 3, pct: pouco(5) }],
      },
      porPessoa: [
        {
          pessoaRef: 'p1',
          apontamentos: 5,
          completos: { status: 'insuficiente', k: 1, n: 5, minimo: 20 },
          porFlag: [],
        },
      ],
      flagsNaoExcludentes: true,
    },
    matriz: {
      nivel: 'tipo',
      colunas: [{ id: '7', rotulo: 'Tarefa' }],
      linhas: [
        {
          pessoaRef: 'p1',
          segundos: 3600,
          apontamentos: 1,
          celulas: [{ colunaId: '7', segundos: 3600, participacao: pouco(1) }],
        },
      ],
    },
    capacidade: {
      horasPorDiaSegundos: 28800,
      mensal: [
        {
          mes: '2026-09',
          capacidadeSegundos: 576000,
          realizadoSegundos: 72000,
          apontamentos: 30,
          utilizacao: ok(30, 12.5),
          parcialAte: '2026-09-30',
        },
      ],
      porPessoa: [
        {
          pessoaRef: 'p1',
          inicio: '2026-09-01',
          fim: '2026-09-30',
          diasUteis: 21,
          capacidadeSegundos: 604800,
          realizadoSegundos: 72000,
          apontamentos: 30,
          utilizacao: ok(30, 11.9),
        },
      ],
      leituraRelativa: true,
    },
    diario: {
      de: '2026-09-02',
      ate: '2026-09-03',
      limiteAtipicoSegundos: 57600,
      dias: [
        { data: '2026-09-02', util: true, feriado: false },
        { data: '2026-09-03', util: true, feriado: false },
      ],
      linhas: [
        {
          pessoaRef: 'p1',
          segundos: 7200,
          celulas: [{ data: '2026-09-02', segundos: 7200, faixa: 'ate-4h', atipico: false }],
        },
      ],
    },
    achados: [
      { codigo: 'concentracao-em-projeto', valores: { pct: 80 }, rotuloRef: 'Projeto A' },
      { codigo: 'dias-atipicos', valores: { n: 2, limite: 16 }, rotuloRef: null },
    ],
    criterios: [{ id: 'dic-v1', data: '2026-11-02', descricao: 'Dicionário v1' }],
  }
}

/** Varredura recursiva das chaves de um JSON Schema (CA-AP-5). */
function chaves(node: unknown, acc = new Set<string>()): Set<string> {
  if (Array.isArray(node)) node.forEach((n) => chaves(n, acc))
  else if (node && typeof node === 'object')
    for (const [k, v] of Object.entries(node)) {
      acc.add(k)
      chaves(v, acc)
    }
  return acc
}

describe('contrato da aba Apontamento (plano 059, §3.9)', () => {
  it('versão 1 e domínio só BusinessMap', () => {
    expect(VERSAO_CONTRATO_APONTAMENTO).toBe(1)
    expect(respostaApontamentoSchema.parse(resposta()).dominio).toBe('businessmap')
    expect(
      respostaApontamentoSchema.safeParse({ ...resposta(), dominio: 'acelerato' }).success,
    ).toBe(false)
    expect(respostaApontamentoSchema.safeParse({ ...resposta(), versaoContrato: 2 }).success).toBe(
      false,
    )
  })

  it('resposta válida passa e a vazia (CA-2) também', () => {
    expect(respostaApontamentoSchema.safeParse(resposta()).success).toBe(true)
    const vazia = resposta()
    vazia.kpis = { ...vazia.kpis, apontamentos: 0, segundos: 0, pessoasAtivas: 0 }
    vazia.achados = []
    vazia.distribuicao.porProjeto = []
    vazia.qualidade.porPessoa = []
    vazia.matriz.linhas = []
    vazia.capacidade.mensal = []
    vazia.capacidade.porPessoa = []
    vazia.diario.linhas = []
    expect(respostaApontamentoSchema.safeParse(vazia).success).toBe(true)
  })

  it('campo extra em qualquer nível é recusado (strict), inclusive os de identidade', () => {
    for (const extra of ['user_id', 'responsavel_id', 'comentario', 'comment', 'email']) {
      const topo = { ...resposta(), [extra]: 'x' }
      expect(respostaApontamentoSchema.safeParse(topo).success, extra).toBe(false)
      const fundo = resposta()
      Object.assign(fundo.opcoes.pessoas[0] as object, { [extra]: 'x' })
      expect(respostaApontamentoSchema.safeParse(fundo).success, extra).toBe(false)
      const linha = resposta()
      Object.assign(linha.matriz.linhas[0] as object, { [extra]: 'x' })
      expect(respostaApontamentoSchema.safeParse(linha).success, extra).toBe(false)
    }
  })

  it('o schema não tem campo de identidade, comentário, meta, faixa de utilização nem média por pessoa (CA-AP-5, o2)', () => {
    const nomes = chaves(z.toJSONSchema(respostaApontamentoSchema, { io: 'output' }))
    for (const proibido of [
      'user_id',
      'userId',
      'usuario',
      'responsavel_id',
      'responsavelId',
      'comment',
      'comentario',
      'email',
      'realname',
      'meta',
      'status_meta',
      'semaforo',
      'media',
      'mediaEquipe',
      'ranking',
    ])
      expect(nomes.has(proibido), proibido).toBe(false)
  })

  it('pessoaRef é `p` mais inteiro positivo, sem relação com id do BusinessMap', () => {
    for (const bom of ['p1', 'p42', 'p123456789'])
      expect(pessoaRefSchema.safeParse(bom).success, bom).toBe(true)
    for (const ruim of ['', 'p0', 'p', '1', 'P1', 'p01', 'p1234567890', 'Maria', 'p1,p2'])
      expect(pessoaRefSchema.safeParse(ruim).success, ruim).toBe(false)
  })

  it('`outra-area` é a única chave fixa aceita (soma de quem não é do time); variações não passam', () => {
    expect(PESSOA_OUTRA_AREA).toBe('outra-area')
    expect(pessoaRefSchema.safeParse('outra-area').success).toBe(true)
    for (const ruim of ['Outra-area', 'outra-area ', 'outra_area', 'outra-area2', 'outra área'])
      expect(pessoaRefSchema.safeParse(ruim).success, ruim).toBe(false)
  })

  it('percentual com piso de 20 (o3): ok exige n >= 20, insuficiente exige n < 20 e não carrega pct', () => {
    expect(pctComPisoSchema.safeParse(ok(20, 10)).success).toBe(true)
    expect(pctComPisoSchema.safeParse(ok(19, 10)).success).toBe(false)
    expect(pctComPisoSchema.safeParse(pouco(19)).success).toBe(true)
    expect(pctComPisoSchema.safeParse(pouco(0)).success).toBe(true)
    expect(pctComPisoSchema.safeParse(pouco(20)).success).toBe(false)
    expect(pctComPisoSchema.safeParse({ ...pouco(5), pct: 50 }).success).toBe(false)
    expect(pctComPisoSchema.safeParse(ok(25, -1)).success).toBe(false)
  })

  it('utilização acima de 100% é válida (sem teto)', () => {
    const r = resposta()
    r.capacidade.porPessoa[0]!.utilizacao = ok(40, 130)
    expect(respostaApontamentoSchema.safeParse(r).success).toBe(true)
  })

  it('listas fechadas do contrato', () => {
    expect(FLAGS_QUALIDADE).toEqual([
      'sem-comentario',
      'generico',
      'sem-vinculo',
      'sem-iniciativa',
      'valor-atipico',
    ])
    expect(NIVEIS_MATRIZ).toEqual(['tipo', 'subtarefa', 'subgrupo'])
    expect(FAIXAS_DIARIO).toEqual(['zero', 'ate-4h', '4h-a-8h', 'mais-de-8h'])
    expect(CODIGOS_ACHADO).toHaveLength(5)
  })
})

describe('achados: `valores` é união discriminada por `codigo` (chaves do documento de textos do UX)', () => {
  const casos: Record<(typeof CODIGOS_ACHADO)[number], Record<string, unknown>> = {
    'nao-classificado-alto': { pct: 31.5, n: 40 },
    'sem-comentario-alto': { pct: 12, n: 9 },
    'concentracao-em-projeto': { pct: 77 },
    'dias-atipicos': { n: 3, limite: 16 },
    'utilizacao-mensal-variou': {
      pctAnterior: 40,
      pct: 55,
      mesAnterior: '2026-08',
      mes: '2026-09',
    },
  }

  it('cada código aceita exatamente as suas chaves', () => {
    for (const codigo of CODIGOS_ACHADO)
      expect(
        achadoApontamentoSchema.safeParse({ codigo, valores: casos[codigo], rotuloRef: null })
          .success,
        codigo,
      ).toBe(true)
  })

  it('chave faltando, sobrando ou de outro código é recusada', () => {
    for (const codigo of CODIGOS_ACHADO) {
      const bom = casos[codigo]
      for (const chave of Object.keys(bom)) {
        const sem = Object.fromEntries(Object.entries(bom).filter(([k]) => k !== chave))
        expect(
          achadoApontamentoSchema.safeParse({ codigo, valores: sem, rotuloRef: null }).success,
          `${codigo} sem ${chave}`,
        ).toBe(false)
      }
      expect(
        achadoApontamentoSchema.safeParse({
          codigo,
          valores: { ...bom, extra: 1 },
          rotuloRef: null,
        }).success,
        `${codigo} com extra`,
      ).toBe(false)
    }
    expect(
      achadoApontamentoSchema.safeParse({
        codigo: 'dias-atipicos',
        valores: casos['nao-classificado-alto'],
        rotuloRef: null,
      }).success,
    ).toBe(false)
  })

  it('código desconhecido, rotuloRef ausente e mês malformado são recusados', () => {
    expect(
      achadoApontamentoSchema.safeParse({ codigo: 'novo', valores: {}, rotuloRef: null }).success,
    ).toBe(false)
    expect(
      achadoApontamentoSchema.safeParse({ codigo: 'dias-atipicos', valores: { n: 1, limite: 16 } })
        .success,
    ).toBe(false)
    expect(
      achadoApontamentoSchema.safeParse({
        codigo: 'utilizacao-mensal-variou',
        valores: { ...casos['utilizacao-mensal-variou'], mes: '2026-13' },
        rotuloRef: null,
      }).success,
    ).toBe(false)
  })
})

describe('consulta de GET /api/apontamento (CA-AP-6: estrita e sem eco)', () => {
  const q = (o: Record<string, unknown>) => consultaApontamentoSchema.safeParse(o)

  it('vazia: aplica os padrões', () => {
    const r = consultaApontamentoSchema.parse({})
    expect(r.nivelMatriz).toBe('tipo')
    expect(r.anomalos).toBe('incluir')
    expect(r.pessoa).toBeUndefined()
  })

  it('listas por vírgula viram arrays; vazio vira lista vazia; array passa direto', () => {
    const r = consultaApontamentoSchema.parse({
      pessoa: 'p1,p2',
      projeto: '10,20',
      tipo: '',
      subgrupo: 'testes',
      qualidade: 'completo,generico',
      subtarefa: ['em-subtarefa'],
    })
    expect(r.pessoa).toEqual(['p1', 'p2'])
    expect(r.projeto).toEqual(['10', '20'])
    expect(r.tipo).toEqual([])
    expect(r.qualidade).toEqual(['completo', 'generico'])
    expect(r.subtarefa).toEqual(['em-subtarefa'])
  })

  it('chave desconhecida, pessoa com nome e valores fora do domínio são 400', () => {
    expect(q({ nome: 'x' }).success).toBe(false)
    expect(q({ pessoa: 'Maria' }).success).toBe(false)
    expect(q({ pessoa: 'p1,Maria' }).success).toBe(false)
    expect(q({ projeto: 'abc' }).success).toBe(false)
    expect(q({ qualidade: 'otima' }).success).toBe(false)
    expect(q({ nivelMatriz: 'pessoa' }).success).toBe(false)
    expect(q({ anomalos: 'talvez' }).success).toBe(false)
    expect(
      q({ pessoa: Array.from({ length: 201 }, (_, i) => `p${String(i + 1)}`).join(',') }).success,
    ).toBe(false)
  })

  it('datas: formato, existência e janelas', () => {
    expect(q({ de: '2026-01-01', ate: '2026-12-31' }).success).toBe(true)
    expect(q({ de: '2026-01-01', ate: '2027-01-01' }).success).toBe(true) // 366 dias, o máximo
    expect(q({ de: '2026-01-01', ate: '2027-01-02' }).success).toBe(false) // 367 dias
    expect(q({ de: '2024-01-01', ate: '2024-12-31' }).success).toBe(true) // ano bissexto: 366 dias
    expect(q({ de: '2026-02-30', ate: '2026-03-01' }).success).toBe(false)
    expect(q({ de: '01/02/2026', ate: '2026-03-01' }).success).toBe(false)
    expect(q({ de: '2026-03-02', ate: '2026-03-01' }).success).toBe(false)
    expect(q({ de: '2026-03-01' }).success).toBe(false)
    expect(q({ ate: '2026-03-01' }).success).toBe(false)
    expect(q({ diarioDe: '2026-08-01', diarioAte: '2026-10-01' }).success).toBe(true) // 62 dias, o máximo
    expect(q({ diarioDe: '2026-08-01', diarioAte: '2026-10-02' }).success).toBe(false) // 63 dias
    expect(q({ diarioDe: '2026-08-01' }).success).toBe(false)
  })

  it('a mensagem de erro nunca repete o valor recebido', () => {
    const casos: Record<string, unknown>[] = [
      { pessoa: 'MariaSecreta' },
      { de: '2026-02-30', ate: '2026-03-01' },
      { de: '2026-03-02', ate: '2026-03-01' },
      { de: '2020-01-01', ate: '2026-03-01' },
      { qualidade: 'segredo' },
    ]
    for (const c of casos) {
      const r = q(c)
      expect(r.success).toBe(false)
      if (!r.success) {
        const texto = JSON.stringify(r.error.issues.map((i) => i.message))
        for (const v of Object.values(c)) expect(texto).not.toContain(String(v))
      }
    }
  })
})

describe('A5 e A6 do parecer 059-alfa: rótulos de pessoa fixos sem nomes reais e teto de tamanho', () => {
  const comPessoas = (nomesReais: boolean, rotulos: string[]) => {
    const r = resposta()
    r.nomesReais = nomesReais
    r.opcoes.pessoas = rotulos.map((rotulo, i) => ({
      pessoaRef: `p${i + 1}`,
      rotulo,
      identificada: true,
    }))
    return r
  }

  it('A5: com nomesReais falso aceita Pessoa n, Pessoa não identificada e Outra área', () => {
    const r = comPessoas(false, ['Pessoa 1', 'Pessoa 12', 'Pessoa não identificada', 'Outra área'])
    expect(respostaApontamentoSchema.safeParse(r).success).toBe(true)
  })

  it.each([
    'Maria Silva',
    'pessoa 1',
    'Pessoa 0',
    'Pessoa 1 ',
    'Pessoa',
    'Pessoa x',
    'Outra area',
    'Pessoa 1234567890',
  ])('A5: com nomesReais falso recusa o rótulo %j, sem repeti-lo no erro', (rotulo) => {
    const r = respostaApontamentoSchema.safeParse(comPessoas(false, [rotulo]))
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error.issues[0]?.path).toEqual(['opcoes', 'pessoas', 0, 'rotulo'])
      expect(JSON.stringify(r.error.issues)).not.toContain(rotulo.trim() || 'x@@')
    }
  })

  it('A5: com nomesReais verdadeiro o rótulo é livre (até 200 caracteres)', () => {
    expect(respostaApontamentoSchema.safeParse(comPessoas(true, ['Maria Silva'])).success).toBe(
      true,
    )
    expect(respostaApontamentoSchema.safeParse(comPessoas(true, ['x'.repeat(201)])).success).toBe(
      false,
    )
  })

  it('A6: rótulo de opção e de linha de distribuição tem teto de 200 caracteres', () => {
    const longo = 'x'.repeat(201)
    const base = resposta()
    expect(respostaApontamentoSchema.safeParse(base).success).toBe(true)
    for (const campo of ['projetos', 'tipos', 'subtarefas', 'subgrupos'] as const) {
      const r = resposta()
      const opcao =
        campo === 'projetos'
          ? { id: 'a', rotulo: 'x'.repeat(200), foraDoEscopo: false }
          : { id: 'a', rotulo: 'x'.repeat(200) }
      ;(r.opcoes[campo] as unknown[]) = [opcao]
      expect(respostaApontamentoSchema.safeParse(r).success, campo).toBe(true)
      ;(r.opcoes[campo] as unknown[]) = [{ ...opcao, rotulo: longo }]
      expect(respostaApontamentoSchema.safeParse(r).success, campo).toBe(false)
    }
    const l = resposta()
    const linha = {
      id: 'a',
      rotulo: 'x'.repeat(200),
      segundos: 3600,
      apontamentos: 1,
      participacao: { status: 'insuficiente' as const, n: 1, minimo: 20 as const },
    }
    l.distribuicao.porProjeto = [linha]
    expect(respostaApontamentoSchema.safeParse(l).success).toBe(true)
    l.distribuicao.porProjeto = [{ ...linha, rotulo: longo }]
    expect(respostaApontamentoSchema.safeParse(l).success).toBe(false)
    l.distribuicao.porProjeto = []
    l.distribuicao.porTipo = [{ ...linha, rotulo: longo }]
    expect(respostaApontamentoSchema.safeParse(l).success).toBe(false)
    l.distribuicao.porTipo = []
    l.distribuicao.porSubgrupo = [{ ...linha, rotulo: longo }]
    expect(respostaApontamentoSchema.safeParse(l).success).toBe(false)
  })
})
