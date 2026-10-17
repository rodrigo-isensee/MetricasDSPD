import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { faixaConcentracao } from './index'

const AQUI = dirname(fileURLToPath(import.meta.url))
const fonte = (rel: string) => readFileSync(join(AQUI, rel), 'utf8')

describe('faixaConcentracao (E8, ADR 0020)', () => {
  it('1, 2 e 3 ou mais; sem pessoa ou número inválido não tem faixa', () => {
    expect([1, 2, 3, 4, 40].map(faixaConcentracao)).toEqual([1, 2, 3, 3, 3])
    expect([0, -1, 1.5, Number.NaN].map(faixaConcentracao)).toEqual([null, null, null, null])
  })
})

describe('ADR 0020: a contagem de identidade não é pública', () => {
  it('nem o índice do pacote, nem o de businessmap, nem o `exports` do package.json a expõem', () => {
    const indices = ['../index.ts', '../businessmap/index.ts', '../core/index.ts']
    for (const i of indices) {
      const txt = fonte(i)
      expect(txt, i).not.toMatch(/coletor|faixaConcentracao/)
    }
    const pacote = readFileSync(join(AQUI, '../../package.json'), 'utf8')
    expect(pacote).not.toMatch(/coletor/)
  })
})
