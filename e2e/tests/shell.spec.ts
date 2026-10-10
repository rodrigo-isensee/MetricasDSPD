import { test, expect } from '../fixtures/base';

const ROTAS_PAINEL = ['/', '/operacional', '/tatico', '/estrategico', '/sustentacao', '/espera-invisivel', '/ajuda'];
const DESTINOS = ['Visão geral', 'Operacional', 'Tático', 'Estratégico', 'Sustentação', 'Espera invisível', 'Dados e coletas'];

test.use({ viewport: { width: 1280, height: 800 } });

test('NAV-01/02 entrada em / e 7 destinos na ordem, aria-current só na rota atual @smoke', async ({ painel, page }) => {
  await painel.ir('/');
  expect(await painel.cabecalho.destinos()).toEqual(DESTINOS);
  for (const [i, rota] of ROTAS_PAINEL.slice(0, 6).entries()) {
    await painel.ir(rota);
    await expect(painel.cabecalho.nav.locator('[aria-current="page"]')).toHaveCount(1);
    expect(await painel.cabecalho.itemAtual()).toBe(DESTINOS[i]);
  }
  await painel.ir('/ajuda');
  await expect(page.locator('nav[aria-label="Navegação principal"] [aria-current="page"]')).toHaveCount(0);
});

test('NAV-03 rota desconhecida mostra 404 com link para a Visão geral', async ({ painel, page }) => {
  for (const r of ['/rota-inexistente', '/operacional/xyz']) {
    await page.goto(r);
    await expect(painel.naoEncontrada).toBeVisible();
    await expect(page.getByTestId('pagina-404').getByRole('link').first()).toHaveAttribute('href', '/');
  }
});

test('NAV-04 um h1 por rota e título termina em "Métricas DSPD · Dados fictícios"', async ({ painel, page }) => {
  for (const r of [...ROTAS_PAINEL, '/nada']) {
    await page.goto(r);
    await expect(painel.h1).toHaveCount(1);
    await expect(page).toHaveTitle(/Métricas DSPD · Dados fictícios$/);
  }
});

test('NAV-04/12 foco no h1 ao trocar de painel por clique e por Voltar', async ({ painel, page }) => {
  await painel.ir('/');
  await painel.cabecalho.linkPara('Tático').click();
  await expect(painel.h1).toHaveText('Tático');
  await painel.focoNoH1();
  await page.goBack();
  await expect(painel.h1).not.toHaveText('Tático');
  await painel.focoNoH1();
});

test('NAV-05 skip link é o primeiro focável e leva ao main', async ({ painel, page }) => {
  await painel.ir('/operacional');
  await page.keyboard.press('Tab');
  await expect(painel.cabecalho.pularConteudo).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(async () => {
    const dentro = await page.evaluate(() => !!document.activeElement?.closest('main') || document.activeElement?.tagName === 'MAIN');
    expect(dentro).toBe(true);
  }).toPass();
});

test('NAV-08 gaveta abaixo de 1024: abre, Esc fecha, foco volta ao botão', async ({ painel, page }) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await painel.ir('/');
  await expect(painel.cabecalho.nav).toBeHidden();
  await page.getByTestId('abrir-menu').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByTestId('abrir-menu')).toBeFocused();
});

test('NAV-09 /ajuda tem âncoras de regras e critérios', async ({ page }) => {
  await page.goto('/ajuda#regras');
  await expect(page.locator('#regras')).toBeVisible();
  await expect(page.locator('#criterios')).toBeAttached();
});

test('AVI-01/02/03 aviso de dados fictícios e rodapé em todas as rotas e estados, sem controle de fechar', async ({ painel, page }) => {
  for (const r of [...ROTAS_PAINEL, '/nada', '/operacional?mock=erro', '/operacional?mock=carregando', '/operacional?mock=vazio']) {
    await page.goto(r);
    await painel.cabecalho.esperarAvisoFicticio();
    await expect(painel.cabecalho.aviso.getByRole('button', { name: /fechar|dispensar|ocultar/i })).toHaveCount(0);
    await expect(painel.cabecalho.rodape).toContainText('Dados fictícios');
    await expect(painel.cabecalho.rodape).toContainText('09/10/2026');
  }
  await page.reload();
  await painel.cabecalho.esperarAvisoFicticio();
});

test('A11Y-14 tema: escolha persiste, aplica data-theme e não pisca', async ({ painel, page }) => {
  await painel.ir('/operacional');
  await page.getByTestId('seletor-tema').selectOption('escuro');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByTestId('seletor-tema')).toHaveValue('escuro');
  await page.getByTestId('seletor-tema').selectOption('claro');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('A11Y-14 tema "Sistema" respeita prefers-color-scheme e o atributo existe antes da pintura', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'dark' });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => ((window as unknown as { __t: string }).__t = document.documentElement.getAttribute('data-theme') ?? ''));
  });
  await page.goto('/');
  expect(await page.evaluate(() => (window as unknown as { __t: string }).__t)).toBe('dark');
  await ctx.close();
});

test('A11Y-15 estrutura: lang, marcos e nav rotulado', async ({ page }) => {
  await page.goto('/operacional');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('contentinfo')).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Navegação principal' })).toBeVisible();
});

test('ST-13 console limpo em todas as rotas', async ({ page, problemas }) => {
  for (const r of ROTAS_PAINEL) {
    await page.goto(r);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
  expect(problemas).toEqual([]);
});
