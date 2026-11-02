import { createHash } from 'node:crypto';
import type pg from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { executarApontamento } from '../src/modulos/businessmap/apontamento/comando.js';
import {
  analisarDicionario, carregarDicionario, lerDicionario, sincronizarDicionario, type ArquivoDicionario,
} from '../src/modulos/businessmap/apontamento/dicionario.js';
import { montarDepsApontamento } from '../src/modulos/businessmap/apontamento/montagem.js';
import type { PoolLike } from '../src/plataforma/db/pool.js';
import { criarClienteHttp } from '../src/plataforma/http.js';
import { cenarioWorklogVazio, registroWorklog, subirServidorWorklog } from './apontamento-duble.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { novaColeta, poolDe, unico, url } from './pg/ctx.js';

// Pedido 059, E2.19: carga do dicionário por ref:sync contra o PostgreSQL local, com os papéis reais (dspd_ref grava, dspd_coletor lê,
// dspd_api não vê nada). `ref_tipo_card` é append-only (gatilho de vigência) e outros testes supõem a tabela vazia: este arquivo migra os
// próprios schemas (prefixo único, como o teste da pesquisa) e os derruba no fim, sem deixar nada no schema compartilhado da execução.
const d = describe.skipIf(!url);
const DIA = '2026-11-02';

d('059: dicionário do apontamento (ref:sync) no PostgreSQL', () => {
  let dono: pg.Pool, ref: pg.Pool, coletor: pg.Pool, api: pg.Pool;
  const prefixo = prefixoDeTeste();
  const S = montarEsquemas(prefixo);
  const sufixo = unico('');
  const kaizen = `Kaizen-${sufixo}`;
  const incidente = `Incidente de Produção ${sufixo}`;
  const tipoKaizen = String(9_700_000_000 + Math.floor(Math.random() * 1_000_000));
  const tipoIncidente = String(Number(tipoKaizen) + 1_000_001);
  const arquivo = (extra: Partial<ArquivoDicionario> = {}): ArquivoDicionario => ({
    versao: `t-${sufixo.slice(0, 8)}`,
    subgrupos: [{ codigo: 'gestao', rotulo: 'Gestão', prioridade: 1 }, { codigo: 'testes', rotulo: 'Testes', prioridade: 2 }, { codigo: 'execucao-tecnica', rotulo: 'Execução técnica', prioridade: 3 }],
    termos: [{ subgrupo: 'testes', termos: ['teste', 'homolog'] }],
    regrasPorTipo: [{ tipoRotulo: kaizen, condicao: 'sempre', subgrupo: 'gestao' }, { tipoRotulo: incidente, condicao: 'sem-comentario', subgrupo: 'execucao-tecnica' }],
    subtarefa: [{ codigo: 'direto-no-card', rotulo: 'Direto no card' }],
    ...extra,
  });
  const lido = (a: ArquivoDicionario, texto = 'x') => ({ arquivo: a, sha256: createHash('sha256').update(`${JSON.stringify(a)}${texto}`).digest('hex') });
  const como = (p: pg.Pool): PoolLike => p as unknown as PoolLike;
  const n = async (tabela: string): Promise<number> => Number((await dono.query<{ n: string }>(`SELECT count(*) AS n FROM ${S.bm}.${tabela}`)).rows[0]!.n);
  const falha = async (p: pg.Pool, sql: string): Promise<{ code?: string }> => {
    try { await p.query(sql); } catch (e) { return e as { code?: string }; }
    throw new Error(`esperava falha do banco: ${sql.slice(0, 80)}`);
  };
  const limpar = async (): Promise<void> => {
    await dono.query(`DELETE FROM ${S.bm}.ref_apontamento_regra_tipo`);
    await dono.query(`DELETE FROM ${S.bm}.ref_apontamento_termo`);
    await dono.query(`DELETE FROM ${S.bm}.ref_apontamento_subgrupo`);
    await dono.query(`DELETE FROM ${S.core}.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia LIKE '059:ref-apontamento:%'`);
  };

  beforeAll(async () => {
    await migrar(url!, { prefixo });
    dono = poolDe(); ref = poolDe('dspd_ref'); coletor = poolDe('dspd_coletor'); api = poolDe('dspd_api');
    for (const [id, nome] of [[tipoKaizen, kaizen], [tipoIncidente, incidente]] as const) {
      await dono.query(`INSERT INTO ${S.bm}.ref_tipo_card (tipo_id, vigente_de, nome, eh_item, categoria) VALUES ($1, '2020-01-01', $2, false, NULL)`, [id, nome]);
    }
    await limpar();
  });
  beforeEach(limpar);
  afterAll(async () => {
    await limpar();
    for (const e of [S.bm, S.ac, S.core]) await dono.query(`DROP SCHEMA IF EXISTS ${e} CASCADE`);
    await Promise.all([dono, ref, coletor, api].map((p) => p.end()));
  });

  it('primeira carga com o papel dspd_ref: versão de critério T2.6, linhas com o id dela, rótulo do tipo resolvido e condição com sublinhado', async () => {
    const r = await sincronizarDicionario(como(ref), S, lido(arquivo()), DIA, new Date('2026-11-02T12:00:00Z'));
    expect(r).toMatchObject({ subgrupos: 3, termos: 2, regras: 2, versaoRegistrada: true });
    const v = await dono.query<{ versao_id: string; vigente_desde: string; referencia: string }>(
      `SELECT versao_id, vigente_desde::text, referencia FROM ${S.core}.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia LIKE '059:ref-apontamento:%'`);
    expect(v.rows).toHaveLength(1);
    expect(v.rows[0]).toMatchObject({ vigente_desde: DIA, referencia: `059:ref-apontamento:${arquivo().versao}:${r.sha256}` });
    const regras = await dono.query<{ type_id: string; condicao: string; subgrupo_codigo: string; incluido_por_versao_id: string }>(
      `SELECT type_id, condicao, subgrupo_codigo, incluido_por_versao_id FROM ${S.bm}.ref_apontamento_regra_tipo ORDER BY type_id`);
    expect(regras.rows).toEqual([
      { type_id: tipoKaizen, condicao: 'sempre', subgrupo_codigo: 'gestao', incluido_por_versao_id: v.rows[0]!.versao_id },
      { type_id: tipoIncidente, condicao: 'sem_comentario', subgrupo_codigo: 'execucao-tecnica', incluido_por_versao_id: v.rows[0]!.versao_id },
    ]);
  });

  it('idempotente, aditiva e sem sobrescrever: relida nada muda; termo novo entra com versão nova; retirar ou mudar é recusado e desfaz tudo', async () => {
    await sincronizarDicionario(como(ref), S, lido(arquivo()), DIA, new Date());
    expect(await sincronizarDicionario(como(ref), S, lido(arquivo()), DIA, new Date())).toMatchObject({ subgrupos: 0, termos: 0, regras: 0, versaoRegistrada: false });
    expect(await n('ref_apontamento_termo')).toBe(2);
    const mais = arquivo({ termos: [{ subgrupo: 'testes', termos: ['teste', 'homolog', 'validac'] }] });
    expect(await sincronizarDicionario(como(ref), S, lido(mais, 'v2'), '2026-11-03', new Date())).toMatchObject({ termos: 1, versaoRegistrada: true });
    expect(await n('ref_apontamento_termo')).toBe(3);
    const versoes = await dono.query<{ vigente_desde: string }>(`SELECT vigente_desde::text FROM ${S.core}.ref_versao_criterio WHERE referencia LIKE '059:ref-apontamento:%' ORDER BY versao_id`);
    expect(versoes.rows.map((x) => x.vigente_desde)).toEqual([DIA, '2026-11-03']);
    // data anterior à última versão
    await expect(sincronizarDicionario(como(ref), S, lido(arquivo({ termos: [{ subgrupo: 'testes', termos: ['teste', 'homolog', 'validac', 'outro'] }] }), 'v3'), DIA, new Date())).rejects.toMatchObject({ tipo: 'vigencia' });
    // retirar um termo: recusa, nada é apagado
    await expect(sincronizarDicionario(como(ref), S, lido(arquivo({ termos: [{ subgrupo: 'testes', termos: ['teste'] }] }), 'v4'), '2026-11-04', new Date())).rejects.toMatchObject({ tipo: 'mudanca' });
    // tipo inexistente: recusa e a transação desfaz (nenhuma versão nova)
    const semTipo = arquivo({ regrasPorTipo: [{ tipoRotulo: 'Tipo que não existe 059', condicao: 'sempre', subgrupo: 'gestao' }] });
    await expect(sincronizarDicionario(como(ref), S, lido(semTipo, 'v5'), '2026-11-04', new Date())).rejects.toMatchObject({ tipo: 'mudanca' });
    expect(await n('ref_apontamento_termo')).toBe(3);
    expect(Number((await dono.query<{ n: string }>(`SELECT count(*) AS n FROM ${S.core}.ref_versao_criterio WHERE referencia LIKE '059:ref-apontamento:%'`)).rows[0]!.n)).toBe(2);
  });

  it('o banco recusa o que a carga não faz: o dspd_ref não atualiza nem apaga, o dspd_api não lê o dicionário, o coletor só lê', async () => {
    await sincronizarDicionario(como(ref), S, lido(arquivo()), DIA, new Date());
    expect((await falha(ref, `UPDATE ${S.bm}.ref_apontamento_termo SET termo_normalizado = 'zz'`)).code).toBe('42501');
    expect((await falha(ref, `DELETE FROM ${S.bm}.ref_apontamento_subgrupo`)).code).toBe('42501');
    for (const t of ['ref_apontamento_subgrupo', 'ref_apontamento_termo', 'ref_apontamento_regra_tipo']) {
      expect((await falha(api, `SELECT * FROM ${S.bm}.${t}`)).code, t).toBe('42501');
      expect((await falha(coletor, `INSERT INTO ${S.bm}.${t} DEFAULT VALUES`)).code, t).toBe('42501');
    }
  });

  it('o coletor lê o dicionário vigente na forma da biblioteca (prioridade do subgrupo, condição com hífen, versão do arquivo)', async () => {
    await sincronizarDicionario(como(ref), S, lido(arquivo()), DIA, new Date());
    const dic = await carregarDicionario(coletor, S);
    expect(dic.versao).toBe(arquivo().versao);
    expect(dic.termos).toEqual([{ prioridade: 2, subgrupo: 'testes', termos: ['homolog', 'teste'] }]);
    expect(dic.regrasPorTipo).toEqual(expect.arrayContaining([
      { prioridade: 1, subgrupo: 'gestao', typeId: tipoKaizen, condicao: 'sempre' },
      { prioridade: 3, subgrupo: 'execucao-tecnica', typeId: tipoIncidente, condicao: 'sem-comentario' },
    ]));
    await limpar();
    await expect(carregarDicionario(coletor, S)).rejects.toMatchObject({ codigo: 'dicionario' });
  });

  it('o arquivo versionado do repositório carrega inteiro (12 subgrupos) quando os dois tipos existem na referência', async () => {
    const real = lerDicionario();
    const achados = await dono.query<{ nome: string }>(`SELECT nome FROM ${S.bm}.ref_tipo_card WHERE vigente_ate IS NULL AND lower(nome) IN ('kaizen', 'incidente de produção')`);
    const tem = new Set(achados.rows.map((x) => x.nome.toLowerCase()));
    let proximo = 9_800_000_000 + Math.floor(Math.random() * 1_000_000);
    for (const nome of ['Kaizen', 'Incidente de Produção']) {
      if (!tem.has(nome.toLowerCase())) await dono.query(`INSERT INTO ${S.bm}.ref_tipo_card (tipo_id, vigente_de, nome, eh_item, categoria) VALUES ($1, '2020-01-01', $2, false, NULL)`, [String(proximo++), nome]);
    }
    const r = await sincronizarDicionario(como(ref), S, real, DIA, new Date());
    expect(r).toMatchObject({ subgrupos: 12, regras: 2, versaoRegistrada: true });
    expect(await n('ref_apontamento_termo')).toBe(real.arquivo.termos.flatMap((t) => t.termos).length);
    expect(analisarDicionario(JSON.stringify(real.arquivo)).arquivo).toEqual(real.arquivo);
  });

  it('ponta a ponta do comando: dicionário carregado por ref:sync, montado pelo coletor e aplicado na coleta (subgrupo, versão do arquivo e type_id no fato)', async () => {
    const b = 9_660_000_000 + Math.floor(Math.random() * 1000) * 1000;
    await sincronizarDicionario(como(ref), S, lido(arquivo()), DIA, new Date());
    const coleta = await novaColeta(dono, S.bm);
    for (const id of [b + 1, b + 2]) {
      await dono.query(`INSERT INTO ${S.bm}.dim_card (card_id, coletado_em, atualizado_por_coleta_id) VALUES ($1, now(), $2)`, [String(id), coleta]);
    }
    await dono.query(
      `INSERT INTO ${S.bm}.stg_card (id_origem, anterior_sk, payload_sha256, payload, quadro_id, arquivado, excluido_detectado, coletado_em, coleta_id)
       VALUES ($1, NULL, decode($2, 'hex'), $3::jsonb, '1', false, false, now(), $4)`, [String(b + 1), 'ab'.repeat(32), JSON.stringify({ card_id: b + 1, type_id: Number(tipoKaizen), workflow_id: '1' }), coleta]);
    await dono.query(`INSERT INTO ${S.bm}.ctl_coleta (tarefa, iniciado_em, finalizado_em, status, versao_coletor) VALUES ('coleta_incremental', now(), now(), 'sucesso', 'ap-teste')`);
    const servidor = await subirServidorWorklog({
      ...cenarioWorklogVazio(),
      registros: [
        registroWorklog({ logged_time_id: b + 11, card_id: b + 1, user_id: null, comment: 'qualquer coisa escrita' }),
        registroWorklog({ logged_time_id: b + 12, card_id: b + 2, user_id: null, comment: 'Rodar Teste de homologação' }),
        registroWorklog({ logged_time_id: b + 13, card_id: b + 2, user_id: null, comment: null }),
      ],
    });
    try {
      const cliente = criarClienteHttp({ urlBase: servidor.url, apikey: 'chave-do-teste-0123456789', limitePorMinuto: 100_000, timeoutMs: 3000 }, { dormir: () => Promise.resolve() });
      const deps = await montarDepsApontamento({ cliente, pool: como(coletor), S, sal: 'sal-de-teste-com-pelo-menos-32-bytes!!', hostBase: 'bm.exemplo.test', agora: () => new Date('2026-11-04T15:00:00Z') });
      const r = await executarApontamento(deps, { tipo: 'carga_inicial' });
      expect(r).toMatchObject({ estado: 'sucesso', lidos: 3, inseridos: 3 });
      const f = await dono.query<{ logged_time_id: string; subgrupo_codigo: string; versao_dicionario: string; type_id: string | null }>(
        `SELECT logged_time_id, subgrupo_codigo, versao_dicionario, type_id FROM ${S.bm}.fato_apontamento WHERE logged_time_id = ANY($1::text[]) ORDER BY logged_time_id`, [[b + 11, b + 12, b + 13].map(String)]);
      expect(f.rows).toEqual([
        { logged_time_id: String(b + 11), subgrupo_codigo: 'gestao', versao_dicionario: arquivo().versao, type_id: tipoKaizen },
        { logged_time_id: String(b + 12), subgrupo_codigo: 'testes', versao_dicionario: arquivo().versao, type_id: null },
        { logged_time_id: String(b + 13), subgrupo_codigo: 'nao-classificado', versao_dicionario: arquivo().versao, type_id: null },
      ]);
    } finally {
      await servidor.fechar();
      await dono.query(`DELETE FROM ${S.bm}.dim_card WHERE card_id = ANY($1::text[])`, [[String(b + 1), String(b + 2)]]);
    }
  });
});
