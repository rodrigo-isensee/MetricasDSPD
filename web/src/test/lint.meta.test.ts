/**
 * Meta-teste de lint (M-004): fixtures que DEVEM falhar. Se alguém afrouxar uma regra de fronteira
 * (BM x AC, Math.min com spread, sort direto, leitura de descarte, Amostra), este teste quebra.
 * Usa as próprias regras do eslint.config.js (blocos com no-restricted-imports/-syntax), sem tipos.
 */
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { ESLint, type Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { beforeAll, describe, expect, it } from 'vitest'

const RAIZ = resolve(import.meta.dirname, '../../..')
let eslint: ESLint

beforeAll(async () => {
  const mod = (await import(
    /* @vite-ignore */ pathToFileURL(resolve(RAIZ, 'eslint.config.js')).href
  )) as {
    default: Linter.Config[]
  }
  const regras = mod.default.filter(
    (c) => c.rules && ('no-restricted-imports' in c.rules || 'no-restricted-syntax' in c.rules),
  )
  eslint = new ESLint({
    cwd: RAIZ,
    overrideConfigFile: true,
    overrideConfig: [
      { files: ['**/*.ts', '**/*.tsx'], languageOptions: { parser: tseslint.parser } },
      ...regras,
    ],
  })
})

const lint = async (codigo: string, arquivo: string) => {
  const [r] = await eslint.lintText(codigo, { filePath: resolve(RAIZ, arquivo) })
  return r?.messages.filter((m) => m.ruleId?.startsWith('no-restricted')) ?? []
}

const DEVE_FALHAR: [string, string, string, RegExp][] = [
  [
    'import BM -> AC (lib)',
    'packages/metricas/src/businessmap/x.ts',
    "import { calcularS1 } from '../acelerato'\nexport const a = calcularS1",
    /nunca se misturam/,
  ],
  [
    'import AC -> BM (lib)',
    'packages/metricas/src/acelerato/x.ts',
    "import { calcularO3 } from '../businessmap'\nexport const a = calcularO3",
    /nunca se misturam/,
  ],
  [
    'import BM -> AC por alias',
    'packages/metricas/src/businessmap/x.ts',
    "import { calcularS1 } from '@metricas-dspd/metricas/acelerato'\nexport const a = calcularS1",
    /nunca se misturam/,
  ],
  [
    'import BM -> AC (mock)',
    'packages/mock/src/businessmap/x.ts',
    "import { gerar } from '../acelerato'\nexport const a = gerar",
    /nunca se misturam/,
  ],
  [
    'core importa domínio',
    'packages/metricas/src/core/x.ts',
    "import { calcularO3 } from '../businessmap'\nexport const a = calcularO3",
    /core não conhece/,
  ],
  [
    'Math.min com spread (lib)',
    'packages/metricas/src/businessmap/x.ts',
    'export const m = (xs: number[]) => Math.min(...xs)',
    /minimo\(\)\/maximo\(\)/,
  ],
  [
    'Math.max com spread (core)',
    'packages/metricas/src/core/x.ts',
    'export const m = (xs: number[]) => Math.max(...xs)',
    /minimo\(\)\/maximo\(\)/,
  ],
  [
    'Math.min com spread (UI)',
    'web/src/features/x/X.tsx',
    'export const m = (xs: number[]) => Math.min(...xs)',
    /minimo\(\)\/maximo\(\)/,
  ],
  [
    'sort direto em métrica BM',
    'packages/metricas/src/businessmap/x.ts',
    'export const o = (xs: number[]) => xs.sort()',
    /ordenarNeutro/,
  ],
  [
    'toSorted em métrica AC',
    'packages/metricas/src/acelerato/x.ts',
    'export const o = (xs: number[]) => xs.toSorted()',
    /ordenarNeutro/,
  ],
  [
    'leitura de motivo_descarte fora de descartado.ts',
    'packages/metricas/src/businessmap/x.ts',
    'export const d = (c: { motivo_descarte: string | null }) => c.motivo_descarte',
    /descartado\(card\)/,
  ],
  [
    'leitura de arquivado_em fora de descartado.ts',
    'packages/metricas/src/businessmap/x.ts',
    'export const d = (c: { arquivado_em: number | null }) => c.arquivado_em',
    /descartado\(card\)/,
  ],
  [
    'criarAmostraInterna fora de amostra.ts',
    'packages/metricas/src/businessmap/x.ts',
    "import { criarAmostraInterna } from '../core/amostra'\nexport const a = criarAmostraInterna",
    /amostraBM\/amostraAC/,
  ],
  [
    'mediana de valores soltos',
    'packages/metricas/src/acelerato/x.ts',
    "import { mediana } from '../core/percentil'\nexport const a = mediana",
    /Amostra/,
  ],
  [
    'Math.random no cálculo',
    'packages/metricas/src/core/x.ts',
    'export const r = () => Math.random()',
    /Math\.random/,
  ],
  [
    'UI importa a biblioteca de métricas',
    'web/src/features/x/X.tsx',
    "import { calcularMetrica } from '@metricas-dspd/metricas'\nexport const a = calcularMetrica",
    /não calculam/,
  ],
]

describe('lint: fixtures que devem falhar', () => {
  it.each(DEVE_FALHAR)('%s', async (_nome, arquivo, codigo, mensagem) => {
    const msgs = await lint(codigo, arquivo)
    expect(msgs.length, 'a regra não pegou a fixture').toBeGreaterThan(0)
    expect(msgs.map((m) => m.message).join(' | ')).toMatch(mensagem)
  })
})

describe('lint: fixtures que devem passar (sem falso positivo)', () => {
  const DEVE_PASSAR: [string, string, string][] = [
    [
      'descartado.ts lê motivo_descarte',
      'packages/metricas/src/businessmap/descartado.ts',
      'export const d = (c: { motivo_descarte: string | null }) => c.motivo_descarte !== null',
    ],
    [
      'businessmap/amostra.ts importa o core/amostra',
      'packages/metricas/src/businessmap/amostra.ts',
      "import { criarAmostraInterna } from '../core/amostra'\nexport const a = criarAmostraInterna",
    ],
    [
      'teste pode ordenar e usar Math.min com spread',
      'packages/metricas/src/businessmap/x.test.ts',
      'export const m = (xs: number[]) => [Math.min(...xs)].sort()',
    ],
    [
      'core ordena',
      'packages/metricas/src/core/x.ts',
      'export const o = (xs: number[]) => [...xs].sort()',
    ],
    [
      'BM importa o core',
      'packages/metricas/src/businessmap/x.ts',
      "import { ordenarNeutro } from '../core/ordenar'\nexport const a = ordenarNeutro",
    ],
  ]
  it.each(DEVE_PASSAR)('%s', async (_nome, arquivo, codigo) => {
    expect(await lint(codigo, arquivo)).toEqual([])
  })
})
