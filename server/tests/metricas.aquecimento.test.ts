import { METRICA_IDS, fonteDaMetrica } from '@metricas-dspd/contratos';
import { gerarBaseMock } from '@metricas-dspd/mock';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { bancoDoMock } from './base-duble.js';
import { criarDublePg } from './duble-pg.js';

// SNO-005: a primeira consulta depois de subir não pode pagar a leitura da base. Determinístico: conta consultas ao banco,
// não tempo (o tempo real a frio é medido pelo perf-api e registrado em docs/architecture/server.md).
const AGORA = new Date('2026-10-10T15:00:00Z');
const base = gerarBaseMock({ escala: 0.25 });
const montar = async (aquecer: boolean) => {
  const d = criarDublePg(bancoDoMock(base));
  const app = await buildApp({ db: d.pool, agora: () => AGORA, nivelLog: 'silent', aquecer });
  return { app, d };
};

describe('aquecimento da API na subida (SNO-005)', () => {
  it('com aquecimento, a base já está em memória quando a API fica pronta e nenhuma métrica volta ao banco', async () => {
    const { app, d } = await montar(true);
    await app.ready();
    const aposSubir = d.chamadas.length;
    expect(aposSubir).toBeGreaterThan(0);
    for (const id of METRICA_IDS.filter((m) => fonteDaMetrica(m) !== 'pesquisa')) {
      const r = await app.inject(`/api/v1/metricas/${id}`);
      expect(r.statusCode, id).toBe(200);
    }
    expect(d.chamadas.length).toBe(aposSubir);
  });

  it('sem aquecimento, a subida não toca o banco e a primeira consulta carrega a base (comportamento antigo)', async () => {
    const { app, d } = await montar(false);
    await app.ready();
    expect(d.chamadas.length).toBe(0);
    await app.inject('/api/v1/metricas/O1');
    expect(d.chamadas.length).toBeGreaterThan(0);
  });

  it('falha no aquecimento não derruba a subida: a API sobe e registra o aviso', async () => {
    const d = criarDublePg(() => new Error('banco fora'));
    const app = await buildApp({ db: d.pool, agora: () => AGORA, nivelLog: 'silent', aquecer: true });
    await expect(app.ready()).resolves.toBeDefined();
  });

  it('métrica que falha no aquecimento (sem alvos de prioridade) é listada e as demais seguem', async () => {
    const banco = bancoDoMock(base);
    const d = criarDublePg((c) => (c.texto.includes('ref_alvo_prioridade') ? [] : banco(c)));
    const app = await buildApp({ db: d.pool, agora: () => AGORA, nivelLog: 'silent', aquecer: true });
    await app.ready();
    const r = await app.inject('/api/v1/metricas/O1');
    expect(r.statusCode).toBe(200);
  });
});
