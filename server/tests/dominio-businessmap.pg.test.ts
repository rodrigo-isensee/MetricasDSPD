import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { dominiosDaColeta } from '../src/modulos/businessmap/coleta.js';
import { analisarDominioBm, lerDominioBm, referenciaDaVersaoBm, sincronizarDominioBm } from '../src/modulos/businessmap/dominio-businessmap.js';
import { ErroDominio } from '../src/modulos/referencia/dominio-acelerato.js';
import type { PoolLike } from '../src/plataforma/db/pool.js';
import { poolDe, S, url } from './pg/ctx.js';

// Lote L2-a do pedido 069 contra PostgreSQL: `bm:ref-sync` com o papel `dspd_ref` e a leitura do coletor (`dspd_coletor`). Pula sem PG_TESTE_URL.
const d = describe.skipIf(!url);
const AGORA = new Date('2026-11-04T12:00:00Z');
const D1 = '2026-11-04';
const D2 = '2026-11-05';
const TIPOS = ['tipo-de-selecao-do-teste'];

const texto = (campos: unknown[], extra = ''): string => JSON.stringify({
  versao: 1,
  versao_criterio: { dominio: 'businessmap', descricao: `Mapa de teste ${extra}`, motivo: 'Teste do bm:ref-sync', referencia: 'teste' },
  schema: 'dspd_bm', tabela: 'ref_dominio', regra: 'teste', campos,
});
const campo = (rotulo = 'Area Um', extra: Record<string, unknown> = {}): Record<string, unknown> => ({
  field_id: '7', type: TIPOS[0], coluna: 'area_solicitante', valores: [{ codigo: 'a1', rotulo }], ...extra,
});

d('bm:ref-sync contra PostgreSQL (papel dspd_ref, vigência, versão de critério e leitura do coletor)', () => {
  let ref: pg.Pool, coletor: pg.Pool;
  beforeAll(() => { ref = poolDe('dspd_ref'); coletor = poolDe('dspd_coletor'); });
  afterAll(async () => { await Promise.all([ref.end(), coletor.end()]); });

  /** Tudo numa transação do papel de referência, desfeita no fim (as tabelas de vigência não aceitam DELETE). */
  async function comoRef(fn: (pool: PoolLike, c: pg.PoolClient) => Promise<void>): Promise<void> {
    const c = await ref.connect();
    const pool: PoolLike = {
      query: (t, v) => c.query(t, v),
      connect: () => Promise.resolve({ query: (t: string, v?: unknown[]) => (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(t) ? Promise.resolve({ rows: [], rowCount: 0 }) : c.query(t, v)), release: () => undefined }),
      end: () => Promise.resolve(),
    };
    try {
      await c.query('BEGIN');
      await fn(pool, c);
    } finally {
      await c.query('ROLLBACK');
      c.release();
    }
  }
  const linhas = async (c: pg.PoolClient, campoRef: string): Promise<{ codigo: string; rotulo: string; vigente_de: string; vigente_ate: string | null }[]> =>
    (await c.query(`SELECT codigo, rotulo, vigente_de::text, vigente_ate::text FROM ${S.bm}.ref_dominio WHERE campo = $1 ORDER BY codigo, vigente_de`, [campoRef])).rows;
  const versoes = async (c: pg.PoolClient, sha: string): Promise<number> =>
    Number((await c.query(`SELECT count(*) AS n FROM ${S.core}.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = $1`, [referenciaDaVersaoBm(sha)])).rows[0].n);

  it('o arquivo real (vazio de campos) não grava nada nem registra versão', async () => {
    await comoRef(async (pool, c) => {
      const real = lerDominioBm();
      expect(await sincronizarDominioBm(pool, S, real, D1, AGORA)).toMatchObject({ campos: 0, inseridas: 0, fechadas: 0, versaoRegistrada: false });
      expect(await versoes(c, real.sha256)).toBe(0);
    });
  });

  it('carga idempotente: grava campo_customizado e o domínio, repetir não duplica e a versão de critério (com o hash) é uma só', async () => {
    await comoRef(async (pool, c) => {
      const lido = analisarDominioBm(texto([campo()]), TIPOS);
      expect(await sincronizarDominioBm(pool, S, lido, D1, AGORA)).toMatchObject({ campos: 1, inseridas: 2, fechadas: 0, versaoRegistrada: true });
      expect(await linhas(c, 'campo_customizado')).toEqual([{ codigo: '7', rotulo: 'area_solicitante', vigente_de: D1, vigente_ate: null }]);
      expect(await linhas(c, 'area_solicitante')).toEqual([{ codigo: 'a1', rotulo: 'Area Um', vigente_de: D1, vigente_ate: null }]);
      expect(await sincronizarDominioBm(pool, S, lido, D1, AGORA)).toMatchObject({ inseridas: 0, fechadas: 0, versaoRegistrada: false });
      expect(await sincronizarDominioBm(pool, S, lido, D2, AGORA)).toMatchObject({ inseridas: 0, fechadas: 0 });
      expect(await linhas(c, 'area_solicitante')).toHaveLength(1);
      expect(await versoes(c, lido.sha256)).toBe(1);
    });
  });

  it('mudança fecha a vigência anterior (UPDATE de vigente_ate), abre a nova e a história permanece; campo retirado só fecha', async () => {
    await comoRef(async (pool, c) => {
      await sincronizarDominioBm(pool, S, analisarDominioBm(texto([campo()]), TIPOS), D1, AGORA);
      const v2 = analisarDominioBm(texto([campo('Area Um corrigida')]), TIPOS);
      expect(await sincronizarDominioBm(pool, S, v2, D2, AGORA)).toMatchObject({ inseridas: 1, fechadas: 1, versaoRegistrada: true });
      expect(await linhas(c, 'area_solicitante')).toEqual([
        { codigo: 'a1', rotulo: 'Area Um', vigente_de: D1, vigente_ate: D2 },
        { codigo: 'a1', rotulo: 'Area Um corrigida', vigente_de: D2, vigente_ate: null },
      ]);
      const vazio = analisarDominioBm(texto([]), TIPOS);
      expect(await sincronizarDominioBm(pool, S, vazio, '2026-11-06', AGORA)).toMatchObject({ inseridas: 0, fechadas: 1 });
      expect(await linhas(c, 'campo_customizado')).toEqual([{ codigo: '7', rotulo: 'area_solicitante', vigente_de: D1, vigente_ate: '2026-11-06' }]);
    });
  });

  it('mudança no mesmo dia da vigência aberta é recusada e nada é gravado', async () => {
    await comoRef(async (pool, c) => {
      await sincronizarDominioBm(pool, S, analisarDominioBm(texto([campo()]), TIPOS), D1, AGORA);
      const antes = await linhas(c, 'area_solicitante');
      await expect(sincronizarDominioBm(pool, S, analisarDominioBm(texto([campo('Outra')]), TIPOS), D1, AGORA)).rejects.toBeInstanceOf(ErroDominio);
      expect(await linhas(c, 'area_solicitante')).toEqual(antes);
    });
  });

  it('o coletor (dspd_coletor) lê o ref_dominio vigente e monta o mapa; linha dos fields 36 e 42 inserida direto pelo dspd_ref fica de fora', async () => {
    const c = await ref.connect();
    try {
      await c.query('BEGIN');
      const ins = (campoRef: string, codigo: string, rotulo: string): Promise<unknown> =>
        c.query(`INSERT INTO ${S.bm}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ($1, $2, '2026-11-04', $3, 0)`, [campoRef, codigo, rotulo]);
      await ins('campo_customizado', '7', 'area_solicitante');
      await ins('campo_customizado', '42', 'area_solicitante');
      await ins('campo_customizado', '36', 'area_solicitante');
      await ins('area_solicitante', 'a1', 'Area Um');
      // O papel do coletor só enxerga o que foi confirmado: o mesmo cliente do `dspd_ref` faz a leitura, que é o texto da consulta do coletor.
      const mapa = await dominiosDaColeta({ query: (t: string, v?: unknown[]) => c.query(t, v) }, S);
      expect([...mapa.keys()]).toEqual(['7']);
      expect([...mapa.get('7')!]).toEqual([['Area Um', 'a1']]);
    } finally {
      await c.query('ROLLBACK');
      c.release();
    }
  });

  it('privilégios: o coletor lê ref_dominio mas não escreve; o dspd_ref só fecha vigência (outro UPDATE e DELETE recusados)', async () => {
    await comoRef(async (pool, c) => {
      await sincronizarDominioBm(pool, S, analisarDominioBm(texto([campo()]), TIPOS), D1, AGORA);
      await expect(coletor.query(`SELECT count(*) FROM ${S.bm}.ref_dominio`)).resolves.toBeTruthy();
      await expect(coletor.query(`INSERT INTO ${S.bm}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ('x', 'y', '2026-11-04', 'z', 0)`)).rejects.toThrow(/permission denied/);
      await c.query('SAVEPOINT s1');
      await expect(c.query(`UPDATE ${S.bm}.ref_dominio SET rotulo = 'x' WHERE campo = 'area_solicitante'`)).rejects.toThrow();
      await c.query('ROLLBACK TO SAVEPOINT s1');
      await expect(c.query(`DELETE FROM ${S.bm}.ref_dominio WHERE campo = 'area_solicitante'`)).rejects.toThrow();
    });
  });
});
