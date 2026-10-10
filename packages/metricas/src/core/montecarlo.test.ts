import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { criarAmostraInterna } from './amostra'
import { criarPrng, preverItens, preverTermino, SIMULACOES_PADRAO } from './montecarlo'

const janela = { inicio: '2026-01-01', fim: '2026-03-25' }
const amostra = (v: number[], dominio: 'businessmap' | 'acelerato' = 'businessmap') =>
  criarAmostraInterna(dominio, 'story', v, janela)
const constante = (v: number, n = 20) => amostra(Array<number>(n).fill(v))

describe('criarPrng', () => {
  it('é determinístico pela semente e fica em [0, 1)', () => {
    const a = criarPrng(7)
    const b = criarPrng(7)
    const xs = Array.from({ length: 50 }, () => a())
    expect(xs).toEqual(Array.from({ length: 50 }, () => b()))
    expect(xs.every((x) => x >= 0 && x < 1)).toBe(true)
    expect(criarPrng(8)()).not.toBe(xs[0])
  })
})

describe('preverTermino', () => {
  it('vazão constante dá resultado exato em todos os percentis', () => {
    const r = preverTermino(constante(2), 10, 'dia', { prng: criarPrng(1), simulacoes: 200 })
    expect(r).toMatchObject({
      status: 'ok',
      n: 40,
      valor: { periodos: { p50: 5, p85: 5, p95: 5 }, granularidade: 'dia', itens: 10, simulacoes: 200 },
    })
  })

  it('abaixo de 20 itens entregues é insuficiente e não consome o PRNG', () => {
    let chamadas = 0
    const prng = () => (chamadas++, 0.5)
    const r = preverTermino(amostra([1, 0, 3]), 5, 'semana', { prng })
    expect(r).toMatchObject({ status: 'insuficiente', n: 4, minimo: 20 })
    expect(chamadas).toBe(0)
  })

  it('exatamente 20 itens já publica', () => {
    expect(preverTermino(amostra([10, 10]), 5, 'semana', { prng: criarPrng(1), simulacoes: 10 }).status).toBe('ok')
  })

  it('usa 10 mil simulações por padrão', () => {
    const r = preverTermino(constante(1), 3, 'dia', { prng: criarPrng(1) })
    expect(r.status === 'ok' && r.valor.simulacoes).toBe(SIMULACOES_PADRAO)
  })

  it('tolera PRNG que devolve 1 (índice limitado ao último período)', () => {
    const r = preverTermino(amostra([0, 20]), 20, 'dia', { prng: () => 1, simulacoes: 3 })
    expect(r.status === 'ok' && r.valor.periodos.p50).toBe(1)
  })

  it('rejeita parâmetros e vazão inválidos', () => {
    const o = { prng: criarPrng(1) }
    expect(() => preverTermino(constante(2), 0, 'dia', o)).toThrow(RangeError)
    expect(() => preverTermino(constante(2), 1.5, 'dia', o)).toThrow(RangeError)
    expect(() => preverTermino(constante(2), 5, 'dia', { ...o, simulacoes: 0 })).toThrow(RangeError)
    expect(() => preverTermino(amostra([-1, 30]), 5, 'dia', o)).toThrow(/vazao/)
    expect(() => preverTermino(amostra([0.5, 30]), 5, 'dia', o)).toThrow(/vazao/)
  })

  it('mantém o domínio fora do resultado: amostras de domínios distintos não se combinam', () => {
    const o = { prng: criarPrng(3), simulacoes: 50 }
    const bm = preverTermino(constante(2), 10, 'dia', o)
    const ac = preverTermino(amostra(Array<number>(20).fill(2), 'acelerato'), 10, 'dia', { ...o, prng: criarPrng(3) })
    expect(ac).toEqual(bm)
  })
})

describe('preverItens', () => {
  it('vazão constante dá resultado exato', () => {
    const r = preverItens(constante(2), 6, 'dia', { prng: criarPrng(1), simulacoes: 100 })
    expect(r).toMatchObject({
      status: 'ok',
      n: 40,
      valor: { itens: { p50: 12, p85: 12, p95: 12 }, periodos: 6, granularidade: 'dia', simulacoes: 100 },
    })
  })

  it('abaixo de 20 itens é insuficiente', () => {
    expect(preverItens(amostra([2, 3]), 4, 'semana', { prng: criarPrng(1) })).toMatchObject({
      status: 'insuficiente',
      n: 5,
    })
  })

  it('P85 é conservador: abaixo da mediana quando há variação', () => {
    const r = preverItens(amostra([0, 1, 2, 3, 4, 5, 6, 7]), 8, 'dia', { prng: criarPrng(5), simulacoes: 2000 })
    expect(r.status === 'ok' && r.valor.itens.p85).toBeLessThan(r.status === 'ok' ? r.valor.itens.p50 : 0)
  })

  it('rejeita períodos inválidos', () => {
    expect(() => preverItens(constante(2), 0, 'dia', { prng: criarPrng(1) })).toThrow(RangeError)
  })
})

describe('propriedades', () => {
  const vazao = fc.array(fc.integer({ min: 0, max: 8 }), { minLength: 5, maxLength: 40 }).filter(
    (v) => v.reduce((s, x) => s + x, 0) >= 20,
  )

  it('percentis monotônicos e determinismo pela semente', () => {
    fc.assert(
      fc.property(vazao, fc.integer({ min: 1, max: 60 }), fc.integer(), (v, k, semente) => {
        const a = amostra(v)
        const mk = () => ({ prng: criarPrng(semente), simulacoes: 80 })
        const t = preverTermino(a, k, 'dia', mk())
        const i = preverItens(a, k, 'dia', mk())
        expect(t).toEqual(preverTermino(a, k, 'dia', mk()))
        expect(i).toEqual(preverItens(a, k, 'dia', mk()))
        if (t.status !== 'ok' || i.status !== 'ok') throw new Error('esperado ok')
        expect(t.valor.periodos.p50).toBeLessThanOrEqual(t.valor.periodos.p85)
        expect(t.valor.periodos.p85).toBeLessThanOrEqual(t.valor.periodos.p95)
        expect(i.valor.itens.p95).toBeLessThanOrEqual(i.valor.itens.p85)
        expect(i.valor.itens.p85).toBeLessThanOrEqual(i.valor.itens.p50)
      }),
      { numRuns: 40 },
    )
  })

  it('mais itens nunca terminam antes (mesma semente)', () => {
    fc.assert(
      fc.property(vazao, fc.integer({ min: 1, max: 30 }), (v, k) => {
        const a = amostra(v)
        const p = (n: number) => preverTermino(a, n, 'dia', { prng: criarPrng(9), simulacoes: 60 })
        const x = p(k)
        const y = p(k + 5)
        if (x.status !== 'ok' || y.status !== 'ok') throw new Error('esperado ok')
        expect(y.valor.periodos.p85).toBeGreaterThanOrEqual(x.valor.periodos.p85)
      }),
      { numRuns: 30 },
    )
  })
})
