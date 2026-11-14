import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const MODULOS = ['businessmap', 'acelerato', 'referencia', 'metricas', 'operacao', 'preferencias', 'apontamento'];
const MSG_POOL_APONTAMENTO = 'O pool do papel dspd_api_apontamento é aberto e usado só em modulos/apontamento (ADR 0020 revisão 4, R4-5); fora dele só a entrada api e o app o conhecem.';
const SQL = [
  [/SELECT\s+\*/i, 'SELECT * é proibido: liste as colunas (GRANT por coluna, ADR 0014).'],
  [/ON\s+CONFLICT(?!\s+ON\s+CONSTRAINT)/i, 'ON CONFLICT só com alvo explícito: ON CONFLICT ON CONSTRAINT <uq_nome> DO NOTHING.'],
  [/DO\s+UPDATE/i, 'ON CONFLICT ... DO UPDATE é proibido fora das projeções.'],
].flatMap(([re, message]) => [
  { selector: `Literal[value=${re}]`, message },
  { selector: `TemplateElement[value.raw=${re}]`, message },
]);
const MSG_RAIZ = 'A raiz de @metricas-dspd/metricas só entra em modulos/metricas; fora dele use o subcaminho (/core, /businessmap, /acelerato) ou o index do módulo (ADR 0013 §9).';
const PATH_RAIZ = { name: '@metricas-dspd/metricas', message: MSG_RAIZ };
const MSG_INDEX = 'Módulos se conhecem só pelo index.ts (ADR 0013 §9).';
// Fora dos módulos, o módulo da aba (e por ele o pool do papel da aba) só entra em quem monta a API: app, entrada api e a geração do OpenAPI (A1 do parecer 059-rota-apontamento).
const FORA_DOS_MODULOS = [
  { regex: 'modulos/[^/]+/(?!index\\.js$)', message: MSG_INDEX },
  { group: ['@metricas-dspd/metricas/coletor'], message: 'A biblioteca do coletor só entra em modulos/businessmap (ADR 0020, item 3).' },
  { group: ['@metricas-dspd/mock', '@metricas-dspd/mock/*'], message: 'Só o seed, as extensões mock e os testes de paridade importam o mock.' },
];
const IMPORTA_O_MODULO_DA_ABA = 'modulos/apontamento(/|$)';
const MONTAM_A_API = ['src/app.ts', 'src/entradas/api.ts', 'src/entradas/openapi.ts'];

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
        ...(m !== 'metricas' ? { paths: [PATH_RAIZ] } : {}),
        patterns: [
          { regex: `(modulos/|^\\.\\./)(${MODULOS.filter((x) => x !== m).join('|')})/(?!index\\.js$)`, message: MSG_INDEX },
          ...(m !== 'businessmap' ? [{ group: ['@metricas-dspd/metricas/coletor', '**/metricas/src/coletor', '**/metricas/src/coletor/*'], message: 'A biblioteca do coletor (identidade e comentário em memória) só entra em modulos/businessmap (ADR 0020, item 3).' }] : []),
          ...(m !== 'apontamento' ? [{ group: ['**/modulos/apontamento', '**/modulos/apontamento/*', '../apontamento', '../apontamento/*'], message: MSG_POOL_APONTAMENTO }] : []),
          ...(m === 'businessmap' ? [{ group: ['**/acelerato', '**/acelerato/*'], message: 'businessmap e acelerato nunca se misturam.' }] : []),
          ...(m === 'acelerato' ? [{ group: ['**/businessmap', '**/businessmap/*'], message: 'businessmap e acelerato nunca se misturam.' }] : []),
          { group: ['@metricas-dspd/mock', '@metricas-dspd/mock/*'], message: 'Só o seed, as extensões mock e os testes de paridade importam o mock.' },
        ],
      }],
    },
  })),
  // R4-5 (ADR 0020 revisão 4): a regra do pool não se desliga por diretiva inline em lugar nenhum do server (A1 do parecer da rota).
  { files: ['**/*.ts'], linterOptions: { noInlineConfig: true } },
  // Fora dos módulos: todo src/** (pasta nova entra sem lista; o teste fronteira-eslint.test.ts quebra se uma escapar): nada de arquivo interno de módulo, e o módulo da aba só entra em app, entrada api e openapi.
  { files: ['src/**/*.ts'], ignores: ['src/modulos/**', 'src/plataforma/db/seed.ts', 'src/plataforma/db/seed-cli.ts', 'src/plataforma/db/limpar-seed.ts', 'src/plataforma/db/extensoes-mock.ts', 'src/plataforma/db/pesquisa-mock.ts', ...MONTAM_A_API], rules: {
    'no-restricted-imports': ['error', { paths: [PATH_RAIZ], patterns: [...FORA_DOS_MODULOS, { regex: IMPORTA_O_MODULO_DA_ABA, message: MSG_POOL_APONTAMENTO }] }],
  } },
  { files: MONTAM_A_API, rules: { 'no-restricted-imports': ['error', { paths: [PATH_RAIZ], patterns: FORA_DOS_MODULOS }] } },
  // Seed e extensões mock ficam fora das regras de padrão acima, mas a raiz da biblioteca de métricas também lhes é vedada (ADR 0013 §9).
  { files: ['src/plataforma/db/seed.ts', 'src/plataforma/db/seed-cli.ts', 'src/plataforma/db/limpar-seed.ts', 'src/plataforma/db/extensoes-mock.ts', 'src/plataforma/db/pesquisa-mock.ts'], rules: { 'no-restricted-imports': ['error', { paths: [PATH_RAIZ] }] } },
  // Serviço e repositório não leem o relógio nem sorteiam.
  { files: ['src/modulos/**/servico.ts', 'src/modulos/**/repositorio.ts'], rules: {
    'no-restricted-syntax': ['error', ...SQL,
      { selector: "MemberExpression[object.name='Date'][property.name='now']", message: 'Relógio é parâmetro.' },
      { selector: "NewExpression[callee.name='Date'][arguments.length=0]", message: 'Relógio é parâmetro.' },
      { selector: "MemberExpression[object.name='Math'][property.name='random']", message: 'Math.random é proibido.' }],
  } },
);
