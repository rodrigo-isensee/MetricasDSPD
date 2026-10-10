import { randomBytes } from 'node:crypto';
import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { gravarStgCard } from '../src/modulos/businessmap/staging.js';
import { ehDuplicado } from '../src/plataforma/db/pool.js';
import { hash, novaColeta, poolDe, S, unico, url } from './pg/ctx.js';

const d = describe.skipIf(!url);

d('staging: borda A -> B -> A e concorrência (pg, ON CONFLICT ON CONSTRAINT)', () => {
  let db: pg.Pool;
  let coleta = 0;
  beforeAll(async () => { db = poolDe(); coleta = await novaColeta(db, S.bm); });
  afterAll(async () => { await db.end(); });

  const qtd = async (id: string): Promise<number> =>
    Number((await db.query<{ n: string }>(`SELECT count(*) AS n FROM ${S.bm}.stg_card WHERE id_origem = $1`, [id])).rows[0]!.n);
  const grava = (id: string, v: string, conexao: pg.Pool = db) =>
    gravarStgCard(conexao, { idOrigem: id, payload: { v }, sha256: hash(v), coletaId: coleta, agora: new Date(), quadroId: 'q1', arquivado: false, excluidoDetectado: false }, S);

  it('A, B, A gera 3 linhas encadeadas; recoleta idêntica de A não gera nenhuma', async () => {
    const id = unico('a');
    expect(await grava(id, 'A')).toBe('inserido');
    expect(await grava(id, 'B')).toBe('inserido');
    expect(await grava(id, 'A')).toBe('inserido');
    expect(await grava(id, 'A')).toBe('ja_existente');
    expect(await qtd(id)).toBe(3);
    const r = await db.query<{ anterior_sk: string | null }>(`SELECT anterior_sk FROM ${S.bm}.stg_card WHERE id_origem = $1 ORDER BY stg_sk`, [id]);
    expect(r.rows[0]!.anterior_sk).toBeNull();
    expect(r.rows.slice(1).every((x) => x.anterior_sk !== null)).toBe(true);
  });

  it('gravações concorrentes (conexões diferentes) do mesmo conteúdo geram uma só linha', async () => {
    const id = unico('b');
    const r = await Promise.all(Array.from({ length: 8 }, () => grava(id, 'X')));
    expect(r.filter((x) => x === 'inserido')).toHaveLength(1);
    expect(await qtd(id)).toBe(1);
  });

  it('cadeia permanece linear sob concorrência de conteúdos diferentes (até 4 escritores: cada um perde no máximo 3 vezes, dentro das 5 tentativas)', async () => {
    const id = unico('c');
    await Promise.all(Array.from({ length: 4 }, () => grava(id, randomBytes(4).toString('hex'))));
    const r = await db.query<{ n: string; m: string }>(
      `SELECT count(DISTINCT anterior_sk) AS n, count(*) FILTER (WHERE anterior_sk IS NULL) AS m FROM ${S.bm}.stg_card WHERE id_origem = $1`, [id]);
    expect(Number(r.rows[0]!.n) + Number(r.rows[0]!.m)).toBe(await qtd(id));
    expect(Number(r.rows[0]!.m)).toBe(1);
  });

  it('transação do chamador não é abortada pelo conflito (ON CONFLICT não gera erro)', async () => {
    const id = unico('d');
    const c = await db.connect();
    try {
      await c.query('BEGIN');
      await c.query(`INSERT INTO ${S.bm}.stg_card (id_origem, anterior_sk, payload_sha256, payload, quadro_id, arquivado, excluido_detectado, coletado_em, coleta_id)
        VALUES ($1, NULL, $2, '{}', 'q', false, false, now(), $3) ON CONFLICT ON CONSTRAINT uq_stg_card DO NOTHING`, [id, hash('P'), coleta]);
      const dup = await c.query(`INSERT INTO ${S.bm}.stg_card (id_origem, anterior_sk, payload_sha256, payload, quadro_id, arquivado, excluido_detectado, coletado_em, coleta_id)
        VALUES ($1, NULL, $2, '{}', 'q', false, false, now(), $3) ON CONFLICT ON CONSTRAINT uq_stg_card DO NOTHING RETURNING stg_sk`, [id, hash('Q'), coleta]);
      expect(dup.rows).toHaveLength(0);
      expect((await c.query('SELECT 1 AS ok')).rows[0]).toEqual({ ok: 1 });
      await c.query('COMMIT');
    } finally { c.release(); }
    expect(await qtd(id)).toBe(1);
  });

  it('UNIQUE NULLS NOT DISTINCT recusa duas primeiras versões (anterior_sk nulo) e duas sobre a mesma anterior', async () => {
    const id = unico('e');
    const ins = (sk: string | null, h: string) => db.query(
      `INSERT INTO ${S.bm}.stg_card (id_origem, anterior_sk, payload_sha256, payload, quadro_id, arquivado, excluido_detectado, coletado_em, coleta_id)
       VALUES ($1, $2, $3, '{}', 'q', false, false, now(), $4)`, [id, sk, hash(h), coleta]);
    await ins(null, 'P');
    await expect(ins(null, 'Q')).rejects.toSatisfy(ehDuplicado);
    const sk = (await db.query<{ stg_sk: string }>(`SELECT stg_sk FROM ${S.bm}.stg_card WHERE id_origem = $1`, [id])).rows[0]!.stg_sk;
    await ins(sk, 'R');
    await expect(ins(sk, 'S')).rejects.toSatisfy(ehDuplicado);
  });

  it('CHECKs recusam hash com tamanho errado, sistema_origem trocado e id fora do ASCII visível', async () => {
    const base = (id: string, h: Buffer, sis: string) => db.query(
      `INSERT INTO ${S.bm}.stg_revision (card_id, revision_id, payload_sha256, payload, sistema_origem, coletado_em, coleta_id)
       VALUES ($1, 'r', $2, '{}', $3, now(), $4)`, [id, h, sis, coleta]);
    await expect(base(unico('f'), Buffer.alloc(31), 'businessmap')).rejects.toMatchObject({ code: '23514' });
    await expect(base(unico('f'), Buffer.alloc(32), 'acelerato')).rejects.toMatchObject({ code: '23514' });
    await expect(base('com espaço', Buffer.alloc(32), 'businessmap')).rejects.toMatchObject({ code: '23514' });
    await base(unico('f'), Buffer.alloc(32), 'businessmap');
  });
});
