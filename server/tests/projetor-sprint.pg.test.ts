import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { projetarBusinessMap } from '../src/modulos/businessmap/projetor.js';
import { gravarStgCard } from '../src/modulos/businessmap/staging.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { criarPool, urlDoPapel } from '../src/plataforma/db/pool.js';
import { poolDe, url } from './pg/ctx.js';

// Pedido 105 (E7.499, D-T8 "A"): `dim_sprint` e `fato_sprint_filho` pela projeção, contra PostgreSQL real.
const d = describe.skipIf(!url);
const Q = '9301';
const H = (h: number): Date => new Date(Date.UTC(2026, 10, 1, h));
const TIPO_SPRINT = '12';
const TIPO_STORY = '5';

d('E7.499: o projetor grava a janela da Sprint e o vínculo dos filhos', () => {
  const prefixo = prefixoDeTeste();
  const E = montarEsquemas(prefixo);
  let dono: pg.Pool, coletor: pg.Pool, api: pg.Pool, coleta = 0, seq = 0;
  const projetar = () => projetarBusinessMap({ pool: coletor, S: E, agora: () => new Date() });
  const novoId = (): string => String(930_000_000 + ++seq);
  const versao = (id: string, h: number, card: Record<string, unknown>) =>
    gravarStgCard(coletor, { idOrigem: id, card: { card_id: Number(id), board_id: Number(Q), created_at: '2026-03-01T10:00:00Z', ...card }, dominios: new Map(), coletaId: coleta, agora: H(h), quadroId: Q, arquivado: false, excluidoDetectado: false }, E);
  const vinculos = async (sprint: string) => (await dono.query(`SELECT filho_id FROM ${E.bm}.fato_sprint_filho WHERE sprint_id = $1 ORDER BY filho_id`, [sprint])).rows.map((r: { filho_id: string }) => r.filho_id);

  beforeAll(async () => {
    await migrar(url!, { prefixo });
    dono = poolDe();
    coletor = criarPool(urlDoPapel(url!, 'dspd_coletor', process.env.DSPD_PWD_COLETOR ?? 'coletor_dev'), { max: 2 });
    api = criarPool(urlDoPapel(url!, 'dspd_api', process.env.DSPD_PWD_API ?? 'api_dev'), { max: 2 });
    await dono.query(`INSERT INTO ${E.bm}.ref_tipo_card (tipo_id, vigente_de, nome, eh_item, categoria) VALUES ($1, '2020-01-01', 'Sprint', false, NULL), ($2, '2020-01-01', 'Historia', true, 'produto')`, [TIPO_SPRINT, TIPO_STORY]);
    coleta = Number((await dono.query<{ coleta_id: string }>(`INSERT INTO ${E.bm}.ctl_coleta (tarefa, iniciado_em, status, versao_coletor) VALUES ('reconciliacao', now(), 'em_andamento', 'teste') RETURNING coleta_id`)).rows[0]!.coleta_id);
  });
  afterAll(async () => {
    await coletor.end();
    await api.end();
    for (const s of [E.bm, E.ac, E.core]) await dono.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
    await dono.end();
  });

  it('grava as datas de execução do card Sprint e o vínculo (pelos dois lados, sem duplicar); só ids e instantes', async () => {
    const [sprint, filhoA, filhoB, solto] = [novoId(), novoId(), novoId(), novoId()];
    await versao(sprint, 9, {
      type_id: Number(TIPO_SPRINT), title: 'TITULO-DA-SPRINT', first_start_time: '2026-05-04T12:16:59Z', first_end_time: '2026-06-01T11:52:58Z',
      linked_cards: [{ card_id: Number(filhoA), link_type: 'child' }, { card_id: Number(filhoB), link_type: 'child' }],
    });
    await versao(filhoA, 9, { type_id: Number(TIPO_STORY), linked_cards: [{ card_id: Number(sprint), link_type: 'parent' }] });
    await versao(filhoB, 9, { type_id: Number(TIPO_STORY) }); // só a Sprint aponta para ele
    await versao(solto, 9, { type_id: Number(TIPO_STORY) });
    const r = await projetar();
    expect(r.sprints.projetadas).toBeGreaterThanOrEqual(1);
    expect((await dono.query(`SELECT sprint_id, quadro_id, inicio_em, fim_em, descartada FROM ${E.bm}.dim_sprint WHERE sprint_id = $1`, [sprint])).rows).toEqual([
      { sprint_id: sprint, quadro_id: Q, inicio_em: new Date('2026-05-04T12:16:59Z'), fim_em: new Date('2026-06-01T11:52:58Z'), descartada: false },
    ]);
    expect(await vinculos(sprint)).toEqual([filhoA, filhoB].sort());
    expect((await dono.query(`SELECT count(*) AS n FROM ${E.bm}.fato_sprint_filho WHERE filho_id = $1`, [solto])).rows[0].n).toBe('0');
    // nenhum texto livre: as duas tabelas não têm coluna de título nem de pessoa, e o título do card não está em nenhuma linha
    const colunas = (await dono.query<{ c: string }>(`SELECT column_name AS c FROM information_schema.columns WHERE table_schema = $1 AND table_name IN ('dim_sprint', 'fato_sprint_filho')`, [E.bm])).rows.map((x) => x.c);
    expect(colunas.filter((c) => /titulo|title|nome|usuario|email|responsavel|pessoa|texto|comentario/.test(c))).toEqual([]);
    for (const t of ['dim_sprint', 'fato_sprint_filho']) expect((await dono.query(`SELECT count(*) AS n FROM ${E.bm}.${t} x WHERE x::text LIKE '%TITULO-DA-SPRINT%'`)).rows[0].n).toBe('0');
  });

  it('reprojetar não duplica; vínculo desfeito no BusinessMap continua na base (nunca sobrescreve histórico)', async () => {
    const [sprint, filho] = [novoId(), novoId()];
    await versao(sprint, 9, { type_id: Number(TIPO_SPRINT), linked_cards: [{ card_id: Number(filho), link_type: 'child' }] });
    await versao(filho, 9, { type_id: Number(TIPO_STORY), linked_cards: [{ card_id: Number(sprint), link_type: 'parent' }] });
    await projetar();
    await projetar();
    expect(await vinculos(sprint)).toEqual([filho]);
    // o filho sai da Sprint: nova versão dos dois cards sem o vínculo
    await versao(sprint, 12, { type_id: Number(TIPO_SPRINT), linked_cards: [] });
    await versao(filho, 12, { type_id: Number(TIPO_STORY), linked_cards: [] });
    const r = await projetar();
    expect(await vinculos(sprint)).toEqual([filho]);
    expect(r.vinculosSprint.inseridos).toBe(0);
  });

  it('Sprint sem as datas fica com nulos; Sprint descartada fica marcada; card que não é Sprint não entra em dim_sprint', async () => {
    const [semDatas, descartada, story] = [novoId(), novoId(), novoId()];
    await versao(semDatas, 9, { type_id: Number(TIPO_SPRINT) });
    await versao(descartada, 9, { type_id: Number(TIPO_SPRINT), first_start_time: '2026-05-04T12:00:00Z', first_end_time: '2026-05-08T12:00:00Z', discarded_at: '2026-05-09T12:00:00Z' });
    await versao(story, 9, { type_id: Number(TIPO_STORY), first_start_time: '2026-05-04T12:00:00Z' });
    await projetar();
    const linha = async (id: string) => (await dono.query(`SELECT inicio_em, fim_em, descartada FROM ${E.bm}.dim_sprint WHERE sprint_id = $1`, [id])).rows;
    expect(await linha(semDatas)).toEqual([{ inicio_em: null, fim_em: null, descartada: false }]);
    expect((await linha(descartada))[0]!.descartada).toBe(true);
    expect(await linha(story)).toEqual([]);
  });

  it('fato_sprint_filho é append-only (UPDATE, DELETE e TRUNCATE barrados, até para o dono) e a API só lê', async () => {
    await expect(dono.query(`UPDATE ${E.bm}.fato_sprint_filho SET filho_id = 'x'`)).rejects.toThrow(/append-only|imut/i);
    await expect(dono.query(`DELETE FROM ${E.bm}.fato_sprint_filho`)).rejects.toThrow(/append-only|imut/i);
    await expect(dono.query(`TRUNCATE ${E.bm}.fato_sprint_filho`)).rejects.toThrow(/append-only|imut/i);
    await expect(coletor.query(`UPDATE ${E.bm}.fato_sprint_filho SET filho_id = 'x'`)).rejects.toThrow();
    expect((await api.query(`SELECT count(*) AS n FROM ${E.bm}.fato_sprint_filho`)).rows[0].n).not.toBeUndefined();
    expect((await api.query(`SELECT count(*) AS n FROM ${E.bm}.dim_sprint`)).rows[0].n).not.toBeUndefined();
    await expect(api.query(`INSERT INTO ${E.bm}.dim_sprint (sprint_id, descartada, coletado_em, atualizado_por_coleta_id) VALUES ('1', false, now(), 1)`)).rejects.toThrow();
    await expect(api.query(`INSERT INTO ${E.bm}.fato_sprint_filho (sprint_id, filho_id, coletado_em, coleta_id) VALUES ('1', '2', now(), 1)`)).rejects.toThrow();
  });
});
