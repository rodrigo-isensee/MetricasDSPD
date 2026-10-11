import { describe, expect, it } from 'vitest'
import {
  gruposDeDiagrama,
  montarContextos,
  paraClasse,
  paraMetodo,
  renderAgregados,
  type Contexto,
  type Elemento,
} from './dominio.ts'
import { contarNos } from './mermaid.ts'

const ARQUIVOS: Record<string, string> = {
  'flow/_context.md': '---\nstrategic: core\n---\n\n## Description\n\nFluxo de projeto.\n',
  'flow/card.md': [
    '---',
    'type: aggregate-root',
    'relationships:',
    '  - target: card-block',
    '    type: composition',
    '    cardinality: "0..*"',
    '  - target: card',
    '    type: reference',
    '    cardinality: "0..1"',
    '    role: parent',
    '  - target: severity',
    '    type: association',
    '    cardinality: "1"',
    'operations:',
    '  - project-milestones',
    '---',
    '',
  ].join('\n'),
  'flow/card-block.md': '---\ntype: entity\naggregate: card\n---\n',
  'flow/severity.md': '---\ntype: enumeration\nvalues:\n  - low\n---\n',
  'support/_context.md': '---\nstrategic: supporting\n---\n',
  'support/ticket.md': '---\ntype: aggregate-root\n---\n',
  'collection/_context.md': '---\nstrategic: core\n---\n\n## Description\n',
}

describe('nomes', () => {
  it('converte kebab-case para classe e método', () => {
    expect(paraClasse('card-lifecycle-event')).toBe('CardLifecycleEvent')
    expect(paraMetodo('project-milestones')).toBe('projectMilestones')
  })
})

describe('montarContextos', () => {
  const contextos = montarContextos(ARQUIVOS)

  it('ordena núcleo antes de suporte e lê elementos e enumerações', () => {
    expect(contextos.map((c) => c.id)).toEqual(['collection', 'flow', 'support'])
    const flow = contextos[1]!
    expect(flow.estrategico).toBe('core')
    expect(flow.descricao).toBe('Fluxo de projeto.')
    expect(flow.enumeracoes).toEqual(['severity'])
    expect(flow.elementos.map((e) => e.id)).toEqual(['card-block', 'card'])
    expect(flow.elementos[1]!.operacoes).toEqual(['project-milestones'])
    expect(flow.elementos[0]!.agregado).toBe('card')
    expect(flow.elementos[1]!.relacoes[1]).toEqual({
      alvo: 'card',
      tipo: 'reference',
      cardinalidade: '0..1',
      papel: 'parent',
    })
  })

  it('contexto sem descrição fica com texto vazio', () => {
    expect(contextos[0]!.descricao).toBe('')
    expect(contextos[2]!.descricao).toBe('')
  })
})

describe('renderAgregados', () => {
  const md = renderAgregados(montarContextos(ARQUIVOS))

  it('traz tabela, enumerações, diagrama com título, legenda e alternativa em lista', () => {
    expect(md).toContain('## Fluxo (`flow`, núcleo)')
    expect(md).toContain('## Sustentação (`support`, suporte)')
    expect(md).toContain('## Coleta (`collection`, núcleo)\n\nOrigem: [`_context.md`]')
    expect(md).toContain(
      '| [`card`](../../especificacao/domain/flow/card.md) | raiz de agregado | - | compõe CardBlock (0..*); referencia Card (0..1, parent); association Severity (1) | `project-milestones` |',
    )
    expect(md).toContain('Enumerações (1, não desenhadas): `severity`.')
    expect(md).toContain('### Contexto Fluxo: classes e relações\n```mermaid\nclassDiagram')
    expect(md).toContain('Card *-- CardBlock : 0..*')
    expect(md).toContain('Card --> Card : 0..1 parent')
    expect(md).toContain('Legenda:')
    expect(md).toContain('<summary>Alternativa em lista</summary>')
    expect(md).toContain('- Card (raiz de agregado): compõe CardBlock (0..*);')
    expect(md).toContain('operações: projectMilestones.')
    expect(md).toContain('- CardBlock (entidade): sem relações declaradas.')
    expect(md.endsWith('\n')).toBe(false)
  })

  it('relação para elemento não desenhado (enumeração) fica fora do diagrama', () => {
    expect(md).not.toContain('Severity :')
  })

  it('relação de tipo desconhecido usa seta tracejada', () => {
    const c = montarContextos({
      'a/x.md':
        '---\ntype: entity\nrelationships:\n  - target: y\n    type: dependency\n    cardinality: "1"\n---\n',
      'a/y.md': '---\ntype: entity\n---\n',
    })
    expect(renderAgregados(c)).toContain('X ..> Y : 1')
  })
})

describe('gruposDeDiagrama (limite de 15 nós)', () => {
  const el = (id: string, tipo: string, agregado = ''): Elemento => ({
    contexto: 'x',
    id,
    tipo,
    agregado,
    relacoes: [],
    operacoes: [],
  })

  it('contexto grande é dividido por agregado, com os elementos soltos à parte', () => {
    const elementos = [
      el('a', 'aggregate-root'),
      el('b', 'aggregate-root'),
      ...Array.from({ length: 7 }, (_, i) => el(`ea${i}`, 'entity', 'a')),
      ...Array.from({ length: 6 }, (_, i) => el(`eb${i}`, 'entity', 'b')),
      el('vo', 'value-object'),
    ]
    const c: Contexto = { id: 'x', estrategico: 'core', descricao: '', elementos, enumeracoes: [] }
    const grupos = gruposDeDiagrama(c)
    expect(grupos.map((g) => g.titulo)).toEqual([
      'Agregado A (contexto x)',
      'Agregado B (contexto x)',
      'Demais elementos (contexto x)',
    ])
    expect(grupos.map((g) => g.elementos.length)).toEqual([8, 7, 1])
    const md = renderAgregados([c])
    expect(md.match(/```mermaid/g)).toHaveLength(3)
    for (const bloco of md.split('```mermaid').slice(1))
      expect(contarNos(bloco.split('```')[0]!.trim())).toBeLessThanOrEqual(15)
  })

  it('contexto grande sem elementos soltos não gera o grupo "demais"', () => {
    const elementos = [
      el('a', 'aggregate-root'),
      ...Array.from({ length: 15 }, (_, i) => el(`e${i}`, 'entity', 'a')),
    ]
    const grupos = gruposDeDiagrama({
      id: 'x',
      estrategico: '',
      descricao: '',
      elementos,
      enumeracoes: [],
    })
    expect(grupos).toHaveLength(1)
  })
})
