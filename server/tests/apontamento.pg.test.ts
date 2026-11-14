import type pg from 'pg';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { coletarApontamentos, type DepsApontamento, type ModoApontamento } from '../src/modulos/businessmap/apontamento/coleta.js';
import { escopoDoWorklog } from '../src/modulos/businessmap/apontamento/gravacao.js';
import { hmacUsuario } from '../src/modulos/businessmap/apontamento/supressao.js';
import type { EntradaClassificacao, SaidaClassificacao } from '../src/modulos/businessmap/apontamento/registro.js';
import type { ClienteLike, PoolLike } from '../src/plataforma/db/pool.js';
import { criarClienteHttp } from '../src/plataforma/http.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { cenarioWorklogVazio, registroWorklog, subirServidorWorklog, type CenarioWorklog, type Registro, type ServidorWorklog } from './apontamento-duble.js';
import { novaColeta, poolDe, S, unico, url } from './pg/ctx.js';
import { provarSemPessoa } from './pg/colunas-pessoa.js';

// Pedido 059, A1 a A3 contra o PostgreSQL local: migrações, papéis (CA-AP-1), CHECKs, gatilhos, idempotência da staging e dos eventos,
// coleta ponta a ponta (servidor falso do worklog, nenhuma chamada real), supressão, hierarquia e atomicidade (CT-79).
const d = describe.skipIf(!url);
const SAL = 'sal-de-teste-com-pelo-menos-32-bytes!!';
const AGORA = new Date('2026-11-04T15:00:00Z'); // civil 2026-11-04 (quarta)
const MARCADORES = ['MARCADOR-COMENTARIO-059', 'marcador059@exemplo.invalido', 'campo_novo_059'];

d('059: apontamento (esquema, papéis, coleta) no PostgreSQL', () => {
  let dono: pg.Pool, coletor: pg.Pool, api: pg.Pool;
  const servidores: ServidorWorklog[] = [];
  const cardsCriados: string[] = [];
  const usuarios: string[] = [];
  let faixa = 0;
  // cada teste usa uma faixa própria de ids (9 600 000 000 + 1000 por teste): nunca colide com id real nem entre testes
  const base = (): number => 9_600_000_000 + ++faixa * 1000;
  beforeAll(() => { dono = poolDe(); coletor = poolDe('dspd_coletor'); api = poolDe('dspd_api'); });
  afterEach(async () => {
    for (const s of servidores.splice(0)) await s.fechar();
    // os cards do teste saem do escopo: o apontamento ativo de outro teste não pode virar candidato a exclusão neste
    await dono.query(`DELETE FROM ${S.bm}.dim_card WHERE card_id = ANY($1::text[])`, [cardsCriados]);
  });
  afterAll(async () => {
    // as coletas de teste não podem aparecer no estado de coleta dos outros testes
    await dono.query(`UPDATE ${S.bm}.ctl_coleta SET tarefa = 'reconciliacao' WHERE versao_coletor IN ('ap-teste', 'bm-ap/1')`);
    await dono.query(`DELETE FROM ${S.bm}.dim_responsavel WHERE responsavel_id = ANY($1::text[])`, [usuarios]);
    await dono.query(`DELETE FROM ${S.bm}.cfg_pessoa_eliminada WHERE eliminada_em = '2026-11-04'`);
    await Promise.all([dono, coletor, api].map((p) => p.end()));
  });

  const falha = async (p: pg.Pool, sql: string, params: unknown[] = []): Promise<{ code?: string }> => {
    try {
      await p.query(sql, params);
    } catch (e) {
      return e as { code?: string };
    }
    throw new Error(`esperava falha do banco: ${sql.slice(0, 80)}`);
  };
  const n = async (sql: string, params: unknown[] = []): Promise<number> => Number((await dono.query<{ n: string }>(sql, params)).rows[0]!.n);

  /** Cards no escopo (`dim_card`), com pai e granularidade opcionais, e a coleta de cards "bem-sucedida" que a etapa exige. */
  async function criarCards(lista: { id: number; pai?: number; granularidade?: string }[]): Promise<void> {
    const coleta = await novaColeta(dono, S.bm);
    for (const c of lista) {
      cardsCriados.push(String(c.id));
      await dono.query(
        `INSERT INTO ${S.bm}.dim_card (card_id, card_pai, granularidade, coletado_em, atualizado_por_coleta_id) VALUES ($1, $2, $3, now(), $4)`,
        [String(c.id), c.pai === undefined ? null : String(c.pai), c.granularidade ?? null, coleta]);
    }
    await dono.query(`INSERT INTO ${S.bm}.ctl_coleta (tarefa, iniciado_em, finalizado_em, status, versao_coletor) VALUES ('coleta_incremental', now(), now(), 'sucesso', 'ap-teste')`);
  }
  const classificar = (e: EntradaClassificacao): SaidaClassificacao => ({
    subgrupo: 'reuniao', flags: e.comentario === null ? 1 : 0, qtdPalavras: e.comentario === null ? 0 : e.comentario.split(/\s+/).length, versaoDicionario: 'dic-1',
  });
  async function montar(cenario: Partial<CenarioWorklog>, pool: PoolLike = coletor as unknown as PoolLike) {
    const servidor = await subirServidorWorklog({ ...cenarioWorklogVazio(), ...cenario });
    servidores.push(servidor);
    const cliente = criarClienteHttp({ urlBase: servidor.url, apikey: 'chave-do-teste-0123456789', limitePorMinuto: 100_000, timeoutMs: 3000 }, { dormir: () => Promise.resolve() });
    const deps: DepsApontamento = { cliente, pool, S, classificar, sal: SAL, hostBase: 'bm.exemplo.test', agora: () => AGORA };
    return { servidor, deps, rodar: (modo: ModoApontamento) => coletarApontamentos(deps, modo) };
  }
  const carga: ModoApontamento = { tipo: 'carga_inicial' };
  const incremental: ModoApontamento = { tipo: 'incremental' };
  const pessoa = (id: number, nome: string): Record<string, Record<string, unknown>> => ({ [String(id)]: { user_id: id, realname: nome, email: 'pessoa@exemplo.invalido', attributes: { x: 1 } } });
  const fatos = async (ids: string[]) => (await dono.query<{ logged_time_id: string; pessoa_ref: string | null; versoes: number; excluido_em: Date | null; iniciativa_card_id: string | null; flags_qualidade: number; segundos: number }>(
    `SELECT logged_time_id, pessoa_ref, versoes, excluido_em, iniciativa_card_id, flags_qualidade, segundos FROM ${S.bm}.fato_apontamento WHERE logged_time_id = ANY($1::text[]) ORDER BY logged_time_id`, [ids])).rows;
  const linhaStg = (id: string, sha: string, extra: Record<string, unknown> = {}): [string, unknown[]] => {
    const v = { logged_time_id: id, card_id: '1', data_apontamento: '2026-10-20', segundos: 60, subgrupo_codigo: 'x', flags_qualidade: 0, qtd_palavras: 1, versao_dicionario: 'v', versao: 1, ...extra };
    return [`INSERT INTO ${S.bm}.stg_apontamento (logged_time_id, card_id, data_apontamento, segundos, subgrupo_codigo, flags_qualidade, qtd_palavras, versao_dicionario, registro_sha256, coletado_em, coleta_id, versao)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, decode($9, 'hex'), now(), $10, $11)`,
    [v.logged_time_id, v.card_id, v.data_apontamento, v.segundos, v.subgrupo_codigo, v.flags_qualidade, v.qtd_palavras, v.versao_dicionario, sha, 0, v.versao]];
  };
  const SHA = (c: string): string => c.repeat(64).slice(0, 64);

  it('papéis (CA-AP-1): o dspd_api não lê nenhuma tabela do apontamento, nem pessoa_ref; o coletor tem só o que precisa', async () => {
    for (const t of ['stg_apontamento', 'evt_apontamento', 'fato_apontamento', 'dim_card_raiz', 'cfg_pessoa_eliminada', 'ref_apontamento_subgrupo', 'ref_apontamento_termo', 'ref_apontamento_regra_tipo', 'dim_responsavel']) {
      expect((await falha(api, `SELECT count(*) FROM ${S.bm}.${t}`)).code, t).toBe('42501');
    }
    await provarSemPessoa(api, dono, 'dspd_bm.dim_responsavel', S.bm);
    await provarSemPessoa(api, dono, 'dspd_bm.fato_apontamento', S.bm);
    const coleta = await novaColeta(dono, S.bm);
    const [sql, params] = linhaStg('9599000001', SHA('a'), { card_id: '9599000002' });
    params[9] = coleta;
    await coletor.query(sql, params);
    expect((await falha(coletor, `UPDATE ${S.bm}.stg_apontamento SET segundos = 2 WHERE logged_time_id = '9599000001'`)).code).toBe('42501');
    expect((await falha(coletor, `DELETE FROM ${S.bm}.stg_apontamento WHERE logged_time_id = '9599000001'`)).code).toBe('42501');
    expect((await falha(coletor, `UPDATE ${S.bm}.evt_apontamento SET card_id = '1'`)).code).toBe('42501');
    expect((await falha(coletor, `DELETE FROM ${S.bm}.fato_apontamento`)).code).toBe('42501');
    expect((await falha(coletor, `DELETE FROM ${S.bm}.dim_card_raiz`)).code).toBe('42501');
    expect((await falha(coletor, `INSERT INTO ${S.bm}.cfg_pessoa_eliminada (hash_usuario, eliminada_em) VALUES (decode('${SHA('b')}', 'hex'), '2026-11-04')`)).code).toBe('42501');
    expect((await falha(coletor, `UPDATE ${S.bm}.cfg_pessoa_eliminada SET eliminada_em = now()`)).code).toBe('42501');
    await expect(coletor.query(`SELECT count(*) FROM ${S.bm}.cfg_pessoa_eliminada`)).resolves.toBeDefined();
    expect((await falha(coletor, `INSERT INTO ${S.bm}.dim_responsavel (responsavel_id, responsavel_nome, pessoa_ref, atualizado_em) VALUES ('9599000009', 'X', 5, now())`)).code).toBe('428C9');
  });

  it('gatilhos de imutabilidade valem até para o dono: UPDATE, DELETE e TRUNCATE em staging e eventos', async () => {
    const coleta = await novaColeta(dono, S.bm);
    const [sql, params] = linhaStg('9599000011', SHA('c'));
    params[9] = coleta;
    await dono.query(sql, params);
    await dono.query(`INSERT INTO ${S.bm}.evt_apontamento (logged_time_id, card_id, tipo, origem, chave_ocorrencia, detectado_em, coleta_id) VALUES ('9599000011', '1', 'excluido_detectado', 'varredura', '2026-11-04', now(), $1)`, [coleta]);
    for (const sql2 of [
      `UPDATE ${S.bm}.stg_apontamento SET segundos = 5 WHERE logged_time_id = '9599000011'`, `DELETE FROM ${S.bm}.stg_apontamento WHERE logged_time_id = '9599000011'`, `TRUNCATE ${S.bm}.stg_apontamento`,
      `UPDATE ${S.bm}.evt_apontamento SET card_id = '2'`, `DELETE FROM ${S.bm}.evt_apontamento`, `TRUNCATE ${S.bm}.evt_apontamento`,
    ]) expect((await falha(dono, sql2)).code, sql2).toBe('55000');
  });

  it('CHECKs e chaves: horas de 1 a 86 400, ids em dígitos, máscara, tipo do evento, chave natural e raiz própria', async () => {
    const coleta = await novaColeta(dono, S.bm);
    const ruim = async (extra: Record<string, unknown>, id: string): Promise<string | undefined> => {
      const [sql, params] = linhaStg(id, SHA('d'), extra);
      params[9] = coleta;
      return (await falha(dono, sql, params)).code;
    };
    expect(await ruim({ segundos: 0 }, '9599000021')).toBe('23514');
    expect(await ruim({ segundos: 86_401 }, '9599000022')).toBe('23514');
    expect(await ruim({ flags_qualidade: 32 }, '9599000023')).toBe('23514');
    expect(await ruim({ qtd_palavras: -1 }, '9599000024')).toBe('23514');
    expect(await ruim({}, 'abc')).toBe('23514');
    expect(await ruim({ card_id: '1234567890123' }, '9599000025')).toBe('23514');
    for (const segundos of [1, 86_400]) {
      const [sql, params] = linhaStg(`959900003${segundos === 1 ? 1 : 2}`, SHA('e'), { segundos });
      params[9] = coleta;
      await expect(dono.query(sql, params)).resolves.toBeDefined();
    }
    const [dup, pd] = linhaStg('9599000031', SHA('e'));
    pd[9] = coleta;
    expect((await falha(dono, dup, pd)).code).toBe('23505');
    const evento = (tipo: string, chave: string): [string, unknown[]] => [
      `INSERT INTO ${S.bm}.evt_apontamento (logged_time_id, card_id, tipo, origem, chave_ocorrencia, detectado_em, coleta_id) VALUES ('9599000040', '1', $1, 'varredura', $2, now(), $3)`, [tipo, chave, coleta]];
    expect((await falha(dono, ...evento('excluido_origem', '2026-11-04'))).code).toBe('23514');
    expect((await falha(dono, ...evento('transferido', '2026-11-04'))).code).toBe('23514');
    await dono.query(...evento('excluido_detectado', '2026-11-04'));
    expect((await falha(dono, ...evento('excluido_detectado', '2026-11-04'))).code).toBe('23505');
    await expect(dono.query(...evento('excluido_detectado', '2026-11-05'))).resolves.toBeDefined();
    await expect(dono.query(...evento('reaparecido', '2026-11-04'))).resolves.toBeDefined();
    const raiz = (id: string, raizId: string, prof: number): Promise<unknown> => dono.query(
      `INSERT INTO ${S.bm}.dim_card_raiz (card_id, raiz_card_id, profundidade, raiz_eh_iniciativa, raiz_fora_do_escopo, coletado_em, atualizado_por_coleta_id) VALUES ($1, $2, $3, false, false, now(), $4)`, [id, raizId, prof, coleta]);
    expect(((await raiz('9599000050', '9599000050', 1).catch((e: { code?: string }) => e)) as { code?: string }).code).toBe('23514');
    expect(((await raiz('9599000051', '9599000052', 0).catch((e: { code?: string }) => e)) as { code?: string }).code).toBe('23514');
    expect(((await raiz('9599000053', '9599000054', 11).catch((e: { code?: string }) => e)) as { code?: string }).code).toBe('23514');
    await expect(raiz('9599000055', '9599000055', 0)).resolves.toBeDefined();
  });

  it('pessoa_ref: sequencial, único e opaco (GENERATED ALWAYS); cfg_pessoa_eliminada só aceita HMAC de 32 bytes', async () => {
    const ids = [unico('p'), unico('q')].map((s) => String(9_598_000_000 + Number.parseInt(s.slice(1, 5), 16)));
    usuarios.push(...ids);
    for (const id of ids) await dono.query(`INSERT INTO ${S.bm}.dim_responsavel (responsavel_id, responsavel_nome, atualizado_em) VALUES ($1, 'PESSOA-FICTICIA-X', now())`, [id]);
    const r = await dono.query<{ pessoa_ref: string }>(`SELECT pessoa_ref FROM ${S.bm}.dim_responsavel WHERE responsavel_id = ANY($1::text[]) ORDER BY pessoa_ref`, [ids]);
    expect(r.rows).toHaveLength(2);
    expect(Number(r.rows[1]!.pessoa_ref)).toBeGreaterThan(Number(r.rows[0]!.pessoa_ref));
    expect((await falha(dono, `INSERT INTO ${S.bm}.cfg_pessoa_eliminada (hash_usuario, eliminada_em) VALUES ('\\x00', '2026-11-04')`)).code).toBe('23514');
  });

  it('carga inicial ponta a ponta: staging sem comentário nem pessoa, fato com pessoa_ref, nada de marcador em nenhuma tabela, marca d\'água (CA-AP-2, CA-AP-3, CT-36)', async () => {
    const b = base();
    await criarCards([{ id: b + 1 }]);
    usuarios.push(String(b + 100), String(b + 101));
    const regs: Registro[] = [
      registroWorklog({ logged_time_id: b + 11, card_id: b + 1, user_id: b + 100, comment: 'MARCADOR-COMENTARIO-059 texto longo aqui', reporter: 'PESSOA-FICTICIA-R', email: 'marcador059@exemplo.invalido', campo_novo_059: 'x' }),
      registroWorklog({ logged_time_id: b + 12, card_id: b + 1, user_id: b + 101, comment: null, time: 7200 }),
    ];
    const m = await montar({ registros: regs, users: { ...pessoa(b + 100, 'PESSOA-FICTICIA-A'), ...pessoa(b + 101, 'PESSOA-FICTICIA-B') }, ignorarFields: true });
    const r = await m.rodar(carga);
    expect(r).toMatchObject({ estado: 'sucesso', inseridos: 2, lidos: 2, invalidos: 0 });
    const f = await fatos([String(b + 11), String(b + 12)]);
    expect(f.map((x) => x.segundos)).toEqual([3600, 7200]);
    expect(f.every((x) => x.pessoa_ref !== null && x.versoes === 1 && x.excluido_em === null)).toBe(true);
    expect(f[0]!.pessoa_ref).not.toBe(f[1]!.pessoa_ref);
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.stg_apontamento WHERE logged_time_id = ANY($1::text[])`, [[String(b + 11), String(b + 12)]])).toBe(2);
    const ctl = await dono.query<{ status: string; marca: Date | null; tarefa: string }>(`SELECT status, marca_dagua_ate AS marca, tarefa FROM ${S.bm}.ctl_coleta WHERE coleta_id = $1`, [r.coletaId]);
    expect(ctl.rows[0]).toMatchObject({ status: 'sucesso', tarefa: 'apontamento' });
    expect(ctl.rows[0]!.marca).toEqual(AGORA);
    // CA-AP-2: nenhum marcador de comentário, e-mail ou campo desconhecido em NENHUMA tabela dos schemas da aplicação
    const tabelas = await dono.query<{ s: string; t: string }>(
      `SELECT table_schema AS s, table_name AS t FROM information_schema.tables WHERE table_type = 'BASE TABLE' AND table_schema = ANY($1::text[])`, [[S.bm, S.core]]);
    for (const { s, t } of tabelas.rows) {
      for (const marcador of MARCADORES) {
        expect(await n(`SELECT count(*) AS n FROM ${s}.${t} x WHERE x::text LIKE $1`, [`%${marcador}%`]), `${s}.${t} ${marcador}`).toBe(0);
      }
    }
    // o nome de pessoa só existe em dim_responsavel (colunas de COLUNAS_PESSOA) e o id de pessoa nunca no fato nem na staging
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.fato_apontamento x WHERE x::text LIKE '%PESSOA-FICTICIA%' OR x::text LIKE $1`, [`%${b + 100}%`])).toBe(0);
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.stg_apontamento x WHERE x::text LIKE '%PESSOA-FICTICIA%' OR x::text LIKE $1`, [`%${b + 100}%`])).toBe(0);
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.dim_responsavel WHERE responsavel_nome LIKE 'PESSOA-FICTICIA-%' AND responsavel_id = ANY($1::text[])`, [[String(b + 100), String(b + 101)]])).toBe(2);
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.ctl_coleta_falha WHERE coleta_id = $1`, [r.coletaId])).toBe(0);
  });

  it('incremental: a mesma versão relida não duplica; edição vira versão nova (versoes + 1) e o fato acompanha, sem UPDATE na staging; pessoa preservada (CT-47, CT-78)', async () => {
    const b = base();
    await criarCards([{ id: b + 1 }]);
    usuarios.push(String(b + 100));
    const reg = registroWorklog({ logged_time_id: b + 11, card_id: b + 1, user_id: b + 100, comment: 'um dois' });
    const m = await montar({ registros: [reg], users: pessoa(b + 100, 'PESSOA-FICTICIA-C') });
    await m.rodar(carga);
    const antes = (await fatos([String(b + 11)]))[0]!;
    const r1 = await m.rodar(incremental);
    expect(r1).toMatchObject({ estado: 'sucesso', inseridos: 0 });
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.stg_apontamento WHERE logged_time_id = $1`, [String(b + 11)])).toBe(1);
    // edição só do comentário com a mesma classificação (mesmas palavras): nenhuma versão nova
    m.servidor.cenario.registros[0] = { ...reg, comment: 'tres quatro' };
    expect(await m.rodar(incremental)).toMatchObject({ inseridos: 0 });
    // edição de horas e do usuário (sem user_id na releitura): versão nova, pessoa preservada
    m.servidor.cenario.registros[0] = { ...reg, time: 1800, user_id: null };
    expect(await m.rodar(incremental)).toMatchObject({ inseridos: 1 });
    const depois = (await fatos([String(b + 11)]))[0]!;
    expect(depois).toMatchObject({ segundos: 1800, versoes: 2, pessoa_ref: antes.pessoa_ref });
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.stg_apontamento WHERE logged_time_id = $1`, [String(b + 11)])).toBe(2);
    // decisão A2: a volta ao valor antigo é uma edição real e vira versão nova (A, B, A = três linhas); o fato acompanha e é reconstruível da staging
    m.servidor.cenario.registros[0] = { ...reg, time: 3600, user_id: null };
    expect(await m.rodar(incremental)).toMatchObject({ inseridos: 1 });
    expect((await fatos([String(b + 11)]))[0]).toMatchObject({ segundos: 3600, versoes: 3 });
    const ultima = await dono.query<{ segundos: number; versao: number }>(`SELECT segundos, versao FROM ${S.bm}.stg_apontamento WHERE logged_time_id = $1 ORDER BY versao DESC LIMIT 1`, [String(b + 11)]);
    expect(ultima.rows[0]).toEqual({ segundos: 3600, versao: 3 });
    // A relido sobre A não grava nada
    expect(await m.rodar(incremental)).toMatchObject({ inseridos: 0, jaExistentes: 1 });
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.stg_apontamento WHERE logged_time_id = $1`, [String(b + 11)])).toBe(3);
  });

  /** Invariante da decisão A2, conferido no banco: o fato é a última versão da staging, e nenhuma versão repete o hash da anterior. */
  async function conferirReconstrucao(ids: string[]): Promise<void> {
    const dif = await dono.query(
      `SELECT f.logged_time_id FROM ${S.bm}.fato_apontamento f
        JOIN ${S.bm}.stg_apontamento u ON u.logged_time_id = f.logged_time_id AND u.versao = (SELECT max(versao) FROM ${S.bm}.stg_apontamento WHERE logged_time_id = f.logged_time_id)
       WHERE f.logged_time_id = ANY($1::text[])
         AND (f.registro_sha256 <> u.registro_sha256 OR f.versoes <> u.versao OR f.segundos <> u.segundos OR f.data_apontamento <> u.data_apontamento
              OR f.subgrupo_codigo <> u.subgrupo_codigo OR f.flags_qualidade & 7 <> u.flags_qualidade & 7)`, [ids]);
    expect(dif.rows).toEqual([]);
    const semFato = await n(`SELECT count(DISTINCT s.logged_time_id) AS n FROM ${S.bm}.stg_apontamento s LEFT JOIN ${S.bm}.fato_apontamento f USING (logged_time_id) WHERE s.logged_time_id = ANY($1::text[]) AND f.logged_time_id IS NULL`, [ids]);
    expect(semFato).toBe(0);
    const repetidas = await n(
      `SELECT count(*) AS n FROM ${S.bm}.stg_apontamento a JOIN ${S.bm}.stg_apontamento b ON b.logged_time_id = a.logged_time_id AND b.versao = a.versao + 1
        WHERE a.logged_time_id = ANY($1::text[]) AND a.registro_sha256 = b.registro_sha256`, [ids]);
    expect(repetidas).toBe(0);
    const lacunas = await n(`SELECT count(*) AS n FROM (SELECT logged_time_id, count(*) AS c, max(versao) AS m FROM ${S.bm}.stg_apontamento WHERE logged_time_id = ANY($1::text[]) GROUP BY 1) x WHERE c <> m`, [ids]);
    expect(lacunas).toBe(0);
  }

  it('A2, invariante de reconstrução: A, B, A = três linhas; A, A = uma; o fato é a maior versão da staging com versoes igual a ela; dicionário novo só vale se a classificação muda', async () => {
    const bb = base();
    await criarCards([{ id: bb + 1 }]);
    const aba = registroWorklog({ logged_time_id: bb + 11, card_id: bb + 1, user_id: null, time: 600 });
    const aa = registroWorklog({ logged_time_id: bb + 12, card_id: bb + 1, user_id: null, time: 600 });
    const m = await montar({ registros: [aba, aa] });
    await m.rodar(carga);
    await conferirReconstrucao([String(bb + 11), String(bb + 12)]);
    for (const time of [1200, 600]) {
      m.servidor.cenario.registros[0] = { ...aba, time };
      expect(await m.rodar(incremental)).toMatchObject({ estado: 'sucesso', inseridos: 1 });
      await conferirReconstrucao([String(bb + 11), String(bb + 12)]);
    }
    expect(await m.rodar(incremental)).toMatchObject({ inseridos: 0 });
    const v = await dono.query<{ logged_time_id: string; versao: number; segundos: number }>(
      `SELECT logged_time_id, versao, segundos FROM ${S.bm}.stg_apontamento WHERE logged_time_id = ANY($1::text[]) ORDER BY logged_time_id, versao`, [[String(bb + 11), String(bb + 12)]]);
    expect(v.rows).toEqual([
      { logged_time_id: String(bb + 11), versao: 1, segundos: 600 }, { logged_time_id: String(bb + 11), versao: 2, segundos: 1200 }, { logged_time_id: String(bb + 11), versao: 3, segundos: 600 },
      { logged_time_id: String(bb + 12), versao: 1, segundos: 600 },
    ]);
    expect((await fatos([String(bb + 11)]))[0]).toMatchObject({ segundos: 600, versoes: 3 });
    // dicionário novo: a saída da classificação muda (versão do dicionário), então o hash muda e entra versão nova; o fato acompanha
    const classificarV2 = (e: EntradaClassificacao): SaidaClassificacao => ({ ...classificar(e), versaoDicionario: 'dic-2' });
    const novo = await montar({ registros: [aba, aa] });
    novo.deps.classificar = classificarV2;
    expect(await coletarApontamentos(novo.deps, incremental)).toMatchObject({ inseridos: 2 });
    await conferirReconstrucao([String(bb + 11), String(bb + 12)]);
    expect((await fatos([String(bb + 11)]))[0]).toMatchObject({ versoes: 4 });
  });

  it('A2: a chave é (logged_time_id, versao): versão repetida recusa (23505), versão 0 recusa (23514) e a mesma leitura concorrente vira nada (ON CONFLICT)', async () => {
    const coleta = await novaColeta(dono, S.bm);
    const grava = async (id: string, sha: string, versao: number): Promise<{ code?: string } | undefined> => {
      const [sql, params] = linhaStg(id, SHA(sha), { versao });
      params[9] = coleta;
      try { await dono.query(sql, params); } catch (e) { return e as { code?: string }; }
      return undefined;
    };
    expect(await grava('9599000061', 'a', 1)).toBeUndefined();
    expect(await grava('9599000061', 'b', 2)).toBeUndefined();
    expect(await grava('9599000061', 'a', 3)).toBeUndefined();
    expect((await grava('9599000061', 'c', 3))?.code).toBe('23505');
    expect((await grava('9599000062', 'a', 0))?.code).toBe('23514');
    const c = await coletor.query(
      `INSERT INTO ${S.bm}.stg_apontamento (logged_time_id, card_id, data_apontamento, segundos, subgrupo_codigo, flags_qualidade, qtd_palavras, versao_dicionario, registro_sha256, coletado_em, coleta_id, versao)
       VALUES ('9599000061', '1', '2026-10-20', 60, 'x', 0, 1, 'v', decode($1, 'hex'), now(), $2, 3) ON CONFLICT ON CONSTRAINT uq_stg_apontamento DO NOTHING RETURNING logged_time_id`, [SHA('d'), coleta]);
    expect(c.rows).toEqual([]);
  });

  it('migração 0032 (A2): preenche a versão das linhas existentes em ordem de stg_sk sem tocar em mais nada, religa o gatilho, e o down recusa com hash repetido por id', async () => {
    const p = prefixoDeTeste();
    const e = montarEsquemas(p);
    try {
      await migrar(url!, { prefixo: p });
      await migrar(url!, { prefixo: p, direcao: 'down', quantas: 6 }); // desfaz a 0037 (exibição do alvo), a 0036 (unidade do alvo), a 0035 (previsão), a 0034 (cobertura), a 0033 (view do time) e a 0032: volta ao estado da 0031 (chave por hash)
      const col = async (): Promise<string[]> => (await dono.query<{ column_name: string }>(`SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'stg_apontamento'`, [e.bm])).rows.map((r) => r.column_name);
      expect(await col()).not.toContain('versao');
      const coleta = (await dono.query<{ coleta_id: string }>(`INSERT INTO ${e.bm}.ctl_coleta (tarefa, iniciado_em, status, versao_coletor) VALUES ('reconciliacao', now(), 'em_andamento', 'teste') RETURNING coleta_id`)).rows[0]!.coleta_id;
      const ins = (id: string, sha: string, segundos: number): Promise<unknown> => dono.query(
        `INSERT INTO ${e.bm}.stg_apontamento (logged_time_id, card_id, data_apontamento, segundos, subgrupo_codigo, flags_qualidade, qtd_palavras, versao_dicionario, registro_sha256, coletado_em, coleta_id)
         VALUES ($1, '1', '2026-10-20', $2, 'x', 0, 1, 'v', decode($3, 'hex'), now(), $4)`, [id, segundos, SHA(sha), coleta]);
      await ins('100', 'a', 60); await ins('200', 'a', 70); await ins('100', 'b', 80); await ins('100', 'c', 90); await ins('300', 'a', 10);
      const antes = (await dono.query(`SELECT stg_sk, logged_time_id, segundos, encode(registro_sha256, 'hex') AS h FROM ${e.bm}.stg_apontamento ORDER BY stg_sk`)).rows;
      await migrar(url!, { prefixo: p });
      const depois = (await dono.query<{ stg_sk: string; logged_time_id: string; segundos: number; h: string; versao: number }>(
        `SELECT stg_sk, logged_time_id, segundos, encode(registro_sha256, 'hex') AS h, versao FROM ${e.bm}.stg_apontamento ORDER BY stg_sk`)).rows;
      expect(depois.map((r) => ({ stg_sk: r.stg_sk, logged_time_id: r.logged_time_id, segundos: r.segundos, h: r.h }))).toEqual(antes);
      expect(depois.map((r) => [r.logged_time_id, r.versao])).toEqual([['100', 1], ['200', 1], ['100', 2], ['100', 3], ['300', 1]]);
      // o gatilho voltou: nem o dono altera a staging, e a chave nova vale
      await expect(dono.query(`UPDATE ${e.bm}.stg_apontamento SET segundos = 5`)).rejects.toMatchObject({ code: '55000' });
      await expect(ins('100', 'f', 1)).rejects.toMatchObject({ code: '23502' }); // sem versao
      // volta ao valor antigo na chave nova, e então o down recusa e nada muda
      await dono.query(`INSERT INTO ${e.bm}.stg_apontamento (logged_time_id, card_id, data_apontamento, segundos, subgrupo_codigo, flags_qualidade, qtd_palavras, versao_dicionario, registro_sha256, coletado_em, coleta_id, versao)
        VALUES ('100', '1', '2026-10-20', 60, 'x', 0, 1, 'v', decode($1, 'hex'), now(), $2, 4)`, [SHA('a'), coleta]);
      await expect(migrar(url!, { prefixo: p, direcao: 'down', quantas: 6 })).rejects.toThrow(/down da 0032 recusado/);
      expect(await col()).toContain('versao');
      expect((await dono.query(`SELECT count(*) AS n FROM ${e.bm}.stg_apontamento`)).rows[0]).toEqual({ n: '6' });
    } finally {
      for (const x of [e.bm, e.ac, e.core]) await dono.query(`DROP SCHEMA IF EXISTS ${x} CASCADE`);
    }
  });

  it('exclusão por presença: evento com chave da data civil (um só por dia), excluido_em, nada apagado, e reaparecido devolve às somas (CT-72, CT-74, CT-75)', async () => {
    const b = base();
    await criarCards([{ id: b + 1 }]);
    const regs = Array.from({ length: 10 }, (_, i) => registroWorklog({ logged_time_id: b + 10 + i, card_id: b + 1, user_id: null }));
    const m = await montar({ registros: regs });
    await m.rodar(carga);
    const sumido = regs[0]!;
    m.servidor.cenario.registros = regs.slice(1);
    const r = await m.rodar(incremental);
    expect(r).toMatchObject({ estado: 'sucesso', excluidos: 1 });
    const id = String(b + 10);
    expect((await fatos([id]))[0]!.excluido_em).toEqual(AGORA);
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.fato_apontamento WHERE card_id = $1 AND excluido_em IS NULL`, [String(b + 1)])).toBe(9);
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.stg_apontamento WHERE logged_time_id = $1`, [id])).toBe(1);
    const ev = await dono.query<{ tipo: string; origem: string; chave_ocorrencia: string; ocorrido_em: Date | null }>(
      `SELECT tipo, origem, chave_ocorrencia, ocorrido_em FROM ${S.bm}.evt_apontamento WHERE logged_time_id = $1`, [id]);
    expect(ev.rows).toEqual([{ tipo: 'excluido_detectado', origem: 'varredura', chave_ocorrencia: '2026-11-04', ocorrido_em: null }]);
    // mesmo dia, mesma ausência: nenhum evento novo
    expect(await m.rodar(incremental)).toMatchObject({ excluidos: 0 });
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.evt_apontamento WHERE logged_time_id = $1`, [id])).toBe(1);
    // volta: reaparecido, soma restaurada, eventos antigos ficam
    m.servidor.cenario.registros = regs;
    expect(await m.rodar(incremental)).toMatchObject({ reaparecidos: 1 });
    expect((await fatos([id]))[0]!.excluido_em).toBeNull();
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.evt_apontamento WHERE logged_time_id = $1`, [id])).toBe(2);
    expect(sumido).toBeDefined();
  });

  it('guarda de massa e lote incompleto: nenhuma exclusão é gravada, a coleta fecha parcial e a marca não avança (CT-72, CT-73)', async () => {
    const b = base();
    await criarCards([{ id: b + 1 }]);
    const regs = Array.from({ length: 10 }, (_, i) => registroWorklog({ logged_time_id: b + 10 + i, card_id: b + 1, user_id: null }));
    const m = await montar({ registros: regs });
    await m.rodar(carga);
    m.servidor.cenario.registros = regs.slice(3); // 30% ausentes
    const massa = await m.rodar(incremental);
    expect(massa).toMatchObject({ estado: 'parcial', excluidos: 0, falhas: { exclusao_em_massa: 1 } });
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.evt_apontamento WHERE logged_time_id = ANY($1::text[])`, [regs.map((r) => String(r.logged_time_id))])).toBe(0);
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.fato_apontamento WHERE card_id = $1 AND excluido_em IS NULL`, [String(b + 1)])).toBe(10);
    const ctl = await dono.query<{ status: string; marca: Date | null }>(`SELECT status, marca_dagua_ate AS marca FROM ${S.bm}.ctl_coleta WHERE coleta_id = $1`, [massa.coletaId]);
    expect(ctl.rows[0]).toEqual({ status: 'parcial', marca: null });
    const f = await dono.query<{ erro: string; id_origem: string | null }>(`SELECT erro, id_origem FROM ${S.bm}.ctl_coleta_falha WHERE coleta_id = $1`, [massa.coletaId]);
    expect(f.rows).toEqual([{ erro: 'exclusao_em_massa', id_origem: null }]);
    // lote incompleto (404 do servidor): ausentes não viram exclusão
    m.servidor.cenario.statusPorLote = () => 404;
    expect(await m.rodar(incremental)).toMatchObject({ excluidos: 0, estado: 'falha' });
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.evt_apontamento WHERE logged_time_id = ANY($1::text[])`, [regs.map((r) => String(r.logged_time_id))])).toBe(0);
  });

  it('A7: carga inicial com um registro recusado de vez (tempo-invalido) fecha sucesso e grava a marca; a recusa fica em ctl_coleta_falha e na contagem; o incremental seguinte roda', async () => {
    const b = base();
    await criarCards([{ id: b + 1 }]);
    const boas = Array.from({ length: 5 }, (_, i) => registroWorklog({ logged_time_id: b + 10 + i, card_id: b + 1, user_id: null }));
    const ruim = registroWorklog({ logged_time_id: b + 20, card_id: b + 1, user_id: null, time: 0 });
    const m = await montar({ registros: [...boas, ruim] });
    const r = await m.rodar(carga);
    expect(r).toMatchObject({ estado: 'sucesso', inseridos: 5, invalidos: 1, falhas: {}, recusados: { 'tempo-invalido': 1 } });
    const ctl = await dono.query<{ status: string; marca: Date | null }>(`SELECT status, marca_dagua_ate AS marca FROM ${S.bm}.ctl_coleta WHERE coleta_id = $1`, [r.coletaId]);
    expect(ctl.rows[0]!.status).toBe('sucesso');
    expect(ctl.rows[0]!.marca).not.toBeNull();
    const f = await dono.query<{ entidade: string; id_origem: string | null; erro: string }>(`SELECT entidade, id_origem, erro FROM ${S.bm}.ctl_coleta_falha WHERE coleta_id = $1`, [r.coletaId]);
    expect(f.rows).toEqual([{ entidade: 'apontamento', id_origem: String(b + 20), erro: 'tempo-invalido' }]);
    const c = await dono.query<{ lidos: number; inseridos: number; falhas: number }>(`SELECT lidos, inseridos, falhas FROM ${S.bm}.ctl_coleta_contagem WHERE coleta_id = $1 AND entidade = 'apontamento'`, [r.coletaId]);
    expect(c.rows).toEqual([{ lidos: 6, inseridos: 5, falhas: 1 }]);
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.fato_apontamento WHERE logged_time_id = $1`, [String(b + 20)])).toBe(0);
    // o incremental roda (há marca) e fecha sucesso mesmo com a recusa ainda na origem
    expect(await m.rodar(incremental)).toMatchObject({ estado: 'sucesso', recusados: { 'tempo-invalido': 1 } });
    // a origem corrige o registro: entra como versão nova (a varredura o relê)
    m.servidor.cenario.registros[5] = { ...ruim, time: 600 };
    expect(await m.rodar(incremental)).toMatchObject({ estado: 'sucesso', inseridos: 1, recusados: {} });
    expect((await fatos([String(b + 20)]))[0]).toMatchObject({ segundos: 600, versoes: 1 });
  });

  it('A7: recusa com logged_time_id válido não tira o lote de completo (nada de exclusão falsa); com id inválido tira (nenhuma exclusão naquela execução)', async () => {
    const b = base();
    await criarCards([{ id: b + 1 }]);
    const regs = Array.from({ length: 10 }, (_, i) => registroWorklog({ logged_time_id: b + 10 + i, card_id: b + 1, user_id: null }));
    const m = await montar({ registros: regs });
    await m.rodar(carga);
    // o 15 passa a vir inválido (id válido, horas 0) e o 10 some de verdade: só o 10 é excluído; o 15 continua ativo
    m.servidor.cenario.registros = regs.slice(1).map((r) => (r.logged_time_id === b + 15 ? { ...r, time: 0 } : r));
    const com = await m.rodar(incremental);
    expect(com).toMatchObject({ estado: 'sucesso', excluidos: 1, recusados: { 'tempo-invalido': 1 } });
    expect((await fatos([String(b + 10)]))[0]!.excluido_em).not.toBeNull();
    expect((await fatos([String(b + 15)]))[0]!.excluido_em).toBeNull();
    // um registro com id inválido no lote: não se sabe de quem é, o lote deixa de ser completo e o 11 (que some agora) não é excluído
    m.servidor.cenario.registros = [...m.servidor.cenario.registros.filter((r) => r.logged_time_id !== b + 11), registroWorklog({ logged_time_id: 'sem-id', card_id: b + 1 })];
    const sem = await m.rodar(incremental);
    expect(sem).toMatchObject({ estado: 'sucesso', excluidos: 0 });
    expect((await fatos([String(b + 11)]))[0]!.excluido_em).toBeNull();
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.evt_apontamento WHERE logged_time_id = $1`, [String(b + 11)])).toBe(0);
  });

  it('A7: guarda recusa_em_massa (mais de 5 por cento dos lidos, com pelo menos 10 recusas) fecha parcial, a marca não anda e o checkpoint da carga fica; classificacao-falhou segue parcial', async () => {
    const b = base();
    await criarCards([{ id: b + 1 }]);
    const boas = Array.from({ length: 150 }, (_, i) => registroWorklog({ logged_time_id: b + 100 + i, card_id: b + 1, user_id: null }));
    const ruins = Array.from({ length: 10 }, (_, i) => registroWorklog({ logged_time_id: b + 500 + i, card_id: b + 1, user_id: null, time: 0 }));
    const m = await montar({ registros: [...boas, ...ruins] });
    const r = await m.rodar(carga);
    expect(r).toMatchObject({ estado: 'parcial', falhas: { recusa_em_massa: 1 }, recusados: { 'tempo-invalido': 10 }, inseridos: 150 });
    const ctl = await dono.query<{ status: string; marca: Date | null; lotes: number }>(`SELECT status, marca_dagua_ate AS marca, (parametros ->> 'lotes_concluidos')::int AS lotes FROM ${S.bm}.ctl_coleta WHERE coleta_id = $1`, [r.coletaId]);
    expect(ctl.rows[0]).toEqual({ status: 'parcial', marca: null, lotes: 0 });
    const f = await dono.query<{ erro: string; id_origem: string | null }>(`SELECT erro, id_origem FROM ${S.bm}.ctl_coleta_falha WHERE coleta_id = $1 AND erro = 'recusa_em_massa'`, [r.coletaId]);
    expect(f.rows).toEqual([{ erro: 'recusa_em_massa', id_origem: null }]);
    // classificação que lança: defeito nosso, não da origem: parcial, com a falha só com código e id
    const b2 = base();
    await criarCards([{ id: b2 + 1 }]);
    const m2 = await montar({ registros: [registroWorklog({ logged_time_id: b2 + 10, card_id: b2 + 1, user_id: null, comment: 'lança' })] });
    m2.deps.classificar = (e) => { if (e.comentario === 'lança') throw new Error('COMENTARIO-NA-MENSAGEM'); return classificar(e); };
    const r2 = await m2.rodar(carga);
    expect(r2).toMatchObject({ estado: 'parcial', falhas: { 'classificacao-falhou': 1 }, recusados: {} });
    const f2 = await dono.query<{ erro: string; id_origem: string | null }>(`SELECT erro, id_origem FROM ${S.bm}.ctl_coleta_falha WHERE coleta_id = $1`, [r2.coletaId]);
    expect(f2.rows).toEqual([{ erro: 'classificacao-falhou', id_origem: String(b2 + 10) }]);
  });

  it('supressão: o user_id eliminado não é pedido a /users, não vira linha em dim_responsavel nem pessoa_ref; o outro segue (CT-85, CA-AP-10)', async () => {
    const b = base();
    await criarCards([{ id: b + 1 }]);
    usuarios.push(String(b + 100), String(b + 101));
    await dono.query(`INSERT INTO ${S.bm}.cfg_pessoa_eliminada (hash_usuario, eliminada_em) VALUES (decode($1, 'hex'), '2026-11-04')`, [hmacUsuario(SAL, String(b + 100))]);
    const regs = [registroWorklog({ logged_time_id: b + 11, card_id: b + 1, user_id: b + 100 }), registroWorklog({ logged_time_id: b + 12, card_id: b + 1, user_id: b + 101 })];
    const m = await montar({ registros: regs, users: { ...pessoa(b + 100, 'PESSOA-FICTICIA-ELIMINADA'), ...pessoa(b + 101, 'PESSOA-FICTICIA-D') } });
    await m.rodar(carga);
    await m.rodar(incremental);
    expect(m.servidor.usuariosPedidos.has(String(b + 100))).toBe(false);
    expect(m.servidor.usuariosPedidos.get(String(b + 101))).toBe(1);
    const f = await fatos([String(b + 11), String(b + 12)]);
    expect(f[0]!.pessoa_ref).toBeNull();
    expect(f[1]!.pessoa_ref).not.toBeNull();
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.dim_responsavel WHERE responsavel_id = $1`, [String(b + 100)])).toBe(0);
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.cfg_pessoa_eliminada x WHERE x::text LIKE $1`, [`%${b + 100}%`])).toBe(0);
  });

  it('hierarquia: dim_card_raiz até a iniciativa e fato com a mesma raiz; sem iniciativa liga o bit 8; ciclo e pai fora do escopo (CT-35)', async () => {
    const b = base();
    await criarCards([
      { id: b + 1, granularidade: 'projeto' }, { id: b + 2, pai: b + 1, granularidade: 'frente' }, { id: b + 3, pai: b + 2, granularidade: 'story' },
      { id: b + 4 }, { id: b + 5, pai: b + 4 }, { id: b + 6, pai: b + 7 }, { id: b + 7, pai: b + 6 }, { id: b + 8, pai: b + 999 },
    ]);
    const cartoes = [3, 5, 6, 8].map((i) => registroWorklog({ logged_time_id: b + 20 + i, card_id: b + i, user_id: null }));
    const sub = registroWorklog({ logged_time_id: b + 30, card_id: b + 900, parent_card_id: b + 3, user_id: null });
    const m = await montar({ registros: [...cartoes, sub] });
    await m.rodar(carga);
    const raiz = async (id: number) => (await dono.query(`SELECT raiz_card_id, profundidade, raiz_eh_iniciativa, raiz_fora_do_escopo FROM ${S.bm}.dim_card_raiz WHERE card_id = $1`, [String(id)])).rows[0];
    expect(await raiz(b + 3)).toEqual({ raiz_card_id: String(b + 1), profundidade: 2, raiz_eh_iniciativa: true, raiz_fora_do_escopo: false });
    expect(await raiz(b + 1)).toEqual({ raiz_card_id: String(b + 1), profundidade: 0, raiz_eh_iniciativa: true, raiz_fora_do_escopo: false });
    expect(await raiz(b + 5)).toEqual({ raiz_card_id: String(b + 4), profundidade: 1, raiz_eh_iniciativa: false, raiz_fora_do_escopo: false });
    expect(await raiz(b + 6)).toEqual({ raiz_card_id: String(b + 7), profundidade: 1, raiz_eh_iniciativa: false, raiz_fora_do_escopo: false });
    expect(await raiz(b + 8)).toEqual({ raiz_card_id: String(b + 8), profundidade: 0, raiz_eh_iniciativa: false, raiz_fora_do_escopo: true });
    const f = await fatos([b + 23, b + 25, b + 26, b + 28, b + 30].map(String));
    // A6: o fato e a raiz nunca divergem; a subtarefa (card fora do escopo) herda a raiz do pai
    expect(f.map((x) => x.iniciativa_card_id)).toEqual([String(b + 1), String(b + 4), String(b + 7), String(b + 8), String(b + 1)]);
    expect(f.map((x) => (x.flags_qualidade & 8) !== 0)).toEqual([false, true, true, true, false]);
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.fato_apontamento f JOIN ${S.bm}.dim_card_raiz r ON r.card_id = f.card_id WHERE f.card_id = ANY($1::text[]) AND f.iniciativa_card_id <> r.raiz_card_id`, [[3, 5, 6, 8].map((i) => String(b + i))])).toBe(0);
    // mudança na hierarquia é refeita na execução seguinte
    await dono.query(`UPDATE ${S.bm}.dim_card SET card_pai = NULL WHERE card_id = $1`, [String(b + 5)]);
    await m.rodar(incremental);
    expect(await raiz(b + 5)).toMatchObject({ raiz_card_id: String(b + 5), profundidade: 0 });
  });

  it('escopo: só os cards de dim_card, menos os de workflow fora de todo cálculo (H-7); o type_id vem da última versão na staging', async () => {
    // tudo dentro de uma transação desfeita: a referência de vigência é append-only e não pode sobrar para os outros testes
    const b = base();
    const c = await dono.connect();
    try {
      await c.query('BEGIN');
      const coleta = (await c.query<{ coleta_id: string }>(`INSERT INTO ${S.bm}.ctl_coleta (tarefa, iniciado_em, status, versao_coletor) VALUES ('reconciliacao', now(), 'em_andamento', 'ap-teste') RETURNING coleta_id`)).rows[0]!.coleta_id;
      const wf = String(b);
      for (const [id, workflow, tipo] of [[b + 1, wf, 7], [b + 2, '123', 8], [b + 3, '123', 9]] as const) {
        await c.query(`INSERT INTO ${S.bm}.dim_card (card_id, coletado_em, atualizado_por_coleta_id) VALUES ($1, now(), $2)`, [String(id), coleta]);
        // duas versões na staging (cadeia por anterior_sk): vale a última
        let anterior: string | null = null;
        for (const [v, t] of [['0', 1], ['1', tipo]] as const) {
          anterior = (await c.query<{ stg_sk: string }>(
            `INSERT INTO ${S.bm}.stg_card (id_origem, anterior_sk, payload_sha256, payload, quadro_id, arquivado, excluido_detectado, coletado_em, coleta_id)
             VALUES ($1, $2, decode($3, 'hex'), $4::jsonb, '1', false, false, now(), $5) RETURNING stg_sk`,
            [String(id), anterior, SHA(`${id % 10}${v}a`), JSON.stringify({ card_id: id, type_id: t, workflow_id: workflow }), coleta])).rows[0]!.stg_sk;
        }
      }
      await c.query(`INSERT INTO ${S.bm}.dim_card (card_id, coletado_em, atualizado_por_coleta_id) VALUES ('abc', now(), $1)`, [coleta]); // id que não é de card do BusinessMap: fora do escopo
      const versao = (await c.query<{ versao_id: string }>(
        `INSERT INTO ${S.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em) VALUES ('2026-11-04', 'businessmap', 'teste do 059', 'teste', $1, now()) RETURNING versao_id`, [`teste-059-${b}`])).rows[0]!.versao_id;
      await c.query(
        `INSERT INTO ${S.bm}.ref_time_workflow (workflow_id, vigente_de, quadro_id, time_id, situacao, motivo_fora, motivo, versao_id, registrado_por) VALUES ($1, '2026-01-01', '1', NULL, 'fora', 'fora_de_todo_calculo', 'carga_inicial', $2, 'teste-059')`, [wf, versao]);
      // outro workflow, fora só do operacional: continua no escopo da aba (a exclusão do painel operacional não vale aqui, C-12)
      await c.query(
        `INSERT INTO ${S.bm}.ref_time_workflow (workflow_id, vigente_de, quadro_id, time_id, situacao, motivo_fora, motivo, versao_id, registrado_por) VALUES ('123', '2026-01-01', '1', NULL, 'fora', 'fora_do_operacional', 'carga_inicial', $1, 'teste-059')`, [versao]);
      const todos = await escopoDoWorklog(c, S);
      expect(todos.map((x) => x.card_id)).not.toContain('abc');
      const escopo = todos.filter((x) => [b + 1, b + 2, b + 3].map(String).includes(x.card_id));
      expect(escopo).toEqual([{ card_id: String(b + 2), type_id: '8' }, { card_id: String(b + 3), type_id: '9' }]);
    } finally {
      await c.query('ROLLBACK');
      c.release();
    }
  });

  it('atomicidade (CT-79): falha na projeção desfaz a staging do lote e a marca não avança; a execução seguinte relê sem duplicar', async () => {
    const b = base();
    await criarCards([{ id: b + 1 }]);
    const regs = [registroWorklog({ logged_time_id: b + 11, card_id: b + 1, user_id: null })];
    const cliente = (c: ClienteLike): ClienteLike => ({ query: (t, v) => (t.includes(`INSERT INTO ${S.bm}.fato_apontamento`) ? Promise.reject(new Error('falha simulada')) : c.query(t, v)), release: (x) => c.release(x) });
    const poolQuebrado: PoolLike = {
      query: (t, v) => coletor.query(t, v), end: () => Promise.resolve(),
      connect: async () => cliente(await coletor.connect() as unknown as ClienteLike) as ClienteLike,
    };
    const quebrado = await montar({ registros: regs }, poolQuebrado);
    await expect(quebrado.rodar(carga)).rejects.toThrow('falha simulada');
    expect(await n(`SELECT count(*) AS n FROM ${S.bm}.stg_apontamento WHERE logged_time_id = $1`, [String(b + 11)])).toBe(0);
    const falhou = await dono.query<{ status: string; marca: Date | null; erro_resumo: string }>(`SELECT status, marca_dagua_ate AS marca, erro_resumo FROM ${S.bm}.ctl_coleta WHERE tarefa = 'apontamento' ORDER BY coleta_id DESC LIMIT 1`);
    expect(falhou.rows[0]).toEqual({ status: 'falha', marca: null, erro_resumo: 'desconhecido: erro-interno' });
    const ok = await montar({ registros: regs });
    expect(await ok.rodar(carga)).toMatchObject({ estado: 'sucesso', inseridos: 1 });
    expect(await ok.rodar(incremental)).toMatchObject({ estado: 'sucesso', inseridos: 0 });
  });

  it('carga inicial retomável por lote: o checkpoint fica em ctl_coleta e a retomada recomeça do lote não concluído, sem refazer os anteriores (CT-80)', async () => {
    const b = base();
    await criarCards(Array.from({ length: 450 }, (_, i) => ({ id: b + i })));
    const regs = [registroWorklog({ logged_time_id: b + 900, card_id: b + 5, user_id: null })];
    // o lote 2 (cards 200 a 399 do escopo ordenado) falha com 404; o escopo inclui cards de outros testes, então o corte é pelos ids do lote
    let falhar = true;
    const m = await montar({ registros: regs, statusPorLote: (c) => (falhar && c.includes(String(b + 399)) ? 404 : undefined) });
    const primeira = await m.rodar(carga);
    expect(primeira.estado).toBe('parcial');
    const cp = await dono.query<{ parametros: { lotes_concluidos: number } }>(`SELECT parametros FROM ${S.bm}.ctl_coleta WHERE coleta_id = $1`, [primeira.coletaId]);
    expect(cp.rows[0]!.parametros.lotes_concluidos).toBe(primeira.lotesConcluidos);
    const pedidosAntes = m.servidor.pedidos.filter((p) => p.caminho === '/loggedTime').length;
    falhar = false;
    const segunda = await m.rodar(carga);
    expect(segunda).toMatchObject({ estado: 'sucesso', retomada: true });
    const novos = m.servidor.pedidos.filter((p) => p.caminho === '/loggedTime').length - pedidosAntes;
    expect(novos).toBeLessThan(pedidosAntes);
    expect(segunda.lotesConcluidos).toBeGreaterThan(primeira.lotesConcluidos);
  });

  it('type_id do fato (0029): vem do tipo do card na staging (ou do pai), é atualizado pela releitura, só aceita dígitos e o coletor o grava', async () => {
    const b = base();
    await criarCards([{ id: b + 1 }, { id: b + 2 }]);
    const coleta = await novaColeta(dono, S.bm);
    const tipoNoCard = async (id: number, tipo: number | string): Promise<void> => {
      await dono.query(
        `INSERT INTO ${S.bm}.stg_card (id_origem, anterior_sk, payload_sha256, payload, quadro_id, arquivado, excluido_detectado, coletado_em, coleta_id)
         VALUES ($1::text, (SELECT max(stg_sk) FROM ${S.bm}.stg_card WHERE id_origem = $1::text), decode($2, 'hex'), $3::jsonb, '1', false, false, now(), $4)`,
        [String(id), SHA(`${id}${tipo}`.replace(/\D/g, '').slice(-12)), JSON.stringify({ card_id: id, type_id: tipo, workflow_id: '1' }), coleta]);
    };
    await tipoNoCard(b + 1, 7);
    await tipoNoCard(b + 2, 8);
    const regs = [
      registroWorklog({ logged_time_id: b + 11, card_id: b + 1, comment: 'um' }),
      registroWorklog({ logged_time_id: b + 12, card_id: b + 99, parent_card_id: b + 2, comment: 'dois' }),
    ];
    const m = await montar({ registros: regs, users: {} });
    await m.rodar(carga);
    const tipos = async (): Promise<(string | null)[]> => (await dono.query<{ type_id: string | null }>(
      `SELECT type_id FROM ${S.bm}.fato_apontamento WHERE logged_time_id = ANY($1::text[]) ORDER BY logged_time_id`, [[String(b + 11), String(b + 12)]])).rows.map((r) => r.type_id);
    expect(await tipos()).toEqual(['7', '8']);
    // o card muda de tipo: a releitura (a varredura) leva o tipo novo ao fato, mesmo sem mudar o apontamento
    await tipoNoCard(b + 1, 9);
    expect(await m.rodar(incremental)).toMatchObject({ estado: 'sucesso', inseridos: 0 });
    expect(await tipos()).toEqual(['9', '8']);
    // CHECK de dígitos e o coletor (papel real) atualiza a coluna
    expect((await falha(dono, `UPDATE ${S.bm}.fato_apontamento SET type_id = 'abc' WHERE logged_time_id = '${b + 11}'`)).code).toBe('23514');
    await coletor.query(`UPDATE ${S.bm}.fato_apontamento SET type_id = '10' WHERE logged_time_id = $1`, [String(b + 11)]);
    expect(await tipos()).toEqual(['10', '8']);
    expect((await falha(api, `SELECT type_id FROM ${S.bm}.fato_apontamento LIMIT 1`)).code).toBe('42501');
  });

  it('A5 do review: a consulta por período usa os índices parciais de excluido_em nulo (EXPLAIN)', async () => {
    const plano = async (sql: string): Promise<string> => {
      const c = await dono.connect();
      try {
        await c.query('BEGIN');
        await c.query('SET LOCAL enable_seqscan = off');
        const r = await c.query<{ 'QUERY PLAN': string }>(`EXPLAIN ${sql}`);
        await c.query('ROLLBACK');
        return r.rows.map((l) => l['QUERY PLAN']).join('\n');
      } finally {
        c.release();
      }
    };
    // com as tabelas quase vazias o planejador desempata entre os índices parciais: o que vale é nunca cair em varredura sequencial (com mais linhas de outros testes o plano vira Bitmap Index Scan, que também usa o índice parcial)
    for (const where of [`data_apontamento BETWEEN '2026-10-01' AND '2026-10-31'`, `pessoa_ref = 3 AND data_apontamento BETWEEN '2026-10-01' AND '2026-10-31'`, `iniciativa_card_id = '5' AND data_apontamento >= '2026-10-01'`]) {
      const p = await plano(`SELECT segundos FROM ${S.bm}.fato_apontamento WHERE excluido_em IS NULL AND ${where}`);
      expect(p, where).toMatch(/(Index (Only )?Scan using|Bitmap Index Scan on) ix_fato_apontamento_(data|pessoa|iniciativa)/);
      expect(p, where).not.toContain('Seq Scan');
    }
    const defs = await dono.query<{ indexname: string; indexdef: string }>(`SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = $1 AND tablename = 'fato_apontamento' AND indexname LIKE 'ix_fato_apontamento_%'`, [S.bm]);
    for (const nome of ['ix_fato_apontamento_data', 'ix_fato_apontamento_pessoa', 'ix_fato_apontamento_iniciativa']) {
      expect(defs.rows.find((r) => r.indexname === nome)?.indexdef, nome).toMatch(/WHERE \(excluido_em IS NULL\)$/);
    }
    expect(await plano(`SELECT card_id FROM ${S.bm}.dim_card_raiz WHERE raiz_card_id = '5'`)).toContain('ix_dim_card_raiz_raiz');
  });
});
