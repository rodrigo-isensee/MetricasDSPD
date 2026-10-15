import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { test, expect, rodarAxe } from '../fixtures/base';

// Axe WCAG 2.2 AA em todas as rotas e estados, nos dois temas. Escreve o resumo em docs/qa/evidencias/fase-a/axe-resumo.json.
const ROTAS = ['/', '/operacional?cadencia=diaria', '/operacional?cadencia=semanal', '/tatico', '/estrategico', '/operacional?cadencia=sustentacao', '/ajuda', '/rota-inexistente'];
const ESTADOS = ['/operacional?cadencia=diaria&mock=carregando', '/operacional?cadencia=diaria&mock=erro', '/operacional?cadencia=semanal&mock=erro:o4', '/operacional?cadencia=diaria&mock=vazio'];
const TEMAS = ['light', 'dark'] as const;
const resumo: Record<string, unknown> = {};

test.describe.configure({ mode: 'serial' });
test.use({ viewport: { width: 1280, height: 800 } });

test.afterAll(() => {
  const dir = resolve(import.meta.dirname, '../../docs/qa/evidencias/fase-a');
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/axe-resumo.json`, JSON.stringify({ tags: ['wcag2a', 'wcag2aa', 'wcag22aa'], resultados: resumo }, null, 1));
});

for (const tema of TEMAS) {
  for (const rota of [...ROTAS, ...ESTADOS]) {
    test(`A11Y-01/02 axe ${rota} (${tema})`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('metricas-dspd:tema', t === 'dark' ? 'escuro' : 'claro'), tema);
      await page.goto(rota);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
      if (!rota.includes('carregando')) await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
      const r = await rodarAxe(page);
      resumo[`${tema} ${rota}`] = r;
      expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([]);
    });
  }
}

test('A11Y-03 axe com popover de filtro, nota e tabela abertos (dois temas)', async ({ page, painel }) => {
  for (const tema of TEMAS) {
    await page.addInitScript((t) => localStorage.setItem('metricas-dspd:tema', t === 'dark' ? 'escuro' : 'claro'), tema);
    await painel.ir('/operacional?cadencia=semanal');
    await painel.cartao('O4').esperarPronto();
    await painel.cartao('O4').abrirNota();
    await painel.cartao('O4').verComoTabela.click();
    await painel.filtros.botao('equipe').click();
    const r = await rodarAxe(page);
    resumo[`${tema} /operacional (popover+nota+tabela)`] = r;
    expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([]);
    await page.keyboard.press('Escape');
  }
});

test('A11Y-04 axe a 375 px (/, /operacional, /sustentacao)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const rota of ['/', '/operacional?cadencia=diaria', '/operacional?cadencia=sustentacao']) {
    await page.goto(rota);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const r = await rodarAxe(page);
    resumo[`375px ${rota}`] = r;
    expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([]);
  }
});
