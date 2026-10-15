import { METRICA_IDS, fonteDaMetrica } from '@metricas-dspd/contratos';
import { gerarBaseMock } from '@metricas-dspd/mock';
import { describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import { bancoDoMock } from './base-duble.js';
import type { PoolLike } from '../src/plataforma/db/pool.js';
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

  it('falha no aquecimento não derruba a subida: a API sobe e registra o aviso com a classe do erro', async () => {
    const linhas: string[] = [];
    const d = criarDublePg(() => new Error('banco fora'));
    const app = await buildApp({ db: d.pool, agora: () => AGORA, nivelLog: 'info', aquecer: true, destinoLog: { write: (m) => { linhas.push(m); } } });
    await expect(app.ready()).resolves.toBeDefined();
    const aviso = linhas.map((l) => JSON.parse(l) as Record<string, unknown>).find((l) => l.msg === 'aquecimento falhou; a primeira consulta carrega a base');
    expect(aviso).toBeDefined();
    expect(aviso?.erro).toBe('Error');
    expect(JSON.stringify(aviso)).not.toContain('banco fora');
  });

  it('métrica que falha no aquecimento é listada (id e classe do erro) e as demais seguem', async () => {
    const linhas: string[] = [];
    const banco = bancoDoMock(base);
    const d = criarDublePg((c) => (c.texto.includes('ref_alvo_prioridade') ? [] : banco(c)));
    const app = await buildApp({ db: d.pool, agora: () => AGORA, nivelLog: 'info', aquecer: true, destinoLog: { write: (m) => { linhas.push(m); } } });
    await app.ready();
    const r = await app.inject('/api/v1/metricas/O1');
    expect(r.statusCode).toBe(200);
    const aviso = linhas.map((l) => JSON.parse(l) as { msg: string; falhas?: { id: string; erro: string }[] }).find((l) => l.msg.startsWith('aquecimento concluído com métricas que falharam'));
    expect(aviso?.falhas?.length).toBeGreaterThan(0);
    for (const f of aviso?.falhas ?? []) {
      expect(typeof f.id).toBe('string');
      expect(f.erro).toMatch(/^[A-Za-z]+$/);
    }
  });

  it('banco lento (12 s por consulta, acima do pluginTimeout de 10 s): a API sobe no prazo, avisa, e o aquecimento termina em segundo plano', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const linhas: string[] = [];
      const banco = bancoDoMock(base);
      const d = criarDublePg(banco);
      const lento = <T>(f: () => Promise<T>) => new Promise<T>((res, rej) => { setTimeout(() => { f().then(res, rej); }, 12_000); });
      const pool: PoolLike = {
        query: ((t: string, v?: unknown[]) => lento(() => d.pool.query(t, v))) as PoolLike['query'],
        connect: d.pool.connect.bind(d.pool),
        end: d.pool.end.bind(d.pool),
      };
      const app = await buildApp({ db: pool, agora: () => AGORA, nivelLog: 'info', aquecer: true, destinoLog: { write: (m) => { linhas.push(m); } } });
      const msgs = () => linhas.map((l) => (JSON.parse(l) as { msg: string }).msg);
      let pronta = false;
      const ready = app.ready().then(() => { pronta = true; });
      await vi.advanceTimersByTimeAsync(5_100);
      expect(pronta).toBe(true);
      await ready;
      expect(msgs()).toContain('aquecimento não terminou no prazo; a API sobe e ele continua em segundo plano');
      expect(msgs()).not.toContain('aquecimento concluído');
      await vi.advanceTimersByTimeAsync(1_000_000);
      expect(msgs()).toContain('aquecimento concluído');
    } finally {
      vi.useRealTimers();
    }
  });
});
