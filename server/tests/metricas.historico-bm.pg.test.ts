import { gerarBaseMock } from '@metricas-dspd/mock';
import type pg from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ServicoMetricas } from '../src/modulos/metricas/index.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { semear } from '../src/plataforma/db/seed.js';
import { poolDe, url } from './pg/ctx.js';

const d = describe.skipIf(!url);
const AGORA = new Date('2026-10-10T15:00:00Z');
const FUTURO = '2099-01-01';
const FLUXO = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' as const } };

// Pedido 077, L3a (K-211): `historicoDesde` do BusinessMap = menor `inicio_carga` das cargas iniciais de cards com sucesso; só o contexto da TENDENCIA_FLUXO o recebe.
d('historicoDesde do BusinessMap (L3a) sobre o PostgreSQL', () => {
  const p = prefixoDeTeste();
  const E = montarEsquemas(p);
  let mig: pg.Pool;
  let api: pg.Pool;
  beforeAll(async () => {
    mig = poolDe();
    await migrar(url!, { prefixo: p });
    await semear(mig, gerarBaseMock({ escala: 0.1 }), E);
    api = poolDe('dspd_api');
  }, 120_000);
  afterAll(async () => {
    for (const s of [E.bm, E.ac, E.core]) await mig.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
    await api.end();
    await mig.end();
  });
  beforeEach(() => mig.query(`DELETE FROM ${E.bm}.ctl_coleta WHERE versao_coletor = 'l3a'`));

  const coleta = (tarefa: string, status: string, parametros: unknown) => mig.query(
    `INSERT INTO ${E.bm}.ctl_coleta (tarefa, iniciado_em, status, versao_coletor, parametros) VALUES ($1, now(), $2, 'l3a', $3::jsonb)`, [tarefa, status, JSON.stringify(parametros)]);
  const inicial = (inicio_carga: unknown, status = 'sucesso', tarefa = 'coleta_incremental') => coleta(tarefa, status, { tipo: 'carga_inicial', inicio_carga });
  const carga = async (log?: (c: Record<string, unknown>, m: string) => void) => {
    const s = new ServicoMetricas({ modoMock: true, db: api, S: E, ...(log ? { log } : {}) });
    const c = await (s as unknown as { carregarBM(m: { versao: string; finalizadoEm: null }): Promise<{ historicoDesde?: string; inicio: string | null }> }).carregarBM({ versao: 'x', finalizadoEm: null });
    return { s, c };
  };

  it('duas cargas iniciais de cards e um apontamento mais antigo: vale a menor das cargas de cards', async () => {
    await inicial('2026-05-04'); await inicial('2026-03-10'); await inicial('2025-01-01', 'sucesso', 'apontamento');
    const { c } = await carga();
    expect(c.historicoDesde).toBe('2026-03-10');
    expect(c.inicio).not.toBe(c.historicoDesde);
  });

  it('só falha ou só apontamento: historicoDesde ausente', async () => {
    await inicial('2026-03-10', 'falha'); await inicial('2025-01-01', 'sucesso', 'apontamento');
    expect((await carga()).c).not.toHaveProperty('historicoDesde');
  });

  it('parametros inválido é ignorado com aviso sem o conteúdo; a válida segue valendo', async () => {
    await inicial('2026-04-01'); await inicial('ontem'); await coleta('coleta_incremental', 'sucesso', { tipo: 'carga_inicial' });
    const avisos: string[] = [];
    const { c } = await carga((ctx, m) => { avisos.push(JSON.stringify(ctx) + m); });
    expect(c.historicoDesde).toBe('2026-04-01');
    expect(avisos).toHaveLength(1);
    expect(avisos[0]).toContain('"cargasIgnoradas":2');
    expect(avisos[0]).not.toContain('ontem');
    await carga(); // sem log injetado: o aviso é opcional
  });

  it('só a TENDENCIA_FLUXO recebe o início do histórico: a TENDENCIA_SUST nunca marca janela incompleta por ele', async () => {
    await inicial(FUTURO);
    const { s } = await carga();
    const meses = (r: unknown) => (r as { meses: { janelaIncompleta?: unknown }[] }).meses;
    const fluxo = await s.calcular('TENDENCIA_FLUXO', FLUXO as never, {}, AGORA);
    const sust = await s.calcular('TENDENCIA_SUST', { equipe: [], prioridade: [], periodo: { tipo: '12s' } } as never, {}, AGORA);
    expect(meses(fluxo.resultado).some((m) => m.janelaIncompleta !== undefined)).toBe(true);
    expect(meses(sust.resultado).some((m) => m.janelaIncompleta !== undefined)).toBe(false);
  });
});
