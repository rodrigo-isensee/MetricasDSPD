import { describe, expect, it } from 'vitest'
import { extrairBloco } from './blocos.ts'
import {
  alvosGerados,
  ARQUIVO_ACEITAS,
  ARQUIVO_AGREGADOS,
  conferirFotografias,
  conferirGerados,
  fotografar,
  gravarGerados,
  type Insumos,
} from './gerador.ts'
import { criarIoMemoria } from './io-memoria.ts'
import type { InsumoMetrica } from './metricas.ts'

const metrica = (id: string): InsumoMetrica => ({
  id,
  rota: `/api/v1/metricas/${id}`,
  parametros: [],
  filtrosAplicaveis: [],
  filtrosDoDominio: [],
  regra: undefined,
  cartoes: [],
  schema: { type: 'object', properties: { a: { type: 'string' } }, required: ['a'] },
  exemplo: {},
})
const insumos: Insumos = {
  metricas: [metrica('O1')],
  eventos: [
    {
      tipo: 'coleta.concluida',
      schema: { type: 'object', properties: { s: { type: 'string' } }, required: ['s'] },
    },
  ],
  caminhosV2: [],
}
const dominio = {
  'docs/especificacao/domain/flow/_context.md':
    '---\nstrategic: core\n---\n\n## Description\n\nFluxo.\n',
  'docs/especificacao/domain/flow/card.md': '---\ntype: aggregate-root\n---\n',
  'docs/especificacao/domain/README.md': '# ignorado',
  'docs/especificacao/domain/flow/sub/fundo.md': '# ignorado',
}

describe('alvosGerados e gravarGerados', () => {
  it('uma página por métrica, o índice e o 03-agregados (README e arquivos fora do padrão do domínio são ignorados)', () => {
    const io = criarIoMemoria(dominio)
    expect(alvosGerados(io, insumos).map((a) => a.caminho)).toEqual([
      'docs/contratos/metricas/O1.md',
      'docs/contratos/metricas/README.md',
      ARQUIVO_AGREGADOS,
    ])
    expect(alvosGerados(io, insumos)[2]!.bloco).toContain('Fluxo.')
    expect(alvosGerados(io, insumos)[2]!.bloco).not.toContain('ignorado')
  })

  it('grava as páginas novas e, na segunda vez, não grava nada; preserva texto à mão fora das marcas', () => {
    const io = criarIoMemoria(dominio)
    expect(gravarGerados(io, insumos, '2026-10-11')).toHaveLength(3)
    expect(gravarGerados(io, insumos, '2026-10-12')).toEqual([])
    const pagina = io.ler('docs/contratos/metricas/O1.md')!
    io.escrever('docs/contratos/metricas/O1.md', `${pagina}\nNota escrita à mão.\n`)
    const novo = { ...insumos, metricas: [{ ...metrica('O1'), rota: '/api/v1/metricas/O1-novo' }] }
    expect(gravarGerados(io, novo, '2026-10-13')).toEqual([
      'docs/contratos/metricas/O1.md',
      'docs/contratos/metricas/README.md',
    ])
    expect(io.ler('docs/contratos/metricas/O1.md')).toContain('Nota escrita à mão.')
    expect(io.ler('docs/contratos/metricas/O1.md')).toContain('Revisão: 2026-10-13.')
  })
})

describe('conferirGerados', () => {
  it('em dia: nenhum problema', () => {
    const io = criarIoMemoria(dominio)
    gravarGerados(io, insumos, '2026-10-11')
    expect(conferirGerados(io, insumos)).toEqual([])
  })

  it('acusa ausente, sem marcas e desatualizada', () => {
    const io = criarIoMemoria(dominio)
    gravarGerados(io, insumos, '2026-10-11')
    io.arquivos.delete('docs/contratos/metricas/README.md')
    io.escrever('docs/contratos/metricas/O1.md', '# à mão')
    const antiga = io.ler(ARQUIVO_AGREGADOS)!
    io.escrever(ARQUIVO_AGREGADOS, antiga.replace('Fluxo.', 'Fluxo velho.'))
    expect(extrairBloco(io.ler(ARQUIVO_AGREGADOS)!)).toContain('Fluxo velho.')
    expect(conferirGerados(io, insumos)).toEqual([
      'docs/contratos/metricas/O1.md: sem as marcas de bloco gerado',
      'docs/contratos/metricas/README.md: página gerada ausente; rode `pnpm run docs:gerar`',
      `${ARQUIVO_AGREGADOS}: desatualizada; rode \`pnpm run docs:gerar\``,
    ])
  })
})

describe('fotografar e conferirFotografias', () => {
  it('sem fotografia: acusa; fotografar grava tudo; depois fica em dia e a segunda rodada não grava', () => {
    const io = criarIoMemoria()
    expect(conferirFotografias(io, insumos)).toHaveLength(2)
    const r = fotografar(io, insumos)
    expect(r.gravadas).toEqual([
      'docs/contratos/snapshots/resultados/O1.json',
      'docs/contratos/snapshots/eventos/coleta.concluida.json',
    ])
    expect(conferirFotografias(io, insumos)).toEqual([])
    expect(fotografar(io, insumos)).toEqual({ problemas: [], gravadas: [] })
  })

  it('mudança incompatível trava o fotografar até haver aceite; compatível só pede nova fotografia', () => {
    const io = criarIoMemoria()
    fotografar(io, insumos)
    const quebra: Insumos = {
      ...insumos,
      metricas: [{ ...metrica('O1'), schema: { type: 'object', properties: {}, required: [] } }],
    }
    expect(conferirFotografias(io, quebra)[0]).toContain('INCOMPATÍVEL')
    const r = fotografar(io, quebra)
    expect(r.gravadas).toEqual([])
    expect(r.problemas[0]).toContain('INCOMPATÍVEL')
    io.escrever(
      ARQUIVO_ACEITAS,
      JSON.stringify({
        aceitas: [{ contrato: 'O1', motivo: 'campo removido a pedido', data: '2026-10-11' }],
      }),
    )
    expect(fotografar(io, quebra).gravadas).toEqual(['docs/contratos/snapshots/resultados/O1.json'])
    expect(conferirFotografias(io, quebra)).toEqual([])

    const compat: Insumos = {
      ...insumos,
      metricas: [
        {
          ...metrica('O1'),
          schema: {
            type: 'object',
            properties: { a: { type: 'string' }, b: { type: 'number' } },
            required: ['a'],
          },
        },
      ],
    }
    const io2 = criarIoMemoria()
    fotografar(io2, insumos)
    expect(conferirFotografias(io2, compat)[0]).toContain('desatualizada')
  })

  it('rota v2 aceita a quebra da métrica', () => {
    const io = criarIoMemoria()
    fotografar(io, insumos)
    const quebra: Insumos = {
      ...insumos,
      caminhosV2: ['/api/v2/metricas/O1'],
      metricas: [{ ...metrica('O1'), schema: { type: 'string' } }],
    }
    expect(fotografar(io, quebra).problemas).toEqual([])
  })
})
