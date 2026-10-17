import fc from 'fast-check'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { contarPassagens, houveTroca } from './index'

const S = (...ids: string[]) => new Set(ids)
const AQUI = dirname(fileURLToPath(import.meta.url))
const fonte = (rel: string) => readFileSync(join(AQUI, rel), 'utf8')

const conjunto = fc.uniqueArray(fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f'), { maxLength: 6 })

describe("houveTroca (D-5' = B, CA-38)", () => {
  it('conjunto igual: falso (trocar quem é dono entre os mesmos responsáveis não conta)', () => {
    expect(houveTroca(S('a', 'b'), S('b', 'a'))).toBe(false)
    expect(houveTroca(S(), S())).toBe(false)
  })

  it('só entrada (inclui co-responsável sem ninguém sair): falso', () => {
    expect(houveTroca(S('a'), S('a', 'b'))).toBe(false)
    expect(houveTroca(S(), S('a'))).toBe(false)
  })

  it('só saída: falso', () => {
    expect(houveTroca(S('a', 'b'), S('a'))).toBe(false)
    expect(houveTroca(S('a'), S())).toBe(false)
  })

  it('alguém sai e outro entra, ou o conjunto é substituído: verdadeiro', () => {
    expect(houveTroca(S('a'), S('b'))).toBe(true)
    expect(houveTroca(S('a', 'b'), S('b', 'c'))).toBe(true)
    expect(houveTroca(S('a', 'b'), S('c', 'd'))).toBe(true)
  })

  it('propriedade: verdadeiro se e só se há saída E há entrada (com a conta feita por outro caminho)', () => {
    fc.assert(
      fc.property(conjunto, conjunto, (ant, atu) => {
        const a = new Set(ant)
        const b = new Set(atu)
        const saiu = ant.filter((x) => !b.has(x)).length
        const entrou = atu.filter((x) => !a.has(x)).length
        expect(houveTroca(a, b)).toBe(saiu > 0 && entrou > 0)
      }),
      { numRuns: 500, seed: 20261017 },
    )
  })

  it('propriedade: conjunto igual nunca troca, só entrada nunca troca, só saída nunca troca, e é simétrica', () => {
    fc.assert(
      fc.property(conjunto, conjunto, (ant, extra) => {
        const a = new Set(ant)
        expect(houveTroca(a, new Set(a))).toBe(false)
        expect(houveTroca(a, new Set([...a, ...extra]))).toBe(false)
        expect(houveTroca(new Set([...a, ...extra]), a)).toBe(false)
        expect(houveTroca(a, new Set(extra))).toBe(houveTroca(new Set(extra), a))
      }),
      { numRuns: 500, seed: 20261017 },
    )
  })
})

describe('contarPassagens (Q-a = 1 passagem, Q-b = conta)', () => {
  it('Q-a: {A, B} -> {C, D} numa única revisão conta 1, não 2', () => {
    expect(contarPassagens([S('a', 'b'), S('c', 'd')])).toBe(1)
  })

  it('Q-b: {A} -> {} -> {B}, com o card sem responsável no meio, conta 1', () => {
    expect(contarPassagens([S('a'), S(), S('b')])).toBe(1)
  })

  it('o card que fica sem responsável e volta ao mesmo responsável não conta', () => {
    expect(contarPassagens([S('a'), S(), S('a')])).toBe(0)
  })

  it('sequência: A -> A,B (entrada, não conta) -> B (saída, não conta) -> C (troca, conta) -> C,D -> D (nada além da troca)', () => {
    expect(contarPassagens([S('a'), S('a', 'b'), S('b'), S('c')])).toBe(1)
    expect(contarPassagens([S('a'), S('b'), S('c'), S('a')])).toBe(3)
  })

  it('sem revisões ou só com conjuntos vazios: zero', () => {
    expect(contarPassagens([])).toBe(0)
    expect(contarPassagens([S(), S()])).toBe(0)
  })

  it('propriedade: nunca passa do número de revisões menos 1 e ignora conjuntos vazios no meio', () => {
    fc.assert(
      fc.property(fc.array(conjunto, { maxLength: 8 }), (revs) => {
        const conjuntos = revs.map((r) => new Set(r))
        const n = contarPassagens(conjuntos)
        expect(n).toBeGreaterThanOrEqual(0)
        expect(n).toBeLessThanOrEqual(Math.max(0, conjuntos.length - 1))
        const semVazios = conjuntos.filter((c) => c.size > 0)
        expect(contarPassagens(semVazios)).toBe(n)
      }),
      { numRuns: 300, seed: 20261017 },
    )
  })
})

describe('ADR 0020: a contagem de identidade não é pública', () => {
  it('nem o índice do pacote, nem o de businessmap, nem o `exports` do package.json a expõem', () => {
    const indices = ['../index.ts', '../businessmap/index.ts', '../core/index.ts']
    for (const i of indices) {
      const txt = fonte(i)
      expect(txt, i).not.toMatch(/coletor|houveTroca|contarPassagens|faixaConcentracao/)
    }
    const pacote = readFileSync(join(AQUI, '../../package.json'), 'utf8')
    expect(pacote).not.toMatch(/coletor/)
  })

  it('a função de contagem não guarda nem devolve os ids: só booleano e inteiro', () => {
    const txt = fonte('./houveTroca.ts')
    expect(txt).not.toMatch(/console\.|JSON\.stringify|localStorage/)
    expect(typeof houveTroca(S('a'), S('b'))).toBe('boolean')
    expect(typeof contarPassagens([S('a'), S('b')])).toBe('number')
  })
})
