// Projeto `perf-api` (FA-5, ADR 0003 A1): latência dos GET de métrica no navegador, com a SPA em VITE_FONTE=api.
// Duas visões: (1) no navegador, com as ~12 chamadas de um painel em paralelo (6 conexões por origem, risco R2 do plano);
// (2) isolada, uma chamada por vez pelo servidor. A1: p95 < 300 ms. F1 a F5 vêm do `perf.spec.ts` (mesmo projeto).
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';
import { ROTAS_PAINEL } from '../fixtures/constantes';
import { PainelPage } from '../pages/PainelPage';
import { resumir } from './estatistica';

const A1_MS = 300;
const N = Number(process.env.PERF_REPETICOES_A1 ?? 10);
const ARQ = join(process.cwd(), 'perf-results', 'resultado-api.json');

function registrar(chave: string, valor: unknown): void {
  mkdirSync(join(process.cwd(), 'perf-results'), { recursive: true });
  const atual = existsSync(ARQ) ? (JSON.parse(readFileSync(ARQ, 'utf8')) as Record<string, unknown>) : {};
  atual[chave] = valor;
  writeFileSync(ARQ, JSON.stringify(atual, null, 2));
}

test.describe('perf-api A1', () => {
  // sem `serial`: uma falha de A1 no navegador não pode impedir a medição isolada (nada de teste pulado); workers=1 evita competição por CPU

  test('A1 no navegador: GET de métrica por painel, carga fria (p95 < 300 ms)', async ({ browser, baseURL }) => {
    test.setTimeout(10 * 60_000);
    const todas: number[] = [];
    for (const rota of ROTAS_PAINEL) {
      const duracoes: number[] = [];
      let naoOk = 0;
      for (let i = 0; i < N; i++) {
        const ctx = await browser.newContext({ baseURL: baseURL! }); // contexto novo = cache limpo
        const page = await ctx.newPage();
        const painel = new PainelPage(page);
        await painel.ir(rota);
        await painel.esperarCartoesProntos();
        const d = await page.evaluate(() =>
          performance
            .getEntriesByType('resource')
            .filter((e) => e.name.includes('/api/v1/metricas/'))
            .map((e) => ({ ms: e.duration, status: (e as PerformanceResourceTiming).responseStatus })));
        // só respostas 200 entram no p95 (um 503 rápido de "referência ausente" não prova nada); as demais são contadas
        duracoes.push(...d.filter((x) => x.status === 200).map((x) => x.ms));
        naoOk += d.filter((x) => x.status !== 200).length;
        await ctx.close();
      }
      const r = resumir(duracoes);
      console.log(`[perf-api] A1 ${rota}: n=${r.n} mediana=${r.mediana.toFixed(0)} ms p95=${r.p95.toFixed(0)} ms max=${r.max.toFixed(0)} ms`);
      registrar(`A1_navegador_${rota}`, { ...r, respostasNao200: naoOk });
      console.log(`[perf-api] A1 ${rota}: respostas não 200 (fora do p95): ${naoOk}`);
      todas.push(...duracoes);
      expect.soft(r.n, `A1 ${rota}: nenhuma resposta 200 para medir (${naoOk} não 200)`).toBeGreaterThan(0);
      if (r.n > 0) expect.soft(r.p95, `A1 ${rota} (navegador)`).toBeLessThan(A1_MS);
    }
    const geral = resumir(todas);
    registrar('A1_navegador_geral', geral);
    console.log(`[perf-api] A1 geral: n=${geral.n} p95=${geral.p95.toFixed(0)} ms`);
  });

  test('A1 isolada: uma chamada por vez (servidor), fria e quente', async ({ request }) => {
    test.setTimeout(10 * 60_000);
    const ids = ['O1', 'O2', 'O3', 'O4', 'O9', 'O10', 'T1', 'T2', 'T3', 'E1', 'E2', 'S1', 'S2', 'S3'];
    const frias: number[] = [];
    const quentes: number[] = [];
    const naoOk: string[] = [];
    for (const id of ids) {
      for (let i = 0; i < N; i++) {
        const t0 = performance.now();
        // `cache-control: no-cache` + query única evita servir do cache do servidor/HTTP e mede o cálculo
        const r = await request.get(`/api/v1/metricas/${id}?periodo=12s${id === 'O2' ? '&pageSize=200' : ''}`, { headers: { 'cache-control': 'no-cache' } });
        const ms = performance.now() - t0;
        if (!r.ok()) { naoOk.push(`${id}:${r.status()}`); break; } // medido à parte: não entra nos percentis
        (i === 0 ? frias : quentes).push(ms);
      }
    }
    const rf = resumir(frias);
    const rq = resumir(quentes);
    console.log(`[perf-api] A1 isolada fria: n=${rf.n} p95=${rf.p95.toFixed(0)} ms max=${rf.max.toFixed(0)} ms | quente: n=${rq.n} p95=${rq.p95.toFixed(0)} ms max=${rq.max.toFixed(0)} ms`);
    console.log(`[perf-api] A1 isolada: métricas com resposta não 200 (fora dos percentis): ${naoOk.join(', ') || 'nenhuma'}`);
    registrar('A1_isolada_nao200', naoOk);
    expect.soft(naoOk, 'respostas não 200 na medição isolada').toEqual([]);
    registrar('A1_isolada_fria', rf);
    registrar('A1_isolada_quente', rq);
    expect.soft(rq.p95, 'A1 isolada (quente)').toBeLessThan(A1_MS);
    expect.soft(rf.p95, 'A1 isolada (primeira chamada de cada métrica)').toBeLessThan(A1_MS);
  });
});
