import { test, expect } from '../fixtures/base';

test.use({ viewport: { width: 1280, height: 800 } });

test('ST-01 ?mock=carregando mantém o esqueleto com aria-busy @smoke', async ({ painel }) => {
  await painel.ir('/operacional', { mock: 'carregando' });
  const o4 = painel.cartao('O4');
  await o4.esperarEstado('carregando');
  await expect(o4.raiz).toHaveAttribute('aria-busy', 'true');
  await expect(o4.carregando).toBeVisible();
});

test('ST-03 ?mock=erro:o4 mostra erro só no cartão e a tentativa repetida falha de novo', async ({ painel }) => {
  await painel.ir('/operacional', { mock: 'erro:o4' });
  const o4 = painel.cartao('O4');
  await expect(o4.erro).toBeVisible();
  await o4.tentarDeNovo.click();
  await expect(o4.erro).toBeVisible();
  await expect(painel.cabecalho.aviso).toBeVisible();
});

test('ST-03b ?mock=erro-uma-vez:o4 recupera com "Tentar de novo" (v1-A7)', async ({ painel }) => {
  await painel.ir('/operacional', { mock: 'erro-uma-vez:o4' });
  const o4 = painel.cartao('O4');
  await expect(o4.erro).toBeVisible();
  await o4.tentarDeNovo.click();
  await o4.esperarEstado('ok');
});

test('ST-04 ?mock=erro vira erro de painel, com shell preservado e rota para a Visão geral', async ({ painel, page }) => {
  await painel.ir('/operacional', { mock: 'erro' });
  await expect(painel.erroDePainel).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tentar de novo' })).toBeVisible();
  await painel.cabecalho.esperarAvisoFicticio();
  await page.getByRole('link', { name: 'Ir para a Visão geral' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('ST-05 ?mock=vazio: estado vazio distinto de amostra insuficiente', async ({ painel }) => {
  await painel.ir('/operacional', { mock: 'vazio' });
  const o4 = painel.cartao('O4');
  await o4.esperarEstado('vazio');
  await expect(o4.raiz).toContainText('Nenhum item encontrado');
  await expect(o4.raiz).not.toContainText('Amostra insuficiente');
});

test('ST-05b amostra insuficiente (1 a 19 itens) mostra o estado próprio, com faixa e mediana ocultas', async ({ painel }) => {
  await painel.ir('/operacional?tipo=divida-tecnica&equipe=plataforma-5g');
  const o4 = painel.cartao('O4');
  await o4.esperarPronto();
  await expect(o4.raiz).toContainText(/Amostra insuficiente: \d+ de 20 itens mínimos/);
  await expect(o4.raiz).toContainText('Faixa e mediana indisponíveis');
  await expect(o4.raiz).not.toContainText('Nenhum item encontrado');
});

test('ST-12 mock inválido é ignorado e não aparece na UI nem nos links', async ({ painel, page }) => {
  await painel.ir('/operacional', { mock: 'xyz' });
  await painel.cartao('O4').esperarEstado('ok');
  await expect(page.getByTestId('aviso-filtros-invalidos')).toHaveCount(0);
  await expect(page.getByTestId('operacional-mock-na-ui')).toHaveCount(0);
  expect(await page.locator('main').innerText()).not.toMatch(/mock/i);
  for (const href of await painel.cabecalho.nav.getByRole('link').evaluateAll((a) => a.map((x) => x.getAttribute('href') ?? ''))) {
    expect(href).not.toContain('mock');
  }
});

test('ST-12b links de navegação não propagam mock válido (spec 6.6, v1-A7)', async ({ painel }) => {
  await painel.ir('/operacional', { mock: 'carregando' });
  for (const href of await painel.cabecalho.nav.getByRole('link').evaluateAll((a) => a.map((x) => x.getAttribute('href') ?? ''))) {
    expect(href).not.toContain('mock');
  }
});

test('ST-12c "Copiar link" não inclui mock', async ({ painel, page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await painel.ir('/operacional', { mock: 'carregando' });
  await page.getByTestId('copiar-link').click();
  const url = await page.evaluate(() => navigator.clipboard.readText());
  expect(url).not.toContain('mock');
});

test('ST-10 falha ao carregar o chunk da rota mostra erro com shell, sem tela branca', async ({ painel, page }) => {
  await painel.ir('/');
  await page.route(/assets\/(Operacional|operacional|OperacionalPage)[^/]*\.js/, (r) => r.abort());
  await painel.cabecalho.linkPara('Operacional').click();
  await expect(page.getByTestId('erro-pagina').or(painel.erroDePainel).first()).toBeVisible();
  await painel.cabecalho.esperarAvisoFicticio();
});
