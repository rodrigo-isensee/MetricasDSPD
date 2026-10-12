import { describe, expect, it } from 'vitest'
import { lerFrontmatter } from './frontmatter.ts'

describe('lerFrontmatter', () => {
  it('sem frontmatter devolve dados vazios e o texto inteiro', () => {
    expect(lerFrontmatter('# Título')).toEqual({ dados: {}, corpo: '# Título' })
  })

  it('lê escalares, booleanos, aspas, listas de escalares e listas de mapas (CRLF e comentários)', () => {
    const texto = [
      '---',
      '# comentário',
      'type: aggregate-root',
      'ativo: true',
      'inativo: false',
      'nome: "entre aspas"',
      "outro: 'simples'",
      'vazio:',
      'operations:',
      '  - project-milestones',
      '  - "outra"',
      'relationships:',
      '  - target: card',
      '    type: reference',
      '    cardinality: "0..1"',
      '  - target: board',
      '    cardinality: "1"',
      '',
      '---',
      '## Description',
      'Corpo.',
    ].join('\r\n')
    const { dados, corpo } = lerFrontmatter(texto)
    expect(dados).toEqual({
      type: 'aggregate-root',
      ativo: true,
      inativo: false,
      nome: 'entre aspas',
      outro: 'simples',
      vazio: '',
      operations: ['project-milestones', 'outra'],
      relationships: [
        { target: 'card', type: 'reference', cardinality: '0..1' },
        { target: 'board', cardinality: '1' },
      ],
    })
    expect(corpo).toBe('## Description\nCorpo.')
  })

  it('mapa aninhado e frontmatter vazio', () => {
    expect(lerFrontmatter('---\na:\n  b: 1\n---\n').dados).toEqual({ a: { b: '1' } })
    expect(lerFrontmatter('---\n---\nx').dados).toEqual({})
  })

  it('recusa frontmatter sem fechamento, linha desconhecida e recuo inesperado', () => {
    expect(() => lerFrontmatter('---\na: 1')).toThrow('falta o --- de fechamento')
    expect(() => lerFrontmatter('---\n???\n---')).toThrow('linha não reconhecida')
    expect(() => lerFrontmatter('---\n  a: 1\nb: 2\n---')).toThrow('recuo inesperado')
  })
})
