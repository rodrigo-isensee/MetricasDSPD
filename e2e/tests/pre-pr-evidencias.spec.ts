import { readFile } from 'node:fs/promises';
import { test, expect } from '../fixtures/base';

// Pacote de evidências para a revisão de UX antes do PR (develop -> main). Só gera imagens e a primeira página do PDF.
const OUT = '../docs/qa/evidencias/pre-pr';
const CHAVE = 'metricas-dspd:preferencias:v1';

async function tema(page: import('@playwright/test').Page, t: 'claro' | 'escuro', ocultar?: string[]) {
  await page.addInitScript(
    ([tt, chave, o]) => {
      localStorage.setItem('metricas-dspd:tema', tt);
      if (o)
        localStorage.setItem(
          chave,
          JSON.stringify({ versao: 1, paineis: { operacional: { ocultar: o } }, atualizadoEm: '2026-10-10T00:00:00.000Z' }),
        );
    },
    [t, CHAVE, ocultar ?? null] as const,
  );
}

test('pre-pr: /preferencias 1280 claro', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await tema(page, 'claro');
  await page.goto('/preferencias');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.screenshot({ path: `${OUT}/preferencias-1280-claro.png`, fullPage: true });
});

test('pre-pr: painel com métricas ocultas 1280 claro', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await tema(page, 'claro', ['o9', 'o10']);
  await page.goto('/operacional?cadencia=semanal');
  await expect(page.getByTestId('faixa-ocultas')).toContainText('2 métricas ocultas');
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
  await page.screenshot({ path: `${OUT}/painel-ocultas-1280-claro.png` });
});

for (const [w, h, t] of [[1280, 800, 'claro'], [375, 812, 'escuro']] as const) {
  test(`pre-pr: diálogo de exportar ${w} ${t}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await tema(page, t);
    await page.goto('/operacional?cadencia=semanal&periodo=4s');
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
    await page.getByRole('button', { name: 'Exportar', exact: true }).click();
    const dlg = page.getByRole('dialog', { name: 'Exportar · Operacional (fluxo de projeto)' });
    await expect(dlg).toBeVisible();
    await page.screenshot({ path: `${OUT}/exportar-dialogo-${w}-${t}.png` });
    if (w === 1280) {
      await dlg.getByRole('button', { name: 'Gerar arquivo' }).click();
      const baixar = dlg.getByRole('link', { name: 'Baixar' });
      await expect(baixar).toBeVisible({ timeout: 20_000 });
      const [d] = await Promise.all([page.waitForEvent('download'), baixar.click()]);
      await d.saveAs(`${OUT}/exemplo-operacional.pdf`);
      expect((await readFile(`${OUT}/exemplo-operacional.pdf`)).length).toBeGreaterThan(1000);
    }
  });
}
