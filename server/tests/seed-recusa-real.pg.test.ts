import { execFile } from 'node:child_process';
import { gerarBaseMock } from '@metricas-dspd/mock';
import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { coletarAcelerato, ErroColeta, projetarAcelerato } from '../src/modulos/acelerato/index.js';
import { coletarCards } from '../src/modulos/businessmap/coleta.js';
import { projetarBusinessMap } from '../src/modulos/businessmap/projetor.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { montarEsquemas, prefixoDeTeste, type Esquemas } from '../src/plataforma/db/esquemas.js';
import { ErroSeedEmBaseReal, semear } from '../src/plataforma/db/seed.js';
import { poolDe, url } from './pg/ctx.js';

// Plano 060-sem-mock, P1 (K-195): o seed nunca grava em esquema com coleta real e a coleta nunca roda sobre esquema com seed.
// Cada cenário usa o próprio conjunto de schemas, removido ao final.
const d = describe.skipIf(!url);

d('P1 do plano 060: seed e coleta real não dividem o esquema (PostgreSQL 17)', () => {
  const base = gerarBaseMock({ escala: 0.05 });
  const agora = (): Date => new Date('2026-11-02T12:00:00Z');
  const criados: Esquemas[] = [];
  let db: pg.Pool;
  const novo = async (): Promise<Esquemas> => {
    const p = prefixoDeTeste();
    const E = montarEsquemas(p);
    criados.push(E);
    await migrar(url!, { prefixo: p });
    return E;
  };
  const n = async (t: string, onde = 'true'): Promise<number> => Number((await db.query<{ n: string }>(`SELECT count(*) AS n FROM ${t} WHERE ${onde}`)).rows[0]!.n);
  const coletaReal = (schema: string, coletor: string): Promise<unknown> =>
    db.query(`INSERT INTO ${schema}.ctl_coleta (tarefa, iniciado_em, finalizado_em, status, versao_coletor) VALUES ('coleta_incremental', now(), now(), 'sucesso', $1)`, [coletor]);
  beforeAll(() => { db = poolDe(); });
  afterAll(async () => {
    for (const E of criados) for (const s of [E.bm, E.ac, E.core]) await db.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
    await db.end();
  });

  it('seed aceito em esquema vazio e de novo no que só tem seed (idempotente)', async () => {
    const E = await novo();
    expect(await semear(db, base, E)).toBe('semeado');
    expect(await semear(db, base, E)).toBe('ja_semeado');
    expect(await n(`${E.bm}.dim_card`)).toBe(base.bm.cards.length);
  });

  it('seed recusado com coleta real no BusinessMap: nada é gravado em nenhum esquema, mensagem só de tabela e contagem', async () => {
    const E = await novo();
    await coletaReal(E.bm, 'bm-f3/1');
    const erro = await semear(db, base, E).catch((e: unknown) => e);
    expect(erro).toBeInstanceOf(ErroSeedEmBaseReal);
    expect((erro as Error).message).toBe(`seed recusado: ${E.bm}.ctl_coleta: 1 linha(s) de coleta real; ${E.bm}.dim_card: 0 linha(s) de coleta real`);
    expect(await n(`${E.bm}.ctl_coleta`, "starts_with(versao_coletor, 'seed-mock')")).toBe(0);
    expect(await n(`${E.ac}.ctl_coleta`)).toBe(0);
    expect(await n(`${E.bm}.dim_card`)).toBe(0);
    expect(await n(`${E.ac}.dim_chamado`)).toBe(0);
  });

  it('seed recusado com coleta real só no Acelerato (o BusinessMap vazio também não é gravado)', async () => {
    const E = await novo();
    await coletaReal(E.ac, 'acelerato-f1/1');
    await expect(semear(db, base, E)).rejects.toThrow(`${E.ac}.ctl_coleta: 1 linha(s) de coleta real`);
    expect(await n(`${E.bm}.dim_card`)).toBe(0);
    expect(await n(`${E.bm}.ctl_coleta`)).toBe(0);
  });

  it('seed recusado depois do seed + coleta real posterior no mesmo esquema (nem o ja_semeado passa)', async () => {
    const E = await novo();
    await semear(db, base, E);
    await coletaReal(E.bm, 'bm-f3/1');
    await expect(semear(db, base, E)).rejects.toBeInstanceOf(ErroSeedEmBaseReal);
  });

  it('seed recusado com card de coleta real (coleta gravadora não é a do seed)', async () => {
    const E = await novo();
    await semear(db, base, E);
    const real = (await db.query<{ coleta_id: string }>(
      `INSERT INTO ${E.bm}.ctl_coleta (tarefa, iniciado_em, status, versao_coletor) VALUES ('reconciliacao', now(), 'sucesso', 'bm-f3/1') RETURNING coleta_id`)).rows[0]!.coleta_id;
    await db.query(`UPDATE ${E.bm}.dim_card SET atualizado_por_coleta_id = $1 WHERE card_id = (SELECT min(card_id) FROM ${E.bm}.dim_card)`, [real]);
    await expect(semear(db, base, E)).rejects.toThrow(`${E.bm}.dim_card: 1 linha(s) de coleta real`);
  });

  it('seed recusado com evento de webhook no BusinessMap (A3 da ADR 0026): nada é gravado, e o evento fica intacto', async () => {
    const E = await novo();
    await db.query(`INSERT INTO ${E.bm}.stg_webhook_evento (payload_sha256, payload, recebido_em) VALUES (decode($1, 'hex'), '{}'::jsonb, now())`, ['ab'.repeat(32)]);
    const erro = await semear(db, base, E).catch((e: unknown) => e);
    expect(erro).toBeInstanceOf(ErroSeedEmBaseReal);
    expect((erro as Error).message).toBe(`seed recusado: ${E.bm}.ctl_coleta: 0 linha(s) de coleta real; ${E.bm}.dim_card: 0 linha(s) de coleta real; ${E.bm}.stg_webhook_evento: 1 evento(s) de webhook`);
    expect(await n(`${E.bm}.ctl_coleta`)).toBe(0);
    expect(await n(`${E.ac}.ctl_coleta`)).toBe(0);
    expect(await n(`${E.bm}.dim_card`)).toBe(0);
    expect(await n(`${E.bm}.stg_webhook_evento`)).toBe(1);
  });

  it('coleta e projetor recusam esquema com seed, sem escrever (BusinessMap e Acelerato)', async () => {
    const E = await novo();
    await semear(db, base, E);
    const antes = [await n(`${E.bm}.ctl_coleta`), await n(`${E.ac}.ctl_coleta`)];
    const get = vi.fn();
    await expect(coletarCards({ cliente: { get }, pool: db, S: E, quadros: [1], hostBase: 'h', agora }, { tipo: 'incremental' })).rejects.toMatchObject({ codigo: 'esquema-com-seed' });
    expect(get).not.toHaveBeenCalled();
    await expect(projetarBusinessMap({ pool: db, S: E, agora })).rejects.toMatchObject({ codigo: 'esquema-com-seed' });
    await expect(projetarAcelerato(db, E, agora)).rejects.toBeInstanceOf(ErroColeta);
    await expect(coletarAcelerato({ pool: db, S: E, agora, config: {}, log: { info: vi.fn(), error: vi.fn() } } as never, 'incremental')).rejects.toMatchObject({ codigo: 'esquema-com-seed' });
    expect([await n(`${E.bm}.ctl_coleta`), await n(`${E.ac}.ctl_coleta`)]).toEqual(antes);
    expect(await n(`${E.ac}.ctl_coleta_falha`)).toBe(0);
  });

  it('o CLI do seed sem PG_SEED_URL falha na partida, mesmo com PG_MIGRADOR_URL definida, sem tocar o banco', async () => {
    const env = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '', ...(process.env.TMPDIR ? { TMPDIR: process.env.TMPDIR } : {}), PG_MIGRADOR_URL: url! };
    const r = await new Promise<{ codigo: number | null; saida: string }>((resolve) => {
      execFile('pnpm', ['exec', 'tsx', 'src/plataforma/db/seed-cli.ts'], { cwd: new URL('../', import.meta.url), env, timeout: 60_000 }, (erro, out, err) =>
        resolve({ codigo: erro === null ? 0 : (typeof erro.code === 'number' ? erro.code : null), saida: `${out}${err}` }));
    });
    expect(r.codigo).not.toBe(0);
    expect(r.saida).toContain('PG_SEED_URL ausente');
    expect(r.saida).not.toContain(url!);
  });
});
