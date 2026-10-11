import { describe, expect, it } from 'vitest'
import {
  ancoras,
  ESCOPO_PADRAO,
  linksRelativos,
  verificarCabecalho,
  verificarDocs,
  verificarLinks,
  verificarMermaid,
  verificarOrfaos,
  type EntradaDocs,
  type Escopo,
} from './verificar-docs.ts'

const CAB = '# T\n\nPropósito: x. Público: y. Revisão: 2026-10-11.\n'
const FIGURA = [
  '### Fluxo',
  '```mermaid',
  'flowchart LR',
  '  A --> B',
  '```',
  '',
  'Legenda: A e B.',
  '',
  '<details open>',
  '<summary>Alternativa em lista</summary>',
  '',
  '- A -> B: dados.',
  '</details>',
].join('\n')

const entrada = (
  arquivos: Record<string, string>,
  escopo: Escopo = ESCOPO_PADRAO,
): EntradaDocs => ({
  arquivos: new Map(Object.entries(arquivos)),
  existe: (c) =>
    c in arquivos ||
    Object.keys(arquivos).some((a) => a.startsWith(`${c}/`)) ||
    c === 'server/src/x.ts' ||
    c === 'server/leia.md',
  escopo,
})

describe('ancoras', () => {
  it('gera âncoras no estilo GitHub, com sufixo para repetidas e ignorando código', () => {
    const a = ancoras(
      '# Título Um\n## Ação `x` (nova)!\n## Repetido\n## Repetido\n```\n# no código\n```\n### Com **negrito** ###',
    )
    expect([...a]).toEqual(['título-um', 'ação-x-nova', 'repetido', 'repetido-1', 'com-negrito'])
  })
})

describe('linksRelativos', () => {
  it('resolve relativos, ignora externos, código e âncora só; tira query e barra final', () => {
    const texto = [
      '[a](b.md) [b](../c/d.md#sec) [e](https://x.com) [f](mailto:a@b.c) [g](#local) [h](pasta/) [i](x%20y.md?q=1) [j](//cdn)',
      '`[no](codigo.md)`',
      '```',
      '[bloco](bloco.md)',
      '```',
      '[com título](t.md "dica")',
    ].join('\n')
    expect(linksRelativos('docs/a/x.md', texto)).toEqual([
      { caminho: 'docs/a/b.md', ancora: '' },
      { caminho: 'docs/c/d.md', ancora: 'sec' },
      { caminho: 'docs/a/x.md', ancora: 'local' },
      { caminho: 'docs/a/pasta', ancora: '' },
      { caminho: 'docs/a/x y.md', ancora: '' },
      { caminho: 'docs/a/t.md', ancora: '' },
    ])
  })
})

describe('verificarLinks', () => {
  it('acusa link quebrado e âncora inexistente; aceita pasta, arquivo de código e âncora válida', () => {
    const e = entrada({
      'docs/a.md':
        '[ok](b.md#titulo) [ruim](b.md#nao) [q](nada.md) [p](pasta) [c](../server/src/x.ts) [d](b.md)',
      'docs/b.md': '# Titulo',
      'docs/pasta/x.md': '',
    })
    expect(verificarLinks(e)).toEqual([
      'docs/a.md: âncora inexistente #nao em docs/b.md',
      'docs/a.md: link quebrado para docs/nada.md',
    ])
  })

  it('só olha docs/ e pula pastas excluídas; âncora em arquivo que não é Markdown não é conferida', () => {
    const e = entrada({
      'README.md': '[x](nada.md)',
      'docs/reviews/r.md': '[x](nada.md)',
      'docs/a.md': '[c](../server/src/x.ts#L10) [m](../server/leia.md#x)',
    })
    expect(verificarLinks(e)).toEqual([])
  })
})

describe('verificarCabecalho', () => {
  it('exige propósito, público e revisão nas 5 primeiras linhas, só no escopo estrito', () => {
    const e = entrada(
      {
        'docs/contratos/ok.md': CAB,
        'docs/contratos/lista.md':
          '# T\n\n- **Propósito:** a.\n- **Público:** b.\n- **Revisão:** 2026-10-11.\n',
        'docs/contratos/falta.md': '# T\n\nPropósito: x.\n',
        'docs/contratos/data.md': '# T\n\nPropósito: x. Público: y. Revisão: ontem.\n',
        'docs/legado.md': '# sem cabeçalho',
        'docs/contratos/isento.md': 'sem cabeçalho',
      },
      { ...ESCOPO_PADRAO, isentos: ['docs/contratos/isento.md'] },
    )
    expect(verificarCabecalho(e)).toEqual([
      'docs/contratos/falta.md: cabeçalho sem público, data de revisão (AAAA-MM-DD) nas 5 primeiras linhas',
      'docs/contratos/data.md: cabeçalho sem data de revisão (AAAA-MM-DD) nas 5 primeiras linhas',
    ])
  })
})

describe('verificarOrfaos', () => {
  it('página do escopo sem link de entrada é órfã; link de outra página, da raiz ou da pasta salva', () => {
    const e = entrada({
      'docs/README.md': '[c](contratos/ligada.md) [d](architecture/ddd)',
      'docs/contratos/ligada.md': '[eu](ligada.md)',
      'docs/contratos/orfa.md': '',
      'docs/architecture/ddd/x.md': '',
      'README.md': '[o](docs/contratos/da-raiz.md)',
      'docs/contratos/da-raiz.md': '',
    })
    expect(verificarOrfaos(e)).toEqual([
      'docs/contratos/orfa.md: página órfã (nenhuma outra página linka para ela)',
    ])
  })
})

const semLinha = (ps: string[]): string[] => ps.map((x) => x.replace(/:\d+:/, ':N:'))

describe('verificarMermaid', () => {
  it('bloco completo passa', () => {
    expect(verificarMermaid(entrada({ 'docs/contratos/a.md': `${CAB}\n${FIGURA}\n` }))).toEqual([])
  })

  it('acusa título, legenda, alternativa e excesso de nós', () => {
    const muitos = [
      'flowchart LR',
      ...Array.from({ length: 16 }, (_, i) => `  N${i} --> M${i}`),
    ].join('\n')
    const e = entrada({
      'docs/contratos/a.md': `${CAB}\n\`\`\`mermaid\n${muitos}\n\`\`\`\n\nTexto.\n`,
      'docs/legado.md': '```mermaid\nflowchart LR\n```',
    })
    expect(semLinha(verificarMermaid(e))).toEqual([
      'docs/contratos/a.md:N: diagrama sem título (### imediatamente acima)',
      'docs/contratos/a.md:N: diagrama sem legenda logo abaixo',
      'docs/contratos/a.md:N: diagrama sem alternativa em lista (<details> com itens "- ")',
      'docs/contratos/a.md:N: diagrama com 32 nós (máximo 15)',
    ])
  })

  it('details sem itens ou sem summary não vale como alternativa', () => {
    const semItens = FIGURA.replace('- A -> B: dados.', 'texto corrido')
    const semResumo = FIGURA.replace('<summary>Alternativa em lista</summary>', '')
    for (const f of [semItens, semResumo]) {
      expect(
        semLinha(verificarMermaid(entrada({ 'docs/contratos/a.md': `${CAB}\n${f}\n` }))),
      ).toEqual([
        'docs/contratos/a.md:N: diagrama sem alternativa em lista (<details> com itens "- ")',
      ])
    }
  })

  it('bloco sem nada depois nem antes: tudo faltando', () => {
    const e = entrada({ 'docs/contratos/a.md': '```mermaid\nflowchart LR\n```' })
    expect(verificarMermaid(e)).toHaveLength(3)
  })
})

describe('verificarDocs', () => {
  it('junta as quatro verificações', () => {
    const e = entrada({ 'docs/contratos/a.md': `${CAB}[x](nada.md)\n` })
    expect(verificarDocs(e)).toEqual([
      'docs/contratos/a.md: link quebrado para docs/contratos/nada.md',
      'docs/contratos/a.md: página órfã (nenhuma outra página linka para ela)',
    ])
  })
})
