import { test, expect, rodarAxe } from '../fixtures/base';
import { PainelPage } from '../pages/PainelPage';

// K-215: lista longa de equipes no texto do recorte da Sustentação. O mock devolve 8 equipes (mais que o limite de 4),
// então a frase traz a contagem e o `<details>` guarda a lista completa. Só nomes fictícios.
const ROTA = '/operacional?cadencia=sustentacao';

test.describe('K-215 recorte da Sustentação com lista longa', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('Enter e Espaço no resumo abrem e fecham a lista', async ({ page, painel }) => {
    await painel.ir(ROTA);
    await new PainelPage(page).esperarPronto();
    const frase = page.getByTestId('recorte-sustentacao');
    await expect(frase).toContainText('de 8 equipes');
    const lista = page.getByTestId('recorte-lista');
    const resumo = lista.locator('summary');
    await expect(resumo).toHaveText(/Ver as 8 equipes/);
    await expect(lista).not.toHaveAttribute('open', '');
    await resumo.focus();
    for (const tecla of ['Enter', 'Space']) {
      await page.keyboard.press(tecla);
      await expect(lista).toHaveAttribute('open', '');
      await expect(resumo).toHaveText(/Ocultar as 8 equipes/);
      await expect(lista.getByRole('listitem')).toHaveCount(8);
      await expect(lista.getByRole('listitem').first()).toBeVisible();
      await page.keyboard.press(tecla);
      await expect(lista).not.toHaveAttribute('open', '');
      await expect(resumo).toHaveText(/Ver as 8 equipes/);
    }
  });

  test('a 375 px a frase e a lista cabem sem rolagem horizontal', async ({ page, painel }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await painel.ir(ROTA);
    await new PainelPage(page).esperarPronto();
    await page.getByTestId('recorte-lista').locator('summary').click();
    await expect(page.getByTestId('recorte-lista').getByRole('listitem')).toHaveCount(8);
    const medidas = await page.evaluate(() => {
      const c = (id: string) => document.querySelector(`[data-testid="${id}"]`)!.getBoundingClientRect();
      return {
        doc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        frase: c('recorte-sustentacao'),
        lista: c('recorte-lista'),
        largura: window.innerWidth,
      };
    });
    expect(medidas.doc).toBeLessThanOrEqual(0);
    expect(medidas.frase.right).toBeLessThanOrEqual(medidas.largura);
    expect(medidas.lista.right).toBeLessThanOrEqual(medidas.largura);
  });

  test('axe sem violação com a lista aberta, em 1280 e em 375', async ({ page, painel }) => {
    for (const largura of [1280, 375]) {
      await page.setViewportSize({ width: largura, height: 800 });
      await painel.ir(ROTA);
      await new PainelPage(page).esperarPronto();
      await page.getByTestId('recorte-lista').locator('summary').click();
      await expect(page.getByTestId('recorte-lista')).toHaveAttribute('open', '');
      const r = await rodarAxe(page);
      expect(r.bloqueantes, `${largura}px`).toEqual([]);
      expect(r.informativas, `${largura}px`).toEqual([]);
    }
  });
});
