import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  CATALOGO_EVENTOS, EXEMPLOS_EVENTOS, conferirFonte, publicarEvento, validarPayload, type CatalogoEventos,
} from '../src/plataforma/eventos/index.js';
import { receberWebhook } from '../src/modulos/businessmap/index.js';
import { SEGMENTO_PESSOA, segmentos } from '../src/plataforma/db/lgpd.js';
import { criarDublePg } from './duble-pg.js';

const tipos = Object.keys(CATALOGO_EVENTOS);
type JsonSchema = { properties?: Record<string, JsonSchema>; items?: JsonSchema; anyOf?: JsonSchema[] };

/** Todas as chaves de propriedade, em qualquer nível (objetos, listas e uniões). */
const chaves = (j: JsonSchema): string[] => [
  ...Object.entries(j.properties ?? {}).flatMap(([k, v]) => [k, ...chaves(v)]),
  ...(j.items ? chaves(j.items) : []),
  ...(j.anyOf ?? []).flatMap(chaves),
];
const ehPessoa = (chave: string): boolean => segmentos(chave.replace(/([a-z])([A-Z])/g, '$1_$2')).some((s) => SEGMENTO_PESSOA.test(s));

describe('catálogo de eventos da outbox (contrato)', () => {
  it('todo tipo tem um exemplo e o exemplo passa no schema', () => {
    expect(Object.keys(EXEMPLOS_EVENTOS).sort()).toEqual([...tipos].sort());
    for (const t of tipos) expect(() => validarPayload(t, EXEMPLOS_EVENTOS[t as keyof typeof EXEMPLOS_EVENTOS])).not.toThrow();
  });

  it('nenhum payload tem chave de pessoa (fonte única SEGMENTO_PESSOA, por segmento, em qualquer nível) e todo schema é estrito', () => {
    for (const t of tipos) {
      const json = z.toJSONSchema(CATALOGO_EVENTOS[t as keyof typeof CATALOGO_EVENTOS]) as JsonSchema & { additionalProperties: unknown };
      expect(json.additionalProperties).toBe(false);
      for (const chave of chaves(json)) expect(ehPessoa(chave), `${t}.${chave}`).toBe(false);
    }
  });

  it('o detector de pessoa enxerga chave aninhada, em lista, em união e em camelCase', () => {
    const j = z.toJSONSchema(z.object({
      a: z.object({ b: z.array(z.object({ responsavelEmail: z.string() })) }),
      c: z.union([z.object({ solicitante_id: z.string() }), z.string()]),
      d: z.string(),
    })) as JsonSchema;
    expect(chaves(j).filter(ehPessoa)).toEqual(['responsavelEmail', 'solicitante_id']);
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
    expect(await receberWebhook(d.pool, Buffer.from('{}'), { evento: 'card_moved' }, new Date(0))).toBe('gravado');
    const evento = d.chamadas.find((c) => c.texto.includes('outbox'))!;
    expect(() => validarPayload('bm.webhook.recebido', JSON.parse(String(evento.valores[1])))).not.toThrow();
  });

  it('BusinessMap e Acelerato nunca se misturam na publicação: prefixo do tipo e payload.fonte conferem com a fonte', async () => {
    const d = criarDublePg(() => [{ evento_id: 'u1' }]);
    const wh = { webhookSk: '7', payloadSha256: 'a'.repeat(64) };
    await expect(publicarEvento(d.cliente, { fonte: 'acelerato', tipo: 'bm.webhook.recebido', payload: wh })).rejects.toThrow('pertence a businessmap');
    await expect(publicarEvento(d.cliente, { fonte: 'businessmap', tipo: 'coleta.concluida', payload: { fonte: 'acelerato', coletaId: '1', status: 'sucesso' } })).rejects.toThrow('payload.fonte diverge');
    expect(d.chamadas).toHaveLength(0);
    await expect(publicarEvento(d.cliente, { fonte: 'businessmap', tipo: 'bm.webhook.recebido', payload: wh })).resolves.toBe('u1');
    await expect(publicarEvento(d.cliente, { fonte: 'acelerato', tipo: 'coleta.concluida', payload: { fonte: 'acelerato', coletaId: '1', status: 'sucesso' } })).resolves.toBe('u1');
    expect(d.chamadas).toHaveLength(2);
  });

  it('conferirFonte: prefixo ac., payload sem fonte ou não objeto não acusam; mensagem sem valores', () => {
    expect(() => conferirFonte('businessmap', 'ac.x', {})).toThrow('pertence a acelerato');
    expect(() => conferirFonte('acelerato', 'ac.x', {})).not.toThrow();
    expect(() => conferirFonte('acelerato', 'coleta.concluida', null)).not.toThrow();
    expect(() => conferirFonte('acelerato', 'coleta.concluida', 'texto')).not.toThrow();
    expect(() => conferirFonte('acelerato', 'coleta.concluida', { fonte: 'segredo' })).toThrow('diverge');
  });
});
