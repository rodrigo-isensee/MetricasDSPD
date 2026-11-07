import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { projetarBusinessMap } from '../src/modulos/businessmap/projetor.js';
import { gravarStgCard } from '../src/modulos/businessmap/staging.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { criarPool, urlDoPapel } from '../src/plataforma/db/pool.js';
import { poolDe, url } from './pg/ctx.js';

// Lote 4a do 075 (K-204): `evt_bloqueio` pela projeção, contra PostgreSQL real. Cards sem `created_at` ficam só no staging e nos eventos de bloqueio.
const d = describe.skipIf(!url);
const Q = '9201'; const COL_ENTREGA = '92011'; const COL_TRABALHO = '92012';
const MARCADOR = 'MARCADOR-PESSOA-075';
const H = (h: number): Date => new Date(Date.UTC(2026, 10, 1, h));

d('lote 4a do 075: projetor grava evt_bloqueio', () => {
  const prefixo = prefixoDeTeste();
  const E = montarEsquemas(prefixo);
  let dono: pg.Pool, coletor: pg.Pool, coleta = 0, seq = 0;
  const n = async (onde = 'true', params: unknown[] = []): Promise<number> => Number((await dono.query<{ n: string }>(`SELECT count(*) AS n FROM ${E.bm}.evt_bloqueio WHERE ${onde}`, params)).rows[0]!.n);
  const projetar = () => projetarBusinessMap({ pool: coletor, S: E, agora: () => new Date() });
  const dominios = new Map([['5001', new Map([['10', 'FORN_A']])]]);
  /** Uma versão do card no staging, pelo gravador da F3 (a allow-list vale), coletada na hora `h`. */
  const versao = (id: string, h: number, card: Record<string, unknown> = {}) => gravarStgCard(coletor, {
    idOrigem: id, card: { card_id: Number(id), board_id: Number(Q), column_id: Number(COL_TRABALHO), title: `v${h}`, is_blocked: false, ...card }, dominios, coletaId: coleta, agora: H(h), quadroId: Q, arquivado: false, excluidoDetectado: card.excluido === true,
  }, E);
  const novoId = (): string => String(920_000_000 + ++seq);

  beforeAll(async () => {
    await migrar(url!, { prefixo });
    dono = poolDe();
    coletor = criarPool(urlDoPapel(url!, 'dspd_coletor', process.env.DSPD_PWD_COLETOR ?? 'coletor_dev'), { max: 2 });
    await dono.query(`INSERT INTO ${E.bm}.ref_coluna (quadro_id, coluna_id, vigente_de, nome, tipo_coluna, papel, ordem, workflow_id, section, flow_type, eh_folha, eh_descarte)
      VALUES ($1, $2, '2020-01-01', 'Entrega', 'execucao', 'entrega', 2, '92002', 4, 1, true, false)`, [Q, COL_ENTREGA]);
    await dono.query(`INSERT INTO ${E.bm}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ('campo_customizado', '5001', '2020-01-01', 'fornecedor', 0)`);
    coleta = Number((await dono.query<{ coleta_id: string }>(`INSERT INTO ${E.bm}.ctl_coleta (tarefa, iniciado_em, status, versao_coletor) VALUES ('reconciliacao', now(), 'em_andamento', 'teste') RETURNING coleta_id`)).rows[0]!.coleta_id);
  });
  afterAll(async () => {
    await coletor.end();
    for (const s of [E.bm, E.ac, E.core]) await dono.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
    await dono.end();
  });

  it('CA-075-6 e CA-075-12: abre e fecha; reprojeção e coleta repetida não criam linha; fornecedor só do custom_fields do bm; motivo só dígitos', async () => {
    const id = novoId();
    await versao(id, 9); await versao(id, 10, { is_blocked: true, block_reason: { reason_id: 7 }, custom_fields: [{ field_id: 5001, value: 10 }] }); await versao(id, 11);
    await projetar();
    const eventos = (await dono.query(`SELECT tipo, motivo_codigo, coluna_id, fornecedor_codigo, ocorrido_em FROM ${E.bm}.evt_bloqueio WHERE card_id = $1 ORDER BY tipo`, [id])).rows;
    expect(eventos).toEqual([
      { tipo: 'fim', motivo_codigo: null, coluna_id: COL_TRABALHO, fornecedor_codigo: null, ocorrido_em: H(11) },
      { tipo: 'inicio', motivo_codigo: '7', coluna_id: COL_TRABALHO, fornecedor_codigo: 'FORN_A', ocorrido_em: H(10) },
    ]);
    const total = await n();
    await projetar();
    await versao(id, 13, { title: 'coleta repetida, mesmo estado' }); await projetar();
    expect(await n()).toBe(total);
    expect(await n(`motivo_codigo IS NOT NULL AND motivo_codigo !~ '^[0-9]+$'`)).toBe(0);
  });

  it('CA-075-7 e SEG-A1: card arquivado (data depois da coleta), excluído e entregue fecham o bloqueio e os eventos ficam depois de nova projeção', async () => {
    const [a, x, e] = [novoId(), novoId(), novoId()];
    const bloq = { is_blocked: true, block_reason: { reason_id: 3 } };
    await versao(a, 10, bloq); await versao(a, 12, { ...bloq, archived_at: '2099-01-01T00:00:00Z' });
    await versao(x, 10, bloq); await versao(x, 12, { ...bloq, excluido: true });
    await versao(e, 10, bloq); await versao(e, 12, { ...bloq, column_id: Number(COL_ENTREGA) });
    await projetar();
    for (const id of [a, x, e]) expect((await dono.query(`SELECT tipo, ocorrido_em FROM ${E.bm}.evt_bloqueio WHERE card_id = $1 ORDER BY tipo DESC`, [id])).rows).toEqual([{ tipo: 'inicio', ocorrido_em: H(10) }, { tipo: 'fim', ocorrido_em: H(12) }]);
    const total = await n();
    await projetar();
    expect(await n()).toBe(total);
  });

  it('CA-075-8: UPDATE e DELETE em evt_bloqueio negados pelo gatilho append-only', async () => {
    await expect(dono.query(`UPDATE ${E.bm}.evt_bloqueio SET motivo_codigo = '1'`)).rejects.toThrow(/append-only/);
    await expect(dono.query(`DELETE FROM ${E.bm}.evt_bloqueio`)).rejects.toThrow(/append-only/);
  });

  it('CA-075-10: motivo com marcador vira nulo e nota por código; o marcador não vai a evt_bloqueio, contagem nem falha', async () => {
    const id = novoId();
    await versao(id, 10, { is_blocked: true, block_reason: { reason_id: MARCADOR } });
    const r = await projetar();
    expect((await dono.query(`SELECT motivo_codigo FROM ${E.bm}.evt_bloqueio WHERE card_id = $1`, [id])).rows).toEqual([{ motivo_codigo: null }]);
    const nota = await dono.query(`SELECT lidos FROM ${E.bm}.ctl_coleta_contagem WHERE coleta_id = $1 AND entidade = 'nota_bloqueio_motivo_codigo_invalido'`, [r.coletaId]);
    expect(nota.rows.length).toBe(1);
    for (const t of ['evt_bloqueio', 'ctl_coleta_contagem', 'ctl_coleta_falha']) expect(Number((await dono.query(`SELECT count(*) AS n FROM ${E.bm}.${t} x WHERE x::text LIKE '%${MARCADOR}%'`)).rows[0].n)).toBe(0);
  });

  it('CA-075-9: com coleta seed-mock no esquema a projeção recusa antes de escrever evento de bloqueio', async () => {
    await dono.query(`INSERT INTO ${E.bm}.ctl_coleta (tarefa, iniciado_em, status, versao_coletor) VALUES ('coleta_incremental', now(), 'sucesso', 'seed-mock')`);
    const antes = await n();
    await versao(novoId(), 10, { is_blocked: true });
    await expect(projetar()).rejects.toMatchObject({ codigo: 'esquema-com-seed' });
    expect(await n()).toBe(antes);
  });
});
