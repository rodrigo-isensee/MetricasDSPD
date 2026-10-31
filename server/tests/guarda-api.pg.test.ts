import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { poolDe, prefixo, url } from './pg/ctx.js';

const d = describe.skipIf(!url);

type Classe = 'na API' | 'fora da API' | 'por coluna';

/**
 * Classificação escrita à mão de TODA tabela agg_ e ref_ (K-085, B-K1 e B-K2), por `schema.tabela` sem prefixo de teste.
 * Tabela nova obriga a decisão explícita aqui, no code review: classifique em CLASSIFICACAO_API.
 * Independente do código de `grants.ts`: não importa nada dele.
 */
const CLASSIFICACAO_API: Record<string, Classe> = {
  'dspd_bm.ref_coluna': 'na API',
  'dspd_bm.ref_dominio': 'na API',
  'dspd_bm.ref_limite_frentes': 'na API',
  'dspd_bm.ref_limite_wip_fluxo': 'na API',
  'dspd_bm.ref_quadro': 'na API',
  'dspd_bm.ref_sle': 'na API',
  // Pedido 052, F0: `ref_workflow` e `ref_tipo_card` são lidas inteiras; a tabela de times é lida por coluna (sem `registrado_por`).
  'dspd_bm.ref_workflow': 'na API',
  'dspd_bm.ref_tipo_card': 'na API',
  'dspd_bm.ref_time': 'por coluna',
  'dspd_bm.ref_time_workflow': 'por coluna',
  'dspd_ac.ref_alvo_prioridade': 'na API',
  'dspd_core.ref_calendario': 'na API',
  'dspd_core.ref_calendario_aplicacao': 'na API',
  'dspd_core.ref_calendario_turno': 'na API',
  'dspd_core.ref_feriado': 'na API',
  'dspd_core.ref_pesq_area': 'na API',
  'dspd_core.ref_pesq_pergunta': 'na API',
  'dspd_bm.ref_alocacao_acordada': 'na API',
  'dspd_bm.ref_ficha_resultado': 'na API',
  'dspd_ac.ref_dominio': 'na API',
  'dspd_ac.ref_etapa_totalizador': 'na API',
  'dspd_core.ref_versao_criterio': 'na API',
  'dspd_core.ref_versao_criterio_metrica': 'na API',
  // Fora da API (ADR 0020, B-3): só o dspd_coletor lê. Vale em qualquer um dos três schemas.
  'dspd_bm.ref_conta_automacao': 'fora da API',
  'dspd_ac.ref_conta_automacao': 'fora da API',
  'dspd_core.ref_conta_automacao': 'fora da API',
  // Pedido 052, F3 (Q-8 = B, ADR 0020 revisão 3): nome do responsável por GET /users; escrita só pelo coletor, nenhum GRANT ao dspd_api.
  'dspd_bm.dim_responsavel': 'fora da API',
  // Por coluna (ADR 0020, M-4): a API lê tem_entrega e faixa_concentracao, nunca a contagem `entregas`.
  'dspd_bm.agg_conhecimento_sistema': 'por coluna',
};

/** Colunas de agg_ que casam o regex de pessoa/vazão e são aceitas na API, uma a uma, por `schema.tabela.coluna`. */
const EXCECOES_REGEX = new Set<string>(['dspd_bm.agg_conhecimento_sistema.tem_entrega']);
const REGEX_PESSOA = /entreg|respons|autor|usuario|email|nome/i;

d('guarda da API: toda agg_/ref_ classificada e privilégio verificado no banco migrado (K-085)', () => {
  let dono: pg.Pool;
  const logico = (schema: string): string => (prefixo && schema.startsWith(prefixo) ? schema.slice(prefixo.length) : schema);
  const id = (schema: string, tabela: string): string => `${logico(schema)}.${tabela}`;
  let tabelas: { schema: string; tabela: string }[] = [];

  beforeAll(async () => {
    dono = poolDe();
    const r = await dono.query<{ table_schema: string; table_name: string }>(
      `SELECT table_schema, table_name FROM information_schema.tables
       WHERE table_schema = ANY($1) AND (table_name LIKE 'agg\\_%' OR table_name LIKE 'ref\\_%' OR table_name = 'dim_responsavel')`,
      [['dspd_bm', 'dspd_core', 'dspd_ac'].map((s) => `${prefixo}${s}`)]);
    tabelas = r.rows.map((x) => ({ schema: x.table_schema, tabela: x.table_name }));
  });
  afterAll(async () => { await dono.end(); });

  it('a varredura enxerga as tabelas (guarda contra consulta vazia)', () => {
    expect(tabelas.length).toBeGreaterThan(10);
  });

  it('toda tabela agg_ e ref_ de qualquer schema (e dim_responsavel) está classificada', () => {
    const sem = tabelas.map((t) => id(t.schema, t.tabela)).filter((n) => !(n in CLASSIFICACAO_API));
    expect(sem, `classifique em CLASSIFICACAO_API (na API, fora da API ou por coluna): ${sem.join(', ')}`).toEqual([]);
  });

  it('toda entrada "na API" existe no banco (a lista não guarda nome que já se foi)', () => {
    const existentes = new Set(tabelas.map((t) => id(t.schema, t.tabela)));
    const velhas = Object.entries(CLASSIFICACAO_API).filter(([n, c]) => c === 'na API' && !existentes.has(n)).map(([n]) => n);
    expect(velhas).toEqual([]);
  });

  it('o dspd_api não tem privilégio algum no que está fora da API', async () => {
    const fora = tabelas.filter((t) => CLASSIFICACAO_API[id(t.schema, t.tabela)] === 'fora da API');
    for (const t of fora) {
      const r = await dono.query(
        `SELECT 1 FROM information_schema.table_privileges WHERE grantee = 'dspd_api' AND table_schema = $1 AND table_name = $2
         UNION ALL SELECT 1 FROM information_schema.column_privileges WHERE grantee = 'dspd_api' AND table_schema = $1 AND table_name = $2`,
        [t.schema, t.tabela]);
      expect(r.rows, `dspd_api com privilégio em ${id(t.schema, t.tabela)}`).toEqual([]);
    }
  });

  it('a API não lê, em tabela agg_ concedida, coluna de pessoa ou vazão, salvo exceção explícita', async () => {
    const r = await dono.query<{ table_schema: string; table_name: string; column_name: string }>(
      `SELECT DISTINCT table_schema, table_name, column_name FROM information_schema.column_privileges
       WHERE grantee = 'dspd_api' AND privilege_type = 'SELECT' AND table_schema = ANY($1) AND table_name LIKE 'agg\\_%'`,
      [['dspd_bm', 'dspd_core', 'dspd_ac'].map((s) => `${prefixo}${s}`)]);
    const ofensoras = r.rows
      .map((x) => `${id(x.table_schema, x.table_name)}.${x.column_name}`)
      .filter((c) => REGEX_PESSOA.test(c.split('.')[2]!) && !EXCECOES_REGEX.has(c));
    expect(ofensoras, `colunas sensíveis legíveis pela API: ${ofensoras.join(', ')}`).toEqual([]);
  });
});
