import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  CATALOGO_EVENTOS, EXEMPLOS_EVENTOS, publicarEvento, validarPayload, type CatalogoEventos,
} from '../src/plataforma/eventos/index.js';
import { receberWebhook } from '../src/modulos/businessmap/index.js';
import { criarDublePg } from './duble-pg.js';

const tipos = Object.keys(CATALOGO_EVENTOS);
const CHAVE_PESSOA = /^(pessoa|responsav\w*|usuario\w*|user\w*|agente\w*|atendente\w*|solicitante\w*|autor\w*|criador\w*|email\w*|login\w*|assignee\w*)$/i;

describe('catálogo de eventos da outbox (contrato)', () => {
  it('todo tipo tem um exemplo e o exemplo passa no schema', () => {
    expect(Object.keys(EXEMPLOS_EVENTOS).sort()).toEqual([...tipos].sort());
    for (const t of tipos) expect(() => validarPayload(t, EXEMPLOS_EVENTOS[t as keyof typeof EXEMPLOS_EVENTOS])).not.toThrow();
  });

  it('nenhum payload tem chave de pessoa e todo schema é estrito', () => {
    for (const t of tipos) {
      const json = z.toJSONSchema(CATALOGO_EVENTOS[t as keyof typeof CATALOGO_EVENTOS]) as { properties: Record<string, unknown>; additionalProperties: unknown };
      expect(json.additionalProperties).toBe(false);
      for (const chave of Object.keys(json.properties)) expect(CHAVE_PESSOA.test(chave), `${t}.${chave}`).toBe(false);
    }
  });

  it('recusa tipo fora do catálogo, campo extra, campo faltando e valor inválido, sem vazar o valor', () => {
    expect(() => validarPayload('x.y', {})).toThrow('sem schema no catálogo');
    expect(() => validarPayload('coleta.concluida', { fonte: 'businessmap', coletaId: '1', status: 'sucesso', responsavel: 'Ana' })).toThrow('Payload inválido');
    expect(() => validarPayload('coleta.concluida', { fonte: 'businessmap' })).toThrow('coletaId, status');
    expect(() => validarPayload('coleta.concluida', 'texto-secreto')).toThrow('(raiz)');
    let msg = '';
    try { validarPayload('bm.webhook.recebido', { webhookSk: 'segredo-123', payloadSha256: 'a'.repeat(64) }); } catch (e) { msg = (e as Error).message; }
    expect(msg).toContain('webhookSk');
    expect(msg).not.toContain('segredo-123');
  });

  it('usa o catálogo informado quando há um', () => {
    const outro: CatalogoEventos = { 'bm.x': z.object({ a: z.number() }) };
    expect(validarPayload('bm.x', { a: 1 }, outro)).toEqual({ a: 1 });
    expect(() => validarPayload('bm.x', { a: 'b' }, outro)).toThrow('bm.x: a');
  });

  it('publicarEvento valida antes de gravar (nada é enviado ao banco com payload inválido)', async () => {
    const d = criarDublePg(() => [{ evento_id: 'u1' }]);
    await expect(publicarEvento(d.cliente, { fonte: 'acelerato', tipo: 'coleta.concluida', payload: { status: 'ok' } })).rejects.toThrow('Payload inválido');
    await expect(publicarEvento(d.cliente, { fonte: 'acelerato', tipo: 'inexistente', payload: {} })).rejects.toThrow('sem schema');
    expect(d.chamadas).toHaveLength(0);
  });

  it('o webhook grava um evento que passa no schema do catálogo', async () => {
    const d = criarDublePg((c) => (c.texto.includes('stg_webhook_evento') ? [{ webhook_sk: '12' }] : []));
    expect(await receberWebhook(d.pool, Buffer.from('{}'), {}, new Date(0))).toBe(true);
    const evento = d.chamadas.find((c) => c.texto.includes('outbox'))!;
    expect(() => validarPayload('bm.webhook.recebido', JSON.parse(String(evento.valores[1])))).not.toThrow();
  });
});
