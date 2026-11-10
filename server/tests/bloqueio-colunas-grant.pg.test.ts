import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { poolDe, S, url } from './pg/ctx.js';

// Lote 4c do 075 (SEG-A4, CA-075-5): as colunas atuais escritas à mão contra o catálogo depois de todas as migrações, e a API fora de evt e stg.
const d = describe.skipIf(!url);
const COLUNAS = {
  evt_bloqueio: ['evt_sk', 'card_id', 'id_origem', 'tipo', 'motivo_codigo', 'coluna_id', 'fornecedor_codigo', 'ocorrido_em', 'coletado_em', 'coleta_id', 'sistema_origem'],
  fato_bloqueio: ['bloqueio_sk', 'card_id', 'id_origem', 'motivo', 'coluna_em_que_bloqueou', 'fornecedor', 'inicio', 'fim', 'duracao_horas_uteis', 'coletado_em', 'atualizado_por_coleta_id', 'sistema_origem'],
};

d('lote 4c do 075: colunas e GRANT de bloqueio no banco migrado', () => {
  let dono: pg.Pool, api: pg.Pool;
  beforeAll(() => { dono = poolDe(); api = poolDe('dspd_api'); });
  afterAll(async () => { await Promise.all([dono.end(), api.end()]); });

  it.each(Object.entries(COLUNAS))('%s tem exatamente a lista de colunas escrita no teste (coluna nova exige mudar aqui)', async (tabela, esperadas) => {
    const r = await dono.query<{ column_name: string }>(`SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 ORDER BY ordinal_position`, [S.bm, tabela]);
    expect(r.rows.map((x) => x.column_name)).toEqual(esperadas);
  });

  it.each(['evt_bloqueio', 'stg_bloqueio'])('dspd_api não lê %s (42501)', async (tabela) => {
    await expect(api.query(`SELECT 1 FROM ${S.bm}.${tabela}`)).rejects.toMatchObject({ code: '42501' });
    await expect(api.query(`SELECT card_id FROM ${S.bm}.${tabela}`)).rejects.toMatchObject({ code: '42501' });
  });
});
