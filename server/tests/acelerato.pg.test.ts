import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { coletarAcelerato } from '../src/modulos/acelerato/index.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { criarPool, urlDoPapel } from '../src/plataforma/db/pool.js';
import { CONFIG, LISTAS_BANCO, TLS, criarMysqlFalso, linha } from './acelerato-duble.js';
import { PROIBIDOS } from './fixtures/acelerato-linha-50-colunas.js';
import { poolDe, url } from './pg/ctx.js';

const d = describe.skipIf(!url);

/** Coletor do Acelerato contra PostgreSQL real (papel dspd_coletor, GRANT, gatilhos, CHECK), num conjunto próprio de schemas. */
d('coletor do Acelerato: staging, controle e papéis (pg)', () => {
  const prefixo = prefixoDeTeste();
  const E = montarEsquemas(prefixo);
  let dono: pg.Pool, coletor: pg.Pool, api: pg.Pool;
  const tabela = [linha({ ticket_key: 91 }), linha({ ticket_key: 92 }), linha({ ticket_key: 93, lixeira: 1, arquivado: 1 })];
  const log = { info: () => undefined, error: () => undefined };
  const deps = (mysql = criarMysqlFalso(tabela)) => ({
    pool: coletor, config: CONFIG, tls: TLS, S: E, agora: () => new Date('2026-10-30T12:00:00Z'), log, cliente: { conectar: mysql.conectar },
    dormir: () => Promise.resolve(),
  });
  const n = async (t: string, onde = 'true'): Promise<number> => Number((await dono.query<{ n: string }>(`SELECT count(*) AS n FROM ${E.ac}.${t} WHERE ${onde}`)).rows[0]!.n);
  const doPapel = (papel: string, senha: string): pg.Pool => criarPool(urlDoPapel(url!, papel, senha), { max: 2 });

  beforeAll(async () => {
    await migrar(url!, { prefixo });
    dono = poolDe();
    coletor = doPapel('dspd_coletor', process.env.DSPD_PWD_COLETOR ?? 'coletor_dev');
    api = doPapel('dspd_api', process.env.DSPD_PWD_API ?? 'api_dev');
    for (const [i, l] of LISTAS_BANCO.entries()) {
      await dono.query(`INSERT INTO ${E.ac}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ($1, $2, '2026-01-01', $3, $4)`, [l.campo, l.codigo, l.rotulo, i]);
    }
  });
  afterAll(async () => {
    await Promise.all([coletor, api].map((p) => p.end()));
    for (const e of [E.bm, E.ac, E.core]) await dono.query(`DROP SCHEMA IF EXISTS ${e} CASCADE`);
    await dono.end();
  });

  it('primeira carga: grava chamados e etapas, o controle com marca e parâmetros, e nenhuma linha traz marcador de pessoa', async () => {
    const r = await coletarAcelerato(deps(), 'incremental');
    expect(r).toMatchObject({ estado: 'ok', chamados: { lidos: 3, inseridos: 3 }, etapas: { lidos: 6, inseridos: 6 }, foraOrganizacoes: 0 });
    expect(await n('stg_chamado')).toBe(3);
    expect(await n('stg_etapa')).toBe(6);
    const ctl = (await dono.query(`SELECT tarefa, status, marca_dagua_ate, parametros FROM ${E.ac}.ctl_coleta`)).rows[0] as { tarefa: string; status: string; marca_dagua_ate: Date; parametros: Record<string, unknown> };
    expect(ctl).toMatchObject({ tarefa: 'coleta_incremental', status: 'sucesso' });
    expect(ctl.marca_dagua_ate.toISOString()).toBe('2026-09-02T13:30:00.000Z');
    expect(ctl.parametros.sql_sha256).toMatch(/^[0-9a-f]{64}$/);
    const tudo = JSON.stringify((await Promise.all(['stg_chamado', 'stg_etapa', 'ctl_coleta', 'ctl_coleta_contagem', 'ctl_coleta_falha']
      .map((t) => dono.query(`SELECT * FROM ${E.ac}.${t}`)))).map((x) => x.rows));
    for (const p of [...PROIBIDOS, CONFIG.senha, CONFIG.host, CONFIG.usuario]) expect(tudo.includes(p), p).toBe(false);
    expect(await n('ctl_coleta_contagem', "entidade = 'fora_organizacoes_recorte'")).toBe(1);
  });

  it('segunda coleta: hash igual ignora (nada novo, nada apagado); o excluído e o arquivado permanecem', async () => {
    const r = await coletarAcelerato(deps(), 'incremental');
    expect(r).toMatchObject({ estado: 'ok', semNovidade: true, chamados: { inseridos: 0, jaExistentes: 3 } });
    expect(await n('stg_chamado')).toBe(3);
    expect(await n('stg_chamado', `id_origem = '93' AND payload->>'lixeira' = 'true' AND payload->>'arquivado' = 'true'`)).toBe(1);
  });

  it('status mudado vira versão nova encadeada; a antiga permanece (SCD2, só INSERT)', async () => {
    const alterada = [linha({ ticket_key: 91, status: 'Aguardando atribuicao' }), tabela[1]!, tabela[2]!];
    await coletarAcelerato(deps(criarMysqlFalso(alterada)), 'releitura');
    const v = (await dono.query<{ stg_sk: string; anterior_sk: string | null; s: string }>(`SELECT stg_sk, anterior_sk, payload->>'status' AS s FROM ${E.ac}.stg_chamado WHERE id_origem = '91' ORDER BY stg_sk`)).rows;
    expect(v.map((x) => x.s)).toEqual(['Em diagnostico', 'Aguardando atribuicao']);
    expect(v[1]!.anterior_sk).toBe(v[0]!.stg_sk);
  });

  it('releitura: o chamado que saiu da tabela vira versão ausente_na_extracao (com as etapas), mesmo payload, e o que está fora do recorte vira fora_do_recorte', async () => {
    const enchimento = Array.from({ length: 60 }, (_, i) => linha({ ticket_key: 200 + i })); // a saída só passa de 5% com poucos conhecidos
    await coletarAcelerato(deps(criarMysqlFalso([...tabela, ...enchimento])), 'releitura');
    const fora = linha({ ticket_key: 92, tipo_ticket_key: 9999 });
    const mysql = criarMysqlFalso([fora, linha({ ticket_key: 91, status: 'Aguardando atribuicao' }), ...enchimento]);
    const r = await coletarAcelerato(deps(mysql), 'releitura');
    expect(r).toMatchObject({ estado: 'ok', foraDoRecorte: 1, ausentes: 1 });
    expect(await n('stg_chamado', `id_origem = '92' AND fora_do_recorte`)).toBe(1);
    expect(await n('stg_chamado', `id_origem = '93' AND ausente_na_extracao`)).toBe(1);
    expect(await n('stg_etapa', `chamado_id = '93' AND ausente_na_extracao`)).toBe(2);
    const a = (await dono.query<{ p: string }>(`SELECT payload::text AS p FROM ${E.ac}.stg_chamado WHERE id_origem = '93' ORDER BY stg_sk`)).rows;
    expect(a[1]!.p).toBe(a[0]!.p);
  });

  it('o papel do coletor só insere em stg_*: UPDATE e DELETE são negados; o dono é barrado pelo gatilho; a API não lê stg_*', async () => {
    await expect(coletor.query(`UPDATE ${E.ac}.stg_chamado SET payload = '{}'::jsonb`)).rejects.toMatchObject({ code: '42501' });
    await expect(coletor.query(`DELETE FROM ${E.ac}.stg_etapa`)).rejects.toMatchObject({ code: '42501' });
    await expect(coletor.query(`TRUNCATE ${E.ac}.stg_chamado`)).rejects.toMatchObject({ code: '42501' });
    await expect(dono.query(`DELETE FROM ${E.ac}.stg_chamado`)).rejects.toBeDefined();
    await expect(api.query(`SELECT payload FROM ${E.ac}.stg_chamado`)).rejects.toMatchObject({ code: '42501' });
    expect(await n('stg_chamado')).toBeGreaterThanOrEqual(3);
  });

  it('o CHECK do staging recusa status de SLA fora dos quatro valores da origem', async () => {
    const sha = Buffer.alloc(32, 1);
    const ins = (status: string) => dono.query(
      `INSERT INTO ${E.ac}.stg_chamado (id_origem, payload_sha256, payload, coletado_em, coleta_id) VALUES ('777', $1, $2::jsonb, now(), (SELECT min(coleta_id) FROM ${E.ac}.ctl_coleta))`,
      [sha, JSON.stringify({ sla_r_status: status })]);
    await expect(ins('Realizado dentro do prazo')).rejects.toMatchObject({ code: '23514' });
    await expect(ins('VENCIDO')).resolves.toBeDefined();
  });

  it('falha de origem grava só o código no controle e não deixa linha no staging', async () => {
    const antes = await n('stg_chamado');
    const mysql = criarMysqlFalso(tabela, { falharConexao: () => Object.assign(new Error('Access denied SENHA-DE-TESTE-056'), { code: 'ER_ACCESS_DENIED_ERROR' }) });
    await expect(coletarAcelerato(deps(mysql), 'incremental')).rejects.toMatchObject({ codigo: 'autenticacao' });
    expect(await n('stg_chamado')).toBe(antes);
    const f = (await dono.query(`SELECT erro_resumo, marca_dagua_ate FROM ${E.ac}.ctl_coleta WHERE status = 'falha'`)).rows;
    expect(f).toEqual([{ erro_resumo: 'autenticacao', marca_dagua_ate: null }]);
    expect(await n('ctl_coleta_falha', `erro = 'autenticacao' AND tentativas = 1`)).toBe(1);
  });
});
