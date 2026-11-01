import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { revisionIdDaTransicao } from '../src/modulos/businessmap/allow-list.js';
import { projetarBusinessMap } from '../src/modulos/businessmap/projetor.js';
import { gravarStgCard, gravarStgRevision } from '../src/modulos/businessmap/staging.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { criarPool, urlDoPapel } from '../src/plataforma/db/pool.js';
import type { Cartao } from './businessmap-coleta-duble.js';
import { poolDe, url } from './pg/ctx.js';

// QA da F4 (pedido 052, E2.61, K-182): caixa-preta sobre o projetor contra PostgreSQL real, em schemas só deste arquivo.
// Escrito a partir do plano (F4) e das decisões H-9, H-10, H-11, H-23, U-2 e ADR 0020, sem reaproveitar o arquivo do autor.
// Cada teste diz o que precisa quebrar para ele falhar. Nenhuma chamada ao BusinessMap (só o staging e o banco).
const d = describe.skipIf(!url);
const Q = '9301';
const W = '93001';
const COL = { B: 93011, C: 93012, F: 93013, E: 93015, D: 93016, A: 93017 };
const TIPO = 93101;
const ATE = (v: unknown): string | null => (v === null ? null : (v as Date).toISOString());

d('QA F4 do plano 052: projetor contra PostgreSQL', () => {
  const prefixo = prefixoDeTeste();
  const E = montarEsquemas(prefixo);
  let dono: pg.Pool, coletor: pg.Pool, api: pg.Pool;
  let relogio = new Date('2026-11-02T12:00:00Z');
  let coletaDeTeste = 0;
  let seq = 0;

  const n = async (tabela: string, onde = 'true', params: unknown[] = []): Promise<number> =>
    Number((await dono.query<{ n: string }>(`SELECT count(*) AS n FROM ${E.bm}.${tabela} WHERE ${onde}`, params)).rows[0]!.n);
  const dim = async (id: string) => (await dono.query<Record<string, unknown>>(`SELECT * FROM ${E.bm}.dim_card WHERE card_id = $1`, [id])).rows[0]!;
  const projetar = (extra: Record<string, unknown> = {}) => {
    relogio = new Date(relogio.getTime() + 3_600_000);
    return projetarBusinessMap({ pool: coletor, S: E, agora: () => relogio, ...extra });
  };
  const card = (extra: Cartao = {}): Cartao => ({
    card_id: 900_000_000 + ++seq, title: 'Card de QA', type_id: TIPO, created_at: '2026-08-20T10:00:00Z', board_id: Number(Q), workflow_id: Number(W), column_id: COL.F, ...extra,
  });
  const tr = (coluna: number, inicio: string, fim: string | null = null): Cartao =>
    ({ board_id: Number(Q), workflow_id: Number(W), lane_id: 1, column_id: coluna, section: 3, start: inicio, end: fim });
  async function staging(c: Cartao, transicoes: Cartao[] = []): Promise<string> {
    const id = String(c.card_id);
    await gravarStgCard(coletor, { idOrigem: id, card: c, coletaId: coletaDeTeste, agora: relogio, quadroId: Q, arquivado: false, excluidoDetectado: false }, E);
    for (const x of transicoes) await gravarStgRevision(coletor, { cardId: id, revisionId: revisionIdDaTransicao(x)!, revisao: x, tipo: 'transicao', coletaId: coletaDeTeste, agora: relogio }, E);
    return id;
  }

  beforeAll(async () => {
    await migrar(url!, { prefixo });
    dono = poolDe();
    coletor = criarPool(urlDoPapel(url!, 'dspd_coletor', process.env.DSPD_PWD_COLETOR ?? 'coletor_dev'), { max: 4 });
    api = criarPool(urlDoPapel(url!, 'dspd_api', process.env.DSPD_PWD_API ?? 'api_dev'), { max: 2 });
    const versao = (await dono.query<{ versao_id: string }>(
      `INSERT INTO ${E.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
       VALUES ('2020-01-01', 'businessmap', 'qa f4', 'qa f4', 'qa-f4', now()) RETURNING versao_id`)).rows[0]!.versao_id;
    const rastro = [`'carga_inicial'`, versao, `'qa'`].join(', ');
    await dono.query(`INSERT INTO ${E.bm}.ref_time (time_id, vigente_de, nome, ativo, motivo, versao_id, registrado_por) VALUES (9301, '2020-01-01', 'Time QA', true, ${rastro})`);
    await dono.query(
      `INSERT INTO ${E.bm}.ref_time_workflow (workflow_id, vigente_de, vigente_ate, quadro_id, time_id, situacao, motivo_fora, motivo, versao_id, registrado_por)
       VALUES ('${W}', '2020-01-01', NULL, '${Q}', 9301, 'time', NULL, ${rastro})`);
    await dono.query(`INSERT INTO ${E.bm}.ref_workflow (quadro_id, workflow_id, vigente_de, nome, tipo_api, nivel) VALUES ('${Q}', '${W}', '2020-01-01', 'WF QA', 0, 'story')`);
    const coluna = (id: number, section: number, papel: string | null, tipo: string | null, ordem: number, descarte = false) => dono.query(
      `INSERT INTO ${E.bm}.ref_coluna (quadro_id, coluna_id, vigente_de, nome, tipo_coluna, papel, ordem, workflow_id, section, flow_type, eh_folha, eh_descarte)
       VALUES ($1, $2, '2020-01-01', $3, $4, $5, $6, $7, $8, $9, true, $10)`, [Q, String(id), `Coluna ${id}`, tipo, papel, ordem, W, section, tipo === 'fila' ? 2 : tipo === 'execucao' ? 1 : null, descarte]);
    await coluna(COL.B, 1, 'backlog', 'fila', 1); await coluna(COL.C, 2, 'compromisso', 'fila', 2); await coluna(COL.F, 3, 'trabalho', 'execucao', 3);
    await coluna(COL.E, 4, 'entrega', 'execucao', 5); await coluna(COL.D, 4, 'entrega', null, 6, true); await coluna(COL.A, 5, 'entrega', 'fila', 7);
    await dono.query(`INSERT INTO ${E.bm}.ref_tipo_card (tipo_id, vigente_de, nome, eh_item, categoria) VALUES ($1, '2020-01-01', 'Story', true, 'produto')`, [String(TIPO)]);
    coletaDeTeste = Number((await dono.query<{ coleta_id: string }>(
      `INSERT INTO ${E.bm}.ctl_coleta (tarefa, iniciado_em, status, versao_coletor) VALUES ('reconciliacao', now(), 'em_andamento', 'qa') RETURNING coleta_id`)).rows[0]!.coleta_id);
  });
  afterAll(async () => {
    await Promise.all([coletor.end(), api.end()]);
    for (const e of [E.bm, E.ac, E.core]) await dono.query(`DROP SCHEMA IF EXISTS ${e} CASCADE`);
    await dono.end();
  });

  it('QA-1 (datas): o mesmo instante com Z, com +00:00, com -03:00 e a forma com espaço sem fuso grava o mesmo timestamptz; falha se Z ou o fuso explícito for lido com outro fuso', async () => {
    // 10:00 UTC escrito de quatro formas; criação e primeira transição (compromisso) em cada card
    const formas: [string, string][] = [
      ['2026-08-20T10:00:00Z', '2026-09-02T10:00:00Z'],
      ['2026-08-20T10:00:00+00:00', '2026-09-02T10:00:00+00:00'],
      ['2026-08-20T07:00:00-03:00', '2026-09-02T07:00:00-03:00'],
      ['2026-08-20T10:00:00', '2026-09-02 10:00:00'],
    ];
    const ids: string[] = [];
    for (const [criado, inicio] of formas) ids.push(await staging(card({ created_at: criado }), [tr(COL.C, inicio)]));
    await projetar();
    for (const id of ids) {
      const c = await dim(id);
      expect([ATE(c.criado_em), ATE(c.comprometido_em)]).toEqual(['2026-08-20T10:00:00.000Z', '2026-09-02T10:00:00.000Z']);
    }
    const f = (await dono.query<{ ocorrido_em: Date }>(`SELECT ocorrido_em FROM ${E.bm}.fato_transicao WHERE card_id = ANY($1)`, [ids])).rows;
    expect(f).toHaveLength(4);
    expect(new Set(f.map((x) => x.ocorrido_em.toISOString()))).toEqual(new Set(['2026-09-02T10:00:00.000Z']));
  });

  it('QA-2 (ordem): transições gravadas no staging fora da ordem do tempo dão os mesmos marcos (primeira entrada pelo instante, H-9 e H-10); falha se o marco sair da ordem de gravação', async () => {
    const ordem = [tr(COL.E, '2026-09-06 10:00:00'), tr(COL.C, '2026-09-05 10:00:00'), tr(COL.C, '2026-09-02 10:00:00'), tr(COL.E, '2026-09-04 10:00:00')];
    const id = await staging(card(), ordem);
    await projetar();
    const c = await dim(id);
    expect([ATE(c.comprometido_em), ATE(c.concluido_em)]).toEqual(['2026-09-02T10:00:00.000Z', '2026-09-04T10:00:00.000Z']);
    const f = (await dono.query<{ coluna_origem_id: string | null; coluna_destino_id: string }>(
      `SELECT coluna_origem_id, coluna_destino_id FROM ${E.bm}.fato_transicao WHERE card_id = $1 ORDER BY ocorrido_em`, [id])).rows;
    expect(f.map((x) => [x.coluna_origem_id, x.coluna_destino_id])).toEqual([
      [null, String(COL.C)], [String(COL.C), String(COL.E)], [String(COL.E), String(COL.C)], [String(COL.C), String(COL.E)]]);
  });

  it('QA-3 (H-11 e H-10): entrar em Descartado, mesmo coluna de seção 4 com papel entrega, não preenche concluido_em e grava o descarte; falha se Descartado virar entrega', async () => {
    const soDescartado = await staging(card(), [tr(COL.C, '2026-09-02 10:00:00'), tr(COL.D, '2026-09-03 10:00:00')]);
    await projetar();
    const c = await dim(soDescartado);
    expect(c.concluido_em).toBeNull();
    expect(c.motivo_descarte).not.toBeNull();
  });

  it('QA-4 (abuso, ADR 0020): campos de pessoa e texto livre que a API devolve no card e na transição não chegam a nenhuma coluna de nenhuma tabela do BusinessMap; falha se a allow-list ou o projetor copiar um deles', async () => {
    const marcador = 'MARCADOR-PESSOA-QA-F4';
    const suja = card({
      description: marcador, discard_comment: marcador, owner_user_id: 880_001, creator_user_id: 880_002, co_owner_ids: [880_003],
      owner: { realname: marcador, email: `${marcador}@exemplo.invalido` }, assignee_email: `${marcador}@exemplo.invalido`, comments: [{ text: marcador }],
    });
    const sujaTr = { ...tr(COL.F, '2026-09-02 10:00:00'), author_user_id: 880_004, author: marcador, comment: marcador };
    await staging(suja, [sujaTr]);
    await projetar();
    const tabelas = (await dono.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_type = 'BASE TABLE'`, [E.bm])).rows.map((r) => r.table_name);
    expect(tabelas.length).toBeGreaterThan(10);
    const achados: string[] = [];
    for (const tabela of tabelas) {
      const r = await dono.query(`SELECT count(*) AS n FROM ${E.bm}."${tabela}" x WHERE x::text LIKE $1`, [`%${marcador}%`]);
      if (Number((r.rows[0] as { n: string }).n) > 0) achados.push(tabela);
    }
    expect(achados).toEqual([]);
    // os ids de pessoa também não aparecem como texto de nenhum payload do staging
    for (const idPessoa of ['880001', '880002', '880003', '880004']) {
      const r = await dono.query(`SELECT count(*) AS n FROM ${E.bm}.stg_card x WHERE x::text LIKE $1`, [`%"${idPessoa}"%`]);
      expect(Number((r.rows[0] as { n: string }).n)).toBe(0);
    }
  });

  it('QA-5 (reconstrução): reconstruir duas vezes seguidas deixa dim_card igual (marcos), sem fato nem versão nova; falha se a reconstrução recalcular com outra regra ou duplicar', async () => {
    const id = await staging(card(), [tr(COL.C, '2026-09-02 10:00:00'), tr(COL.F, '2026-09-03 10:00:00'), tr(COL.E, '2026-09-04 10:00:00')]);
    await projetar();
    const antes = { c: await dim(id), fatos: await n('fato_transicao'), versoes: await n('dim_card_versao'), eventos: await n('evt_card') };
    await projetar({ reconstruir: true });
    const r = await projetar({ reconstruir: true });
    const depois = await dim(id);
    expect([ATE(depois.criado_em), ATE(depois.comprometido_em), ATE(depois.iniciado_em), ATE(depois.concluido_em), depois.granularidade, depois.equipe])
      .toEqual([ATE(antes.c.criado_em), ATE(antes.c.comprometido_em), ATE(antes.c.iniciado_em), ATE(antes.c.concluido_em), antes.c.granularidade, antes.c.equipe]);
    expect([await n('fato_transicao'), await n('dim_card_versao'), await n('evt_card')]).toEqual([antes.fatos, antes.versoes, antes.eventos]);
    expect(r).toMatchObject({ versoes: 0, eventos: { inseridos: 0 }, transicoes: { inseridas: 0 } });
  });

  it('QA-6 (papéis): dspd_api não lê o staging nem dim_responsavel e não escreve na projeção; falha se um GRANT a mais for aberto ao papel da API', async () => {
    const nega = async (sql: string): Promise<string | undefined> => {
      try { await api.query(sql); } catch (e) { return (e as { code?: string }).code; }
      return undefined;
    };
    expect(await nega(`SELECT * FROM ${E.bm}.stg_card LIMIT 1`)).toBe('42501');
    expect(await nega(`SELECT * FROM ${E.bm}.stg_revision LIMIT 1`)).toBe('42501');
    expect(await nega(`SELECT responsavel_nome FROM ${E.bm}.dim_responsavel LIMIT 1`)).toBe('42501');
    expect(await nega(`UPDATE ${E.bm}.dim_card SET tipo = 'x'`)).toBe('42501');
    expect(await nega(`DELETE FROM ${E.bm}.fato_transicao`)).toBe('42501');
    expect(await nega(`SELECT card_id, concluido_em FROM ${E.bm}.dim_card LIMIT 1`)).toBeUndefined();
  });
});
