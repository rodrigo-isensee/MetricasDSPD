import { gerarBaseMock } from '@metricas-dspd/mock';
import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { semear } from '../src/plataforma/db/seed.js';
import { poolDe, url } from './pg/ctx.js';

// QA da sustentação real (E2.120, A1 do review): contra o PostgreSQL, com o papel `dspd_api`, prova que S2, S3, S4, S8 e S10 leem a
// base REAL do Acelerato e que as demais da sustentação seguem a base do seed. Falha se o mapa de origem ou o roteamento voltar atrás.
const d = describe.skipIf(!url);
const AGORA = new Date('2026-10-10T15:00:00Z');
const REAIS = ['S2', 'S3', 'S4', 'S8', 'S10'] as const;
const MOCK = ['S1', 'S5', 'S6', 'S7', 'S9', 'S11', 'S12', 'EI_SUST'] as const;

d('QA 052-sust-real: sustentação real no PostgreSQL', () => {
  const base = gerarBaseMock({ escala: 0.15 });
  const PR = prefixoDeTeste();
  const PS = prefixoDeTeste();
  const R = montarEsquemas(PR);
  const S = montarEsquemas(PS);
  let mig: pg.Pool;
  let api: pg.Pool;

  beforeAll(async () => {
    mig = poolDe();
    for (const p of [PR, PS]) await migrar(url!, { prefixo: p });
    await semear(mig, base, R);
    await semear(mig, base, S);
    api = poolDe('dspd_api');
  }, 180_000);
  afterAll(async () => {
    for (const e of [R, S]) for (const s of [e.bm, e.ac, e.core]) await mig.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
    await api.end();
    await mig.end();
  });

  it('com a base real do Acelerato vazia, S2, S3, S4, S8 e S10 mudam (leem a real) e as mock saem iguais à base do seed', async () => {
    const unica = await buildApp({ db: api, S, agora: () => AGORA, nivelLog: 'silent' });
    const antes = await buildApp({ db: api, S: R, SMock: S, agora: () => AGORA, nivelLog: 'silent' });
    const corpoAntes: Record<string, string> = {};
    for (const id of REAIS) corpoAntes[id] = (await antes.inject(`/api/v1/metricas/${id}`)).body;
    const chamados = await mig.query(`SELECT count(*)::int AS n FROM ${R.ac}.dim_chamado`);
    expect(chamados.rows[0].n).toBeGreaterThan(0);

    await mig.query(`DELETE FROM ${R.ac}.dim_chamado`);
    const duas = await buildApp({ db: api, S: R, SMock: S, agora: () => AGORA, nivelLog: 'silent' });
    for (const id of REAIS) {
      const dep = await duas.inject(`/api/v1/metricas/${id}`);
      expect(dep.statusCode, id).toBe(200);
      expect(dep.body, `${id} deveria ter mudado ao esvaziar a base real`).not.toBe(corpoAntes[id]);
    }
    for (const id of MOCK) {
      const a = await unica.inject(`/api/v1/metricas/${id}`);
      const b = await duas.inject(`/api/v1/metricas/${id}`);
      expect(b.statusCode, id).toBe(200);
      expect(b.body, `${id} deveria vir da base do seed`).toBe(a.body);
    }
  }, 90_000);
});
