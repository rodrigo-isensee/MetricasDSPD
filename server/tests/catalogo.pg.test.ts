import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { COLUNAS_PESSOA, violaLgpd } from '../src/plataforma/db/lgpd.js';
import { aplicarGrants } from '../src/plataforma/db/migrar.js';
import { hash, novaColeta, poolDe, S, unico, url } from './pg/ctx.js';

const d = describe.skipIf(!url);
const SNAPSHOT = new URL('./pg/esquema.snapshot.json', import.meta.url);
const sem = (s: string): string => s.replace(/^t[0-9a-z]{6}_/, '');

d('catálogo do esquema (testes de catálogo do CI)', () => {
  let db: pg.Pool;
  beforeAll(() => { db = poolDe(); });
  afterAll(async () => { await db.end(); });

  it('snapshot de esquema: colunas, tipos e nulidade iguais ao versionado (ATUALIZAR_SNAPSHOT=1 regrava)', async () => {
    const r = await db.query<{ t: string; c: string; ty: string; nulo: string; def: string | null }>(
      `SELECT table_schema || '.' || table_name AS t, column_name AS c,
              data_type || coalesce('(' || character_maximum_length || ')', '') AS ty, is_nullable AS nulo, column_default AS def
       FROM information_schema.columns WHERE table_schema = ANY($1) ORDER BY 1, ordinal_position`, [[S.bm, S.ac, S.core]]);
    const atual = r.rows.map((x) => `${sem(x.t)}.${x.c} ${x.ty} ${x.nulo === 'YES' ? 'NULL' : 'NOT NULL'}${x.def ? ` DEFAULT ${x.def.replaceAll(S.core, 'dspd_core')}` : ''}`);
    if (process.env.ATUALIZAR_SNAPSHOT === '1' || !existsSync(SNAPSHOT)) writeFileSync(SNAPSHOT, JSON.stringify(atual, null, 1) + '\n');
    expect(atual).toEqual(JSON.parse(readFileSync(SNAPSHOT, 'utf8')));
  });

  it('nenhuma coluna de pessoa fora da lista fechada (LGPD no catálogo real), e as permitidas existem', async () => {
    const r = await db.query<{ t: string; c: string }>(
      `SELECT table_schema || '.' || table_name AS t, column_name AS c FROM information_schema.columns
       WHERE table_schema = ANY($1) AND table_name NOT LIKE 'stg\\_%'`, [[S.bm, S.ac, S.core]]);
    expect(r.rows.filter((x) => violaLgpd(sem(x.t), x.c))).toEqual([]);
    const todas = r.rows.map((x) => `${sem(x.t)}.${x.c}`);
    for (const p of COLUNAS_PESSOA) expect(todas).toContain(p);
  });

  it('gatilho de imutabilidade em toda tabela append-only e em nenhuma outra', async () => {
    const r = await db.query<{ t: string; n: string }>(
      `SELECT c.relname AS t, count(*) AS n FROM pg_trigger g JOIN pg_class c ON c.oid = g.tgrelid JOIN pg_namespace s ON s.oid = c.relnamespace
       WHERE s.nspname = ANY($1) AND NOT g.tgisinternal GROUP BY c.relname`, [[S.bm, S.ac]]);
    const com = new Set(r.rows.map((x) => x.t));
    const tabelas = (await db.query<{ t: string }>(
      `SELECT c.relname AS t FROM pg_class c JOIN pg_namespace s ON s.oid = c.relnamespace WHERE s.nspname = ANY($1) AND c.relkind = 'r'`, [[S.bm, S.ac]])).rows.map((x) => x.t);
    for (const t of tabelas) expect(com.has(t), t).toBe(/^(stg_|evt_|rec_)|_versao$|^fato_transicao$|^ref_(workflow|tipo_card|time|time_workflow)$/.test(t));
    for (const x of r.rows) expect(Number(x.n), x.t).toBe(2);
  });

  it('o gatilho barra UPDATE, DELETE e TRUNCATE até para o dono (migrador)', async () => {
    const coleta = await novaColeta(db, S.bm);
    const id = unico('c');
    await db.query(
      `INSERT INTO ${S.bm}.stg_card (id_origem, anterior_sk, payload_sha256, payload, quadro_id, arquivado, excluido_detectado, coletado_em, coleta_id)
       VALUES ($1, NULL, $2, '{}', 'q', false, false, now(), $3)`, [id, hash(id), coleta]);
    await expect(db.query(`UPDATE ${S.bm}.stg_card SET quadro_id = 'z' WHERE id_origem = $1`, [id])).rejects.toMatchObject({ code: '55000' });
    await expect(db.query(`DELETE FROM ${S.bm}.stg_card WHERE id_origem = $1`, [id])).rejects.toMatchObject({ code: '55000' });
    await expect(db.query(`TRUNCATE ${S.bm}.stg_vinculo`)).rejects.toMatchObject({ code: '55000' });
  });

  it('toda view é security_invoker', async () => {
    const r = await db.query<{ v: string; o: string[] | null }>(
      `SELECT c.relname AS v, c.reloptions AS o FROM pg_class c JOIN pg_namespace s ON s.oid = c.relnamespace WHERE s.nspname = ANY($1) AND c.relkind = 'v'`, [[S.bm, S.ac]]);
    expect(r.rows).toHaveLength(6);
    for (const x of r.rows) expect(x.o, x.v).toContain('security_invoker=true');
  });

  it('nenhuma view seleciona coluna de pessoa (view_column_usage)', async () => {
    const r = await db.query<{ v: string; t: string; c: string }>(
      `SELECT view_name AS v, table_name AS t, column_name AS c FROM information_schema.view_column_usage WHERE view_schema = ANY($1)`, [[S.bm, S.ac]]);
    expect(r.rows.length).toBeGreaterThan(0);
    expect(r.rows.filter((x) => COLUNAS_PESSOA.some((p) => p.endsWith(`.${x.t}.${x.c}`)))).toEqual([]);
  });

  it('dspd_api não lê nenhuma coluna de COLUNAS_PESSOA nem nada de stg_/evt_/_versao; lê o resto', async () => {
    for (const p of COLUNAS_PESSOA) {
      const [esq, tab, col] = p.split('.') as [string, string, string];
      const schema = esq === 'dspd_bm' ? S.bm : S.ac;
      const r = await db.query<{ ok: boolean }>(`SELECT has_column_privilege('dspd_api', $1, $2, 'SELECT') AS ok`, [`${schema}.${tab}`, col]);
      expect(r.rows[0]!.ok, p).toBe(false);
    }
    const r = await db.query<{ ok: boolean; t: string }>(
      `SELECT has_table_privilege('dspd_api', c.oid, 'SELECT') OR EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = c.oid AND a.attnum > 0
         AND has_column_privilege('dspd_api', c.oid, a.attnum, 'SELECT')) AS ok, c.relname AS t
       FROM pg_class c JOIN pg_namespace s ON s.oid = c.relnamespace WHERE s.nspname = ANY($1) AND c.relkind IN ('r', 'v')`, [[S.bm, S.ac, S.core]]);
    for (const x of r.rows) expect(x.ok, x.t).toBe(!/^(stg_|evt_|.*_versao$|outbox|pgmigrations|rec_transicao_par|dim_responsavel)/.test(x.t) || x.t === 'rec_transicao_par');
    expect((await db.query(`SELECT has_column_privilege('dspd_api', $1, 'titulo', 'SELECT') AS ok`, [`${S.bm}.dim_card`])).rows[0]).toEqual({ ok: true });
  });

  it('ninguém (além do dono) tem TRUNCATE, REFERENCES ou TRIGGER', async () => {
    const r = await db.query(
      `SELECT grantee, table_name, privilege_type FROM information_schema.role_table_grants
       WHERE table_schema = ANY($1) AND privilege_type IN ('TRUNCATE', 'REFERENCES', 'TRIGGER') AND grantee <> 'dspd_migrador'`, [[S.bm, S.ac, S.core]]);
    expect(r.rows).toEqual([]);
  });

  it('reaplicar os GRANTs dá o mesmo estado final (idempotente)', async () => {
    const lerGrants = async (): Promise<string[]> => (await db.query<{ g: string }>(
      `SELECT grantee || ':' || table_schema || '.' || table_name || ':' || privilege_type AS g FROM information_schema.role_table_grants
       WHERE table_schema = ANY($1) AND grantee LIKE 'dspd\\_%' ORDER BY 1`, [[S.bm, S.ac, S.core]])).rows.map((x) => x.g);
    const antes = await lerGrants();
    expect(antes.length).toBeGreaterThan(50);
    const c = await db.connect();
    try { expect(await aplicarGrants(c, S)).toBeGreaterThan(0); } finally { c.release(); }
    expect(await lerGrants()).toEqual(antes);
  });
});
