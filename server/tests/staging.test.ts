import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { gravarStgCard, type EntradaStgCard } from '../src/modulos/businessmap/staging.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarDublePg } from './duble-pg.js';

const sha = (s: string): Buffer => createHash('sha256').update(s).digest();
const entrada = (p: Partial<EntradaStgCard> = {}): EntradaStgCard => ({
  idOrigem: 'c1', card: { card_id: 1 }, coletaId: 7, agora: new Date('2026-10-01T00:00:00Z'),
  quadroId: 'q1', arquivado: false, excluidoDetectado: false, ...p,
});
const ehSelect = (c: { texto: string }): boolean => c.texto.startsWith('SELECT');

describe('gravarStgCard', () => {
  it('primeira versão: anterior_sk nulo, ON CONFLICT com alvo explícito e DO NOTHING, schema qualificado', async () => {
    const { pool, chamadas } = criarDublePg((c) => (ehSelect(c) ? [] : [{ stg_sk: '1' }]));
    expect(await gravarStgCard(pool, entrada({ arquivado: true, excluidoDetectado: true }), montarEsquemas('t_'))).toBe('inserido');
    const ins = chamadas[1]!;
    expect(ins.texto).toContain('INSERT INTO t_dspd_bm.stg_card');
    expect(ins.texto).toContain('ON CONFLICT ON CONSTRAINT uq_stg_card DO NOTHING RETURNING stg_sk');
    expect(ins.texto).not.toMatch(/DO UPDATE/);
    expect(ins.valores[1]).toBeNull();
    expect(ins.valores[3]).toBe('{"card_id":1}');
    expect(ins.valores[2]).toEqual(sha('{"card_id":1}'));
    expect(ins.valores.slice(5, 7)).toEqual([true, true]);
  });
  it('schema do ambiente quando não informado', async () => {
    const { pool, chamadas } = criarDublePg((c) => (ehSelect(c) ? [] : [{ stg_sk: '1' }]));
    await gravarStgCard(pool, entrada());
    expect(chamadas[0]!.texto).toContain('dspd_bm.stg_card');
  });
  it('payload igual à última versão: já existente, sem INSERT', async () => {
    const { pool, chamadas } = criarDublePg(() => [{ stg_sk: '3', payload_sha256: sha('{"card_id":1}') }]);
    expect(await gravarStgCard(pool, entrada())).toBe('ja_existente');
    expect(chamadas).toHaveLength(1);
  });
  it('payload novo encadeia na última versão', async () => {
    const { pool, chamadas } = criarDublePg((c) => (ehSelect(c) ? [{ stg_sk: '3', payload_sha256: sha('y') }] : [{ stg_sk: '4' }]));
    expect(await gravarStgCard(pool, entrada())).toBe('inserido');
    expect(chamadas[1]!.valores[1]).toBe('3');
  });
  it('conflito (zero linhas): relê e vira já existente se a outra transação gravou o mesmo conteúdo', async () => {
    let selects = 0;
    const { pool } = criarDublePg((c) => {
      if (ehSelect(c)) return ++selects === 1 ? [] : [{ stg_sk: '1', payload_sha256: sha('{"card_id":1}') }];
      return [];
    });
    expect(await gravarStgCard(pool, entrada())).toBe('ja_existente');
  });
  it('erro que não é conflito propaga', async () => {
    const { pool } = criarDublePg((c) => (ehSelect(c) ? [] : new Error('boom')));
    await expect(gravarStgCard(pool, entrada())).rejects.toThrow('boom');
  });
  it('conflito persistente após 5 tentativas falha', async () => {
    const { pool, chamadas } = criarDublePg(() => []);
    await expect(gravarStgCard(pool, entrada())).rejects.toThrow('conflito persistente');
    expect(chamadas).toHaveLength(10);
  });
});
