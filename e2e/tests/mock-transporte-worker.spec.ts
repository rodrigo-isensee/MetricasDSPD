import { test, expect } from '../fixtures/base';
import type { Page } from '@playwright/test';
import { ROTAS } from '../fixtures/constantes';

// Paridade E2E do transporte do mock (ADR 0021, seção 3, item 4; pedido 037, K-113).
// Obrigações: (1) no build mock, em Chromium real, o cálculo roda num Web Worker de módulo, de arquivo próprio da mesma
// origem (CSP `default-src 'self'`: nunca `blob:`); (2) sem `Worker` o mesmo núcleo roda em processo (fallback) e o
// painel mostra exatamente o mesmo conteúdo. Cobre VISAO_GERAL ("/"), O2 (diária) e uma complementar do Acelerato
// (sustentação). A latência simulada é desligada (`?latencia=0`): só o transporte muda.
const CASOS = [
  ['VISAO_GERAL', ROTAS.visaoGeral],
  ['O2 (Operacional diária)', ROTAS.operacional],
  ['complementar do Acelerato (Sustentação)', ROTAS.sustentacao],
] as const;

const comLatencia0 = (rota: string) => rota + (rota.includes('?') ? '&' : '?') + 'latencia=0';

async function lerPainel(page: Page, rota: string): Promise<{ texto: string; cartoes: number }> {
  await page.goto(comLatencia0(rota));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const cartoes = page.locator('[data-testid^="metrica-"]');
  if (rota !== ROTAS.visaoGeral) await expect(cartoes.first()).toBeVisible();
  await expect(page.locator('[data-testid^="metrica-"][aria-busy="true"]')).toHaveCount(0);
  await expect(page.locator('[data-testid^="estado-carregando-"]')).toHaveCount(0);
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
  return { texto: await lerTexto(page), cartoes: await cartoes.count() };
}

// Sem espaços nem quebras: a quebra de linha dos rótulos de gráfico depende da medição do layout, não do dado.
const lerTexto = async (page: Page) => (await page.getByRole('main').textContent())?.replace(/\s+/g, '') ?? '';

test.describe('transporte do mock (ADR 0021)', () => {
  test('o cálculo roda em Web Worker de módulo da mesma origem, nunca blob:', async ({ page, baseURL }) => {
    await lerPainel(page, ROTAS.operacional);
    // o Worker pode demorar a ser listado depois do primeiro resultado: a asserção espera
    await expect.poll(() => page.workers().length, 'nenhum Web Worker: o mock calculou na thread principal').toBeGreaterThanOrEqual(1);
    for (const w of page.workers()) {
      expect(w.url().startsWith(`${baseURL}/`), `Worker fora da mesma origem: ${w.url()}`).toBe(true);
      expect(w.url()).not.toMatch(/^blob:|^data:/);
    }
  });

  for (const [nome, rota] of CASOS) {
    test(`paridade Worker × em processo: ${nome}`, async ({ browser, baseURL }) => {
      const comWorker = await browser.newContext({ baseURL: baseURL!, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' });
      const semWorker = await browser.newContext({ baseURL: baseURL!, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' });
      try {
        await semWorker.addInitScript(() => {
          Object.defineProperty(window, 'Worker', { value: undefined, configurable: true });
        });
        const a = await comWorker.newPage();
        const b = await semWorker.newPage();
        const doWorker = await lerPainel(a, rota);
        const emProcesso = await lerPainel(b, rota);
        await expect.poll(() => a.workers().length, 'o caminho com Worker não usou Worker').toBeGreaterThanOrEqual(1);
        expect(b.workers().length, 'o fallback não pode criar Worker').toBe(0);
        // guarda contra comparar dois painéis vazios
        expect(doWorker.texto.length, 'painel sem conteúdo').toBeGreaterThan(200);
        if (rota !== ROTAS.visaoGeral) expect(doWorker.cartoes, 'cartões do painel').toBeGreaterThanOrEqual(2);
        expect(emProcesso.cartoes).toBe(doWorker.cartoes);
        // estado final: os gráficos desenham em tarefa própria, então a igualdade é esperada com repetição da leitura
        await expect
          .poll(async () => (await lerTexto(a)) === (await lerTexto(b)), { message: 'o conteúdo do painel difere entre Worker e processo' })
          .toBe(true);
      } finally {
        await comWorker.close();
        await semWorker.close();
      }
    });
  }
});
