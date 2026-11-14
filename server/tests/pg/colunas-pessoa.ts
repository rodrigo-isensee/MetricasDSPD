import type pg from 'pg';
import { COLUNAS_PESSOA } from '../../src/plataforma/db/lgpd.js';

/**
 * K-282: as colunas de pessoa que as provas de GRANT afirmam como proibidas vêm de `COLUNAS_PESSOA` (fonte única, lgpd.ts),
 * não de lista escrita à mão que se desatualiza do esquema. `chave` é `schema.tabela` SEM prefixo de teste (ex.: `dspd_bm.dim_card`).
 */
export const colunasDePessoa = (chave: string): string[] => {
  const colunas = COLUNAS_PESSOA.filter((c) => c.startsWith(`${chave}.`)).map((c) => c.slice(chave.length + 1));
  if (colunas.length === 0) throw new Error(`COLUNAS_PESSOA não tem coluna de pessoa para ${chave}`);
  return colunas;
};

/**
 * Prova que `papel` não lê nenhuma coluna de pessoa de `chave`: cada coluna listada tem de EXISTIR na tabela real (42703 não
 * passa por 42501) e o SELECT do papel tem de falhar exatamente com 42501. `schemaReal` é o schema com prefixo de teste (S.bm).
 */
export const provarSemPessoa = async (papel: pg.Pool, dono: pg.Pool, chave: string, schemaReal: string): Promise<void> => {
  const tabela = chave.split('.')[1] as string;
  const colunas = colunasDePessoa(chave);
  // K-326: guarda depois do filtro; lista vazia faria a prova passar verde sem provar nada.
  if (colunas.length === 0) throw new Error(`provarSemPessoa: nenhuma coluna de pessoa a provar para ${chave} (prova vazia)`);
  const existentes = (await dono.query<{ column_name: string }>(
    'SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2', [schemaReal, tabela])).rows.map((r) => r.column_name);
  for (const col of colunas) {
    if (!existentes.includes(col)) throw new Error(`COLUNAS_PESSOA lista ${chave}.${col}, que não existe na tabela (esquema desatualizado)`);
    let codigo: string | undefined;
    try { await papel.query(`SELECT ${col} FROM ${schemaReal}.${tabela}`); } catch (e) { codigo = (e as { code?: string }).code; }
    if (codigo !== '42501') throw new Error(`${chave}.${col}: esperado 42501, veio ${codigo ?? 'leitura permitida'}`);
  }
};
