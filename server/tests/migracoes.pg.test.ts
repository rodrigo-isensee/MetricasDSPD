import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { MIGRACOES } from './migracoes.js';
import { poolDe, S, url } from './pg/ctx.js';

/** Requer o Postgres do Compose (PG_TESTE_URL); sem a variável, pulado. */
const d = describe.skipIf(!url);

d('migrações contra PostgreSQL 17', () => {
  const total = Object.keys(MIGRACOES).length;
  let db: pg.Pool;
  beforeAll(() => { db = poolDe(); });
  afterAll(async () => { await db.end(); });
  const contar = async (schema: string, tipo: string): Promise<number> =>
    Number((await db.query<{ n: string }>(
      `SELECT count(*) AS n FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = $1 AND c.relkind = $2`, [schema, tipo])).rows[0]!.n);

  it('up (feito pelo globalSetup): tabela de controle em dspd_core com todas as migrações', async () => {
    const r = await db.query<{ name: string }>(`SELECT name FROM ${S.core}.pgmigrations ORDER BY id`);
    expect(r.rows.map((x) => x.name)).toEqual(Object.keys(MIGRACOES));
    expect(await contar(S.bm, 'v')).toBeGreaterThan(0);
  });

  it('up, down, up num conjunto próprio de schemas (reversível; reaplicar não faz nada); roda ao lado do conjunto da execução', async () => {
    const p = prefixoDeTeste();
    const e = montarEsquemas(p);
    try {
      const a = await migrar(url!, { prefixo: p });
      expect(a.migracoes).toHaveLength(total);
      const antes = [await contar(e.bm, 'r'), await contar(e.ac, 'r'), await contar(e.core, 'r')];
      expect(antes.every((n) => n > 0)).toBe(true);
      expect((await migrar(url!, { prefixo: p })).migracoes).toHaveLength(0);

      const b = await migrar(url!, { prefixo: p, direcao: 'down', quantas: total });
      expect(b.migracoes).toHaveLength(total);
      expect(b.grants).toBe(0);
      expect(await contar(e.bm, 'r')).toBe(0);
      expect(await contar(e.ac, 'r')).toBe(0);
      expect(await contar(e.core, 'r')).toBe(1); // só pgmigrations

      await migrar(url!, { prefixo: p });
      expect([await contar(e.bm, 'r'), await contar(e.ac, 'r'), await contar(e.core, 'r')]).toEqual(antes);
    } finally {
      for (const s of [e.bm, e.ac, e.core]) await db.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
    }
  });

  it('DDL transacional: migração que falha no meio não deixa esquema pela metade', async () => {
    const p = prefixoDeTeste();
    const c = new pg.Client({ connectionString: url! });
    await c.connect();
    try {
      await c.query('BEGIN');
      await c.query(`CREATE SCHEMA ${p}dspd_x`);
      await c.query(`CREATE TABLE ${p}dspd_x.t (a int)`);
      await expect(c.query(`CREATE TABLE ${p}dspd_x.t (a int)`)).rejects.toBeDefined();
      await c.query('ROLLBACK');
      const r = await c.query('SELECT 1 FROM pg_namespace WHERE nspname = $1', [`${p}dspd_x`]);
      expect(r.rowCount).toBe(0);
    } finally {
      await c.end();
    }
  });

  it('nada foi criado fora dos schemas prefixados desta execução', async () => {
    const r = await db.query<{ nspname: string }>(
      `SELECT DISTINCT n.nspname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname IN ('public', 'dspd_bm', 'dspd_ac', 'dspd_core')`);
    expect(r.rows).toEqual([]);
  });
});
