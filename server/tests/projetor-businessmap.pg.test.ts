import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TIMES_PROPRIOS } from '../migrations/0019_bm_carga_inicial_times.js';
import { revisionIdDaTransicao } from '../src/modulos/businessmap/allow-list.js';
import { coletarCards } from '../src/modulos/businessmap/coleta.js';
import { projetarBusinessMap, TABELAS_LIMPAS_NA_RECONSTRUCAO } from '../src/modulos/businessmap/projetor.js';
import { gravarStgCard, gravarStgRevision } from '../src/modulos/businessmap/staging.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { criarPool, urlDoPapel } from '../src/plataforma/db/pool.js';
import { criarClienteHttp } from '../src/plataforma/http.js';
import { cenarioVazio, subirServidorBm, type Cartao } from './businessmap-coleta-duble.js';
import { poolDe, url } from './pg/ctx.js';

// F4 do plano 052 contra PostgreSQL real, num conjunto de schemas só deste arquivo (a referência e os cards daqui não aparecem em
// nenhum outro teste). Papel `dspd_coletor` para projetar e `dspd_api` para os grants. O BusinessMap é o servidor falso.
const d = describe.skipIf(!url);
const Q = '9101';
const W1 = '91001'; const WF = '91002'; const WX = '91003'; const W2 = '91004'; const WP = '91005';
// nomes de time das constantes da migração 0019 (não inventados)
const [TIME_A, TIME_B, TIME_C] = TIMES_PROPRIOS.map((t) => t[2]) as [string, string, string];
const COL = { B: 91011, C: 91012, F: 91013, P: 91014, E: 91015, D: 91016, A: 91017, FF: 91021, FX: 91031, F2: 91041, FP: 91051 };
const TIPO = { bug: 91101, produto: 91102, sprint: 91103 };
const T0 = Date.parse('2026-09-01T12:00:00Z');
const t = (dias: number, hora = 10): string => new Date(T0 + dias * 86_400_000 + (hora - 12) * 3_600_000).toISOString().replace('T', ' ').slice(0, 19);

d('F4 do plano 052: projetor contra PostgreSQL', () => {
  const prefixo = prefixoDeTeste();
  const E = montarEsquemas(prefixo);
  let dono: pg.Pool, coletor: pg.Pool, api: pg.Pool;
  let relogio = new Date('2026-11-02T12:00:00Z');
  const agora = () => relogio;
  const avancar = (): void => { relogio = new Date(relogio.getTime() + 3_600_000); };
  let seq = 0;
  let coletaDeTeste = 0;

  const unico = async <T>(sql: string, params: unknown[] = []): Promise<T> => (await dono.query(sql, params)).rows[0] as T;
  const n = async (tabela: string, onde = 'true', params: unknown[] = []): Promise<number> =>
    Number((await dono.query<{ n: string }>(`SELECT count(*) AS n FROM ${E.bm}.${tabela} WHERE ${onde}`, params)).rows[0]!.n);

  beforeAll(async () => {
    await migrar(url!, { prefixo });
    dono = poolDe();
    coletor = criarPool(urlDoPapel(url!, 'dspd_coletor', process.env.DSPD_PWD_COLETOR ?? 'coletor_dev'), { max: 4 });
    api = criarPool(urlDoPapel(url!, 'dspd_api', process.env.DSPD_PWD_API ?? 'api_dev'), { max: 2 });
    const versao = (await dono.query<{ versao_id: string }>(
      `INSERT INTO ${E.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
       VALUES ('2020-01-01', 'businessmap', 'teste f4', 'teste f4', 'teste-f4', now()) RETURNING versao_id`)).rows[0]!.versao_id;
    const rastro = [`'carga_inicial'`, versao, `'teste'`].join(', ');
    for (const [id, nome] of [[9001, TIME_A], [9002, TIME_B], [9003, TIME_C]] as const) {
      await dono.query(`INSERT INTO ${E.bm}.ref_time (time_id, vigente_de, nome, ativo, motivo, versao_id, registrado_por) VALUES (${id}, '2020-01-01', '${nome}', true, ${rastro})`);
    }
    const tw = (wf: string, time: string, de: string, ate: string | null, situacao = 'time'): string =>
      `INSERT INTO ${E.bm}.ref_time_workflow (workflow_id, vigente_de, vigente_ate, quadro_id, time_id, situacao, motivo_fora, motivo, versao_id, registrado_por)
       VALUES ('${wf}', '${de}', ${ate === null ? 'NULL' : `'${ate}'`}, '${Q}', ${time}, '${situacao}', ${situacao === 'fora' ? `'fora_de_todo_calculo'` : 'NULL'}, ${rastro})`;
    for (const sql of [
      tw(W1, '9001', '2020-01-01', null), tw(WF, '9001', '2020-01-01', null), tw(WX, 'NULL', '2020-01-01', null, 'fora'),
      tw(W2, '9002', '2020-01-01', '2026-06-01'), tw(W2, '9003', '2026-06-01', null),
    ]) await dono.query(sql);
    for (const [w, nivel, tipo] of [[W1, 'story', 0], [WF, 'feature', 1], [WX, 'story', 0], [W2, 'story', 0], [WP, 'projeto', 0]] as const) {
      await dono.query(`INSERT INTO ${E.bm}.ref_workflow (quadro_id, workflow_id, vigente_de, nome, tipo_api, nivel) VALUES ('${Q}', '${w}', '2020-01-01', 'WF ${w}', ${tipo}, '${nivel}')`);
    }
    const coluna = async (id: number, wf: string, section: number, papel: string | null, tipo: string | null, ordem: number, descarte = false): Promise<void> => {
      await dono.query(
        `INSERT INTO ${E.bm}.ref_coluna (quadro_id, coluna_id, vigente_de, nome, tipo_coluna, papel, ordem, workflow_id, section, flow_type, eh_folha, eh_descarte)
         VALUES ($1, $2, '2020-01-01', $3, $4, $5, $6, $7, $8, $9, true, $10)`, [Q, String(id), `Coluna ${id}`, tipo, papel, ordem, wf, section, tipo === 'fila' ? 2 : tipo === 'execucao' ? 1 : null, descarte]);
    };
    await coluna(COL.B, W1, 1, 'backlog', 'fila', 1); await coluna(COL.C, W1, 2, 'compromisso', 'fila', 2);
    await coluna(COL.F, W1, 3, 'trabalho', 'execucao', 3); await coluna(COL.P, W1, 3, 'trabalho', 'fila', 4);
    await coluna(COL.E, W1, 4, 'entrega', 'execucao', 5); await coluna(COL.D, W1, 4, null, null, 6, true);
    await coluna(COL.A, W1, 5, 'entrega', 'fila', 7); await coluna(COL.FF, WF, 3, 'trabalho', 'execucao', 1);
    await coluna(COL.FX, WX, 3, 'trabalho', 'execucao', 1); await coluna(COL.FP, WP, 3, 'trabalho', 'execucao', 1); await coluna(COL.F2, W2, 3, 'trabalho', 'execucao', 1);
    for (const [id, nome, item, cat] of [[TIPO.bug, 'Bug', true, 'bug_interno'], [TIPO.produto, 'Story', true, 'produto'], [TIPO.sprint, 'Sprint', false, null]] as const) {
      await dono.query(`INSERT INTO ${E.bm}.ref_tipo_card (tipo_id, vigente_de, nome, eh_item, categoria) VALUES ($1, '2020-01-01', $2, $3, $4)`, [String(id), nome, item, cat]);
    }
    coletaDeTeste = Number((await dono.query<{ coleta_id: string }>(
      `INSERT INTO ${E.bm}.ctl_coleta (tarefa, iniciado_em, status, versao_coletor) VALUES ('reconciliacao', now(), 'em_andamento', 'teste') RETURNING coleta_id`)).rows[0]!.coleta_id);
  });
  afterAll(async () => {
    await Promise.all([coletor.end(), api.end()]);
    for (const e of [E.bm, E.ac, E.core]) await dono.query(`DROP SCHEMA IF EXISTS ${e} CASCADE`);
    await dono.end();
  });

  const transicao = (coluna: number, inicio: string, fim: string | null = null, wf = W1): Cartao =>
    ({ board_id: Number(Q), workflow_id: Number(wf), lane_id: 1, column_id: coluna, section: 3, start: inicio, end: fim });
  /** Grava o card e as transições no staging pelos gravadores da F3 (a allow-list vale), como a coleta faria. */
  async function staging(c: Cartao, transicoes: Cartao[] = [], quando = relogio): Promise<string> {
    const id = String(c.card_id);
    await gravarStgCard(coletor, { idOrigem: id, card: c, coletaId: coletaDeTeste, agora: quando, quadroId: Q, arquivado: false, excluidoDetectado: false }, E);
    for (const tr of transicoes) await gravarStgRevision(coletor, { cardId: id, revisionId: revisionIdDaTransicao(tr)!, revisao: tr, tipo: 'transicao', coletaId: coletaDeTeste, agora: quando }, E);
    return id;
  }
  const novo = (extra: Cartao = {}): Cartao => ({
    card_id: 800_000_000 + ++seq, title: 'Card de teste', type_id: TIPO.bug, created_at: '2026-08-20T10:00:00Z', board_id: Number(Q), workflow_id: Number(W1), column_id: COL.F, ...extra,
  });
  const projetar = (extra: Record<string, unknown> = {}) => { avancar(); return projetarBusinessMap({ pool: coletor, S: E, agora, ...extra }); };
  const dim = (id: string) => unico<Record<string, unknown>>(`SELECT * FROM ${E.bm}.dim_card WHERE card_id = $1`, [id]);
  const iso = (v: unknown): string | null => (v === null ? null : (v as Date).toISOString());
  const falha = async (p: pg.Pool, sql: string): Promise<{ code?: string }> => {
    try { await p.query(sql); } catch (e) { return e as { code?: string }; }
    throw new Error(`esperava falha do banco: ${sql}`);
  };

  it('H-9, H-10, 4.1: do staging para dim_card, fato_transicao (fonte revision), evt_card e dim_card_versao, com tipo e direção; controle e contagens só com números', async () => {
    const id = await staging(novo(), [
      transicao(COL.B, t(0)), transicao(COL.C, t(1)), transicao(COL.F, t(2)), transicao(COL.P, t(3)), transicao(COL.F, t(4)), transicao(COL.C, t(5)), transicao(COL.E, t(6)),
    ]);
    const r = await projetar();
    expect(r.transicoes.inseridas).toBeGreaterThanOrEqual(7);
    const c = await dim(id);
    expect(c).toMatchObject({ tipo: 'Bug interno', granularidade: 'story', equipe: TIME_A, quadro_id: Q, coluna_atual_id: String(COL.F), motivo_descarte: null });
    expect([iso(c.criado_em), iso(c.comprometido_em), iso(c.iniciado_em), iso(c.concluido_em)]).toEqual([
      '2026-08-20T10:00:00.000Z', `${t(1).replace(' ', 'T')}.000Z`, `${t(2).replace(' ', 'T')}.000Z`, `${t(6).replace(' ', 'T')}.000Z`]);
    const f = (await dono.query<Record<string, unknown>>(`SELECT * FROM ${E.bm}.fato_transicao WHERE card_id = $1 ORDER BY ocorrido_em`, [id])).rows;
    expect(f.map((x) => [x.coluna_origem_id, x.coluna_destino_id, x.tipo_coluna, x.direcao, x.fonte])).toEqual([
      [null, String(COL.B), 'fila', 'avanco', 'revision'], [String(COL.B), String(COL.C), 'fila', 'avanco', 'revision'],
      [String(COL.C), String(COL.F), 'execucao', 'avanco', 'revision'], [String(COL.F), String(COL.P), 'fila', 'avanco', 'revision'],
      [String(COL.P), String(COL.F), 'execucao', 'retorno', 'revision'], [String(COL.F), String(COL.C), 'fila', 'retorno', 'revision'],
      [String(COL.C), String(COL.E), 'execucao', 'avanco', 'revision'],
    ]);
    expect((await dono.query(`SELECT tipo FROM ${E.bm}.evt_card WHERE card_id = $1`, [id])).rows).toEqual([{ tipo: 'criado' }]);
    expect(await n('dim_card_versao', 'card_id = $1', [id])).toBe(1);
    const ctl = await unico<{ status: string; tarefa: string; versao_coletor: string }>(`SELECT status, tarefa, versao_coletor FROM ${E.bm}.ctl_coleta WHERE coleta_id = $1`, [r.coletaId]);
    expect(ctl).toEqual({ status: 'sucesso', tarefa: 'projecao', versao_coletor: 'bm-f4/1' });
    const entidades = (await dono.query<{ entidade: string }>(`SELECT entidade FROM ${E.bm}.ctl_coleta_contagem WHERE coleta_id = $1`, [r.coletaId])).rows.map((x) => x.entidade);
    expect(entidades).toEqual(expect.arrayContaining(['projecao_card', 'projecao_transicao', 'projecao_evento', 'projecao_versao']));
    expect(entidades.every((e) => /^[a-z_]+$/.test(e))).toBe(true);
  });

  it('idempotência: projetar de novo não duplica nem altera fato, evento nem versão já gravados', async () => {
    const id = await staging(novo(), [transicao(COL.C, t(1)), transicao(COL.F, t(2), t(3)), transicao(COL.E, t(3))]);
    await projetar();
    const antes = {
      fatos: (await dono.query(`SELECT transicao_sk, coluna_origem_id, ocorrido_em, coleta_id FROM ${E.bm}.fato_transicao ORDER BY transicao_sk`)).rows,
      eventos: await n('evt_card'), versoes: (await dono.query(`SELECT card_versao_sk, vigente_de, coleta_id FROM ${E.bm}.dim_card_versao ORDER BY card_versao_sk`)).rows,
      card: await dim(id),
    };
    const r = await projetar();
    expect(r).toMatchObject({ versoes: 0, eventos: { inseridos: 0 }, transicoes: { inseridas: 0 } });
    expect((await dono.query(`SELECT transicao_sk, coluna_origem_id, ocorrido_em, coleta_id FROM ${E.bm}.fato_transicao ORDER BY transicao_sk`)).rows).toEqual(antes.fatos);
    expect(await n('evt_card')).toBe(antes.eventos);
    expect((await dono.query(`SELECT card_versao_sk, vigente_de, coleta_id FROM ${E.bm}.dim_card_versao ORDER BY card_versao_sk`)).rows).toEqual(antes.versoes);
    const depois = await dim(id);
    expect({ ...depois, coletado_em: null, atualizado_por_coleta_id: null }).toEqual({ ...antes.card, coletado_em: null, atualizado_por_coleta_id: null });
  });

  it('transição aberta e depois fechada são duas linhas no staging e um fato só; fechar depois não duplica', async () => {
    const aberta = transicao(COL.F, t(2));
    const id = await staging(novo(), [aberta]);
    await projetar();
    await staging(novo({ card_id: Number(id) }), [{ ...aberta, end: t(3) }], relogio);
    expect(await n('stg_revision', 'card_id = $1', [id])).toBe(2);
    await projetar();
    expect(await n('fato_transicao', 'card_id = $1', [id])).toBe(1);
  });

  it('SCD2 (U-2): mudança de atributo gera versão nova com vigente_de posterior, a anterior fica; a projeção mostra a vigente', async () => {
    const id = await staging(novo(), [transicao(COL.F, t(2))]);
    await projetar();
    const v1 = await unico<{ vigente_de: Date; coluna_atual_id: string }>(`SELECT vigente_de, coluna_atual_id FROM ${E.bm}.dim_card_versao WHERE card_id = $1`, [id]);
    await staging(novo({ card_id: Number(id), column_id: COL.P, title: 'Card renomeado' }), [transicao(COL.F, t(2)), transicao(COL.P, t(3))], new Date(relogio.getTime() + 60_000));
    await projetar();
    const versoes = (await dono.query<{ vigente_de: Date; coluna_atual_id: string; titulo: string }>(`SELECT vigente_de, coluna_atual_id, titulo FROM ${E.bm}.dim_card_versao WHERE card_id = $1 ORDER BY vigente_de`, [id])).rows;
    expect(versoes).toHaveLength(2);
    expect(versoes[0]).toMatchObject({ coluna_atual_id: v1.coluna_atual_id, titulo: 'Card de teste' });
    expect(versoes[0]!.vigente_de.getTime()).toBe(v1.vigente_de.getTime());
    expect(versoes[1]!.vigente_de.getTime()).toBeGreaterThan(versoes[0]!.vigente_de.getTime());
    expect(await dim(id)).toMatchObject({ coluna_atual_id: String(COL.P), titulo: 'Card renomeado' });
    const r = await projetar();
    expect(r.versoes).toBe(0);
  });

  it('H-1 e U-2: nível pelo workflow e time do instante da entrega; card entregue antes de mudar de workflow conta onde entregou', async () => {
    const frente = await staging(novo({ type_id: TIPO.produto, workflow_id: Number(WF), column_id: COL.FF }), [transicao(COL.FF, t(2), null, WF)]);
    const entregueDepoisMudou = await staging(novo(), [transicao(COL.E, t(2)), transicao(COL.FF, t(9), null, WF)]);
    const abertoMudou = await staging(novo(), [transicao(COL.F, t(2)), transicao(COL.FF, t(9), null, WF)]);
    await projetar();
    expect(await dim(frente)).toMatchObject({ granularidade: 'frente', tipo: 'Trabalho de produto', equipe: TIME_A });
    expect(await dim(entregueDepoisMudou)).toMatchObject({ granularidade: 'story', equipe: TIME_A });
    expect(await dim(abertoMudou)).toMatchObject({ granularidade: 'frente' });
  });

  it('A1 do review (H-1): projeto e frente sem time na referência recebem a granularidade, com equipe nula', async () => {
    const projeto = await staging(novo({ workflow_id: Number(WP), column_id: COL.FP }), [transicao(COL.FP, t(2), null, WP)]);
    await projetar();
    expect(await dim(projeto)).toMatchObject({ granularidade: 'projeto', equipe: null });
  });

  it('U-1 e U-2: o time da tabela vigente no dia do evento (workflow que mudou de time em 2026-06-01)', async () => {
    const antes = await staging(novo({ workflow_id: Number(W2), column_id: COL.F2 }), [transicao(COL.F2, '2026-05-20 10:00:00', null, W2)]);
    const depois = await staging(novo({ workflow_id: Number(W2), column_id: COL.F2 }), [transicao(COL.F2, '2026-06-20 10:00:00', null, W2)]);
    await projetar();
    expect([(await dim(antes)).equipe, (await dim(depois)).equipe]).toEqual([TIME_B, TIME_C]);
  });

  it('H-2: Sprint não é item (sem tipo nem granularidade, fora da leitura da API); filho de Sprint não tem card_pai e filho de outro tem', async () => {
    const sprint = await staging(novo({ type_id: TIPO.sprint }), [transicao(COL.F, t(2))]);
    const filhoDeSprint = await staging(novo({ linked_cards: [{ card_id: Number(sprint), link_type: 'parent' }] }), [transicao(COL.F, t(2))]);
    const pai = await staging(novo({ type_id: TIPO.produto }), [transicao(COL.F, t(2))]);
    const filho = await staging(novo({ linked_cards: [{ card_id: Number(pai), link_type: 'parent' }] }), [transicao(COL.F, t(2))]);
    await projetar();
    expect(await dim(sprint)).toMatchObject({ tipo: null, granularidade: null });
    expect((await dim(filhoDeSprint)).card_pai).toBeNull();
    expect((await dim(filho)).card_pai).toBe(pai);
    // a leitura do painel (cartões com tipo e granularidade) não traz o Sprint
    const lidos = (await api.query<{ card_id: string }>(`SELECT card_id FROM ${E.bm}.dim_card WHERE granularidade IS NOT NULL AND tipo IS NOT NULL AND card_id = ANY($1::text[])`, [[sprint, filho]])).rows;
    expect(lidos.map((x) => x.card_id)).toEqual([filho]);
  });

  it('H-7: card de workflow fora de todo cálculo fica na base e nos fatos, sem granularidade nem equipe', async () => {
    const id = await staging(novo({ workflow_id: Number(WX), column_id: COL.FX }), [transicao(COL.FX, t(2), null, WX)]);
    await projetar();
    expect(await dim(id)).toMatchObject({ granularidade: null, equipe: null, tipo: 'Bug interno' });
    expect(await n('fato_transicao', 'card_id = $1', [id])).toBe(1);
  });

  it('H-11: entrada em Descartado descarta (mesmo na seção 4), não entrega, e a biblioteca lê como descartado; descarte nativo vale pelo instante', async () => {
    const coluna = await staging(novo(), [transicao(COL.F, t(2)), transicao(COL.D, t(5))]);
    const nativo = await staging(novo({ discarded_at: '2026-09-03T10:00:00Z' }), [transicao(COL.F, t(2))]);
    await projetar();
    const c = await dim(coluna);
    expect(c).toMatchObject({ motivo_descarte: 'coluna_descartado', concluido_em: null });
    expect(iso(c.arquivado_em)).toBe(`${t(5).replace(' ', 'T')}.000Z`);
    expect(await dim(nativo)).toMatchObject({ motivo_descarte: 'descarte_nativo' });
    expect((await dono.query(`SELECT tipo_coluna, direcao FROM ${E.bm}.fato_transicao WHERE card_id = $1 AND coluna_destino_id = $2`, [coluna, String(COL.D)])).rows).toEqual([{ tipo_coluna: null, direcao: 'avanco' }]);
  });

  it('H-23: sem seção 2 o compromisso é a primeira entrada na seção 3; sem seção 4 a entrega é a primeira na seção 5', async () => {
    const id = await staging(novo(), [transicao(COL.B, t(0)), transicao(COL.F, t(2)), transicao(COL.A, t(7))]);
    await projetar();
    const c = await dim(id);
    expect([iso(c.comprometido_em), iso(c.concluido_em)]).toEqual([`${t(2).replace(' ', 'T')}.000Z`, `${t(7).replace(' ', 'T')}.000Z`]);
  });

  it('card sem data de criação fica só no staging; transição sem instante é contada; nenhum valor vai ao controle', async () => {
    const sem = await staging(novo({ created_at: 'sem data' }), [transicao(COL.F, t(2))]);
    const ruim = await staging(novo(), [transicao(COL.F, 'quando?'), transicao(COL.E, t(3))]);
    const r = await projetar();
    expect(await n('dim_card', 'card_id = $1', [sem])).toBe(0);
    expect(r.semCriacao).toBeGreaterThanOrEqual(1);
    expect(r.transicoes.semInstante).toBeGreaterThanOrEqual(1);
    expect(await n('fato_transicao', 'card_id = $1', [ruim])).toBe(1);
    const texto = JSON.stringify((await dono.query(`SELECT * FROM ${E.bm}.ctl_coleta_contagem WHERE coleta_id = $1`, [r.coletaId])).rows);
    expect(texto).not.toMatch(/quando\?|sem data/);
  });

  it('grants: dspd_api lê a projeção, mas não os responsáveis de dim_card nem de dim_card_versao, nem por SELECT *', async () => {
    const id = await staging(novo(), [transicao(COL.F, t(2))]);
    await projetar({ responsaveis: new Map([[id, ['7001', '7002']]]) });
    expect((await api.query(`SELECT card_id, tipo, granularidade, equipe FROM ${E.bm}.dim_card WHERE card_id = $1`, [id])).rows).toHaveLength(1);
    for (const sql of [
      `SELECT responsaveis FROM ${E.bm}.dim_card`, `SELECT * FROM ${E.bm}.dim_card`, `SELECT responsaveis FROM ${E.bm}.dim_card_versao`,
      `SELECT * FROM ${E.bm}.dim_card_versao`, `SELECT responsavel_id FROM ${E.bm}.dim_responsavel`, `SELECT * FROM ${E.bm}.dim_responsavel`,
    ]) expect(await falha(api, sql)).toMatchObject({ code: '42501' });
    expect(await unico<{ responsaveis: string[] }>(`SELECT responsaveis FROM ${E.bm}.dim_card WHERE card_id = $1`, [id])).toEqual({ responsaveis: ['7001', '7002'] });
    expect(await unico<{ responsaveis: string[] }>(`SELECT responsaveis FROM ${E.bm}.dim_card_versao WHERE card_id = $1`, [id])).toEqual({ responsaveis: ['7001', '7002'] });
  });

  it('o coletor só insere nos fatos e nas versões: UPDATE e DELETE de evt_card, fato_transicao e dim_card_versao são negados', async () => {
    for (const sql of [
      `DELETE FROM ${E.bm}.fato_transicao`, `UPDATE ${E.bm}.fato_transicao SET direcao = 'avanco'`, `DELETE FROM ${E.bm}.evt_card`, `UPDATE ${E.bm}.evt_card SET tipo = 'criado'`,
      `DELETE FROM ${E.bm}.dim_card_versao`, `UPDATE ${E.bm}.dim_card_versao SET titulo = 'x'`, `TRUNCATE ${E.bm}.dim_card_versao`,
    ]) expect(await falha(coletor, sql)).toMatchObject({ code: '42501' });
  });

  it('I-2: os responsáveis lidos pela coleta da mesma execução entram em dim_card e na versão; mudança de dono sem mudar o staging gera versão nova pelo gravarResponsaveis', async () => {
    const servidor = await subirServidorBm({
      ...cenarioVazio(),
      cards: { [`${Q}|active`]: [{ card_id: 800_100_001, title: 'Card I2', type_id: TIPO.bug, created_at: '2026-08-20T10:00:00Z', board_id: Number(Q), workflow_id: Number(W1), column_id: COL.F, owner_user_id: 5, co_owner_ids: [6], last_modified: '2026-10-30T10:00:00Z' }] },
    });
    try {
      const cliente = criarClienteHttp({ urlBase: servidor.url, apikey: 'chave-f4-de-teste-0123456789', limitePorMinuto: 1000, timeoutMs: 2000 }, { dormir: () => Promise.resolve() });
      const lerEProjetar = async (inicio: string): Promise<void> => {
        const responsaveis = new Map<string, string[]>();
        avancar();
        await coletarCards({ cliente, pool: coletor, S: E, quadros: [Number(Q)], hostBase: 'bm.f4.test', agora, responsaveis }, { tipo: 'carga_inicial', inicio });
        await projetar({ responsaveis });
      };
      await lerEProjetar('2025-11-01');
      expect(await unico(`SELECT responsaveis FROM ${E.bm}.dim_card WHERE card_id = '800100001'`)).toEqual({ responsaveis: ['5', '6'] });
      expect(await n('dim_card_versao', "card_id = '800100001'")).toBe(1);
      // outro dono, mesmo staging (o responsável nunca está no staging): entra versão nova, a anterior fica
      (servidor.cenario.cards[`${Q}|active`]![0] as Cartao).owner_user_id = 8;
      await lerEProjetar('2025-11-02');
      expect(await n('stg_card', "id_origem = '800100001'")).toBe(1);
      expect((await dono.query(`SELECT responsaveis FROM ${E.bm}.dim_card_versao WHERE card_id = '800100001' ORDER BY vigente_de`)).rows).toEqual([{ responsaveis: ['5', '6'] }, { responsaveis: ['6', '8'] }]);
      expect(await unico(`SELECT responsaveis FROM ${E.bm}.dim_card WHERE card_id = '800100001'`)).toEqual({ responsaveis: ['6', '8'] });
      // projetar sem a coleta (sem mapa) nunca apaga o conjunto gravado
      await projetar();
      expect(await unico(`SELECT responsaveis FROM ${E.bm}.dim_card WHERE card_id = '800100001'`)).toEqual({ responsaveis: ['6', '8'] });
    } finally {
      await servidor.fechar();
    }
  });

  it('DT-1: reconstruir a projeção preserva dim_responsavel (mesmas linhas, nomes e atualizado_em) e os responsáveis do card, com zero chamadas a /users', async () => {
    const id = await staging(novo(), [transicao(COL.F, t(2)), transicao(COL.E, t(3))]);
    await projetar({ responsaveis: new Map([[id, ['7101']]]) });
    await coletor.query(`INSERT INTO ${E.bm}.dim_responsavel (responsavel_id, responsavel_nome, atualizado_em) VALUES ('7101', 'NOME-MARCADOR-F4', '2026-09-30T08:00:00Z'), ('7102', 'OUTRO-NOME-MARCADOR', '2026-10-15T08:00:00Z')`);
    const resp = () => dono.query(`SELECT responsavel_id, responsavel_nome, atualizado_em FROM ${E.bm}.dim_responsavel ORDER BY responsavel_id`).then((r) => r.rows);
    const antes = { resp: await resp(), fatos: await n('fato_transicao'), versoes: await n('dim_card_versao'), cards: await n('dim_card') };
    const servidor = await subirServidorBm(cenarioVazio());
    try {
      const r = await projetar({ reconstruir: true });
      expect(r.cards).toBeGreaterThan(0);
      expect(await resp()).toEqual(antes.resp);
      expect(await n('dim_responsavel')).toBe(2);
      expect(await unico(`SELECT responsaveis FROM ${E.bm}.dim_card WHERE card_id = $1`, [id])).toEqual({ responsaveis: ['7101'] });
      expect([await n('fato_transicao'), await n('dim_card_versao'), await n('dim_card')]).toEqual([antes.fatos, antes.versoes, antes.cards]);
      // o projetor não tem cliente HTTP: o servidor falso não recebe nada, e a lista de tabelas limpas não tem dim_responsavel
      expect(servidor.pedidos).toHaveLength(0);
      expect([...TABELAS_LIMPAS_NA_RECONSTRUCAO]).not.toContain('dim_responsavel');
    } finally {
      await servidor.fechar();
    }
  });
});
