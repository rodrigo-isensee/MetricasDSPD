// Projeto `perf` (ADR 0003): F1 LCP, F2 CLS, F3 INP, F4 resposta visual, F5 painel atualizado, C5 heap, C6 tarefa longa.
// Roda contra `vite preview` (build de produção), Chromium, desktop 1366x768, cache limpo na carga fria.
// Imprime o valor real de cada item (resumo p/ docs/qa) e grava e2e/perf-results/resultado.json. Itens que BLOQUEIAM
// (F1 a F5, C6) falham o teste quando fora do orçamento; C5 é alerta (só anota). Nada de skip: sem o app, falha.
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';
import { ORCAMENTO, ROTAS, ROTAS_PAINEL } from '../fixtures/constantes';
import { PainelPage } from '../pages/PainelPage';
import { resumir, type Resumo } from './estatistica';
import { instalarObservadores, lerVitais, medirCargaFria } from './lcp';
import { medirTrocaFiltro } from './troca-filtro';

const SAIDA = join(process.cwd(), 'perf-results');
// PERF_VARIANTE=api grava resultado-api.json (a medição pela API não sobrescreve a do mock).
const ARQ = join(SAIDA, process.env.PERF_VARIANTE ? `resultado-${process.env.PERF_VARIANTE}.json` : 'resultado.json');
const N_C6 = Number(process.env.PERF_REPETICOES_C6 ?? 5);
const N = Number(process.env.PERF_REPETICOES ?? ORCAMENTO.repeticoes);
/** Parâmetro opcional que desliga a latência simulada do mock (F5). Mecanismo a definir pelo react-frontend (ADR 0003). */
const SEM_LATENCIA = process.env.PERF_QUERY_SEM_LATENCIA ?? ''; // ex.: "latencia=0"

const comSemLatencia = (rota: string) => (SEM_LATENCIA ? rota + (rota.includes('?') ? '&' : '?') + SEM_LATENCIA : rota);

function registrar(chave: string, valor: unknown): void {
  mkdirSync(SAIDA, { recursive: true });
  const atual = existsSync(ARQ) ? (JSON.parse(readFileSync(ARQ, 'utf8')) as Record<string, unknown>) : {};
  atual[chave] = valor;
  atual.ambiente = { node: process.version, plataforma: process.platform, data: new Date().toISOString() };
  writeFileSync(ARQ, JSON.stringify(atual, null, 2));
}
const linha = (id: string, r: Resumo, unidade: string) =>
  console.log(`[perf] ${id}: n=${r.n} primeira=${r.primeira.toFixed(1)}${unidade} mediana=${r.mediana.toFixed(1)}${unidade} p95=${r.p95.toFixed(1)}${unidade} max=${r.max.toFixed(1)}${unidade}`);

test.describe('perf', () => {
  test.describe.configure({ mode: 'serial' }); // medições de tempo não podem competir por CPU entre si

  test('F1 LCP da rota / em carga fria (p95 < 2,0 s)', async ({ browser, baseURL }) => {
    test.setTimeout(10 * 60_000);
    const amostras: number[] = [];
    for (let i = 0; i < N; i++) {
      const v = await medirCargaFria(browser, ROTAS.visaoGeral, { baseURL: baseURL! });
      expect(v.lcpMs, 'o navegador não reportou LCP').not.toBeNull();
      amostras.push(v.lcpMs!);
    }
    const r = resumir(amostras);
    linha('F1 LCP', r, ' ms');
    registrar('F1_lcp', r);
    expect.soft(r.p95).toBeLessThan(ORCAMENTO.F1_lcpMs);

    // alerta adicional (não bloqueia): CPU 4x mais lenta
    const lento = resumir([await medirCargaFria(browser, ROTAS.visaoGeral, { baseURL: baseURL!, throttleCpu: 4 }).then((v) => v.lcpMs ?? Number.NaN)]);
    registrar('F1_lcp_cpu4x_alerta', lento);
    console.log(`[perf] F1 (alerta, CPU 4x): ${lento.primeira.toFixed(0)} ms`);
  });

  for (const rota of ROTAS_PAINEL) {
    test(`F2 CLS e C6 tarefa longa em ${rota}`, async ({ page }) => {
      await instalarObservadores(page);
      const painel = new PainelPage(page);
      await painel.ir(comSemLatencia(rota));
      await painel.esperarCartoesProntos();
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
      const v = await lerVitais(page);
      // C6 é sensível a carga da máquina (uma tarefa isolada pode dobrar): mediana de N cargas, limite inalterado.
      const longas = [v.maiorTarefaLongaMs];
      for (let i = 1; i < N_C6; i++) {
        await page.reload();
        await painel.esperarCartoesProntos();
        await page.waitForLoadState('networkidle');
        longas.push((await lerVitais(page)).maiorTarefaLongaMs);
      }
      const c6 = resumir(longas);
      registrar(`F2_C6_${rota}`, { ...v, c6 });
      console.log(`[perf] ${rota}: CLS=${v.cls.toFixed(3)} maiorTarefaLonga(mediana de ${c6.n})=${c6.mediana.toFixed(0)} ms (max=${c6.max.toFixed(0)} ms)`);
      expect.soft(v.cls, 'F2 CLS').toBeLessThan(ORCAMENTO.F2_cls);
      expect.soft(c6.mediana, 'C6 tarefa longa (mediana)').toBeLessThan(ORCAMENTO.C6_tarefaLongaMs);
    });
  }

  test('F3 INP, F4 resposta visual e F5 painel atualizado na troca de filtro (Operacional, p95)', async ({ page }) => {
    test.setTimeout(10 * 60_000);
    await instalarObservadores(page);
    const painel = new PainelPage(page);
    const visual: number[] = [];
    const final: number[] = [];
    const falhas: string[] = [];

    await painel.ir(comSemLatencia(ROTAS.operacional));
    await painel.esperarCartoesProntos();

    // F4 é medido COM a latência simulada ligada; F5 SEM ela (ADR 0003). O mock é o mesmo: se SEM_LATENCIA estiver
    // vazio, F5 inclui a latência simulada e o resultado é reportado como "com latência" (não vale para a pré-entrega).
    const alternativas = ['Incidente', 'Melhoria'];
    for (let i = 0; i < N; i++) {
      const nome = alternativas[i % alternativas.length]!;
      const m = await medirTrocaFiltro(page, async () => {
        await painel.filtros.botao('tipo').click();
        await page.getByRole('checkbox', { name: nome }).first().click();
      });
      await page.keyboard.press('Escape');
      if (m.respostaVisualMs !== null) visual.push(m.respostaVisualMs);
      if (m.painelAtualizadoMs !== null) final.push(m.painelAtualizadoMs);
      if (m.motivo) falhas.push(`#${i + 1}: ${m.motivo}`);
    }
    expect(falhas, 'o painel não sinalizou estado final: falta data-estado/aria-busy (ver plano R2.7)').toEqual([]);

    const rv = resumir(visual);
    const rf = resumir(final);
    linha('F4 resposta visual', rv, ' ms');
    linha(`F5 painel atualizado${SEM_LATENCIA ? '' : ' (COM latência simulada)'}`, rf, ' ms');
    registrar('F4_respostaVisual', rv);
    registrar('F5_painelAtualizado', { ...rf, semLatencia: !!SEM_LATENCIA });
    expect.soft(rv.p95, 'F4').toBeLessThan(ORCAMENTO.F4_respostaVisualMs);
    expect.soft(rf.p95, 'F5').toBeLessThan(ORCAMENTO.F5_painelMs);

    const v = await lerVitais(page);
    registrar('F3_inp', { inpMs: v.inpMs, maiorTarefaLongaMs: v.maiorTarefaLongaMs });
    console.log(`[perf] F3 INP (pior interação): ${v.inpMs?.toFixed(0) ?? 'n/d'} ms`);
    if (v.inpMs !== null) expect.soft(v.inpMs, 'F3 INP').toBeLessThan(ORCAMENTO.F3_inpMs);
  });

  test('C5 heap JS após abrir todos os painéis (alerta < 150 MB)', async ({ page }) => {
    const painel = new PainelPage(page);
    for (const rota of ROTAS_PAINEL) {
      await painel.ir(comSemLatencia(rota));
      await painel.esperarCartoesProntos();
    }
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('HeapProfiler.collectGarbage');
    const { metrics } = await cdp.send('Performance.getMetrics');
    const usado = metrics.find((m) => m.name === 'JSHeapUsedSize')?.value ?? Number.NaN;
    const mb = usado / 1024 / 1024;
    registrar('C5_heapMB', mb);
    console.log(`[perf] C5 heap após todos os painéis: ${mb.toFixed(1)} MB (alerta > ${ORCAMENTO.C5_heapMB} MB)`);
    // Alerta: só anota, não falha (ADR 0003: "não (alerta)").
    test.info().annotations.push({ type: 'alerta-C5', description: mb > ORCAMENTO.C5_heapMB ? `FORA: ${mb.toFixed(1)} MB` : `ok: ${mb.toFixed(1)} MB` });
  });
});

// K-050 (bug 008): CLS também em mobile 375x812 (grid em coluna única). Describe próprio: uma rota que falha não pula as outras.
test.describe('perf-375', () => {
  for (const rota of ROTAS_PAINEL) {
    test(`F2 CLS a 375x812 em ${rota}`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await instalarObservadores(page);
      const painel = new PainelPage(page);
      await painel.ir(comSemLatencia(rota));
      await painel.esperarCartoesProntos();
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
      const v = await lerVitais(page);
      registrar(`F2_375_${rota}`, v);
      console.log(`[perf] 375 ${rota}: CLS=${v.cls.toFixed(3)}`);
      expect.soft(v.cls, 'F2 CLS 375').toBeLessThan(ORCAMENTO.F2_cls);
    });
  }
});
