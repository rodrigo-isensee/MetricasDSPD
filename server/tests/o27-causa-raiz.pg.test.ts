import { gerarBaseMock } from '@metricas-dspd/mock';
import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { semear } from '../src/plataforma/db/seed.js';
import { poolDe, url } from './pg/ctx.js';

// Pedido 105 (E7.218, L2 do O27): a leitura da coluna `dim_card.causa_raiz` pelo papel `dspd_api` (GRANT por coluna) e o cálculo da biblioteca sobre ela.
// Base semeada em schemas próprios; os bugs entram no formato que a coleta grava (código do domínio, ou nulo). O O27 ainda não está no mapa de origem
// real (só entra com a carga real): na API real ele responde "sem dado real"; o cálculo é provado em modo mock, que lê a mesma base semeada.
const d = describe.skipIf(!url);
const AGORA = new Date('2026-10-10T15:00:00Z');
type Coluna = { tipo: string; n: number; naoEBug: number; naoInformada: number; comCausa: number; causas: { causa: string; n: number; pct: number }[] | null };
type O27 = { base: { n: number }; porTipo: Coluna[]; porSistema: null; motivoPorSistema: string };

d('O27 Causa raiz dos bugs (105, E7.218): PostgreSQL, papel dspd_api', () => {
  const base = gerarBaseMock({ escala: 0.15 });
  const p = prefixoDeTeste();
  const R = montarEsquemas(p);
  let mig: pg.Pool;
  let api: pg.Pool;
  const app = (modoMock: boolean) => buildApp({ db: api, S: R, agora: () => AGORA, nivelLog: 'silent', modoMock });
  const o27 = async (modoMock = true): Promise<{ status: number; corpo: O27; texto: string }> => {
    const r = await (await app(modoMock)).inject('/api/v1/metricas/O27?periodo=12m');
    return { status: r.statusCode, corpo: r.json() as O27, texto: r.body };
  };
  const coluna = (c: O27, tipo: string): Coluna => c.porTipo.find((x) => x.tipo === tipo)!;
  let ids: string[] = [];

  beforeAll(async () => {
    mig = poolDe();
    await migrar(url!, { prefixo: p });
    await semear(mig, base, R);
    api = poolDe('dspd_api');
    // Os bugs do mock saem do caminho (viram Melhoria), para os números abaixo serem exatos; depois 30 stories concluídas na janela de 12 semanas
    // viram "Bug interno": 20 com causa (15 efeito_colateral, 5 nao_e_bug), 2 com valor fora do domínio e 8 sem causa (nulo).
    await mig.query(`UPDATE ${R.bm}.dim_card SET tipo = 'Melhoria' WHERE tipo IN ('Bug interno', 'Defeito em produção')`);
    ids = (await mig.query<{ card_id: string }>(
      `SELECT card_id FROM ${R.bm}.dim_card
        WHERE granularidade = 'story' AND concluido_em >= '2026-07-20' AND concluido_em < '2026-10-09'
          AND excluido_em IS NULL AND eh_subtarefa IS NOT TRUE
        ORDER BY card_id LIMIT 40`)).rows.map((x) => x.card_id).slice(0, 30);
    await mig.query(`UPDATE ${R.bm}.dim_card SET tipo = 'Bug interno', causa_raiz = NULL WHERE card_id = ANY($1::text[])`, [ids]);
    for (const [i, id] of ids.entries()) {
      const causa = i < 15 ? 'efeito_colateral' : i < 20 ? 'nao_e_bug' : i < 22 ? 'valor que nao existe no dominio' : null;
      await mig.query(`UPDATE ${R.bm}.dim_card SET causa_raiz = $1 WHERE card_id = $2`, [causa, id]);
    }
  }, 180_000);
  afterAll(async () => {
    for (const s of [R.bm, R.ac, R.core]) await mig.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
    await api.end();
    await mig.end();
  });

  it('o papel dspd_api lê a coluna causa_raiz: preenchido vira causa, nulo e fora do domínio viram "não informada"', async () => {
    expect(ids.length).toBe(30); // dependência do seed
    const r = await o27();
    expect(r.status).toBe(200);
    expect(r.corpo).not.toHaveProperty('estado');
    const c = coluna(r.corpo, 'Bug interno');
    expect(c).toMatchObject({ n: 30, naoInformada: 10, comCausa: 20, naoEBug: 5 });
    expect(c.causas).not.toBeNull();
    expect(c.causas!.find((x) => x.causa === 'efeito_colateral')).toMatchObject({ n: 15, pct: 75 });
    expect(c.causas!.find((x) => x.causa === 'nao_e_bug')).toMatchObject({ n: 5, pct: 25 });
    expect(c.causas!.reduce((s, x) => s + x.n, 0)).toBe(c.comCausa);
    expect(r.corpo.porSistema).toBeNull();
    expect(r.corpo.motivoPorSistema).toMatch(/Sistema afetado/);
  }, 60_000);

  it('o outro tipo é uma coluna à parte, sem somar; sem pessoa e sem nada do Acelerato na resposta', async () => {
    const r = await o27();
    const dp = coluna(r.corpo, 'Defeito em produção');
    expect(dp).toMatchObject({ n: 0, comCausa: 0, causas: null });
    expect(r.corpo.base.n).toBe(30);
    expect(r.texto).not.toMatch(/responsave|usuario|assignee|email|realname|owner|chamado/i);
    expect(r.texto).not.toMatch(/Pessoa \d+/);
  }, 60_000);

  it('com 19 bugs com causa o bug sem causa continua contado e fora do denominador, e a distribuição some (borda 19 e 20 no banco)', async () => {
    await mig.query(`UPDATE ${R.bm}.dim_card SET causa_raiz = NULL WHERE card_id = $1`, [ids[19]!]);
    const r = await o27();
    expect(coluna(r.corpo, 'Bug interno')).toMatchObject({ n: 30, naoInformada: 11, comCausa: 19, causas: null });
  }, 60_000);

  it('na API real, antes da carga real, o O27 responde "sem dado real" com o motivo, sem ler nada', async () => {
    const r = await o27(false);
    expect(r.status).toBe(200);
    expect(r.corpo).toMatchObject({ estado: 'sem-dado-real', metrica: 'O27' });
    expect(r.texto).toMatch(/Causa Raiz/);
  }, 60_000);
});
