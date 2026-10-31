import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { calcularMetrica } from '@metricas-dspd/metricas';
import { carregar, esquemaCoreDe } from '@metricas-dspd/pesquisa/carga';
import { criarFontePesquisaReal } from '../src/modulos/metricas/index.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { criarPool, urlDoPapel } from '../src/plataforma/db/pool.js';
import { poolDe, url } from './pg/ctx.js';

const d = describe.skipIf(!url);
const CAB = 'trimestre,area,pergunta,f1,f2,f3,f4,f5,convidados';
const T = '2026-T3';
const csv = (v = 1): string => [CAB,
  `${T},comercial,p1,0,${v},2,3,4,12`, `${T},comercial,p2,1,${v - 1},2,3,4,12`,
  `${T},financeiro,p1,0,0,1,2,3,7`, `${T},financeiro,p2,0,1,1,1,3,7`].join('\n');

/** Pesquisa (PV1) contra PostgreSQL: banco, papéis, append-only e a carga de ponta a ponta, num conjunto próprio de schemas. */
d('pesquisa de percepção (PV1): tabelas, papéis e carga', () => {
  const prefixo = prefixoDeTeste();
  const E = montarEsquemas(prefixo);
  const s = esquemaCoreDe(prefixo);
  let dono: pg.Pool, carga: pg.Pool, api: pg.Pool, coletor: pg.Pool;
  let versao = '';
  const q = (p: pg.Pool, t: string, v: unknown[] = []) => p.query(t, v);
  const doPapel = (papel: string): pg.Pool => criarPool(urlDoPapel(url!, papel, papel === 'dspd_pesquisa' ? (process.env.DSPD_PWD_PESQUISA ?? 'pesquisa_dev') : papel === 'dspd_api' ? (process.env.DSPD_PWD_API ?? 'api_dev') : (process.env.DSPD_PWD_COLETOR ?? 'coletor_dev')), { max: 2 });

  beforeAll(async () => {
    await migrar(url!, { prefixo });
    dono = poolDe(); carga = doPapel('dspd_pesquisa'); api = doPapel('dspd_api'); coletor = doPapel('dspd_coletor');
    const v = await q(dono, `INSERT INTO ${s}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
      VALUES ('2026-01-01', 'pesquisa', 'Questionário v1', 'início', 'teste', now()) RETURNING versao_id`);
    versao = String((v.rows[0] as { versao_id: string }).versao_id);
    await q(dono, `INSERT INTO ${s}.ref_versao_criterio_metrica (versao_id, metrica_id) VALUES ($1, 'PV1')`, [versao]);
    for (const [c, o] of [['p1', 1], ['p2', 2]] as const) await q(dono, `INSERT INTO ${s}.ref_pesq_pergunta (versao_id, codigo, ordem, texto, vigente_de) VALUES ($1, $2, $3, $4, '2026-01-01')`, [versao, c, o, `Pergunta ${o}`]);
    for (const [c, r] of [['comercial', 'Comercial'], ['financeiro', 'Financeiro']] as const) await q(dono, `INSERT INTO ${s}.ref_pesq_area (codigo, rotulo, vigente_de) VALUES ($1, $2, '2026-01-01')`, [c, r]);
  });
  afterAll(async () => {
    await Promise.all([carga, api, coletor].map((p) => p.end()));
    for (const e of [E.bm, E.ac, E.core]) await q(dono, `DROP SCHEMA IF EXISTS ${e} CASCADE`);
    await dono.end();
  });
  const opcoes = (extra = {}) => ({ trimestre: T, csv: csv(), confirmar: true, esquemaCore: s, ...extra });
  const contar = async (t: string): Promise<number> => Number(((await q(dono, `SELECT count(*) AS n FROM ${s}.${t}`)).rows[0] as { n: string }).n);

  it('carga ponta a ponta com dspd_pesquisa: grava, é idempotente e não duplica', async () => {
    expect(await carregar(carga, opcoes({ confirmar: false, oQueMudou: 'Texto.' }))).toMatchObject({ status: 'simulada' });
    expect(await contar('pesq_carga')).toBe(0);
    const r = await carregar(carga, opcoes({ oQueMudou: 'Passamos a avisar o andamento.' }));
    expect(r).toMatchObject({ status: 'carregada', substitui: null, resumo: { linhas: 4, areas: 2, versaoId: versao } });
    expect([await contar('pesq_carga'), await contar('pesq_resultado'), await contar('pesq_participacao')]).toEqual([1, 20, 2]);
    expect(await carregar(carga, opcoes())).toMatchObject({ status: 'ja-carregada' });
    expect(await contar('pesq_carga')).toBe(1);
    const p = (await q(dono, `SELECT convidados, respondentes FROM ${s}.pesq_participacao ORDER BY area_codigo`)).rows;
    expect(p).toEqual([{ convidados: 12, respondentes: 10 }, { convidados: 7, respondentes: 6 }]);
  });

  it('trimestre já carregado exige --substituir; o reenvio cria carga nova e a anterior fica guardada', async () => {
    expect(await carregar(carga, opcoes({ csv: csv(2) }))).toMatchObject({ status: 'ja-existe' });
    expect(await contar('pesq_carga')).toBe(1);
    const r = await carregar(carga, opcoes({ csv: csv(2), substituir: T }));
    expect(r).toMatchObject({ status: 'carregada', substitui: expect.any(String) });
    expect(await contar('pesq_carga')).toBe(2);
    expect(await contar('pesq_resultado')).toBe(40);
    const v = (await q(dono, `SELECT carga_id FROM ${s}.vw_pesq_vigente`)).rows as { carga_id: string }[];
    expect(v).toHaveLength(1);
    // uma carga só é substituída uma vez (cadeia linear)
    const ids = (await q(dono, `SELECT carga_id FROM ${s}.pesq_carga ORDER BY carga_id`)).rows as { carga_id: string }[];
    await expect(q(carga, `INSERT INTO ${s}.pesq_carga (trimestre, versao_id, arquivo_sha256, linhas, substitui_carga_id) VALUES ($1, $2, $3, 1, $4)`, [T, versao, 'b'.repeat(64), ids[0]!.carga_id])).rejects.toMatchObject({ code: '23505' });
  });

  it('arquivo inválido não grava nada (coluna extra, área fora da lista, soma divergente)', async () => {
    const antes = await contar('pesq_carga');
    for (const arq of [csv().replace(CAB, `${CAB},comentario`), csv().replace(/financeiro/g, 'rh'), csv().replace('1,2,3,4,12', '1,2,3,5,12')]) {
      expect((await carregar(carga, opcoes({ trimestre: T, csv: arq, substituir: T }))).status).toBe('recusada');
    }
    expect(await contar('pesq_carga')).toBe(antes);
  });

  it('append-only: UPDATE, DELETE e TRUNCATE falham (55000) até para o dono (TRUNCATE de tabela referenciada falha antes, por FK); dspd_pesquisa nem tem o privilégio (42501)', async () => {
    for (const [t, col] of [['pesq_carga', 'linhas'], ['pesq_resultado', 'contagem'], ['pesq_participacao', 'convidados']] as const) {
      for (const sql of [`UPDATE ${s}.${t} SET ${col} = ${col}`, `DELETE FROM ${s}.${t}`, `TRUNCATE ${s}.${t}`])
        // TRUNCATE de tabela referenciada por FK falha antes do gatilho (0A000); em qualquer caso nada é apagado.
        await expect(q(dono, sql), `${t}: ${sql}`).rejects.toMatchObject({ code: expect.stringMatching(/^(55000|0A000)$/) });
      await expect(q(carga, `UPDATE ${s}.${t} SET ${col} = ${col}`)).rejects.toMatchObject({ code: '42501' });
      await expect(q(carga, `DELETE FROM ${s}.${t}`)).rejects.toMatchObject({ code: '42501' });
    }
  });

  it('papéis: dspd_pesquisa lê a referência mas não escreve nela nem lê BusinessMap/Acelerato; dspd_api só lê; coletor não lê pesq_*', async () => {
    expect(((await q(carga, `SELECT codigo FROM ${s}.ref_pesq_area`)).rows)).toHaveLength(2);
    await expect(q(carga, `INSERT INTO ${s}.ref_pesq_area (codigo, rotulo, vigente_de) VALUES ('x', 'X', '2026-01-01')`)).rejects.toMatchObject({ code: '42501' });
    await expect(q(carga, `UPDATE ${s}.ref_pesq_area SET rotulo = 'Y'`)).rejects.toMatchObject({ code: '42501' });
    await expect(q(carga, `SELECT 1 FROM ${E.bm}.dim_card`)).rejects.toMatchObject({ code: '42501' });
    await expect(q(carga, `SELECT 1 FROM ${E.ac}.dim_chamado`)).rejects.toMatchObject({ code: '42501' });
    await expect(q(carga, `SELECT 1 FROM ${s}.outbox`)).rejects.toMatchObject({ code: '42501' });
    expect(((await q(api, `SELECT carga_id FROM ${s}.pesq_carga`)).rows).length).toBeGreaterThan(0);
    expect(((await q(api, `SELECT carga_id FROM ${s}.vw_pesq_vigente`)).rows)).toHaveLength(1);
    await expect(q(api, `INSERT INTO ${s}.pesq_resultado (carga_id, area_codigo, pergunta_codigo, faixa, contagem) VALUES (1, 'comercial', 'p1', 1, 1)`)).rejects.toMatchObject({ code: '42501' });
    await expect(q(coletor, `SELECT 1 FROM ${s}.pesq_carga`)).rejects.toMatchObject({ code: '42501' });
  });

  it('domínio no banco: área fora da lista, pergunta fora do questionário, faixa, contagem, respondentes, trimestre e texto do o-que-mudou', async () => {
    const c = (await q(dono, `SELECT max(carga_id) AS id FROM ${s}.pesq_carga`)).rows[0] as { id: string };
    const res = (area: string, perg: string, faixa: number, cont: number) =>
      q(carga, `INSERT INTO ${s}.pesq_resultado (carga_id, area_codigo, pergunta_codigo, faixa, contagem) VALUES ($1, $2, $3, $4, $5)`, [c.id, area, perg, faixa, cont]);
    await expect(res('rh', 'p1', 1, 1)).rejects.toMatchObject({ code: '23514' });
    await expect(res('comercial', 'p9', 1, 1)).rejects.toMatchObject({ code: '23514' });
    await expect(res('comercial', 'p1', 6, 1)).rejects.toMatchObject({ code: '23514' });
    await expect(res('comercial', 'p1', 0, 1)).rejects.toMatchObject({ code: '23514' });
    await expect(res('comercial', 'p1', 1, -1)).rejects.toMatchObject({ code: '23514' });
    await expect(q(carga, `INSERT INTO ${s}.pesq_participacao (carga_id, area_codigo, convidados, respondentes) VALUES ($1, 'rh', 5, 1)`, [c.id])).rejects.toMatchObject({ code: '23514' });
    await expect(q(carga, `INSERT INTO ${s}.pesq_participacao (carga_id, area_codigo, convidados, respondentes) VALUES ($1, 'comercial', 2, 3)`, [c.id])).rejects.toMatchObject({ code: '23514' });
    const nova = (tri: string, texto: string | null) => q(carga, `INSERT INTO ${s}.pesq_carga (trimestre, versao_id, arquivo_sha256, linhas, o_que_mudou) VALUES ($1, $2, $3, 1, $4)`, [tri, versao, 'c'.repeat(64), texto]);
    await expect(nova('2026-T5', null)).rejects.toMatchObject({ code: '23514' });
    await expect(nova('2026-T4', 'fale com ana@x.com')).rejects.toMatchObject({ code: '23514' });
    await expect(nova('2026-T4', 'veja https://x.com')).rejects.toMatchObject({ code: '23514' });
    await expect(nova('2026-T4', '   ')).rejects.toMatchObject({ code: '23514' });
    await expect(q(dono, `INSERT INTO ${s}.ref_pesq_area (codigo, rotulo, vigente_de) VALUES ('Joao Silva', 'X', '2026-01-01')`)).rejects.toMatchObject({ code: '23514' });
  });

  it('leitura real (dspd_api): vigente = a carga mais recente; a substituída fica na base e fora do resultado; coluna de pessoa não existe', async () => {
    const fonte = criarFontePesquisaReal(api, E);
    const { base, versao: v } = await fonte.ler();
    expect(base.cargas).toHaveLength(2);
    expect(v).toMatch(/^[0-9a-f]{16}$/);
    expect(JSON.stringify(base)).not.toMatch(/email|comentario|respondente_id/i);
    const ctx = { pesq: (await import('@metricas-dspd/metricas')).pesquisa.criarContextoPesquisa(base, '2099-01-01') };
    const r = (calcularMetrica as (...a: unknown[]) => { status: string; trimestre: string; participacao: { respondentes: number; convidados: number } })('PV1', {}, ctx);
    expect(r).toMatchObject({ status: 'ok', trimestre: T, participacao: { respondentes: 17, convidados: 19 } });
    const colunas = (await q(dono, `SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND (table_name LIKE 'pesq\\_%' OR table_name LIKE 'ref\\_pesq\\_%')`, [E.core])).rows as { column_name: string }[];
    expect(colunas.map((x) => x.column_name).filter((n) => /pessoa|usuario|email|login|responsav|comentario|autor|nome/i.test(n))).toEqual([]);
  });

  it('migração 0013: down remove só o da pesquisa (e as versões de critério da pesquisa) e up recria; ref_versao_criterio volta a recusar o domínio', async () => {
    const p = prefixoDeTeste();
    const e = montarEsquemas(p);
    try {
      await migrar(url!, { prefixo: p });
      const existe = async (t: string): Promise<boolean> => (await q(dono, `SELECT to_regclass($1) IS NOT NULL AS ok`, [`${e.core}.${t}`])).rows[0]!.ok as boolean;
      expect(await existe('pesq_carga')).toBe(true);
      await q(dono, `INSERT INTO ${e.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em) VALUES ('2026-01-01', 'pesquisa', 'v', 'm', 'r', now())`);
      const b = await migrar(url!, { prefixo: p, direcao: 'down', quantas: 5 }); // 0014 a 0017 vêm depois da 0013
      expect(b.migracoes).toEqual(['0017_ac_projecao_f2', '0016_ac_stg_chamado_recorte', '0015_bm_remove_usuario_transicao', '0014_ac_justificativa_informada', '0013_core_pesquisa']);
      for (const t of ['pesq_carga', 'pesq_resultado', 'pesq_participacao', 'ref_pesq_area', 'ref_pesq_pergunta', 'vw_pesq_vigente']) expect(await existe(t), t).toBe(false);
      expect(await existe('ref_versao_criterio')).toBe(true);
      expect((await q(dono, `SELECT count(*) AS n FROM ${e.core}.ref_versao_criterio WHERE dominio = 'pesquisa'`)).rows[0]).toEqual({ n: '0' });
      await expect(q(dono, `INSERT INTO ${e.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em) VALUES ('2026-01-01', 'pesquisa', 'v', 'm', 'r', now())`)).rejects.toMatchObject({ code: '23514' });
      await migrar(url!, { prefixo: p });
      expect(await existe('pesq_carga')).toBe(true);
    } finally {
      for (const x of [e.bm, e.ac, e.core]) await q(dono, `DROP SCHEMA IF EXISTS ${x} CASCADE`);
    }
  });
});
