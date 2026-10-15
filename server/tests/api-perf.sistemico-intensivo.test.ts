import { gzipSync } from 'node:zlib';
import { METRICA_IDS, fonteDaMetrica } from '@metricas-dspd/contratos';
import { gerarBaseMock } from '@metricas-dspd/mock';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { bancoDoMock } from './base-duble.js';
import { criarDublePg } from './duble-pg.js';

/**
 * Orçamento da API (ADR 0003, A1 a A3) medido sobre o banco falso com o volume PADRÃO do mock (escala 1): mede só o
 * trabalho do servidor (cálculo + serialização + validação), sem rede nem Postgres. A3 (payload gzip < 50 KB) é
 * determinístico e bloqueia; A1/A2 (tempo) medem CPU time (insensível à carga da máquina) e só reprovam a 3x o orçamento.
 */
const AGORA = new Date('2026-10-10T15:00:00Z');
/**
 * Mede tempo de CPU do processo (user+system, em ms), não relógio de parede (ADR 0003, "Condições de medição"): com a
 * máquina carregada o relógio de parede mistura espera por CPU com custo do código (IS-002). O app.inject roda no mesmo
 * processo e o cálculo é síncrono, então o CPU time enxerga o trabalho do servidor. A chamada a frio fica na amostra.
 */
const RODADAS = 3;
const cpuMs = () => {
  const u = process.cpuUsage();
  return (u.user + u.system) / 1000;
};
const p95 = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.ceil(xs.length * 0.95) - 1]!;

describe('SIS-PERF-API: orçamento A1 a A3 nas 63 rotas (volume padrão do mock)', () => {
  it('payload gzip < 50 KB em todas; tempo frio e quente registrados', async () => {
    const base = gerarBaseMock();
    const grandes: string[] = [];
    const rodadas: { pFrio: number; pQuente: number; texto: string }[] = [];
    // Melhor de N rodadas, cada uma com um app novo (cache de métricas frio): um pico de contenção (GC, SMT, cobertura
    // sob carga) infla uma rodada, não todas. Uma regressão real infla todas, e o melhor delas continua acima do teto.
    for (let rodada = 0; rodada < RODADAS; rodada++) {
      const app = await buildApp({ db: criarDublePg(bancoDoMock(base)).pool, agora: () => AGORA, nivelLog: 'silent' });
      const frio: Record<string, number> = {};
      const quente: number[] = [];
      const t0 = cpuMs();
      for (const id of METRICA_IDS) {
        // pior filtro conhecido (período máximo) onde o período se aplica
        const u = `/api/v1/metricas/${id}${['businessmap', 'acelerato'].includes(fonteDaMetrica(id)) && !id.startsWith('TENDENCIA_') ? '?periodo=12m' : ''}`;
        const a = cpuMs();
        const r = await app.inject(u);
        frio[id] = cpuMs() - a;
        expect(r.statusCode, id).toBe(200);
        const kb = gzipSync(r.body).length / 1024;
        if (rodada === 0 && kb >= 50) grandes.push(`${id}: ${kb.toFixed(1)} KB`);
        for (let i = 0; i < 20; i++) {
          const b = cpuMs();
          await app.inject(u);
          quente.push(cpuMs() - b);
        }
      }
      const pior = Object.entries(frio).sort((x, y) => y[1] - x[1]).slice(0, 5).map(([k, v]) => `${k}=${v.toFixed(0)}ms`);
      const pFrio = p95(Object.values(frio));
      const pQuente = p95(quente);
      rodadas.push({ pFrio, pQuente, texto: `frio p95=${pFrio.toFixed(1)}ms (piores: ${pior.join(', ')}); quente p95=${pQuente.toFixed(1)}ms; total=${(cpuMs() - t0).toFixed(0)}ms` });
      await app.close();
      if (pFrio < 900 && pQuente < 150) break; // dentro do teto: não precisa repetir
    }
    process.stderr.write(rodadas.map((r, i) => `[SIS-PERF-API] rodada ${i + 1}: ${r.texto}\n`).join(''));
    expect(grandes).toEqual([]);
    expect(Math.min(...rodadas.map((r) => r.pFrio)), 'A1 frio: mais de 3x o orçamento de 300 ms').toBeLessThan(900);
    expect(Math.min(...rodadas.map((r) => r.pQuente)), 'A2 quente: mais de 3x o orçamento de 50 ms').toBeLessThan(150);
  }, 300_000);
});
