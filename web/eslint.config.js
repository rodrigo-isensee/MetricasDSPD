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
const paraRaizDaLib = [
  '@/lib/metrics',
  '@/lib/metrics/index',
  '@/lib/metrics/calcular',
  '@/lib/metrics/visaoGeral',
].map((name) => ({ name, message: MSG_RAIZ }))
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

const semSpreadEmMinMax = [
  {
    selector:
      "CallExpression[callee.object.name='Math'][callee.property.name=/^(min|max)$/] > SpreadElement",
    message:
      'Math.min/max com spread estoura a pilha em base grande (ADR 0003): use minimo()/maximo() de lib/metrics/core ou um laço.',
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

const MSG_AMOSTRA =
  'criarAmostraInterna só é importado por businessmap/amostra.ts e acelerato/amostra.ts: use amostraBM/amostraAC.'
const soAmostraPorDominio = {
  group: ['**/core/amostra', '@/lib/metrics/core/amostra'],
  message: MSG_AMOSTRA,
}

const MSG_PERCENTIL =
  'Percentil e mediana de valores soltos são proibidos nas métricas: use percentisDe/medianaDe sobre uma Amostra (domínio e classe no tipo).'
const semPercentilSolto = ['../core/percentil', '@/lib/metrics/core/percentil'].map((name) => ({
  name,
  importNames: ['percentil', 'mediana', 'ordenar'],
  message: MSG_PERCENTIL,
}))

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules', '*.config.js', 'scripts'] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
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
    files: ['src/features/**', 'src/components/**', 'src/app/**'],
    ignores: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/lib/metrics', '@/lib/metrics/*', '**/lib/metrics', '**/lib/metrics/*'],
              message: 'Componentes e features não calculam: use useMetrica (data/).',
            },
            {
              group: ['@/mock', '@/mock/*', '**/mock', '**/mock/*'],
              message: 'A UI não importa o gerador de mock: use a FonteMetricas.',
            },
            { group: ['recharts'], message: 'Recharts só é importado em components/charts/.' },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/charts/**'],
    rules: { 'no-restricted-imports': 'off' },
  },
  // BusinessMap e Acelerato nunca se misturam em nenhum cálculo: nem na lib, nem nos geradores do mock.
  // Os núcleos (core, businessmap, acelerato, mock) também não importam a raiz que orquestra os dois
  // domínios (calcular, visaoGeral, index): só a raiz conhece os dois, e só para despachar e compor.
  {
    files: ['src/lib/metrics/businessmap/**', 'src/mock/businessmap/**'],
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
                '@/lib/metrics/acelerato*',
                '@/mock/acelerato*',
              ],
              message: 'BusinessMap e Acelerato nunca se misturam.',
            },
            relativosRaizDaLib,
            soAmostraPorDominio,
          ],
          paths: [...paraRaizDaLib, ...semPercentilSolto],
        },
      ],
    },
  },
  {
    files: ['src/lib/metrics/businessmap/amostra.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/acelerato',
                '**/acelerato/*',
                '@/lib/metrics/acelerato*',
                '@/mock/acelerato*',
              ],
              message: 'BusinessMap e Acelerato nunca se misturam.',
            },
            relativosRaizDaLib,
          ],
          paths: [...paraRaizDaLib, ...semPercentilSolto],
        },
      ],
    },
  },
  {
    files: ['src/lib/metrics/acelerato/**', 'src/mock/acelerato/**'],
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
                '@/lib/metrics/businessmap*',
                '@/mock/businessmap*',
              ],
              message: 'BusinessMap e Acelerato nunca se misturam.',
            },
            relativosRaizDaLib,
            soAmostraPorDominio,
          ],
          paths: [...paraRaizDaLib, ...semPercentilSolto],
        },
      ],
    },
  },
  {
    files: ['src/lib/metrics/acelerato/amostra.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/businessmap',
                '**/businessmap/*',
                '@/lib/metrics/businessmap*',
                '@/mock/businessmap*',
              ],
              message: 'BusinessMap e Acelerato nunca se misturam.',
            },
            relativosRaizDaLib,
          ],
          paths: [...paraRaizDaLib, ...semPercentilSolto],
        },
      ],
    },
  },
  {
    files: ['src/lib/metrics/core/**'],
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
                '@/lib/metrics/acelerato*',
                '@/lib/metrics/businessmap*',
              ],
              message: 'O core não conhece os domínios.',
            },
            relativosRaizDaLib,
          ],
          paths: paraRaizDaLib,
        },
      ],
    },
  },
  // Spread em Math.min/max proibido em todo o src (testes ficam de fora).
  {
    files: ['src/**'],
    ignores: ['**/*.test.ts', '**/*.test.tsx', 'src/lib/metrics/**', 'src/mock/**'],
    rules: { 'no-restricted-syntax': ['error', ...semSpreadEmMinMax] },
  },
  {
    files: ['src/lib/metrics/**', 'src/mock/**'],
    ignores: ['**/*.test.ts', '**/testing.ts', 'src/mock/mock.test.ts'],
    rules: { 'no-restricted-syntax': ['error', ...proibidoNoCalculo, ...semSpreadEmMinMax] },
  },
  // Ordenação e arquivamento (M-005): só pelas funções únicas, nos arquivos de métrica dos dois domínios.
  {
    files: ['src/lib/metrics/businessmap/**', 'src/lib/metrics/acelerato/**'],
    ignores: ['**/*.test.ts', '**/testing.ts', 'src/lib/metrics/businessmap/descartado.ts'],
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
  {
    files: ['src/mock/**'],
    rules: { '@typescript-eslint/no-unnecessary-type-assertion': 'off' },
  },
  {
    files: ['src/test/**'],
    rules: { '@typescript-eslint/no-unnecessary-condition': 'off' },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', 'src/test/**'],
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
