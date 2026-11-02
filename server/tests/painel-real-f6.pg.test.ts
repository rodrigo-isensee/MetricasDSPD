import { gerarBaseMock } from '@metricas-dspd/mock';
import type pg from 'pg';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { describe } from 'vitest';
import { buildApp } from '../src/app.js';
import { resolverTipoDasTransicoes } from '../src/modulos/businessmap/index.js';
import { lerCards, lerTransicoes, lerVersoesColuna } from '../src/modulos/metricas/repositorio.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { semear } from '../src/plataforma/db/seed.js';
import { poolDe, url } from './pg/ctx.js';

// F6 do plano 052 (E2.69) contra PostgreSQL, com o papel `dspd_api` (grants por coluna): a base "real" daqui é o seed mínimo em schemas próprios
// (a estrutura é a mesma da base alimentada pela coleta) e a base do seed é outro conjunto de schemas. Nenhuma coleta nem projeção real.
const d = describe.skipIf(!url);
const AGORA = new Date('2026-10-10T15:00:00Z');
const O1 = '/api/v1/metricas/O1';

d('F6 do plano 052: duas bases e tipo da coluna na leitura (PostgreSQL)', () => {
  const base = gerarBaseMock({ escala: 0.15 });
  const PR = prefixoDeTeste();
  const PS = prefixoDeTeste();
  const R = montarEsquemas(PR);
  const S = montarEsquemas(PS);
  let mig: pg.Pool;
  let api: pg.Pool;
  const app = () => buildApp({ db: api, S: R, SMock: S, agora: () => AGORA, nivelLog: 'silent' });
  const get = async <T>(a: Awaited<ReturnType<typeof app>>, url2: string): Promise<T> => (await a.inject(url2)).json() as T;

  beforeAll(async () => {
    mig = poolDe();
    for (const p of [PR, PS]) await migrar(url!, { prefixo: p });
    await semear(mig, base, R);
    await semear(mig, base, S);
    api = poolDe('dspd_api');
  }, 180_000);
  afterAll(async () => {
    for (const e of [R, S]) for (const s of [e.bm, e.ac, e.core]) await mig.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
    await api.end();
    await mig.end();
  });

  it('(a) card de trabalho de produto aparece no O7 e no filtro por tipo; defeito em produção conta no O13', async () => {
    const antes = await app();
    const o13Antes = (await get<{ base: { n: number } }>(antes, '/api/v1/metricas/O13')).base.n;
    await mig.query(`UPDATE ${R.bm}.dim_card SET tipo = 'Trabalho de produto' WHERE card_id IN (
      SELECT card_id FROM ${R.bm}.dim_card WHERE granularidade = 'story' AND concluido_em >= '2026-09-01' AND tipo = 'Melhoria' ORDER BY card_id LIMIT 5)`);
    await mig.query(`UPDATE ${R.bm}.dim_card SET tipo = 'Defeito em produção' WHERE card_id IN (
      SELECT card_id FROM ${R.bm}.dim_card WHERE granularidade = 'story' AND concluido_em >= '2026-09-01' AND tipo = 'Requisição' ORDER BY card_id LIMIT 3)`);
    const a = await app();
    const o7 = await get<{ porTipo: { tipo: string; entrou: number; saiu: number }[] }>(a, '/api/v1/metricas/O7');
    expect(o7.porTipo.find((t) => t.tipo === 'Trabalho de produto')?.saiu).toBeGreaterThan(0);
    const o13 = (await get<{ base: { n: number } }>(a, '/api/v1/metricas/O13')).base.n;
    expect(o13).toBeGreaterThan(o13Antes);
    const filtrado = await get<{ base: { n: number } }>(a, '/api/v1/metricas/O3?tipo=trabalho-produto');
    expect(filtrado.base.n).toBeGreaterThan(0);
    const filtros = await get<{ tipos: { id: string }[] }>(a, '/api/v1/filtros/businessmap');
    expect(filtros.tipos.map((t) => t.id)).toContain('trabalho-produto');
  }, 60_000);

  it('(b) correção da coluna vale para todo o período na leitura e o fato de transição não é reescrito', async () => {
    const col = (await mig.query<{ quadro_id: string; coluna_id: string; n: string }>(
      `SELECT c.quadro_id, c.coluna_id, count(*) AS n FROM ${R.bm}.dim_card k
         JOIN ${R.bm}.ref_coluna c ON c.quadro_id = k.quadro_id AND c.coluna_id = k.coluna_atual_id AND c.vigente_ate IS NULL
        WHERE k.concluido_em IS NULL AND k.arquivado_em IS NULL AND k.excluido_em IS NULL AND k.iniciado_em IS NOT NULL
          AND c.tipo_coluna = 'execucao' AND c.papel = 'trabalho' AND k.granularidade = 'story'
        GROUP BY 1, 2 ORDER BY 3 DESC, 1, 2 LIMIT 1`)).rows[0]!;
    const fatos = async (): Promise<string> => JSON.stringify((await mig.query(
      `SELECT count(*) AS n, count(*) FILTER (WHERE tipo_coluna = 'execucao') AS exec, count(*) FILTER (WHERE tipo_coluna = 'fila') AS fila FROM ${R.bm}.fato_transicao`)).rows);
    const fatoAntes = await fatos();
    const antes = await app();
    const o1 = await get<{ porTipoColuna: { tipoColuna: string; itens: number }[] }>(antes, O1);
    const itens = (r: typeof o1, t: string): number => r.porTipoColuna.find((x) => x.tipoColuna === t)!.itens;
    await mig.query(`UPDATE ${R.bm}.ref_coluna SET vigente_ate = '2026-10-01' WHERE quadro_id = $1 AND coluna_id = $2 AND vigente_ate IS NULL`, [col.quadro_id, col.coluna_id]);
    await mig.query(
      `INSERT INTO ${R.bm}.ref_coluna (quadro_id, coluna_id, vigente_de, nome, tipo_coluna, papel, ordem, limite_wip, motivo)
       SELECT quadro_id, coluna_id, '2026-10-01', nome, 'fila', papel, ordem, limite_wip, 'correcao' FROM ${R.bm}.ref_coluna
        WHERE quadro_id = $1 AND coluna_id = $2 AND vigente_ate = '2026-10-01'`, [col.quadro_id, col.coluna_id]);
    const depois = await get<typeof o1>(await app(), O1);
    expect(itens(depois, 'fila')).toBe(itens(o1, 'fila') + Number(col.n));
    expect(itens(depois, 'execucao')).toBe(itens(o1, 'execucao') - Number(col.n));
    expect(await fatos()).toBe(fatoAntes);
  }, 60_000);

  it('(c) versão de processo: a transição anterior à data mantém o tipo antigo e a posterior usa o novo', async () => {
    const col = (await mig.query<{ quadro_id: string; coluna_id: string }>(
      `SELECT quadro_id, coluna_id FROM ${R.bm}.ref_coluna WHERE vigente_ate IS NULL AND tipo_coluna = 'execucao' AND papel = 'homologacao' ORDER BY quadro_id, coluna_id LIMIT 1`)).rows[0]!;
    await mig.query(`UPDATE ${R.bm}.ref_coluna SET vigente_ate = '2026-09-15' WHERE quadro_id = $1 AND coluna_id = $2 AND vigente_ate IS NULL`, [col.quadro_id, col.coluna_id]);
    await mig.query(
      `INSERT INTO ${R.bm}.ref_coluna (quadro_id, coluna_id, vigente_de, nome, tipo_coluna, papel, ordem, limite_wip, motivo)
       SELECT quadro_id, coluna_id, '2026-09-15', nome, 'fila', papel, ordem, limite_wip, 'processo' FROM ${R.bm}.ref_coluna
        WHERE quadro_id = $1 AND coluna_id = $2 AND vigente_ate = '2026-09-15'`, [col.quadro_id, col.coluna_id]);
    const cards = await lerCards(api, R);
    const quadros = new Map(cards.map((c) => [c.card_id, c.quadro_id ?? '']));
    const todas = (await lerTransicoes(api, R, { tipoResolvidoNaLeitura: true })).filter((t) => t.quadro_id === col.quadro_id && t.coluna_destino_id === col.coluna_id);
    const r = resolverTipoDasTransicoes(todas, await lerVersoesColuna(api, R), quadros);
    const antes = r.filter((t) => t.ocorrido_em < Date.parse('2026-09-15T03:00:00Z'));
    const depois = r.filter((t) => t.ocorrido_em >= Date.parse('2026-09-15T03:00:00Z'));
    expect(antes.length + depois.length).toBeGreaterThan(0);
    expect(antes.every((t) => t.tipo_coluna === 'execucao')).toBe(true);
    expect(depois.every((t) => t.tipo_coluna === 'fila')).toBe(true);
  }, 60_000);

  it('(d) FL2, FL3, S1 e Visão geral saem idênticos ao mock: mexer na base real não muda a resposta, que é a da base do seed', async () => {
    const unica = await buildApp({ db: api, S, agora: () => AGORA, nivelLog: 'silent' });
    const duas = await app();
    for (const id of ['T1', 'T7', 'E1', 'E2', 'S1', 'VISAO_GERAL', 'O8', 'O19']) {
      const a = await unica.inject(`/api/v1/metricas/${id}`);
      const b = await duas.inject(`/api/v1/metricas/${id}`);
      expect(b.statusCode, id).toBe(200);
      expect(b.body, id).toBe(a.body);
    }
  }, 60_000);

  it('(e) Sustentação (E2.115): S3 lê a base real do Acelerato; S1, S5, S9, S12 e EI_SUST seguem a do seed; mexer na real muda só as reais', async () => {
    const unica = await buildApp({ db: api, S, agora: () => AGORA, nivelLog: 'silent' });
    await mig.query(`UPDATE ${R.ac}.dim_chamado SET categoria_sistema = 'Sistema só da base real'`);
    const duas = await app();
    for (const id of ['S3']) {
      expect((await duas.inject(`/api/v1/metricas/${id}`)).statusCode, id).toBe(200);
    }
    for (const id of ['S1', 'S5', 'S9', 'S12', 'EI_SUST']) {
      const a = await unica.inject(`/api/v1/metricas/${id}`);
      const b = await duas.inject(`/api/v1/metricas/${id}`);
      expect(b.statusCode, id).toBe(200);
      expect(b.body, id).toBe(a.body);
    }
  }, 60_000);

  it('o papel dspd_api lê os times ativos e as colunas com o time sem ver coluna de pessoa', async () => {
    const f = await get<{ equipes: { nome: string }[] }>(await app(), '/api/v1/filtros/businessmap');
    expect(f.equipes.length).toBeGreaterThan(0);
    const { rows } = await api.query(`SELECT quadro_id FROM ${R.bm}.ref_time_workflow LIMIT 1`);
    expect(Array.isArray(rows)).toBe(true);
    await expect(api.query(`SELECT registrado_por FROM ${R.bm}.ref_time LIMIT 1`)).rejects.toThrow();
  });
});
