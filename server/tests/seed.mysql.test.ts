import { gerarBaseMock } from '@metricas-dspd/mock';
import { sql, type Kysely } from 'kysely';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { conectar, criarMigrator } from '../src/db/migracoes.js';
import { semear } from '../src/db/seed.js';

/** Requer MySQL 8.4 descartável em MYSQL_TEST_URL (DESTRUTIVO: recria dspd_bm/dspd_ac/dspd_core). Sem a variável, pulado. */
const url = process.env.MYSQL_TEST_URL;
const d = describe.skipIf(!url);

d('seed contra MySQL 8', () => {
  let db: Kysely<unknown>;
  const base = gerarBaseMock({ escala: 0.05 });
  const n = async (t: string): Promise<number> =>
    Number((await sql<{ n: string }>`SELECT COUNT(*) AS n FROM ${sql.raw(t)}`.execute(db)).rows[0]!.n);
  const limpar = async (): Promise<void> => {
    for (const s of ['dspd_bm', 'dspd_ac', 'dspd_core']) await sql.raw(`DROP DATABASE IF EXISTS ${s}`).execute(db);
  };
  beforeAll(async () => {
    db = conectar(url!);
    await limpar();
    expect((await criarMigrator(db).migrateToLatest()).error).toBeUndefined();
  });
  afterAll(async () => { await limpar(); await db.destroy(); });

  it('grava, é idempotente e recusa outra semente', async () => {
    expect(await semear(db, base)).toBe('semeado');
    const antes = [await n('dspd_bm.dim_card'), await n('dspd_bm.fato_transicao'), await n('dspd_ac.dim_chamado')];
    expect(antes).toEqual([base.bm.cards.length, base.bm.transicoes.length, base.ac.chamados.length]);
    expect(await semear(db, base)).toBe('ja_semeado');
    expect([await n('dspd_bm.dim_card'), await n('dspd_bm.fato_transicao'), await n('dspd_ac.dim_chamado')]).toEqual(antes);
    await expect(semear(db, gerarBaseMock({ escala: 0.05, semente: 7 }))).rejects.toThrow(/outra base/);
  });
  it('instantes voltam idênticos (epoch ms -> DATETIME(3) UTC)', async () => {
    const c = base.bm.cards.find((x) => x.criado_em > 0)!;
    const t = await sql<{ s: string }>`SELECT DATE_FORMAT(criado_em, '%Y-%m-%d %H:%i:%s.%f') AS s FROM dspd_bm.dim_card WHERE card_id = ${c.card_id}`.execute(db);
    expect(t.rows[0]!.s.slice(0, 23)).toBe(new Date(c.criado_em).toISOString().slice(0, 23).replace('T', ' '));
  });
});
