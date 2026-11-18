import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { INATIVOS, NOMES_NOVOS, REFERENCIA_VERSAO, REGISTRADO_POR, REGISTRADO_POR_CARGA, UNIFICADOS, ddl } from '../migrations/0043_bm_nomes_times.js';
import { vigenteEm } from '../src/modulos/businessmap/referencia.js';
import { poolDe, S, url } from './pg/ctx.js';

const d = describe.skipIf(!url);
const VIGENTE = 'vigente_ate IS NULL';
const TODOS = [...NOMES_NOVOS.map((n) => [n[0], n[1]] as const), ...INATIVOS];

type LinhaTime = { time_id: number; vigente_de: string; vigente_ate: string | null; nome: string; ativo: boolean; motivo: string; registrado_por: string };

/** Pedido 098, E4 (lote B1): a migração 0043 (já aplicada pelo `globalSetup`), seu `up` recusado e seu `down`. */
d('0043: nomes reais dos times (pedido 098, E4)', () => {
  let dono: pg.Pool;
  beforeAll(() => { dono = poolDe(); });
  afterAll(async () => { await dono.end(); });

  const versoesDoTime = async (id: number): Promise<LinhaTime[]> =>
    (await dono.query<LinhaTime>(
      `SELECT time_id, vigente_de, vigente_ate, nome, ativo, motivo, registrado_por FROM ${S.bm}.ref_time WHERE time_id = $1 ORDER BY vigente_de`, [id])).rows;

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
  const rodar = async (c: pg.PoolClient, instrucoes: string[]): Promise<void> => { for (const i of instrucoes) await c.query(i); };
  /** Roda e devolve o erro (desfeito por savepoint); falha o teste se não houver erro. */
  async function recusa(c: pg.PoolClient, instrucoes: string[]): Promise<Error> {
    await c.query('SAVEPOINT recusa');
    try {
      await rodar(c, instrucoes);
    } catch (e) {
      await c.query('ROLLBACK TO SAVEPOINT recusa');
      return e as Error;
    }
    throw new Error('esperava falha');
  }
  const nGravadas = async (c: pg.PoolClient): Promise<number> =>
    Number((await c.query<{ n: string }>(
      `SELECT (SELECT count(*) FROM ${S.bm}.ref_time WHERE registrado_por = $1) + (SELECT count(*) FROM ${S.bm}.ref_time_workflow WHERE registrado_por = $1) AS n`, [REGISTRADO_POR])).rows[0]!.n);

  it('T-B1.1: 48 times ativos com o nome da tabela (45 + os 3 já nomeados), 24 e 25 inativos, nenhum ativo "Workflow <id>"', async () => {
    const v = await dono.query<{ time_id: number; nome: string; ativo: boolean }>(
      `SELECT time_id, nome, ativo FROM ${S.bm}.ref_time WHERE ${VIGENTE} ORDER BY time_id`);
    expect(v.rows).toHaveLength(50);
    expect(v.rows.filter((r) => r.ativo)).toHaveLength(48);
    for (const [id, , nome] of NOMES_NOVOS) expect(v.rows.find((r) => r.time_id === id), `time ${id}`).toMatchObject({ nome, ativo: true });
    for (const [id, w] of INATIVOS) expect(v.rows.find((r) => r.time_id === id), `time ${id}`).toMatchObject({ nome: `Workflow ${w}`, ativo: false });
    expect(v.rows.filter((r) => r.ativo && /^Workflow \d+$/.test(r.nome))).toEqual([]);
  });
  it('T-B1.1: a versão antiga fica intacta, só com vigente_ate; a nova abre no mesmo dia, como correção, sem métrica', async () => {
    for (const [id, w] of TODOS) {
      const [antiga, nova, ...resto] = await versoesDoTime(id);
      expect(resto, `time ${id}`).toEqual([]);
      expect(antiga, `time ${id}`).toMatchObject({ nome: `Workflow ${w}`, ativo: true, motivo: 'carga_inicial', registrado_por: REGISTRADO_POR_CARGA });
      expect(antiga!.vigente_ate, `time ${id}`).toBe(nova!.vigente_de);
      expect(nova, `time ${id}`).toMatchObject({ vigente_ate: null, motivo: 'correcao', registrado_por: REGISTRADO_POR });
    }
    for (const id of [1, 2, 3]) expect(await versoesDoTime(id), `time ${id}`).toHaveLength(1);
    const ver = await dono.query<{ n: number; sem_metrica: boolean; dominio: string }>(
      `SELECT count(*)::int AS n, bool_and(NOT EXISTS (SELECT 1 FROM ${S.core}.ref_versao_criterio_metrica m WHERE m.versao_id = v.versao_id)) AS sem_metrica, min(v.dominio) AS dominio
         FROM ${S.core}.ref_versao_criterio v WHERE v.referencia = $1`, [REFERENCIA_VERSAO]);
    expect(ver.rows[0]).toEqual({ n: 1, sem_metrica: true, dominio: 'businessmap' });
    const g = await dono.query<{ n: number }>(`SELECT count(*)::int AS n FROM ${S.bm}.ref_time WHERE registrado_por = $1`, [REGISTRADO_POR]);
    expect(g.rows[0]!.n).toBe(47);
  });
  it('T-B1.1: a lista gravada tem só nome de time (nenhum nome de pessoa: os nomes são os da tabela do plano, e só eles)', async () => {
    const r = await dono.query<{ nome: string }>(`SELECT nome FROM ${S.bm}.ref_time WHERE registrado_por = $1 AND ativo ORDER BY time_id`, [REGISTRADO_POR]);
    expect(r.rows.map((x) => x.nome)).toEqual(NOMES_NOVOS.map((n) => n[2]));
  });
  it('T-B1.4 (dado): wf 127 aponta para o time 20 e wf 220 para o 10; as vigências antigas (times 24 e 25) ficam fechadas e intactas; contagens vigentes iguais', async () => {
    for (const [w, q, t] of UNIFICADOS) {
      const v = (await dono.query<{ time_id: number; quadro_id: string; situacao: string; motivo: string; vigente_ate: string | null; registrado_por: string }>(
        `SELECT time_id, quadro_id, situacao, motivo, vigente_ate, registrado_por FROM ${S.bm}.ref_time_workflow WHERE workflow_id = $1 ORDER BY vigente_de`, [w])).rows;
      expect(v, `wf ${w}`).toHaveLength(2);
      expect(v[0], `wf ${w}`).toMatchObject({ time_id: w === '127' ? 24 : 25, quadro_id: q, situacao: 'time', motivo: 'carga_inicial', registrado_por: REGISTRADO_POR_CARGA });
      expect(v[0]!.vigente_ate).not.toBeNull();
      expect(v[1], `wf ${w}`).toMatchObject({ time_id: t, quadro_id: q, situacao: 'time', motivo: 'correcao', vigente_ate: null, registrado_por: REGISTRADO_POR });
    }
    const c = await dono.query<{ situacao: string; n: number }>(`SELECT situacao, count(*)::int AS n FROM ${S.bm}.ref_time_workflow WHERE ${VIGENTE} GROUP BY 1 ORDER BY 1`);
    expect(c.rows).toEqual([{ situacao: 'fora', n: 13 }, { situacao: 'time', n: 50 }]);
    const orfa = await dono.query(`SELECT 1 FROM ${S.bm}.ref_time_workflow w WHERE w.situacao = 'time' AND w.${VIGENTE} AND NOT EXISTS (SELECT 1 FROM ${S.bm}.ref_time t WHERE t.time_id = w.time_id AND t.${VIGENTE} AND t.ativo)`);
    expect(orfa.rows).toEqual([]);
  });
  it('T-B1.3: vigenteEm num dia anterior à migração devolve o nome novo (correção vale para todo o período)', async () => {
    const versoes = await versoesDoTime(5);
    const partida = versoes[0]!.vigente_de;
    const novo = NOMES_NOVOS.find((n) => n[0] === 5)![2];
    expect(vigenteEm(versoes, partida)?.nome).toBe(novo);
    expect(vigenteEm(versoes, versoes[1]!.vigente_de)?.nome).toBe(novo);
    // o workflow 127 também: no dia de partida já vale o time 20
    const tw = (await dono.query<{ vigente_de: string; motivo: string; time_id: number }>(
      `SELECT vigente_de, motivo, time_id FROM ${S.bm}.ref_time_workflow WHERE workflow_id = '127'`)).rows;
    expect(vigenteEm(tw, partida)?.time_id).toBe(20);
  });
  it('T-B1.2: rodar o up de novo (os 47 já renomeados) aborta e não grava nada; a mensagem cita só os time_id', async () => {
    await emTransacao(async (c) => {
      const antes = await nGravadas(c);
      const e = await recusa(c, ddl(S).up);
      expect(e.message).toMatch(/times fora do estado esperado .*: 4, 5, 6,/);
      for (const [, , nome] of NOMES_NOVOS) expect(e.message).not.toContain(nome);
      expect(await nGravadas(c)).toBe(antes);
    });
  });
  it('T-B1.2: um só dos 47 fora do estado (nome diferente do provisório) aborta o up, cita só esse time_id e nada é gravado', async () => {
    await emTransacao(async (c) => {
      await rodar(c, ddl(S).down);
      await c.query(`UPDATE ${S.bm}.ref_time SET vigente_ate = current_date WHERE time_id = 5 AND ${VIGENTE}`);
      await c.query(
        `INSERT INTO ${S.bm}.ref_time (time_id, vigente_de, nome, ativo, motivo, versao_id, registrado_por)
         VALUES (5, current_date, 'Renomeado antes', true, 'processo', (SELECT max(versao_id) FROM ${S.core}.ref_versao_criterio), 'teste')`);
      const e = await recusa(c, ddl(S).up);
      expect(e.message).toMatch(/times fora do estado esperado \(nome provisório e workflow da lista\): 5$/);
      expect(e.message).not.toContain('Renomeado antes');
      expect(await nGravadas(c)).toBe(0);
    });
  });
  it('T-B1.2: time ativo fora de 1 a 50 aborta o up (o slug único só foi conferido para a lista)', async () => {
    await emTransacao(async (c) => {
      await rodar(c, ddl(S).down);
      await c.query(
        `INSERT INTO ${S.bm}.ref_time (time_id, vigente_de, nome, ativo, motivo, versao_id, registrado_por)
         VALUES (900, current_date, 'Time novo', true, 'processo', (SELECT max(versao_id) FROM ${S.core}.ref_versao_criterio), 'teste')`);
      const e = await recusa(c, ddl(S).up);
      expect(e.message).toMatch(/times ativos fora de 1 a 50 .*: 900$/);
      expect(await nGravadas(c)).toBe(0);
    });
  });
  it('T-B1.2: times 1 a 3 com o nome mudado aborta o up (conferência SQL do slug dos já nomeados)', async () => {
    await emTransacao(async (c) => {
      await rodar(c, ddl(S).down);
      await c.query(`UPDATE ${S.bm}.ref_time SET vigente_ate = current_date WHERE time_id = 2 AND ${VIGENTE}`);
      await c.query(
        `INSERT INTO ${S.bm}.ref_time (time_id, vigente_de, nome, ativo, motivo, versao_id, registrado_por)
         VALUES (2, current_date, 'Outro nome', true, 'correcao', (SELECT max(versao_id) FROM ${S.core}.ref_versao_criterio), 'teste')`);
      const e = await recusa(c, ddl(S).up);
      expect(e.message).toMatch(/times 1 a 3 fora do estado esperado: 2$/);
      expect(await nGravadas(c)).toBe(0);
    });
  });
  it('T-B1.5: o down volta ao estado da 0019 (nomes provisórios, vigências reabertas, versão removida) e o up refaz o mesmo estado', async () => {
    await emTransacao(async (c) => {
      const foto = async (): Promise<unknown> =>
        (await c.query(`SELECT time_id, nome, ativo, vigente_ate IS NULL AS vigente FROM ${S.bm}.ref_time ORDER BY time_id, vigente_de`)).rows;
      const depois = await foto();
      await rodar(c, ddl(S).down);
      const v = await c.query<{ time_id: number; nome: string; ativo: boolean }>(`SELECT time_id, nome, ativo FROM ${S.bm}.ref_time WHERE ${VIGENTE} ORDER BY time_id`);
      expect(v.rows).toHaveLength(50);
      for (const [id, w] of TODOS) expect(v.rows.find((r) => r.time_id === id), `time ${id}`).toMatchObject({ nome: `Workflow ${w}`, ativo: true });
      const w = await c.query<{ workflow_id: string; time_id: number }>(`SELECT workflow_id, time_id FROM ${S.bm}.ref_time_workflow WHERE workflow_id IN ('127','220') AND ${VIGENTE} ORDER BY 1`);
      expect(w.rows).toEqual([{ workflow_id: '127', time_id: 24 }, { workflow_id: '220', time_id: 25 }]);
      expect(await nGravadas(c)).toBe(0);
      const ver = await c.query(`SELECT 1 FROM ${S.core}.ref_versao_criterio WHERE referencia = $1`, [REFERENCIA_VERSAO]);
      expect(ver.rows).toEqual([]);
      // o gatilho de vigência voltou a valer dentro do down
      await c.query('SAVEPOINT g');
      await expect(c.query(`DELETE FROM ${S.bm}.ref_time WHERE time_id = 4`)).rejects.toMatchObject({ code: '55000' });
      await c.query('ROLLBACK TO SAVEPOINT g');
      await rodar(c, ddl(S).up);
      expect(await foto()).toEqual(depois);
    });
  });
  it('T-B1.5: o down falha com vigência posterior (nova vigência de um dos times, ou fechamento de uma vigência da correção)', async () => {
    await emTransacao(async (c) => {
      await c.query(`UPDATE ${S.bm}.ref_time SET vigente_ate = current_date WHERE time_id = 5 AND ${VIGENTE}`);
      await c.query(
        `INSERT INTO ${S.bm}.ref_time (time_id, vigente_de, nome, ativo, motivo, versao_id, registrado_por)
         VALUES (5, current_date + 1, 'Nome posterior', true, 'processo', (SELECT max(versao_id) FROM ${S.core}.ref_versao_criterio), 'tela-057')`);
      const e = await recusa(c, ddl(S).down);
      expect(e.message).toMatch(/vigências posteriores à 0043/);
      expect(await nGravadas(c)).toBeGreaterThan(0);
    });
    await emTransacao(async (c) => {
      // só o fechamento de uma vigência da correção já conta como posterior
      await c.query(`UPDATE ${S.bm}.ref_time_workflow SET vigente_ate = current_date WHERE workflow_id = '127' AND ${VIGENTE}`);
      const e = await recusa(c, ddl(S).down);
      expect(e.message).toMatch(/vigências posteriores à 0043/);
    });
  });
});
