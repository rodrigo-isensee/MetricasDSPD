import { resolve } from 'node:path'
import { METRICA_IDS } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { CATALOGO_EVENTOS, EXEMPLOS_EVENTOS } from '@metricas-dspd/server/eventos'
import { describe, expect, it } from 'vitest'
import { conferirFotografias, conferirGerados } from './gerador.ts'
import { criarIo } from './fs-io.ts'
import { z } from 'zod'
import { carregarInsumos, descreverParametro, exigirValido, parametrosDe } from './insumos.ts'

const RAIZ = resolve(import.meta.dirname, '../../..')
const insumos = carregarInsumos(RAIZ)

describe('descreverParametro', () => {
  it('lê tipo, enum, padrão e formato; união de tipos; parâmetro sem schema', () => {
    expect(
      descreverParametro({
        name: 'p',
        required: true,
        schema: { type: 'string', enum: ['a', 'b'], default: 'a', format: 'date' },
      }),
    ).toEqual({
      nome: 'p',
      tipo: 'string',
      obrigatorio: true,
      detalhe: 'valores: a, b; padrão: a; formato: date',
    })
    expect(
      descreverParametro({ name: 'q', schema: { anyOf: [{ type: 'string' }, { type: 'null' }] } }),
    ).toEqual({
      nome: 'q',
      tipo: 'string | null',
      obrigatorio: false,
      detalhe: '',
    })
    expect(descreverParametro({ name: 'r' })).toEqual({
      nome: 'r',
      tipo: '',
      obrigatorio: false,
      detalhe: '',
    })
  })
})

describe('exigirValido e parametrosDe', () => {
  it('exemplo fora do schema derruba a geração, sem vazar mais que o resumo do erro', () => {
    const schema = z.object({ a: z.string(), b: z.object({ c: z.number() }) })
    expect(() => exigirValido('X', schema, { a: 1, b: { c: 'x' } })).toThrow(
      /^X: mudança INCOMPATÍVEL[\s\S]*\n {2}- a: [\s\S]*\n {2}- b\.c: [\s\S]*\/api\/v2/,
    )
    expect(() => exigirValido('X', z.string(), 1)).toThrow('  - (raiz): ')
    const muitos = z.object(
      Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`k${i}`, z.string()])),
    )
    expect(() => exigirValido('X', muitos, {})).toThrow(/k9: [\s\S]*\nAjuste/)
    try {
      exigirValido('X', muitos, {})
    } catch (e) {
      expect((e as Error).message).not.toContain('k10')
    }
    expect(() => exigirValido('X', z.string(), 'ok')).not.toThrow()
  })

  it('rota ausente é erro; rota sem parâmetros devolve lista vazia', () => {
    const openapi = { paths: { '/a': { get: {} }, '/b': { get: { parameters: [{ name: 'x' }] } } } }
    expect(() => parametrosDe(openapi, '/z')).toThrow('ausente do OpenAPI')
    expect(parametrosDe(openapi, '/a')).toEqual([])
    expect(parametrosDe(openapi, '/b')).toHaveLength(1)
  })
})

describe('carregarInsumos (repositório real)', () => {
  it('uma entrada por MetricaId, com rota, regra, schema e exemplo válidos', () => {
    expect(insumos.metricas.map((m) => m.id)).toEqual([...METRICA_IDS])
    for (const m of insumos.metricas) {
      expect(m.rota).toBe(`/api/v1/metricas/${m.id}`)
      expect(m.schema).toBeTypeOf('object')
      if (m.id !== 'VISAO_GERAL') expect(m.parametros.length, m.id).toBeGreaterThan(0)
    }
  })

  it('todo exemplo de resposta e de evento passa no schema (contrato)', () => {
    for (const m of insumos.metricas)
      expect(
        SCHEMAS_RESULTADO[m.id as keyof typeof SCHEMAS_RESULTADO].safeParse(m.exemplo).success,
        m.id,
      ).toBe(true)
    for (const [tipo, schema] of Object.entries(CATALOGO_EVENTOS)) {
      expect(
        schema.safeParse((EXEMPLOS_EVENTOS as Record<string, unknown>)[tipo]).success,
        tipo,
      ).toBe(true)
    }
  })

  it('filtros por domínio: fluxo, sustentação (sem tipo) e visão geral (sem filtros)', () => {
    const por = (id: string) => insumos.metricas.find((m) => m.id === id)!
    expect(por('O12').filtrosAplicaveis).toEqual(['equipe', 'sistema', 'periodo'])
    expect(por('O12').filtrosDoDominio).toEqual(['equipe', 'tipo', 'sistema', 'periodo'])
    expect(por('S1').filtrosDoDominio).toEqual(['equipe', 'prioridade', 'periodo'])
    expect(por('S1').filtrosAplicaveis).toEqual(['equipe', 'prioridade', 'periodo'])
    expect(por('VISAO_GERAL').filtrosDoDominio).toEqual([])
    expect(por('VISAO_GERAL').filtrosAplicaveis).toEqual([])
    expect(por('O9').cartoes.map((c) => c.id)).toEqual(['o9'])
    expect(por('EI_FL1').cartoes[0]!.id).toBe('ei-fl1')
  })

  it('eventos do catálogo entram com JSON Schema estrito', () => {
    expect(insumos.eventos.map((e) => e.tipo)).toEqual(['coleta.concluida', 'bm.webhook.recebido'])
    expect(insumos.eventos[0]!.schema).toMatchObject({
      type: 'object',
      additionalProperties: false,
    })
  })
})

describe('contratos versionados em dia (gerado = versionado, como o openapi:verificar)', () => {
  const io = criarIo(RAIZ)

  it('as páginas geradas (métricas, índice e 03-agregados) coincidem com o código', () => {
    expect(conferirGerados(io, insumos)).toEqual([])
  })

  it('as fotografias coincidem e nenhuma mudança incompatível está pendente de registro', () => {
    expect(conferirFotografias(io, insumos)).toEqual([])
  })
})
