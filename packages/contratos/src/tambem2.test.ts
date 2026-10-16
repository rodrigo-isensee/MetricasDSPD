import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
  FAIXAS_PASSAGENS,
  FAIXAS_PRIMEIRO_TOQUE,
  METRICA_IDS,
  SCHEMAS_TAMBEM,
  SCHEMAS_TAMBEM_FASE1,
  SCHEMAS_TAMBEM_FASE2,
  baseAmostralSchema,
  criteriosSchema,
  estatisticaSchema,
  marcacaoCriterioSchema,
  percentisSchema,
  taxaSchema,
  resultadoO26,
  type CodigoTambemFase2,
} from '.'
import { SCHEMAS_RESULTADO } from './validacao'

/** Contratos da fase 2 do pedido 011 (E1 e E2): O22, O26, T13 e E6. Mesmas travas da fase 1. */
const janela = { inicio: '2026-07-01', fim: '2026-09-30' }
const comum = {
  base: { n: 30, unidade: 'cards', janela },
  criterios: { serie: [], janela: [] },
}
const taxaOk = { status: 'ok', k: 10, n: 40, pct: 25 }
const taxaPouca = { status: 'insuficiente', k: 2, n: 8, minimo: 20 }
const duracaoOk = { status: 'ok', n: 25, valor: { p50: 2, p85: 5, p95: 8 }, janela }
const duracaoPouca = { status: 'insuficiente', n: 4, minimo: 20, janela }

const EXEMPLOS: Record<CodigoTambemFase2, unknown> = {
  O22: {
    ...comum,
    segmentoPor: 'tipo',
    porTipo: [
      {
        tipo: 'Requisição',
        distribuicao: duracaoOk,
        histograma: FAIXAS_PRIMEIRO_TOQUE.map((faixa) => ({ faixa, itens: 4 })),
        semToque: { itens: 2, maisAntigoDiasUteis: 9 },
      },
      {
        tipo: 'Melhoria',
        distribuicao: duracaoPouca,
        histograma: null,
        semToque: { itens: 0, maisAntigoDiasUteis: null },
      },
    ],
  },
  O26: {
    ...comum,
    segmentoPor: 'tipo',
    porTipo: [
      {
        tipo: 'Melhoria',
        entregas: 40,
        semDado: 3,
        faixas: FAIXAS_PASSAGENS.map((faixa) => ({
          faixa,
          itens: 8,
          pct: taxaOk,
          cicloP85: { status: 'ok', n: 25, valor: { p85: 7 }, janela },
        })),
      },
    ],
  },
  T13: {
    ...comum,
    segmentoPor: 'tipo',
    porGranularidade: [
      {
        granularidade: 'story',
        entregas: taxaOk,
        semDado: 1,
        comparacoes: [
          { tipo: 'Melhoria', com: duracaoOk, sem: duracaoPouca, grupoAbaixoDoMinimo: 'sem' },
        ],
      },
      { granularidade: 'frente', entregas: taxaPouca, semDado: 0, comparacoes: [] },
    ],
  },
  E6: {
    ...comum,
    projetos: [
      { cardId: 'P-1', codigo: 'P-1', titulo: 'Projeto', deslizeDiasUteis: -3, replanejamentos: 1 },
    ],
    semData: 2,
    naData: taxaPouca,
    deslize: { status: 'insuficiente', n: 12, minimo: 20, janela },
  },
}
const CODIGOS = Object.keys(SCHEMAS_TAMBEM_FASE2) as CodigoTambemFase2[]

/** Nomes que identificam pessoa ou comparam times: proibidos em qualquer contrato (briefing 7.1, P-T6). */
const NOME_DE_PESSOA =
  /respons[aá]vel|responsaveis|usuario|usu[aá]rio|pessoa|autor|owner|assignee|agente|analista|desenvolvedor|^e-?mail$|user_?id|ranking|equipe|quadro|^times?$|^time_?id|por_?times?|nome_?time/i

function nomesDeCampo(js: unknown, out: string[] = []): string[] {
  if (Array.isArray(js)) for (const x of js) nomesDeCampo(x, out)
  else if (js !== null && typeof js === 'object') {
    const o = js as Record<string, unknown>
    if (o.properties !== null && typeof o.properties === 'object')
      out.push(...Object.keys(o.properties))
    for (const v of Object.values(o)) nomesDeCampo(v, out)
  }
  return out
}
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
function primeiroObjetoDeLista(v: unknown): Record<string, unknown> | undefined {
  if (Array.isArray(v)) {
    for (const i of v)
      if (typeof i === 'object' && i !== null && !Array.isArray(i))
        return i as Record<string, unknown>
    return undefined
  }
  if (v !== null && typeof v === 'object')
    for (const x of Object.values(v)) {
      const r = primeiroObjetoDeLista(x)
      if (r !== undefined) return r
    }
  return undefined
}
const jsonDe = (schema: z.ZodType) =>
  z.toJSONSchema(schema, { io: 'output', unrepresentable: 'any' })

describe('contratos da fase 2 do pedido 011', () => {
  it('os quatro códigos da fase 2 (E1), os dez da fase 1 e a união com 14 ids novos em METRICA_IDS', () => {
    expect(CODIGOS).toEqual(['O22', 'O26', 'T13', 'E6'])
    expect(Object.keys(SCHEMAS_TAMBEM)).toHaveLength(14)
    for (const c of Object.keys(SCHEMAS_TAMBEM_FASE1)) expect(c in SCHEMAS_TAMBEM_FASE2).toBe(false)
    for (const c of Object.keys(SCHEMAS_TAMBEM)) {
      expect(METRICA_IDS as readonly string[], c).toContain(c)
      expect(c in SCHEMAS_RESULTADO, c).toBe(true)
    }
  })

  it.each(CODIGOS)(
    '%s: aceita o exemplo válido, no schema do SCHEMAS_RESULTADO também',
    (codigo) => {
      const r = SCHEMAS_TAMBEM_FASE2[codigo].safeParse(EXEMPLOS[codigo])
      expect(r.error?.issues).toBeUndefined()
      expect(SCHEMAS_RESULTADO[codigo].safeParse(EXEMPLOS[codigo]).success).toBe(true)
    },
  )

  it.each(CODIGOS)(
    '%s: rejeita campo extra e campo com nome de pessoa ou de outro time no topo',
    (codigo) => {
      for (const nome of [
        'extra',
        'responsaveis',
        'usuario',
        'pessoa',
        'porEquipe',
        'equipes',
        'ranking',
      ]) {
        const r = SCHEMAS_TAMBEM_FASE2[codigo].safeParse({
          ...(EXEMPLOS[codigo] as object),
          [nome]: ['x'],
        })
        expect(r.success, `${codigo} aceitou "${nome}"`).toBe(false)
      }
    },
  )

  it.each(CODIGOS)('%s: rejeita campo de pessoa em objeto aninhado', (codigo) => {
    const ex = structuredClone(EXEMPLOS[codigo]) as Record<string, unknown>
    const alvo = primeiroObjetoDeLista(ex)
    expect(alvo, `${codigo} sem objeto aninhado no exemplo`).toBeDefined()
    if (alvo === undefined) return
    alvo.responsavel = 'fulano'
    expect(SCHEMAS_TAMBEM_FASE2[codigo].safeParse(ex).success).toBe(false)
  })

  describe('trava de pessoa e de comparação entre times', () => {
    it.each(CODIGOS)(
      '%s: nenhum campo com nome de pessoa ou de comparação entre times',
      (codigo) => {
        const ruins = nomesDeCampo(jsonDe(SCHEMAS_TAMBEM_FASE2[codigo])).filter((n) =>
          NOME_DE_PESSOA.test(n),
        )
        expect(ruins).toEqual([])
      },
    )

    it.each(CODIGOS)('%s: todo objeto próprio é strict', (codigo) => {
      const ignorar = new Set<string>()
      for (const s of [
        baseAmostralSchema,
        criteriosSchema,
        marcacaoCriterioSchema,
        taxaSchema,
        estatisticaSchema(percentisSchema),
      ])
        conjuntosDeChaves(jsonDe(s), ignorar)
      expect(objetosAbertos(jsonDe(SCHEMAS_TAMBEM_FASE2[codigo]), ignorar)).toEqual([])
    })
  })

  describe('regras de cada contrato', () => {
    it('O26: faixa só 0, 1, 2, 3 ou 4+; P85 e percentual só com 20 ou mais', () => {
      const ex = structuredClone(EXEMPLOS.O26) as {
        porTipo: { faixas: Record<string, unknown>[] }[]
      }
      ex.porTipo[0]!.faixas[0]!.faixa = '5'
      expect(resultadoO26.safeParse(ex).success).toBe(false)
      const ok = structuredClone(EXEMPLOS.O26) as {
        porTipo: { faixas: Record<string, unknown>[] }[]
      }
      ok.porTipo[0]!.faixas[0]!.cicloP85 = { status: 'ok', n: 12, valor: { p85: 3 }, janela }
      expect(resultadoO26.safeParse(ok).success).toBe(false)
      ok.porTipo[0]!.faixas[0]!.cicloP85 = duracaoPouca
      expect(resultadoO26.safeParse(ok).success).toBe(true)
      ok.porTipo[0]!.faixas[0]!.pct = { status: 'ok', k: 3, n: 19, pct: 15.8 }
      expect(resultadoO26.safeParse(ok).success).toBe(false)
    })

    it('O22: histograma nulo abaixo de 20 e as faixas fixas da especificação', () => {
      expect(FAIXAS_PRIMEIRO_TOQUE).toEqual(['0–0,5', '0,5–1', '1–2', '2–5', '5–10', '10+'])
      expect(FAIXAS_PASSAGENS).toEqual(['0', '1', '2', '3', '4+'])
      const ex = EXEMPLOS.O22 as { porTipo: unknown[] }
      expect(SCHEMAS_TAMBEM_FASE2.O22.safeParse(ex).success).toBe(true)
    })

    it('T13: só o booleano agregado: sem quadro, sem card relacionado e sem equipe do outro lado', () => {
      const nomes = nomesDeCampo(jsonDe(SCHEMAS_TAMBEM_FASE2.T13))
      for (const n of [
        'quadro',
        'quadroRelacionado',
        'relacionadoId',
        'outroQuadro',
        'equipe',
        'cardRelacionado',
      ])
        expect(nomes).not.toContain(n)
    })

    it('E6: deslize é inteiro (dia útil) e pode ser negativo; a lista de pontos não traz pessoa', () => {
      const ex = EXEMPLOS.E6 as { projetos: Record<string, unknown>[] }
      const fracao = structuredClone(ex)
      fracao.projetos[0]!.deslizeDiasUteis = 1.5
      expect(SCHEMAS_TAMBEM_FASE2.E6.safeParse(fracao).success).toBe(false)
    })
  })
})
