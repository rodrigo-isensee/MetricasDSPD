import { EventEmitter } from 'node:events';
import { describe, expect, it } from 'vitest';
import { aplicacaoDaUrl, criarPool, ehDuplicado, emTransacao, interpretadores, tipos, urlDoPapel } from '../src/plataforma/db/pool.js';
import { esquemasDoAmbiente, montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { gerarGrants, type Catalogo } from '../src/plataforma/db/grants.js';
import { limparTestes } from '../src/plataforma/db/limpar-testes.js';
import { criarDublePg } from './duble-pg.js';

describe('esquemas', () => {
  it('prefixo do ambiente e de teste', () => {
    expect(esquemasDoAmbiente({})).toEqual({ bm: 'dspd_bm', ac: 'dspd_ac', core: 'dspd_core' });
    expect(esquemasDoAmbiente({ DSPD_SCHEMA_PREFIXO: 'tx_' }).bm).toBe('tx_dspd_bm');
    expect(esquemasDoAmbiente().bm.endsWith('dspd_bm')).toBe(true);
    expect(prefixoDeTeste(() => 0)).toBe('t000000_');
    expect(prefixoDeTeste()).toMatch(/^t[0-9a-z]{6}_$/);
    expect(montarEsquemas('t1_').core).toBe('t1_dspd_core');
  });
});

describe('pool', () => {
  it('parsers: int8, numeric e date ficam string; demais usam o padrão do driver', () => {
    expect(interpretadores[20]('9007199254740993')).toBe('9007199254740993');
    expect(interpretadores[1700]('1.50')).toBe('1.50');
    expect(interpretadores[1082]('2026-10-10')).toBe('2026-10-10');
    expect(tipos.getTypeParser(1082)('2026-10-10')).toBe('2026-10-10');
    expect(tipos.getTypeParser(23)('7')).toBe(7);
  });
  it('criarPool é preguiçoso (não conecta) e encerra', async () => {
    const p = criarPool('postgres://u:p@127.0.0.1:1/x', { max: 1, statementTimeoutMs: 1000 });
    await p.end();
    await criarPool('postgres://u:p@127.0.0.1:1/x').end();
  });
  it('criarPool tem ouvinte de error: conexão ociosa derrubada não derruba o processo', async () => {
    const p = criarPool('postgres://u:p@127.0.0.1:1/x');
    expect(p.listenerCount('error')).toBeGreaterThan(0);
    expect(() => p.emit('error', new Error('terminated'))).not.toThrow();
    const cliente = new EventEmitter();
    p.emit('connect', cliente as never);
    expect(() => cliente.emit('error', new Error('terminated'))).not.toThrow();
    await p.end();
  });
  it('criarPool registra as falhas de conexão (warn) sem a URL nem a senha', async () => {
    const chamadas: Array<[string, { aplicacao: string; erro: string }]> = [];
    const p = criarPool('postgres://dspd_api:segredo@127.0.0.1:1/x', { log: (m, c) => { chamadas.push([m, c]); } });
    p.emit('error', new Error('terminated'));
    const cliente = new EventEmitter();
    p.emit('connect', cliente as never);
    cliente.emit('error', new Error('backend morto'));
    expect(chamadas.map(([, c]) => c)).toEqual([
      { aplicacao: 'dspd-api', erro: 'terminated' }, { aplicacao: 'dspd-api', erro: 'backend morto' },
    ]);
    expect(JSON.stringify(chamadas)).not.toContain('segredo');
    await p.end();
  });
  it('aplicacaoDaUrl cai em dspd-app quando a URL não é interpretável', () => {
    expect(aplicacaoDaUrl('/var/run/postgresql')).toBe('dspd-app');
    expect(aplicacaoDaUrl('postgres://%E0%A4%A@h/x')).toBe('dspd-app');
    expect(aplicacaoDaUrl('postgres://dspd_api@h/x')).toBe('dspd-api');
  });
  it('criarPool aplica os timeouts de C3 e o application_name do papel', async () => {
    const p = criarPool('postgres://dspd_api:p@127.0.0.1:1/x');
    expect(p.options).toMatchObject({
      statement_timeout: 30_000, lock_timeout: 5_000, idle_in_transaction_session_timeout: 30_000,
      connectionTimeoutMillis: 5_000, application_name: 'dspd-api', max: 10,
    });
    await p.end();
    const q = criarPool('postgres://migrador:p@127.0.0.1:1/x', {
      statementTimeoutMs: 1, lockTimeoutMs: 2, idleInTransactionTimeoutMs: 3, connectionTimeoutMs: 4, aplicacao: 'meu-app',
    });
    expect(q.options).toMatchObject({
      statement_timeout: 1, lock_timeout: 2, idle_in_transaction_session_timeout: 3, connectionTimeoutMillis: 4, application_name: 'meu-app',
    });
    await q.end();
    const r = criarPool('postgres://migrador:p@127.0.0.1:1/x');
    expect(r.options.application_name).toBe('dspd-migrador');
    await r.end();
  });
  it('emTransacao destrói a conexão quando o ROLLBACK falha e preserva o erro original', async () => {
    const d = criarDublePg((c) => (c.texto === 'ROLLBACK' ? new Error('conexão caiu') : []));
    await expect(emTransacao(d.pool, () => Promise.reject(new Error('original')))).rejects.toThrow('original');
    expect(d.estado.destruidos).toBe(1);
    const ok = criarDublePg();
    await emTransacao(ok.pool, async () => 1);
    expect(ok.estado.destruidos).toBe(0);
  });
  it('emTransacao confirma, desfaz em erro e sempre libera', async () => {
    const a = criarDublePg();
    expect(await emTransacao(a.pool, async (c) => { await c.query('SELECT 1'); return 7; })).toBe(7);
    expect(a.chamadas.map((c) => c.texto)).toEqual(['BEGIN', 'SELECT 1', 'COMMIT']);
    expect(a.estado.liberados).toBe(1);
    const b = criarDublePg();
    await expect(emTransacao(b.pool, () => Promise.reject(new Error('x')))).rejects.toThrow('x');
    expect(b.chamadas.map((c) => c.texto)).toEqual(['BEGIN', 'ROLLBACK']);
    expect(b.estado.liberados).toBe(1);
  });
  it('ehDuplicado só reconhece 23505; urlDoPapel troca credenciais', () => {
    expect(ehDuplicado({ code: '23505' })).toBe(true);
    expect(ehDuplicado({ code: '1' })).toBe(false);
    expect(ehDuplicado(null)).toBe(false);
    expect(ehDuplicado('23505')).toBe(false);
    expect(urlDoPapel('postgres://a:b@h:5/db', 'dspd_api', 'p@ss')).toBe('postgres://dspd_api:p%40ss@h:5/db');
  });
});

describe('limparTestes', () => {
  it('remove só o que o padrão devolve', async () => {
    const { cliente, chamadas } = criarDublePg((c) => (c.texto.startsWith('SELECT') ? [{ nspname: 't1a2b3c_dspd_bm' }] : []));
    expect(await limparTestes(cliente)).toEqual(['t1a2b3c_dspd_bm']);
    expect(chamadas[1]!.texto).toBe('DROP SCHEMA IF EXISTS t1a2b3c_dspd_bm CASCADE');
  });
});

describe('gerarGrants', () => {
  const S = montarEsquemas('t_');
  const cat: Catalogo = {
    bm: {
      stg_card: ['stg_sk'], stg_webhook_evento: ['webhook_sk', 'payload_sha256'], dim_card: ['card_id', 'responsaveis', 'titulo'],
      fato_transicao: ['transicao_sk', 'card_id'], rec_transicao_par: ['par_sk'], evt_card: ['evt_sk'],
      dim_card_versao: ['responsaveis'], ref_quadro: ['quadro_id', 'vigente_ate'], ref_x: ['a'], ctl_coleta: ['coleta_id'],
      ctl_coleta_contagem: ['coleta_id'], vw_transicao_canonica: ['card_id'],
    },
    ac: { stg_chamado: ['stg_sk'], dim_chamado: ['chamado_id'], ctl_automacao: ['automacao_sk'], ctl_coleta: ['coleta_id'] },
    core: { ref_calendario: ['calendario_id'], ref_calendario_turno: ['vigente_ate'], outbox: ['evento_sk'], pgmigrations: ['id'],
      pesq_carga: ['carga_id'], pesq_resultado: ['carga_id'], vw_pesq_vigente: ['carga_id'], ref_pesq_area: ['codigo', 'vigente_ate'],
      ref_versao_criterio: ['versao_id'], ref_versao_criterio_metrica: ['versao_id'] },
  };
  const g = gerarGrants(S, cat);
  it('começa revogando tudo e dá USAGE só nos schemas de cada papel', () => {
    expect(g[0]).toMatch(/^REVOKE ALL ON SCHEMA t_dspd_bm FROM PUBLIC/);
    expect(g).toContain('GRANT USAGE ON SCHEMA t_dspd_bm, t_dspd_core TO dspd_webhook');
    expect(g).toContain('GRANT USAGE ON SCHEMA t_dspd_ac, t_dspd_core TO dspd_automacao');
  });
  it('dspd_api: nunca stg_/evt_/versão, coluna de pessoa fora do GRANT, views e ref_ inteiros', () => {
    const api = g.filter((x) => x.endsWith('TO dspd_api'));
    expect(api.filter((x) => /stg_|evt_|_versao( |$)/.test(x))).toEqual([]);
    expect(api.join('\n')).not.toMatch(/responsaveis|usuario/);
    expect(api).toContain('GRANT SELECT (card_id, titulo) ON t_dspd_bm.dim_card TO dspd_api');
    expect(api).toContain('GRANT SELECT ON t_dspd_bm.fato_transicao TO dspd_api'); // K-096: sem coluna de pessoa, o GRANT volta a ser da tabela
    expect(api).toContain('GRANT SELECT ON t_dspd_bm.vw_transicao_canonica TO dspd_api');
    expect(api).toContain('GRANT SELECT ON t_dspd_bm.rec_transicao_par TO dspd_api');
    expect(api.some((x) => /pgmigrations|outbox/.test(x))).toBe(false);
  });
  it('dspd_api: coluna fora da API (M-4) e tabela fora da API (B-3) não entram no GRANT; o coletor ainda lê a ref', () => {
    const cat2: Catalogo = { ...cat, bm: { ...cat.bm, agg_conhecimento_sistema: ['sistema_codigo', 'faixa_concentracao', 'tem_entrega', 'entregas'],
      ref_conta_automacao: ['conta_id', 'motivo', 'confirmado_em', 'vigente_ate'] } };
    const g2 = gerarGrants(S, cat2);
    const api = g2.filter((x) => x.endsWith('TO dspd_api'));
    expect(api).toContain('GRANT SELECT (sistema_codigo, faixa_concentracao, tem_entrega) ON t_dspd_bm.agg_conhecimento_sistema TO dspd_api');
    expect(api.join('\n')).not.toMatch(/entregas|ref_conta_automacao/);
    expect(g2).toContain('GRANT SELECT ON t_dspd_bm.ref_conta_automacao TO dspd_coletor');
    expect(api).toContain('GRANT SELECT ON t_dspd_bm.ref_x TO dspd_api');
  });
  it('dspd_api: ref_conta_automacao fora da API em qualquer schema, inclusive o core (K-085, B-K2)', () => {
    const cols = ['conta_id', 'motivo', 'vigente_ate'];
    const g3 = gerarGrants(S, { bm: cat.bm, ac: { ...cat.ac, ref_conta_automacao: cols }, core: { ...cat.core, ref_conta_automacao: cols } });
    expect(g3.filter((x) => x.endsWith('TO dspd_api')).join('\n')).not.toMatch(/ref_conta_automacao/);
    expect(g3).toContain('GRANT SELECT ON t_dspd_core.ref_conta_automacao TO dspd_coletor');
    expect(g3).toContain('GRANT SELECT ON t_dspd_core.ref_conta_automacao TO dspd_automacao');
    expect(g3).toContain('GRANT SELECT ON t_dspd_ac.ref_conta_automacao TO dspd_coletor');
  });
  it('coletor: staging só SELECT/INSERT; ctl_coleta só colunas da execução; outbox por coluna', () => {
    expect(g).toContain('GRANT SELECT, INSERT ON t_dspd_bm.stg_card TO dspd_coletor');
    expect(g).toContain('GRANT UPDATE (status, finalizado_em, marca_dagua_ate, erro_resumo) ON t_dspd_bm.ctl_coleta TO dspd_coletor');
    expect(g).toContain('GRANT UPDATE ON t_dspd_bm.ctl_coleta_contagem TO dspd_coletor');
    expect(g).toContain('GRANT SELECT, INSERT, UPDATE, DELETE ON t_dspd_bm.dim_card TO dspd_coletor');
    expect(g.filter((x) => x.includes('ctl_automacao') && /UPDATE|DELETE/.test(x))).toEqual([]);
    expect(g).toContain('GRANT SELECT, INSERT, DELETE ON t_dspd_core.outbox TO dspd_coletor');
    expect(g.some((x) => x.startsWith('GRANT UPDATE (status, tentativas') && x.endsWith('TO dspd_coletor'))).toBe(true);
  });
  it('ref fecha vigência por coluna (também no core); webhook só insere e lê o hash', () => {
    expect(g).toContain('GRANT UPDATE (vigente_ate) ON t_dspd_bm.ref_quadro TO dspd_ref');
    expect(g).toContain('GRANT UPDATE (vigente_ate) ON t_dspd_core.ref_calendario_turno TO dspd_ref');
    expect(g.filter((x) => x.includes('ref_calendario ') && x.includes('UPDATE'))).toEqual([]);
    expect(g.filter((x) => x.endsWith('TO dspd_webhook') && !x.startsWith('GRANT USAGE'))).toEqual([
      'GRANT INSERT ON t_dspd_core.outbox TO dspd_webhook', 'GRANT INSERT ON t_dspd_bm.stg_webhook_evento TO dspd_webhook',
      'GRANT SELECT (webhook_sk, payload_sha256) ON t_dspd_bm.stg_webhook_evento TO dspd_webhook']);
    expect(g).toContain('GRANT SELECT, INSERT ON t_dspd_ac.ctl_automacao TO dspd_automacao');
  });
  it('dspd_pesquisa só insere em pesq_* e lê a referência; dspd_api só lê pesq_* e a view; nada de UPDATE/DELETE', () => {
    const pesquisa = g.filter((x) => x.endsWith('TO dspd_pesquisa'));
    expect(pesquisa).toEqual([
      'GRANT USAGE ON SCHEMA t_dspd_core TO dspd_pesquisa',
      'GRANT SELECT, INSERT ON t_dspd_core.pesq_carga TO dspd_pesquisa', 'GRANT SELECT, INSERT ON t_dspd_core.pesq_resultado TO dspd_pesquisa',
      'GRANT SELECT ON t_dspd_core.ref_pesq_area TO dspd_pesquisa', 'GRANT SELECT ON t_dspd_core.ref_versao_criterio TO dspd_pesquisa',
      'GRANT SELECT ON t_dspd_core.ref_versao_criterio_metrica TO dspd_pesquisa']);
    expect(pesquisa.join('\n')).not.toMatch(/UPDATE|DELETE|t_dspd_bm|t_dspd_ac|outbox/);
    const api = g.filter((x) => x.endsWith('TO dspd_api') && /pesq/.test(x));
    expect(api).toEqual(['GRANT SELECT ON t_dspd_core.ref_pesq_area TO dspd_api', 'GRANT SELECT ON t_dspd_core.pesq_carga TO dspd_api',
      'GRANT SELECT ON t_dspd_core.pesq_resultado TO dspd_api', 'GRANT SELECT ON t_dspd_core.vw_pesq_vigente TO dspd_api']);
    expect(g[0]).toMatch(/dspd_pesquisa/);
  });
  it('sem outbox no catálogo não concede nada nela', () => {
    const sem = gerarGrants(S, { ...cat, core: { ref_calendario: ['calendario_id'] } });
    expect(sem.some((x) => x.includes('outbox'))).toBe(false);
    expect(gerarGrants(S, { bm: {}, ac: {}, core: {} }).length).toBeGreaterThan(0);
  });
});

describe('migracao (up/down do node-pg-migrate a partir de ddl(S))', () => {
  it('executa cada instrução com pgm.sql, usando o prefixo do ambiente', async () => {
    const { migracao } = await import('../src/plataforma/db/executar.js');
    const sqls: string[] = [];
    const pgm = { sql: (s: string) => { sqls.push(s); } } as never;
    const m = migracao((S) => ({ up: [`A ${S.bm}`, 'B'], down: [`C ${S.core}`] }));
    process.env.DSPD_SCHEMA_PREFIXO = 'p_';
    m.up(pgm); m.down(pgm);
    delete process.env.DSPD_SCHEMA_PREFIXO;
    expect(sqls).toEqual(['A p_dspd_bm', 'B', 'C p_dspd_core']);
  });
});
