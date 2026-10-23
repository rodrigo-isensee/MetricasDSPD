import js from '@eslint/js'
import globals from 'globals'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

const proibidoNoCalculo = [
  {
    selector: "MemberExpression[object.name='Math'][property.name='random']",
    message:
      'Math.random é proibido em mock/ e lib/metrics/: use o PRNG com semente (mock/prng.ts).',
  },
  {
    selector: "MemberExpression[object.name='Date'][property.name='now']",
    message: 'Date.now é proibido: "hoje" é sempre um parâmetro.',
  },
  {
    selector: "NewExpression[callee.name='Date'][arguments.length=0]",
    message: 'new Date() sem argumento é proibido: "hoje" é sempre um parâmetro.',
  },
  {
    selector: "CallExpression[callee.object.name='performance'][callee.property.name='now']",
    message: 'Relógio do sistema não entra no cálculo.',
  },
]

const MSG_RAIZ =
  'Os núcleos não importam a raiz que orquestra os dois domínios (calcular, visaoGeral, index).'
const paraRaizDaLib = ['@metricas-dspd/metricas'].map((name) => ({ name, message: MSG_RAIZ }))
const relativosRaizDaLib = {
  group: [
    '../calcular',
    '../visaoGeral',
    '../index',
    '../../calcular',
    '../../visaoGeral',
    '../../index',
  ],
  message: MSG_RAIZ,
}

const MSG_RELATIVO =
  'Pacotes e web se conhecem só pelo nome (@metricas-dspd/*), nunca por caminho relativo (ADR 0002).'
const relativoEntrePacotes = {
  group: [
    '**/packages/**',
    '**/web/src/**',
    '**/contratos/src/**',
    '**/metricas/src/**',
    '**/mock/src/**',
  ],
  message: MSG_RELATIVO,
}
const MSG_SEM_MOCK =
  'A biblioteca de métricas não importa o mock (o grafo é metricas <- mock, ADR 0002).'
const semMock = {
  group: ['@metricas-dspd/mock', '@metricas-dspd/mock/*'],
  message: MSG_SEM_MOCK,
}
const MSG_LIB_NA_UI =
  'Fora de data/mock, o acesso à biblioteca e ao mock é proibido (ADR 0001/0002).'
const semLibNaUI = [
  {
    group: [
      '@metricas-dspd/metricas',
      '@metricas-dspd/metricas/*',
      '@metricas-dspd/mock',
      '@metricas-dspd/mock/*',
    ],
    message: MSG_LIB_NA_UI,
  },
]

const semSpreadEmMinMax = [
  {
    selector:
      "CallExpression[callee.object.name='Math'][callee.property.name=/^(min|max)$/] > SpreadElement",
    message:
      'Math.min/max com spread estoura a pilha em base grande (ADR 0003): use minimo()/maximo() de @metricas-dspd/metricas/core ou um laço.',
  },
]

const semSortDireto = [
  {
    selector: 'CallExpression[callee.property.name=/^(sort|toSorted)$/]',
    message:
      'Ordenação direta é proibida em métrica: use ordenarNeutro (lib/metrics/core/ordenar.ts), cuja última chave é o id.',
  },
]

const semLeituraDeArquivamento = [
  {
    selector: 'MemberExpression[property.name=/^(motivo_descarte|arquivado_em)$/]',
    message:
      'Descarte e arquivamento só são lidos em businessmap/descartado.ts: use descartado(card) (Q6, P1).',
  },
]

// P-T6 (pedido 011, ata 2026-10-14): métrica nenhuma lê identidade de pessoa do card. `responsaveis` e `usuario`
// continuam em modelo.ts por fidelidade ao 4.5, e esta regra protege a leitura (o property test protege a saída).
const semLeituraDePessoa = ['responsaveis', 'usuario'].map((property) => ({
  property,
  message: `Métrica não lê "${property}": nenhuma métrica serve para avaliação individual (briefing 7.1, P-T6, ata 2026-10-14).`,
}))

const MSG_AMOSTRA =
  'criarAmostraInterna só é importado por businessmap/amostra.ts e acelerato/amostra.ts: use amostraBM/amostraAC.'
const soAmostraPorDominio = {
  group: ['**/core/amostra'],
  message: MSG_AMOSTRA,
}

const MSG_PERCENTIL =
  'Percentil e mediana de valores soltos são proibidos nas métricas: use percentisDe/medianaDe sobre uma Amostra (domínio e classe no tipo).'
const semPercentilSolto = ['../core/percentil'].map((name) => ({
  name,
  importNames: ['percentil', 'mediana', 'ordenar'],
  message: MSG_PERCENTIL,
}))

export default tseslint.config(
  {
    ignores: [
      '**/dist',
      'server/**',
      '**/dist-alt',
      '**/dist-api',
      '**/coverage',
      '**/node_modules',
      '**/*.config.js',
      '**/scripts',
      'e2e/playwright-report',
      'e2e/test-results',
      'e2e/perf-results',
    ],
  },
  // O e2e entra no lint só com a regra de fronteira (bloco próprio abaixo): sem as regras estritas do app.
  ...[js.configs.recommended, ...tseslint.configs.strictTypeChecked].map((c) => ({
    ...c,
    ignores: [...(c.ignores ?? []), 'e2e/**'],
  })),
  {
    ignores: ['e2e/**'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/unified-signatures': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Regiões roláveis (tabelas largas) precisam ser focáveis por teclado (WCAG 2.1.1, critério 101).
      'jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['tabpanel', 'region'] }],
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
    },
  },
  // Arquitetura (ADR 0001): a UI só conhece FonteMetricas e os DTOs de contracts/.
  {
    files: ['web/src/features/**', 'web/src/components/**', 'web/src/app/**'],
    ignores: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@metricas-dspd/metricas', '@metricas-dspd/metricas/*'],
              message: 'Componentes e features não calculam: use useMetrica (data/).',
            },
            {
              group: ['@metricas-dspd/mock', '@metricas-dspd/mock/*'],
              message: 'A UI não importa o gerador de mock: use a FonteMetricas.',
            },
            { group: ['recharts'], message: 'Recharts só é importado em components/charts/.' },
            relativoEntrePacotes,
          ],
        },
      ],
    },
  },
  {
    files: ['web/src/components/charts/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [relativoEntrePacotes] }],
    },
  },
  // ADR 0002: contratos é a folha do grafo (sem outros pacotes, sem React); e2e só conhece a app pela URL.
  {
    files: ['packages/contratos/**'],
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@metricas-dspd/*'],
              message: 'contratos não depende de outros pacotes (ADR 0002).',
            },
            {
              group: ['react', 'react/*', 'react-dom', 'react-dom/*'],
              message: 'contratos não conhece React.',
            },
            relativoEntrePacotes,
          ],
        },
      ],
    },
  },
  // data/: só data/mock conhece a biblioteca e o mock, e mesmo assim por import() dinâmico ou import type.
  {
    files: ['web/src/data/**'],
    ignores: ['web/src/data/mock/**', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [...semLibNaUI, relativoEntrePacotes] }],
    },
  },
  {
    files: ['web/src/data/mock/**'],
    ignores: ['**/*.test.ts', '**/*.test.tsx', 'web/src/data/mock/nucleoMock*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [relativoEntrePacotes] }],
      'no-restricted-syntax': [
        'error',
        ...semSpreadEmMinMax,
        ...['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration'].map((tipo) => ({
          selector: `${tipo}[importKind!='type'][exportKind!='type'][source.value=/^@metricas-dspd.(metricas|mock)|^\\.\\/nucleoMock/]`,
          message:
            'Em data/mock a biblioteca, o gerador e o núcleo entram por import() dinâmico (ou import type), para ficar fora do chunk inicial.',
        })),
      ],
    },
  },
  // ADR 0021: o núcleo do mock e o invólucro do Worker rodam fora da thread principal (ou no fallback, por import()
  // dinâmico a partir de MockFonteMetricas); só neles a biblioteca e o gerador entram por import estático.
  {
    files: ['web/src/data/mock/nucleoMock*.ts'],
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [relativoEntrePacotes] }],
      'no-restricted-syntax': ['error', ...semSpreadEmMinMax],
    },
  },
  // metricas não importa mock fora de testes; o e2e não importa pacotes internos.
  {
    files: ['packages/metricas/src/**'],
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [semMock, relativoEntrePacotes] }],
    },
  },
  {
    files: ['e2e/**/*.ts'],
    languageOptions: { parser: tseslint.parser },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@metricas-dspd/*'],
              message: 'O e2e testa a aplicação pela URL: não importa pacotes internos.',
            },
            relativoEntrePacotes,
          ],
        },
      ],
    },
  },
  // BusinessMap e Acelerato nunca se misturam em nenhum cálculo: nem na lib, nem nos geradores do mock.
  // Os núcleos (core, businessmap, acelerato, mock) também não importam a raiz que orquestra os dois
  // domínios (calcular, visaoGeral, index): só a raiz conhece os dois, e só para despachar e compor.
  {
    files: ['packages/metricas/src/businessmap/**', 'packages/mock/src/businessmap/**'],
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/acelerato',
                '**/acelerato/*',
                '@metricas-dspd/metricas/acelerato',
                '@metricas-dspd/mock/acelerato',
              ],
              message: 'BusinessMap e Acelerato nunca se misturam.',
            },
            relativosRaizDaLib,
            soAmostraPorDominio,
            semMock,
            relativoEntrePacotes,
          ],
          paths: [...paraRaizDaLib, ...semPercentilSolto],
        },
      ],
    },
  },
  {
    files: ['packages/metricas/src/businessmap/amostra.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/acelerato',
                '**/acelerato/*',
                '@metricas-dspd/metricas/acelerato',
                '@metricas-dspd/mock/acelerato',
              ],
              message: 'BusinessMap e Acelerato nunca se misturam.',
            },
            relativosRaizDaLib,
            semMock,
            relativoEntrePacotes,
          ],
          paths: [...paraRaizDaLib, ...semPercentilSolto],
        },
      ],
    },
  },
  {
    files: ['packages/metricas/src/acelerato/**', 'packages/mock/src/acelerato/**'],
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/businessmap',
                '**/businessmap/*',
                '@metricas-dspd/metricas/businessmap',
                '@metricas-dspd/mock/businessmap',
              ],
              message: 'BusinessMap e Acelerato nunca se misturam.',
            },
            relativosRaizDaLib,
            soAmostraPorDominio,
            semMock,
            relativoEntrePacotes,
          ],
          paths: [...paraRaizDaLib, ...semPercentilSolto],
        },
      ],
    },
  },
  {
    files: ['packages/metricas/src/acelerato/amostra.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/businessmap',
                '**/businessmap/*',
                '@metricas-dspd/metricas/businessmap',
                '@metricas-dspd/mock/businessmap',
              ],
              message: 'BusinessMap e Acelerato nunca se misturam.',
            },
            relativosRaizDaLib,
            semMock,
            relativoEntrePacotes,
          ],
          paths: [...paraRaizDaLib, ...semPercentilSolto],
        },
      ],
    },
  },
  {
    files: ['packages/metricas/src/core/**'],
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/acelerato',
                '**/acelerato/*',
                '**/businessmap',
                '**/businessmap/*',
                '@metricas-dspd/metricas/acelerato',
                '@metricas-dspd/metricas/businessmap',
              ],
              message: 'O core não conhece os domínios.',
            },
            relativosRaizDaLib,
            semMock,
            relativoEntrePacotes,
          ],
          paths: paraRaizDaLib,
        },
      ],
    },
  },
  // Spread em Math.min/max proibido em todo o src (testes ficam de fora).
  {
    files: ['web/src/**', 'packages/**'],
    ignores: [
      '**/*.test.ts',
      '**/*.test.tsx',
      'packages/metricas/src/**',
      'packages/mock/src/**',
      'web/src/data/mock/**', // bloco próprio, que já inclui semSpreadEmMinMax
    ],
    rules: { 'no-restricted-syntax': ['error', ...semSpreadEmMinMax] },
  },
  {
    files: ['packages/metricas/src/**', 'packages/mock/src/**'],
    ignores: ['**/*.test.ts', 'packages/mock/src/mock.test.ts'],
    rules: { 'no-restricted-syntax': ['error', ...proibidoNoCalculo, ...semSpreadEmMinMax] },
  },
  // Ordenação e arquivamento (M-005): só pelas funções únicas, nos arquivos de métrica dos dois domínios.
  {
    files: ['packages/metricas/src/businessmap/**', 'packages/metricas/src/acelerato/**'],
    ignores: ['**/*.test.ts', 'packages/metricas/src/businessmap/descartado.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...proibidoNoCalculo,
        ...semSpreadEmMinMax,
        ...semSortDireto,
        ...semLeituraDeArquivamento,
      ],
    },
  },
  // Pessoa (P-T6): leitura de `responsaveis`/`usuario` proibida em businessmap/*.ts (a definição do tipo fica em modelo.ts).
  {
    files: ['packages/metricas/src/businessmap/**'],
    ignores: ['**/*.test.ts'],
    rules: { 'no-restricted-properties': ['error', ...semLeituraDePessoa] },
  },
  {
    files: ['packages/mock/src/**'],
    rules: { '@typescript-eslint/no-unnecessary-type-assertion': 'off' },
  },
  {
    files: ['web/src/test/**'],
    rules: { '@typescript-eslint/no-unnecessary-condition': 'off' },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', 'web/src/test/**'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
)
