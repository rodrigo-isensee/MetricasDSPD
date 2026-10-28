import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { pastaEvidencias } from '../fixtures/evidencias';

// Q1: axe nos dois temas (incl. /dados) e pacote de evidências para a UX.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa'];
const SAIDA = pastaEvidencias('integracao-real');
const ROTAS = ['/dados', '/dados?fonte=ac', '/dados?mock=coleta-erro:bm', '/dados?mock=coleta-vazia:ac', '/operacional?cadencia=sustentacao', '/operacional?cadencia=diaria&mock=coleta-atrasada:bm', '/operacional?cadencia=diaria&mock=coleta-erro:bm', '/operacional?cadencia=diaria'];
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
  { n: 'faixa-calibracao', rota: '/operacional?cadencia=sustentacao' },
  { n: 'selo-atrasado', rota: '/operacional?cadencia=diaria&mock=coleta-atrasada:bm' },
  { n: 'selo-falha', rota: '/operacional?cadencia=diaria' },
];
const VPS = [
  { v: '1280-claro', w: 1280, tema: 'light' },
  { v: '375-escuro', w: 375, tema: 'dark' },
];
for (const s of SHOTS) for (const vp of VPS) {
  test(`evidencia ${s.n} ${vp.v}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.w, height: 900 });
    await page.addInitScript((t) => localStorage.setItem('metricas-dspd:tema', t), vp.tema);
    await page.goto(s.rota);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.screenshot({ path: `${SAIDA}/${s.n}-${vp.v}.png`, fullPage: false });
  });
}

// UX r1 M-1 e M-2: o selo Falha com "Coleta falhou em..." e o aviso de itens omitidos em "Pede atenção".
for (const vp of VPS) {
  test(`evidencia M-1 selo falha com aviso de coleta ${vp.v}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.w, height: 900 });
    await page.addInitScript((t) => localStorage.setItem('metricas-dspd:tema', t), vp.tema);
    await page.goto('/operacional?cadencia=diaria');
    const aviso = page.getByText(/Coleta falhou em .*Mostrando dados de/);
    await expect(aviso).toBeVisible();
    await expect(page.getByText('Falha', { exact: true }).first()).toBeVisible();
    await aviso.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${SAIDA}/m1-selo-falha-coleta-falhou-${vp.v}.png` });
  });
  test(`evidencia M-2 pede atencao com aviso de omitidos ${vp.v}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.w, height: 900 });
    await page.addInitScript((t) => localStorage.setItem('metricas-dspd:tema', t), vp.tema);
    await page.goto('/operacional?cadencia=sustentacao');
    const aviso = page.getByTestId('atencao-omitidos-calibracao');
    await expect(aviso).toBeVisible();
    await expect(page.getByText(/Verificando o que pede atenção/)).toHaveCount(0);
    await aviso.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${SAIDA}/m2-pede-atencao-omitidos-${vp.v}.png` });
  });
}
