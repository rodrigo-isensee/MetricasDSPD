import pg from 'pg';
import { afterAll, describe, expect, it } from 'vitest';
import { migrar } from '../src/plataforma/db/migrar.js';
import { criarPool, type ClienteLike, type PoolLike } from '../src/plataforma/db/pool.js';
import { comTravaDaFonte } from '../src/plataforma/db/trava.js';
import { prefixo, S, unico, url } from './pg/ctx.js';

const d = describe.skipIf(!url);
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** C3: os timeouts valem de verdade no servidor (não só na configuração do cliente) e a trava não vaza. */
d('timeouts e higiene de conexão (C3)', () => {
  const pools: pg.Pool[] = [];
  const novo = (o: Parameters<typeof criarPool>[1] = {}): pg.Pool => { const p = criarPool(url!, o); pools.push(p); return p; };
  afterAll(async () => { await Promise.all(pools.map((p) => p.end())); });

  it('a sessão nasce com os timeouts e o application_name do papel', async () => {
    const r = await novo().query<{ s: string; l: string; i: string; a: string; tz: string }>(
      `SELECT current_setting('statement_timeout') s, current_setting('lock_timeout') l,
              current_setting('idle_in_transaction_session_timeout') i, current_setting('application_name') a,
              current_setting('TimeZone') tz`);
    expect(r.rows[0]).toEqual({ s: '30s', l: '5s', i: '30s', a: 'dspd-migrador', tz: 'UTC' });
  });

  it('lock_timeout: quem espera lock é cancelado (55P03) em vez de esperar para sempre', async () => {
    const tabela = `${S.core}.t_lock_${unico('')}`;
    const dono = novo();
    await dono.query(`CREATE TABLE ${tabela} (id int)`);
    const preso = await dono.connect();
    try {
      await preso.query('BEGIN');
      await preso.query(`LOCK TABLE ${tabela} IN ACCESS EXCLUSIVE MODE`);
      const espera = novo({ lockTimeoutMs: 300 });
      const inicio = Date.now();
      await expect(espera.query(`SELECT 1 FROM ${tabela}`)).rejects.toMatchObject({ code: '55P03' });
      expect(Date.now() - inicio).toBeLessThan(3000);
    } finally {
      await preso.query('ROLLBACK');
      preso.release();
      await dono.query(`DROP TABLE ${tabela}`);
    }
  });

  it('idle_in_transaction_session_timeout: transação esquecida aberta é derrubada pelo servidor', async () => {
    const p = novo({ idleInTransactionTimeoutMs: 300 });
    const c = await p.connect();
    c.on('error', () => undefined);
    try {
      await c.query('BEGIN');
      await c.query('SELECT 1');
      await dormir(900);
      await expect(c.query('SELECT 1')).rejects.toThrow();
    } finally {
      c.release(true);
    }
    // O pool segue saudável: a conexão derrubada não volta para ele.
    expect((await p.query('SELECT 1 AS ok')).rows[0]).toEqual({ ok: 1 });
  });

  it('connectionTimeoutMillis: pool esgotado falha rápido em vez de pendurar', async () => {
    const p = novo({ max: 1, connectionTimeoutMs: 300 });
    const unico1 = await p.connect();
    try {
      const inicio = Date.now();
      await expect(p.connect()).rejects.toThrow(/timeout/i);
      expect(Date.now() - inicio).toBeLessThan(3000);
    } finally {
      unico1.release();
    }
  });

  it('migrar: com a tabela de controle presa por outra sessão, falha em ~5s por lock_timeout (55P03)', async () => {
    const dono = novo();
    const preso = await dono.connect();
    try {
      await preso.query('BEGIN');
      await preso.query(`LOCK TABLE ${S.core}.pgmigrations IN ACCESS EXCLUSIVE MODE`);
      const inicio = Date.now();
      await expect(migrar(url!, { prefixo })).rejects.toMatchObject({ code: '55P03' });
      const gasto = Date.now() - inicio;
      expect(gasto).toBeGreaterThanOrEqual(4000);
      expect(gasto).toBeLessThan(15000);
    } finally {
      await preso.query('ROLLBACK');
      preso.release();
    }
  }, 30000);

  it('trava da fonte: exclui concorrente, libera ao fim e, se o unlock falhar, a conexão destruída solta a trava', async () => {
    const fonte = unico('f');
    const p = novo();
    const dentro = await comTravaDaFonte(p, fonte, async () => {
      expect(await comTravaDaFonte(p, fonte, async () => 1)).toEqual({ executou: false });
      return 'a';
    });
    expect(dentro).toEqual({ executou: true, valor: 'a' });
    expect(await comTravaDaFonte(p, fonte, async () => 'b')).toEqual({ executou: true, valor: 'b' });

    // O backend que segura a trava morre dentro de `fn`: o unlock falha, o resultado de `fn` é preservado e a trava não fica órfã.
    const alvo = novo({ max: 1 });
    const pid = (await alvo.query<{ pid: number }>('SELECT pg_backend_pid() AS pid')).rows[0]!.pid;
    const r = await comTravaDaFonte(alvo, fonte, async () => {
      await novo().query('SELECT pg_terminate_backend($1)', [pid]);
      await dormir(200);
      return 'c';
    });
    expect(r).toEqual({ executou: true, valor: 'c' });
    expect(await comTravaDaFonte(novo(), fonte, async () => 'd')).toEqual({ executou: true, valor: 'd' });
    expect((await alvo.query('SELECT 1 AS ok')).rows[0]).toEqual({ ok: 1 });
  });
  it('trava da fonte: unlock que falha numa conexão VIVA destrói a conexão (release(true)) e a trava não fica retida', async () => {
    const fonte = unico('g');
    const real = novo({ max: 1 });
    // Mesma conexão real, mas o unlock "falha" no cliente: a trava continua retida no servidor até a conexão ser destruída.
    const falhaNoUnlock: PoolLike = {
      query: (t, p) => real.query(t, p),
      end: () => real.end(),
      connect: async () => {
        const c = await real.connect();
        return {
          query: ((t: string, p?: unknown[]) => (t.includes('pg_advisory_unlock') ? Promise.reject(new Error('unlock falhou')) : c.query(t, p))) as ClienteLike['query'],
          release: (d) => c.release(d as boolean | undefined),
        };
      },
    };
    expect(await comTravaDaFonte(falhaNoUnlock, fonte, async () => 'a')).toEqual({ executou: true, valor: 'a' });
    // Outra sessão consegue a trava: a conexão que a retinha foi encerrada em vez de voltar ao pool.
    expect(await comTravaDaFonte(novo(), fonte, async () => 'b')).toEqual({ executou: true, valor: 'b' });
  });
});
