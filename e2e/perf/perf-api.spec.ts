// Projeto `perf-api` (FA-5, ADR 0003 A1): latência dos GET de métrica no navegador, com a SPA em VITE_FONTE=api.
// Duas visões: (1) no navegador, com as ~12 chamadas de um painel em paralelo (6 conexões por origem, risco R2 do plano);
// (2) isolada, uma chamada por vez pelo servidor. A1: p95 < 300 ms. F1 a F5 vêm do `perf.spec.ts` (mesmo projeto).
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';
import { ROTAS, ROTAS_PAINEL } from '../fixtures/constantes';
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

/** AAAA-MM-DD em America/Sao_Paulo. */
const diaSP = (d: Date): string => d.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });

/** `dataReferencia` das tendências: a mais antiga das duas últimas coletas bem-sucedidas (contrato, seção das tendências). */
async function dataReferenciaDasTendencias(request: import('@playwright/test').APIRequestContext): Promise<string> {
  const r = await request.get('/api/v1/referencia');
  expect(r.ok(), 'GET /referencia').toBe(true);
  const { ultimaColeta } = (await r.json()) as { ultimaColeta: Record<string, string | null> };
  const datas = Object.values(ultimaColeta).filter((x): x is string => !!x).map((x) => new Date(x).getTime());
  expect(datas.length, 'ao menos uma coleta registrada').toBeGreaterThan(0);
  return diaSP(new Date(Math.min(...datas)));
}

const TENDENCIAS = ['TENDENCIA_FLUXO', 'TENDENCIA_SUST'] as const;

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
        // o Resumo e a Sustentação montam depois do h1 (chunk sob demanda e consultas em lotes): sem esperar a rede assentar a medição
        // lia a página antes das requisições (Sustentação: 0 amostras; Resumo: 1 de 10 contextos completo)
        await page.waitForLoadState('networkidle');
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
      // guarda contra medição vazia ou truncada: o mínimo de GETs 200 por carga de cada rota (Resumo = 12, Sustentação >= 8)
      const minimoPorCarga = rota === ROTAS.operacionalResumo ? 12 : rota === ROTAS.sustentacao ? 8 : 1;
      expect.soft(r.n, `A1 ${rota}: amostras 200 abaixo do mínimo por carga (${minimoPorCarga} x ${N})`).toBeGreaterThanOrEqual(minimoPorCarga * N);
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
    const ids = ['O1', 'O2', 'O3', 'O4', 'O9', 'O10', 'T1', 'T2', 'T3', 'E1', 'E2', 'S1', 'S2', 'S3', ...TENDENCIAS];
    const dataRef = await dataReferenciaDasTendencias(request);
    const porId: Record<string, { fria: number; quentes: number[] }> = {};
    const frias: number[] = [];
    const quentes: number[] = [];
    const naoOk: string[] = [];
    for (const id of ids) {
      for (let i = 0; i < N; i++) {
        const t0 = performance.now();
        // `cache-control: no-cache` + query única evita servir do cache do servidor/HTTP e mede o cálculo
        // as tendências só aceitam `dataReferencia` (qualquer outro parâmetro é 400)
        const query = (TENDENCIAS as readonly string[]).includes(id) ? `dataReferencia=${dataRef}` : `periodo=12s${id === 'O2' ? '&pageSize=200' : ''}`;
        const r = await request.get(`/api/v1/metricas/${id}?${query}`, { headers: { 'cache-control': 'no-cache' } });
        const ms = performance.now() - t0;
        if (!r.ok()) { naoOk.push(`${id}:${r.status()}`); break; } // medido à parte: não entra nos percentis
        if (id === 'S3') expect(((await r.json()) as { janela?: unknown }).janela, 'S3.janela é obrigatória').toBeTruthy();
        (porId[id] ??= { fria: 0, quentes: [] });
        if (i === 0) porId[id]!.fria = ms; else porId[id]!.quentes.push(ms);
        (i === 0 ? frias : quentes).push(ms);
      }
    }
    const rf = resumir(frias);
    const rq = resumir(quentes);
    console.log(`[perf-api] A1 isolada fria: n=${rf.n} p95=${rf.p95.toFixed(0)} ms max=${rf.max.toFixed(0)} ms | quente: n=${rq.n} p95=${rq.p95.toFixed(0)} ms max=${rq.max.toFixed(0)} ms`);
    console.log(`[perf-api] A1 isolada: métricas com resposta não 200 (fora dos percentis): ${naoOk.join(', ') || 'nenhuma'}`);
    registrar('A1_isolada_nao200', naoOk);
    expect.soft(naoOk, 'respostas não 200 na medição isolada').toEqual([]);
    for (const id of TENDENCIAS) {
      const t = porId[id];
      if (!t) continue;
      const q = resumir(t.quentes);
      console.log(`[perf-api] ${id} (dataReferencia ${dataRef}): fria ${t.fria.toFixed(0)} ms | quente n=${q.n} p95=${q.p95.toFixed(0)} ms max=${q.max.toFixed(0)} ms`);
      registrar(`A1_isolada_${id}`, { dataReferencia: dataRef, friaMs: t.fria, quente: q });
      expect.soft(t.fria, `A1 ${id} fria`).toBeLessThan(A1_MS);
      expect.soft(q.p95, `A2 ${id} quente (alerta, meta 50 ms)`).toBeLessThan(A1_MS);
    }
    registrar('A1_isolada_fria', rf);
    registrar('A1_isolada_quente', rq);
    expect.soft(rq.p95, 'A1 isolada (quente)').toBeLessThan(A1_MS);
    expect.soft(rf.p95, 'A1 isolada (primeira chamada de cada métrica)').toBeLessThan(A1_MS);
  });
  test('A1 das tendências com `dataReferencia` fora do cache (CT-76): cada chamada com uma data nova', async ({ request }) => {
    test.setTimeout(10 * 60_000);
    const base = await dataReferenciaDasTendencias(request);
    const resultados: Record<string, number[]> = {};
    for (const id of TENDENCIAS) {
      resultados[id] = [];
      for (let i = 0; i < N; i++) {
        const d = diaSP(new Date(new Date(`${base}T12:00:00-03:00`).getTime() - i * 86_400_000)); // datas diferentes = chaves de cache diferentes
        const t0 = performance.now();
        const r = await request.get(`/api/v1/metricas/${id}?dataReferencia=${d}`, { headers: { 'cache-control': 'no-cache' } });
        const ms = performance.now() - t0;
        expect(r.status(), `${id} ${d}`).toBe(200);
        resultados[id]!.push(ms);
      }
      const r = resumir(resultados[id]!);
      console.log(`[perf-api] ${id} datas variáveis: n=${r.n} p95=${r.p95.toFixed(0)} ms max=${r.max.toFixed(0)} ms`);
      registrar(`A1_datas_variaveis_${id}`, r);
      expect.soft(r.p95, `A1 ${id} com dataReferencia variável`).toBeLessThan(A1_MS);
    }
  });

  test('o Resumo pede as tendências depois dos números (CT-75, ordem das requisições)', async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ baseURL: baseURL! });
    const page = await ctx.newPage();
    const ordem: string[] = [];
    page.on('request', (r) => {
      const m = /\/api\/v1\/metricas\/([A-Z0-9_]+)/.exec(r.url());
      if (m) ordem.push(m[1]!);
    });
    await new PainelPage(page).ir('/operacional');
    await expect(page.getByTestId('tendencia-fluxo')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('tendencia-sustentacao')).toBeVisible({ timeout: 30_000 });
    await ctx.close();
    const primeiraTendencia = ordem.findIndex((i) => i.startsWith('TENDENCIA_'));
    const ultimoNumero = ordem.map((i) => !i.startsWith('TENDENCIA_')).lastIndexOf(true);
    registrar('ordem_requisicoes_resumo', ordem);
    expect(ordem.filter((i) => i.startsWith('TENDENCIA_')).sort()).toEqual([...TENDENCIAS].sort());
    expect(ordem.length, 'requisições de métrica do Resumo').toBeGreaterThanOrEqual(12);
    expect(primeiraTendencia, `ordem: ${ordem.join(',')}`).toBeGreaterThan(ultimoNumero);
  });
});
