import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8')

/** Declaração `scroll-padding-top` do bloco `html` dentro do @media (min-width: 48rem). */
function scrollPaddingDesktop(): string {
  const bloco = /@media \(min-width: 48rem\) \{\s*html \{([^}]*)\}/.exec(css)
  expect(bloco).not.toBeNull()
  const decl = /scroll-padding-top:\s*([^;]+);/.exec(bloco?.[1] ?? '')
  expect(decl).not.toBeNull()
  return decl?.[1] ?? ''
}

describe('tokens.css: scroll-padding-top sem a barra de filtros (048-03)', () => {
  it('a partir de 768 px soma só --h-cabecalho e --h-indice, sem --h-filtros', () => {
    const valor = scrollPaddingDesktop()
    expect(valor).toContain('var(--h-cabecalho)')
    expect(valor).toContain('var(--h-indice)')
    expect(valor).not.toContain('--h-filtros')
  })

  it('--h-filtros não é mais publicado', () => {
    expect(css).not.toContain('--h-filtros')
  })
})
