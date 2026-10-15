import { createHash } from 'node:crypto';
import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { gravarResponsaveis, gravarStgCard, gravarStgRevision } from '../src/modulos/businessmap/index.js';
import { novaColeta, poolDe, S, unico, url } from './pg/ctx.js';

const d = describe.skipIf(!url);

d('ADR 0020 (4b, M-1, M-3) com o papel dspd_coletor: responsáveis só nas dim, nunca na staging', () => {
  let mig: pg.Pool;
  let col: pg.Pool;
  let coleta = 0;
  beforeAll(async () => { mig = poolDe(); col = poolDe('dspd_coletor'); coleta = await novaColeta(mig, S.bm); });
  afterAll(async () => { await mig.end(); await col.end(); });

  it('responsáveis vão para dim_card e dim_card_versao (nova versão, sem alterar a antiga); null não sobrescreve; a staging não tem id de pessoa', async () => {
    const id = unico('r');
    const card = { card_id: id, title: 'T', owner_user_id: 4242, co_owner_ids: [4343], discard_comment: 'MARCADOR-PESSOA', description: 'MARCADOR-PESSOA' };
    expect(await gravarStgCard(col, { idOrigem: id, card, coletaId: coleta, agora: new Date(), quadroId: 'q', arquivado: false, excluidoDetectado: false }, S)).toBe('inserido');
    const sk = (await mig.query<{ stg_sk: string }>(`SELECT stg_sk FROM ${S.bm}.stg_card WHERE id_origem = $1`, [id])).rows[0]!.stg_sk;
    await mig.query(`INSERT INTO ${S.bm}.dim_card (card_id, coletado_em, atualizado_por_coleta_id) VALUES ($1, now(), $2)`, [id, coleta]);
    await mig.query(`INSERT INTO ${S.bm}.dim_card_versao (card_id, vigente_de, stg_card_sk, titulo, responsaveis, coletado_em, coleta_id) VALUES ($1, '2026-10-01', $2, 'T', '{}', now(), $3)`, [id, sk, coleta]);
    const e = { cardId: id, responsaveis: ['4242', '4343'], stgCardSk: sk, vigenteDe: new Date('2026-10-02T00:00:00Z'), coletaId: coleta, agora: new Date() };
    expect(await gravarResponsaveis(col, e, S)).toEqual({ dimCard: true, versao: true });
    expect(await gravarResponsaveis(col, e, S)).toEqual({ dimCard: false, versao: false });
    expect(await gravarResponsaveis(col, { ...e, responsaveis: null }, S)).toEqual({ dimCard: false, versao: false });
    const dim = await mig.query<{ responsaveis: string[] }>(`SELECT responsaveis FROM ${S.bm}.dim_card WHERE card_id = $1`, [id]);
    expect(dim.rows[0]!.responsaveis).toEqual(['4242', '4343']);
    const v = await mig.query<{ responsaveis: string[]; titulo: string }>(`SELECT responsaveis, titulo FROM ${S.bm}.dim_card_versao WHERE card_id = $1 ORDER BY vigente_de`, [id]);
    expect(v.rows.map((x) => x.responsaveis)).toEqual([[], ['4242', '4343']]);
    expect(v.rows[1]!.titulo).toBe('T');
    const stg = await mig.query<{ payload: unknown }>(`SELECT payload FROM ${S.bm}.stg_card WHERE id_origem = $1`, [id]);
    const texto = JSON.stringify(stg.rows);
    for (const proibido of ['4242', '4343', 'owner_user_id', 'co_owner_ids', 'discard_comment', 'MARCADOR-PESSOA']) expect(texto).not.toContain(proibido);
  });

  it('vigente_de igual ou anterior ao da versão vigente: nada é gravado e a projeção não diverge do histórico', async () => {
    const id = unico('b');
    await mig.query(`INSERT INTO ${S.bm}.stg_card (id_origem, anterior_sk, payload_sha256, payload, quadro_id, arquivado, excluido_detectado, coletado_em, coleta_id) VALUES ($1, NULL, $2, '{}', 'q', false, false, now(), $3)`, [id, createHash('sha256').update(id).digest(), coleta]);
    const sk = (await mig.query<{ stg_sk: string }>(`SELECT stg_sk FROM ${S.bm}.stg_card WHERE id_origem = $1`, [id])).rows[0]!.stg_sk;
    await mig.query(`INSERT INTO ${S.bm}.dim_card (card_id, coletado_em, atualizado_por_coleta_id) VALUES ($1, now(), $2)`, [id, coleta]);
    await mig.query(`INSERT INTO ${S.bm}.dim_card_versao (card_id, vigente_de, stg_card_sk, titulo, responsaveis, coletado_em, coleta_id) VALUES ($1, '2026-10-05', $2, 'T', '{}', now(), $3)`, [id, sk, coleta]);
    const e = { cardId: id, responsaveis: ['9'], stgCardSk: sk, vigenteDe: new Date('2026-10-05T00:00:00Z'), coletaId: coleta, agora: new Date() };
    expect(await gravarResponsaveis(col, e, S)).toEqual({ dimCard: false, versao: false });
    expect(await gravarResponsaveis(col, { ...e, vigenteDe: new Date('2026-10-01T00:00:00Z') }, S)).toEqual({ dimCard: false, versao: false });
    const v = await mig.query(`SELECT 1 FROM ${S.bm}.dim_card_versao WHERE card_id = $1`, [id]);
    expect(v.rows).toHaveLength(1);
    const dim = await mig.query<{ responsaveis: string[] | null }>(`SELECT responsaveis FROM ${S.bm}.dim_card WHERE card_id = $1`, [id]);
    expect(dim.rows[0]!.responsaveis ?? []).toEqual([]);
  });

  it('stg_revision grava só o registro filtrado e a mesma revisão não duplica', async () => {
    const id = unico('v');
    const e = { cardId: id, revisionId: '1', revisao: { card_id: id, revision: 1, user_id: 4242, owner_user_id: 4242, subtasks: [{ description: 'MARCADOR-PESSOA' }] }, trocaResponsavel: false, coletaId: coleta, agora: new Date() };
    expect(await gravarStgRevision(col, e, S)).toBe(true);
    expect(await gravarStgRevision(col, e, S)).toBe(false);
    const r = await mig.query<{ payload: unknown }>(`SELECT payload FROM ${S.bm}.stg_revision WHERE card_id = $1`, [id]);
    expect(r.rows).toHaveLength(1);
    expect(r.rows[0]!.payload).toEqual({ card_id: id, revision: 1, troca_responsavel: false });
  });
});
