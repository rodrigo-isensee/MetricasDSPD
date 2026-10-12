import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { lerTransicoes } from '../src/modulos/metricas/repositorio.js';
import { novaColeta, poolDe, S, unico, url } from './pg/ctx.js';

const d = describe.skipIf(!url);

/** R1/C1 da auditoria: a mesma transição gravada pela coleta (revision) e pelo webhook, já casadas, conta uma vez só. */
d('transições canônicas lidas pelo repositório (papel dspd_api)', () => {
  let dono: pg.Pool, api: pg.Pool, coletor: pg.Pool;
  let coleta = 0;
  beforeAll(async () => { dono = poolDe(); api = poolDe('dspd_api'); coletor = poolDe('dspd_coletor'); coleta = await novaColeta(dono, S.bm); });
  afterAll(async () => { await Promise.all([dono.end(), api.end(), coletor.end()]); });

  const grava = async (card: string, fonte: 'revision' | 'webhook', ocorrido: string): Promise<number> =>
    Number((await coletor.query<{ transicao_sk: string }>(
      `INSERT INTO ${S.bm}.fato_transicao (card_id, coluna_destino_id, tipo_coluna, direcao, fonte, id_origem, ocorrido_em, coletado_em, coleta_id)
       VALUES ($1, 'c1', 'execucao', 'avanco', $2, $3, $4, now(), $5) RETURNING transicao_sk`,
      [card, fonte, `${fonte}-${card}`, ocorrido, coleta])).rows[0]!.transicao_sk);
  const doCard = async (card: string) => (await lerTransicoes(api, S)).filter((t) => t.card_id === card);

  it('par casado (revision + webhook) conta uma transição, a da revision', async () => {
    const card = unico('c');
    const rev = await grava(card, 'revision', '2026-10-01T12:00:00Z');
    const web = await grava(card, 'webhook', '2026-10-01T12:00:30Z');
    await coletor.query(`INSERT INTO ${S.bm}.rec_transicao_par (transicao_webhook_sk, transicao_revision_sk, delta_ms, casado_em, coletado_em, coleta_id)
      VALUES ($1, $2, 30000, now(), now(), $3)`, [web, rev, coleta]);
    const r = await doCard(card);
    expect(r).toHaveLength(1);
    expect(r[0]!.ocorrido_em).toBe(Date.parse('2026-10-01T12:00:00Z'));
  });

  it('webhook ainda sem par continua contando (antecipa a revision)', async () => {
    const card = unico('c');
    await grava(card, 'webhook', '2026-10-02T12:00:00Z');
    expect(await doCard(card)).toHaveLength(1);
  });

  it('revision sem webhook conta uma transição (caminho dos dados de hoje)', async () => {
    const card = unico('c');
    await grava(card, 'revision', '2026-10-03T12:00:00Z');
    expect(await doCard(card)).toHaveLength(1);
  });
});
