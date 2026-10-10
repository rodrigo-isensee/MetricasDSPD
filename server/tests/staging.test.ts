import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { ehDuplicata, gravarStgCard, type EntradaStgCard } from '../src/db/staging.js';
import { criarDubleDb } from './duble-db.js';

const sha = (s: string): Buffer => createHash('sha256').update(s).digest();
const entrada = (p: Partial<EntradaStgCard> = {}): EntradaStgCard => ({
  idOrigem: 'c1', payload: { a: 1 }, sha256: sha('x'), coletaId: 7, agora: new Date('2026-10-01T00:00:00Z'),
  quadroId: 'q1', arquivado: false, excluidoDetectado: false, ...p,
});
const dup = Object.assign(new Error('dup'), { errno: 1062 });

describe('ehDuplicata', () => {
  it('só reconhece errno 1062', () => {
    expect(ehDuplicata(dup)).toBe(true);
    expect(ehDuplicata({ errno: 1 })).toBe(false);
    expect(ehDuplicata(null)).toBe(false);
    expect(ehDuplicata('1062')).toBe(false);
  });
});

describe('gravarStgCard', () => {
  it('insere a primeira versão encadeada em 0, com flags', async () => {
    const { db, chamadas } = criarDubleDb();
    expect(await gravarStgCard(db, entrada({ arquivado: true, excluidoDetectado: true }))).toBe('inserido');
    const ins = chamadas[1]!;
    expect(ins.sql).toContain('INSERT INTO dspd_bm.stg_card');
    expect(ins.parametros).toContain(0);
    expect(ins.parametros).toContain('{"a":1}');
    expect(ins.parametros.filter((p) => p === 1)).toHaveLength(2);
  });

  it('payload igual à última versão: já existente, sem INSERT', async () => {
    const { db, chamadas } = criarDubleDb(() => [{ stg_sk: '3', payload_sha256: sha('x') }]);
    expect(await gravarStgCard(db, entrada())).toBe('ja_existente');
    expect(chamadas).toHaveLength(1);
  });

  it('payload novo encadeia na última versão', async () => {
    const { db, chamadas } = criarDubleDb((c) => (c.sql.includes('SELECT') ? [{ stg_sk: '3', payload_sha256: sha('y') }] : []));
    expect(await gravarStgCard(db, entrada())).toBe('inserido');
    expect(chamadas[1]!.parametros).toContain('3');
  });

  it('duplicata na corrida: relê e vira já existente', async () => {
    let selects = 0;
    const { db } = criarDubleDb((c) => {
      if (c.sql.includes('SELECT')) return ++selects === 1 ? [] : [{ stg_sk: '1', payload_sha256: sha('x') }];
      return dup;
    });
    expect(await gravarStgCard(db, entrada())).toBe('ja_existente');
  });

  it('erro que não é duplicata propaga', async () => {
    const { db } = criarDubleDb((c) => (c.sql.includes('SELECT') ? [] : new Error('boom')));
    await expect(gravarStgCard(db, entrada())).rejects.toThrow('boom');
  });

  it('conflito persistente após 5 tentativas falha', async () => {
    const { db, chamadas } = criarDubleDb((c) => (c.sql.includes('SELECT') ? [] : dup));
    await expect(gravarStgCard(db, entrada())).rejects.toThrow('conflito persistente');
    expect(chamadas).toHaveLength(10);
  });
});
