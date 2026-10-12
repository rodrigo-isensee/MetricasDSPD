import { describe, expect, it } from 'vitest'
import { classificarEscopo } from './escopo.ts'

describe('classificarEscopo', () => {
  it('só docs/ e .md da raiz é documentação', () => {
    expect(classificarEscopo(['docs/a.md', 'CLAUDE.md', 'docs/x/y.json', ''])).toBe('docs')
  })
  it('qualquer arquivo de código vira código', () => {
    expect(classificarEscopo(['docs/a.md', 'server/src/x.ts'])).toBe('codigo')
    expect(classificarEscopo(['server/README.md'])).toBe('codigo')
  })
  it('lista vazia conta como código', () => {
    expect(classificarEscopo([])).toBe('codigo')
    expect(classificarEscopo(['  '])).toBe('codigo')
  })
})
