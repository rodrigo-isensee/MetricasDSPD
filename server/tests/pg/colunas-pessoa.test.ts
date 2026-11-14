import { describe, expect, it } from 'vitest';
import type pg from 'pg';
import { provarSemPessoa } from './colunas-pessoa.js';

// K-326: unidade sem banco (pool falso). A prova de banco real é o job banco do CI.
const dono = (colunas: string[]): pg.Pool =>
  ({ query: async () => ({ rows: colunas.map((column_name) => ({ column_name })) }) }) as unknown as pg.Pool;
const papel = (erro: { code?: string } | null): pg.Pool =>
  ({ query: async () => { if (erro) throw Object.assign(new Error('x'), erro); return { rows: [] }; } }) as unknown as pg.Pool;

describe('provarSemPessoa (K-326)', () => {
  it('lança quando não há coluna de pessoa a provar (nunca passa verde vazia)', async () => {
    await expect(provarSemPessoa(papel({ code: '42501' }), dono([]), 'dspd_bm.tabela_sem_pessoa', 'schema_t')).rejects.toThrow(/COLUNAS_PESSOA não tem coluna|prova vazia/);
  });

  it('passa quando a coluna existe e o GRANT é negado (42501)', async () => {
    await expect(provarSemPessoa(papel({ code: '42501' }), dono(['responsaveis']), 'dspd_bm.dim_card', 'schema_t')).resolves.toBeUndefined();
  });

  it('falha quando a coluna de pessoa é legível', async () => {
    await expect(provarSemPessoa(papel(null), dono(['responsaveis']), 'dspd_bm.dim_card', 'schema_t')).rejects.toThrow(/esperado 42501, veio leitura permitida/);
  });

  it('falha quando a coluna não existe na tabela real', async () => {
    await expect(provarSemPessoa(papel({ code: '42501' }), dono(['outra']), 'dspd_bm.dim_card', 'schema_t')).rejects.toThrow(/não existe na tabela/);
  });
});
