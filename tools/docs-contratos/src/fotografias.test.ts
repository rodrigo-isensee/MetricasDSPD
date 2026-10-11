import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
  aceitasSchema,
  avaliarFotografias,
  classificar,
  contratosAceitos,
  paraJsonSchema,
} from './fotografias.ts'

const campos = (props: Record<string, unknown>, required: string[] = Object.keys(props)) => ({
  type: 'object',
  properties: props,
  required,
})
const texto = { type: 'string' }
const numero = { type: 'number' }

describe('paraJsonSchema', () => {
  it('gera JSON Schema de saída, sem $schema', () => {
    const j = paraJsonSchema(z.object({ a: z.string(), b: z.number().optional() }))
    expect(j).not.toHaveProperty('$schema')
    expect(j['required']).toEqual(['a'])
  })
})

describe('classificar', () => {
  it('igual não tem diferença', () => {
    expect(classificar(campos({ a: texto }), campos({ a: texto }))).toEqual({
      compativeis: [],
      incompativeis: [],
    })
  })

  it('campo novo opcional é compatível; novo obrigatório é incompatível', () => {
    const antigo = campos({ a: texto })
    expect(classificar(antigo, campos({ a: texto, b: numero }, ['a'])).compativeis).toEqual([
      '$.b: campo novo opcional',
    ])
    expect(classificar(antigo, campos({ a: texto, b: numero })).incompativeis).toEqual([
      '$.b: campo novo obrigatório',
    ])
  })

  it('remoção, troca de tipo e obrigatório virando opcional são incompatíveis; o inverso é compatível', () => {
    const antigo = campos({ a: texto, b: numero })
    expect(classificar(antigo, campos({ a: texto })).incompativeis).toEqual([
      '$.b: campo removido (ou renomeado)',
    ])
    expect(classificar(antigo, campos({ a: numero, b: numero })).incompativeis).toEqual([
      '$.a: tipo mudou de "string" para "number"',
    ])
    expect(classificar(antigo, campos({ a: texto, b: numero }, ['a'])).incompativeis).toEqual([
      '$.b: campo obrigatório virou opcional',
    ])
    expect(classificar(campos({ a: texto }, []), campos({ a: texto })).compativeis).toEqual([
      '$.a: campo opcional virou obrigatório',
    ])
  })

  it('enum: valor removido é incompatível, valor novo é compatível; enum que surge ou some também conta', () => {
    const e = (...v: string[]) => ({ type: 'string', enum: v })
    expect(classificar(e('a', 'b'), e('a')).incompativeis).toEqual([
      '$: valor "b" removido do enum',
    ])
    expect(classificar(e('a'), e('a', 'b')).compativeis).toEqual(['$: valor "b" novo no enum'])
    expect(classificar(texto, e('a')).compativeis).toEqual(['$: valor "a" novo no enum'])
    expect(classificar(e('a'), texto).incompativeis).toEqual(['$: valor "a" removido do enum'])
  })

  it('const: mudança de valor é incompatível', () => {
    expect(classificar({ const: 20 }, { const: 20 })).toEqual({
      compativeis: [],
      incompativeis: [],
    })
    expect(classificar({ const: 20 }, { const: 30 }).incompativeis).toEqual([
      '$: valor constante mudou',
    ])
  })

  it('listas: compara o item; uniões: compara variante a variante e acusa variante a mais ou a menos', () => {
    const lista = (item: unknown) => ({ type: 'array', items: item })
    expect(classificar(lista(texto), lista(numero)).incompativeis).toEqual([
      '$[]: tipo mudou de "string" para "number"',
    ])
    expect(classificar({ type: 'array' }, lista(texto)).incompativeis).toEqual([
      '$[]: schema mudou de forma',
    ])
    const uniao = (...v: unknown[]) => ({ anyOf: v })
    expect(classificar(uniao(texto, numero), uniao(texto, numero))).toEqual({
      compativeis: [],
      incompativeis: [],
    })
    expect(classificar(uniao(texto, numero), uniao(texto, texto)).incompativeis).toEqual([
      '$[1]: tipo mudou de "number" para "string"',
    ])
    expect(classificar(uniao(texto), uniao(texto, numero)).incompativeis).toEqual([
      '$: variantes da união mudaram',
    ])
    expect(classificar(texto, { oneOf: [texto] }).incompativeis).toEqual([
      '$: variantes da união mudaram',
    ])
    expect(classificar({ oneOf: [texto] }, texto).incompativeis).toEqual([
      '$: variantes da união mudaram',
    ])
  })

  it('valor que não é objeto: igual passa, diferente é mudança de forma', () => {
    expect(classificar(true, true).incompativeis).toEqual([])
    expect(classificar(true, false).incompativeis).toEqual(['$: schema mudou de forma'])
    expect(classificar(texto, [1]).incompativeis).toEqual(['$: schema mudou de forma'])
  })

  it('objeto novo sem properties no antigo trata como vazio (e vice-versa)', () => {
    expect(classificar({ type: 'object' }, campos({ a: texto }, [])).compativeis).toEqual([
      '$.a: campo novo opcional',
    ])
    expect(classificar(campos({ a: texto }, []), { type: 'object' }).incompativeis).toEqual([
      '$.a: campo removido (ou renomeado)',
    ])
  })

  it('type ausente nos dois lados e propriedades aninhadas', () => {
    expect(classificar({}, {})).toEqual({ compativeis: [], incompativeis: [] })
    const a = campos({ x: campos({ y: texto }) })
    const b = campos({ x: campos({ y: numero }) })
    expect(classificar(a, b).incompativeis).toEqual(['$.x.y: tipo mudou de "string" para "number"'])
  })
})

describe('avaliarFotografias', () => {
  const atual = campos({ a: texto })
  const entrada = (fotografia: unknown, nome = 'O9', schema: unknown = atual) => ({
    grupo: 'resultados',
    nome,
    atual: schema,
    fotografia,
  })

  it('sem problema quando a fotografia é igual', () => {
    expect(avaliarFotografias([entrada(atual)], new Set()).problemas).toEqual([])
  })

  it('acusa fotografia ausente, desatualizada (compatível) e incompatível', () => {
    expect(avaliarFotografias([entrada(undefined)], new Set()).problemas[0]).toContain(
      'sem fotografia',
    )
    const compat = avaliarFotografias(
      [entrada(campos({}, []), 'O9', campos({ a: texto }, []))],
      new Set(),
    ).problemas
    expect(compat[0]).toContain('desatualizada ($.a: campo novo opcional')
    const quebra = avaliarFotografias(
      [entrada(campos({ a: texto, b: texto }))],
      new Set(),
    ).problemas
    expect(quebra[0]).toContain('INCOMPATÍVEL')
    expect(quebra[0]).toContain('aceitas.json')
  })

  it('incompatibilidade aceita (v2 ou registro) vira só "desatualizada"; sem nada novo na diferença, "mudança aceita"', () => {
    const foto = campos({ a: texto, b: texto })
    const aceita = avaliarFotografias([entrada(foto)], new Set(['O9'])).problemas
    expect(aceita).toHaveLength(1)
    expect(aceita[0]).toContain('desatualizada (mudança aceita)')
  })
})

describe('contratosAceitos', () => {
  it('une aceitas.json, rotas /api/v2 de métricas e tipos de evento .vN', () => {
    const json = JSON.stringify({
      aceitas: [{ contrato: 'T1', motivo: 'campo renomeado a pedido', data: '2026-10-11' }],
    })
    const s = contratosAceitos(
      json,
      ['/api/v2/metricas/O9', '/api/v2/outra'],
      ['coleta.concluida.v2', 'bm.webhook.recebido'],
    )
    expect([...s].sort()).toEqual(['O9', 'T1', 'coleta.concluida'])
  })

  it('sem arquivo de aceites e sem v2, conjunto vazio; arquivo inválido é recusado', () => {
    expect(contratosAceitos(undefined, [], []).size).toBe(0)
    expect(() =>
      contratosAceitos('{"aceitas":[{"contrato":"x","motivo":"curto","data":"hoje"}]}', [], []),
    ).toThrow()
    expect(aceitasSchema.safeParse({ aceitas: [] }).success).toBe(true)
  })
})
