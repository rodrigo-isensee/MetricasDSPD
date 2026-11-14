import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { COLUNAS_FORA_DA_API, TABELAS_FORA_DA_API } from '../src/plataforma/db/grants.js';
import { COLUNAS_PESSOA, EXCECOES_PESSOA, colunaDePessoa } from '../src/plataforma/db/lgpd.js';
import { poolDe, prefixo, url } from './pg/ctx.js';

// K-236: teste geral, coluna a coluna, de TUDO o que o `dspd_api` consegue ler nos schemas bm e ac do banco migrado. Não depende de lista de tabelas
// escrita à mão: tabela nova com GRANT entra sozinha. O teste de pessoa por tabela (`provarSemPessoa`) só casa colunas já listadas; este fecha o resto.
const d = describe.skipIf(!url);

/** Listadas em `grants.ts` antes de a tabela existir (a documentação da própria lista diz isso: "entra aqui quando a tabela existir"). Remover a linha quando a tabela chegar. */
const AINDA_SEM_TABELA = new Set(['dspd_bm.agg_conhecimento_sistema.entregas']);

/** Únicas tabelas com coluna de pessoa em que a API lê as demais colunas (GRANT por coluna). Qualquer outra tabela com coluna de pessoa fica inteira fora da API. */
const LEITURA_PARCIAL_PERMITIDA = new Set(['dspd_bm.dim_card']);

type Coluna = { schema: string; tabela: string; coluna: string; legivel: boolean };

d('K-236: nenhuma tabela com GRANT ao dspd_api deixa coluna de pessoa ou não liberada legível', () => {
  let dono: pg.Pool, api: pg.Pool;
  let colunas: Coluna[] = [];
  const logico = (schema: string): string => (prefixo && schema.startsWith(prefixo) ? schema.slice(prefixo.length) : schema);
  const id = (c: Pick<Coluna, 'schema' | 'tabela'> & { coluna?: string }): string => `${logico(c.schema)}.${c.tabela}${c.coluna === undefined ? '' : `.${c.coluna}`}`;

  beforeAll(async () => {
    dono = poolDe(); api = poolDe('dspd_api');
    const r = await dono.query<{ schema: string; tabela: string; coluna: string; legivel: boolean }>(
      `SELECT c.table_schema AS schema, c.table_name AS tabela, c.column_name AS coluna,
              has_column_privilege('dspd_api', format('%I.%I', c.table_schema, c.table_name), c.column_name, 'SELECT') AS legivel
         FROM information_schema.columns c
        WHERE c.table_schema = ANY($1::text[]) ORDER BY c.table_schema, c.table_name, c.ordinal_position`,
      [[`${prefixo}dspd_bm`, `${prefixo}dspd_ac`]]);
    colunas = r.rows;
  });
  afterAll(async () => { await Promise.all([dono.end(), api.end()]); });

  it('o catálogo lido não está vazio e a API lê pelo menos uma tabela (o teste não passa por vazio)', () => {
    expect(colunas.length).toBeGreaterThan(0);
    expect(colunas.some((c) => c.legivel)).toBe(true);
  });

  it('nenhuma coluna legível pela API está em COLUNAS_PESSOA ou COLUNAS_FORA_DA_API', () => {
    const proibidas = new Set([...COLUNAS_PESSOA, ...COLUNAS_FORA_DA_API]);
    expect(colunas.filter((c) => c.legivel && proibidas.has(id(c))).map((c) => id(c))).toEqual([]);
  });

  it('as colunas de COLUNAS_PESSOA e COLUNAS_FORA_DA_API existem de fato (lista desatualizada não passa em silêncio)', () => {
    const existentes = new Set(colunas.map((c) => id(c)));
    expect([...COLUNAS_PESSOA, ...COLUNAS_FORA_DA_API].filter((x) => !existentes.has(x) && !AINDA_SEM_TABELA.has(x))).toEqual([]);
  });

  it('nenhuma tabela de TABELAS_FORA_DA_API tem coluna legível pela API', () => {
    const fora = new Set(TABELAS_FORA_DA_API);
    expect(colunas.filter((c) => c.legivel && fora.has(id({ schema: c.schema, tabela: c.tabela }))).map((c) => id(c))).toEqual([]);
  });

  it('tabela com coluna de pessoa só é legível pela API nas tabelas de leitura parcial permitidas; as demais ficam inteiras fora', () => {
    const comPessoa = new Set(COLUNAS_PESSOA.map((x) => x.split('.').slice(0, 2).join('.')));
    expect([...new Set(colunas.filter((c) => c.legivel && comPessoa.has(id({ schema: c.schema, tabela: c.tabela })) && !LEITURA_PARCIAL_PERMITIDA.has(id({ schema: c.schema, tabela: c.tabela }))).map((c) => id({ schema: c.schema, tabela: c.tabela })))]).toEqual([]);
  });

  it('nenhuma coluna com nome de pessoa é legível pela API, salvo exceção justificada (EXCECOES_PESSOA)', () => {
    expect(colunas.filter((c) => c.legivel && colunaDePessoa(c.coluna) && !(id(c) in EXCECOES_PESSOA)).map((c) => id(c))).toEqual([]);
  });

  it('o privilégio efetivo confere com a leitura real: coluna ilegível dá 42501 e legível não dá (cada tabela com GRANT parcial)', async () => {
    const porTabela = new Map<string, Coluna[]>();
    for (const c of colunas) porTabela.set(`${c.schema}.${c.tabela}`, [...(porTabela.get(`${c.schema}.${c.tabela}`) ?? []), c]);
    for (const [tabela, cols] of porTabela) {
      const bloqueadas = cols.filter((c) => !c.legivel);
      if (bloqueadas.length === 0 || bloqueadas.length === cols.length) continue; // sem GRANT algum ou integral: coberto pelas provas de tabela
      for (const c of bloqueadas) {
        const codigo = await api.query(`SELECT ${c.coluna} FROM ${tabela} LIMIT 0`).then(() => 'permitido', (e: { code?: string }) => e.code);
        expect(codigo, `${id(c)} bloqueada deve dar 42501`).toBe('42501');
      }
      const liberadas = cols.filter((c) => c.legivel).map((c) => c.coluna).join(', ');
      await expect(api.query(`SELECT ${liberadas} FROM ${tabela} LIMIT 0`), `${tabela}: colunas liberadas`).resolves.toBeDefined();
    }
  });
});
