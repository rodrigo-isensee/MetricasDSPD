import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
  aceitasSchema,
  avaliarFotografias,
  classificar,
  canonico,
  hashMudanca,
  lerAceites,
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

  it('remoção, troca de tipo, obrigatório virando opcional e opcional virando obrigatório são incompatíveis', () => {
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
    // fora da política: conservador
    expect(classificar(campos({ a: texto }, []), campos({ a: texto })).incompativeis).toEqual([
      '$.a: campo opcional virou obrigatório (fora da política; conservador)',
    ])
  })

  it('enum: valor removido e valor novo (fora da política: conservador) são incompatíveis', () => {
    const e = (...v: string[]) => ({ type: 'string', enum: v })
    expect(classificar(e('a', 'b'), e('a')).incompativeis).toEqual([
      '$: valor "b" removido do enum',
    ])
    expect(classificar(e('a'), e('a', 'b')).incompativeis).toEqual([
      '$: valor "b" novo no enum (fora da política; conservador)',
    ])
    expect(classificar(e('a'), e('a', 'b')).compativeis).toEqual([])
    expect(classificar(texto, e('a')).incompativeis).toHaveLength(1)
    expect(classificar(e('a'), texto).incompativeis).toEqual(['$: valor "a" removido do enum'])
  })

  it('palavras-chave de validação novas ou alteradas na saída são incompatíveis, uma a uma', () => {
    const com = (extra: Record<string, unknown>) => ({ ...texto, ...extra })
    const casos: [string, unknown, unknown][] = [
      ['pattern', com({ pattern: '^a$' }), com({ pattern: '^b$' })],
      ['pattern', texto, com({ pattern: '^b$' })],
      ['format', com({ format: 'date' }), com({ format: 'uuid' })],
      ['minimum', { type: 'number', minimum: 20 }, { type: 'number', minimum: 1 }],
      ['maximum', { type: 'number', maximum: 19 }, { type: 'number', maximum: 99 }],
      ['maxItems', { type: 'array', maxItems: 3 }, { type: 'array', maxItems: 4 }],
      ['minLength', com({ minLength: 2 }), com({ minLength: 1 })],
    ]
    for (const [chave, a, n] of casos) {
      const r = classificar(a, n)
      expect(r.incompativeis, chave).toHaveLength(1)
      expect(r.incompativeis[0], chave).toContain(`palavra-chave ${chave} mudou`)
    }
    // dentro de um campo e de uma união (a palavra-chave não fica escondida)
    expect(
      classificar(
        campos({ n: { type: 'number', minimum: 20 } }),
        campos({ n: { type: 'number', minimum: 1 } }),
      ).incompativeis[0],
    ).toContain('$.n: palavra-chave minimum')
    expect(
      classificar({ anyOf: [texto], minimum: 1 }, { anyOf: [texto], minimum: 2 }).incompativeis,
    ).toHaveLength(1)
  })

  it('anotações (description, title, examples, $comment) não quebram', () => {
    expect(
      classificar(texto, {
        ...texto,
        description: 'x',
        title: 'y',
        examples: ['z'],
        $comment: 'w',
      }),
    ).toEqual({
      compativeis: [],
      incompativeis: [],
    })
  })

  it('record: tipo do valor (additionalProperties com schema) e strict x passthrough', () => {
    const rec = (v: unknown) => ({ type: 'object', propertyNames: texto, additionalProperties: v })
    expect(classificar(rec(texto), rec(texto)).incompativeis).toEqual([])
    expect(classificar(rec(texto), rec(numero)).incompativeis).toEqual([
      '${}: tipo mudou de "string" para "number"',
    ])
    const estrito = { ...campos({ a: texto }), additionalProperties: false }
    const livre = { ...campos({ a: texto }), additionalProperties: {} }
    expect(classificar(estrito, livre).incompativeis).toEqual([
      '$: additionalProperties mudou de false para {}',
    ])
    expect(classificar(estrito, campos({ a: texto })).incompativeis).toEqual([
      '$: additionalProperties mudou de false para null',
    ])
    expect(classificar(rec(texto), rec(true)).incompativeis).toHaveLength(1)
  })

  it('tupla (prefixItems): tipo de um elemento e tamanho', () => {
    const tupla = (...v: unknown[]) => ({ type: 'array', prefixItems: v })
    expect(classificar(tupla(texto, numero), tupla(texto, numero)).incompativeis).toEqual([])
    expect(classificar(tupla(texto, numero), tupla(texto, texto)).incompativeis).toEqual([
      '$[1]: tipo mudou de "number" para "string"',
    ])
    expect(classificar(tupla(texto), tupla(texto, numero)).incompativeis).toEqual([
      '$: itens da tupla mudaram',
    ])
    expect(classificar({ type: 'array' }, tupla(texto)).incompativeis).toEqual([
      '$: itens da tupla mudaram',
    ])
    expect(classificar(tupla(texto), { type: 'array' }).incompativeis).toEqual([
      '$: itens da tupla mudaram',
    ])
  })

  it('canonico não depende da ordem das chaves', () => {
    expect(canonico({ b: 1, a: [{ d: 1, c: undefined }] })).toBe(
      canonico({ a: [{ c: undefined, d: 1 }], b: 1 }),
    )
    expect(canonico(undefined)).toBe('null')
    expect(
      classificar({ type: 'object', x: { a: 1, b: 2 } }, { type: 'object', x: { b: 2, a: 1 } })
        .incompativeis,
    ).toEqual([])
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
  const quebrada = campos({ a: texto, b: texto })
  const aceite = (contrato: string, mudanca: string) => ({
    contrato,
    mudanca,
    motivo: 'campo removido a pedido',
    data: '2026-10-11',
  })

  it('sem problema quando a fotografia é igual (mesmo com chaves em outra ordem)', () => {
    expect(avaliarFotografias([entrada(atual)], []).problemas).toEqual([])
    expect(
      avaliarFotografias(
        [entrada({ required: ['a'], properties: { a: texto }, type: 'object' })],
        [],
      ).problemas,
    ).toEqual([])
  })

  it('acusa fotografia ausente, desatualizada (compatível ou só anotação) e incompatível, com o hash a registrar', () => {
    expect(avaliarFotografias([entrada(undefined)], []).problemas[0]).toContain('sem fotografia')
    const compat = avaliarFotografias(
      [entrada(campos({}, []), 'O9', campos({ a: texto }, []))],
      [],
    ).problemas
    expect(compat[0]).toContain('desatualizada ($.a: campo novo opcional')
    const nota = avaliarFotografias(
      [entrada(texto, 'O9', { ...texto, description: 'novo' })],
      [],
    ).problemas
    expect(nota[0]).toContain('desatualizada (só anotações)')
    const quebra = avaliarFotografias([entrada(quebrada)], []).problemas
    expect(quebra[0]).toContain('INCOMPATÍVEL')
    expect(quebra[0]).toContain('aceitas.json')
    expect(quebra[0]).toContain(hashMudanca(quebrada, atual))
  })

  it('o aceite vale só para a mudança concreta: outro hash, outro contrato ou outra mudança futura continuam barrados', () => {
    const hash = hashMudanca(quebrada, atual)
    const ok = avaliarFotografias([entrada(quebrada)], [aceite('resultados/O9', hash)]).problemas
    expect(ok).toHaveLength(1)
    expect(ok[0]).toContain('desatualizada (mudança aceita)')
    // contrato diferente com o mesmo hash
    expect(
      avaliarFotografias([entrada(quebrada)], [aceite('resultados/O1', hash)]).problemas[0],
    ).toContain('INCOMPATÍVEL')
    // mesmo contrato, mudança diferente (a quebra seguinte não herda o aceite anterior)
    const outra = campos({ a: texto, b: texto, c: texto })
    const r = avaliarFotografias([entrada(outra)], [aceite('resultados/O9', hash)]).problemas
    expect(r[0]).toContain('INCOMPATÍVEL')
    expect(r.some((p) => p.includes('aceite sem mudança incompatível pendente'))).toBe(true)
    // grupo diferente com o mesmo nome
    expect(
      avaliarFotografias(
        [{ ...entrada(quebrada), grupo: 'eventos' }],
        [aceite('resultados/O9', hash)],
      ).problemas[0],
    ).toContain('INCOMPATÍVEL')
  })

  it('aceite sem mudança pendente correspondente (já aplicada ou inexistente) é problema', () => {
    const hash = hashMudanca(quebrada, atual)
    const p = avaliarFotografias([entrada(atual)], [aceite('resultados/O9', hash)]).problemas
    expect(p).toHaveLength(1)
    expect(p[0]).toContain(
      `resultados/O9: aceite sem mudança incompatível pendente correspondente (mudanca ${hash})`,
    )
    expect(p[0]).not.toContain('INCOMPATÍVEL')
  })

  it('contrato removido (fotografia sem schema atual) é incompatível; só passa com o aceite da remoção', () => {
    const removida = { grupo: 'eventos', nome: 'x.y', atual: undefined, fotografia: atual }
    const r = avaliarFotografias([removida], []).problemas
    expect(r[0]).toContain('eventos/x.y: mudança INCOMPATÍVEL (contrato removido)')
    const hash = hashMudanca(atual, undefined)
    expect(r[0]).toContain(hash)
    expect(hash).toBe(hashMudanca(atual, null))
    const ok = avaliarFotografias([removida], [aceite('eventos/x.y', hash)]).problemas
    expect(ok[0]).toContain('desatualizada (mudança aceita)')
  })
})

describe('lerAceites', () => {
  it('lê o arquivo; ausente é lista vazia; entrada sem contrato qualificado, hash ou data válidos é recusada', () => {
    const h = 'a'.repeat(64)
    const bom = {
      contrato: 'resultados/T1',
      mudanca: h,
      motivo: 'campo renomeado a pedido',
      data: '2026-10-11',
    }
    expect(lerAceites(JSON.stringify({ aceitas: [bom] }))).toEqual([bom])
    expect(lerAceites(undefined)).toEqual([])
    for (const ruim of [
      { ...bom, contrato: 'T1' },
      { ...bom, mudanca: 'abc' },
      { ...bom, motivo: 'curto' },
      { ...bom, data: 'hoje' },
    ])
      expect(() => lerAceites(JSON.stringify({ aceitas: [ruim] }))).toThrow()
    expect(aceitasSchema.safeParse({ aceitas: [] }).success).toBe(true)
  })
})
