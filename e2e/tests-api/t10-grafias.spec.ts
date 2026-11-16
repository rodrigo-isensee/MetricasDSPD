import { test, expect } from '../fixtures/base';

// Pedido 105 (E7.82, decisão do dono de 2026-11-16): o T10 mostra o tempo total esperando fornecedores, sem separar por
// fornecedor (o nome fica em texto livre, que não entra na base). Com a API semeada com o fornecedor grafado "TOTVS", "Totvs" e
// " totvs " (MOCK_FORNECEDOR_GRAFIAS=1, ver server/tests/pg/servidor-api-mock.ts), a grafia deixou de importar: a tela traz uma
// linha de total e nenhum nome. Roda só no projeto `chromium-api-grafias`.
test('T10-G1: com fornecedor em grafias diferentes, o T10 mostra uma linha de total e nenhum nome de fornecedor', async ({ page, painel }) => {
  await painel.ir('/tatico');
  await painel.esperarPronto();
  await page.getByTestId('mais-metricas').locator('summary').click();
  await painel.esperarPronto();
  const t10 = page.getByTestId('metrica-T10');
  const tabela = t10.getByTestId('tabela-T10');
  await expect(tabela.getByRole('row')).toHaveCount(2); // cabeçalho e a linha do total
  await expect(tabela.getByRole('rowheader')).toHaveText(['Esperando fornecedores']);
  expect(await t10.innerText()).not.toMatch(/totvs/i);
  await expect(t10.getByTestId('t10-motivo')).toContainText('nome do fornecedor não é guardado');
});
