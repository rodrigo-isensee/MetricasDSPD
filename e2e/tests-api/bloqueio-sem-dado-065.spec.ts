import { test, expect, rodarAxe } from '../fixtures/base';
import { ROTAS } from '../fixtures/constantes';

// QA 065 (K-205), plano em docs/qa/065-bloqueados.md. Roda contra a SPA em VITE_FONTE=api e a API de teste `e2e/stubs/api-065.ts`
// (E2E_API_URL=http://127.0.0.1:3199), que aplica as regras de publicação do servidor na base real: BLOQUEADOS e O5 fora do
// mapa real e a parte de bloqueio do O1 e do O2 anulada com a nota. Sem banco.
const MOTIVO = 'a coleta ainda não grava os bloqueios do quadro';

/** O O5 fica em "Mais métricas" (fechado por padrão): abre pelo teclado/clique no resumo antes de olhar o cartão. */
async function abrirMaisMetricas(page: import('@playwright/test').Page) {
  const det = page.getByTestId('mais-metricas');
  if ((await det.getAttribute('open')) === null) await det.locator('summary').click();
}

test.describe('065: bloqueio sem dado real na base real', () => {
  test('Q65-01 BLOQUEADOS mostra Sem dado real com o motivo, nunca "Nenhum item bloqueado" nem número', async ({ painel, page }) => {
    await painel.ir(ROTAS.operacional);
    await painel.esperarPronto();
    const c = page.getByTestId('metrica-BLOQUEADOS');
    const estado = c.getByTestId('estado-sem-dado-real-BLOQUEADOS');
    await expect(estado).toContainText('Sem dado real');
    await expect(estado).toContainText(MOTIVO);
    await expect(c.getByTestId('bloqueados-nenhum')).toHaveCount(0);
    await expect(c.getByText(/Nenhum item bloqueado/i)).toHaveCount(0);
  });

  test('Q65-02 O1 diz "sem dado real" para bloqueados, sem "0 deles bloqueados"; o WIP total continua', async ({ painel, page }) => {
    await painel.ir(ROTAS.operacional);
    await painel.esperarPronto();
    const c = page.getByTestId('metrica-O1');
    await expect(c.getByTestId('leitura-O1')).toContainText('bloqueados: sem dado real');
    await expect(c.getByTestId('notas-cartao-O1')).toContainText('Bloqueios: sem dado real');
    await expect(c.getByText(/\d+ deles bloqueados/)).toHaveCount(0);
    await expect(c.getByText(/Bloqueados \(contam no WIP\)/)).toHaveCount(0);
    await expect(c.getByText(/Hoje há \d+/)).toBeVisible();
  });

  test('Q65-03 O2 mostra Sem dado real na coluna Bloqueado, sem "bloqueado" na legenda; dispersão e percentis ficam', async ({ painel, page }) => {
    await painel.ir(ROTAS.operacional);
    await painel.esperarPronto();
    const c = page.getByTestId('metrica-O2');
    await expect(c.getByTestId('notas-cartao-O2')).toContainText('Bloqueios: sem dado real');
    await expect(c.getByTestId('o2-lista').getByText('Sem dado real').first()).toBeVisible();
    const grafico = c.getByTestId('o2-grafico');
    await expect(grafico).toContainText('P95');
    expect(((await grafico.textContent()) ?? '').toLowerCase()).not.toContain('bloqueado');
  });

  test('Q65-04 faixa "Pede atenção" nunca diz "Nada pede atenção" nem fala de bloqueado', async ({ painel, page }) => {
    await painel.ir(ROTAS.operacional);
    await painel.esperarPronto();
    const faixa = page.getByTestId('faixa-atencao');
    await expect(faixa).toBeVisible();
    await expect(faixa.getByText(/Nada pede atenção/i)).toHaveCount(0);
    await expect(faixa.getByText(/bloqueado/i)).toHaveCount(0);
  });

  test('Q65-05 O5 inteiro mostra Sem dado real com o motivo, sem percentual', async ({ painel, page }) => {
    await painel.ir(ROTAS.operacionalSemanal);
    await painel.esperarPronto();
    await abrirMaisMetricas(page);
    const c = page.getByTestId('metrica-O5');
    await c.scrollIntoViewIfNeeded();
    const estado = c.getByTestId('estado-sem-dado-real-O5');
    await expect(estado).toContainText('Sem dado real');
    await expect(estado).toContainText(MOTIVO);
    await expect(c.getByText(/Mediana por item/)).toHaveCount(0);
    expect((await c.textContent()) ?? '').not.toMatch(/\d+\s*%/);
  });

  test('Q65-06 Diária: zero violações sérias ou críticas do axe (WCAG 2.2 AA) com a parte sem dado real', async ({ painel, page }) => {
    await painel.ir(ROTAS.operacional);
    await painel.esperarPronto();
    await expect(page.getByTestId('metrica-BLOQUEADOS').getByTestId('estado-sem-dado-real-BLOQUEADOS')).toBeVisible();
    const r = await rodarAxe(page);
    expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([]);
  });

  test('Q65-07 Semanal (O5 sem dado real): zero violações sérias ou críticas do axe', async ({ painel, page }) => {
    await painel.ir(ROTAS.operacionalSemanal);
    await painel.esperarPronto();
    await abrirMaisMetricas(page);
    await expect(page.getByTestId('metrica-O5').getByTestId('estado-sem-dado-real-O5')).toBeVisible();
    const r = await rodarAxe(page);
    expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([]);
  });
});
