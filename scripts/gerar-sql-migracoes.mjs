// Gera os scripts SQL das migrações para o DBA (pedido 105, E7.246). Não é chamado direto: use `pnpm run db:sql`
// (scripts/gerar-sql-migracoes.sh), que sobe um Postgres descartável, e roda este arquivo via tsx dentro de `server/`.
// Fases: `arquivos` (papéis + um .sql por migração, lidos de server/migrations/*.ts, sem banco) e `grants` (GRANTs + consolidado,
// lidos do catálogo do banco descartável já migrado, PG_MIGRADOR_URL). Nenhum segredo: senhas vêm do ambiente, lidas pelo psql (\getenv).
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA = join(RAIZ, 'deploy', 'sql');
const MIGRACOES = join(RAIZ, 'server', 'migrations');
const DB = pathToFileURL(join(RAIZ, 'server', 'src', 'plataforma', 'db')).href;
const COMANDO = 'pnpm run db:sql';
const CAB = `-- GERADO por \`${COMANDO}\` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.\n-- Sem segredo neste arquivo.\n`;
const PREPARO = '0000_preparo.sql';
const GRANTS = '9000_grants.sql';
// Cinco papéis de login (senha lida por \getenv, nunca por -v) e três sem uso em produção (NOLOGIN, sem senha, sem CONNECT).
const PAPEL_SENHA = [
  ['dspd_migrador', 'pwd_migrador', 'PWD_MIGRADOR'], ['dspd_coletor', 'pwd_coletor', 'PWD_COLETOR'], ['dspd_api', 'pwd_api', 'PWD_API'],
  ['dspd_ref', 'pwd_ref', 'PWD_REF'], ['dspd_api_apontamento', 'pwd_apontamento', 'PWD_APONTAMENTO'],
];
const PAPEL_SEM_LOGIN = ['dspd_webhook', 'dspd_automacao', 'dspd_pesquisa'];
const fim = (s) => (s.trimEnd().endsWith(';') ? s.trimEnd() : `${s.trimEnd()};`);
const escrever = (nome, txt) => writeFileSync(join(SAIDA, nome), txt, 'utf8');
const bloco = (nome, instrucoes, registra) =>
  `${CAB}-- ${nome}\nBEGIN;\n${instrucoes.map(fim).join('\n\n')}\n${registra ? `\nINSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('${registra}', now());\n` : ''}COMMIT;\n`;

const fase = process.argv[2];
const { montarEsquemas } = await import(`${DB}/esquemas.ts`);
const S = montarEsquemas('');

if (fase === 'arquivos') {
  mkdirSync(SAIDA, { recursive: true });
  for (const f of readdirSync(SAIDA)) if (f.endsWith('.sql')) rmSync(join(SAIDA, f));
  // Papéis e banco: o DBA roda uma vez, como administrador; senhas por variável de AMBIENTE (\getenv), nunca por -v (histórico e lista de processos).
  const ler = PAPEL_SENHA.map(([, v, e]) => `\\getenv ${v} ${e}`).join('\n');
  // Conferência antes do primeiro CREATE: variável ausente ou vazia para o script, nomeando a que falta (nada é criado pela metade).
  const conferir = PAPEL_SENHA.map(([, v, e]) =>
    `\\if :{?${v}}\n\\else\n  DO $$ BEGIN RAISE EXCEPTION 'falta a variável de ambiente ${e}; nada foi criado'; END $$;\n\\endif\n` +
    `SELECT (:'${v}' = '') AS ${v}_vazia \\gset\n\\if :${v}_vazia\n  DO $$ BEGIN RAISE EXCEPTION '${e} está vazia; nada foi criado'; END $$;\n\\endif`).join('\n');
  const criar = PAPEL_SENHA.map(([p, v]) => `CREATE ROLE ${p} LOGIN PASSWORD :'${v}';`).join('\n');
  const semLogin = PAPEL_SEM_LOGIN.map((p) => `CREATE ROLE ${p} NOLOGIN;`).join('\n');
  const logins = PAPEL_SENHA.map(([p]) => p).join(', ');
  const envs = PAPEL_SENHA.map(([, , e]) => e).join(', ');
  escrever('00_papeis_e_banco.sql', `${CAB}-- Roda UMA vez, como administrador, conectado ao banco \`postgres\` (psql 15 ou mais novo, por causa do \\getenv).
-- Antes, no shell do DBA: \`read -rs <VARIAVEL>; export <VARIAVEL>\` para cada uma de ${envs}; \`unset\` ao terminar.
--   psql "host=<servidor> dbname=postgres sslmode=verify-full" -v ON_ERROR_STOP=1 -f 00_papeis_e_banco.sql
-- Variável ausente ou vazia: o script para antes do primeiro CREATE e diz qual falta (falha fechada, nada é criado). Nenhuma senha vai na linha de comando; o SET abaixo evita o comando com senha no log do servidor.
-- webhook, automação e pesquisa ficam NOLOGIN, sem senha e sem CONNECT (existem só para os GRANTs das migrações); ligar um deles é decisão do dono.
-- Se falhar no meio, nada é desfeito sozinho: veja "Se o roteiro de papéis falhar" em docs/devops/105-implantacao-vm.md.
-- Se a empresa já criou o banco \`metricas\` (UTF8), apague a linha CREATE DATABASE.
${ler}
${conferir}
SET log_statement = 'none';
${criar}
${semLogin}
CREATE DATABASE metricas ENCODING 'UTF8' TEMPLATE template0;
\\connect metricas
ALTER DATABASE metricas SET timezone TO 'UTC';
REVOKE ALL ON DATABASE metricas FROM PUBLIC;
GRANT CONNECT ON DATABASE metricas TO ${logins};
GRANT CREATE ON DATABASE metricas TO dspd_migrador;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
`);
  // Preparo (papel dspd_migrador, banco metricas): a tabela de controle do node-pg-migrate, para a aplicação reconhecer o que o DBA aplicou.
  escrever(PREPARO, `${CAB}-- ${PREPARO}
BEGIN;
CREATE SCHEMA IF NOT EXISTS ${S.core};
CREATE TABLE ${S.core}.pgmigrations (id SERIAL PRIMARY KEY, name varchar(255) NOT NULL, run_on timestamp NOT NULL);
COMMIT;
`);
  const nomes = readdirSync(MIGRACOES).filter((f) => /^\d{4}_.+\.ts$/.test(f)).sort();
  for (const arq of nomes) {
    const { ddl } = await import(pathToFileURL(join(MIGRACOES, arq)).href);
    const nome = arq.replace(/\.ts$/, '');
    escrever(`${nome}.sql`, bloco(`${nome}.sql`, ddl(S).up, nome));
  }
  console.log(`${nomes.length} migrações em ${SAIDA}`);
} else if (fase === 'grants') {
  const url = process.env.PG_MIGRADOR_URL;
  if (!url) throw new Error('PG_MIGRADOR_URL ausente (banco descartável já migrado)');
  const pg = createRequire(join(RAIZ, 'server', 'package.json'))('pg');
  const { lerCatalogo } = await import(`${DB}/migrar.ts`);
  const { gerarGrants } = await import(`${DB}/grants.ts`);
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    const stmts = gerarGrants(S, await lerCatalogo(c, S));
    escrever(GRANTS, bloco(`${GRANTS} (rode depois de TODAS as migrações; gere de novo a cada migração nova)`, stmts));
  } finally {
    await c.end();
  }
  // Consolidado: preparo + migrações + GRANTs em UMA transação (como o runner: tudo ou nada).
  const arqs = readdirSync(SAIDA).filter((f) => /^\d{4}_.+\.sql$/.test(f)).sort();
  const corpo = arqs
    .map((f) => readFileSync(join(SAIDA, f), 'utf8').split('\n').filter((l) => !l.startsWith('--') && l !== 'BEGIN;' && l !== 'COMMIT;').join('\n').trim())
    .join('\n\n');
  escrever('consolidado.sql', `${CAB}-- Tudo em uma transação: roda como \`dspd_migrador\`, no banco \`metricas\`, depois do 00_papeis_e_banco.sql.
--   psql -v ON_ERROR_STOP=1 -h <servidor> -U dspd_migrador -d metricas -f consolidado.sql
SET TimeZone TO 'UTC';
BEGIN;
${corpo}
COMMIT;
`);
  console.log(`${GRANTS} e consolidado.sql gerados (${arqs.length} arquivos)`);
} else {
  console.error('uso: gerar-sql-migracoes.mjs arquivos|grants');
  process.exit(2);
}
