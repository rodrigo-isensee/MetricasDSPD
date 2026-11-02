import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { poolDe, S, url } from './pg/ctx.js';

const d = describe.skipIf(!url);

/** Casos de abuso do `ac:ref-sync` (056, E4.27): privilégios por papel sobre `ref_dominio` e `ref_versao_criterio`, tudo desfeito no fim. */
d('QA 056 carga inicial: abuso de privilégio sobre ref_dominio e ref_versao_criterio', () => {
  let ref: pg.Pool, coletor: pg.Pool, api: pg.Pool;
  beforeAll(() => { ref = poolDe('dspd_ref'); coletor = poolDe('dspd_coletor'); api = poolDe('dspd_api'); });
  afterAll(async () => { await Promise.all([ref.end(), coletor.end(), api.end()]); });

  const codigo = async (pool: pg.Pool, sql: string): Promise<string | undefined> => {
    const c = await pool.connect();
    try {
      await c.query('BEGIN');
      await c.query(sql);
      return undefined;
    } catch (e) {
      return (e as { code?: string }).code;
    } finally {
      await c.query('ROLLBACK');
      c.release();
    }
  };

  it('o coletor não altera nem apaga o ref_dominio e não escreve versão de critério', async () => {
    expect(await codigo(coletor, `UPDATE ${S.ac}.ref_dominio SET vigente_ate = '2026-01-01'`)).toBe('42501');
    expect(await codigo(coletor, `DELETE FROM ${S.ac}.ref_dominio`)).toBe('42501');
    expect(await codigo(coletor, `INSERT INTO ${S.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em) VALUES ('2026-11-02', 'acelerato', 'x', 'x', 'x', now())`)).toBe('42501');
  });

  it('o papel de referência não reescreve a vigência de origem nem apaga versão de critério', async () => {
    expect(await codigo(ref, `UPDATE ${S.ac}.ref_dominio SET vigente_de = '2020-01-01'`)).toBe('42501');
    expect(await codigo(ref, `UPDATE ${S.ac}.ref_dominio SET codigo = 'x'`)).toBe('42501');
    expect(await codigo(ref, `DELETE FROM ${S.core}.ref_versao_criterio`)).toBe('42501');
    expect(await codigo(ref, `UPDATE ${S.core}.ref_versao_criterio SET descricao = 'x'`)).toBe('42501');
  });

  it('o papel da API não grava no ref_dominio', async () => {
    expect(await codigo(api, `INSERT INTO ${S.ac}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ('campo_personalizado', 'x', '2026-11-02', 'x', 0)`)).toBe('42501');
  });
});
