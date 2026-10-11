import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { criarIo } from './fs-io.ts'

let raiz = ''
beforeEach(() => {
  raiz = mkdtempSync(join(tmpdir(), 'docs-contratos-'))
})
afterEach(() => rmSync(raiz, { recursive: true, force: true }))

describe('criarIo', () => {
  it('lê, escreve (criando pastas), lista recursivamente e confere existência', () => {
    const io = criarIo(raiz)
    expect(io.ler('a/b.md')).toBeUndefined()
    expect(io.existe('a')).toBe(false)
    io.escrever('a/b.md', 'um')
    io.escrever('a/c/d.md', 'dois')
    mkdirSync(join(raiz, 'vazia'))
    expect(readFileSync(join(raiz, 'a/b.md'), 'utf8')).toBe('um')
    expect(io.ler('a/b.md')).toBe('um')
    expect(io.existe('a')).toBe(true)
    expect(io.existe('a/b.md')).toBe(true)
    expect(io.listar('a')).toEqual(['a/b.md', 'a/c/d.md'])
    expect(io.listar('vazia')).toEqual([])
    expect(io.listar('nao-existe')).toEqual([])
  })

  it('lista com caminhos relativos à raiz mesmo para pastas aninhadas', () => {
    writeFileSync(join(raiz, 'x.md'), '')
    expect(criarIo(raiz).listar('.')).toEqual(['x.md'])
  })
})
