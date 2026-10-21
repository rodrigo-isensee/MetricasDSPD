import { test, expect } from '../fixtures/base';

// QA 011 lote 2 (pedido 025, E4): B11-001 = sim e CA-51. Com a API semeada com o mesmo fornecedor grafado "TOTVS", "Totvs" e
// " totvs " (MOCK_FORNECEDOR_GRAFIAS=1, ver server/tests/pg/servidor-api-mock.ts), a tela do T10 mostra uma linha só.
// Roda só no projeto `chromium-api-grafias`; sem a variável a API traz "Fornecedor Alfa/Beta/Gama" e este teste falha de propósito.
test('T10-G1 CA-51: fornecedor com grafias só em caixa ou espaços aparece numa linha só, sem espaço sobrando, com a soma dos três', async ({ page, painel }) => {
  await painel.ir('/tatico');
  await painel.esperarCartoesProntos();
  await page.getByTestId('mais-metricas').locator('summary').click();
  await painel.esperarCartoesProntos();
  const t10 = page.getByTestId('metrica-T10');
  const linhas = t10.getByTestId('tabela-T10').getByRole('rowheader');
  await expect(linhas).toHaveCount(1);
  const nome = await linhas.first().innerText();
  expect(nome).toMatch(/^totvs$/i);
  expect(nome).toBe(nome.trim());
  // A linha única soma as três grafias: a base do cartão (n) é a soma dos bloqueios da linha.
  const base = await t10.getByTestId('base-T10').innerText();
  const n = Number(base.match(/(\d+) bloqueios encerrados/)![1]);
  const celulaBloqueios = Number(await t10.getByTestId('tabela-T10').getByRole('row').nth(1).getByRole('cell').first().innerText());
  expect(celulaBloqueios).toBe(n);
  expect(n, 'a linha única junta as três grafias (mais de um bloqueio por grafia)').toBeGreaterThanOrEqual(20);
  // Com 20 ou mais, o P50 e o P85 saem (CA-50).
  await expect(t10.getByTestId('tabela-T10')).toContainText(/P50 [\d,.]+ · P85 [\d,.]+ dias úteis/);
});
