import { test, expect, rodarAxe } from '../fixtures/base';
import type { Page } from '@playwright/test';

// Resumo do Operacional: filtro Equipe dentro de cada bloco (pedido 097, L5; CA-1 a CA-6 de docs/ux/097-filtros-time-busca.md).
// O mock fictício é a única fonte. A equipe de cada bloco vive na URL (`equipe` no fluxo, `sust_equipe` na Sustentação).
test.use({ viewport: { width: 1280, height: 800 } });

const busca = (page: Page) => new URL(page.url()).searchParams;
const fluxo = (page: Page) => page.getByTestId('resumo-fluxo');
const sust = (page: Page) => page.getByTestId('resumo-sustentacao');
const filtro = (bloco: ReturnType<typeof fluxo>) => bloco.getByRole('button', { name: /^Equipe: / });
const abrir = async (page: Page, bloco: ReturnType<typeof fluxo>) => {
  await bloco.getByRole('button', { name: 'Equipe: Todas' }).click();
  return page.getByRole('dialog', { name: 'Equipe' });
};

test.describe('Resumo: filtro Equipe por bloco', () => {
  test('CA-1 e CA-2 cada bloco tem o seu filtro, com "Todas", e só com as equipes da própria fonte', async ({ page, painel }) => {
    await painel.ir('/operacional');
    await expect(filtro(fluxo(page))).toHaveAccessibleName('Equipe: Todas');
    await expect(filtro(sust(page))).toHaveAccessibleName('Equipe: Todas');
    await expect(page.getByRole('button', { name: /^Equipe: / })).toHaveCount(2);
    const doFluxo = await abrir(page, fluxo(page));
    const nomesFluxo = await doFluxo.getByRole('checkbox').evaluateAll((els) => els.map((e) => e.closest('label')?.textContent?.trim()));
    await page.keyboard.press('Escape');
    const daSust = await abrir(page, sust(page));
    const nomesSust = await daSust.getByRole('checkbox').evaluateAll((els) => els.map((e) => e.closest('label')?.textContent?.trim()));
    expect(nomesFluxo.length).toBeGreaterThan(0);
    expect(nomesSust.length).toBeGreaterThan(0);
    expect(nomesSust.every((n) => n?.startsWith('SSSC'))).toBe(true);
    expect(nomesFluxo.some((n) => nomesSust.includes(n))).toBe(false);
  });

  test('CA-3 marcar uma equipe no fluxo muda só o fluxo (URL e bloco); a Sustentação segue em "Todas"', async ({ page, painel }) => {
    await painel.ir('/operacional');
    await expect(sust(page).getByTestId('numero-s2')).toBeVisible();
    const d = await abrir(page, fluxo(page));
    await d.getByRole('checkbox').first().check();
    await page.keyboard.press('Escape');
    await expect.poll(() => busca(page).get('equipe')).not.toBeNull();
    expect(busca(page).has('sust_equipe')).toBe(false);
    await expect(filtro(fluxo(page))).not.toHaveAccessibleName('Equipe: Todas');
    await expect(filtro(sust(page))).toHaveAccessibleName('Equipe: Todas');
    await expect(fluxo(page).getByTestId('chip-filtro-equipe')).toHaveCount(1);
    await expect(sust(page).getByTestId('chip-filtro-equipe')).toHaveCount(0);
    // e vice-versa
    const s = await abrir(page, sust(page));
    await s.getByRole('checkbox').first().check();
    await page.keyboard.press('Escape');
    await expect.poll(() => busca(page).get('sust_equipe')).not.toBeNull();
    expect(busca(page).get('equipe')).not.toBeNull();
  });

  test('CA-4 e CA-5 com duas equipes: aviso consolidado e um conjunto só de números, sem ordenar nem somar fontes', async ({ page, painel }) => {
    await painel.ir('/operacional');
    await expect(fluxo(page).getByTestId('numero-p85')).toBeVisible();
    const d = await abrir(page, fluxo(page));
    await d.getByRole('checkbox').nth(0).check();
    await d.getByRole('checkbox').nth(1).check();
    await page.keyboard.press('Escape');
    await expect(fluxo(page).getByTestId('aviso-consolidado')).toHaveText('Resultado consolidado de 2 equipes. O sistema não compara equipes.');
    await expect(sust(page).getByTestId('aviso-consolidado')).toHaveCount(0);
    await expect(fluxo(page).getByTestId('numeros-fluxo')).toHaveCount(1);
    await expect(fluxo(page).getByTestId('numeros-fluxo').locator('> *')).toHaveCount(4);
    await expect(sust(page).getByTestId('numeros-sustentacao').locator('> *')).toHaveCount(3);
    await expect(page.getByText(/ranking|total geral|combinado|somado/i)).toHaveCount(0);
  });

  test('CA-6 equipe com poucos itens: o bloco não publica percentil e diz o motivo (sem erro de console)', async ({ page, painel, problemas }) => {
    await painel.ir('/operacional?equipe=zzz-inexistente');
    // equipe que não existe é ignorada com aviso e o bloco volta a "Todas"
    await expect(page.getByTestId('aviso-filtros-invalidos')).toContainText('equipe "zzz-inexistente"');
    await expect(filtro(fluxo(page))).toHaveAccessibleName('Equipe: Todas');
    // quando a amostra da equipe tem menos de 20 itens, o cartão traz o motivo no lugar do número
    const d = await abrir(page, fluxo(page));
    const caixas = d.getByRole('checkbox');
    const total = await caixas.count();
    for (let i = 0; i < total; i++) {
      await caixas.nth(i).check();
      await expect(fluxo(page).getByTestId('numero-p85')).toBeVisible();
      const poucos = await fluxo(page).getByTestId('numero-p85-insuficiente').count();
      if (poucos > 0) {
        await expect(fluxo(page).getByTestId('numero-p85-insuficiente')).toContainText('Estatística não publicada');
        await expect(fluxo(page).getByTestId('numero-p85-valor')).toHaveCount(0);
        break;
      }
      await caixas.nth(i).uncheck();
    }
    expect(problemas).toEqual([]);
  });

  test('estado na URL: o link com a equipe abre o bloco já filtrado e "Limpar filtros" volta a "Todas"', async ({ page, painel }) => {
    await painel.ir('/operacional');
    const d = await abrir(page, fluxo(page));
    await d.getByRole('checkbox').first().check();
    await page.keyboard.press('Escape');
    await expect.poll(() => busca(page).get('equipe')).not.toBeNull();
    const url = page.url();
    await page.goto(url);
    await expect(fluxo(page).getByTestId('chip-filtro-equipe')).toHaveCount(1);
    await fluxo(page).getByTestId('limpar-equipe-fluxo').click();
    await expect.poll(() => busca(page).has('equipe')).toBe(false);
    await expect(filtro(fluxo(page))).toHaveAccessibleName('Equipe: Todas');
  });

  test('sem violação grave de acessibilidade, nos dois blocos', async ({ page, painel }) => {
    await painel.ir('/operacional');
    await expect(fluxo(page).getByTestId('numero-p85')).toBeVisible();
    const r = await rodarAxe(page, { incluir: '[data-testid="filtro-bloco-fluxo"]' });
    expect(r.bloqueantes).toEqual([]);
    const s = await rodarAxe(page, { incluir: '[data-testid="filtro-bloco-sustentacao"]' });
    expect(s.bloqueantes).toEqual([]);
  });
});
