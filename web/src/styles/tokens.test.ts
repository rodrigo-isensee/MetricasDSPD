import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(__dirname, 'tokens.css'), 'utf8')

const SELETORES = { claro: ':root {', escuro: "[data-theme='dark'] {" } as const

/** Bloco de tokens de um tema, ancorado na regra: seletor no início da linha seguido de `{`. */
const bloco = (abre: string): string => {
  const linhas = css.split('\n')
  const i = linhas.findIndex((linha) => linha === abre)
  if (i < 0) throw new Error(`regra ${abre} ausente`)
  const resto = linhas.slice(i + 1).join('\n')
  return resto.slice(0, resto.indexOf('\n}'))
}
const token = (b: string, nome: string): string => {
  const m = new RegExp(`--${nome}:\\s*(#[0-9a-fA-F]{6})`).exec(b)
  if (!m) throw new Error(`token --${nome} ausente`)
  return m[1]!
}
const luz = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}
const contraste = (a: string, b: string): number => {
  const [x, y] = [luz(a), luz(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/** WCAG AA para texto normal: 4,5:1. `text-atencao` aparece sobre a superfície, o fundo e a superfície 2. */
describe('contraste do texto de atenção (cobertura-S12 e afins)', () => {
  it.each([
    ['claro', SELETORES.claro],
    ['escuro', SELETORES.escuro],
  ])('tema %s: --atencao sobre as superfícies passa de 4,5:1', (_tema, abre) => {
    const b = bloco(abre)
    for (const sobre of ['superficie', 'fundo', 'superficie-2']) {
      expect(contraste(token(b, 'atencao'), token(b, sobre))).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('a âncora de cada tema pega a regra certa, não o @custom-variant da linha 3', () => {
    const escuro = bloco(SELETORES.escuro)
    const claro = bloco(SELETORES.claro)
    expect(escuro).not.toContain('@custom-variant')
    expect(escuro).not.toContain(':root')
    expect(token(escuro, 'atencao')).not.toBe(token(claro, 'atencao'))
    expect(token(escuro, 'fundo')).not.toBe(token(claro, 'fundo'))
  })
})
