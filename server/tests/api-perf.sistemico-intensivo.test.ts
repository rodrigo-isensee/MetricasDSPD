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
 * determinístico e bloqueia; A1/A2 (tempo) são registrados e só reprovam muito acima do orçamento (máquina compartilhada).
 */
const AGORA = new Date('2026-10-10T15:00:00Z');
const p95 = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.ceil(xs.length * 0.95) - 1]!;

describe('SIS-PERF-API: orçamento A1 a A3 nas 51 rotas (volume padrão do mock)', () => {
  it('payload gzip < 50 KB em todas; tempo frio e quente registrados', async () => {
    const base = gerarBaseMock();
    const app = await buildApp({ db: criarDublePg(bancoDoMock(base)).pool, agora: () => AGORA, nivelLog: 'silent' });
    const frio: Record<string, number> = {};
    const quente: number[] = [];
    const grandes: string[] = [];
    const t0 = performance.now();
    for (const id of METRICA_IDS) {
      // pior filtro conhecido (período máximo) onde o período se aplica
      const u = `/api/v1/metricas/${id}${['businessmap', 'acelerato'].includes(fonteDaMetrica(id)) ? '?periodo=12m' : ''}`;
      const a = performance.now();
      const r = await app.inject(u);
      frio[id] = performance.now() - a;
      expect(r.statusCode, id).toBe(200);
      const kb = gzipSync(r.body).length / 1024;
      if (kb >= 50) grandes.push(`${id}: ${kb.toFixed(1)} KB`);
      for (let i = 0; i < 20; i++) {
        const b = performance.now();
        await app.inject(u);
        quente.push(performance.now() - b);
      }
    }
    const total = performance.now() - t0;
    const pFrio = p95(Object.values(frio));
    const pior = Object.entries(frio).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k}=${v.toFixed(0)}ms`);
    process.stderr.write(`[SIS-PERF-API] frio p95=${pFrio.toFixed(1)}ms (piores: ${pior.join(', ')}); quente p95=${p95(quente).toFixed(1)}ms; total=${total.toFixed(0)}ms\n`);
    expect(grandes).toEqual([]);
    expect(pFrio, 'A1 frio: mais de 3x o orçamento de 300 ms').toBeLessThan(900);
    expect(p95(quente), 'A2 quente: mais de 3x o orçamento de 50 ms').toBeLessThan(150);
  }, 300_000);
});
