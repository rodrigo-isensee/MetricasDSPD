import { gerarBaseMock } from '@metricas-dspd/mock';
import { describe, expect, it } from 'vitest';
import { insertLote, mapearBM, semear } from '../src/db/seed.js';
import { criarDubleDb } from './duble-db.js';

const base = gerarBaseMock({ semente: 3 });
const params = JSON.stringify({ semente: base.config.semente, hoje: base.config.hoje, escala: base.config.escala, mesesHistorico: base.config.mesesHistorico });

describe('semear (dublê de banco)', () => {
  it('base vazia: grava BM e AC em lotes parametrizados', async () => {
    const { db, chamadas } = criarDubleDb((c) => (c.sql.includes('SELECT') ? [] : { rows: [], insertId: 9n }));
    expect(await semear(db, base)).toBe('semeado');
    const ins = chamadas.filter((c) => c.sql.includes('INSERT INTO dspd_'));
    expect(ins.some((c) => c.sql.includes('dspd_bm.dim_card'))).toBe(true);
    expect(ins.some((c) => c.sql.includes('dspd_ac.dim_chamado'))).toBe(true);
  });

  it('mesma semente (parametros string ou objeto): não grava nada', async () => {
    for (const p of [params, JSON.parse(params)]) {
      const { db, chamadas } = criarDubleDb(() => [{ coleta_id: '1', parametros: p }]);
      expect(await semear(db, base)).toBe('ja_semeado');
      expect(chamadas.some((c) => c.sql.includes('INSERT INTO'))).toBe(false);
    }
  });

  it('semente diferente: recusa sem sobrescrever', async () => {
    const { db, chamadas } = criarDubleDb(() => [{ coleta_id: '1', parametros: '{"semente":999}' }]);
    await expect(semear(db, base)).rejects.toThrow('já semeado com outra base');
    expect(chamadas.some((c) => c.sql.includes('INSERT INTO'))).toBe(false);
  });

  it('semear sem base usa o mock padrão', async () => {
    const { db } = criarDubleDb(() => [{ coleta_id: '1', parametros: '{}' }]);
    await expect(semear(db)).rejects.toThrow('outra base');
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
  it('lote vazio gera colunas vazias', () => {
    expect(insertLote('dspd_bm.x', []).compile(criarDubleDb().db).sql).toContain('INSERT INTO dspd_bm.x ()');
  });
});
