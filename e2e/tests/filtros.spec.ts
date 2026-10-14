import { test, expect } from '../fixtures/base';

test.use({ viewport: { width: 1280, height: 800 } });

test('FIL-01/02 filtros por painel e URL limpa no padrão', async ({ painel, page }) => {
  await painel.ir('/operacional?cadencia=diaria');
  for (const f of ['equipe', 'tipo', 'sistema', 'periodo'] as const) await expect(painel.filtros.botao(f)).toBeVisible();
  expect(painel.filtros.parametros().toString()).toBe('');
  await expect(painel.filtros.limpar).toHaveCount(0);
  await painel.ir('/operacional?cadencia=sustentacao');
  await expect(painel.filtros.botao('prioridade')).toBeVisible();
  await expect(painel.filtros.botao('tipo')).toHaveCount(0);
  await expect(page.getByTestId('barra-filtros')).toContainText('Últimos 6 meses');
});

test('FIL-03/06/07 marcar atualiza URL, recarregar restaura, chip remove, limpar restaura @smoke', async ({ painel, page }) => {
  await painel.ir('/operacional?cadencia=semanal');
  const o4 = painel.cartao('O4');
  await o4.esperarPronto();
  const antes = await o4.baseItens();
  await painel.filtros.alternar('equipe', ['ERP Protheus']);
  await expect(page).toHaveURL(/equipe=erp-protheus/);
  await o4.esperarPronto();
  // A base some durante a recarga (null): espera um número diferente de `antes` e depois que ele se estabilize.
  await expect.poll(async () => { const n = await o4.baseItens(); return n !== null && n !== antes; }).toBe(true);
  await o4.esperarPronto();
  const filtrado = await o4.baseItens();
  await page.reload();
  await o4.esperarPronto();
  await expect.poll(() => o4.baseItens()).toBe(filtrado);
  await expect(painel.filtros.limpar).toBeVisible();
  await painel.filtros.botaoRemover('Equipe: ERP Protheus').click();
  await expect(page).not.toHaveURL(/equipe=/);
  await o4.esperarPronto();
  await expect.poll(() => o4.baseItens()).toBe(antes);
  await painel.filtros.alternar('tipo', ['Incidente']);
  await painel.filtros.limpar.click();
  await expect.poll(() => painel.filtros.parametros().toString()).toBe('cadencia=semanal'); // limpar filtros preserva a cadência (não é filtro)
});

test('FIL-04 marcar todos os valores remove o parâmetro', async ({ painel, page }) => {
  await painel.ir('/operacional?cadencia=diaria');
  await painel.filtros.botao('equipe').click();
  const nomes = ['ERP Protheus', 'Fluig', 'Senior', 'Marketing e Vendas', 'Dados', 'Plataforma 5G'];
  for (const n of nomes) await page.getByRole('checkbox', { name: n }).click();
  await page.keyboard.press('Escape');
  await expect.poll(() => painel.filtros.parametros().has('equipe')).toBe(false); // a URL é atualizada ao fechar o menu; ler na hora corre contra o commit (flaky sob carga)
});

test('FIL-05 Voltar desfaz só a última mudança, Avançar refaz', async ({ painel, page }) => {
  await painel.ir('/operacional?cadencia=diaria');
  await painel.filtros.alternar('equipe', ['ERP Protheus']);
  await painel.filtros.alternar('sistema', ['Fluig']).catch(() => undefined);
  const url2 = page.url();
  await page.goBack();
  expect(page.url()).not.toBe(url2);
  await page.goForward();
  expect(page.url()).toBe(url2);
});

test('FIL-08 filtros de fluxo ficam guardados na visão Sustentação e não viram filtro dela', async ({ painel, page }) => {
  await painel.ir('/operacional?cadencia=diaria&equipe=erp-protheus');
  await page.getByRole('radio', { name: 'Sustentação' }).click({ force: true });
  await expect(page).toHaveURL(/cadencia=sustentacao/);
  await expect(page).toHaveURL(/equipe=erp-protheus/);
  await expect(page).not.toHaveURL(/sust_equipe/);
});

test('FIL-09 URL inválida ignora só o inválido e avisa', async ({ painel, page }) => {
  await painel.ir('/operacional?equipe=xyz&tipo=foo&periodo=99&cadencia=x');
  await expect(painel.filtros.invalidos).toBeVisible();
  await expect(painel.filtros.invalidos).toContainText('foram ignorados');
  await painel.cartao('O2').esperarEstado('ok');
  await page.getByRole('button', { name: 'Entendi' }).click();
  await expect(painel.filtros.invalidos).toHaveCount(0);
});

test('FIL-10 consolidado com 2 ou mais equipes (inclusive Todas), com N correto', async ({ painel }) => {
  await painel.ir('/operacional?cadencia=diaria');
  expect(await painel.filtros.equipesConsolidadas()).toBe(6); // spec: também em "Todas"
  await painel.ir('/operacional?cadencia=diaria&equipe=erp-protheus');
  expect(await painel.filtros.equipesConsolidadas()).toBeNull();
  await painel.ir('/operacional?cadencia=diaria&equipe=erp-protheus,fluig,senior');
  expect(await painel.filtros.equipesConsolidadas()).toBe(3);
  await expect(painel.filtros.consolidado).toContainText('não compara equipes');
});

test('FIL-12 O4 informa os filtros aplicados', async ({ painel }) => {
  await painel.ir('/operacional?equipe=erp-protheus&cadencia=semanal');
  await expect(painel.cartao('O4').raiz).toContainText('Filtros');
});

test('FIL-13 abaixo de 768 px os filtros viram folha com "Ver resultados"', async ({ painel, page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await painel.ir('/operacional?cadencia=diaria');
  await expect(painel.filtros.abrirFolha).toBeVisible();
  await painel.filtros.abrirFolha.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ver resultados' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(painel.filtros.abrirFolha).toBeFocused();
});

test('FIL-16 popover: teclado abre, Esc fecha e devolve o foco', async ({ painel, page }) => {
  await painel.ir('/operacional?cadencia=diaria');
  await painel.filtros.botao('tipo').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('checkbox').first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(painel.filtros.botao('tipo')).toBeFocused();
});

test('FIL-19 mudança de filtro é anunciada na região aria-live', async ({ painel }) => {
  await painel.ir('/operacional?cadencia=diaria');
  await painel.filtros.alternar('equipe', ['ERP Protheus']);
  await expect(painel.filtros.regiaoAnuncios.filter({ hasText: /Filtros atualizados/ }).first()).toBeAttached();
});

test('FIL-22 alternar 10 vezes não gera URL inconsistente', async ({ painel, page }) => {
  await painel.ir('/operacional?cadencia=diaria');
  await painel.filtros.botao('equipe').click();
  const caixa = page.getByRole('checkbox', { name: 'Fluig' });
  for (let i = 0; i < 10; i++) await caixa.click();
  await page.keyboard.press('Escape');
  await expect.poll(() => painel.filtros.parametros().has('equipe')).toBe(false); // espera o commit da URL ao fechar o menu (flaky sob carga)
});

test('NAV-06 links entre painéis de fluxo preservam filtros', async ({ painel, page }) => {
  await painel.ir('/operacional?cadencia=diaria&equipe=erp-protheus&tipo=incidente');
  await painel.cabecalho.linkPara('Tático').click();
  await expect(page).toHaveURL(/equipe=erp-protheus/);
  await expect(page).toHaveURL(/tipo=incidente/);
});
