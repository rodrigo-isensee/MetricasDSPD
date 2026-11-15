import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao';
import { gerarBaseMock } from '@metricas-dspd/mock';
import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { semear } from '../src/plataforma/db/seed.js';
import { poolDe, url } from './pg/ctx.js';

// Pedido 099, lote A2 (E3.222): portão do O20 Fluxo cumulativo com dado real. A base "real" daqui é o seed mínimo em schemas próprios (a estrutura
// é a da base alimentada pela coleta) lida pelo papel `dspd_api` (grants por coluna); nenhuma coleta nem projeção real. O O20 lê só as transições
// (`vw_transicao_canonica`), o papel da coluna (`ref_coluna`) e os cards do BusinessMap; nenhuma coluna de pessoa.
const d = describe.skipIf(!url);
const AGORA = new Date('2026-10-10T15:00:00Z');
const PAPEIS = ['backlog', 'compromisso', 'trabalho', 'homologacao', 'entrega', 'sem-papel'];
type O20 = {
  agrupamento: 'coluna' | 'papel';
  faixas: { chave: string; rotulo: string }[];
  dias: { dia: string; contagens: number[]; emProgresso: number }[];
  destaque: { faixa: string; de: number; para: number } | null;
};

d('O20 Fluxo cumulativo com dado real (099, lote A2): PostgreSQL, papel dspd_api', () => {
  const base = gerarBaseMock({ escala: 0.15 });
  const p = prefixoDeTeste();
  const R = montarEsquemas(p);
  let mig: pg.Pool;
  let api: pg.Pool;
  const app = () => buildApp({ db: api, S: R, agora: () => AGORA, nivelLog: 'silent' });
  const o20 = async (consulta: string): Promise<{ status: number; corpo: O20; texto: string }> => {
    const r = await (await app()).inject(`/api/v1/metricas/O20?${consulta}`);
    return { status: r.statusCode, corpo: r.json() as O20, texto: r.body };
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

  it('(a) a base real das transições devolve 200 no schema, por papel em "Todas", com a contagem diária por faixa', async () => {
    const r = await o20('periodo=12m');
    expect(r.status).toBe(200);
    expect(SCHEMAS_RESULTADO.O20.safeParse(r.corpo).success).toBe(true);
    expect(r.corpo.agrupamento).toBe('papel');
    expect(r.corpo.faixas.length).toBeGreaterThan(0);
    for (const f of r.corpo.faixas) expect(PAPEIS).toContain(f.chave);
    expect(r.corpo.dias.length).toBeGreaterThan(0);
    for (const dia of r.corpo.dias) expect(dia.contagens).toHaveLength(r.corpo.faixas.length);
  }, 60_000);

  it('(b) com uma equipe a faixa é a coluna do quadro e o schema vale', async () => {
    // Na base alimentada pela coleta as equipes vêm de `ref_time` (carga inicial da migração 0019: "Arquitetura" é time próprio); o seed mínimo
    // não liga nenhum workflow a esse time, então a faixa por coluna sai vazia aqui. O agrupamento e o schema valem; o conteúdo por coluna
    // da base real é do teste unitário (o20.test.ts, "base real").
    const r = await o20('periodo=12m&equipe=arquitetura');
    expect(r.status).toBe(200);
    expect(r.corpo.agrupamento).toBe('coluna');
    expect(SCHEMAS_RESULTADO.O20.safeParse(r.corpo).success).toBe(true);
  }, 60_000);

  it('(c) período dentro do histórico sem transição devolve estado vazio (sem faixas nem dias), sem erro', async () => {
    // O seed (mock determinístico) tem transição em todos os dias úteis até 2026-10-09; 2026-10-04 é domingo e está dentro do histórico.
    const r = await o20('periodo=custom&de=2026-10-04&ate=2026-10-04');
    expect(r.status).toBe(200);
    expect(r.corpo.faixas).toEqual([]);
    expect(r.corpo.dias).toEqual([]);
  }, 60_000);

  it('(c2) período antes do início do histórico é recusado (422, PERIODO_FORA_DO_HISTORICO), não vira estado vazio', async () => {
    const r = await o20('periodo=custom&de=2001-01-01&ate=2001-01-02');
    expect(r.status).toBe(422);
    expect(r.texto).toContain('PERIODO_FORA_DO_HISTORICO');
  }, 60_000);

  it('(d) nenhum campo de pessoa nem de equipe na resposta', async () => {
    for (const q of ['periodo=12m', 'periodo=12m&equipe=arquitetura']) {
      const r = await o20(q);
      expect(r.status, q).toBe(200);
      expect(r.texto, q).not.toMatch(/responsave|usuario|assignee|email|realname|"equipe"/i);
      expect(r.texto, q).not.toMatch(/Pessoa \d+/);
    }
  }, 60_000);
});
