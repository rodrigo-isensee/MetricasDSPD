import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { coletarAcelerato } from '../src/modulos/acelerato/index.js';
import { analisarDominio, referenciaDaVersao, sincronizarDominio } from '../src/modulos/referencia/dominio-acelerato.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { criarPool, urlDoPapel } from '../src/plataforma/db/pool.js';
import { CONFIG, LISTAS_BANCO, TLS, criarMysqlFalso, linha } from './acelerato-duble.js';
import { poolDe, url } from './pg/ctx.js';

const d = describe.skipIf(!url);

/** K-224 (pedido 073, E3.1): `ac:ref-sync` muda a lista, a coleta seguinte recusa, o reconhecimento libera; natureza_prefixo só registra versão. */
d('CA-8 e ac:ref-sync contra PostgreSQL (recorte, vocabulário e natureza_prefixo)', () => {
  const P = prefixoDeTeste(), E = montarEsquemas(P);
  let dono: pg.Pool, coletor: pg.Pool, ref: pg.Pool;
  let relogio = new Date('2026-11-05T10:00:00Z');
  let mysql = criarMysqlFalso([linha({ ticket_key: 91 })]);
  const coletar = (reconhecerMudanca = false) => {
    relogio = new Date(relogio.getTime() + 3_600_000);
    return coletarAcelerato({
      pool: coletor, config: CONFIG, tls: TLS, S: E, agora: () => relogio, log: { info: () => undefined, error: () => undefined },
      cliente: { conectar: mysql.conectar }, dormir: () => Promise.resolve(), reconhecerMudanca,
    }, 'incremental');
  };
  const arquivo = (dominios: Record<string, { codigo: string; rotulo: string }[]>, ref_: string) => analisarDominio(JSON.stringify({
    versao: 1, versao_criterio: { dominio: 'acelerato', descricao: `Teste CA-8 ${ref_}`, motivo: 'Teste do K-224', referencia: ref_ },
    schema: 'dspd_ac', tabela: 'ref_dominio', regra: 'teste', dominios,
  }));
  const versoes = async (sha: string): Promise<number> =>
    Number((await dono.query(`SELECT count(*) AS n FROM ${E.core}.ref_versao_criterio WHERE dominio = 'acelerato' AND referencia = $1`, [referenciaDaVersao(sha)])).rows[0].n);

  beforeAll(async () => {
    await migrar(url!, { prefixo: P });
    dono = poolDe();
    coletor = criarPool(urlDoPapel(url!, 'dspd_coletor', process.env.DSPD_PWD_COLETOR ?? 'coletor_dev'), { max: 2 });
    ref = criarPool(urlDoPapel(url!, 'dspd_ref', process.env.DSPD_PWD_REF ?? 'ref_dev'), { max: 2 });
    for (const [i, l] of LISTAS_BANCO.entries())
      await dono.query(`INSERT INTO ${E.ac}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ($1, $2, '2026-01-01', $3, $4)`, [l.campo, l.codigo, l.rotulo, i]);
  }, 120_000);
  afterAll(async () => {
    await Promise.all([coletor.end(), ref.end()]);
    for (const e of [E.bm, E.ac, E.core]) await dono.query(`DROP SCHEMA IF EXISTS ${e} CASCADE`);
    await dono.end();
  });

  it('natureza_prefixo: o ac:ref-sync grava a versão de critério e a coleta seguinte não é recusada (P-E3-1)', async () => {
    expect((await coletar()).estado).toBe('ok');
    const lido = arquivo({ natureza_prefixo: [{ codigo: 'SSSC-I', rotulo: 'incidente' }] }, 'natureza');
    expect(await sincronizarDominio(ref, E, lido, '2026-11-05', relogio)).toMatchObject({ inseridas: 1, fechadas: 0, versaoRegistrada: true });
    expect(await versoes(lido.sha256)).toBe(1);
    expect((await coletar()).estado).toBe('ok'); // sem --reconhecer-mudanca
  }, 60_000);

  it('equipe muda pelo ac:ref-sync: a vigência fecha sem apagar, a coleta seguinte recusa com recorte_sha256, e reconhecida relê o recorte', async () => {
    const equipe = LISTAS_BANCO.find((l) => l.campo === 'equipe')!;
    const lido = arquivo({ equipe: [{ codigo: equipe.codigo, rotulo: 'Equipe renomeada' }, { codigo: '999', rotulo: 'Equipe nova' }] }, 'equipe');
    expect(await sincronizarDominio(ref, E, lido, '2026-11-06', relogio)).toMatchObject({ inseridas: 2, fechadas: 1, versaoRegistrada: true });
    expect(await versoes(lido.sha256)).toBe(1);
    // O Acelerato passa a devolver o nome novo da equipe: o chamado só fica no recorte se o nome que ele traz casar com a lista vigente (CA-11, falha fechado).
    mysql = criarMysqlFalso([linha({ ticket_key: 91, equipe: 'Equipe renomeada' })]);
    const linhas = (await dono.query(`SELECT codigo, rotulo, vigente_ate FROM ${E.ac}.ref_dominio WHERE campo = 'equipe' ORDER BY codigo, vigente_de`)).rows;
    expect(linhas).toHaveLength(3); // a linha antiga fica, com a vigência fechada
    expect(linhas.filter((l) => l.vigente_ate === null)).toHaveLength(2);

    const antes = mysql.reg.conexoes;
    await expect(coletar()).rejects.toMatchObject({ codigo: 'parametros-mudaram', coluna: 'recorte_sha256' });
    expect(mysql.reg.conexoes).toBe(antes);
    const falha = (await dono.query(`SELECT status, marca_dagua_ate, erro_resumo FROM ${E.ac}.ctl_coleta ORDER BY coleta_id DESC LIMIT 1`)).rows[0];
    expect(falha).toMatchObject({ status: 'falha', marca_dagua_ate: null, erro_resumo: 'parametros-mudaram (recorte_sha256)' });

    const r = await coletar(true);
    expect(r).toMatchObject({ estado: 'ok', modo: 'releitura' });
    const ultima = (await dono.query(`SELECT tarefa, marca_dagua_ate FROM ${E.ac}.ctl_coleta WHERE status = 'sucesso' ORDER BY coleta_id DESC LIMIT 1`)).rows[0];
    expect(ultima).toMatchObject({ tarefa: 'varredura', marca_dagua_ate: null });
    expect((await coletar()).estado).toBe('ok'); // reconhecida, a seguinte segue sem a opção
  }, 60_000);

  it('prioridade muda pelo ac:ref-sync: recusa com vocabulario_sha256; reconhecida segue incremental', async () => {
    const prioridade = LISTAS_BANCO.find((l) => l.campo === 'prioridade')!;
    const lido = arquivo({ prioridade: [{ codigo: prioridade.codigo, rotulo: prioridade.rotulo }, { codigo: 'Critica', rotulo: 'Critica' }] }, 'prioridade');
    await sincronizarDominio(ref, E, lido, '2026-11-07', relogio);
    await expect(coletar()).rejects.toMatchObject({ codigo: 'parametros-mudaram', coluna: 'vocabulario_sha256' });
    expect(await coletar(true)).toMatchObject({ estado: 'ok', modo: 'incremental' });
  }, 60_000);
});
