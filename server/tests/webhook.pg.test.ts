import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { poolDe, S, url } from './pg/ctx.js';

const d = describe.skipIf(!url);
const SEGREDO = 'segredo-de-teste-com-mais-de-16';

d('webhook do BusinessMap com o papel dspd_webhook', () => {
  let wh: pg.Pool;
  let mig: pg.Pool;
  let app: Awaited<ReturnType<typeof buildApp>>;
  beforeAll(async () => {
    wh = poolDe('dspd_webhook');
    mig = poolDe();
    app = await buildApp({ db: poolDe('dspd_api'), S, agora: () => new Date('2026-10-10T15:00:00Z'), nivelLog: 'silent', webhook: { pool: wh, segredo: SEGREDO } });
  });
  afterAll(async () => { await wh.end(); await mig.end(); });
  const post = (corpo: string) => app.inject({ method: 'POST', url: '/webhooks/businessmap', payload: corpo, headers: { 'x-webhook-secret': SEGREDO, 'content-type': 'application/json' } });
  const eventos = async (marca: string) => Number((await mig.query<{ n: string }>(
    `SELECT count(*) AS n FROM ${S.core}.outbox WHERE tipo = 'bm.webhook.recebido' AND payload->>'payloadSha256' = $1`, [marca])).rows[0]!.n);

  it('202; reenvio idêntico não duplica a entrega nem o evento; entrega diferente cria outro', async () => {
    const corpo = JSON.stringify({ evento: 'card_moved', n: Math.random() });
    expect((await post(corpo)).statusCode).toBe(202);
    expect((await post(corpo)).statusCode).toBe(202);
    const r = await mig.query<{ n: string; h: string }>(`SELECT count(*) AS n, encode(payload_sha256, 'hex') AS h FROM ${S.bm}.stg_webhook_evento WHERE payload->>'n' = $1 GROUP BY payload_sha256`, [String(JSON.parse(corpo).n)]);
    expect(r.rows[0]!.n).toBe('1');
    expect(await eventos(r.rows[0]!.h)).toBe(1);
    const outro = JSON.stringify({ evento: 'card_moved', n: Math.random() });
    expect((await post(outro)).statusCode).toBe(202);
  });
  it('o papel só insere: não lê o payload nem o outbox', async () => {
    await expect(wh.query(`SELECT payload FROM ${S.bm}.stg_webhook_evento LIMIT 1`)).rejects.toThrow(/permission denied/);
    await expect(wh.query(`SELECT evento_sk FROM ${S.core}.outbox LIMIT 1`)).rejects.toThrow(/permission denied/);
  });
});
