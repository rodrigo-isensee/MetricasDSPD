import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync } from 'node:fs';

// Q1: axe nos dois temas (incl. /dados) e pacote de evidências para a UX.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa'];
const SAIDA = '../docs/qa/evidencias/integracao-real';
const ROTAS = ['/dados', '/dados?fonte=ac', '/dados?mock=coleta-erro:bm', '/dados?mock=coleta-vazia:ac', '/sustentacao', '/operacional?mock=coleta-atrasada:bm', '/operacional?mock=coleta-erro:bm'];
const TEMAS = ['light', 'dark'] as const;

for (const tema of TEMAS) {
  for (const rota of ROTAS) {
    test(`axe ${tema} ${rota}`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('metricas-dspd:tema', t), tema);
      await page.goto(rota);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      const graves = r.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
      expect(graves.map((v) => v.id)).toEqual([]);
    });
  }
}

const SHOTS = [
  { n: 'dados-bm', rota: '/dados' },
  { n: 'dados-ac', rota: '/dados?fonte=ac' },
  { n: 'faixa-calibracao', rota: '/sustentacao' },
  { n: 'selo-atrasado', rota: '/operacional?mock=coleta-atrasada:bm' },
  { n: 'selo-falha', rota: '/operacional?mock=coleta-erro:bm' },
];
const VPS = [
  { v: '1280-claro', w: 1280, tema: 'light' },
  { v: '375-escuro', w: 375, tema: 'dark' },
];
for (const s of SHOTS) for (const vp of VPS) {
  test(`evidencia ${s.n} ${vp.v}`, async ({ page }) => {
    mkdirSync(SAIDA, { recursive: true });
    await page.setViewportSize({ width: vp.w, height: 900 });
    await page.addInitScript((t) => localStorage.setItem('metricas-dspd:tema', t), vp.tema);
    await page.goto(s.rota);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.screenshot({ path: `${SAIDA}/${s.n}-${vp.v}.png`, fullPage: false });
  });
}
