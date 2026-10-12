import { fileURLToPath } from 'node:url';
import { runner } from 'node-pg-migrate';
import pg from 'pg';
import { gerarGrants, type Catalogo } from './grants.js';
import { montarEsquemas, type Esquemas } from './esquemas.js';
import type { Consultavel } from './pool.js';

export const DIR_MIGRACOES = fileURLToPath(new URL('../../../migrations', import.meta.url));
/** Migração nunca espera mais que isto por um lock (outro DDL ou sessão presa): falha e o operador decide. */
export const LOCK_TIMEOUT_MIGRADOR = '5s';
export type Direcao = 'up' | 'down';

type LinhaCatalogo = { esquema: string; tabela: string; colunas: string[] };

/** Tabelas e views (com colunas) dos três schemas, para o `gerarGrants`. */
export async function lerCatalogo(db: Consultavel, S: Esquemas): Promise<Catalogo> {
  const r = await db.query<LinhaCatalogo>(
    `SELECT n.nspname AS esquema, c.relname AS tabela, array_agg(a.attname::text ORDER BY a.attnum) AS colunas
     FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
     WHERE n.nspname = ANY($1) AND c.relkind IN ('r', 'v', 'p')
     GROUP BY n.nspname, c.relname`,
    [[S.bm, S.ac, S.core]],
  );
  const cat: Catalogo = { bm: {}, ac: {}, core: {} };
  const chave = new Map<string, keyof Catalogo>([[S.bm, 'bm'], [S.ac, 'ac'], [S.core, 'core']]);
  for (const l of r.rows) cat[chave.get(l.esquema)!][l.tabela] = l.colunas;
  return cat;
}

/** Aplica `gerarGrants(S)` numa transação. Usa o catálogo atual (reaplicável a qualquer momento). */
export async function aplicarGrants(cliente: Consultavel, S: Esquemas): Promise<number> {
  // Depois de um `down` completo os schemas não existem mais: não há o que conceder.
  const existe = await cliente.query<{ ok: boolean }>('SELECT to_regnamespace($1) IS NOT NULL AS ok', [S.bm]);
  if (!existe.rows[0]!.ok) return 0;
  const stmts = gerarGrants(S, await lerCatalogo(cliente, S));
  await cliente.query('BEGIN');
  try {
    for (const s of stmts) await cliente.query(s);
    await cliente.query('COMMIT');
  } catch (e) {
    await cliente.query('ROLLBACK');
    throw e;
  }
  return stmts.length;
}

export type OpcoesMigrar = { direcao?: Direcao; prefixo?: string; quantas?: number; log?: (m: string) => void };
export type ResultadoMigrar = { migracoes: string[]; grants: number };

/**
 * Runner programático do node-pg-migrate: tabela `pgmigrations` em `S.core`, `checkOrder`, lock consultivo do próprio runner,
 * uma transação para o lote (DDL transacional). O prefixo de teste chega às migrações por `DSPD_SCHEMA_PREFIXO`
 * (restaurado ao fim). Ao final aplica os GRANTs.
 */
export async function migrar(url: string, opcoes: OpcoesMigrar = {}): Promise<ResultadoMigrar> {
  const { direcao = 'up', prefixo = '', quantas, log = () => undefined } = opcoes;
  const S = montarEsquemas(prefixo);
  const anterior = process.env.DSPD_SCHEMA_PREFIXO;
  process.env.DSPD_SCHEMA_PREFIXO = prefixo;
  const cliente = new pg.Client({ connectionString: url, options: `-c TimeZone=UTC -c lock_timeout=${LOCK_TIMEOUT_MIGRADOR}` });
  await cliente.connect();
  try {
    const feitas = await runner({
      // singleTransaction (decisão do C2/C3): um `up` com várias migrações é atômico (tudo ou nada), sem estado intermediário no
      // banco; exige que nenhuma migração use `CREATE INDEX CONCURRENTLY` (hoje não há; o teste estático de migrações cobre).
      dbClient: cliente, dir: DIR_MIGRACOES, direction: direcao, migrationsTable: 'pgmigrations',
      migrationsSchema: S.core, createMigrationsSchema: true, checkOrder: true, singleTransaction: true, ignorePattern: '(\\..*|.*\\.json)',
      ...(direcao === 'down' ? { count: quantas ?? 1 } : quantas === undefined ? {} : { count: quantas }), log,
    });
    const grants = await aplicarGrants(cliente, S);
    return { migracoes: feitas.map((m) => m.name), grants };
  } finally {
    await cliente.end();
    if (anterior === undefined) delete process.env.DSPD_SCHEMA_PREFIXO;
    else process.env.DSPD_SCHEMA_PREFIXO = anterior;
  }
}
