import type pg from 'pg';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { coletarCards, type DepsColeta } from '../src/modulos/businessmap/coleta.js';
import { analisarArgumentos, etapaReferencia, executarColeta, type DepsComando } from '../src/modulos/businessmap/coleta-comando.js';
import { lerConferencia } from '../src/modulos/businessmap/conferencia.js';
import type { ClienteLike, PoolLike } from '../src/plataforma/db/pool.js';
import { criarClienteHttp } from '../src/plataforma/http.js';
import { cenarioVazio, subirServidorBm, type Cartao, type Cenario, type ServidorBm } from './businessmap-coleta-duble.js';
import { novaColeta, poolDe, S, url } from './pg/ctx.js';

// QA da F3 do plano 052 (E2.49): os quatro casos que o review (E2.48) mandou provar contra PostgreSQL real, mais o papel do
// coletor na carga retomada. BusinessMap = servidor falso; nenhuma chamada real, nenhum .env. Quadros próprios (9028 referência,
// 9029 cards): o arquivo da F3 do autor conta linhas por quadro e não pode ver as daqui. Cada teste usa um `inicio` próprio,
// porque a retomada da carga olha a última carga de todos os quadros.
const d = describe.skipIf(!url);
const QR = 9028;
const QC = 9029;
const base = 700_000_000 + Math.floor(Math.random() * 90_000_000);
let proximo = 0;
const card = (extra: Cartao = {}): Cartao => ({ card_id: base + ++proximo, title: 'Card QA', type_id: 3, last_modified: '2026-10-30T10:00:00Z', ...extra });
const trans = (coluna: number | null, start: string | null, end: string | null): Cartao => ({
  board_id: QC, workflow_id: 90290, lane_id: 1, ...(coluna === null ? {} : { column_id: coluna }), section: 3, ...(start === null ? {} : { start }), end,
});

const estrutura = (secao1: number, secao2: number): Record<string, unknown> => ({
  [`/boards/${QR}/currentStructure`]: {
    data: {
      columns: {
        '90281': { name: 'Fazendo', section: secao1, flow_type: 1, parent_column_id: 0, workflow_id: 90280, limit: 0 },
        '90282': { name: 'Feito', section: secao2, flow_type: 1, parent_column_id: 0, workflow_id: 90280, limit: 0 },
      },
      child_columns: {}, workflows: { '90280': { name: 'WF', top_columns: [90281, 90282], bottom_columns: [90281, 90282] } },
    },
  },
  [`/boards/${QR}/workflows`]: { data: [{ workflow_id: 90280, name: 'Projetos QA', type: 0 }] },
  '/cardTypes': { data: [{ type_id: 90281, name: 'Tipo QA' }] },
});

d('QA da F3 (E2.49): motivo por chave, transição inválida, incremental com arquivados e descartados, falha no meio da página', () => {
  let dono: pg.Pool, coletor: pg.Pool, ref: pg.Pool;
  const servidores: ServidorBm[] = [];
  beforeAll(() => { dono = poolDe(); coletor = poolDe('dspd_coletor'); ref = poolDe('dspd_ref'); });
  afterEach(async () => { for (const s of servidores.splice(0)) await s.fechar(); });
  afterAll(async () => {
    // as coletas daqui não podem aparecer no estado de coleta dos outros testes (tarefa coleta_incremental); o staging fica (append-only)
    await dono.query(`DELETE FROM ${S.core}.outbox WHERE payload ->> 'coletaId' IN (SELECT coleta_id::text FROM ${S.bm}.ctl_coleta WHERE versao_coletor = 'bm-f3/1')`);
    await dono.query(`UPDATE ${S.bm}.ctl_coleta SET tarefa = 'reconciliacao' WHERE versao_coletor = 'bm-f3/1'`);
    await Promise.all([dono, coletor, ref].map((p) => p.end()));
  });

  const cliente = (servidor: ServidorBm) => criarClienteHttp({ urlBase: servidor.url, apikey: 'chave-qa-f3-de-teste-0123456789', limitePorMinuto: 1000, timeoutMs: 2000 }, { dormir: () => Promise.resolve() });
  async function servidor(cenario: Cenario): Promise<ServidorBm> {
    const s = await subirServidorBm(cenario);
    servidores.push(s);
    return s;
  }
  const deps = (s: ServidorBm, agora: () => Date, pool: PoolLike = coletor): DepsColeta => ({ cliente: cliente(s), pool, S, quadros: [QC], hostBase: 'bm.qa.test', agora });
  const n = async (sql: string, params: unknown[] = []): Promise<number> => Number((await dono.query<{ n: string }>(sql, params)).rows[0]!.n);
  const em = (iso: string) => () => new Date(iso);

  // ---------- (a) --motivo-chave com as chaves pendentes, contra o banco ----------
  /** O papel de referência numa transação externa que nunca confirma: BEGIN/COMMIT/ROLLBACK do comando viram SAVEPOINT (as tabelas de vigência não aceitam DELETE). */
  function poolRefEmSavepoint(c: pg.PoolClient): PoolLike {
    const q = (t: string, v?: unknown[]) => c.query(t, v) as unknown as Promise<{ rows: never[]; rowCount: number | null }>;
    const troca: Record<string, string> = { BEGIN: 'SAVEPOINT qa_ref', COMMIT: 'RELEASE SAVEPOINT qa_ref', ROLLBACK: 'ROLLBACK TO SAVEPOINT qa_ref' };
    return {
      query: q, end: () => Promise.resolve(),
      connect: () => Promise.resolve({ query: (t: string, v?: unknown[]) => q(troca[t] ?? t, v), release: () => undefined } satisfies ClienteLike),
    };
  }
  const depsComando = (s: ServidorBm, poolRef: PoolLike, agora: () => Date): DepsComando => ({
    cliente: cliente(s), poolColetor: coletor, poolRef, conf: lerConferencia(), quadros: [QR], hostBase: 'bm.qa.test', agora, S,
  });

  it('CT-A: mudança de significado só grava quando TODAS as chaves pendentes têm motivo; a chave dita sai das pendentes; processo e correção por chave vão para a linha certa', async () => {
    const c = await ref.connect();
    await c.query('BEGIN');
    try {
      const pool = poolRefEmSavepoint(c);
      const colunas = async () => (await c.query<{ coluna_id: string; section: number; motivo: string | null; vigente_ate: string | null }>(
        `SELECT coluna_id, section, motivo, vigente_ate FROM ${S.bm}.ref_coluna WHERE quadro_id = $1 ORDER BY coluna_id, vigente_de`, [String(QR)])).rows;
      // carga inicial da referência (estrutura v1), pelo mesmo caminho do comando
      const s1 = await servidor({ ...cenarioVazio(), corpos: estrutura(3, 4) });
      await etapaReferencia(depsComando(s1, pool, em('2026-11-02T12:00:00Z')), '2026-11-02', '2025-06-01', undefined)(await novaColeta(dono, S.bm));
      expect((await colunas()).map((l) => [l.coluna_id, l.section, l.vigente_ate])).toEqual([['90281', 3, null], ['90282', 4, null]]);

      // o quadro muda: as duas colunas trocam de seção (significado do cálculo). Sem motivo nenhum: as duas ficam pendentes e nada grava
      const s2 = await servidor({ ...cenarioVazio(), corpos: estrutura(2, 3) });
      const rodar = (opcoes: string[], inicio: string) => executarColeta(depsComando(s2, pool, em('2026-11-03T12:00:00Z')), analisarArgumentos(['carga-inicial', `--inicio=${inicio}`, ...opcoes]));
      const r1 = await rodar([], '2025-07-01');
      expect(r1.motivosPendentes).toEqual([`ref_coluna:${QR}|90281`, `ref_coluna:${QR}|90282`]);
      expect(r1.falhas).toEqual({ 'referencia-motivo': 1 });
      expect((await colunas()).map((l) => [l.coluna_id, l.section, l.vigente_ate])).toEqual([['90281', 3, null], ['90282', 4, null]]);

      // o operador cola uma das chaves da saída: a dita sai da lista, a outra segue pendente e AINDA nada grava (tudo ou nada)
      const r2 = await rodar([`--motivo-chave=ref_coluna:${QR}|90281=correcao`], '2025-07-01');
      expect(r2.motivosPendentes).toEqual([`ref_coluna:${QR}|90282`]);
      expect((await colunas()).map((l) => [l.coluna_id, l.section, l.vigente_ate])).toEqual([['90281', 3, null], ['90282', 4, null]]);

      // motivo de OUTRA chave (que não é pendente) não resolve nada
      const r3 = await rodar([`--motivo-chave=ref_coluna:${QR}|99999=processo`], '2025-07-01');
      expect(r3.motivosPendentes).toHaveLength(2);

      // as duas chaves ditas: grava, fecha a vigência antiga (sem apagar) e abre a nova com o motivo da própria chave
      const r4 = await rodar([`--motivo-chave=ref_coluna:${QR}|90281=correcao`, `--motivo-chave=ref_coluna:${QR}|90282=processo`], '2025-07-01');
      expect(r4.motivosPendentes).toEqual([]);
      expect(r4.estado).toBe('sucesso');
      expect(r4.referencia).toMatchObject({ fechadas: 2 });
      expect(await colunas()).toEqual([
        { coluna_id: '90281', section: 3, motivo: null, vigente_ate: '2026-11-03' }, { coluna_id: '90281', section: 2, motivo: 'correcao', vigente_ate: null },
        { coluna_id: '90282', section: 4, motivo: null, vigente_ate: '2026-11-03' }, { coluna_id: '90282', section: 3, motivo: 'processo', vigente_ate: null },
      ]);
      // as falhas das rodadas pendentes ficaram no controle só com o código
      expect(await n(`SELECT count(*)::int AS n FROM ${S.bm}.ctl_coleta_falha WHERE coleta_id = $1 AND entidade = 'referencia' AND erro = 'referencia-motivo' AND id_origem IS NULL`, [r1.coletaId])).toBe(1);
    } finally {
      await c.query('ROLLBACK');
      c.release();
    }
  });

  // ---------- (b) transição inválida: coleta parcial e sem marca d'água ----------
  it('CT-B: transição sem coluna ou sem entrada vira falha só com o id do card; a coleta fecha parcial, sem marca d\'água; o resto do card e a transição válida ficam', async () => {
    const c = card({ transitions: [trans(90291, '2026-10-01 10:00:00', null), trans(null, '2026-10-02 10:00:00', null), trans(90292, '', null), trans(90292, null, null)] });
    const outro = card({ transitions: [trans(90291, '2026-10-03 10:00:00', null)] });
    const s = await servidor({ ...cenarioVazio(), cards: { [`${QC}|active`]: [c, outro] } });
    const r = await coletarCards(deps(s, em('2026-11-04T12:00:00Z')), { tipo: 'carga_inicial', inicio: '2025-08-01' });
    expect(r.estado).toBe('parcial');
    expect(r.falhas).toEqual({ 'transicao-invalida': 3 });
    expect(r.streams.find((x) => x.estado === 'active')!.transicoes).toEqual({ lidas: 5, inseridas: 2, jaExistentes: 0, invalidas: 3 });
    const linha = await dono.query<{ status: string; marca_dagua_ate: Date | null; erro_resumo: string }>(`SELECT status, marca_dagua_ate, erro_resumo FROM ${S.bm}.ctl_coleta WHERE coleta_id = $1`, [r.coletaId]);
    expect(linha.rows[0]).toEqual({ status: 'parcial', marca_dagua_ate: null, erro_resumo: 'desconhecido: 3 falha(s) (transicao-invalida)' });
    const f = await dono.query<{ entidade: string; id_origem: string; erro: string }>(`SELECT entidade, id_origem, erro FROM ${S.bm}.ctl_coleta_falha WHERE coleta_id = $1`, [r.coletaId]);
    expect(f.rows).toEqual(Array(3).fill({ entidade: `card_${QC}_active`, id_origem: String(c.card_id), erro: 'transicao-invalida' }));
    expect(await n(`SELECT count(*)::int AS n FROM ${S.bm}.stg_card WHERE id_origem = ANY($1::text[])`, [[String(c.card_id), String(outro.card_id)]])).toBe(2);
    expect(await n(`SELECT count(*)::int AS n FROM ${S.bm}.stg_revision WHERE card_id = ANY($1::text[])`, [[String(c.card_id), String(outro.card_id)]])).toBe(2);
    expect(await n(`SELECT falhas AS n FROM ${S.bm}.ctl_coleta_contagem WHERE coleta_id = $1 AND entidade = $2`, [r.coletaId, `transicao_${QC}_active`])).toBe(3);
    // a falha não carrega valor de transição nem de card (só o código e o id)
    const texto = JSON.stringify((await dono.query(`SELECT * FROM ${S.bm}.ctl_coleta_falha WHERE coleta_id = $1`, [r.coletaId])).rows);
    expect(texto).not.toMatch(/2026-10-0|Card QA/);
  });

  // ---------- (d) falha no meio de uma página ----------
  /** Coletor que falha no N-ésimo INSERT em stg_card (erro de banco simulado no meio da página); o resto vai ao banco real. */
  function coletorQueFalha(noInsert: number): PoolLike {
    let vistos = 0;
    const filtro = (cx: { query: (t: string, v?: unknown[]) => Promise<unknown> }) => async (t: string, v?: unknown[]) => {
      if (t.startsWith(`INSERT INTO ${S.bm}.stg_card`) && ++vistos === noInsert) throw new Error('falha simulada no meio da página');
      return cx.query(t, v);
    };
    return {
      query: filtro(coletor) as never, end: () => Promise.resolve(),
      connect: async () => { const cx = await coletor.connect(); return { query: filtro(cx) as never, release: (x?: boolean | Error) => cx.release(x as boolean) }; },
    };
  }

  it('CT-D: falha no meio da página desfaz a página inteira (cards e transições), o parametros fica na página anterior, a retomada fecha sem duplicar e a marca é a da primeira tentativa', async () => {
    const cinco = Array.from({ length: 5 }, () => card({ transitions: [trans(90291, '2026-10-01 10:00:00', null)] }));
    const ids = cinco.map((x) => String(x.card_id));
    const s = await servidor({ ...cenarioVazio(), porPagina: 2, cards: { [`${QC}|active`]: cinco } });
    const T1 = '2026-11-20T12:00:00Z';
    // páginas: [c1 c2] [c3 c4] [c5]; o 4º INSERT (segundo card da página 2) falha
    await expect(coletarCards(deps(s, em(T1), coletorQueFalha(4)), { tipo: 'carga_inicial', inicio: '2025-09-01' })).rejects.toThrow('falha simulada no meio da página');
    const aberta = await dono.query<{ coleta_id: string; status: string; marca_dagua_ate: Date | null; erro_resumo: string; parametros: Record<string, unknown> }>(
      `SELECT coleta_id, status, marca_dagua_ate, erro_resumo, parametros FROM ${S.bm}.ctl_coleta WHERE parametros ->> 'inicio_carga' = '2025-09-01' ORDER BY coleta_id DESC LIMIT 1`);
    expect(aberta.rows[0]).toMatchObject({ status: 'falha', marca_dagua_ate: null, erro_resumo: 'desconhecido: erro-interno' });
    expect(aberta.rows[0]!.parametros).toMatchObject({ paginas: { [`${QC}|active`]: { ultima: 1, total: 3 } }, iniciada_em: T1 });
    // só a página 1 existe; o card gravado da página 2 voltou com a transação, e as transições dele também
    expect(await n(`SELECT count(*)::int AS n FROM ${S.bm}.stg_card WHERE id_origem = ANY($1::text[])`, [ids])).toBe(2);
    expect(await n(`SELECT count(*)::int AS n FROM ${S.bm}.stg_revision WHERE card_id = ANY($1::text[])`, [ids])).toBe(2);
    expect(await n(`SELECT count(*)::int AS n FROM ${S.bm}.stg_card WHERE id_origem = ANY($1::text[])`, [ids.slice(2)])).toBe(0);

    // retomada (mesma data de início), uma hora depois: relê a última página concluída, o dedupe cobre
    const pedidosAntes = s.pedidos.length;
    const r = await coletarCards(deps(s, em('2026-11-20T13:00:00Z')), { tipo: 'carga_inicial', inicio: '2025-09-01' });
    expect(r).toMatchObject({ estado: 'sucesso', retomada: true });
    expect(s.pedidos.slice(pedidosAntes).filter((p) => p.caminho === '/cards' && p.consulta.get('state') === 'active').map((p) => p.consulta.get('page'))).toEqual(['1', '2', '3']);
    expect(r.streams.find((x) => x.estado === 'active')).toMatchObject({ lidos: 5, inseridos: 3, jaExistentes: 2 });
    expect(await n(`SELECT count(*)::int AS n FROM ${S.bm}.stg_card WHERE id_origem = ANY($1::text[])`, [ids])).toBe(5);
    expect(await n(`SELECT count(DISTINCT id_origem)::int AS n FROM ${S.bm}.stg_card WHERE id_origem = ANY($1::text[])`, [ids])).toBe(5);
    expect(await n(`SELECT count(*)::int AS n FROM ${S.bm}.stg_revision WHERE card_id = ANY($1::text[])`, [ids])).toBe(5);
    const fim = await dono.query<{ marca_dagua_ate: Date }>(`SELECT marca_dagua_ate FROM ${S.bm}.ctl_coleta WHERE coleta_id = $1`, [r.coletaId]);
    expect(fim.rows[0]!.marca_dagua_ate).toEqual(new Date(T1));
  });

  // ---------- (c) incremental com arquivados e descartados ----------
  it('CT-C: o incremental lê os três estados pela marca d\'água, traz o arquivado e o descartado modificados e o descartado novo, não relê o parado, não apaga versão e é idempotente', async () => {
    const ativo = card({ last_modified: '2026-11-25T10:00:00Z' });
    const arq = card({ title: 'Arq v1', archived_at: '2026-06-01T00:00:00Z', last_modified: '2026-06-01T00:00:00Z' });
    const desc = card({ title: 'Desc v1', discarded_at: '2026-07-01T00:00:00Z', last_modified: '2026-07-01T00:00:00Z' });
    const foraDaJanela = card({ archived_at: '2025-01-01T00:00:00Z', last_modified: '2025-01-01T00:00:00Z' }); // arquivado há mais de 12 meses (Q-2c)
    const k = (x: Cartao) => String(x.card_id);
    const s = await servidor({ ...cenarioVazio(), cards: { [`${QC}|active`]: [ativo], [`${QC}|archived`]: [arq, foraDaJanela], [`${QC}|discarded`]: [desc] } });
    const carga = await coletarCards(deps(s, em('2026-12-01T12:00:00Z')), { tipo: 'carga_inicial', inicio: '2025-12-01' });
    expect(carga.estado).toBe('sucesso');
    const conhecidos = [ativo, arq, desc, foraDaJanela].map(k);
    expect(await n(`SELECT count(*)::int AS n FROM ${S.bm}.stg_card WHERE id_origem = ANY($1::text[])`, [conhecidos])).toBe(3); // o arquivado antigo não entra
    expect(await n(`SELECT count(*)::int AS n FROM ${S.bm}.stg_card WHERE id_origem = $1 AND arquivado`, [k(arq)])).toBe(1);

    // depois da carga: o arquivado e o descartado são mexidos no quadro; entra um descartado novo; o ativo fica parado
    const descNovo = card({ title: 'Desc novo', discarded_at: '2026-12-01T13:00:00Z', last_modified: '2026-12-01T13:00:00Z' });
    s.cenario.cards[`${QC}|archived`] = [{ ...arq, title: 'Arq v2', last_modified: '2026-12-01T11:30:00Z' }, foraDaJanela];
    s.cenario.cards[`${QC}|discarded`] = [{ ...desc, title: 'Desc v2', last_modified: '2026-12-01T12:30:00Z' }, descNovo];
    const antes = s.pedidos.length;
    const inc = await coletarCards(deps(s, em('2026-12-02T12:00:00Z')), { tipo: 'incremental' });
    expect(inc.estado).toBe('sucesso');
    const cartoes = s.pedidos.slice(antes).filter((p) => p.caminho === '/cards');
    expect(cartoes.map((p) => p.consulta.get('state'))).toEqual(['active', 'archived', 'discarded']);
    for (const p of cartoes) {
      expect(p.consulta.get('last_modified_from')).toBe('2026-12-01T11:00:00Z');
      expect(p.consulta.get('archived_from')).toBeNull();
      expect(p.consulta.get('discarded_from')).toBeNull();
    }
    const por = Object.fromEntries(inc.streams.map((x) => [x.estado, x]));
    expect(por.active).toMatchObject({ lidos: 0 });
    expect(por.archived).toMatchObject({ lidos: 1, inseridos: 1, jaExistentes: 0 });
    expect(por.discarded).toMatchObject({ lidos: 2, inseridos: 2, jaExistentes: 0 });
    const versoes = async (x: Cartao) => (await dono.query<{ titulo: string; arquivado: boolean }>(
      `SELECT payload ->> 'title' AS titulo, arquivado FROM ${S.bm}.stg_card WHERE id_origem = $1 ORDER BY stg_sk`, [k(x)])).rows;
    expect(await versoes(arq)).toEqual([{ titulo: 'Arq v1', arquivado: true }, { titulo: 'Arq v2', arquivado: true }]); // histórico preservado
    expect((await versoes(desc)).map((v) => v.titulo)).toEqual(['Desc v1', 'Desc v2']);
    expect((await versoes(descNovo)).map((v) => v.titulo)).toEqual(['Desc novo']);
    expect(await versoes(ativo)).toHaveLength(1);
    expect(await versoes(foraDaJanela)).toHaveLength(0);
    // a marca avançou só no sucesso e a repetição não duplica
    const marca = await dono.query<{ marca_dagua_ate: Date }>(`SELECT marca_dagua_ate FROM ${S.bm}.ctl_coleta WHERE coleta_id = $1`, [inc.coletaId]);
    expect(marca.rows[0]!.marca_dagua_ate).toEqual(new Date('2026-12-02T12:00:00Z'));
    const inc2 = await coletarCards(deps(s, em('2026-12-02T12:30:00Z')), { tipo: 'incremental' });
    expect(inc2.estado).toBe('sucesso');
    expect(inc2.streams.reduce((t, x) => t + x.inseridos, 0)).toBe(0);
    expect(await n(`SELECT count(*)::int AS n FROM ${S.bm}.stg_card WHERE id_origem = ANY($1::text[])`, [[ativo, arq, desc, descNovo].map(k)])).toBe(6);
  });
});
