import { gerarBaseMock } from '@metricas-dspd/mock';
import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { migrar } from '../src/plataforma/db/migrar.js';
import { prefixoDeTeste, montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { semear } from '../src/plataforma/db/seed.js';
import { poolDe, url } from './pg/ctx.js';

const d = describe.skipIf(!url);

/** O seed é idempotente por schema, então usa um conjunto próprio (não o da execução, onde outros testes criam coletas). */
d('seed contra PostgreSQL 17', () => {
  const base = gerarBaseMock({ escala: 0.05 });
  const p = prefixoDeTeste();
  const E = montarEsquemas(p);
  let db: pg.Pool;
  const n = async (t: string): Promise<number> => Number((await db.query<{ n: string }>(`SELECT count(*) AS n FROM ${t}`)).rows[0]!.n);
  beforeAll(async () => { db = poolDe(); await migrar(url!, { prefixo: p }); });
  afterAll(async () => {
    for (const s of [E.bm, E.ac, E.core]) await db.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
    await db.end();
  });

  it('grava, é idempotente e recusa outra semente', async () => {
    expect(await semear(db, base, E)).toBe('semeado');
    const cont = async () => [await n(`${E.bm}.dim_card`), await n(`${E.bm}.fato_transicao`), await n(`${E.bm}.fato_bloqueio`), await n(`${E.ac}.dim_chamado`), await n(`${E.ac}.fato_etapa_chamado`)];
    const antes = await cont();
    expect(antes).toEqual([base.bm.cards.length, base.bm.transicoes.length, base.bm.bloqueios.length, base.ac.chamados.length, base.ac.etapas.length]);
    expect(await semear(db, base, E)).toBe('ja_semeado');
    expect(await cont()).toEqual(antes);
    await expect(semear(db, gerarBaseMock({ escala: 0.05, semente: 7 }), E)).rejects.toThrow(/outra base/);
    expect(await cont()).toEqual(antes);
  });

  it('o seed espera a trava única "dspd:seed" e só grava depois que ela é solta (K-094, determinístico)', async () => {
    const p3 = prefixoDeTeste();
    const E3 = montarEsquemas(p3);
    await migrar(url!, { prefixo: p3 });
    const detentor = await db.connect();
    let pendente: Promise<string> | undefined;
    try {
      await detentor.query('BEGIN');
      await detentor.query("SELECT pg_advisory_xact_lock(hashtext('dspd:seed'))");
      let terminou = false;
      pendente = semear(db, base, E3).finally(() => { terminou = true; });
      // sinal observável (sem espera fixa): existe uma sessão bloqueada pedindo trava consultiva
      await expect.poll(async () => Number((await db.query<{ n: string }>(
        "SELECT count(*) AS n FROM pg_locks WHERE locktype = 'advisory' AND NOT granted")).rows[0]!.n), { timeout: 10_000 }).toBeGreaterThan(0);
      expect(terminou).toBe(false);
      expect(await n(`${E3.bm}.ctl_coleta`)).toBe(0);
      expect(await n(`${E3.ac}.ctl_coleta`)).toBe(0);
      await detentor.query('COMMIT');
      expect(await pendente).toBe('semeado');
      expect(await n(`${E3.bm}.dim_card`)).toBe(base.bm.cards.length);
      expect(await n(`${E3.ac}.dim_chamado`)).toBe(base.ac.chamados.length);
    } finally {
      await detentor.query('ROLLBACK').catch(() => undefined);
      detentor.release();
      await pendente?.catch(() => undefined);
      for (const s of [E3.bm, E3.ac, E3.core]) await db.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
    }
  });

  it('justificativa_informada: indicador igual a "campo não vazio" do mock; o texto não está em nenhuma coluna (FA-003)', async () => {
    const esperado = base.ac.chamados.filter((c) => c.justificativa_ajuste !== null && c.justificativa_ajuste.trim() !== '').length;
    expect(esperado).toBeGreaterThan(0);
    expect(await n(`${E.ac}.dim_chamado WHERE justificativa_informada`)).toBe(esperado);
    const texto = base.ac.chamados.find((c) => c.justificativa_ajuste)!.justificativa_ajuste!;
    const r = await db.query<{ n: string }>(`SELECT count(*) AS n FROM ${E.ac}.dim_chamado c WHERE c::text LIKE $1`, [`%${texto}%`]);
    expect(Number(r.rows[0]!.n)).toBe(0);
    const col = await db.query(`SELECT 1 FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'dim_chamado_versao' AND column_name = 'justificativa_informada'`, [E.ac]);
    expect(col.rowCount).toBe(1);
  });

  it('grava a referência, os critérios por fonte e uma coleta_incremental por fonte (FA-001, FA-002)', async () => {
    const q = async (t: string, onde = 'true') => n(`${t} WHERE ${onde}`);
    expect(await n(`${E.ac}.ref_alvo_prioridade`)).toBe(base.ac.config.alvos.length);
    expect(await n(`${E.bm}.ref_quadro`)).toBe(base.bm.config.equipes.length);
    expect(await n(`${E.bm}.ref_limite_wip_fluxo`)).toBe(base.bm.config.equipes.length);
    expect(await n(`${E.bm}.ref_ficha_resultado`)).toBe(base.bm.fichas.length);
    expect(await q(`${E.bm}.ref_dominio`, "campo = 'sistema'")).toBe(base.bm.config.sistemas.length);
    expect(await q(`${E.core}.ref_versao_criterio`, "dominio = 'businessmap'")).toBe(1);
    expect(await q(`${E.core}.ref_versao_criterio`, "dominio = 'acelerato'")).toBe(1);
    for (const s of [E.bm, E.ac]) expect(await q(`${s}.ctl_coleta`, "tarefa = 'coleta_incremental' AND status = 'sucesso'")).toBe(1);
  });

  it('dois seeds simultâneos num schema novo gravam uma vez só (lock consultivo)', async () => {
    const p2 = prefixoDeTeste();
    const E2 = montarEsquemas(p2);
    await migrar(url!, { prefixo: p2 });
    try {
      const r = await Promise.all([semear(db, base, E2), semear(db, base, E2)]);
      expect(r.sort()).toEqual(['ja_semeado', 'semeado']);
      expect(await n(`${E2.bm}.dim_card`)).toBe(base.bm.cards.length);
    } finally {
      for (const s of [E2.bm, E2.ac, E2.core]) await db.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
    }
  });

  it('instantes voltam idênticos (epoch ms -> timestamptz(3) UTC) e nenhuma coluna de pessoa é preenchida', async () => {
    const c = base.bm.cards.find((x) => x.criado_em > 0)!;
    const t = await db.query<{ ms: string; resp: string[] }>(
      `SELECT (extract(epoch FROM criado_em) * 1000)::bigint AS ms, responsaveis AS resp FROM ${E.bm}.dim_card WHERE card_id = $1`, [c.card_id]);
    expect(Number(t.rows[0]!.ms)).toBe(c.criado_em);
    expect(t.rows[0]!.resp).toEqual([]);
    const col = await db.query(`SELECT 1 FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'fato_transicao' AND column_name = 'usuario'`, [E.bm]);
    expect(col.rowCount).toBe(0); // K-096: coluna removida (migração 0015)
  });
});
