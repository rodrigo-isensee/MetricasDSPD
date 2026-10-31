import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { lerConferencia } from '../src/modulos/businessmap/conferencia.js';
import {
  ENTIDADE_SEM_CONFERENCIA, ErroReferencia, METRICAS_DO_FLUXO, carregarVigentes, registrarFolhasSemConferencia, sincronizarReferencia,
  type ReferenciaLida,
} from '../src/modulos/businessmap/referencia.js';
import { lerColunas } from '../src/modulos/metricas/repositorio.js';
import { montarBaseBM, type LinhasBM } from '../src/modulos/metricas/mapa.js';
import type { Consultavel } from '../src/plataforma/db/pool.js';
import { novaColeta, poolDe, S, url } from './pg/ctx.js';

const d = describe.skipIf(!url);
const conf = lerConferencia();
const Q = 9025; // quadro de teste: nenhum outro teste nem seed usa; tudo roda em transação desfeita (as tabelas de vigência não aceitam DELETE)
const QS = String(Q);
const D1 = '2026-11-02';
const D2 = '2026-11-03';
const INICIO = '2025-11-02';

type Col = [id: number, nome: string, secao: number, flow: number, extra?: { pai?: number; limite?: number }];
function estrutura(wfs: Record<number, Col[]>): unknown {
  const columns: Record<string, unknown> = {};
  const child_columns: Record<string, number[]> = {};
  const workflows: Record<string, unknown> = {};
  for (const [wid, cs] of Object.entries(wfs)) {
    for (const [id, nome, secao, flow, x] of cs) {
      columns[String(id)] = { name: nome, section: secao, flow_type: flow, parent_column_id: x?.pai ?? 0, workflow_id: Number(wid), limit: x?.limite ?? 0 };
      if (x?.pai !== undefined) (child_columns[String(x.pai)] ??= []).push(id);
    }
    const folhas = cs.filter(([id]) => !cs.some((o) => o[4]?.pai === id)).map(([id]) => id);
    workflows[wid] = { name: 'WF', top_columns: cs.filter((c) => c[4]?.pai === undefined).map((c) => c[0]), bottom_columns: folhas };
  }
  return { data: { columns, child_columns, workflows } };
}
// Mesmos ids do arquivo de conferência (191/2532 é exceção de trabalho), mas no quadro 9025: a PK de ref_coluna é por quadro.
const WF191: Col[] = [
  [2530, 'Backlog', 1, 2], [2531, 'Comprometido', 2, 2], [2533, 'Em Homologação', 3, 1, { limite: 4 }],
  [2532, 'Aguardando Publicação', 4, 2], [2534, 'Concluído', 4, 1], [2535, 'Descartado', 4, 1],
];
const WF192: Col[] = [[2540, 'Backlog', 1, 2], [2541, 'Fazendo', 3, 1], [2542, 'Pronto', 4, 1]];

function lida(mod: { wf191?: Col[]; tipos?: unknown[]; workflows?: unknown[] } = {}): ReferenciaLida {
  return {
    quadros: [Q],
    estruturas: new Map([[Q, estrutura({ 191: mod.wf191 ?? WF191, 192: WF192 })]]),
    workflows: new Map([[Q, { data: mod.workflows ?? [{ workflow_id: 191, name: 'Iniciativas', type: 1 }, { workflow_id: 192, name: 'Time A', type: 0 }, { workflow_id: 193, name: 'Linha', type: 2 }] }]]),
    tipos: { data: mod.tipos ?? [{ type_id: 9101, name: 'Story' }, { type_id: 9102, name: 'Sprint' }, { type_id: 9103, name: 'Tipo Novo' }] },
  };
}

d('F2 do plano 052: gravação da referência real contra PostgreSQL (papéis, CHECKs, gatilho, vigência, versão, rollback)', () => {
  let dono: pg.Pool, ref: pg.Pool, coletor: pg.Pool;
  beforeAll(() => { dono = poolDe(); ref = poolDe('dspd_ref'); coletor = poolDe('dspd_coletor'); });
  afterAll(async () => { await Promise.all([dono, ref, coletor].map((p) => p.end())); });

  /** Transação do papel de referência (o da F3); tudo é desfeito no fim. */
  async function comoRef(fn: (c: pg.PoolClient) => Promise<void>): Promise<void> {
    const c = await ref.connect();
    try {
      await c.query('BEGIN');
      await fn(c);
    } finally {
      await c.query('ROLLBACK');
      c.release();
    }
  }
  /** Executa algo que deve falhar sem derrubar a transação (savepoint) e devolve o erro do banco. */
  async function falha(c: pg.PoolClient, sql: string, params: unknown[] = []): Promise<{ code?: string; message: string }> {
    await c.query('SAVEPOINT s');
    try {
      await c.query(sql, params);
    } catch (e) {
      await c.query('ROLLBACK TO SAVEPOINT s');
      return e as { code?: string; message: string };
    }
    throw new Error(`esperava falha do banco: ${sql}`);
  }
  const n = async (c: Consultavel, sql: string, params: unknown[] = []): Promise<number> => (await c.query<{ n: number }>(sql, params)).rows[0]!.n;
  const contar = (c: Consultavel, tabela: string): Promise<number> =>
    n(c, `SELECT count(*)::int AS n FROM ${S.bm}.${tabela} WHERE quadro_id = $1`, [QS]);

  it('CT-1 carga inicial como dspd_ref: grava as 4 tabelas (colunas novas, papel, tipo, nível) e a versão de partida sem métrica', async () => {
    await comoRef(async (c) => {
      const r = await sincronizarReferencia(c, lida(), conf, { hoje: D1, inicioCarga: INICIO }, S);
      expect(r).toMatchObject({ fechadas: 0, marca: false, semConferencia: 0, workflowsIgnorados: 0, folhasSemPapel: 0 });
      expect(await contar(c, 'ref_quadro')).toBe(1);
      expect(await contar(c, 'ref_workflow')).toBe(3);
      expect(await contar(c, 'ref_coluna')).toBe(9);
      const q = await c.query(`SELECT nivel, eh_teste, vigente_de FROM ${S.bm}.ref_quadro WHERE quadro_id = $1`, [QS]);
      expect(q.rows).toEqual([{ nivel: 'coordenacao', eh_teste: false, vigente_de: INICIO }]);
      const w = await c.query(`SELECT workflow_id, tipo_api, nivel FROM ${S.bm}.ref_workflow WHERE quadro_id = $1 ORDER BY workflow_id`, [QS]);
      expect(w.rows).toEqual([
        { workflow_id: '191', tipo_api: 1, nivel: 'feature' }, { workflow_id: '192', tipo_api: 0, nivel: 'story' }, { workflow_id: '193', tipo_api: 2, nivel: 'nenhum' },
      ]);
      const col = await c.query(
        `SELECT coluna_id, papel, tipo_coluna, section, flow_type, eh_folha, eh_descarte, limite_wip, workflow_id, motivo, vigente_de
           FROM ${S.bm}.ref_coluna WHERE quadro_id = $1 AND coluna_id IN ('2532','2533','2534','2535','2540') ORDER BY coluna_id`, [QS]);
      expect(col.rows).toEqual([
        { coluna_id: '2532', papel: 'trabalho', tipo_coluna: 'fila', section: 4, flow_type: 2, eh_folha: true, eh_descarte: false, limite_wip: null, workflow_id: '191', motivo: null, vigente_de: INICIO },
        { coluna_id: '2533', papel: 'homologacao', tipo_coluna: 'execucao', section: 3, flow_type: 1, eh_folha: true, eh_descarte: false, limite_wip: 4, workflow_id: '191', motivo: null, vigente_de: INICIO },
        { coluna_id: '2534', papel: 'entrega', tipo_coluna: 'execucao', section: 4, flow_type: 1, eh_folha: true, eh_descarte: false, limite_wip: null, workflow_id: '191', motivo: null, vigente_de: INICIO },
        { coluna_id: '2535', papel: null, tipo_coluna: 'execucao', section: 4, flow_type: 1, eh_folha: true, eh_descarte: true, limite_wip: null, workflow_id: '191', motivo: null, vigente_de: INICIO },
        { coluna_id: '2540', papel: 'backlog', tipo_coluna: 'fila', section: 1, flow_type: 2, eh_folha: true, eh_descarte: false, limite_wip: null, workflow_id: '192', motivo: null, vigente_de: INICIO },
      ]);
      const t = await c.query(`SELECT tipo_id, eh_item, categoria FROM ${S.bm}.ref_tipo_card WHERE tipo_id IN ('9101','9102','9103') ORDER BY tipo_id`);
      expect(t.rows).toEqual([
        { tipo_id: '9101', eh_item: true, categoria: 'produto' }, { tipo_id: '9102', eh_item: false, categoria: null }, { tipo_id: '9103', eh_item: true, categoria: 'produto' },
      ]);
      const v = await c.query<{ vigente_desde: string; n: number }>(
        `SELECT v.vigente_desde, (SELECT count(*)::int FROM ${S.core}.ref_versao_criterio_metrica m WHERE m.versao_id = v.versao_id) AS n
           FROM ${S.core}.ref_versao_criterio v WHERE dominio = 'businessmap' AND referencia = $1`, [conf.versao_criterio.referencia]);
      expect(v.rows).toEqual([{ vigente_desde: INICIO, n: 0 }]);
    });
  });

  it('CT-2 CHECKs do banco recusam o que a carga nunca grava (nível de quadro, id com espaço, seção, flow_type, tipo_api, item sem categoria)', async () => {
    await comoRef(async (c) => {
      const ins = (tabela: string, cols: string[], vals: unknown[]): Promise<{ code?: string }> =>
        falha(c, `INSERT INTO ${S.bm}.${tabela} (${cols.join(', ')}, vigente_de) VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}, '${D1}')`, vals);
      // nível aceito: coordenacao e gerencia (a carga já provou coordenacao)
      await c.query(`INSERT INTO ${S.bm}.ref_quadro (quadro_id, equipe, nivel, eh_teste, vigente_de) VALUES ('9035', 'Q', 'gerencia', false, '${D1}')`);
      expect((await ins('ref_quadro', ['quadro_id', 'equipe', 'nivel', 'eh_teste'], ['9036', 'Q', 'lider', false])).code).toBe('23514');
      expect((await ins('ref_quadro', ['quadro_id', 'equipe', 'nivel', 'eh_teste'], ['90 37', 'Q', 'time', false])).code).toBe('23514');
      const base = ['9025', '1', 'N', 'fila', 'backlog', 0];
      const cols = ['quadro_id', 'coluna_id', 'nome', 'tipo_coluna', 'papel', 'ordem'];
      expect((await ins('ref_coluna', [...cols, 'section'], [...base, 6])).code).toBe('23514');
      expect((await ins('ref_coluna', [...cols, 'section'], [...base, 0])).code).toBe('23514');
      expect((await ins('ref_coluna', [...cols, 'flow_type'], [...base, 3])).code).toBe('23514');
      expect((await ins('ref_coluna', [...cols, 'limite_wip'], [...base, -1])).code).toBe('23514');
      expect((await ins('ref_coluna', [...cols, 'motivo'], [...base, 'outro'])).code).toBe('23514');
      expect((await ins('ref_workflow', ['quadro_id', 'workflow_id', 'nome', 'tipo_api', 'nivel'], ['9025', '1', 'W', 3, 'story'])).code).toBe('23514');
      expect((await ins('ref_workflow', ['quadro_id', 'workflow_id', 'nome', 'tipo_api', 'nivel'], ['9025', '1', 'W', 1, 'pacote'])).code).toBe('23514');
      expect((await ins('ref_tipo_card', ['tipo_id', 'nome', 'eh_item', 'categoria'], ['9110', 'T', true, null])).code).toBe('23514');
      expect((await ins('ref_tipo_card', ['tipo_id', 'nome', 'eh_item', 'categoria'], ['9111', 'T', false, 'produto'])).code).toBe('23514');
      expect((await ins('ref_tipo_card', ['tipo_id', 'nome', 'eh_item', 'categoria'], ['9112', 'T', true, 'inventada'])).code).toBe('23514');
      // o que é válido entra (prova que as recusas acima são dos CHECKs e não de grant)
      await c.query(`INSERT INTO ${S.bm}.ref_tipo_card (tipo_id, nome, eh_item, categoria, vigente_de) VALUES ('9113', 'T', true, 'bug_interno', '${D1}')`);
    });
  });

  it('CT-3 grants: dspd_ref só atualiza vigente_ate; o gatilho recusa todo outro UPDATE, DELETE e TRUNCATE (nem o dono altera a vigência)', async () => {
    await comoRef(async (c) => {
      await sincronizarReferencia(c, lida(), conf, { hoje: D1, inicioCarga: INICIO }, S);
      // dspd_ref: UPDATE de qualquer coluna fora de vigente_ate é falta de privilégio (42501), em todas as 4 tabelas de vigência da F2
      for (const [t, col, chave] of [
        ['ref_coluna', 'nome', "quadro_id = '9025'"], ['ref_coluna', 'papel', "quadro_id = '9025'"], ['ref_coluna', 'motivo', "quadro_id = '9025'"],
        ['ref_workflow', 'nivel', "quadro_id = '9025'"], ['ref_tipo_card', 'categoria', "tipo_id = '9101'"], ['ref_quadro', 'nivel', "quadro_id = '9025'"],
      ] as const) {
        const e = await falha(c, `UPDATE ${S.bm}.${t} SET ${col} = ${col} WHERE ${chave}`);
        expect(e.code, `${t}.${col}`).toBe('42501');
      }
      expect((await falha(c, `DELETE FROM ${S.bm}.ref_coluna WHERE quadro_id = '9025'`)).code).toBe('42501');
      // fechar a vigência é permitido nas 4 tabelas
      for (const [t, chave] of [['ref_coluna', "quadro_id = '9025' AND coluna_id = '2530'"], ['ref_workflow', "quadro_id = '9025' AND workflow_id = '193'"],
        ['ref_tipo_card', "tipo_id = '9101'"], ['ref_quadro', "quadro_id = '9025'"]] as const) {
        const r = await c.query(`UPDATE ${S.bm}.${t} SET vigente_ate = '${D2}' WHERE vigente_ate IS NULL AND ${chave}`);
        expect(r.rowCount, t).toBe(1);
      }
    });
    // gatilho (ref_workflow e ref_tipo_card), com o dono dos objetos: só NULL -> data; o resto dá 55000
    const c = await dono.connect();
    try {
      await c.query('BEGIN');
      await sincronizarReferencia(c, lida(), conf, { hoje: D1, inicioCarga: INICIO }, S);
      for (const [t, set, chave] of [
        ['ref_workflow', "nome = 'x'", "quadro_id = '9025' AND workflow_id = '191'"], ['ref_workflow', "nivel = 'story'", "quadro_id = '9025' AND workflow_id = '191'"],
        ['ref_tipo_card', "nome = 'x'", "tipo_id = '9101'"],
        ['ref_workflow', `vigente_ate = '${D2}', nome = 'x'`, "quadro_id = '9025' AND workflow_id = '191'"],
      ] as const) {
        const e = await falha(c, `UPDATE ${S.bm}.${t} SET ${set} WHERE ${chave}`);
        expect(e.code, `${t} ${set}`).toBe('55000');
      }
      expect((await falha(c, `DELETE FROM ${S.bm}.ref_tipo_card WHERE tipo_id = '9101'`)).code).toBe('55000');
      expect((await falha(c, `TRUNCATE ${S.bm}.ref_workflow`)).code).toBe('55000');
      await c.query(`UPDATE ${S.bm}.ref_workflow SET vigente_ate = '${D2}' WHERE quadro_id = '9025' AND workflow_id = '191'`);
      // vigência já fechada não reabre
      expect((await falha(c, `UPDATE ${S.bm}.ref_workflow SET vigente_ate = NULL WHERE quadro_id = '9025' AND workflow_id = '191'`)).code).toBe('55000');
    } finally {
      await c.query('ROLLBACK');
      c.release();
    }
  });

  it('CT-4 coletor lê as ref_ mas não escreve: INSERT e UPDATE em ref_coluna, ref_workflow e ref_tipo_card dão 42501 (privilégio, antes de qualquer dado)', async () => {
    expect(await n(coletor, `SELECT count(*)::int AS n FROM ${S.bm}.ref_coluna`)).toBeGreaterThanOrEqual(0);
    expect(await n(coletor, `SELECT count(*)::int AS n FROM ${S.bm}.ref_tipo_card`)).toBeGreaterThanOrEqual(0);
    const tent = async (sql: string): Promise<string | undefined> => {
      try {
        await coletor.query(sql);
      } catch (e) {
        return (e as { code?: string }).code;
      }
      return undefined;
    };
    expect(await tent(`INSERT INTO ${S.bm}.ref_coluna (quadro_id, coluna_id, nome, ordem, vigente_de) VALUES ('9025', '1', 'N', 0, '${D1}')`)).toBe('42501');
    expect(await tent(`UPDATE ${S.bm}.ref_coluna SET vigente_ate = '${D1}' WHERE quadro_id = '9025'`)).toBe('42501');
    expect(await tent(`INSERT INTO ${S.bm}.ref_workflow (quadro_id, workflow_id, nome, tipo_api, nivel, vigente_de) VALUES ('9025', '1', 'W', 0, 'story', '${D1}')`)).toBe('42501');
    expect(await tent(`INSERT INTO ${S.bm}.ref_tipo_card (tipo_id, nome, eh_item, categoria, vigente_de) VALUES ('9114', 'T', true, 'produto', '${D1}')`)).toBe('42501');
    expect(await tent(`INSERT INTO ${S.core}.ref_versao_criterio_metrica (versao_id, metrica_id) VALUES (1, 'O1')`)).toBe('42501');
  });

  it('CT-5 mudança de processo: fecha vigências (gatilho e grant), abre a nova na data com motivo, e a versão de critério tem as 12 métricas (inclui EI_FL1)', async () => {
    await comoRef(async (c) => {
      await sincronizarReferencia(c, lida(), conf, { hoje: D1, inicioCarga: INICIO }, S);
      const depois = lida({
        wf191: WF191.map((x) => (x[0] === 2534 ? [2534, 'Concluído', 3, 1] as Col : x)), // folha de entrega vira seção 3 (papel muda)
        workflows: [{ workflow_id: 191, name: 'Iniciativas', type: 0 }, { workflow_id: 192, name: 'Time A', type: 0 }, { workflow_id: 193, name: 'Linha', type: 2 }], // 191: feature -> story
        tipos: [{ type_id: 9101, name: 'Story' }, { type_id: 9102, name: 'Sprint' }, { type_id: 9103, name: 'Bug' }], // 9103: produto -> bug_interno
      });
      const r = await sincronizarReferencia(c, depois, conf, { hoje: D2, inicioCarga: INICIO, motivo: 'processo', agora: new Date('2026-11-03T09:00:00Z') }, S);
      expect(r.marca).toBe(true);
      expect(r.fechadas).toBe(3);
      expect(r.mudancas.map((m) => `${m.tabela} ${m.chave} ${m.classe}`).sort()).toEqual([
        'ref_coluna 9025|2534 semantica', 'ref_tipo_card 9103 semantica', 'ref_workflow 9025|191 processo',
      ]);
      for (const [t, chave] of [['ref_coluna', "quadro_id = '9025' AND coluna_id = '2534'"], ['ref_workflow', "quadro_id = '9025' AND workflow_id = '191'"],
        ['ref_tipo_card', "tipo_id = '9103'"]] as const) {
        const v = await c.query(`SELECT vigente_de, vigente_ate FROM ${S.bm}.${t} WHERE ${chave} ORDER BY vigente_de`);
        expect(v.rows, t).toEqual([{ vigente_de: INICIO, vigente_ate: D2 }, { vigente_de: D2, vigente_ate: null }]);
      }
      const col = await c.query(`SELECT motivo, papel, section FROM ${S.bm}.ref_coluna WHERE quadro_id = '9025' AND coluna_id = '2534' AND vigente_ate IS NULL`);
      expect(col.rows).toEqual([{ motivo: 'processo', papel: 'trabalho', section: 3 }]);
      const versao = await c.query<{ vigente_desde: string; metrica_id: string }>(
        `SELECT v.vigente_desde, m.metrica_id FROM ${S.core}.ref_versao_criterio v JOIN ${S.core}.ref_versao_criterio_metrica m ON m.versao_id = v.versao_id
          WHERE v.dominio = 'businessmap' AND v.referencia = $1 ORDER BY m.metrica_id`, [`plano-052-F2:processo:${D2}`]);
      expect(versao.rows.map((x) => x.metrica_id)).toEqual([...METRICAS_DO_FLUXO].sort());
      expect(versao.rows.map((x) => x.metrica_id)).toContain('EI_FL1');
      expect(new Set(versao.rows.map((x) => x.vigente_desde))).toEqual(new Set([D2]));
      // segunda execução no mesmo dia, sem mudança nova: nada é gravado e a versão não se duplica
      const outra = await sincronizarReferencia(c, depois, conf, { hoje: D2, inicioCarga: INICIO, motivo: 'processo' }, S);
      expect(outra).toMatchObject({ inseridas: 0, fechadas: 0, marca: false });
      expect(await n(c, `SELECT count(*)::int AS n FROM ${S.core}.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = $1`, [`plano-052-F2:processo:${D2}`])).toBe(1);
      expect(await n(c, `SELECT count(*)::int AS n FROM ${S.core}.ref_versao_criterio_metrica m JOIN ${S.core}.ref_versao_criterio v ON v.versao_id = m.versao_id WHERE v.referencia = $1`, [`plano-052-F2:processo:${D2}`])).toBe(12);
    });
  });

  it('CT-6 só o limite de WIP muda: processo marcado só no O1; correção vale sem marca e grava motivo correcao', async () => {
    await comoRef(async (c) => {
      await sincronizarReferencia(c, lida(), conf, { hoje: D1, inicioCarga: INICIO }, S);
      const limite = lida({ wf191: WF191.map((x) => (x[0] === 2533 ? [2533, 'Em Homologação', 3, 1, { limite: 7 }] as Col : x)) });
      const r = await sincronizarReferencia(c, limite, conf, { hoje: D2, inicioCarga: INICIO }, S);
      expect(r.marca).toBe(true);
      const m = await c.query<{ metrica_id: string }>(
        `SELECT m.metrica_id FROM ${S.core}.ref_versao_criterio_metrica m JOIN ${S.core}.ref_versao_criterio v ON v.versao_id = m.versao_id WHERE v.referencia = $1`, [`plano-052-F2:processo:${D2}`]);
      expect(m.rows).toEqual([{ metrica_id: 'O1' }]);
      expect((await c.query(`SELECT limite_wip, motivo FROM ${S.bm}.ref_coluna WHERE quadro_id = '9025' AND coluna_id = '2533' AND vigente_ate IS NULL`)).rows).toEqual([{ limite_wip: 7, motivo: 'processo' }]);
      // correção (papel muda por erro de mapeamento): sem marca de critério
      const corrigida = lida({ wf191: WF191.map((x) => (x[0] === 2533 ? [2533, 'Em Homologação', 3, 1, { limite: 7 }] as Col : x[0] === 2534 ? [2534, 'Concluído', 5, 1] as Col : x)) });
      const antes = await n(c, `SELECT count(*)::int AS n FROM ${S.core}.ref_versao_criterio WHERE dominio = 'businessmap'`);
      const r2 = await sincronizarReferencia(c, corrigida, conf, { hoje: '2026-11-04', inicioCarga: INICIO, motivo: 'correcao' }, S);
      expect(r2).toMatchObject({ marca: false, fechadas: 1 });
      expect(await n(c, `SELECT count(*)::int AS n FROM ${S.core}.ref_versao_criterio WHERE dominio = 'businessmap'`)).toBe(antes);
      expect((await c.query(`SELECT motivo FROM ${S.bm}.ref_coluna WHERE quadro_id = '9025' AND coluna_id = '2534' AND vigente_ate IS NULL`)).rows).toEqual([{ motivo: 'correcao' }]);
    });
  });

  it('CT-7 comparação de datas (date como texto): no mesmo dia ou antes da vigência aberta a recusa é ErroReferencia vigencia, nunca violação de PK; sem motivo nada é gravado', async () => {
    await comoRef(async (c) => {
      await sincronizarReferencia(c, lida(), conf, { hoje: D1, inicioCarga: INICIO }, S);
      const vig = (await carregarVigentes(c, [Q], S)).ref_coluna;
      expect(vig).toHaveLength(9);
      expect(vig.every((l) => l.vigente_de === INICIO)).toBe(true); // o pool do projeto devolve date como texto AAAA-MM-DD, o que a comparação espera
      // correção em D2 (sem marca de critério): abre vigência em D2 para a coluna 2534
      const corrigida = lida({ wf191: WF191.map((x) => (x[0] === 2534 ? [2534, 'Concluído', 5, 1] as Col : x)) });
      await sincronizarReferencia(c, corrigida, conf, { hoje: D2, inicioCarga: INICIO, motivo: 'correcao' }, S);
      const outra = lida({ wf191: WF191.map((x) => (x[0] === 2534 ? [2534, 'Concluído', 3, 1] as Col : x)) });
      const antes = await contar(c, 'ref_coluna');
      for (const dia of [D2, D1, INICIO]) {
        await c.query('SAVEPOINT v');
        const e = await sincronizarReferencia(c, outra, conf, { hoje: dia, inicioCarga: INICIO, motivo: 'correcao' }, S).catch((x: unknown) => x);
        await c.query('ROLLBACK TO SAVEPOINT v');
        expect(e, dia).toBeInstanceOf(ErroReferencia);
        expect((e as ErroReferencia).tipo, dia).toBe('vigencia');
      }
      // sem motivo informado: recusa antes de gravar qualquer coisa
      const sem = await sincronizarReferencia(c, outra, conf, { hoje: '2026-11-04', inicioCarga: INICIO }, S).catch((x: unknown) => x);
      expect((sem as ErroReferencia).tipo).toBe('motivo');
      expect(await contar(c, 'ref_coluna')).toBe(antes);
    });
  });

  it('CT-8 contagem pelo dspd_coletor: INSERT na primeira vez, UPDATE na segunda (sem duplicar), só número em ctl_coleta_contagem', async () => {
    const coleta = await novaColeta(dono, S.bm);
    await registrarFolhasSemConferencia(coletor, coleta, 3, S);
    await registrarFolhasSemConferencia(coletor, coleta, 5, S);
    const r = await dono.query(`SELECT entidade, lidos, inseridos, ja_existentes, falhas FROM ${S.bm}.ctl_coleta_contagem WHERE coleta_id = $1`, [coleta]);
    expect(r.rows).toEqual([{ entidade: ENTIDADE_SEM_CONFERENCIA, lidos: 5, inseridos: 0, ja_existentes: 0, falhas: 0 }]);
    await registrarFolhasSemConferencia(coletor, coleta, 0, S);
    expect((await dono.query(`SELECT lidos FROM ${S.bm}.ctl_coleta_contagem WHERE coleta_id = $1`, [coleta])).rows).toEqual([{ lidos: 0 }]);
    // o coletor não apaga nem muda outra coluna da contagem
    const e = await coletor.query(`DELETE FROM ${S.bm}.ctl_coleta_contagem WHERE coleta_id = $1`, [coleta]).catch((x: { code: string }) => x.code);
    expect(e).toBe('42501');
  });

  it('CT-9 critério de pronto da F2: nenhuma folha sem papel e sem motivo; folha nova fora das listas entra pela regra e é contada', async () => {
    await comoRef(async (c) => {
      await sincronizarReferencia(c, lida(), conf, { hoje: D1, inicioCarga: INICIO }, S);
      const sem = await n(c, `SELECT count(*)::int AS n FROM ${S.bm}.ref_coluna WHERE quadro_id = $1 AND vigente_ate IS NULL AND eh_folha AND papel IS NULL AND NOT eh_descarte`, [QS]);
      expect(sem).toBe(0);
      expect(await n(c, `SELECT count(*)::int AS n FROM ${S.bm}.ref_coluna WHERE quadro_id = $1 AND vigente_ate IS NULL AND eh_folha AND eh_descarte AND papel IS NOT NULL`, [QS])).toBe(0);
      // folha nova no quadro (id fora do arquivo de conferência): entra pela regra e é contada; segunda coleta no mesmo dia não conta de novo
      const nova = lida({ wf191: [...WF191, [2599, 'Revisão Nova', 3, 1]] });
      const r = await sincronizarReferencia(c, nova, conf, { hoje: D2, inicioCarga: INICIO }, S);
      expect(r.semConferencia).toBe(1);
      expect(r.inseridas).toBe(1);
      expect((await c.query(`SELECT papel, tipo_coluna FROM ${S.bm}.ref_coluna WHERE quadro_id = $1 AND coluna_id = '2599'`, [QS])).rows).toEqual([{ papel: 'trabalho', tipo_coluna: 'execucao' }]);
      const repete = await sincronizarReferencia(c, nova, conf, { hoje: D2, inicioCarga: INICIO }, S);
      expect(repete).toMatchObject({ inseridas: 0, semConferencia: 0 });
      // folha sem seção: sem papel, contada em folhasSemPapel (não vira papel por inferência)
      const semSecao = lida({ wf191: [...WF191, [2598, 'Sem seção', 9, 1]] });
      const r3 = await sincronizarReferencia(c, semSecao, conf, { hoje: '2026-11-04', inicioCarga: INICIO }, S);
      expect(r3.folhasSemPapel).toBe(1);
      expect((await c.query(`SELECT papel, section FROM ${S.bm}.ref_coluna WHERE quadro_id = $1 AND coluna_id = '2598'`, [QS])).rows).toEqual([{ papel: null, section: null }]);
      // chaves que somem do quadro são contadas e a vigência delas não é fechada
      const menos = lida({ wf191: WF191.filter((x) => x[0] !== 2530) });
      const r4 = await sincronizarReferencia(c, menos, conf, { hoje: '2026-11-05', inicioCarga: INICIO }, S);
      expect(r4.ausentes.ref_coluna).toBeGreaterThanOrEqual(1);
      expect(await n(c, `SELECT count(*)::int AS n FROM ${S.bm}.ref_coluna WHERE quadro_id = $1 AND coluna_id = '2530' AND vigente_ate IS NULL`, [QS])).toBe(1);
    });
    // a contagem vai pelo coletor, do jeito que a F3 fará
    const coleta = await novaColeta(dono, S.bm);
    await registrarFolhasSemConferencia(coletor, coleta, 1, S);
    expect((await dono.query(`SELECT lidos FROM ${S.bm}.ctl_coleta_contagem WHERE coleta_id = $1 AND entidade = $2`, [coleta, ENTIDADE_SEM_CONFERENCIA])).rows).toEqual([{ lidos: 1 }]);
  });

  it('CT-10 rollback: erro real do banco no meio da carga (id inválido no INSERT de tipo) desfaz quadro, workflows, colunas e versão', async () => {
    const antesVersao = await n(dono, `SELECT count(*)::int AS n FROM ${S.core}.ref_versao_criterio WHERE referencia = $1`, [conf.versao_criterio.referencia]);
    const c = await ref.connect();
    let erro: { code?: string } | undefined;
    try {
      await c.query('BEGIN');
      const quebrado: Consultavel = {
        query: (texto, valores) =>
          c.query(texto, /INSERT INTO \S*\.ref_tipo_card/.test(texto) ? ['9101 com espaço', ...(valores ?? []).slice(1)] : valores) as never,
      };
      await sincronizarReferencia(quebrado, lida(), conf, { hoje: D1, inicioCarga: INICIO }, S);
    } catch (e) {
      erro = e as { code?: string };
    } finally {
      await c.query('ROLLBACK');
      c.release();
    }
    expect(erro?.code).toBe('23514');
    for (const t of ['ref_quadro', 'ref_workflow', 'ref_coluna']) expect(await contar(dono, t), t).toBe(0);
    expect(await n(dono, `SELECT count(*)::int AS n FROM ${S.bm}.ref_tipo_card WHERE tipo_id IN ('9101','9102','9103')`)).toBe(0);
    expect(await n(dono, `SELECT count(*)::int AS n FROM ${S.core}.ref_versao_criterio WHERE referencia = $1`, [conf.versao_criterio.referencia])).toBe(antesVersao);
  });

  it('CT-11 lerColunas depois da carga e montarBaseBM: colunas homônimas ganham Nome (id) e a dimensão e as transições dão o mesmo rótulo', async () => {
    await comoRef(async (c) => {
      await sincronizarReferencia(c, lida(), conf, { hoje: D1, inicioCarga: INICIO }, S);
      const colunas = (await lerColunas(c, S)).filter((l) => l.quadro_id === QS);
      expect(colunas.filter((l) => l.nome === 'Backlog').map((l) => l.coluna_id).sort()).toEqual(['2530', '2540']);
      const base = montarBaseBM({
        cards: [], bloqueios: [], colunas,
        transicoes: [{ card_id: 'c1', quadro_id: QS, coluna_origem_id: '2530', coluna_destino_id: '2541', tipo_coluna: 'execucao', direcao: 'avanco', ocorrido_em: 1_700_000_000_000 } as never,
          { card_id: 'c2', quadro_id: QS, coluna_origem_id: '2540', coluna_destino_id: '2541', tipo_coluna: 'execucao', direcao: 'avanco', ocorrido_em: 1_700_000_000_000 } as never],
        ref: { equipes: [], sistemas: [], limitesWip: [], limiteFrentes: null, sle: [], alocacao: [], objetivos: [], areasInternas: [], fichas: [], criterios: [] },
      } satisfies LinhasBM);
      const dim = base.colunas.filter((x) => x.quadro_id === QS).map((x) => x.coluna);
      expect(dim).toContain('Backlog (2530)');
      expect(dim).toContain('Backlog (2540)');
      expect(dim).toContain('Fazendo'); // nome único no quadro: rótulo de sempre
      expect(base.transicoes.map((t) => t.coluna_origem)).toEqual(['Backlog (2530)', 'Backlog (2540)']);
      expect(base.transicoes.every((t) => t.coluna_destino === 'Fazendo')).toBe(true);
      for (const t of base.transicoes) expect(dim).toContain(t.coluna_origem);
    });
  });
});
