import type pg from 'pg';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { coletarApontamentos, type DepsApontamento } from '../src/modulos/businessmap/apontamento/coleta.js';
import { eliminarPessoa, type DepsEliminacao } from '../src/modulos/businessmap/apontamento/eliminacao.js';
import { hmacUsuario } from '../src/modulos/businessmap/apontamento/supressao.js';
import type { EntradaClassificacao, SaidaClassificacao } from '../src/modulos/businessmap/apontamento/registro.js';
import type { PoolLike } from '../src/plataforma/db/pool.js';
import { criarClienteHttp } from '../src/plataforma/http.js';
import { cenarioWorklogVazio, registroWorklog, subirServidorWorklog, type ServidorWorklog } from './apontamento-duble.js';
import { novaColeta, poolDe, S, url } from './pg/ctx.js';

// Pedido 059, A4 (CA-AP-10) contra o PostgreSQL local: eliminação a pedido com o papel dono (dspd_migrador). Prova o que a ADR 0020 R4-6 manda:
// supressão gravada (só o HMAC), nome apagado, vínculo anulado, horas intactas como agregado do time, e a recoleta que não recria a pessoa.
const d = describe.skipIf(!url);
const SAL = 'sal-de-teste-com-pelo-menos-32-bytes!!';
const AGORA = new Date('2026-11-04T15:00:00Z');

d('059: eliminação a pedido (CA-AP-10) no PostgreSQL', () => {
  let dono: pg.Pool, coletor: pg.Pool;
  const servidores: ServidorWorklog[] = [];
  const cardsCriados: string[] = [];
  const usuarios: string[] = [];
  const hashes: string[] = [];
  let faixa = 0;
  // faixa própria de ids (9 650 000 000 + 1000 por teste): não colide com id real nem com o outro arquivo de testes do apontamento
  const base = (): number => 9_650_000_000 + ++faixa * 1000;
  beforeAll(() => { dono = poolDe(); coletor = poolDe('dspd_coletor'); });
  afterEach(async () => {
    for (const s of servidores.splice(0)) await s.fechar();
    await dono.query(`DELETE FROM ${S.bm}.dim_card WHERE card_id = ANY($1::text[])`, [cardsCriados]);
  });
  afterAll(async () => {
    await dono.query(`UPDATE ${S.bm}.ctl_coleta SET tarefa = 'reconciliacao' WHERE versao_coletor IN ('ap-teste', 'bm-ap/1')`);
    await dono.query(`DELETE FROM ${S.bm}.dim_responsavel WHERE responsavel_id = ANY($1::text[])`, [usuarios]);
    await dono.query(`DELETE FROM ${S.bm}.cfg_pessoa_eliminada WHERE hash_usuario = ANY(SELECT decode(h, 'hex') FROM unnest($1::text[]) AS h)`, [hashes]);
    await Promise.all([dono, coletor].map((p) => p.end()));
  });

  const n = async (sql: string, params: unknown[] = []): Promise<number> => Number((await dono.query<{ n: string }>(sql, params)).rows[0]!.n);
  const classificar = (e: EntradaClassificacao): SaidaClassificacao => ({ subgrupo: 'reuniao', flags: e.comentario === null ? 1 : 0, qtdPalavras: 1, versaoDicionario: 'dic-1' });
  const pessoa = (id: number, nome: string): Record<string, Record<string, unknown>> => ({ [String(id)]: { user_id: id, realname: nome, email: 'pessoa@exemplo.invalido' } });
  const eliminacao = (): DepsEliminacao => ({ pool: dono as unknown as PoolLike, S, sal: SAL, agora: () => AGORA });

  async function cenario(b: number) {
    const coleta = await novaColeta(dono, S.bm);
    cardsCriados.push(String(b + 1));
    await dono.query(`INSERT INTO ${S.bm}.dim_card (card_id, coletado_em, atualizado_por_coleta_id) VALUES ($1, now(), $2)`, [String(b + 1), coleta]);
    await dono.query(`INSERT INTO ${S.bm}.ctl_coleta (tarefa, iniciado_em, finalizado_em, status, versao_coletor) VALUES ('coleta_incremental', now(), now(), 'sucesso', 'ap-teste')`);
    usuarios.push(String(b + 100), String(b + 101));
    hashes.push(hmacUsuario(SAL, String(b + 100)));
    const regs = [
      registroWorklog({ logged_time_id: b + 11, card_id: b + 1, user_id: b + 100, time: 3600, comment: 'um dois' }),
      registroWorklog({ logged_time_id: b + 12, card_id: b + 1, user_id: b + 100, time: 1800, comment: null }),
      registroWorklog({ logged_time_id: b + 13, card_id: b + 1, user_id: b + 101, time: 7200, comment: 'tres' }),
    ];
    const servidor = await subirServidorWorklog({ ...cenarioWorklogVazio(), registros: regs, users: { ...pessoa(b + 100, 'PESSOA-FICTICIA-ELIMINAR'), ...pessoa(b + 101, 'PESSOA-FICTICIA-FICA') } });
    servidores.push(servidor);
    const cliente = criarClienteHttp({ urlBase: servidor.url, apikey: 'chave-do-teste-0123456789', limitePorMinuto: 100_000, timeoutMs: 3000 }, { dormir: () => Promise.resolve() });
    const deps: DepsApontamento = { cliente, pool: coletor as unknown as PoolLike, S, classificar, sal: SAL, hostBase: 'bm.exemplo.test', agora: () => AGORA };
    return { servidor, deps };
  }
  const fatos = async (b: number) => (await dono.query<{ logged_time_id: string; pessoa_ref: string | null; segundos: number; versoes: number; flags_qualidade: number; subgrupo_codigo: string }>(
    `SELECT logged_time_id, pessoa_ref, segundos, versoes, flags_qualidade, subgrupo_codigo FROM ${S.bm}.fato_apontamento WHERE logged_time_id = ANY($1::text[]) ORDER BY logged_time_id`,
    [[b + 11, b + 12, b + 13].map(String)])).rows;

  it('procedimento completo: supressão só com o HMAC, nome apagado, vínculo anulado, horas e demais colunas do fato intactas, a outra pessoa intocada, recoleta sem recriar a pessoa', async () => {
    const b = base();
    const { servidor, deps } = await cenario(b);
    await coletarApontamentos(deps, { tipo: 'carga_inicial' });
    const antes = await fatos(b);
    const refEliminada = antes[0]!.pessoa_ref!;
    expect(antes.map((f) => f.pessoa_ref !== null)).toEqual([true, true, true]);
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.dim_responsavel WHERE responsavel_id = ANY($1::text[])`, [[String(b + 100), String(b + 101)]])).toBe(2);

    // sem --confirmar: só descreve, nada muda
    const seco = await eliminarPessoa(eliminacao(), { usuarioId: String(b + 100), confirmar: false });
    expect(seco).toEqual({ confirmado: false, jaSuprimida: false, linhaDePessoa: true, apontamentosDesvinculados: 2 });
    expect(await fatos(b)).toEqual(antes);
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.cfg_pessoa_eliminada WHERE hash_usuario = decode($1, 'hex')`, [hmacUsuario(SAL, String(b + 100))])).toBe(0);

    const r = await eliminarPessoa(eliminacao(), { usuarioId: String(b + 100), confirmar: true });
    expect(r).toEqual({ confirmado: true, jaSuprimida: false, linhaDePessoa: true, apontamentosDesvinculados: 2 });
    // (1) lista de supressão: só o HMAC e a data civil; o id nunca em claro
    const lista = await dono.query<{ h: string; eliminada_em: string }>(`SELECT encode(hash_usuario, 'hex') AS h, eliminada_em::text FROM ${S.bm}.cfg_pessoa_eliminada WHERE hash_usuario = decode($1, 'hex')`, [hmacUsuario(SAL, String(b + 100))]);
    expect(lista.rows).toEqual([{ h: hmacUsuario(SAL, String(b + 100)), eliminada_em: '2026-11-04' }]);
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.cfg_pessoa_eliminada x WHERE x::text LIKE $1`, [`%${b + 100}%`])).toBe(0);
    // (1b) responsável do procedimento (0031, R4-6): só o papel de banco que executou, nunca pessoa
    const quem = await dono.query<{ executado_por: string; papel: string }>(
      `SELECT executado_por, current_user AS papel FROM ${S.bm}.cfg_pessoa_eliminada WHERE hash_usuario = decode($1, 'hex')`, [hmacUsuario(SAL, String(b + 100))]);
    expect(quem.rows).toEqual([{ executado_por: quem.rows[0]!.papel, papel: quem.rows[0]!.papel }]);
    expect(quem.rows[0]!.papel).toMatch(/^dspd_/);
    // (2) o nome sai; a outra pessoa fica
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.dim_responsavel WHERE responsavel_id = $1`, [String(b + 100)])).toBe(0);
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.dim_responsavel WHERE responsavel_nome = 'PESSOA-FICTICIA-ELIMINAR'`)).toBe(0);
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.dim_responsavel WHERE responsavel_id = $1`, [String(b + 101)])).toBe(1);
    // (3) vínculo anulado nas linhas dela; as horas e as demais colunas ficam como estavam (agregado do time), e a pessoa que fica mantém o vínculo
    const depois = await fatos(b);
    expect(depois.map((f) => f.pessoa_ref)).toEqual([null, null, antes[2]!.pessoa_ref]);
    const semPessoa = (l: typeof antes) => l.map((f) => ({ ...f, pessoa_ref: null }));
    expect(semPessoa(depois)).toEqual(semPessoa(antes));
    expect(depois.reduce((s, f) => s + f.segundos, 0)).toBe(3600 + 1800 + 7200);
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.fato_apontamento WHERE pessoa_ref = $1`, [refEliminada])).toBe(0);

    // idempotente: repetir não muda nada e informa que já estava suprimida
    expect(await eliminarPessoa(eliminacao(), { usuarioId: String(b + 100), confirmar: true })).toEqual({ confirmado: true, jaSuprimida: true, linhaDePessoa: false, apontamentosDesvinculados: 0 });
    expect(await fatos(b)).toEqual(depois);

    // a recoleta (incremental e uma nova carga) não recria a pessoa nem pede o id a /users, e o vínculo continua anulado
    const pedidosAntes = servidor.usuariosPedidos.get(String(b + 100));
    await coletarApontamentos(deps, { tipo: 'incremental' });
    await coletarApontamentos(deps, { tipo: 'carga_inicial' });
    expect(servidor.usuariosPedidos.get(String(b + 100))).toBe(pedidosAntes);
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.dim_responsavel WHERE responsavel_id = $1`, [String(b + 100)])).toBe(0);
    expect((await fatos(b)).map((f) => f.pessoa_ref)).toEqual([null, null, antes[2]!.pessoa_ref]);
  });

  it('pessoa nunca coletada: só entra na lista de supressão, e a coleta que a encontrar depois já a trata como agregado', async () => {
    const b = base();
    const { servidor, deps } = await cenario(b);
    const r = await eliminarPessoa(eliminacao(), { usuarioId: String(b + 100), confirmar: true });
    expect(r).toEqual({ confirmado: true, jaSuprimida: false, linhaDePessoa: false, apontamentosDesvinculados: 0 });
    await coletarApontamentos(deps, { tipo: 'carga_inicial' });
    expect(servidor.usuariosPedidos.has(String(b + 100))).toBe(false);
    expect((await fatos(b)).map((f) => f.pessoa_ref !== null)).toEqual([false, false, true]);
  });

  it('só o dono faz: o dspd_coletor não apaga a pessoa nem escreve na lista; coleta em andamento (trava da fonte) bloqueia o procedimento sem gravar', async () => {
    const b = base();
    const { deps } = await cenario(b);
    await coletarApontamentos(deps, { tipo: 'carga_inicial' });
    await expect(coletor.query(`DELETE FROM ${S.bm}.dim_responsavel WHERE responsavel_id = '${b + 100}'`)).rejects.toMatchObject({ code: '42501' });
    await expect(coletor.query(`INSERT INTO ${S.bm}.cfg_pessoa_eliminada (hash_usuario, eliminada_em) VALUES (decode('${'ab'.repeat(32)}', 'hex'), '2026-11-04')`)).rejects.toMatchObject({ code: '42501' });
    const segurando = await dono.connect();
    try {
      await segurando.query('SELECT pg_advisory_lock(hashtext($1))', ['dspd:fonte:businessmap']);
      await expect(eliminarPessoa(eliminacao(), { usuarioId: String(b + 101), confirmar: true })).rejects.toMatchObject({ codigo: 'trava' });
      expect(await n(`SELECT count(*) AS n FROM ${S.bm}.dim_responsavel WHERE responsavel_id = $1`, [String(b + 101)])).toBe(1);
    } finally {
      await segurando.query('SELECT pg_advisory_unlock(hashtext($1))', ['dspd:fonte:businessmap']);
      segurando.release();
    }
  });
});
