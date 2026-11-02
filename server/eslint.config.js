import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const MODULOS = ['businessmap', 'acelerato', 'referencia', 'metricas', 'operacao', 'preferencias'];
const SQL = [
  [/SELECT\s+\*/i, 'SELECT * é proibido: liste as colunas (GRANT por coluna, ADR 0014).'],
  [/ON\s+CONFLICT(?!\s+ON\s+CONSTRAINT)/i, 'ON CONFLICT só com alvo explícito: ON CONFLICT ON CONSTRAINT <uq_nome> DO NOTHING.'],
  [/DO\s+UPDATE/i, 'ON CONFLICT ... DO UPDATE é proibido fora das projeções.'],
].flatMap(([re, message]) => [
  { selector: `Literal[value=${re}]`, message },
  { selector: `TemplateElement[value.raw=${re}]`, message },
]);
const MSG_INDEX = 'Módulos se conhecem só pelo index.ts (ADR 0013 §9).';

export default tseslint.config(
  { ignores: ['node_modules', 'dist', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['src/**/*.ts', 'migrations/**/*.ts'], ignores: ['src/plataforma/db/seed.ts'], rules: { 'no-restricted-syntax': ['error', ...SQL] } },
  // Módulos: de fora só pelo index.ts; businessmap e acelerato nunca se importam.
  ...MODULOS.map((m) => ({
    files: [`src/modulos/${m}/**/*.ts`],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { regex: `(modulos/|^\\.\\./)(${MODULOS.filter((x) => x !== m).join('|')})/(?!index\\.js$)`, message: MSG_INDEX },
          ...(m === 'businessmap' ? [{ group: ['**/acelerato', '**/acelerato/*'], message: 'businessmap e acelerato nunca se misturam.' }] : []),
          ...(m === 'acelerato' ? [{ group: ['**/businessmap', '**/businessmap/*'], message: 'businessmap e acelerato nunca se misturam.' }] : []),
          { group: ['@metricas-dspd/mock', '@metricas-dspd/mock/*'], message: 'Só o seed, as extensões mock e os testes de paridade importam o mock.' },
        ],
      }],
    },
  })),
  // Fora dos módulos: nada de arquivo interno de módulo.
  { files: ['src/*.ts', 'src/plataforma/**/*.ts', 'src/entradas/**/*.ts'], ignores: ['src/plataforma/db/seed.ts', 'src/plataforma/db/seed-cli.ts', 'src/plataforma/db/limpar-seed.ts', 'src/plataforma/db/extensoes-mock.ts', 'src/plataforma/db/pesquisa-mock.ts'], rules: {
    'no-restricted-imports': ['error', { patterns: [
      { regex: 'modulos/[^/]+/(?!index\\.js$)', message: MSG_INDEX },
      { group: ['@metricas-dspd/mock', '@metricas-dspd/mock/*'], message: 'Só o seed, as extensões mock e os testes de paridade importam o mock.' },
    ] }],
  } },
  // Serviço e repositório não leem o relógio nem sorteiam.
  { files: ['src/modulos/**/servico.ts', 'src/modulos/**/repositorio.ts'], rules: {
    'no-restricted-syntax': ['error', ...SQL,
      { selector: "MemberExpression[object.name='Date'][property.name='now']", message: 'Relógio é parâmetro.' },
      { selector: "NewExpression[callee.name='Date'][arguments.length=0]", message: 'Relógio é parâmetro.' },
      { selector: "MemberExpression[object.name='Math'][property.name='random']", message: 'Math.random é proibido.' }],
  } },
);
