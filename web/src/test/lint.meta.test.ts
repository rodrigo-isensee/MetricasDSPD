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
    (c) =>
      c.rules &&
      ('no-restricted-imports' in c.rules ||
        'no-restricted-syntax' in c.rules ||
        'no-restricted-properties' in c.rules),
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
    'leitura de responsaveis em businessmap (P-T6)',
    'packages/metricas/src/businessmap/x.ts',
    'export const d = (c: { responsaveis: string[] }) => c.responsaveis.length',
    /nenhuma métrica serve para avaliação individual/,
  ],
  [
    'leitura de usuario em businessmap (P-T6)',
    'packages/metricas/src/businessmap/x.ts',
    "export const d = (c: { usuario: string }) => c['usuario']",
    /nenhuma métrica serve para avaliação individual/,
  ],
  [
    'desestruturação de responsaveis em businessmap (P-T6)',
    'packages/metricas/src/businessmap/x.ts',
    'export const d = (c: { responsaveis: string[] }) => { const { responsaveis } = c; return responsaveis }',
    /nenhuma métrica serve para avaliação individual/,
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
  [
    'contratos importa outro pacote',
    'packages/contratos/src/x.ts',
    "import { calcularMetrica } from '@metricas-dspd/metricas'\nexport const a = calcularMetrica",
    /não depende de outros pacotes/,
  ],
  [
    'contratos importa React',
    'packages/contratos/src/x.ts',
    "import { useState } from 'react'\nexport const a = useState",
    /não conhece React/,
  ],
  [
    'data/ (fora de data/mock) importa a biblioteca',
    'web/src/data/http/x.ts',
    "import { calcularMetrica } from '@metricas-dspd/metricas'\nexport const a = calcularMetrica",
    /Fora de data\/mock/,
  ],
  [
    'data/ (fora de data/mock) importa o mock',
    'web/src/data/x.ts',
    "import { gerarBaseMock } from '@metricas-dspd/mock'\nexport const a = gerarBaseMock",
    /Fora de data\/mock/,
  ],
  [
    'data/mock com import estático da biblioteca',
    'web/src/data/mock/x.ts',
    "import { calcularMetrica } from '@metricas-dspd/metricas'\nexport const a = calcularMetrica",
    /import\(\) dinâmico/,
  ],
  [
    'data/mock com import estático do mock',
    'web/src/data/mock/x.ts',
    "import { gerarBaseMock } from '@metricas-dspd/mock'\nexport const a = gerarBaseMock",
    /import\(\) dinâmico/,
  ],
  [
    'metricas importa o mock (raiz da lib)',
    'packages/metricas/src/x.ts',
    "import { gerarBaseMock } from '@metricas-dspd/mock'\nexport const a = gerarBaseMock",
    /não importa o mock/,
  ],
  [
    'metricas importa o mock (domínio)',
    'packages/metricas/src/businessmap/x.ts',
    "import { gerarBaseMock } from '@metricas-dspd/mock'\nexport const a = gerarBaseMock",
    /não importa o mock/,
  ],
  [
    'e2e importa pacote interno',
    'e2e/tests/x.ts',
    "import { gerarBaseMock } from '@metricas-dspd/mock'\nexport const a = gerarBaseMock",
    /não importa pacotes internos/,
  ],
  [
    'e2e importa por caminho relativo',
    'e2e/tests/x.ts',
    "import { a } from '../../packages/mock/src/index'\nexport const b = a",
    /nunca por caminho relativo/,
  ],
  [
    'pacote importa outro por caminho relativo',
    'packages/metricas/src/businessmap/x.ts',
    "import { a } from '../../../contratos/src/index'\nexport const b = a",
    /nunca por caminho relativo/,
  ],
  [
    'web importa pacote por caminho relativo',
    'web/src/features/x/X.tsx',
    "import { a } from '../../../../packages/contratos/src/index'\nexport const b = a",
    /nunca por caminho relativo/,
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
      'modelo.ts só declara responsaveis (tipo), sem ler',
      'packages/metricas/src/businessmap/modelo.ts',
      'export interface C { responsaveis: string[]; usuario: string }',
    ],
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
      'data/mock importa a biblioteca por import() dinâmico e por import type',
      'web/src/data/mock/x.ts',
      "import type { ContextosMetricas } from '@metricas-dspd/metricas'\nexport const a = () => import('@metricas-dspd/metricas')\nexport type T = ContextosMetricas",
    ],
    [
      'data/mock com import estático em teste',
      'web/src/data/mock/x.test.ts',
      "import { gerarBaseMock } from '@metricas-dspd/mock'\nexport const a = gerarBaseMock",
    ],
    [
      'e2e importa só o playwright',
      'e2e/tests/x.ts',
      "import { test } from '@playwright/test'\nexport const a = test",
    ],
    [
      'metricas importa o mock em teste',
      'packages/metricas/src/x.test.ts',
      "import { gerarBaseMock } from '@metricas-dspd/mock'\nexport const a = gerarBaseMock",
    ],
    [
      'mock importa a biblioteca',
      'packages/mock/src/x.ts',
      "import { calcularMetrica } from '@metricas-dspd/metricas'\nexport const a = calcularMetrica",
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
