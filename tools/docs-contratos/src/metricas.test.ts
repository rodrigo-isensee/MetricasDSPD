import { describe, expect, it } from 'vitest'
import {
  caminhoFotografia,
  jsonCompacto,
  modeloIndiceMetricas,
  modeloMetrica,
  renderIndiceMetricas,
  renderMetrica,
  truncar,
  type InsumoMetrica,
  type Regra,
} from './metricas.ts'

const regra: Regra = {
  dominio: 'businessmap',
  segmentacao: ['tipo'],
  ordem: 'neutra',
  incluiArquivados: true,
  minimo: 20,
  minimoSobre: ['percentis'],
  granularidade: 'story',
  refBriefing: '06 O9 | 4.1',
  status: 'ok',
}
const base: InsumoMetrica = {
  id: 'O9',
  rota: '/api/v1/metricas/O9',
  parametros: [{ nome: 'periodo', tipo: 'string', obrigatorio: true, detalhe: 'valores: a | b' }],
  filtrosAplicaveis: ['equipe'],
  filtrosDoDominio: ['equipe', 'tipo'],
  regra,
  cartoes: [{ painel: 'operacional', id: 'o9', rotulo: 'Os três relógios', secao: 'tempo' }],
  schema: { type: 'object' },
  exemplo: { itens: [1, 2, 3] },
}

describe('truncar e jsonCompacto', () => {
  it('trunca listas longas em qualquer profundidade e preserva escalares', () => {
    expect(truncar({ a: [1, 2, 3], b: { c: [[1, 2, 3], 'x'] }, d: null })).toEqual({
      a: [1, 2],
      b: { c: [[1, 2], 'x'] },
      d: null,
    })
    expect(truncar([1, 2, 3], 1)).toEqual([1])
  })

  it('deixa curtos numa linha e indenta os longos', () => {
    expect(jsonCompacto({ a: 1 })).toBe('{"a":1}')
    expect(jsonCompacto(5)).toBe('5')
    const longo = { lista: Array.from({ length: 30 }, (_, i) => `item-${i}`), x: { y: 1 } }
    const texto = jsonCompacto(longo)
    expect(texto.startsWith('{\n  "lista": [\n    "item-0",')).toBe(true)
    expect(texto).toContain('"x": {"y":1}')
    expect(JSON.parse(texto)).toEqual(longo)
  })
})

describe('modelos e caminhos', () => {
  it('têm título, propósito e público', () => {
    expect(modeloMetrica('O9').titulo).toContain('O9')
    expect(modeloIndiceMetricas.publico).not.toBe('')
    expect(caminhoFotografia('eventos', 'a.b')).toBe('docs/contratos/snapshots/eventos/a.b.json')
  })
})

describe('renderMetrica', () => {
  it('traz rota, filtros, regras, cartões, schema e exemplo truncado', () => {
    const md = renderMetrica(base)
    expect(md).toContain('`GET /api/v1/metricas/O9`')
    expect(md).toContain('| `periodo` | string | sim | valores: a \\| b |')
    expect(md).toContain('- Atuam nesta métrica: equipe.')
    expect(md).toContain('- Não atuam: tipo.')
    expect(md).toContain('| Mínimo de amostra | 20 itens por classe |')
    expect(md).toContain('| Referência no briefing | 06 O9 \\| 4.1 |')
    expect(md).toContain('- Painel `operacional`, seção `tempo`: Os três relógios (`o9`).')
    expect(md).toContain('[`../snapshots/resultados/O9.json`](../snapshots/resultados/O9.json)')
    expect(md).toContain('{"itens":[1,2]}')
    expect(md).not.toContain('pendente-usuario')
  })

  it('métrica sem mínimo, com lista de granularidades, pendente, sem cartão e sem filtros', () => {
    const md = renderMetrica({
      ...base,
      regra: {
        ...regra,
        minimo: 0,
        minimoSobre: [],
        granularidade: ['story', 'frente'],
        status: 'pendente-usuario',
      },
      cartoes: [],
      filtrosAplicaveis: [],
      filtrosDoDominio: [],
    })
    expect(md).toContain('0 (contagem, censo ou retrato: sem mínimo)')
    expect(md).toContain('| Granularidade | story, frente |')
    expect(md).toContain('| Partes sob mínimo | nenhuma |')
    expect(md).toContain('Status `pendente-usuario`')
    expect(md).toContain('Nenhum cartão do catálogo')
    expect(md).toContain('- Atuam nesta métrica: nenhuma.')
  })

  it('métrica sem regra explica que só reexpõe resultados', () => {
    expect(renderMetrica({ ...base, regra: undefined })).toContain(
      'Sem entrada em `REGRAS_METRICA`',
    )
  })
})

describe('renderIndiceMetricas', () => {
  it('lista uma linha por métrica, com traços quando não há regra ou cartão', () => {
    const md = renderIndiceMetricas([
      base,
      { ...base, id: 'VISAO_GERAL', regra: undefined, cartoes: [] },
    ])
    expect(md).toContain('2 métricas')
    expect(md).toContain(
      '| [`O9`](O9.md) | Os três relógios | businessmap | `/api/v1/metricas/O9` | story | 20 | ok |',
    )
    expect(md).toContain(
      '| [`VISAO_GERAL`](VISAO_GERAL.md) | - | composição | `/api/v1/metricas/O9` | - | - | - |',
    )
  })
})
