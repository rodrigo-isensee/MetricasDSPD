import { describe, expect, it } from 'vitest';
import { S_PADRAO } from '../src/plataforma/db/esquemas.js';
import { gerarGrants } from '../src/plataforma/db/grants.js';
import { MIGRACOES } from './migracoes.js';

// Lote 4c do 075 (K-204, CA-075-4 e CA-075-5): nenhuma coluna nova nas tabelas de bloqueio e nenhum GRANT novo; sem banco.
const ALTERA = /ALTER TABLE\s+\S*\b(fato_bloqueio|evt_bloqueio)\b/i;
const alteracoes = (migracoes: Record<string, string[]>): string[] => Object.entries(migracoes).flatMap(([n, sqls]) => sqls.filter((q) => ALTERA.test(q)).map((q) => `${n}: ${q}`));

describe('CA-075-4: sem ALTER TABLE em fato_bloqueio e evt_bloqueio depois da 0006', () => {
  const posteriores = Object.fromEntries(Object.keys(MIGRACOES).filter((n) => Number(n.slice(0, 4)) > 6)
    .map((n) => [n, [...MIGRACOES[n]!.ddl(S_PADRAO).up, ...MIGRACOES[n]!.ddl(S_PADRAO).down]]));
  it('nenhuma migração posterior altera as duas tabelas', () => {
    expect(Object.keys(posteriores).length).toBeGreaterThan(0);
    expect(alteracoes(posteriores)).toEqual([]);
  });
  it('migração de teste com bloqueado_por, comentario e observacao é reprovada', () => {
    const ruim = { '9999_ruim': ['bloqueado_por', 'comentario', 'observacao'].map((c) => `ALTER TABLE dspd_bm.fato_bloqueio ADD COLUMN ${c} text`), '9998_ruim': ['ALTER TABLE dspd_bm.evt_bloqueio ADD COLUMN comentario text'] };
    expect(alteracoes(ruim)).toHaveLength(4);
    expect(alteracoes({ '9997_ok': ['ALTER TABLE dspd_bm.dim_card ADD COLUMN x text'] })).toEqual([]);
  });
});

describe('CA-075-5: gerarGrants das tabelas de bloqueio é o da develop', () => {
  const cat = { bm: { stg_bloqueio: ['stg_sk'], evt_bloqueio: ['evt_sk'], fato_bloqueio: ['bloqueio_sk', 'motivo'] }, ac: {}, core: {} };
  it('só o coletor escreve (stg e evt só inserem), a API só lê o fato', () => {
    expect(gerarGrants(S_PADRAO, cat).filter((l) => /bloqueio/.test(l))).toEqual([
      'GRANT SELECT, INSERT ON dspd_bm.stg_bloqueio TO dspd_coletor',
      'GRANT SELECT, INSERT ON dspd_bm.evt_bloqueio TO dspd_coletor',
      'GRANT SELECT, INSERT, UPDATE, DELETE ON dspd_bm.fato_bloqueio TO dspd_coletor',
      'GRANT SELECT ON dspd_bm.fato_bloqueio TO dspd_api',
    ]);
  });
});
