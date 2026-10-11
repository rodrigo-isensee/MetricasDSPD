import {
  cpSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
  mkdirSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { conferir } from './conferir.ts'
import { extrairCitacoes } from './testes.ts'
import { lerTrace } from './trace.ts'
import { listarNos } from './nos.ts'

const MINI = join(import.meta.dirname, '..', 'fixtures', 'mini')
const TESTE = 'server/test/amostra.test.ts'
let raiz = ''

beforeEach(() => {
  raiz = mkdtempSync(join(tmpdir(), 'spec-check-'))
  cpSync(MINI, raiz, { recursive: true })
  renameSync(join(raiz, `${TESTE}.txt`), join(raiz, TESTE))
})
afterEach(() => rmSync(raiz, { recursive: true, force: true }))

const trace = (ligacoes: unknown) =>
  writeFileSync(
    join(raiz, 'siegard-trace.json'),
    JSON.stringify({ specification: 'docs/especificacao', bindings: ligacoes }),
  )
const ligacao = (no: string, ...arquivos: string[]) => ({
  node: no,
  files: arquivos.map((path) => ({ path })),
})
const OK = () => [
  ligacao('rules/metrics/amostra-minima', TESTE),
  ligacao('scenarios/abaixo-de-20', TESTE),
]

describe('conferir', () => {
  it('passa com o mini-spec coerente (e tolera campos opcionais do plugin)', () => {
    const { codigo, linhas } = conferir(raiz)
    expect(codigo).toBe(0)
    expect(linhas).toEqual(['spec-check: ok (2 nós, cada um com teste ligado e citado).'])
  })

  it('é no-op sem docs/especificacao', () => {
    rmSync(join(raiz, 'docs'), { recursive: true })
    const { codigo, linhas } = conferir(raiz)
    expect(codigo).toBe(0)
    expect(linhas[0]).toContain('sem docs/especificacao')
  })

  it('é no-op sem siegard-trace.json', () => {
    rmSync(join(raiz, 'siegard-trace.json'))
    const { codigo, linhas } = conferir(raiz)
    expect(codigo).toBe(0)
    expect(linhas[0]).toContain('sem siegard-trace.json')
  })

  it('reprova citação sem nó', () => {
    const arquivo = join(raiz, TESTE)
    writeFileSync(
      arquivo,
      `${readFileSync(arquivo, 'utf8')}it('[rules/metrics/nao-existe] x', () => {})\n`,
    )
    expect(conferir(raiz).linhas).toContain(
      `citação sem nó: ${TESTE} cita rules/metrics/nao-existe`,
    )
  })

  it('reprova nó sem teste', () => {
    trace([ligacao('rules/metrics/amostra-minima', TESTE)])
    writeFileSync(join(raiz, 'docs/especificacao/rules/metrics/outra.md'), '# Outra')
    const { codigo, linhas } = conferir(raiz)
    expect(codigo).toBe(1)
    expect(linhas).toContain('nó sem teste: rules/metrics/outra')
    expect(linhas.at(-1)).toMatch(/problema\(s\)/)
  })

  it('reprova ligação sem citação', () => {
    writeFileSync(join(raiz, 'server/test/outro.test.ts'), "it('sem citação', () => {})\n")
    trace([...OK(), ligacao('rules/metrics/amostra-minima', 'server/test/outro.test.ts')].slice(1))
    const linhas = conferir(raiz).linhas
    expect(linhas).toContain(
      'ligação sem citação: server/test/outro.test.ts não cita rules/metrics/amostra-minima',
    )
    expect(
      linhas.some(
        (l) => l.startsWith('citação sem ligação') && l.includes('rules/metrics/amostra-minima'),
      ),
    ).toBe(true)
  })

  it('reprova citação sem ligação (nó sem ligação no trace)', () => {
    trace([ligacao('scenarios/abaixo-de-20', TESTE)])
    const linhas = conferir(raiz).linhas
    expect(
      linhas.some(
        (l) => l.startsWith('citação sem ligação') && l.includes('rules/metrics/amostra-minima'),
      ),
    ).toBe(true)
  })

  it('reprova arquivo ligado inexistente e nó ligado inexistente', () => {
    trace(
      [
        ...OK(),
        ligacao('rules/metrics/amostra-minima', 'server/test/sumiu.test.ts'),
        ligacao('rules/fantasma', TESTE),
      ].slice(1),
    )
    const linhas = conferir(raiz).linhas
    expect(linhas).toContain(
      'arquivo ligado inexistente: server/test/sumiu.test.ts (nó rules/metrics/amostra-minima)',
    )
    expect(linhas).toContain('nó ligado inexistente: rules/fantasma')
  })

  it('reprova trace malformado', () => {
    writeFileSync(join(raiz, 'siegard-trace.json'), '{')
    expect(conferir(raiz).linhas[0]).toBe('siegard-trace.json: JSON inválido')
  })

  it('ignora fixtures, node_modules e dist ao procurar testes', () => {
    for (const pasta of ['node_modules/x', 'dist']) {
      mkdirSync(join(raiz, pasta), { recursive: true })
      writeFileSync(join(raiz, pasta, 'a.test.ts'), "it('[rules/lixo]', () => {})\n")
    }
    expect(conferir(raiz).codigo).toBe(0)
  })
})

describe('lerTrace', () => {
  it('exige a lista bindings', () => {
    expect(lerTrace('[]').problemas).toEqual(['siegard-trace.json: falta a lista "bindings"'])
    expect(lerTrace('{}').problemas).toHaveLength(1)
  })

  it('aponta ligação malformada e nó duplicado, e ignora arquivo sem path', () => {
    const { ligacoes, problemas } = lerTrace(
      JSON.stringify({
        bindings: [
          1,
          { node: 'rules/a' },
          { node: 'rules/b', files: [{ path: 'x' }, 3, {}] },
          { node: 'rules/b', files: [] },
        ],
      }),
    )
    expect(problemas).toEqual([
      'siegard-trace.json: ligação sem "node" ou sem "files"',
      'siegard-trace.json: ligação sem "node" ou sem "files"',
      'siegard-trace.json: nó ligado duas vezes: rules/b',
    ])
    expect(ligacoes[0]).toEqual({ no: 'rules/b', arquivos: ['x'] })
  })
})

describe('extrairCitacoes', () => {
  it('lê só nomes de it, test e describe, com aspas simples, duplas e crase', () => {
    const codigo = [
      "it('[rules/a] x', () => {})",
      'test("[scenarios/b/c] y", () => {})',
      'describe.skip(`[rules/a] [rules/d.]`, () => {})',
      "const texto = '[rules/fora]'",
      "it('sem \\' citação', () => {})",
    ].join('\n')
    expect(extrairCitacoes(codigo)).toEqual(['rules/a', 'rules/d', 'scenarios/b/c'])
  })
})

describe('listarNos', () => {
  it('lista rules e scenarios sem _context.md e aceita raiz sem as pastas', () => {
    expect(listarNos(join(raiz, 'docs/especificacao'))).toEqual([
      'rules/metrics/amostra-minima',
      'scenarios/abaixo-de-20',
    ])
    expect(listarNos(join(raiz, 'docs'))).toEqual([])
  })
})
