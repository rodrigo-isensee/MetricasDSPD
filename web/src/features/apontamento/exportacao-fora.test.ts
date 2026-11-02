import { CATALOGO_CARTOES, METRICA_IDS } from '@metricas-dspd/contratos'
import { describe, expect, it } from 'vitest'
import { CATALOGO } from '@/content/catalogo-metricas'

/**
 * Trava estrutural da cláusula o4 (a aba fica fora da exportação) e da ADR 0020, R4-8: nome real nunca chega a um PDF.
 * Hoje a exclusão é só ausência (a aba não está no catálogo e a página não monta o botão de exportar); aqui ela vira
 * teste: quem registrar um cartão da aba no catálogo ou importar a aba na exportação ou no painel quebra a suíte.
 */

const exportar = import.meta.glob('../exportar/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>
const painel = import.meta.glob('../painel/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** `import ... from '...apontamento...'`, `import('...apontamento...')` e `export ... from '...apontamento...'`. */
const IMPORTA_A_ABA = /(?:from|import\s*\()\s*['"][^'"]*features\/apontamento[^'"]*['"]/
const IMPORTA_A_ABA_RELATIVO = /(?:from|import\s*\()\s*['"]\.{1,2}\/[^'"]*apontamento[^'"]*['"]/

const importaAAba = (texto: string) =>
  IMPORTA_A_ABA.test(texto) || IMPORTA_A_ABA_RELATIVO.test(texto)

const importadores = (arquivos: Record<string, string>) =>
  Object.entries(arquivos)
    .filter(([, texto]) => importaAAba(texto))
    .map(([caminho]) => caminho)

describe('a aba Apontamento fica fora da exportação (o4)', () => {
  it('a varredura enxerga os arquivos da exportação e do painel', () => {
    expect(Object.keys(exportar).length).toBeGreaterThan(5)
    expect(Object.keys(painel).length).toBeGreaterThan(1)
  })

  it('features/exportar e features/painel nunca importam features/apontamento', () => {
    expect(importadores(exportar)).toEqual([])
    expect(importadores(painel)).toEqual([])
  })

  it('o detector de import reconhece as formas de importar a aba', () => {
    for (const linha of [
      "import { x } from '@/features/apontamento/api'",
      'import { x } from "@/features/apontamento"',
      "export { x } from '@/features/apontamento/types'",
      "const p = await import('@/features/apontamento/ApontamentoPage')",
      "import { x } from '../apontamento/api'",
    ])
      expect(importaAAba(linha), linha).toBe(true)
    expect(importaAAba("import { x } from '@/features/painel/PainelPagina'")).toBe(false)
  })

  it('nenhum código AP- entra no catálogo de cartões nem no de métricas', () => {
    const codigos = [
      ...CATALOGO_CARTOES.flatMap((c) => [c.id, c.codigo]),
      ...METRICA_IDS,
      ...CATALOGO.flatMap((e) => [e.id, e.codigo]),
    ]
    expect(codigos.filter((c) => /^ap-/i.test(c))).toEqual([])
  })
})
