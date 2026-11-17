import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ErroSle, analisarSleBm, lerSleBm, sincronizarSleBm } from '../src/modulos/referencia/sle-businessmap.js';
import { lerSle } from '../src/modulos/metricas/repositorio.js';
import type { PoolLike } from '../src/plataforma/db/pool.js';
import { poolDe, S, url } from './pg/ctx.js';

const d = describe.skipIf(!url);
const AGORA = new Date('2031-02-10T12:00:00Z');
const HOJE = '2031-02-10';
const arq = (prazos: [string, number, string][]): string => JSON.stringify({
  versao: 1, regra: 'teste', versao_criterio: { descricao: 'SLE teste', motivo: 'teste qa' },
  prazos: prazos.map(([prioridade, dias_uteis, aprovado_em]) => ({ prioridade, dias_uteis, aprovado_em })),
});
async function comoRef(ref: pg.Pool, fn: (pool: PoolLike, c: pg.PoolClient) => Promise<void>): Promise<void> {
  const c = await ref.connect();
  const livre = (t: string): boolean => ['BEGIN', 'COMMIT', 'ROLLBACK'].includes(t);
  const pool: PoolLike = {
    query: (t, v) => c.query(t, v),
    connect: () => Promise.resolve({ query: (t: string, v?: unknown[]) => (livre(t) ? Promise.resolve({ rows: [], rowCount: 0 }) : c.query(t, v)), release: () => undefined }),
    end: () => Promise.resolve(),
  };
  try { await c.query('BEGIN'); await fn(pool, c); } finally { await c.query('ROLLBACK'); c.release(); }
}
d('QA K-214 sle contra PG (dspd_ref)', () => {
  let ref: pg.Pool;
  beforeAll(() => { ref = poolDe('dspd_ref'); });
  afterAll(async () => { await ref.end(); });
  const cont = async (c: pg.PoolClient): Promise<number[]> => [
    Number((await c.query(`SELECT count(*) n FROM ${S.bm}.ref_sle`)).rows[0].n),
    Number((await c.query(`SELECT count(*) n FROM ${S.core}.ref_versao_criterio`)).rows[0].n),
    Number((await c.query(`SELECT count(*) n FROM ${S.core}.ref_versao_criterio_metrica`)).rows[0].n)];

  it('CT-1 arquivo real: grava os 4 prazos aprovados; 2ª rodada sem duplicar', async () => {
    await comoRef(ref, async (pool, c) => {
      const antes = await cont(c);
      const lido = lerSleBm();
      const r = await sincronizarSleBm(pool, S, lido, HOJE, AGORA);
      expect(r).toMatchObject({ prazos: 4, inseridas: 4, fechadas: 0, versaoRegistrada: true });
      const depois = await cont(c);
      expect(depois).toEqual([antes[0]! + 4, antes[1]! + 1, antes[2]! + 2]);
      const r2 = await sincronizarSleBm(pool, S, lido, HOJE, AGORA);
      expect(r2).toMatchObject({ prazos: 4, inseridas: 0, fechadas: 0, versaoRegistrada: false });
      expect(await cont(c)).toEqual(depois);
    });
  });
  it('CT-2 uma linha: grava ref_sle (*, P85, classe=prioridade), versao T2+O3; lerSle enxerga', async () => {
    await comoRef(ref, async (pool, c) => {
      const antes = await cont(c);
      const r = await sincronizarSleBm(pool, S, analisarSleBm(arq([['Alta', 12.5, '2031-02-01']])), HOJE, AGORA);
      expect(r).toMatchObject({ inseridas: 1, fechadas: 0, versaoRegistrada: true });
      const depois = await cont(c);
      expect(depois).toEqual([antes[0]! + 1, antes[1]! + 1, antes[2]! + 2]);
      const l = (await c.query(`SELECT equipe, classe_servico, percentil, vigente_de::text de, vigente_ate, dias_uteis::text d FROM ${S.bm}.ref_sle WHERE classe_servico='Alta'`)).rows;
      expect(l).toEqual([{ equipe: '*', classe_servico: 'Alta', percentil: 85, de: '2031-02-01', vigente_ate: null, d: '12.5' }]);
      const m = (await c.query(`SELECT m.metrica_id FROM ${S.core}.ref_versao_criterio_metrica m JOIN ${S.core}.ref_versao_criterio v USING (versao_id) WHERE v.referencia LIKE '105:sle-bm:%' ORDER BY 1`)).rows.map((x) => x.metrica_id);
      expect(m).toEqual(['O3', 'T2']);
      const ls = await lerSle(c, S);
      console.log('lerSle:', JSON.stringify(ls));
      expect(ls.length).toBeGreaterThanOrEqual(1);
    });
  });
  it('CT-3 duas rodadas iguais: sem duplicar', async () => {
    await comoRef(ref, async (pool, c) => {
      const lido = analisarSleBm(arq([['Alta', 12.5, '2031-02-01'], ['Baixa', 30, '2031-02-02']]));
      await sincronizarSleBm(pool, S, lido, HOJE, AGORA);
      const a = await cont(c);
      const r = await sincronizarSleBm(pool, S, lido, HOJE, AGORA);
      expect(r).toMatchObject({ inseridas: 0, fechadas: 0, versaoRegistrada: false });
      expect(await cont(c)).toEqual(a);
    });
  });
  it('CT-4 prazo novo posterior fecha o anterior; mesma data ou anterior recusa; futuro recusa; histórico intacto', async () => {
    await comoRef(ref, async (pool, c) => {
      await sincronizarSleBm(pool, S, analisarSleBm(arq([['Alta', 10, '2031-02-01']])), HOJE, AGORA);
      const r = await sincronizarSleBm(pool, S, analisarSleBm(arq([['Alta', 8, '2031-02-05']])), HOJE, AGORA);
      expect(r).toMatchObject({ inseridas: 1, fechadas: 1 });
      const l = (await c.query(`SELECT vigente_de::text de, vigente_ate::text ate, dias_uteis::text d FROM ${S.bm}.ref_sle WHERE classe_servico='Alta' ORDER BY vigente_de`)).rows;
      expect(l).toEqual([{ de: '2031-02-01', ate: '2031-02-05', d: '10.0' }, { de: '2031-02-05', ate: null, d: '8.0' }]);
      for (const [dias, data] of [[7, '2031-02-05'], [7, '2031-02-03'], [7, '2031-02-11']] as const) {
        await c.query('SAVEPOINT s');
        await expect(sincronizarSleBm(pool, S, analisarSleBm(arq([['Alta', dias, data]])), HOJE, AGORA)).rejects.toBeInstanceOf(ErroSle);
        await c.query('ROLLBACK TO s');
      }
      expect((await c.query(`SELECT count(*) n FROM ${S.bm}.ref_sle WHERE classe_servico='Alta'`)).rows[0].n).toBe('2');
    });
  });
  it('CT-5 tudo ou nada: segunda linha recusada desfaz a primeira (erro no meio)', async () => {
    await comoRef(ref, async (pool, c) => {
      await sincronizarSleBm(pool, S, analisarSleBm(arq([['Baixa', 20, '2031-02-08']])), HOJE, AGORA);
      const a = await cont(c);
      await c.query('SAVEPOINT s');
      await expect(sincronizarSleBm(pool, S, analisarSleBm(arq([['Alta', 5, '2031-02-01'], ['Baixa', 9, '2031-02-08']])), HOJE, AGORA)).rejects.toBeInstanceOf(ErroSle);
      await c.query('ROLLBACK TO s');
      expect(await cont(c)).toEqual(a);
    });
  });
  it('CT-6 dspd_ref não apaga nem altera dias_uteis (histórico imutável no banco)', async () => {
    await comoRef(ref, async (pool, c) => {
      await sincronizarSleBm(pool, S, analisarSleBm(arq([['Alta', 10, '2031-02-01']])), HOJE, AGORA);
      await c.query('SAVEPOINT s');
      await expect(c.query(`UPDATE ${S.bm}.ref_sle SET dias_uteis = 1`)).rejects.toThrow();
      await c.query('ROLLBACK TO s');
      await c.query('SAVEPOINT s');
      await expect(c.query(`DELETE FROM ${S.bm}.ref_sle`)).rejects.toThrow();
      await c.query('ROLLBACK TO s');
    });
  });
});
