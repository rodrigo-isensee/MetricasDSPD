import { writeFileSync } from 'node:fs';
import { test, expect, rodarAxe } from '../fixtures/base';
import { pastaEvidencias } from '../fixtures/evidencias';

// QA B12: axe (WCAG 2.2 AA) nos dois temas em /operacional (diária e semanal), /tatico e /estrategico (1280 e 375) + PNGs para a UX.
const DIR = pastaEvidencias('b12');
const ROTAS = [
  ['operacional-diaria', '/operacional?cadencia=diaria'],
  ['operacional-semanal', '/operacional?cadencia=semanal'],
  ['tatico', '/tatico'],
  ['estrategico', '/estrategico'],
] as const;
const VPS = [['1280', 1280, 800], ['375', 375, 812]] as const;
const TEMAS = ['claro', 'escuro'] as const;
const resumo: Record<string, unknown> = {};
test.describe.configure({ mode: 'serial' });
test.afterAll(() => {
  writeFileSync(`${DIR}/axe-resumo.json`, JSON.stringify({ commit: '567e995', tags: ['wcag2a', 'wcag2aa', 'wcag22aa'], resultados: resumo }, null, 1));
});

for (const [slug, rota] of ROTAS) {
  for (const [vpNome, w, h] of VPS) {
    for (const tema of TEMAS) {
      test(`A11Y B12 ${rota} ${vpNome} ${tema}`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: h });
        await page.addInitScript((t) => localStorage.setItem('metricas-dspd:tema', t), tema);
        await page.goto(rota);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
        await page.waitForLoadState('networkidle');
        const r = await rodarAxe(page);
        resumo[`${slug} ${vpNome} ${tema}`] = r;
        await page.screenshot({ path: `${DIR}/${slug}-${vpNome}-${tema}.png`, type: 'png', fullPage: vpNome === '1280' && tema === 'claro' });
        expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([]);
      });
    }
  }
}

const ESTADOS: [string, string, string][] = [
  ['operacional-diaria', '/operacional?cadencia=diaria', 'carregando'],
  ['operacional-diaria', '/operacional?cadencia=diaria', 'erro:o2'],
  ['operacional-diaria', '/operacional?cadencia=diaria', 'vazio'],
  ['operacional-semanal', '/operacional?cadencia=semanal', 'erro:o3'],
  ['tatico', '/tatico', 'erro:t2'],
  ['estrategico', '/estrategico', 'vazio'],
];
for (const [slug, rota, estado] of ESTADOS) {
  test(`Estado ${estado} ${rota}`, async ({ page, painel }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.addInitScript(() => localStorage.setItem('metricas-dspd:tema', 'claro'));
    await painel.ir(rota, { mock: estado });
    if (estado !== 'carregando') await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${DIR}/${slug}-estado-${estado.replace(':', '-')}-1280-claro.png`, type: 'png' });
    const r = await rodarAxe(page);
    resumo[`${slug} estado-${estado}`] = r;
    expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([]);
  });
}
