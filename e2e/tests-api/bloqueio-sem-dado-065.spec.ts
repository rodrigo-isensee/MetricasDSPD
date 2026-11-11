import { test, expect, rodarAxe } from '../fixtures/base';
import { ROTAS } from '../fixtures/constantes';

// QA 065 (K-205), invertido no pedido 075 (lote 6b, K-204). Roda contra a SPA em VITE_FONTE=api e a API de teste `server/tests/pg/api-stub-065.ts`
// (E2E_API_URL=http://127.0.0.1:3199), que aplica as regras de publicação do servidor na base real: BLOQUEADOS, O5 e O19 voltaram ao
// mapa real e a parte de bloqueio do O1 e do O2 sai calculada, sem a nota "sem dado real". Sem banco.

/** O O5 fica em "Mais métricas" (fechado por padrão): abre pelo teclado/clique no resumo antes de olhar o cartão. */
async function abrirMaisMetricas(page: import('@playwright/test').Page) {
  const det = page.getByTestId('mais-metricas');
  if ((await det.getAttribute('open')) === null) await det.locator('summary').click();
}

test.describe('075 (6b): bloqueio com dado real na base real (inverte o 065)', () => {
  test('Q65-01 BLOQUEADOS publica o cartão, sem "Sem dado real" nem motivo de coleta ausente', async ({ painel, page }) => {
    await painel.ir(ROTAS.operacional);
    await painel.esperarPronto();
    const c = page.getByTestId('metrica-BLOQUEADOS');
    await expect(c).toBeVisible();
    await expect(c.getByTestId('estado-sem-dado-real-BLOQUEADOS')).toHaveCount(0);
    await expect(c.getByText(/a coleta ainda não grava os bloqueios/)).toHaveCount(0);
  });

  test('Q65-02 O1 traz os bloqueados calculados, sem "bloqueados: sem dado real" nem a nota; o WIP total continua', async ({ painel, page }) => {
    await painel.ir(ROTAS.operacional);
    await painel.esperarPronto();
    const c = page.getByTestId('metrica-O1');
    await expect(c.getByTestId('o1-bloqueados-sem-dado')).toHaveCount(0);
    await expect(c.getByText(/bloqueados: sem dado real/)).toHaveCount(0);
    await expect(c.getByText(/Bloqueios: sem dado real/)).toHaveCount(0);
    await expect(c.getByText(/Hoje há \d+/)).toBeVisible();
  });

  test('Q65-03 O2 sem "Sem dado real" na coluna Bloqueado e sem a nota; dispersão e percentis ficam', async ({ painel, page }) => {
    await painel.ir(ROTAS.operacional);
    await painel.esperarPronto();
    const c = page.getByTestId('metrica-O2');
    await expect(c.getByText(/Bloqueios: sem dado real/)).toHaveCount(0);
    await expect(c.getByTestId('o2-lista').getByText('Sem dado real')).toHaveCount(0);
    await expect(c.getByTestId('o2-grafico')).toContainText('P95');
  });

  test('Q65-04 faixa "Pede atenção" deixa de ser parcial por falta de dado de bloqueio', async ({ painel, page }) => {
    await painel.ir(ROTAS.operacional);
    await painel.esperarPronto();
    const faixa = page.getByTestId('faixa-atencao');
    await expect(faixa).toBeVisible();
    await expect(faixa.getByTestId('faixa-atencao-sem-dado-real-parcial')).toHaveCount(0);
  });

  test('Q65-05 O5 publica o cartão, sem "Sem dado real" nem motivo de coleta ausente', async ({ painel, page }) => {
    await painel.ir(ROTAS.operacionalSemanal);
    await painel.esperarPronto();
    await abrirMaisMetricas(page);
    const c = page.getByTestId('metrica-O5');
    await c.scrollIntoViewIfNeeded();
    await expect(c.getByTestId('estado-sem-dado-real-O5')).toHaveCount(0);
    await expect(c.getByText(/a coleta ainda não grava os bloqueios/)).toHaveCount(0);
  });

  test('Q65-06 Diária: zero violações sérias ou críticas do axe (WCAG 2.2 AA) com os bloqueios publicados', async ({ painel, page }) => {
    await painel.ir(ROTAS.operacional);
    await painel.esperarPronto();
    await expect(page.getByTestId('metrica-BLOQUEADOS').getByTestId('estado-sem-dado-real-BLOQUEADOS')).toHaveCount(0);
    const r = await rodarAxe(page);
    expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([]);
  });

  test('Q65-07 Semanal (O5 publicado): zero violações sérias ou críticas do axe', async ({ painel, page }) => {
    await painel.ir(ROTAS.operacionalSemanal);
    await painel.esperarPronto();
    await abrirMaisMetricas(page);
    await expect(page.getByTestId('metrica-O5').getByTestId('estado-sem-dado-real-O5')).toHaveCount(0);
    const r = await rodarAxe(page);
    expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([]);
  });
});
