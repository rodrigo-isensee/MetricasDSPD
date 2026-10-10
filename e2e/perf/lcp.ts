import type { Browser, BrowserContext, Page } from '@playwright/test';

// Helper de Web Vitals por PerformanceObserver (ADR 0003: F1 LCP, F2 CLS, F3 INP, C6 tarefas longas).
// O observador é instalado com addInitScript, antes de qualquer script da página, com `buffered: true`.

export interface VitaisPagina {
  lcpMs: number | null;
  lcpElemento: string | null;
  cls: number;
  tarefasLongasMs: number[];
  maiorTarefaLongaMs: number;
  /** Maior duração de interação (event timing) vista; aproxima o INP quando há poucas interações. */
  inpMs: number | null;
}

const SCRIPT_OBSERVADORES = `
(() => {
  const v = (window.__vitais = { lcp: null, lcpEl: null, cls: 0, longtasks: [], inp: null, interacoes: {} });
  const obs = (tipo, cb, extra) => {
    try { new PerformanceObserver((l) => l.getEntries().forEach(cb)).observe({ type: tipo, buffered: true, ...extra }); } catch (_) {}
  };
  obs('largest-contentful-paint', (e) => { v.lcp = e.startTime; v.lcpEl = e.element ? (e.element.tagName + (e.element.id ? '#' + e.element.id : '')) : null; });
  obs('layout-shift', (e) => { if (!e.hadRecentInput) v.cls += e.value; });
  obs('longtask', (e) => { v.longtasks.push(e.duration); });
  // INP: pior interação (agrupada por interactionId), ignorando eventos sem interactionId.
  obs('event', (e) => {
    if (!e.interactionId) return;
    const atual = v.interacoes[e.interactionId] || 0;
    if (e.duration > atual) v.interacoes[e.interactionId] = e.duration;
    v.inp = Math.max(v.inp || 0, e.duration);
  }, { durationThreshold: 16 });
})();
`;

export async function instalarObservadores(alvo: Page | BrowserContext): Promise<void> {
  await alvo.addInitScript(SCRIPT_OBSERVADORES);
}

export async function lerVitais(page: Page): Promise<VitaisPagina> {
  return page.evaluate(() => {
    const v = (window as unknown as { __vitais?: { lcp: number | null; lcpEl: string | null; cls: number; longtasks: number[]; inp: number | null } }).__vitais;
    if (!v) throw new Error('Observadores de performance não instalados (chame instalarObservadores antes de navegar).');
    return {
      lcpMs: v.lcp,
      lcpElemento: v.lcpEl,
      cls: v.cls,
      tarefasLongasMs: v.longtasks,
      maiorTarefaLongaMs: v.longtasks.reduce((m, x) => Math.max(m, x), 0),
      inpMs: v.inp,
    };
  });
}

/**
 * Carga fria: contexto novo (sem cache, storage limpo), navegação e leitura do LCP depois que a rede acalma.
 * O LCP só é finalizado pelo navegador na primeira interação ou ao ocultar a página; por isso a leitura
 * usa o último candidato visto até `load` + rede ociosa + um quadro de animação.
 */
export async function medirCargaFria(
  browser: Browser,
  url: string,
  opcoes: { baseURL: string; throttleCpu?: number; viewport?: { width: number; height: number } },
): Promise<VitaisPagina> {
  const contexto = await browser.newContext({
    baseURL: opcoes.baseURL,
    viewport: opcoes.viewport ?? { width: 1366, height: 768 },
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    serviceWorkers: 'block',
  });
  try {
    await instalarObservadores(contexto);
    const page = await contexto.newPage();
    if (opcoes.throttleCpu && opcoes.throttleCpu > 1) {
      const cdp = await contexto.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: opcoes.throttleCpu });
    }
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => r())));
    return await lerVitais(page);
  } finally {
    await contexto.close();
  }
}
