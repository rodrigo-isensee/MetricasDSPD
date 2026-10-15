import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { gravarStgCard, gravarStgRevision } from '../src/modulos/businessmap/index.js';
import { novaColeta, poolDe, S, unico, url } from './pg/ctx.js';

const d = describe.skipIf(!url);
const SEGREDO = 'segredo-de-teste-com-mais-de-16';
const M = 'MARCADOR-QA-PESSOA';

/** QA do K-084 (R-QA): abuso com os papéis reais (`dspd_webhook`, `dspd_coletor`), conferindo o que ficou no banco. */
d('QA K-084: abuso da allow-list com Postgres real', () => {
  let wh: pg.Pool;
  let col: pg.Pool;
  let mig: pg.Pool;
  let coleta = 0;
  let app: Awaited<ReturnType<typeof buildApp>>;
  beforeAll(async () => {
    wh = poolDe('dspd_webhook'); col = poolDe('dspd_coletor'); mig = poolDe();
    coleta = await novaColeta(mig, S.bm);
    app = await buildApp({ db: poolDe('dspd_api'), S, agora: () => new Date('2026-10-10T15:00:00Z'), nivelLog: 'silent', webhook: { pool: wh, segredo: SEGREDO } });
  });
  afterAll(async () => { await wh.end(); await col.end(); await mig.end(); });
  const post = (corpo: string) => app.inject({ method: 'POST', url: '/webhooks/businessmap', payload: corpo, headers: { 'x-webhook-secret': SEGREDO, 'content-type': 'application/json' } });
  const gravados = async (id: string) => (await mig.query<{ payload: Record<string, unknown> }>(
    `SELECT payload FROM ${S.bm}.stg_webhook_evento WHERE payload->>'card_id' = $1 ORDER BY webhook_sk`, [id])).rows.map((r) => r.payload);

  it('webhook de tipo desconhecido ou disfarçado: 202 e nada na staging nem na outbox', async () => {
    const id = unico('w');
    const antes = Number((await mig.query<{ n: string }>(`SELECT count(*) AS n FROM ${S.core}.outbox WHERE tipo = 'bm.webhook.recebido'`)).rows[0]!.n);
    for (const evento of ['CARD_MOVED', 'card_moved ', 'card_deleted', ['card_moved'], 7, null]) {
      const r = await post(JSON.stringify({ evento, card: { id } }));
      expect(r.statusCode).toBe(202);
    }
    expect(await gravados(id)).toHaveLength(0);
    const depois = Number((await mig.query<{ n: string }>(`SELECT count(*) AS n FROM ${S.core}.outbox WHERE tipo = 'bm.webhook.recebido'`)).rows[0]!.n);
    expect(depois).toBe(antes);
  });

  it('webhook com campos extras, proibidos e texto livre: no banco só ficam os campos da lista', async () => {
    const id = unico('w');
    const corpo = {
      evento: 'card_moved', card: { id, board_id: 1, title: M, description: M, owner_user_id: M }, anterior: { column_id: 3, user: M },
      author: { name: M, email: `${M}@x.com` }, comment: M, discard_comment: M, extra: { aninhado: { profundo: M } },
    };
    expect((await post(JSON.stringify(corpo))).statusCode).toBe(202);
    const g = await gravados(id);
    expect(g).toHaveLength(1);
    expect(Object.keys(g[0]!).sort()).toEqual(['board_id', 'card_id', 'column_id_anterior', 'evento']);
    expect(JSON.stringify(g[0])).not.toContain(M);
    // o corpo inteiro, incluindo texto, também não aparece em nenhuma coluna da linha gravada
    const linha = await mig.query<{ t: string }>(`SELECT t::text AS t FROM ${S.bm}.stg_webhook_evento t WHERE t.payload->>'card_id' = $1`, [id]);
    expect(linha.rows[0]!.t).not.toContain(M);
  });

  it('webhook fora de ordem: a entrega anterior chegando depois é gravada como mais um registro, sem sobrescrever a posterior', async () => {
    const id = unico('o');
    const nova = JSON.stringify({ evento: 'card_moved', card: { id, column_id: 9 }, timestamp: '2026-10-10T12:00:00Z' });
    const velha = JSON.stringify({ evento: 'card_moved', card: { id, column_id: 8 }, timestamp: '2026-10-10T09:00:00Z' });
    expect((await post(nova)).statusCode).toBe(202);
    expect((await post(velha)).statusCode).toBe(202);
    expect((await post(nova)).statusCode).toBe(202); // reenvio: não duplica
    const g = await gravados(id);
    expect(g.map((p) => p.column_id)).toEqual([9, 8]);
    expect(g.map((p) => p.instante)).toEqual(['2026-10-10T12:00:00Z', '2026-10-10T09:00:00Z']);
  });

  it('webhook com U+0000 e JSON inválido: 400, e nada é gravado', async () => {
    const id = unico('z');
    expect((await post(`{"evento":"card_moved","card":{"id":"${id}","title":"a\\u0000b"}}`)).statusCode).toBe(400);
    expect((await post(`{"evento":"card_moved","card":{"id":"${id}"`)).statusCode).toBe(400);
    expect((await post('[]')).statusCode).toBe(400);
    expect(await gravados(id)).toHaveLength(0);
  });

  it('stg_card com campos extras, proibidos e texto livre: o jsonb gravado não tem nenhum, nem nas colunas da linha', async () => {
    const id = unico('c');
    const card = {
      card_id: id, title: 'T', description: M, discard_comment: M, owner_user_id: 11, co_owner_ids: [22], reporter: { name: M, email: `${M}@x.com` },
      comment_count: 5, subtasks: [{ description: M }], block_reason: { reason_id: 4, comment: M }, linked_cards: [{ card_id: 2, link_type: 'p', title: M }],
      custom_fields: [{ field_id: 'livre', value: M }], extra_desconhecido: M,
    };
    expect(await gravarStgCard(col, { idOrigem: id, card, coletaId: coleta, agora: new Date(), quadroId: 'q', arquivado: false, excluidoDetectado: false }, S)).toBe('inserido');
    const l = await mig.query<{ t: string }>(`SELECT t::text AS t FROM ${S.bm}.stg_card t WHERE id_origem = $1`, [id]);
    for (const p of [M, 'owner_user_id', 'co_owner_ids', 'reporter', 'discard_comment', 'description', 'extra_desconhecido', '"11"', '"22"']) expect(l.rows[0]!.t).not.toContain(p);
  });

  it('stg_card fora de ordem: versão mais antiga chegando depois vira nova versão encadeada; nada é sobrescrito', async () => {
    const id = unico('f');
    const e = (card: Record<string, unknown>) => ({ idOrigem: id, card, coletaId: coleta, agora: new Date(), quadroId: 'q', arquivado: false, excluidoDetectado: false });
    expect(await gravarStgCard(col, e({ card_id: id, revision: 5, column_id: 9 }), S)).toBe('inserido');
    expect(await gravarStgCard(col, e({ card_id: id, revision: 4, column_id: 8 }), S)).toBe('inserido');
    expect(await gravarStgCard(col, e({ card_id: id, revision: 4, column_id: 8, description: M }), S)).toBe('ja_existente'); // só campo fora da lista mudou
    const v = await mig.query<{ stg_sk: string; anterior_sk: string | null; payload: { revision: number } }>(
      `SELECT stg_sk, anterior_sk, payload FROM ${S.bm}.stg_card WHERE id_origem = $1 ORDER BY stg_sk`, [id]);
    expect(v.rows.map((r) => r.payload.revision)).toEqual([5, 4]);
    expect(v.rows[0]!.anterior_sk).toBeNull();
    expect(v.rows[1]!.anterior_sk).toBe(v.rows[0]!.stg_sk);
  });

  it('stg_revision fora de ordem e com proibidos: cada revisão fica uma vez, só com a lista fechada', async () => {
    const id = unico('v');
    const rev = (n: number) => ({ cardId: id, revisionId: String(n), revisao: { card_id: id, revision: n, user_id: 5, owner_user_id: 5, subtasks: [{ description: M }], author: M }, trocaResponsavel: n === 3, coletaId: coleta, agora: new Date() });
    expect(await gravarStgRevision(col, rev(3), S)).toBe(true);
    expect(await gravarStgRevision(col, rev(2), S)).toBe(true);
    expect(await gravarStgRevision(col, rev(3), S)).toBe(false);
    const r = await mig.query<{ payload: Record<string, unknown> }>(`SELECT payload FROM ${S.bm}.stg_revision WHERE card_id = $1 ORDER BY revision_sk`, [id]);
    expect(r.rows.map((x) => x.payload)).toEqual([
      { card_id: id, revision: 3, troca_responsavel: true }, { card_id: id, revision: 2, troca_responsavel: false },
    ]);
  });

  it('o papel do coletor continua sem UPDATE nem DELETE na staging (append-only)', async () => {
    await expect(col.query(`UPDATE ${S.bm}.stg_card SET quadro_id = 'x'`)).rejects.toThrow(/permission denied/);
    await expect(col.query(`DELETE FROM ${S.bm}.stg_revision`)).rejects.toThrow(/permission denied/);
    await expect(wh.query(`DELETE FROM ${S.bm}.stg_webhook_evento`)).rejects.toThrow(/permission denied/);
  });
});
