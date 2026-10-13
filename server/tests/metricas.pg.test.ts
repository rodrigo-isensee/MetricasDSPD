import { METRICA_IDS, fonteDaMetrica, type MetricaId } from '@metricas-dspd/contratos';
import { acelerato, businessmap, calcularMetrica, CALENDARIO_PADRAO, type ContextosMetricas } from '@metricas-dspd/metricas';
import { gerarBaseMock, gerarExtensoesMock } from '@metricas-dspd/mock';
import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { ServicoMetricas } from '../src/modulos/metricas/index.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { semear } from '../src/plataforma/db/seed.js';
import { CORTE_DATA, mockComoNoBanco } from './base-duble.js';
import { poolDe, url } from './pg/ctx.js';
import { idsDosCriterios } from './pg/referencia.js';

const d = describe.skipIf(!url);
const AGORA = new Date('2026-10-10T15:00:00Z');
const CORTE = `${CORTE_DATA}T23:59:59-03:00`;
const FLUXO = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' as const } };
const SUST = { equipe: [], prioridade: [], periodo: { tipo: '12s' as const } };
/** Filtros de cada fonte: a Visão geral e a pesquisa (PV1) não têm filtros. */
const FILTROS_POR_FONTE = { businessmap: FLUXO, acelerato: SUST, ambos: {}, pesquisa: {} } as const;

/** Paridade real: mock em memória x seed no PostgreSQL lido pelo papel `dspd_api` (grants por coluna). */
d('métricas sobre o PostgreSQL (papel dspd_api)', () => {
  const base = gerarBaseMock({ escala: 0.3 });
  const p = prefixoDeTeste();
  const E = montarEsquemas(p);
  let mig: pg.Pool;
  let api: pg.Pool;
  let ids: Map<string, string>;
  beforeAll(async () => {
    mig = poolDe();
    await migrar(url!, { prefixo: p });
    await semear(mig, base, E);
    ids = await idsDosCriterios(mig, E);
    api = poolDe('dspd_api');
  }, 120_000);
  afterAll(async () => {
    for (const s of [E.bm, E.ac, E.core]) await mig.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
    await api.end();
    await mig.end();
  });

  it('as 50 métricas: resultado idêntico ao do mock em memória', async () => {
    const mem = mockComoNoBanco(base, ids);
    const ctx: ContextosMetricas = {
      bm: businessmap.criarContextoBM(mem.bm, CORTE, CALENDARIO_PADRAO), ac: acelerato.criarContextoAC(mem.ac, CORTE, CALENDARIO_PADRAO),
      ext: gerarExtensoesMock(base),
    };
    const s = new ServicoMetricas({ db: api, S: E, extensoes: () => gerarExtensoesMock(base) });
    for (const id of METRICA_IDS as readonly MetricaId[]) {
      const f = FILTROS_POR_FONTE[fonteDaMetrica(id)];
      const r = await s.calcular(id, f, { dataReferencia: CORTE_DATA }, AGORA);
      expect(r.resultado, id).toEqual(calcularMetrica(id, f as never, ctx));
    }
  }, 120_000);

  it('rotas HTTP: data de referência = coleta do seed; fontes e critérios respondem com o papel dspd_api', async () => {
    const app = await buildApp({ db: api, S: E, agora: () => AGORA, nivelLog: 'silent' });
    const r = await app.inject('/api/v1/metricas/T1');
    expect(r.statusCode).toBe(200);
    expect(r.headers['x-data-referencia']).toBe('2026-10-09');
    expect((await app.inject('/api/v1/metricas/S1')).statusCode).toBe(200);
    expect((await app.inject('/api/v1/metricas/VISAO_GERAL')).statusCode).toBe(200);
    expect((await app.inject('/api/v1/fontes/businessmap/estado')).statusCode).toBe(200);
    expect((await app.inject('/api/v1/fontes/acelerato/coletas')).statusCode).toBe(200);
    expect((await app.inject('/api/v1/criterios')).json()).toHaveLength(3); // BusinessMap, Acelerato e a pesquisa (PV1)
    expect((await app.inject('/api/v1/referencia')).json().dataReferencia).toBe('2026-10-09');
  });

  it('a dspd_api não lê as colunas de pessoa (nem por engano)', async () => {
    await expect(api.query(`SELECT responsaveis FROM ${E.bm}.dim_card LIMIT 1`)).rejects.toThrow(/permission denied/);
    await expect(api.query(`SELECT usuario FROM ${E.bm}.fato_transicao LIMIT 1`)).rejects.toThrow(/permission denied/);
  });
});
