import { gerarBaseMock } from '@metricas-dspd/mock';
import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { semear } from '../src/plataforma/db/seed.js';
import { poolDe, url } from './pg/ctx.js';

// Pedido 099, lote A3 (E3.43): portão do O25 Descarte com dado real. A base "real" daqui é o seed mínimo em schemas próprios (a estrutura é a da
// base alimentada pela coleta) lida pelo papel `dspd_api` (grants por coluna); nenhuma coleta nem projeção real. O descarte nativo é a
// projeção `motivo_descarte` + `arquivado_em` do `dim_card` (Q-RO-2); aqui ele é gravado direto no card, no formato que a coleta grava.
const d = describe.skipIf(!url);
const AGORA = new Date('2026-10-10T15:00:00Z');
const MOTIVO_SIGILOSO = 'Motivo-sigiloso-A3';
const DIA_DO_DESCARTE = '2026-09-20';
type Taxa = { status: 'ok' | 'insuficiente'; k: number; n: number; pct?: number; minimo?: number };
type O25 = {
  encerrados: Taxa;
  porMotivo: unknown;
  consumido: { depoisDoInicio: { porTipo: { estatistica: { status: string; n: number } }[] } };
};

d('O25 Descarte com dado real (099, lote A3): PostgreSQL, papel dspd_api', () => {
  const base = gerarBaseMock({ escala: 0.15 });
  const p = prefixoDeTeste();
  const R = montarEsquemas(p);
  let mig: pg.Pool;
  let api: pg.Pool;
  const app = () => buildApp({ db: api, S: R, agora: () => AGORA, nivelLog: 'silent' });
  const o25 = async (consulta: string): Promise<{ status: number; corpo: O25; texto: string }> => {
    const r = await (await app()).inject(`/api/v1/metricas/O25?${consulta}`);
    return { status: r.statusCode, corpo: r.json() as O25, texto: r.body };
  };

  beforeAll(async () => {
    mig = poolDe();
    await migrar(url!, { prefixo: p });
    await semear(mig, base, R);
    api = poolDe('dspd_api');
  }, 180_000);
  afterAll(async () => {
    for (const s of [R.bm, R.ac, R.core]) await mig.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
    await api.end();
    await mig.end();
  });

  it('(a) com descartados gravados no formato real, o O25 responde 200 com a taxa em número e conta os novos descartes', async () => {
    const antes = await o25('periodo=12m');
    expect(antes.status).toBe(200);
    expect(antes.corpo.encerrados.status).toBe('ok');
    const abertos = (await mig.query<{ card_id: string }>(
      `SELECT card_id FROM ${R.bm}.dim_card
        WHERE granularidade = 'story' AND concluido_em IS NULL AND arquivado_em IS NULL AND excluido_em IS NULL
          AND eh_subtarefa IS NOT TRUE AND tipo IN ('Melhoria', 'Requisição') AND criado_em < '2026-09-01'
        ORDER BY card_id LIMIT 5`)).rows.map((x) => x.card_id);
    expect(abertos.length).toBeGreaterThan(0);
    await mig.query(
      `UPDATE ${R.bm}.dim_card SET motivo_descarte = $1, arquivado_em = $2 WHERE card_id = ANY($3::text[])`,
      [MOTIVO_SIGILOSO, `${DIA_DO_DESCARTE}T15:00:00Z`, abertos]);
    const depois = await o25('periodo=12m');
    expect(depois.status).toBe(200);
    expect(depois.corpo.encerrados.status).toBe('ok');
    expect(depois.corpo.encerrados.pct).toBeGreaterThan(0);
    const dk = depois.corpo.encerrados.k - antes.corpo.encerrados.k;
    expect(dk).toBeGreaterThan(0);
    expect(depois.corpo.encerrados.n - antes.corpo.encerrados.n).toBe(dk);
    // CA-44: sem divisão por motivo enquanto a integração não lê o catálogo de motivos.
    expect(depois.corpo.porMotivo).toBeNull();
    // Percentil só com n >= 20 por tipo, na janela de 12 semanas.
    for (const t of depois.corpo.consumido.depoisDoInicio.porTipo) {
      if (t.estatistica.status === 'ok') expect(t.estatistica.n).toBeGreaterThanOrEqual(20);
      else expect(t.estatistica.n).toBeLessThan(20);
    }
  }, 60_000);

  it('(b) abaixo de 20 encerrados a taxa é "insuficiente", sem percentual', async () => {
    const r = await o25(`periodo=custom&de=${DIA_DO_DESCARTE}&ate=${DIA_DO_DESCARTE}`);
    expect(r.status).toBe(200);
    expect(r.corpo.encerrados.n).toBeGreaterThan(0);
    expect(r.corpo.encerrados.n).toBeLessThan(20);
    expect(r.corpo.encerrados.status).toBe('insuficiente');
    expect(r.corpo.encerrados.minimo).toBe(20);
    expect(r.corpo.encerrados).not.toHaveProperty('pct');
  }, 60_000);

  it('(c) nenhum campo de pessoa, de motivo nem de comentário de descarte na resposta', async () => {
    for (const q of ['periodo=12m', `periodo=custom&de=${DIA_DO_DESCARTE}&ate=${DIA_DO_DESCARTE}`]) {
      const r = await o25(q);
      expect(r.status, q).toBe(200);
      expect(r.texto, q).not.toMatch(/responsave|usuario|assignee|email|discard_comment|realname/i);
      expect(r.texto, q).not.toContain(MOTIVO_SIGILOSO);
      expect(r.texto, q).not.toMatch(/Pessoa \d+/);
    }
  }, 60_000);
});
