import { describe, expect, it } from 'vitest'
import { executar, lerMarkdown, USO, type Deps } from './cli.ts'
import type { Insumos } from './gerador.ts'
import { criarIoMemoria } from './io-memoria.ts'
import type { InsumoMetrica } from './metricas.ts'

const metrica: InsumoMetrica = {
  id: 'O1',
  rota: '/api/v1/metricas/O1',
  parametros: [],
  filtrosAplicaveis: [],
  filtrosDoDominio: [],
  regra: undefined,
  cartoes: [],
  schema: { type: 'object' },
  exemplo: {},
}
const insumos: Insumos = {
  metricas: [metrica],
  eventos: [{ tipo: 'a.b', schema: { type: 'object' } }],
}
const FIGURA =
  '### T\n```mermaid\nflowchart LR\n  A --> B\n```\n\nLegenda: x\n\n<details open>\n<summary>Alternativa em lista</summary>\n\n- A -> B\n</details>\n'

const CAB = '# Docs\n\nPropósito: x. Público: y. Revisão: 2026-10-11.\n'
const BASE: Record<string, string> = {
  'docs/README.md': `${CAB}\n[a](contratos/metricas/README.md) [b](contratos/metricas/O1.md) [c](architecture/ddd/03-agregados.md)\n${FIGURA}`,
  'docs/contratos/http.md': `${CAB}\n[volta](metricas/README.md)\n`,
  'docs/api/openapi.json': '{}',
}

const deps = (inicial: Record<string, string> = {}, extra: Partial<Deps> = {}): Deps => {
  const io = criarIoMemoria(inicial)
  return {
    io,
    insumos: () => Promise.resolve(insumos),
    hoje: '2026-10-11',
    renderizar: () => ({ ok: true, erro: '' }),
    ...extra,
  }
}

describe('lerMarkdown', () => {
  it('lê o Markdown de docs/ e README/CLAUDE da raiz quando existem', () => {
    const io = criarIoMemoria({ 'docs/a.md': 'a', 'docs/b.json': '{}', 'README.md': 'r' })
    expect([...lerMarkdown(io).keys()]).toEqual(['docs/a.md', 'README.md'])
  })
})

describe('executar', () => {
  it('falha ao montar os insumos vira mensagem com código 1', async () => {
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- cobre rejeição com valor que não é Error
    const falha = (e: unknown): Deps => deps({}, { insumos: () => Promise.reject(e) })
    for (const cmd of ['gerar', 'check', 'fotografar']) {
      const r = await executar(cmd, falha(new Error('X: mudança INCOMPATÍVEL')))
      expect(r).toEqual({
        codigo: 1,
        linhas: ['X: mudança INCOMPATÍVEL', 'docs-contratos: 1 problema(s).'],
      })
    }
    expect((await executar('check', falha('texto'))).linhas[0]).toBe('texto')
  })

  it('erro que não vem dos insumos continua subindo', async () => {
    const d = deps(BASE)
    const io = {
      ...d.io,
      ler: (): never => {
        throw new Error('disco')
      },
    }
    await expect(executar('check', { ...d, io })).rejects.toThrow()
  })

  it('sem comando ou desconhecido mostra o uso e falha', async () => {
    expect(await executar(undefined, deps())).toEqual({ codigo: 1, linhas: [USO] })
    expect((await executar('x', deps())).codigo).toBe(1)
  })

  it('gerar grava as páginas e lista os arquivos', async () => {
    const d = deps()
    const r = await executar('gerar', d)
    expect(r.codigo).toBe(0)
    expect(r.linhas[0]).toBe('docs:gerar: 3 página(s) gravada(s).')
    expect(d.io.ler('docs/contratos/metricas/O1.md')).toContain('Contrato da métrica O1')
  })

  it('fotografar grava e, com quebra não aceita, falha', async () => {
    const d = deps()
    const r = await executar('fotografar', d)
    expect(r.linhas[0]).toBe('docs:fotografar: 2 fotografia(s) gravada(s).')
    const quebra: Insumos = { ...insumos, metricas: [{ ...metrica, schema: { type: 'string' } }] }
    const r2 = await executar('fotografar', { ...d, insumos: () => Promise.resolve(quebra) })
    expect(r2.codigo).toBe(1)
    expect(r2.linhas.at(-1)).toBe('docs-contratos: 1 problema(s).')
  })

  it('check: tudo em dia devolve código 0; uma página gerada sem link de entrada falha como órfã', async () => {
    const d = deps(BASE)
    await executar('gerar', d)
    await executar('fotografar', d)
    expect(await executar('check', d)).toEqual({
      codigo: 0,
      linhas: ['docs:check: ok (5 páginas Markdown, 1 métricas, 1 eventos).'],
    })
    d.io.escrever('docs/README.md', CAB)
    const r = await executar('check', d)
    expect(r.codigo).toBe(1)
    expect(
      r.linhas.some((l) => l.startsWith('docs/architecture/ddd/03-agregados.md: página isolada')),
    ).toBe(true)
  })

  it('check acusa página gerada ausente, fotografia ausente e problema de documentação', async () => {
    const d = deps({ 'docs/contratos/a.md': 'sem cabeçalho' })
    const r = await executar('check', d)
    expect(r.codigo).toBe(1)
    const texto = r.linhas.join('\n')
    expect(texto).toContain('página gerada ausente')
    expect(texto).toContain('sem fotografia')
    expect(texto).toContain('cabeçalho sem')
  })

  it('check usa o escopo informado', async () => {
    const d = deps(
      { ...BASE, 'docs/contratos/a.md': 'sem cabeçalho' },
      { escopo: { estrito: [], isentos: [], excluidos: [] } },
    )
    await executar('gerar', d)
    await executar('fotografar', d)
    expect((await executar('check', d)).codigo).toBe(0)
  })

  it('mermaid renderiza todos os blocos de docs/ e acusa os que falham', async () => {
    const d = deps({ 'docs/a.md': FIGURA, 'README.md': '```mermaid\nflowchart LR\n```' })
    const ok = await executar('mermaid', d)
    expect(ok).toEqual({
      codigo: 0,
      linhas: ['docs:mermaid: 1 diagrama(s) renderizado(s) sem erro.'],
    })
    const ruim = await executar('mermaid', {
      ...d,
      renderizar: () => ({ ok: false, erro: 'sintaxe' }),
    })
    expect(ruim.codigo).toBe(1)
    expect(ruim.linhas[0]).toBe('docs/a.md:2: diagrama Mermaid não renderiza: sintaxe')
  })
})
