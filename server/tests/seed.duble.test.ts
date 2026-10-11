import { gerarBaseMock } from '@metricas-dspd/mock';
import { describe, expect, it } from 'vitest';
import { mapearBM, semear } from '../src/plataforma/db/seed.js';
import { S_PADRAO } from '../src/plataforma/db/esquemas.js';
import { criarDublePg } from './duble-pg.js';

const base = gerarBaseMock({ semente: 3 });
const params = { semente: base.config.semente, hoje: base.config.hoje, escala: base.config.escala, mesesHistorico: base.config.mesesHistorico };
const embaralhado = Object.fromEntries(Object.entries(params).reverse());

describe('semear (dublê de banco)', () => {
  it('base vazia: uma transação por schema, lock, INSERT da coleta com RETURNING e lotes parametrizados', async () => {
    const { pool, chamadas } = criarDublePg((c) => (c.texto.includes('RETURNING coleta_id') ? [{ coleta_id: '9' }] : []));
    expect(await semear(pool, base)).toBe('semeado');
    const t = chamadas.map((c) => c.texto);
    expect(t.filter((x) => x === 'BEGIN')).toHaveLength(2);
    expect(t.filter((x) => x === 'COMMIT')).toHaveLength(2);
    expect(t.filter((x) => x.startsWith('SELECT pg_advisory_xact_lock'))).toHaveLength(2);
    expect(t.some((x) => x.startsWith(`INSERT INTO ${S_PADRAO.bm}.dim_card`))).toBe(true);
    expect(t.some((x) => x.startsWith(`INSERT INTO ${S_PADRAO.ac}.dim_chamado`))).toBe(true);
    expect(t.join('\n')).not.toMatch(/ON CONFLICT|DELETE|TRUNCATE/);
    expect(chamadas.find((c) => c.texto.includes('RETURNING coleta_id'))!.valores[1]).toBe('seed-mock');
  });
  it('mesma semente (objeto jsonb com chaves em outra ordem): não grava nada', async () => {
    for (const p of [params, embaralhado]) {
      const { pool, chamadas } = criarDublePg((c) => (c.texto.includes('FROM') ? [{ coleta_id: '1', parametros: p }] : []));
      expect(await semear(pool, base)).toBe('ja_semeado');
      expect(chamadas.some((c) => c.texto.startsWith('INSERT'))).toBe(false);
    }
  });
  it('semente diferente: recusa sem sobrescrever e desfaz', async () => {
    const { pool, chamadas } = criarDublePg((c) => (c.texto.includes('FROM') ? [{ coleta_id: '1', parametros: { semente: 999 } }] : []));
    await expect(semear(pool, base)).rejects.toThrow('já semeado com outra base');
    expect(chamadas.some((c) => c.texto.startsWith('INSERT'))).toBe(false);
    expect(chamadas.at(-1)!.texto).toBe('ROLLBACK');
  });
  it('semear sem base usa o mock padrão', async () => {
    const { pool } = criarDublePg((c) => (c.texto.includes('FROM') ? [{ coleta_id: '1', parametros: {} }] : []));
    await expect(semear(pool)).rejects.toThrow('outra base');
  });
});

describe('mapeamento: entradas inconsistentes', () => {
  const t0 = base.bm.transicoes[0]!;
  const com = (t: Partial<typeof t0>) => ({ ...base, bm: { ...base.bm, transicoes: [{ ...t0, ...t }] } });
  it('transição de card inexistente: erro com quadro "?"', () => {
    expect(() => mapearBM(com({ card_id: 'fantasma' }), 1)).toThrow('?|');
  });
  it('coluna de destino fora de ref_coluna: erro com o quadro', () => {
    expect(() => mapearBM(com({ coluna_destino: 'inexistente' }), 1)).toThrow('sem ref_coluna');
  });
});
