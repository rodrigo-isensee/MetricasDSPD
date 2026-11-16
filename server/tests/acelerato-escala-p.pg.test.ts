import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { coletarAcelerato, projetarAcelerato, reprojetarEscalaAcelerato } from '../src/modulos/acelerato/index.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { CONFIG, LISTAS_BANCO, TLS, criarMysqlFalso, linha } from './acelerato-duble.js';
import { criarPool, urlDoPapel } from '../src/plataforma/db/pool.js';
import { novaColeta, poolDe, url } from './pg/ctx.js';
import { quantasDesde } from './pg/migracoes-por-numero.js';

const d = describe.skipIf(!url);

/** QA do S1 escala P (pedido 105, E7.238): migração 0040 do zero e sobre base com dados; reprojeção só onde nula e idempotente. */
d('QA 105 S1 escala P (pg)', () => {
  const P = prefixoDeTeste(), E = montarEsquemas(P);
  const relogio = new Date('2026-11-16T12:00:00Z');
  let dono: pg.Pool, coleta: number;
  const col = async (): Promise<{ data_type: string; is_nullable: string }[]> => (await dono.query(
    `SELECT data_type, is_nullable FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'dim_chamado' AND column_name = 'escala_p'`, [E.ac])).rows;
  const colVersao = async (): Promise<number> => (await dono.query(
    `SELECT 1 FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'dim_chamado_versao' AND column_name = 'escala_p'`, [E.ac])).rowCount ?? 0;
  const dim = async (id: string, prioridade: string | null, escala?: boolean | null): Promise<void> => {
    const c = coleta;
    if (escala === undefined) await dono.query(`INSERT INTO ${E.ac}.dim_chamado (chamado_id, prioridade, coletado_em, atualizado_por_coleta_id) VALUES ($1, $2, now(), $3)`, [id, prioridade, c]);
    else await dono.query(`INSERT INTO ${E.ac}.dim_chamado (chamado_id, prioridade, escala_p, coletado_em, atualizado_por_coleta_id) VALUES ($1, $2, $3, now(), $4)`, [id, prioridade, escala, c]);
  };
  const stg = async (id: string, prioridade: string | null, anterior: string | null = null): Promise<void> => {
    await dono.query(
      `INSERT INTO ${E.ac}.stg_chamado (id_origem, anterior_sk, payload_sha256, payload, ausente_na_extracao, fora_do_recorte, coletado_em, coleta_id)
       VALUES ($1, $2, sha256($3::bytea), $4::jsonb, false, false, now(), $5)`, [id, anterior, Buffer.from(`${id}${prioridade}${anterior}`), JSON.stringify({ prioridade }), coleta]);
  };
  const foto = async (t: string): Promise<string> => { const r = await dono.query<{ h: string }>(`SELECT coalesce(md5(string_agg(x::text, '|' ORDER BY x::text)), '') AS h FROM ${E.ac}.${t} x`); return r.rows[0]!.h; };
  const escalas = async (): Promise<Record<string, boolean | null>> => Object.fromEntries((await dono.query<{ chamado_id: string; escala_p: boolean | null }>(`SELECT chamado_id, escala_p FROM ${E.ac}.dim_chamado ORDER BY chamado_id`)).rows.map((r) => [r.chamado_id, r.escala_p]));

  beforeAll(async () => { await migrar(url!, { prefixo: P }); dono = poolDe(); coleta = await novaColeta(dono, E.ac); }, 120_000);
  afterAll(async () => { for (const e of [E.bm, E.ac, E.core]) await dono.query(`DROP SCHEMA IF EXISTS ${e} CASCADE`); await dono.end(); });

  it('do zero: escala_p boolean NULL só em dim_chamado, nunca em dim_chamado_versao; dspd_api lê a coluna', async () => {
    expect(await col()).toEqual([{ data_type: 'boolean', is_nullable: 'YES' }]);
    expect(await colVersao()).toBe(0);
    const api = poolDe('dspd_api');
    await dim('g1', 'P1 - Crítica');
    expect((await api.query(`SELECT escala_p FROM ${E.ac}.dim_chamado WHERE chamado_id = 'g1'`)).rows).toEqual([{ escala_p: null }]);
    await api.end();
    await dono.query(`DELETE FROM ${E.ac}.dim_chamado WHERE chamado_id = 'g1'`);
  });

  it('sobre base com dados: down até a 0039 e up de novo; as linhas ficam como estavam e a coluna nasce nula; up repetido é inócuo', async () => {
    await migrar(url!, { prefixo: P, direcao: 'down', quantas: quantasDesde(40) });
    expect(await col()).toEqual([]);
    for (const [i, p] of ['P2 - Alta', 'DSPD - INCIDENTE - ALTA', null].entries()) {
      await dono.query(`INSERT INTO ${E.ac}.dim_chamado (chamado_id, prioridade, coletado_em, atualizado_por_coleta_id) VALUES ($1, $2, now(), $3)`, [`m${i}`, p, coleta]);
    }
    const antes = (await dono.query(`SELECT to_jsonb(d) - 'escala_p' AS l FROM ${E.ac}.dim_chamado d ORDER BY chamado_id`)).rows;
    await migrar(url!, { prefixo: P });
    await migrar(url!, { prefixo: P });
    expect(await col()).toEqual([{ data_type: 'boolean', is_nullable: 'YES' }]);
    const depois = (await dono.query(`SELECT to_jsonb(d) - 'escala_p' AS l FROM ${E.ac}.dim_chamado d ORDER BY chamado_id`)).rows;
    expect(depois).toEqual(antes);
    expect(await escalas()).toEqual({ m0: null, m1: null, m2: null });
    await dono.query(`DELETE FROM ${E.ac}.dim_chamado`);
  });

  it('projetor grava escala_p na dimensão: P= true, família mapeada = false, prioridade vazia/fora do mapa = nulo', async () => {
    await dono.query(`DELETE FROM ${E.ac}.dim_chamado`);
    const coletor = criarPool(urlDoPapel(url!, 'dspd_coletor', process.env.DSPD_PWD_COLETOR ?? 'coletor_dev'), { max: 2 });
    for (const [i, l] of [...LISTAS_BANCO, { campo: 'natureza_prefixo', codigo: 'SSSC - Incidente', rotulo: 'incidente' }, ...['P2 - Alta', 'SSSC - INCIDENTE - BAIXA', 'DHO - X'].map((c) => ({ campo: 'prioridade', codigo: c, rotulo: c }))].entries()) {
      await dono.query(`INSERT INTO ${E.ac}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ($1, $2, '2026-01-01', $3, $4) ON CONFLICT DO NOTHING`, [l.campo, l.codigo, l.rotulo, i]);
    }
    const tabela = [[701, 'P2 - Alta'], [702, 'SSSC - INCIDENTE - BAIXA'], [703, 'DHO - X'], [704, null]].map(([k, p]) => linha({ ticket_key: k as number, prioridade: p as string | null }));
    await coletarAcelerato({ pool: coletor, config: CONFIG, tls: TLS, S: E, agora: () => relogio, log: { info: () => undefined, error: () => undefined }, cliente: { conectar: criarMysqlFalso(tabela).conectar }, dormir: () => Promise.resolve() }, 'releitura');
    await projetarAcelerato(coletor, E, () => relogio);
    const r = (await dono.query<{ chamado_id: string; prioridade: string | null; escala_p: boolean | null }>(`SELECT chamado_id, prioridade, escala_p FROM ${E.ac}.dim_chamado ORDER BY chamado_id`)).rows;
    expect(r).toEqual([{ chamado_id: '701', prioridade: 'P2', escala_p: true }, { chamado_id: '702', prioridade: 'P5', escala_p: false }, { chamado_id: '703', prioridade: null, escala_p: null }, { chamado_id: '704', prioridade: null, escala_p: null }]);
    await coletor.end();
    await dono.query(`DELETE FROM ${E.ac}.dim_chamado`);
  });

  it('reprojeção: só onde nula; última versão do staging; preenchido não muda; sem prioridade/sem staging/fora do mapa ficam nulos; só dim_chamado muda; repetir não muda nada', async () => {
    await dim('a', 'P2 - Alta'); await stg('a', 'P2 - Alta');
    await dim('b', 'P3', null); await stg('b', 'DSPD - INCIDENTE - ALTA'); await stg('b', 'SSSC - REQUISIÇÃO - MÉDIA', '2');
    await dim('c', 'P4'); await stg('c', 'SSSC - REQUISIÇÃO - MÉDIA');
    await dim('d', 'P1', true); await stg('d', 'DSPD - INCIDENTE - URGENTE'); // preenchido: não sobrescreve
    await dim('e', 'P5', false); await stg('e', 'P5 - Baixa'); // preenchido falso: não sobrescreve
    await dim('f', null); await stg('f', 'P1 - Crítica'); // sem prioridade na dimensão: fora
    await dim('g', 'P3'); // sem staging
    await dim('h', 'P3'); await stg('h', 'DHO - X'); // fora do mapa
    await dim('i', 'P3'); await stg('i', 'P3 sem hífen'); // regra textual: não casa
    const tabelas = ['stg_chamado', 'dim_chamado_versao', 'fato_etapa_chamado', 'stg_etapa'];
    const fotos = async (): Promise<string[]> => Promise.all(tabelas.map(foto));
    const f0 = await fotos();
    const r1 = await reprojetarEscalaAcelerato(dono, E, () => relogio);
    expect(await escalas()).toEqual({ a: true, b: false, c: false, d: true, e: false, f: null, g: null, h: null, i: null });
    expect(r1).toMatchObject({ lidos: 6, escalaP: 1, outrasEscalas: 2, semEscala: 3 });
    expect(await fotos()).toEqual(f0);
    const d1 = await foto('dim_chamado');
    const r2 = await reprojetarEscalaAcelerato(dono, E, () => relogio);
    expect(r2).toMatchObject({ lidos: 3, escalaP: 0, outrasEscalas: 0, semEscala: 3 });
    expect(await foto('dim_chamado')).toBe(d1);
    expect(await fotos()).toEqual(f0);
  });

  it('lotes: mais de um lote (2600 linhas) preenche tudo', async () => {
    await dono.query(`DELETE FROM ${E.ac}.dim_chamado`);
    const N = 2600;
    await dono.query(`INSERT INTO ${E.ac}.dim_chamado (chamado_id, prioridade, coletado_em, atualizado_por_coleta_id) SELECT 'z' || lpad(g::text, 5, '0'), 'P3', now(), $1 FROM generate_series(1, ${N}) g`, [coleta]);
    await dono.query(`INSERT INTO ${E.ac}.stg_chamado (id_origem, anterior_sk, payload_sha256, payload, ausente_na_extracao, fora_do_recorte, coletado_em, coleta_id)
      SELECT 'z' || lpad(g::text, 5, '0'), NULL, sha256(g::text::bytea), jsonb_build_object('prioridade', CASE WHEN g % 2 = 0 THEN 'P3 - Média' ELSE 'SSSC - INCIDENTE - NORMAL' END), false, false, now(), $1 FROM generate_series(1, ${N}) g`, [coleta]);
    const r = await reprojetarEscalaAcelerato(dono, E, () => relogio);
    expect(r).toMatchObject({ lidos: N, escalaP: N / 2, outrasEscalas: N / 2, semEscala: 0 });
    expect((await dono.query(`SELECT count(*)::int AS n FROM ${E.ac}.dim_chamado WHERE escala_p IS NULL`)).rows[0].n).toBe(0);
  });
});
