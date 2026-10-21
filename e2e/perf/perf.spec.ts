// Projeto `perf` (ADR 0003): F1 LCP, F2 CLS, F3 INP, F4 resposta visual, F5 painel atualizado, C5 heap, C6 tarefa longa.
// Roda contra `vite preview` (build de produção), Chromium, desktop 1366x768, cache limpo na carga fria.
// Imprime o valor real de cada item (resumo p/ docs/qa) e grava e2e/perf-results/resultado.json. Itens que BLOQUEIAM
// (F1 a F5, C6) falham o teste quando fora do orçamento; C5 é alerta (só anota). Nada de skip: sem o app, falha.
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';
import { ORCAMENTO, ROTAS, ROTAS_PAINEL } from '../fixtures/constantes';
import { PainelPage } from '../pages/PainelPage';
import { percentil, resumir, type Resumo } from './estatistica';
import { instalarObservadores, lerVitais, medirCargaFria } from './lcp';
import { medirTrocaFiltro } from './troca-filtro';

const SAIDA = join(process.cwd(), 'perf-results');
// PERF_VARIANTE=api grava resultado-api.json (a medição pela API não sobrescreve a do mock).
const ARQ = join(SAIDA, process.env.PERF_VARIANTE ? `resultado-${process.env.PERF_VARIANTE}.json` : 'resultado.json');
const RODADAS_C6 = Number(process.env.PERF_RODADAS_C6 ?? 3);
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
      // C6 é sensível a carga da máquina. O critério é a MEDIANA AGREGADA de todas as amostras (RODADAS_C6 x N_C6 cargas,
      // sem repetir "até passar" nem escolher a melhor rodada): uma rajada de ruído se dilui, e uma regressão que aparece
      // na maioria das cargas continua acima do limite. Todas as rodadas e o p85 agregado vão para o resultado.json.
      // Na CI (runner exclusivo e estável) PERF_RODADAS_C6=1; localmente rode sob o flock dos agentes (concorrência é a causa do ruído).
      const longas = [v.maiorTarefaLongaMs];
      const medianasPorRodada: number[] = [];
      for (let rodada = 0; rodada < RODADAS_C6; rodada++) {
        const daRodada = rodada === 0 ? [v.maiorTarefaLongaMs] : [];
        for (let i = daRodada.length; i < N_C6; i++) {
          await page.reload();
          await painel.esperarCartoesProntos();
          await page.waitForLoadState('networkidle');
          const medida = (await lerVitais(page)).maiorTarefaLongaMs;
          daRodada.push(medida);
          longas.push(medida);
        }
        medianasPorRodada.push(resumir(daRodada).mediana);
      }
      const c6 = resumir(longas);
      const c6p85 = percentil([...longas].sort((x, y) => x - y), 85);
      registrar(`F2_C6_${rota}`, { ...v, c6, c6p85, medianasPorRodada });
      console.log(`[perf] ${rota}: CLS=${v.cls.toFixed(3)} maiorTarefaLonga(mediana agregada de ${c6.n})=${c6.mediana.toFixed(0)} ms (p85=${c6p85.toFixed(0)} ms, max=${c6.max.toFixed(0)} ms, medianas por rodada=${medianasPorRodada.map((m) => m.toFixed(0)).join('/')})`);
      expect.soft(v.cls, 'F2 CLS').toBeLessThan(ORCAMENTO.F2_cls);
      expect.soft(c6.mediana, 'C6 tarefa longa (mediana agregada)').toBeLessThan(ORCAMENTO.C6_tarefaLongaMs);
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
    // IS-007: sem Performance.enable o getMetrics volta vazio.
    await cdp.send('Performance.enable');
    await cdp.send('HeapProfiler.collectGarbage');
    const { metrics } = await cdp.send('Performance.getMetrics');
    const usado = metrics.find((m) => m.name === 'JSHeapUsedSize')?.value ?? Number.NaN;
    const mb = usado / 1024 / 1024;
    // Medida ausente nunca é "ok".
    expect(Number.isFinite(mb) && mb > 0, `C5: JSHeapUsedSize indisponível (${usado})`).toBe(true);
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

// SNO-004: as reservas de altura do Resumo (BlocoResumo.reserva, EsqueletoTendencia, FrescorFonte.reservarFalha) são números
// medidos a 1280 e a 375 de largura. Este caso mede o CLS do Resumo exatamente nessas larguras, com a latência simulada ligada
// (é ela que mostra o esqueleto), para uma mudança de texto ou de espaçamento não trazer o salto de volta sem aviso.
test.describe('perf-resumo-reservas', () => {
  for (const largura of [1280, 375]) {
    test(`F2 CLS do Resumo a ${largura}px, com os esqueletos reservados`, async ({ page }) => {
      await page.setViewportSize({ width: largura, height: largura === 375 ? 812 : 800 });
      await instalarObservadores(page);
      const painel = new PainelPage(page);
      await painel.ir(ROTAS.operacionalResumo);
      await painel.esperarCartoesProntos();
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
      const v = await lerVitais(page);
      registrar(`F2_resumo_${largura}`, v);
      console.log(`[perf] resumo ${largura}: CLS=${v.cls.toFixed(3)}`);
      // SNO-004: a 1280 px o limite é 0,05 (medido 0,004 com a correção; 0,092 sem ela, que passava no limite geral de 0,1).
      // A 375 px continua com o orçamento geral.
      const limite = largura === 1280 ? 0.05 : ORCAMENTO.F2_cls;
      expect.soft(v.cls, `F2 CLS do Resumo a ${largura}px`).toBeLessThan(limite);
    });
  }
});

// Pedido 025 (K-110, lote 2 do 011): T10 a T14 ficam em "Mais métricas deste painel", fechado por padrão; a medição geral de /tatico
// não os vê. Este caso abre a seção com a equipe escolhida (o T14 só calcula com uma equipe) e mede F2 (CLS, pior carga) e C6
// (tarefa longa, mediana de todas as cargas, como no caso geral). O CLS da seção é o que se soma DEPOIS da abertura (a página
// com equipe escolhida já tem 0,073 a 0,100 de CLS antes de abrir, herdado da `develop`; o caso mede só o que a seção traz). Na API (`perf-api`) o T13 e o T14 trazem dado; no mock do navegador, não.
test.describe('perf-tatico-lote2', () => {
  test.describe.configure({ mode: 'serial' });
  test('F2 CLS e C6 em /tatico com a seção "Mais métricas" aberta (T10 a T14)', async ({ page }) => {
    test.setTimeout(10 * 60_000);
    await instalarObservadores(page);
    const painel = new PainelPage(page);
    const cargas = RODADAS_C6 * N_C6;
    const cls: number[] = [];
    const totais: number[] = [];
    const longas: number[] = [];
    for (let i = 0; i < cargas; i++) {
      await painel.ir(comSemLatencia('/tatico?equipe=erp-protheus'));
      await painel.esperarCartoesProntos();
      await page.waitForLoadState('networkidle');
      const antes = (await lerVitais(page)).cls;
      await page.getByTestId('mais-metricas').locator('summary').click();
      await expect(page.getByTestId('metrica-T14')).toBeVisible();
      await painel.esperarCartoesProntos();
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
      const v = await lerVitais(page);
      cls.push(v.cls - antes);
      totais.push(v.cls);
      longas.push(v.maiorTarefaLongaMs);
    }
    const c6 = resumir(longas);
    const clsMax = Math.max(...cls);
    registrar('F2_C6_tatico_lote2', { cls, clsMax, clsTotais: totais, c6 });
    console.log(`[perf] /tatico com T10 a T14: CLS da seção, pior de ${cargas} cargas=${clsMax.toFixed(3)} (totais da página: ${totais.map((c) => c.toFixed(3)).join(' ')}; da seção: ${cls.map((c) => c.toFixed(3)).join(' ')}) maiorTarefaLonga mediana=${c6.mediana.toFixed(0)} ms (p95=${c6.p95.toFixed(0)}, max=${c6.max.toFixed(0)})`);
    expect.soft(clsMax, 'F2 CLS acrescentado pela seção (pior carga)').toBeLessThan(ORCAMENTO.F2_cls);
    expect.soft(c6.mediana, 'C6 tarefa longa (mediana agregada)').toBeLessThan(ORCAMENTO.C6_tarefaLongaMs);
  });
});
