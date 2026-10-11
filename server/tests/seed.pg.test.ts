import { gerarBaseMock } from '@metricas-dspd/mock';
import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { migrar } from '../src/plataforma/db/migrar.js';
import { prefixoDeTeste, montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { semear } from '../src/plataforma/db/seed.js';
import { poolDe, url } from './pg/ctx.js';

const d = describe.skipIf(!url);

/** O seed é idempotente por schema, então usa um conjunto próprio (não o da execução, onde outros testes criam coletas). */
d('seed contra PostgreSQL 17', () => {
  const base = gerarBaseMock({ escala: 0.05 });
  const p = prefixoDeTeste();
  const E = montarEsquemas(p);
  let db: pg.Pool;
  const n = async (t: string): Promise<number> => Number((await db.query<{ n: string }>(`SELECT count(*) AS n FROM ${t}`)).rows[0]!.n);
  beforeAll(async () => { db = poolDe(); await migrar(url!, { prefixo: p }); });
  afterAll(async () => {
    for (const s of [E.bm, E.ac, E.core]) await db.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
    await db.end();
  });

  it('grava, é idempotente e recusa outra semente', async () => {
    expect(await semear(db, base, E)).toBe('semeado');
    const cont = async () => [await n(`${E.bm}.dim_card`), await n(`${E.bm}.fato_transicao`), await n(`${E.bm}.fato_bloqueio`), await n(`${E.ac}.dim_chamado`), await n(`${E.ac}.fato_etapa_chamado`)];
    const antes = await cont();
    expect(antes).toEqual([base.bm.cards.length, base.bm.transicoes.length, base.bm.bloqueios.length, base.ac.chamados.length, base.ac.etapas.length]);
    expect(await semear(db, base, E)).toBe('ja_semeado');
    expect(await cont()).toEqual(antes);
    await expect(semear(db, gerarBaseMock({ escala: 0.05, semente: 7 }), E)).rejects.toThrow(/outra base/);
    expect(await cont()).toEqual(antes);
  });

  it('dois seeds simultâneos num schema novo gravam uma vez só (lock consultivo)', async () => {
    const p2 = prefixoDeTeste();
    const E2 = montarEsquemas(p2);
    await migrar(url!, { prefixo: p2 });
    try {
      const r = await Promise.all([semear(db, base, E2), semear(db, base, E2)]);
      expect(r.sort()).toEqual(['ja_semeado', 'semeado']);
      expect(await n(`${E2.bm}.dim_card`)).toBe(base.bm.cards.length);
    } finally {
      for (const s of [E2.bm, E2.ac, E2.core]) await db.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
    }
  });

  it('instantes voltam idênticos (epoch ms -> timestamptz(3) UTC) e nenhuma coluna de pessoa é preenchida', async () => {
    const c = base.bm.cards.find((x) => x.criado_em > 0)!;
    const t = await db.query<{ ms: string; resp: string[] }>(
      `SELECT (extract(epoch FROM criado_em) * 1000)::bigint AS ms, responsaveis AS resp FROM ${E.bm}.dim_card WHERE card_id = $1`, [c.card_id]);
    expect(Number(t.rows[0]!.ms)).toBe(c.criado_em);
    expect(t.rows[0]!.resp).toEqual([]);
    expect(await n(`${E.bm}.fato_transicao WHERE usuario IS NOT NULL`)).toBe(0);
  });
});
