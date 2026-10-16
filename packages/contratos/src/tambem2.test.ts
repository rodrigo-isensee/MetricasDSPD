import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
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
  resultadoE8,
  type CodigoTambemFase2,
} from '.'
import { SCHEMAS_RESULTADO } from './validacao'

/** Contratos da fase 2 do pedido 011 (E1 e E2): E6 e E8. Mesmas travas da fase 1. */
const janela = { inicio: '2026-07-01', fim: '2026-09-30' }
const comum = {
  base: { n: 30, unidade: 'cards', janela },
  criterios: { serie: [], janela: [] },
}
const taxaPouca = { status: 'insuficiente', k: 2, n: 8, minimo: 20 }

const EXEMPLOS: Record<CodigoTambemFase2, unknown> = {
  E6: {
    ...comum,
    projetos: [
      { cardId: 'P-1', codigo: 'P-1', titulo: 'Projeto', deslizeDiasUteis: -3, replanejamentos: 1 },
    ],
    semData: 2,
    naData: taxaPouca,
    deslize: { status: 'insuficiente', n: 12, minimo: 20, janela },
  },
  E8: {
    ...comum,
    janelaMeses: 12,
    sistemasComEntrega: 8,
    faixas: { uma: 2, duas: 3, tresOuMais: 3 },
    recortePequeno: false,
  },
}
const CODIGOS = Object.keys(SCHEMAS_TAMBEM_FASE2) as CodigoTambemFase2[]

/** Nomes que identificam pessoa ou comparam times. */
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
  it('os dois códigos da fase 2, os dez da fase 1 e a união com 12 ids novos em METRICA_IDS', () => {
    expect(CODIGOS).toEqual(['E6', 'E8'])
    expect(Object.keys(SCHEMAS_TAMBEM)).toHaveLength(12)
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
    const alvo =
      primeiroObjetoDeLista(ex) ??
      (codigo === 'E8' ? (ex.faixas as Record<string, unknown>) : undefined)
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
    it('E8, R-1 = B: sem lista de sistemas, sem nome de sistema e sem número de pessoas', () => {
      const nomes = nomesDeCampo(jsonDe(resultadoE8))
      for (const n of ['sistemasUmaPessoa', 'sistemas', 'pessoas', 'sistema'])
        expect(nomes).not.toContain(n)
      expect(
        resultadoE8.safeParse({ ...(EXEMPLOS.E8 as object), sistemasUmaPessoa: [] }).success,
      ).toBe(false)
      expect(
        resultadoE8.safeParse({ ...(EXEMPLOS.E8 as object), faixas: null, recortePequeno: true })
          .success,
      ).toBe(true)
      expect(
        resultadoE8.safeParse({
          ...(EXEMPLOS.E8 as object),
          faixas: { uma: 1, duas: 1, tresOuMais: 1, quatro: 1 },
        }).success,
      ).toBe(false)
    })

    it('E6: deslize é inteiro (dia útil) e pode ser negativo; a lista de pontos não traz pessoa', () => {
      const ex = EXEMPLOS.E6 as { projetos: Record<string, unknown>[] }
      const fracao = structuredClone(ex)
      fracao.projetos[0]!.deslizeDiasUteis = 1.5
      expect(SCHEMAS_TAMBEM_FASE2.E6.safeParse(fracao).success).toBe(false)
    })
  })
})
