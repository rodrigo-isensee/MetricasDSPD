import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
  SCHEMAS_TAMBEM_FASE1,
  baseAmostralSchema,
  criteriosSchema,
  estatisticaSchema,
  marcacaoCriterioSchema,
  percentisSchema,
  resultadoO2,
  taxaSchema,
  METRICA_IDS,
  paradosSchema,
  type CodigoTambemFase1,
} from '.'

const janela = { inicio: '2026-07-01', fim: '2026-09-30' }
const comum = {
  base: { n: 30, unidade: 'cards', janela },
  criterios: { serie: [], janela: [] },
}
const taxaOk = { status: 'ok', k: 5, n: 30, pct: 16.7 }
const taxaPouca = { status: 'insuficiente', k: 2, n: 8, minimo: 20 }
const duracaoOk = {
  status: 'ok',
  n: 25,
  valor: { p50: 2, p85: 5, p95: 8 },
  janela,
}
const duracaoPouca = { status: 'insuficiente', n: 4, minimo: 20, janela }
const marcacao = { id: 'v1', data: '2026-10-01', descricao: 'critério' }

/** Um exemplo válido por código, o mais próximo do que o cálculo vai devolver. */
const EXEMPLOS: Record<CodigoTambemFase1, unknown> = {
  O19: {
    ...comum,
    motivos: [
      {
        motivo: 'Aguardando fornecedor',
        bloqueios: 3,
        diasUteis: 12,
        pctDoTotal: taxaPouca,
        duracao: duracaoPouca,
      },
    ],
    abertosForaDaSoma: 1,
    totalDiasUteis: 12,
  },
  O20: {
    ...comum,
    agrupamento: 'coluna',
    faixas: [{ chave: 'c1', rotulo: 'Análise', ordem: 1, tipoColuna: 'fila' }],
    dias: [{ dia: '2026-07-01', contagens: [3] }],
    destaque: { faixa: 'c1', de: 2, para: 7 },
    mudancasCriterio: [marcacao],
  },
  O21: {
    ...comum,
    entregas: taxaOk,
    matriz: { eixo: 'papel', celulas: [{ origem: 'Execução', destino: 'Fila', retornos: 4 }] },
    reaberturas: 2,
    comparacao: { tipo: 'Melhoria', com: duracaoOk, sem: duracaoPouca },
  },
  O24: {
    ...comum,
    inicios: taxaOk,
    meses: [{ mes: '2026-09', emOrdem: 10, foraDeOrdem: 3, emAndamento: false }],
    marcacoes: [marcacao],
    custo: { tipo: 'Melhoria', estatistica: duracaoOk },
    grupo: 'equipe-tipo-padrao',
  },
  O25: {
    ...comum,
    encerrados: taxaOk,
    meses: [{ mes: '2026-09', taxa: taxaOk, emAndamento: true }],
    marcacoes: [],
    consumido: {
      antesDoInicio: { itens: 2 },
      depoisDoInicio: { itens: 3, diasUteis: 14, estatistica: duracaoPouca },
    },
    instanteAproximado: { itens: 1 },
    avisoPreenchimento: { itens: 0 },
    porMotivo: null,
  },
  T10: {
    ...comum,
    fornecedores: [
      { fornecedor: 'Fornecedor A', bloqueios: 6, diasUteis: 30, duracao: duracaoPouca },
    ],
    totalDiasUteis: 30,
  },
  T11: {
    ...comum,
    anos: [{ ano: 2026, meses: [{ mes: 1, entradas: 12, emAndamento: false }] }],
    marcacoes: [],
    mesesComDado: 9,
    mediaMensal: null,
    historicoCurto: true,
  },
  T12: { ...comum, total: taxaOk, areas: [{ area: 'Financeiro', taxa: taxaPouca }] },
  E7: {
    ...comum,
    total: 40,
    sistemas: [
      {
        sistema: 'ERP',
        entregas: 25,
        participacao: taxaOk,
        porNatureza: [{ natureza: 'Evolução', taxa: taxaPouca }],
        custoRateado: null,
        custoPorDemanda: null,
      },
    ],
    custoConfigurado: false,
  },
  E9: {
    ...comum,
    projetos: [
      {
        cardId: 'P-1',
        codigo: 'PRJ-1',
        titulo: 'Projeto',
        criadoEm: '2026-05-04',
        tipo: 'Iniciativa',
        idadeDiasUteis: 90,
        faixa: '61 a 90',
      },
    ],
    segmentoPor: 'tipo',
    referenciasP85: [
      { tipo: 'Iniciativa', referenciaP85: { status: 'insuficiente', n: 3, minimo: 20, janela } },
      { tipo: 'Melhoria', referenciaP85: { status: 'insuficiente', n: 0, minimo: 20, janela } },
    ],
  },
}

const CODIGOS = Object.keys(SCHEMAS_TAMBEM_FASE1) as CodigoTambemFase1[]

/** Nomes que identificam pessoa ou comparam times: proibidos em qualquer contrato (briefing 7.1, P-T6). */
const NOME_DE_PESSOA =
  /respons[aá]vel|responsaveis|usuario|usu[aá]rio|pessoa|autor|owner|assignee|agente|analista|desenvolvedor|^e-?mail$|user_?id|ranking|equipe|quadro|^times?$|^time_?id|por_?times?|nome_?time/i

function primeiroObjetoDeLista(v: unknown): Record<string, unknown> | undefined {
  if (Array.isArray(v)) {
    for (const i of v) {
      if (typeof i === 'object' && i !== null && !Array.isArray(i))
        return i as Record<string, unknown>
    }
    return undefined
  }
  if (v !== null && typeof v === 'object') {
    for (const x of Object.values(v)) {
      const r = primeiroObjetoDeLista(x)
      if (r !== undefined) return r
    }
  }
  return undefined
}

function nomesDeCampo(js: unknown, out: string[] = []): string[] {
  if (Array.isArray(js)) for (const x of js) nomesDeCampo(x, out)
  else if (js !== null && typeof js === 'object') {
    const o = js as Record<string, unknown>
    if (o.properties !== null && typeof o.properties === 'object') {
      out.push(...Object.keys(o.properties))
    }
    for (const v of Object.values(o)) nomesDeCampo(v, out)
  }
  return out
}

/** Conjuntos de chaves dos objetos dos schemas compartilhados (taxa, estatística etc.), que não são `strict`. */
function conjuntosDeChaves(js: unknown, out: Set<string> = new Set()): Set<string> {
  if (Array.isArray(js)) for (const x of js) conjuntosDeChaves(x, out)
  else if (js !== null && typeof js === 'object') {
    const o = js as Record<string, unknown>
    if (o.properties !== null && typeof o.properties === 'object')
      out.add(Object.keys(o.properties).sort().join(','))
    for (const v of Object.values(o)) conjuntosDeChaves(v, out)
  }
  return out
}

function objetosAbertos(js: unknown, ignorar: Set<string>, out: string[] = []): string[] {
  if (Array.isArray(js)) for (const x of js) objetosAbertos(x, ignorar, out)
  else if (js !== null && typeof js === 'object') {
    const o = js as Record<string, unknown>
    if (o.properties !== null && typeof o.properties === 'object') {
      const chaves = Object.keys(o.properties).sort().join(',')
      if (o.additionalProperties !== false && !ignorar.has(chaves)) out.push(chaves)
    }
    for (const v of Object.values(o)) objetosAbertos(v, ignorar, out)
  }
  return out
}

const jsonDe = (schema: z.ZodType) =>
  z.toJSONSchema(schema, { io: 'output', unrepresentable: 'any' })

describe('contratos da fase 1 do pedido 011 (B1)', () => {
  it.each(CODIGOS)('%s: aceita o exemplo válido', (codigo) => {
    const r = SCHEMAS_TAMBEM_FASE1[codigo].safeParse(EXEMPLOS[codigo])
    expect(r.error?.issues).toBeUndefined()
    expect(r.success).toBe(true)
  })

  it.each(CODIGOS)('%s: rejeita campo extra no topo', (codigo) => {
    const r = SCHEMAS_TAMBEM_FASE1[codigo].safeParse({
      ...(EXEMPLOS[codigo] as object),
      extra: 1,
    })
    expect(r.success).toBe(false)
  })

  it.each(CODIGOS)('%s: rejeita campo com nome de pessoa no topo', (codigo) => {
    for (const nome of ['responsaveis', 'usuario', 'pessoa', 'equipe']) {
      const r = SCHEMAS_TAMBEM_FASE1[codigo].safeParse({
        ...(EXEMPLOS[codigo] as object),
        [nome]: ['x'],
      })
      expect(r.success, `${codigo} aceitou "${nome}"`).toBe(false)
    }
  })

  it.each(CODIGOS)('%s: rejeita campo de pessoa em objeto aninhado', (codigo) => {
    const ex = structuredClone(EXEMPLOS[codigo]) as Record<string, unknown>
    // primeiro item de lista de objetos, em qualquer profundidade (O21: matriz.celulas[0])
    const alvo = primeiroObjetoDeLista(ex)
    expect(alvo, `${codigo} sem lista de objetos no exemplo`).toBeDefined()
    if (alvo === undefined) return
    alvo.responsavel = 'fulano'
    expect(SCHEMAS_TAMBEM_FASE1[codigo].safeParse(ex).success).toBe(false)
  })

  it('o conjunto cobre exatamente os 10 resultados da fase 1; só entram em METRICA_IDS os que já têm cálculo', () => {
    expect(CODIGOS).toEqual(['O19', 'O20', 'O21', 'O24', 'O25', 'T10', 'T11', 'T12', 'E7', 'E9'])
    // Cada id entra com o seu cálculo: B3 trouxe O19 e T10, B4 o T12, B5 o E7 e o E9; os demais entram nos cartões seguintes.
    const comCalculo = ['O19', 'T10', 'T12', 'E7', 'E9']
    for (const c of CODIGOS)
      expect(METRICA_IDS as readonly string[], c).toSatisfy(
        (ids: readonly string[]) => ids.includes(c) === comCalculo.includes(c),
      )
  })

  describe('trava de pessoa (P-T6, ata 2026-10-14)', () => {
    it.each(CODIGOS)(
      '%s: nenhum campo com nome de pessoa ou de comparação entre times',
      (codigo) => {
        const ruins = nomesDeCampo(jsonDe(SCHEMAS_TAMBEM_FASE1[codigo])).filter((n) =>
          NOME_DE_PESSOA.test(n),
        )
        expect(ruins).toEqual([])
      },
    )

    it('o detector pega nome de pessoa (a trava não é vacuosa)', () => {
      const comPessoa = z.object({
        itens: z.array(z.object({ responsaveis: z.array(z.string()) })),
      })
      expect(nomesDeCampo(jsonDe(comPessoa)).filter((n) => NOME_DE_PESSOA.test(n))).toEqual([
        'responsaveis',
      ])
      for (const n of [
        'usuario',
        'usuarioKey',
        'ownerId',
        'equipe',
        'porEquipe',
        'equipeId',
        'nomeEquipe',
        'quadro',
        'quadroId',
        'timeId',
        'porTime',
        'autorDoComentario',
        'email',
      ])
        expect(NOME_DE_PESSOA.test(n), n).toBe(true)
      for (const n of [
        'sistema',
        'fornecedor',
        'motivo',
        'area',
        'titulo',
        'tempo',
        'cardId',
        'timestamp',
      ])
        expect(NOME_DE_PESSOA.test(n), n).toBe(false)
    })

    it.each(CODIGOS)('%s: todo objeto próprio é strict', (codigo) => {
      const compartilhados = [
        baseAmostralSchema,
        criteriosSchema,
        marcacaoCriterioSchema,
        taxaSchema,
        estatisticaSchema(percentisSchema),
      ]
      const ignorar = new Set<string>()
      for (const s of compartilhados) conjuntosDeChaves(jsonDe(s), ignorar)
      expect(objetosAbertos(jsonDe(SCHEMAS_TAMBEM_FASE1[codigo]), ignorar)).toEqual([])
    })
  })

  describe('regras de contrato dos ajustes da ata', () => {
    it('T10 não tem prazo nem status (D-10 = A, CA-36)', () => {
      const nomes = nomesDeCampo(jsonDe(SCHEMAS_TAMBEM_FASE1.T10))
      for (const n of ['prazoDiasUteis', 'prazoFornecedor']) expect(nomes).not.toContain(n)
      const fornecedor = (EXEMPLOS.T10 as { fornecedores: object[] }).fornecedores[0]
      for (const n of ['prazoDiasUteis', 'prazoFornecedor'])
        expect(
          SCHEMAS_TAMBEM_FASE1.T10.safeParse({
            ...(EXEMPLOS.T10 as object),
            fornecedores: [{ ...fornecedor, [n]: 5 }],
          }).success,
        ).toBe(false)
      expect(
        SCHEMAS_TAMBEM_FASE1.T10.safeParse({ ...(EXEMPLOS.T10 as object), status: 'dentro' })
          .success,
      ).toBe(false)
    })

    it('E7 aceita custo nulo e valorado, e custoPorDemanda existe (CA-35)', () => {
      const ex = EXEMPLOS.E7 as { sistemas: Record<string, unknown>[] }
      const com = {
        ...ex,
        custoConfigurado: true,
        sistemas: [{ ...ex.sistemas[0], custoRateado: 1000, custoPorDemanda: 40 }],
      }
      expect(SCHEMAS_TAMBEM_FASE1.E7.safeParse(com).success).toBe(true)
      expect(
        SCHEMAS_TAMBEM_FASE1.E7.safeParse({
          ...ex,
          sistemas: [{ ...ex.sistemas[0], custoRateado: undefined }],
        }).success,
      ).toBe(false)
    })

    it('O25 aceita porMotivo preenchido e exige o aviso de preenchimento e o instante aproximado', () => {
      const ex = EXEMPLOS.O25 as Record<string, unknown>
      expect(
        SCHEMAS_TAMBEM_FASE1.O25.safeParse({
          ...ex,
          porMotivo: [{ motivo: 'Duplicado', itens: 2 }],
        }).success,
      ).toBe(true)
      for (const campo of ['avisoPreenchimento', 'instanteAproximado', 'porMotivo']) {
        const { [campo]: _fora, ...resto } = ex
        expect(SCHEMAS_TAMBEM_FASE1.O25.safeParse(resto).success, campo).toBe(false)
      }
    })

    it('séries devolvem marcacoes (O24, O25, T11) e o O20 devolve mudancasCriterio', () => {
      for (const c of ['O24', 'O25', 'T11'] as const) {
        const { marcacoes: _m, ...sem } = EXEMPLOS[c] as Record<string, unknown>
        expect(SCHEMAS_TAMBEM_FASE1[c].safeParse(sem).success, c).toBe(false)
      }
      const { mudancasCriterio: _m, ...sem } = EXEMPLOS.O20 as Record<string, unknown>
      expect(SCHEMAS_TAMBEM_FASE1.O20.safeParse(sem).success).toBe(false)
    })

    it("O24 só aceita o grupo equipe-tipo-padrao (D-6' = A)", () => {
      expect(
        SCHEMAS_TAMBEM_FASE1.O24.safeParse({ ...(EXEMPLOS.O24 as object), grupo: 'urgente' })
          .success,
      ).toBe(false)
    })

    it('não publica taxa com n abaixo de 20 (herda taxaSchema)', () => {
      expect(
        SCHEMAS_TAMBEM_FASE1.T12.safeParse({
          ...(EXEMPLOS.T12 as object),
          total: { status: 'ok', k: 2, n: 8, pct: 25 },
        }).success,
      ).toBe(false)
    })
  })

  describe('ResultadoO2.parados (O23, ADR 0007)', () => {
    const parados = {
      limiteDiasUteis: 5,
      taxa: taxaPouca,
      porEtapa: [{ etapa: 'Execução', k: 2 }],
    }
    it('o bloco é válido, strict e sem pessoa', () => {
      expect(paradosSchema.safeParse(parados).success).toBe(true)
      expect(paradosSchema.safeParse({ ...parados, responsaveis: [] }).success).toBe(false)
      expect(nomesDeCampo(jsonDe(paradosSchema)).filter((n) => NOME_DE_PESSOA.test(n))).toEqual([])
    })
    it('é obrigatório no O2 desde o B2', () => {
      const campo = resultadoO2.shape.parados
      expect(campo.safeParse(undefined).success).toBe(false)
      expect(campo.safeParse(parados).success).toBe(true)
    })
  })
})
