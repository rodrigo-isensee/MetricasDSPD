import { test, expect } from '../fixtures/base';

const ROTAS = ['/', '/operacional', '/tatico', '/estrategico', '/sustentacao', '/ajuda'];

for (const w of [320, 375, 640, 768, 1024, 1180, 1280, 1920]) {
  test(`RESP-01 sem rolagem horizontal da página em ${w} px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 800 });
    for (const r of ROTAS) {
      await page.goto(r);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(sobra, `${r} @${w}`).toBeLessThanOrEqual(0);
    }
  });
}

test('RESP-05 largura máxima de 1440 px centralizada em 1920', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1000 });
  await page.goto('/operacional');
  const larg = await page.getByRole('main').evaluate((e) => e.getBoundingClientRect().width);
  expect(larg).toBeLessThanOrEqual(1440);
});

// A7 (UX): cabeçalho não pode quebrar a ponto de a barra sticky ficar coberta, entre 1024 e 1200 px.
for (const w of [1024, 1100, 1180, 1200]) {
  test(`A7 cabeçalho e barra de filtros sticky sem sobreposição em ${w} px`, async ({ painel, page }) => {
    await page.setViewportSize({ width: w, height: 700 });
    await painel.ir('/operacional?cadencia=semanal');
    await painel.cartao('O4').esperarPronto();
    await page.mouse.wheel(0, 600);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    const g = await page.evaluate(() => {
      const h = document.querySelector('header')!.getBoundingClientRect();
      const b = document.querySelector('[data-testid="barra-filtros"]')!.getBoundingClientRect();
      const css = getComputedStyle(document.documentElement);
      return { hTop: h.top, hBottom: h.bottom, bTop: b.top, bBottom: b.bottom, hVar: css.getPropertyValue('--h-cabecalho'), fVar: css.getPropertyValue('--h-filtros') };
    });
    test.info().annotations.push({ type: 'geometria', description: JSON.stringify(g) });
    expect(g.bTop, 'a barra sticky começa abaixo do fim do cabeçalho').toBeGreaterThanOrEqual(g.hBottom - 1);
    // com o foco no último botão da barra, ele não pode ficar coberto (2.4.11)
    await painel.filtros.botao('periodo').focus();
    const coberto = await page.evaluate(() => {
      const r = document.activeElement!.getBoundingClientRect();
      const topo = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !(topo === document.activeElement || document.activeElement!.contains(topo));
    });
    expect(coberto).toBe(false);
  });
}

// M6 (UX): rótulos do eixo X do O4 a 320 px não podem colidir.
test('M6 rótulos do eixo X do O4 a 320 px sem sobreposição e sem rolagem horizontal', async ({ painel, page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await painel.ir('/operacional?cadencia=semanal');
  const o4 = painel.cartao('O4');
  await o4.esperarPronto();
  await o4.rolarAte();
  const ticks = o4.raiz.locator('svg text').filter({ hasText: /^\d{2}\/\d{2}$/ });
  await expect(ticks.first()).toBeAttached();
  const caixas = await ticks.evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: e.textContent }; }));
  test.info().annotations.push({ type: 'ticks', description: JSON.stringify(caixas) });
  const ord = caixas.filter((c) => c.r > c.l).sort((a, b) => a.l - b.l);
  for (let i = 1; i < ord.length; i++) expect(ord[i]!.l, `${ord[i - 1]!.t} x ${ord[i]!.t}`).toBeGreaterThanOrEqual(ord[i - 1]!.r - 0.5);
  const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(sobra).toBeLessThanOrEqual(0);
});

test('A11Y-13 alvos >= 24 px (e >= 44 px abaixo de 768) nos controles do shell e filtros', async ({ painel, page }) => {
  for (const [w, min] of [[1280, 24], [375, 44]] as const) {
    await page.setViewportSize({ width: w, height: 800 });
    await painel.ir('/operacional');
    const pequenos = await page.locator('header button, header a, header select, [data-testid="barra-filtros"] button').evaluateAll((els, m) =>
      els.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.width < m || r.height < m); }).map((e) => `${e.textContent?.trim().slice(0, 20)} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`), min);
    expect(pequenos, `@${w}`).toEqual([]);
  }
});
