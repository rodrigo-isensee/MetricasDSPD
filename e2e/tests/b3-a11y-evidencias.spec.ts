import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test, expect, rodarAxe } from '../fixtures/base';

// QA B3: axe (WCAG 2.2 AA) nos dois temas na visão Sustentação do /operacional, /espera-invisivel e / (1280 e 375) + screenshots para a UX.
const DIR = resolve(import.meta.dirname, '../../docs/qa/evidencias/b3');
const ROTAS = [['sustentacao', '/operacional?cadencia=sustentacao'], ['visao-geral', '/']] as const;
const VPS = [['1280', 1280, 800], ['375', 375, 812]] as const;
const TEMAS = [['claro', 'claro'], ['escuro', 'escuro']] as const;
const ESTADOS = ['erro', 'vazio', 'carregando'] as const;
const resumo: Record<string, unknown> = {};
test.describe.configure({ mode: 'serial' });
mkdirSync(DIR, { recursive: true });
test.afterAll(() => {
  writeFileSync(`${DIR}/axe-resumo.json`, JSON.stringify({ commit: 'e4ccab7', tags: ['wcag2a', 'wcag2aa', 'wcag22aa'], resultados: resumo }, null, 1));
});

for (const [slug, rota] of ROTAS) {
  for (const [vpNome, w, h] of VPS) {
    for (const [temaNome, temaValor] of TEMAS) {
      test(`A11Y B3 ${rota} ${vpNome} ${temaNome}`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: h });
        await page.addInitScript((t) => localStorage.setItem('metricas-dspd:tema', t), temaValor);
        await page.goto(rota);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
        const r = await rodarAxe(page);
        resumo[`${slug} ${vpNome} ${temaNome}`] = r;
        await page.screenshot({ path: `${DIR}/${slug}-${vpNome}-${temaNome}.png`, type: 'png' });
        expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([]);
      });
    }
  }
  for (const estado of ESTADOS) {
    test(`Estado ${estado} ${rota} 1280 claro`, async ({ page, painel }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.addInitScript(() => localStorage.setItem('metricas-dspd:tema', 'claro'));
      await painel.ir(rota, { mock: estado });
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      if (estado !== 'carregando') await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
      await page.screenshot({ path: `${DIR}/${slug}-estado-${estado}-1280-claro.png`, type: 'png' });
      const r = await rodarAxe(page);
      resumo[`${slug} estado-${estado}`] = r;
      expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([]);
    });
  }
}
