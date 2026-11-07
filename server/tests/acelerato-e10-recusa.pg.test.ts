import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { coletarAcelerato } from '../src/modulos/acelerato/index.js';
import { analisarDominio, sincronizarDominio } from '../src/modulos/referencia/dominio-acelerato.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { criarPool, urlDoPapel } from '../src/plataforma/db/pool.js';
import { CONFIG, LISTAS_BANCO, TLS, criarMysqlFalso, linha } from './acelerato-duble.js';
import { poolDe, url } from './pg/ctx.js';

const d = describe.skipIf(!url);

/** E10, Lote 2 (opção C, P-E10-1): o reconhecimento exige vigência nova e versão `056:ref-dominio:` na data; edição direta no banco recusa. */
d('E10 Lote 2: recusa do reconhecimento contra PostgreSQL', () => {
  const P = prefixoDeTeste(), E = montarEsquemas(P);
  const DIA = '2026-11-05'; // dia civil (-03:00) do último sucesso: o relógio parte de 10:00Z e avança uma hora por coleta
  let dono: pg.Pool, coletor: pg.Pool, ref: pg.Pool;
  let relogio = new Date('2026-11-05T10:00:00Z');
  const mysql = criarMysqlFalso([linha({ ticket_key: 92 })]);
  const coletar = (reconhecerMudanca = false) => {
    relogio = new Date(relogio.getTime() + 3_600_000);
    return coletarAcelerato({
      pool: coletor, config: CONFIG, tls: TLS, S: E, agora: () => relogio, log: { info: () => undefined, error: () => undefined },
      cliente: { conectar: mysql.conectar }, dormir: () => Promise.resolve(), reconhecerMudanca,
    }, 'incremental');
  };
  const prioridades = LISTAS_BANCO.filter((l) => l.campo === 'prioridade').map((l) => ({ codigo: l.codigo, rotulo: l.rotulo }));
  const arquivo = (itens: { codigo: string; rotulo: string }[], ref_: string) => analisarDominio(JSON.stringify({
    versao: 1, versao_criterio: { dominio: 'acelerato', descricao: `Teste E10 ${ref_}`, motivo: 'Teste do Lote 2 do E10', referencia: ref_ },
    schema: 'dspd_ac', tabela: 'ref_dominio', regra: 'teste', dominios: { prioridade: itens },
  }));
  const contar = async (tabela: string): Promise<number> => Number((await dono.query(`SELECT count(*) AS n FROM ${E.ac}.${tabela}`)).rows[0].n);
  const ultimaFalha = async () => (await dono.query(`SELECT status, marca_dagua_ate, erro_resumo FROM ${E.ac}.ctl_coleta ORDER BY coleta_id DESC LIMIT 1`)).rows[0];

  beforeAll(async () => {
    await migrar(url!, { prefixo: P });
    dono = poolDe();
    coletor = criarPool(urlDoPapel(url!, 'dspd_coletor', process.env.DSPD_PWD_COLETOR ?? 'coletor_dev'), { max: 2 });
    ref = criarPool(urlDoPapel(url!, 'dspd_ref', process.env.DSPD_PWD_REF ?? 'ref_dev'), { max: 2 });
    for (const [i, l] of LISTAS_BANCO.entries())
      await dono.query(`INSERT INTO ${E.ac}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ($1, $2, '2026-01-01', $3, $4)`, [l.campo, l.codigo, l.rotulo, i]);
    expect((await coletar()).estado).toBe('ok');
  }, 120_000);
  afterAll(async () => {
    await Promise.all([coletor.end(), ref.end()]);
    for (const e of [E.bm, E.ac, E.core]) await dono.query(`DROP SCHEMA IF EXISTS ${e} CASCADE`);
    await dono.end();
  });

  it('ac:ref-sync seguido do reconhecimento passa', async () => {
    const lido = arquivo([...prioridades, { codigo: 'Critica', rotulo: 'Critica' }], 'e10-nova');
    await sincronizarDominio(ref, E, lido, DIA, relogio);
    await expect(coletar()).rejects.toMatchObject({ codigo: 'parametros-mudaram', coluna: 'vocabulario_sha256' });
    expect(await coletar(true)).toMatchObject({ estado: 'ok', modo: 'incremental' });
  }, 60_000);

  it('INSERT direto pelo dono do schema recusa com reconhecimento-sem-versao; a contagem de staging e de ref_dominio não muda', async () => {
    await dono.query(`INSERT INTO ${E.ac}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ('equipe', '999', $1, 'Equipe injetada', 99)`, [DIA]);
    const [stg, dom, conexoes] = [await contar('stg_chamado'), await contar('ref_dominio'), mysql.reg.conexoes];
    await expect(coletar(true)).rejects.toMatchObject({ codigo: 'reconhecimento-sem-versao', coluna: 'recorte_sha256' });
    expect(await ultimaFalha()).toMatchObject({ status: 'falha', marca_dagua_ate: null, erro_resumo: 'reconhecimento-sem-versao (recorte_sha256)' });
    expect([await contar('stg_chamado'), await contar('ref_dominio'), mysql.reg.conexoes]).toEqual([stg, dom, conexoes]);
    await dono.query(`DELETE FROM ${E.ac}.ref_dominio WHERE campo = 'equipe' AND codigo = '999'`);
  }, 60_000);

  it('UPDATE de rotulo no lugar recusa com lista-sobrescrita', async () => {
    const equipe = LISTAS_BANCO.find((l) => l.campo === 'equipe')!;
    await dono.query(`UPDATE ${E.ac}.ref_dominio SET rotulo = 'Sobrescrita' WHERE campo = 'equipe' AND codigo = $1`, [equipe.codigo]);
    await expect(coletar(true)).rejects.toMatchObject({ codigo: 'lista-sobrescrita', coluna: 'recorte_sha256' });
    expect(await ultimaFalha()).toMatchObject({ status: 'falha', marca_dagua_ate: null, erro_resumo: 'lista-sobrescrita (recorte_sha256)' });
    await dono.query(`UPDATE ${E.ac}.ref_dominio SET rotulo = $2 WHERE campo = 'equipe' AND codigo = $1`, [equipe.codigo, equipe.rotulo]);
  }, 60_000);

  it('INSERT com vigente_de antigo recusa com lista-sobrescrita', async () => {
    await dono.query(`INSERT INTO ${E.ac}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ('equipe', '998', '2026-02-01', 'Equipe antiga', 98)`);
    await expect(coletar(true)).rejects.toMatchObject({ codigo: 'lista-sobrescrita', coluna: 'recorte_sha256' });
    await dono.query(`DELETE FROM ${E.ac}.ref_dominio WHERE campo = 'equipe' AND codigo = '998'`);
  }, 60_000);

  it('lista revertida pelo ac:ref-sync (data nova, versão nova) passa', async () => {
    const lido = arquivo(prioridades, 'e10-revertida');
    expect(await sincronizarDominio(ref, E, lido, '2026-11-06', relogio)).toMatchObject({ fechadas: 1, versaoRegistrada: true });
    expect(await coletar(true)).toMatchObject({ estado: 'ok', modo: 'incremental' });
  }, 60_000);
});
