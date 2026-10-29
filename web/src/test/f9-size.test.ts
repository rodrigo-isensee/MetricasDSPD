import { describe, expect, it } from 'vitest'
import { calcularF9 } from '../../scripts/f9.mjs'

type Chunk = { tipo: string; gz: number; codigo: string }

function dist(chunks: Record<string, Chunk>, iniciais: string[] = []) {
  return calcularF9({
    linhas: Object.entries(chunks).map(([f, c]) => ({ f, tipo: c.tipo, gz: c.gz })),
    iniciais: new Set(iniciais),
    lerCodigo: (f) => chunks[f]!.codigo,
  })
}

const base: Record<string, Chunk> = {
  'nucleoMock.worker-aa.js': {
    tipo: 'mock',
    gz: 10,
    codigo: 'import{a}from"./comum-bb.js";const x=()=>import("./lazy-cc.js")',
  },
  'nucleoMock-dd.js': {
    tipo: 'mock',
    gz: 4,
    codigo: 'import { a } from "./comum-bb.js"; export * from "./so-processo-ee.js"',
  },
  'comum-bb.js': { tipo: 'mock', gz: 20, codigo: 'export const a=1' },
  'lazy-cc.js': { tipo: 'rota', gz: 3, codigo: '' },
  'so-processo-ee.js': { tipo: 'mock', gz: 1, codigo: '' },
  'index-ff.js': { tipo: 'inicial', gz: 50, codigo: 'import"./comum-bb.js"' },
}

describe('F9 pelo maior caminho (ADR 0021 §8)', () => {
  it('segue imports estáticos e dinâmicos e soma cada caminho; compartilhado conta nos dois', () => {
    const r = dist(base)
    expect(r.worker?.soma).toBe(33)
    expect(r.worker?.chunks).toEqual([
      'nucleoMock.worker-aa.js',
      'comum-bb.js',
      'lazy-cc.js (rota)',
    ])
    expect(r.processo?.soma).toBe(25)
    expect(r.caminho).toBe('worker')
    expect(r.max).toBe(33)
    expect(r.somaTodos).toBe(35)
    expect(r.avisos).toEqual([])
  })

  it('exclui da soma os chunks do index.html (já pagos no F6)', () => {
    const r = dist(base, ['comum-bb.js'])
    expect(r.worker?.soma).toBe(13)
    expect(r.processo?.soma).toBe(5)
  })

  it('soma o órfão mock nos dois caminhos', () => {
    const r = dist({ ...base, 'orfao-gg.js': { tipo: 'mock', gz: 7, codigo: '' } })
    expect(r.worker?.soma).toBe(40)
    expect(r.processo?.soma).toBe(32)
    expect(r.max).toBe(40)
  })

  it('escolhe o processo quando ele é o maior', () => {
    const r = dist({ ...base, 'so-processo-ee.js': { tipo: 'mock', gz: 90, codigo: '' } })
    expect(r.caminho).toBe('processo')
    expect(r.max).toBe(114)
  })

  it('sem uma das raízes, mede pela soma e avisa', () => {
    const { 'nucleoMock-dd.js': _fora, ...semProcesso } = base
    const r = dist(semProcesso)
    expect(r.avisos).toEqual([
      'F9 aviso: raiz processo não encontrada; medindo pela soma (conservador)',
    ])
    expect(r.caminho).toBe('soma')
    expect(r.max).toBe(r.somaTodos)
  })

  it('falha quando uma raiz ou um chunk mock está no index.html', () => {
    expect(dist(base).falhaInicial).toBe(false)
    expect(dist(base, ['nucleoMock.worker-aa.js']).falhaInicial).toBe(true)
    expect(dist(base, ['so-processo-ee.js']).falhaInicial).toBe(true)
  })
})
