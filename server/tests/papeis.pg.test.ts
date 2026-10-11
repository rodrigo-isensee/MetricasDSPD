import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { hash, novaColeta, poolDe, S, unico, url } from './pg/ctx.js';

const d = describe.skipIf(!url);

/** Cada papel conecta com a própria credencial e só faz o que o data-model §8 permite. */
d('papéis e privilégios (conectando como cada papel)', () => {
  let dono: pg.Pool, api: pg.Pool, coletor: pg.Pool, ref: pg.Pool, webhook: pg.Pool, automacao: pg.Pool;
  const papeis = (): pg.Pool[] => [dono, api, coletor, ref, webhook, automacao];
  let coleta = 0;
  const card = unico('p');
  beforeAll(async () => {
    dono = poolDe(); api = poolDe('dspd_api'); coletor = poolDe('dspd_coletor');
    ref = poolDe('dspd_ref'); webhook = poolDe('dspd_webhook'); automacao = poolDe('dspd_automacao');
    coleta = await novaColeta(dono, S.bm);
    await coletor.query(`INSERT INTO ${S.bm}.dim_card (card_id, titulo, responsaveis, coletado_em, atualizado_por_coleta_id)
      VALUES ($1, 'T', ARRAY['Fulana de Tal'], now(), $2)`, [card, coleta]);
    await coletor.query(`INSERT INTO ${S.bm}.fato_transicao (card_id, coluna_destino_id, fonte, id_origem, ocorrido_em, usuario, coletado_em, coleta_id)
      VALUES ($1, 'c1', 'revision', $2, now(), 'Fulana', now(), $3)`, [card, card, coleta]);
  });
  afterAll(async () => { await Promise.all(papeis().map((p) => p.end())); });

  it('api lê o card sem a coluna de pessoa; pedir responsaveis ou SELECT * falha com 42501', async () => {
    expect((await api.query(`SELECT card_id, titulo FROM ${S.bm}.dim_card WHERE card_id = $1`, [card])).rows).toEqual([{ card_id: card, titulo: 'T' }]);
    await expect(api.query(`SELECT responsaveis FROM ${S.bm}.dim_card`)).rejects.toMatchObject({ code: '42501' });
    await expect(api.query(`SELECT * FROM ${S.bm}.dim_card`)).rejects.toMatchObject({ code: '42501' });
    await expect(api.query(`SELECT usuario FROM ${S.bm}.fato_transicao`)).rejects.toMatchObject({ code: '42501' });
  });
  it('api lê a transição canônica pela view (security_invoker) e nunca vê o usuário', async () => {
    const r = await api.query(`SELECT * FROM ${S.bm}.vw_transicao_canonica WHERE card_id = $1`, [card]);
    expect(r.rows).toHaveLength(1);
    expect(Object.keys(r.rows[0] as object)).not.toContain('usuario');
  });
  it('api não lê staging, eventos nem versões, nem a outbox; não escreve em nada', async () => {
    for (const t of ['stg_card', 'evt_card', 'dim_card_versao']) await expect(api.query(`SELECT 1 FROM ${S.bm}.${t}`), t).rejects.toMatchObject({ code: '42501' });
    await expect(api.query(`SELECT 1 FROM ${S.core}.outbox`)).rejects.toMatchObject({ code: '42501' });
    await expect(api.query(`DELETE FROM ${S.bm}.dim_card`)).rejects.toMatchObject({ code: '42501' });
    expect((await api.query(`SELECT 1 FROM ${S.core}.ref_calendario`)).rows).toBeDefined();
  });
  it('coletor atualiza só as colunas da execução em ctl_coleta e lê o card inteiro (inclusive a pessoa)', async () => {
    await coletor.query(`UPDATE ${S.bm}.ctl_coleta SET status = 'sucesso', finalizado_em = now() WHERE coleta_id = $1`, [coleta]);
    await expect(coletor.query(`UPDATE ${S.bm}.ctl_coleta SET versao_coletor = 'x' WHERE coleta_id = $1`, [coleta])).rejects.toMatchObject({ code: '42501' });
    expect((await coletor.query(`SELECT responsaveis FROM ${S.bm}.dim_card WHERE card_id = $1`, [card])).rows[0]).toEqual({ responsaveis: ['Fulana de Tal'] });
    await expect(coletor.query(`DELETE FROM ${S.bm}.fato_transicao`)).rejects.toMatchObject({ code: '42501' });
  });
  it('webhook só insere (stg_webhook_evento e outbox) e lê só webhook_sk e hash', async () => {
    const h = hash(unico('w'));
    const r = await webhook.query<{ webhook_sk: string }>(
      `INSERT INTO ${S.bm}.stg_webhook_evento (payload_sha256, payload, recebido_em) VALUES ($1, '{}', now())
       ON CONFLICT ON CONSTRAINT uq_stg_webhook_evento DO NOTHING RETURNING webhook_sk`, [h]);
    expect(r.rows).toHaveLength(1);
    await webhook.query(`INSERT INTO ${S.core}.outbox (fonte, tipo, payload) VALUES ('businessmap', 'bm.webhook.recebido', $1)`, [JSON.stringify({ webhookSk: r.rows[0]!.webhook_sk })]);
    await expect(webhook.query(`SELECT payload FROM ${S.bm}.stg_webhook_evento`)).rejects.toMatchObject({ code: '42501' });
    await expect(webhook.query(`SELECT 1 FROM ${S.bm}.dim_card`)).rejects.toMatchObject({ code: '42501' });
  });
  it('ref só fecha vigência (UPDATE por coluna); coletor só lê ref_', async () => {
    const q = unico('q');
    await ref.query(`INSERT INTO ${S.bm}.ref_quadro (quadro_id, vigente_de, equipe, nivel) VALUES ($1, '2026-01-01', 'E', 'time')`, [q]);
    await expect(ref.query(`INSERT INTO ${S.bm}.ref_quadro (quadro_id, vigente_de, equipe, nivel) VALUES ($1, '2026-02-01', 'E', 'time')`, [q])).rejects.toMatchObject({ code: '23505' });
    await ref.query(`UPDATE ${S.bm}.ref_quadro SET vigente_ate = '2026-01-31' WHERE quadro_id = $1`, [q]);
    await ref.query(`INSERT INTO ${S.bm}.ref_quadro (quadro_id, vigente_de, equipe, nivel) VALUES ($1, '2026-02-01', 'E', 'time')`, [q]);
    await expect(ref.query(`UPDATE ${S.bm}.ref_quadro SET equipe = 'Z' WHERE quadro_id = $1`, [q])).rejects.toMatchObject({ code: '42501' });
    await expect(coletor.query(`INSERT INTO ${S.bm}.ref_quadro (quadro_id, vigente_de, equipe, nivel) VALUES ('x', '2026-01-01', 'E', 'time')`)).rejects.toMatchObject({ code: '42501' });
  });
  it('automação só insere em ctl_automacao (append-only por privilégio) e não toca no BM', async () => {
    const ch = unico('z');
    await automacao.query(`INSERT INTO ${S.ac}.ctl_automacao (chamado_id, regra, momento_gatilho, tentativa, acao, modo, coletado_em) VALUES ($1, 'r', now(), 1, 'a', 'simulacao', now())`, [ch]);
    await expect(automacao.query(`UPDATE ${S.ac}.ctl_automacao SET acao = 'b'`)).rejects.toMatchObject({ code: '42501' });
    await expect(automacao.query(`SELECT 1 FROM ${S.bm}.dim_card`)).rejects.toMatchObject({ code: '42501' });
  });
  it('view vw_fechados_sla: dentro, fora e nulo ficam separados; exceção é coluna', async () => {
    const [on, oc, oe] = [unico('o'), unico('o'), unico('o')];
    const dom = (campo: string, codigo: string) => dono.query(`INSERT INTO ${S.ac}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ($1, $2, '2026-01-01', $2, 1) ON CONFLICT DO NOTHING`, [campo, codigo]);
    await dom('organizacao_recorte', 'ORG'); await dom('tipo_recorte', 'TIPO'); await dom('equipe', 'EQ');
    for (const [id, sla] of [[on, 'REALIZADO_NO_PRAZO'], [oc, 'REALIZADO_APOS_VENCIMENTO'], [oe, null]] as const)
      await coletor.query(`INSERT INTO ${S.ac}.dim_chamado (chamado_id, organizacao, tipo, equipe, status, data_finalizado, status_sla_r, coletado_em, atualizado_por_coleta_id)
        VALUES ($1, 'ORG', 'TIPO', 'EQ', 'Concluído', now(), $2, now(), 1)`, [id, sla]);
    const r = await api.query<{ chamado_id: string; dentro_sla: boolean | null; excecao_sla_registro_posterior: boolean }>(
      `SELECT chamado_id, dentro_sla, excecao_sla_registro_posterior FROM ${S.ac}.vw_fechados_sla WHERE chamado_id = ANY($1) ORDER BY chamado_id`, [[on, oc, oe]]);
    const por = Object.fromEntries(r.rows.map((x) => [x.chamado_id, x.dentro_sla]));
    expect(por).toEqual({ [on]: true, [oc]: false, [oe]: null });
    await expect(coletor.query(`INSERT INTO ${S.ac}.dim_chamado (chamado_id, status_sla_r, coletado_em, atualizado_por_coleta_id) VALUES ($1, 'dentro', now(), 1)`, [unico('o')])).rejects.toMatchObject({ code: '23514' });
  });
});
