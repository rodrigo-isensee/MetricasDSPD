import { describe, expect, it } from 'vitest'
import { contarNos, extrairBlocos, renderizarBlocos } from './mermaid.ts'

describe('extrairBlocos', () => {
  const md = [
    '# T',
    '',
    '### Título',
    '```mermaid',
    'flowchart LR',
    '  A --> B',
    '```',
    '',
    'Legenda: x',
    '',
    '```ts',
    'const x = 1',
    '```',
    '```mermaid',
    'graph TD',
    '',
  ].join('\n')

  it('acha só os blocos mermaid, com contexto antes e depois; bloco sem fechamento vai até o fim', () => {
    const blocos = extrairBlocos('a.md', md)
    expect(blocos).toHaveLength(2)
    expect(blocos[0]).toMatchObject({
      arquivo: 'a.md',
      linha: 4,
      codigo: 'flowchart LR\n  A --> B',
    })
    expect(blocos[0]!.antes.at(-1)).toBe('### Título')
    expect(blocos[0]!.depois[1]).toBe('Legenda: x')
    expect(blocos[1]!.codigo).toBe('graph TD\n')
    expect(blocos[1]!.depois).toEqual([])
  })

  it('sem blocos, devolve lista vazia', () => {
    expect(extrairBlocos('a.md', 'texto')).toEqual([])
  })
})

describe('contarNos', () => {
  it('fluxo: conta ids distintos, ignora rótulos, setas rotuladas, subgraph, estilos e comentários', () => {
    const codigo = [
      'flowchart LR',
      '  %% comentário',
      '  subgraph S["grupo"]',
      '    A["Coletor (processo)"] -->|grava| B[("Base (banco)")]',
      '  end',
      '  B --> C{decisão} & D',
      '  classDef x fill:#fff',
      '  style A fill:#fff',
      '  A -.-> E((fim))',
      '  F ==> G',
      '  H <--> I',
      '  J --- K',
      '  --> L',
    ].join('\n')
    expect(contarNos(codigo)).toBe(12)
    expect(contarNos('graph TD\n  X --> Y')).toBe(2)
  })

  it('classDiagram: classes declaradas, relações com cardinalidade e corpo ignorado', () => {
    const codigo = [
      'classDiagram',
      '  class A {',
      '    <<entity>>',
      '    +metodo()',
      '  }',
      '  class B',
      '  A *-- B : 0..*',
      '  C --> A : 1',
      '  D "1" --> "0..*" E',
    ].join('\n')
    expect(contarNos(codigo)).toBe(5)
  })

  it('sequência, estado, ER', () => {
    expect(
      contarNos(
        'sequenceDiagram\n  participant A\n  actor B as Bia\n  A->>C: oi\n  C-->>A: ok\n  A-)D: x',
      ),
    ).toBe(4)
    expect(
      contarNos(
        'stateDiagram-v2\n  [*] --> Aberto\n  Aberto --> Fechado\n  state Pausa\n  state "Longo" as L',
      ),
    ).toBe(4)
    expect(
      contarNos(
        'erDiagram\n  CLIENTE ||--o{ PEDIDO : faz\n  PEDIDO {\n    int id\n  }\n  ITEM }|--|| PEDIDO : em',
      ),
    ).toBe(3)
  })

  it('tipo desconhecido ou vazio conta zero', () => {
    expect(contarNos('pie\n "a": 1')).toBe(0)
    expect(contarNos('')).toBe(0)
  })
})

describe('renderizarBlocos', () => {
  it('um problema por bloco que não renderiza', () => {
    const blocos = extrairBlocos('a.md', '```mermaid\nok\n```\n\n```mermaid\nruim\n```')
    const problemas = renderizarBlocos(blocos, (c) =>
      c === 'ok' ? { ok: true, erro: '' } : { ok: false, erro: 'sintaxe' },
    )
    expect(problemas).toEqual(['a.md:5: diagrama Mermaid não renderiza: sintaxe'])
  })
})
