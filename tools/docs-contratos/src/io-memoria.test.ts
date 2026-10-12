import { describe, expect, it } from 'vitest'
import { criarIoMemoria } from './io-memoria.ts'

describe('criarIoMemoria', () => {
  it('lê, escreve, lista por pasta e confere existência de arquivo e de pasta', () => {
    const io = criarIoMemoria({ 'a/b.md': '1' })
    io.escrever('a/c/d.md', '2')
    expect(io.ler('a/b.md')).toBe('1')
    expect(io.ler('x')).toBeUndefined()
    expect(io.listar('a')).toEqual(['a/b.md', 'a/c/d.md'])
    expect(io.existe('a/b.md')).toBe(true)
    expect(io.existe('a/c')).toBe(true)
    expect(io.existe('z')).toBe(false)
    io.apagar('a/b.md')
    expect(io.ler('a/b.md')).toBeUndefined()
  })
})
