import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { carregarConfigApi } from '../src/plataforma/config.js';
import { LIMITE_WEBHOOK_BYTES, receberWebhook, segredoConfere } from '../src/modulos/businessmap/index.js';
import { criarDublePg, type Respondedor } from './duble-pg.js';

const SEGREDO = 'segredo-de-teste-com-mais-de-16';
const AGORA = new Date('2026-10-10T15:00:00Z');
const URL = '/webhooks/businessmap';
const EVENTO = '{"evento":"card_moved","card":{"id":1}}';

async function montar(r: Respondedor = (c) => (c.texto.includes('stg_webhook_evento') ? [{ webhook_sk: '7' }] : [])) {
  const api = criarDublePg();
  const wh = criarDublePg(r);
  const linhas: string[] = [];
  const app = await buildApp({ db: api.pool, agora: () => AGORA, nivelLog: 'info', destinoLog: { write: (m) => { linhas.push(m); } }, webhook: { pool: wh.pool, segredo: SEGREDO } });
  const post = (corpo: string | Buffer, headers: Record<string, string> = { 'x-webhook-secret': SEGREDO, 'content-type': 'application/json' }) =>
    app.inject({ method: 'POST', url: URL, payload: corpo, headers });
  return { app, api, wh, post, linhas };
}

describe('POST /webhooks/businessmap', () => {
  it('202: grava a entrega e o evento bm.webhook.recebido na MESMA transação', async () => {
    const { post, wh, api } = await montar();
    const corpo = JSON.stringify({ evento: 'card_moved', card: { id: 10 } });
    const r = await post(corpo);
    expect(r.statusCode).toBe(202);
    expect(r.json()).toEqual({ status: 'recebido' });
    const t = wh.chamadas.map((c) => c.texto);
    expect(t[0]).toBe('BEGIN');
    expect(t[1]).toContain('INSERT INTO dspd_bm.stg_webhook_evento');
    expect(t[1]).toContain('ON CONFLICT ON CONSTRAINT uq_stg_webhook_evento DO NOTHING RETURNING webhook_sk');
    expect(t[2]).toContain("INSERT INTO dspd_core.outbox (fonte, tipo, payload) VALUES ('businessmap', $1");
    expect(t[2]).not.toContain('RETURNING');
    expect(t[3]).toBe('COMMIT');
    expect(wh.chamadas[1]!.valores[0]).toEqual(createHash('sha256').update(corpo).digest());
    expect(wh.chamadas[1]!.valores[2]).toEqual(AGORA);
    expect(wh.chamadas[2]!.valores[0]).toBe('bm.webhook.recebido');
    expect(JSON.parse(wh.chamadas[2]!.valores[1] as string)).toEqual({ webhookSk: '7', payloadSha256: createHash('sha256').update(corpo).digest('hex') });
    expect(api.chamadas).toHaveLength(0);
  });
  it('M-2: grava o registro da allow-list, nunca o corpo bruto; o hash é o do corpo bruto', async () => {
    const { post, wh } = await montar();
    const corpo = JSON.stringify({ evento: 'card_moved', card: { id: 10, column_id: 7, title: 'MARCADOR-X', description: 'MARCADOR-X' }, author: 'MARCADOR-X', text: 'MARCADOR-X', discard_comment: 'MARCADOR-X', user: { email: 'MARCADOR-X' } });
    expect((await post(corpo)).statusCode).toBe(202);
    const ins = wh.chamadas[1]!;
    expect(ins.valores[0]).toEqual(createHash('sha256').update(corpo).digest());
    expect(JSON.parse(ins.valores[1] as string)).toEqual({ evento: 'card_moved', card_id: 10, column_id: 7 });
    expect(JSON.stringify(wh.chamadas.map((c) => c.valores))).not.toContain('MARCADOR-X');
  });
  it('M-2: tipo de evento fora da lista responde 202, não grava nada (nem outbox) e o log leva só o tipo', async () => {
    const { post, wh, linhas } = await montar();
    expect((await post('{"evento":"card_deleted","comment":"MARCADOR-X"}')).statusCode).toBe(202);
    expect((await post('{"evento":"Fulano MARCADOR-X"}')).statusCode).toBe(202);
    expect(wh.chamadas).toHaveLength(0);
    const log = linhas.join('');
    expect(log).toContain('card_deleted');
    expect(log).not.toContain('MARCADOR-X');
  });
  it('reenvio idêntico: 202 e nenhum evento novo', async () => {
    const { post, wh } = await montar((c) => (c.texto.includes('stg_webhook_evento') ? [] : []));
    expect((await post(EVENTO)).statusCode).toBe(202);
    expect(wh.chamadas.map((c) => c.texto).filter((t) => t.includes('outbox'))).toHaveLength(0);
    expect(wh.chamadas.at(-1)!.texto).toBe('COMMIT');
  });
  it('falha no banco: rollback e 500 sem detalhe', async () => {
    const { post, wh } = await montar((c) => (c.texto.includes('outbox') ? new Error('senha=x') : [{ webhook_sk: '1' }]));
    const r = await post(EVENTO);
    expect(r.statusCode).toBe(500);
    expect(r.body).not.toContain('senha');
    expect(wh.chamadas.at(-1)!.texto).toBe('ROLLBACK');
  });
  it.each([
    ['sem segredo', { 'content-type': 'application/json' }],
    ['segredo errado', { 'x-webhook-secret': 'errado', 'content-type': 'application/json' }],
  ])('401 UNAUTHENTICATED: %s (nada é gravado)', async (_n, headers) => {
    const { post, wh } = await montar();
    const r = await post('{"a":1}', headers);
    expect(r.statusCode).toBe(401);
    expect(r.json().error.code).toBe('UNAUTHENTICATED');
    expect(wh.chamadas).toHaveLength(0);
  });
  it('401 antes de ler o corpo: corpo enorme sem segredo também é 401', async () => {
    const { post } = await montar();
    expect((await post('x'.repeat(LIMITE_WEBHOOK_BYTES + 10), { 'content-type': 'application/json' })).statusCode).toBe(401);
  });
  it.each([
    ['JSON inválido', '{nao-json'],
    ['array', '[1,2]'],
    ['texto', '"x"'],
    ['nulo', 'null'],
    ['NUL escapado', '{"a":"\\u0000"}'],
  ])('400 PAYLOAD_INVALIDO: %s', async (_n, corpo) => {
    const { post, wh } = await montar();
    const r = await post(corpo);
    expect(r.statusCode).toBe(400);
    expect(r.json().error.code).toBe('PAYLOAD_INVALIDO');
    expect(wh.chamadas).toHaveLength(0);
  });
  it('256 KB é o limite: exatamente o limite passa, um byte a mais = 413', async () => {
    const { post } = await montar();
    const base = '{"a":""}';
    const ok = JSON.stringify({ a: 'x'.repeat(LIMITE_WEBHOOK_BYTES - base.length) });
    expect(Buffer.byteLength(ok)).toBe(LIMITE_WEBHOOK_BYTES);
    expect((await post(ok)).statusCode).toBe(202);
    const grande = await post(JSON.stringify({ a: 'x'.repeat(LIMITE_WEBHOOK_BYTES - base.length + 1) }));
    expect(grande.statusCode).toBe(413);
    expect(grande.json().error.code).toBe('PAYLOAD_GRANDE');
  });
  it('o segredo e o corpo nunca vão para o log', async () => {
    const { post, linhas } = await montar();
    await post('{"dado":"sensivel-123"}');
    const todo = linhas.join('');
    expect(todo).not.toContain(SEGREDO);
    expect(todo).not.toContain('sensivel-123');
  });
  it('sem a configuração a rota não existe (404)', async () => {
    const app = await buildApp({ db: criarDublePg().pool, agora: () => AGORA, nivelLog: 'silent' });
    expect((await app.inject({ method: 'POST', url: URL, payload: '{}', headers: { 'content-type': 'application/json' } })).statusCode).toBe(404);
  });
  it('aparece no OpenAPI com 202, 400, 401 e 413', async () => {
    const { app } = await montar();
    await app.ready();
    expect(Object.keys(app.swagger().paths![URL]!.post!.responses!)).toEqual(['202', '400', '401', '413', '500']);
  });
});

describe('segredoConfere e receberWebhook', () => {
  it('compara em tempo constante e rejeita não-texto', () => {
    expect(segredoConfere(SEGREDO, SEGREDO)).toBe(true);
    expect(segredoConfere(`${SEGREDO}x`, SEGREDO)).toBe(false);
    expect(segredoConfere(undefined, SEGREDO)).toBe(false);
    expect(segredoConfere(['a'], SEGREDO)).toBe(false);
  });
  it('devolve se a entrega era nova', async () => {
    const nova = criarDublePg(() => [{ webhook_sk: '1' }]);
    expect(await receberWebhook(nova.pool, Buffer.from('{}'), { evento: 'card_moved' }, AGORA)).toBe('gravado');
    const repetida = criarDublePg(() => []);
    expect(await receberWebhook(repetida.pool, Buffer.from('{}'), { evento: 'card_moved' }, AGORA)).toBe('duplicado');
  });
});

describe('config do webhook', () => {
  const base = { PG_API_URL: 'postgres://u:p@h/db' };
  it('sem as duas variáveis: desligado; vazias (Compose) também', () => {
    expect(carregarConfigApi(base).PG_WEBHOOK_URL).toBeUndefined();
    const c = carregarConfigApi({ ...base, PG_WEBHOOK_URL: '', WEBHOOK_BM_SEGREDO: '' });
    expect(c.PG_WEBHOOK_URL).toBeUndefined();
    expect(c.WEBHOOK_BM_SEGREDO).toBeUndefined();
  });
  it('as duas juntas ligam; uma só ou segredo curto falham citando só nomes de variáveis', () => {
    const c = carregarConfigApi({ ...base, PG_WEBHOOK_URL: 'postgres://w:x@h/db', WEBHOOK_BM_SEGREDO: SEGREDO });
    expect(c.WEBHOOK_BM_SEGREDO).toBe(SEGREDO);
    expect(() => carregarConfigApi({ ...base, PG_WEBHOOK_URL: 'postgres://w:senha@h/db' })).toThrow(/WEBHOOK_BM_SEGREDO/);
    expect(() => carregarConfigApi({ ...base, WEBHOOK_BM_SEGREDO: SEGREDO })).toThrow(/PG_WEBHOOK_URL/);
    expect(() => carregarConfigApi({ ...base, PG_WEBHOOK_URL: 'postgres://w:senha@h/db', WEBHOOK_BM_SEGREDO: 'curto' })).toThrow(/WEBHOOK_BM_SEGREDO/);
    try { carregarConfigApi({ ...base, PG_WEBHOOK_URL: 'postgres://w:senha@h/db', WEBHOOK_BM_SEGREDO: 'curto' }); } catch (e) { expect((e as Error).message).not.toContain('senha'); }
  });
});
