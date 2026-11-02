import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { REFERENCIA_VERSAO } from '../migrations/0019_bm_carga_inicial_times.js';
import { lerVersoes } from '../src/modulos/operacao/repositorio.js';
import { lerVersaoCriterioVigente } from '../src/modulos/referencia/repositorio.js';
import { poolDe, S, unico, url } from './pg/ctx.js';

const d = describe.skipIf(!url);
const VIGENTE = 'vigente_ate IS NULL';

/** F0 do plano 052: tabelas de referência pelas decisões H, tabela de times e carga inicial (migrações 0016 e 0017). */
d('referência do quadro real e tabela de times (plano 052, F0)', () => {
  let dono: pg.Pool, api: pg.Pool, ref: pg.Pool, coletor: pg.Pool;
  beforeAll(() => { dono = poolDe(); api = poolDe('dspd_api'); ref = poolDe('dspd_ref'); coletor = poolDe('dspd_coletor'); });
  afterAll(async () => { await Promise.all([dono, api, ref, coletor].map((p) => p.end())); });

  /** Roda `fn` numa transação do migrador e desfaz tudo (as tabelas de vigência não aceitam limpeza por DELETE). */
  async function emTransacao(fn: (c: pg.PoolClient) => Promise<void>): Promise<void> {
    const c = await dono.connect();
    try {
      await c.query('BEGIN');
      await fn(c);
    } finally {
      await c.query('ROLLBACK');
      c.release();
    }
  }
  const barra = async (c: pg.PoolClient, sql: string, params: unknown[] = []): Promise<unknown> => {
    await c.query('SAVEPOINT s');
    try {
      await c.query(sql, params);
    } catch (e) {
      await c.query('ROLLBACK TO SAVEPOINT s');
      return e;
    }
    throw new Error(`esperava falha: ${sql}`);
  };
  const time = (id: number, nome = unico('t')) => [id, '2026-01-01', nome, 'processo', 1, 'teste'] as const;
  const INS_TIME = `INSERT INTO ${S.bm}.ref_time (time_id, vigente_de, nome, motivo, versao_id, registrado_por) VALUES ($1, $2, $3, $4, $5, $6)`;
  const INS_TW = `INSERT INTO ${S.bm}.ref_time_workflow (workflow_id, vigente_de, quadro_id, time_id, situacao, motivo_fora, motivo, versao_id, registrado_por)
    VALUES ($1, '2026-01-01', '1', $2, $3, $4, 'processo', 1, 'teste')`;

  it('carga inicial: 50 times e 63 workflows (50 em time, 6 fora de todo cálculo, 7 fora do operacional), todos vigentes', async () => {
    const t = await dono.query(`SELECT count(*)::int AS n FROM ${S.bm}.ref_time WHERE ${VIGENTE}`);
    expect(t.rows[0]).toEqual({ n: 50 });
    const w = await dono.query<{ situacao: string; motivo_fora: string | null; n: number }>(
      `SELECT situacao, motivo_fora, count(*)::int AS n FROM ${S.bm}.ref_time_workflow WHERE ${VIGENTE} GROUP BY 1, 2 ORDER BY 1, 2`);
    expect(w.rows).toEqual([
      { situacao: 'fora', motivo_fora: 'fora_de_todo_calculo', n: 6 },
      { situacao: 'fora', motivo_fora: 'fora_do_operacional', n: 7 },
      { situacao: 'time', motivo_fora: null, n: 50 },
    ]);
    const fora = await dono.query<{ workflow_id: string }>(
      `SELECT workflow_id FROM ${S.bm}.ref_time_workflow WHERE situacao = 'fora' AND ${VIGENTE} ORDER BY workflow_id::int`);
    expect(fora.rows.map((r) => r.workflow_id)).toEqual(['196', '198', '200', '201', '203', '207', '215', '216', '234', '257', '313', '321', '323']);
  });

  it('carga inicial: os 3 times próprios, vigência de 12 meses atrás, versão de critério sem métrica (sem marca nos gráficos)', async () => {
    const p = await dono.query<{ nome: string; workflow_id: string; quadro_id: string }>(
      `SELECT t.nome, w.workflow_id, w.quadro_id FROM ${S.bm}.ref_time t JOIN ${S.bm}.ref_time_workflow w ON w.time_id = t.time_id AND w.${VIGENTE}
       WHERE t.${VIGENTE} AND w.workflow_id IN ('224','265','229') ORDER BY w.workflow_id`);
    expect(p.rows).toEqual([
      { nome: 'Equipe de processos', workflow_id: '224', quadro_id: '24' },
      { nome: 'Auditoria PwC - ITGC', workflow_id: '229', quadro_id: '23' },
      { nome: 'Arquitetura', workflow_id: '265', quadro_id: '23' },
    ]);
    const v = await dono.query<{ n: number; ok: boolean; sem_metrica: boolean }>(
      `SELECT count(DISTINCT t.versao_id)::int AS n,
              bool_and(t.vigente_de = v.vigente_desde AND v.vigente_desde = (current_date - interval '12 months')::date AND v.dominio = 'businessmap') AS ok,
              bool_and(NOT EXISTS (SELECT 1 FROM ${S.core}.ref_versao_criterio_metrica m WHERE m.versao_id = v.versao_id)) AS sem_metrica
       FROM ${S.bm}.ref_time t JOIN ${S.core}.ref_versao_criterio v ON v.versao_id = t.versao_id WHERE t.motivo = 'carga_inicial'`);
    expect(v.rows[0]).toEqual({ n: 1, ok: true, sem_metrica: true });
  });

  it('carga inicial: todo workflow em time aponta para um time existente; um workflow em no máximo um time; registrado_por da carga', async () => {
    const orfas = await dono.query(
      `SELECT w.workflow_id FROM ${S.bm}.ref_time_workflow w WHERE w.situacao = 'time' AND NOT EXISTS
       (SELECT 1 FROM ${S.bm}.ref_time t WHERE t.time_id = w.time_id AND t.${VIGENTE})`);
    expect(orfas.rows).toEqual([]);
    const rp = await dono.query(`SELECT DISTINCT registrado_por, motivo FROM ${S.bm}.ref_time_workflow UNION SELECT DISTINCT registrado_por, motivo FROM ${S.bm}.ref_time`);
    expect(rp.rows).toEqual([{ registrado_por: 'carga-inicial-057-E3', motivo: 'carga_inicial' }]);
  });

  it('imutabilidade: UPDATE de campo, DELETE e TRUNCATE são barrados até para o dono, nas quatro tabelas', async () => {
    const alvos: [string, string][] = [['ref_time', 'nome'], ['ref_time_workflow', 'quadro_id']];
    await emTransacao(async (c) => {
      for (const [t, col] of alvos) {
        expect(await barra(c, `UPDATE ${S.bm}.${t} SET ${col} = ${col}`)).toMatchObject({ code: '55000' });
        expect(await barra(c, `DELETE FROM ${S.bm}.${t}`)).toMatchObject({ code: '55000' });
      }
      for (const t of ['ref_workflow', 'ref_tipo_card', 'ref_time', 'ref_time_workflow'])
        expect(await barra(c, `TRUNCATE ${S.bm}.${t}`), t).toMatchObject({ code: '55000' });
      await c.query(`INSERT INTO ${S.bm}.ref_workflow (quadro_id, workflow_id, vigente_de, nome, tipo_api, nivel) VALUES ('1', '1', '2026-01-01', 'w', 0, 'story')`);
      await c.query(`INSERT INTO ${S.bm}.ref_tipo_card (tipo_id, vigente_de, nome, eh_item, categoria) VALUES ('1', '2026-01-01', 't', true, 'produto')`);
      expect(await barra(c, `UPDATE ${S.bm}.ref_workflow SET nome = 'x'`)).toMatchObject({ code: '55000' });
      expect(await barra(c, `DELETE FROM ${S.bm}.ref_workflow`)).toMatchObject({ code: '55000' });
      expect(await barra(c, `UPDATE ${S.bm}.ref_tipo_card SET nome = 'x'`)).toMatchObject({ code: '55000' });
      expect(await barra(c, `DELETE FROM ${S.bm}.ref_tipo_card`)).toMatchObject({ code: '55000' });
    });
  });

  it('vigência: o único UPDATE é fechar a vigente (NULL -> data) sem mudar mais nada; depois entra a nova vigência', async () => {
    await emTransacao(async (c) => {
      await c.query(INS_TIME, [...time(900)]);
      // fechar junto com outra mudança: barrado
      expect(await barra(c, `UPDATE ${S.bm}.ref_time SET vigente_ate = '2026-02-01', ativo = false WHERE time_id = 900`)).toMatchObject({ code: '55000' });
      // apagar a data de fechamento ou reabrir: barrado
      await c.query(`UPDATE ${S.bm}.ref_time SET vigente_ate = '2026-02-01' WHERE time_id = 900`);
      expect(await barra(c, `UPDATE ${S.bm}.ref_time SET vigente_ate = '2026-03-01' WHERE time_id = 900`)).toMatchObject({ code: '55000' });
      expect(await barra(c, `UPDATE ${S.bm}.ref_time SET vigente_ate = NULL WHERE time_id = 900`)).toMatchObject({ code: '55000' });
      await c.query(INS_TIME, [900, '2026-02-01', 'novo nome', 'processo', 1, 'teste']);
      expect(await barra(c, INS_TIME, [900, '2026-03-01', 'duplicada vigente', 'processo', 1, 'teste'])).toMatchObject({ code: '23505' });
      const r = await c.query(`SELECT count(*)::int AS n FROM ${S.bm}.ref_time WHERE time_id = 900`);
      expect(r.rows[0]).toEqual({ n: 2 });
    });
  });

  it('restrições: time x fora, motivo, categoria x item, domínios fechados e ids ASCII', async () => {
    await emTransacao(async (c) => {
      const w = unico('w');
      expect(await barra(c, INS_TW, [w, null, 'time', null])).toMatchObject({ code: '23514' });
      expect(await barra(c, INS_TW, [w, 1, 'fora', 'fora_do_operacional'])).toMatchObject({ code: '23514' });
      expect(await barra(c, INS_TW, [w, null, 'fora', null])).toMatchObject({ code: '23514' });
      expect(await barra(c, INS_TW, [w, 1, 'time', 'fora_do_operacional'])).toMatchObject({ code: '23514' });
      expect(await barra(c, INS_TW, [w, null, 'fora', 'qualquer'])).toMatchObject({ code: '23514' });
      await c.query(INS_TW, [w, null, 'fora', 'fora_do_operacional']);
      expect(await barra(c, INS_TIME, [901, '2026-01-01', 'x', 'invalido', 1, 'teste'])).toMatchObject({ code: '23514' });
      expect(await barra(c, INS_TIME, [901, '2026-01-01', '', 'processo', 1, 'teste'])).toMatchObject({ code: '23514' });
      expect(await barra(c, INS_TIME, [901, '2026-01-01', 'x', 'processo', 1, ''])).toMatchObject({ code: '23514' });
      expect(await barra(c, INS_TIME, [0, '2026-01-01', 'x', 'processo', 1, 'teste'])).toMatchObject({ code: '23514' });
      const tipo = `INSERT INTO ${S.bm}.ref_tipo_card (tipo_id, vigente_de, nome, eh_item, categoria) VALUES ('t1', '2026-01-01', 'x', $1, $2)`;
      expect(await barra(c, tipo, [false, 'produto'])).toMatchObject({ code: '23514' });
      expect(await barra(c, tipo, [true, null])).toMatchObject({ code: '23514' });
      expect(await barra(c, tipo, [true, 'outra'])).toMatchObject({ code: '23514' });
      await c.query(tipo, [false, null]);
      expect(await barra(c, `INSERT INTO ${S.bm}.ref_workflow (quadro_id, workflow_id, vigente_de, nome, tipo_api, nivel) VALUES ('1', '2', '2026-01-01', 'w', 3, 'story')`)).toMatchObject({ code: '23514' });
      expect(await barra(c, `INSERT INTO ${S.bm}.ref_workflow (quadro_id, workflow_id, vigente_de, nome, tipo_api, nivel) VALUES ('1', '2', '2026-01-01', 'w', 0, 'epic')`)).toMatchObject({ code: '23514' });
      expect(await barra(c, `INSERT INTO ${S.bm}.ref_workflow (quadro_id, workflow_id, vigente_de, nome, tipo_api, nivel) VALUES ('1', 'á', '2026-01-01', 'w', 0, 'story')`)).toMatchObject({ code: '23514' });
    });
  });

  it('ref_coluna: colunas novas com padrão para linhas antigas e restrições de seção e tipo de fluxo', async () => {
    const cols = await dono.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'ref_coluna'`, [S.bm]);
    expect(cols.rows.map((r) => r.column_name)).toEqual(expect.arrayContaining(
      ['workflow_id', 'coluna_mae_id', 'section', 'flow_type', 'limite_wip', 'eh_folha', 'eh_descarte', 'motivo']));
    await emTransacao(async (c) => {
      const base = `INSERT INTO ${S.bm}.ref_coluna (quadro_id, coluna_id, vigente_de, nome, ordem, section, flow_type, motivo) VALUES ('q', $1, '2026-01-01', 'n', 0,`;
      await c.query(`${base} NULL, NULL, NULL)`, [unico('c')]);
      const r = await c.query(`SELECT eh_folha, eh_descarte FROM ${S.bm}.ref_coluna WHERE quadro_id = 'q'`);
      expect(r.rows[0]).toEqual({ eh_folha: true, eh_descarte: false });
      await c.query(`${base} 5, 2, 'correcao')`, [unico('c')]);
      expect(await barra(c, `${base} 0, 1, NULL)`, [unico('c')])).toMatchObject({ code: '23514' });
      expect(await barra(c, `${base} 6, 1, NULL)`, [unico('c')])).toMatchObject({ code: '23514' });
      expect(await barra(c, `${base} 3, 3, NULL)`, [unico('c')])).toMatchObject({ code: '23514' });
      expect(await barra(c, `${base} 3, 1, 'outro')`, [unico('c')])).toMatchObject({ code: '23514' });
    });
  });

  it('grants: dspd_api lê as tabelas novas, mas registrado_por está fora da API (42501), nos dois lados da tabela de times', async () => {
    for (const t of ['ref_time', 'ref_time_workflow']) {
      expect((await api.query(`SELECT 1 FROM ${S.bm}.${t} LIMIT 1`)).rows, t).toHaveLength(1);
      await expect(api.query(`SELECT registrado_por FROM ${S.bm}.${t}`), t).rejects.toMatchObject({ code: '42501' });
      await expect(api.query(`SELECT * FROM ${S.bm}.${t}`), `${t} SELECT *`).rejects.toMatchObject({ code: '42501' });
      const priv = await dono.query<{ coluna: string; le: boolean }>(
        `SELECT column_name AS coluna, has_column_privilege('dspd_api', $1 || '.' || $2, column_name, 'SELECT') AS le
         FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2`, [S.bm, t]);
      expect(priv.rows.filter((r) => !r.le).map((r) => r.coluna), t).toEqual(['registrado_por']);
    }
    expect((await api.query(`SELECT time_id, nome, ativo, vigente_de, vigente_ate, motivo, versao_id, registrado_em FROM ${S.bm}.ref_time`)).rows).toHaveLength(50);
    expect((await api.query(`SELECT * FROM ${S.bm}.ref_workflow`)).rows).toBeDefined();
    expect((await api.query(`SELECT * FROM ${S.bm}.ref_tipo_card`)).rows).toBeDefined();
    await expect(api.query(`INSERT INTO ${S.bm}.ref_time (time_id, vigente_de, nome, motivo, versao_id, registrado_por) VALUES (902, now(), 'x', 'processo', 1, 'a')`)).rejects.toMatchObject({ code: '42501' });
    await expect(api.query(`UPDATE ${S.bm}.ref_time SET vigente_ate = now()`)).rejects.toMatchObject({ code: '42501' });
  });

  it('grants: coletor só lê a referência; ref só insere vigência e fecha vigente_ate', async () => {
    expect((await coletor.query(`SELECT registrado_por FROM ${S.bm}.ref_time LIMIT 1`)).rows).toHaveLength(1);
    await expect(coletor.query(`INSERT INTO ${S.bm}.ref_time (time_id, vigente_de, nome, motivo, versao_id, registrado_por) VALUES (903, now(), 'x', 'processo', 1, 'a')`)).rejects.toMatchObject({ code: '42501' });
    await expect(ref.query(`UPDATE ${S.bm}.ref_time SET nome = 'x'`)).rejects.toMatchObject({ code: '42501' });
    await expect(ref.query(`DELETE FROM ${S.bm}.ref_time`)).rejects.toMatchObject({ code: '42501' });
  });

  it('nenhuma view agrupa por time para comparar: nenhuma view do banco usa as tabelas de times (data-model §9)', async () => {
    const r = await dono.query<{ view_name: string }>(
      `SELECT DISTINCT view_name FROM information_schema.view_table_usage
       WHERE view_schema = ANY($1) AND table_schema = $2 AND table_name IN ('ref_time', 'ref_time_workflow')`, [[S.bm, S.ac, S.core], S.bm]);
    expect(r.rows).toEqual([]);
    const c = await dono.query<{ view_name: string }>(
      `SELECT DISTINCT view_name FROM information_schema.view_column_usage
       WHERE view_schema = ANY($1) AND table_schema = $2 AND table_name IN ('ref_time', 'ref_time_workflow')`, [[S.bm, S.ac, S.core], S.bm]);
    expect(c.rows).toEqual([]);
  });

  it('down da carga recusa quando há vigência posterior (nada de histórico se perde)', async () => {
    await emTransacao(async (c) => {
      const { ddl } = await import('../migrations/0019_bm_carga_inicial_times.js');
      const down = ddl(S).down;
      await c.query(INS_TIME, [904, '2026-01-01', 'posterior', 'processo', 1, 'teste']);
      await expect(c.query(down[0]!)).rejects.toThrow(/vigências posteriores/);
    });
  });

  it('a versão de partida da 0017 (sem métrica) fica fora de /criterios e de versaoCriterio; versão com métrica entra', async () => {
    const partida = await dono.query<{ versao_id: string }>(
      `SELECT versao_id FROM ${S.core}.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = $1`, [REFERENCIA_VERSAO]);
    expect(partida.rows).toHaveLength(1);
    const id = String(partida.rows[0]!.versao_id);
    expect((await lerVersoes(dono, 'businessmap', S)).map((v) => v.id)).not.toContain(id);
    expect(await lerVersaoCriterioVigente(dono, '9999-12-31', S)).not.toBe(id);
    await emTransacao(async (c) => {
      const nova = await c.query<{ versao_id: string }>(
        `INSERT INTO ${S.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
         VALUES ('1999-01-01', 'businessmap', 'com métrica', 'teste', 'teste-5-review', now()) RETURNING versao_id`);
      const novaId = String(nova.rows[0]!.versao_id);
      await c.query(`INSERT INTO ${S.core}.ref_versao_criterio_metrica (versao_id, metrica_id) VALUES ($1, 'O2')`, [novaId]);
      expect((await lerVersoes(c, 'businessmap', S)).map((v) => v.id)).toContain(novaId);
      expect(await lerVersaoCriterioVigente(c, '2000-01-01', S)).toBe(novaId);
    });
  });
});
