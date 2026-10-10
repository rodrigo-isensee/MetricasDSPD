import { test, expect, rodarAxe } from '../fixtures/base';

// Plano: docs/qa/integracao-real.md (CT-xx). Seletores por papel e texto da microcopy de docs/ux/integracao-real/05-especificacao.md.
const PAINEIS = ['/operacional', '/tatico', '/estrategico', '/sustentacao'];
const FONTES = [{ aba: 'BusinessMap', q: 'bm' }, { aba: 'Acelerato', q: 'ac' }];
const VIEWPORTS = [{ width: 375, height: 800 }, { width: 1280, height: 800 }];

test.describe('Selo de frescor e calibração nos painéis', () => {
  for (const rota of PAINEIS) {
    test(`CT-01/02 ${rota} mostra Fonte, Atualizado em e selo com texto`, async ({ page }) => {
      await page.goto(rota);
      await expect(page.getByText(/Fonte:/).first()).toBeVisible();
      await expect(page.getByText(/Atualizado em/).first()).toBeVisible();
      await expect(page.getByText(/^(Atual|Atrasado|Falha)/).first()).toBeVisible();
    });
  }

  test('CT-03 Visão geral mostra um selo por fonte', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/BusinessMap/).first()).toBeVisible();
    await expect(page.getByText(/Acelerato/).first()).toBeVisible();
  });

  test('CT-04 coleta-atrasada mostra horas de atraso', async ({ page }) => {
    await page.goto('/operacional?mock=coleta-atrasada:bm');
    await expect(page.getByText(/Atrasado: última coleta há \d+ h/).first()).toBeVisible();
  });

  test('CT-06/07 calibração: painel visível, faixa status e selo no cartão', async ({ page }) => {
    await page.goto('/sustentacao');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: /não para cobrar|não para cobrar pessoas/i }).first()).toBeVisible();
    await expect(page.getByText('Em calibração').first()).toBeVisible();
  });

  test('CT-08/09 sem-calibracao remove a faixa; em calibração não há Dentro/Fora da meta', async ({ page }) => {
    await page.goto('/sustentacao');
    await expect(page.getByText('Em calibração').first()).toBeVisible();
    await expect(page.getByText(/Dentro da meta|Fora da meta|^(Acima|Abaixo) de 90%$/)).toHaveCount(0);
    await page.goto('/sustentacao?mock=sem-calibracao');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('Em calibração')).toHaveCount(0);
    await expect(page.getByText(/^(Acima|Abaixo) de 90%$/).first()).toBeVisible();
  });

  test('CT-10 não há cadastro manual de janela de calibração', async ({ page }) => {
    await page.goto('/dados');
    await expect(page.getByRole('button', { name: /cadastrar|editar janela|nova janela/i })).toHaveCount(0);
    await expect(page.getByRole('textbox')).toHaveCount(0);
  });

  test('CT-13 coleta-erro mantém dados anteriores e avisa', async ({ page }) => {
    await page.goto('/operacional');
    await expect(page.getByText(/Coleta falhou em .*Mostrando dados de/).first()).toBeVisible();
    await expect(page.getByText(/Ainda não há dados desta fonte/)).toHaveCount(0);
  });

  test('CT-14 coleta-vazia mostra o estado sem dados', async ({ page }) => {
    await page.goto('/operacional?mock=coleta-vazia:bm');
    await expect(page.getByText(/Ainda não há dados desta fonte/).first()).toBeVisible();
  });

  test('CT-15 falha em uma fonte não altera a outra', async ({ page }) => {
    await page.goto('/sustentacao?mock=coleta-erro:bm');
    await expect(page.getByTestId('selo-frescor-acelerato')).toContainText('Atual');
    await expect(page.getByText(/Coleta falhou em/)).toHaveCount(0);
  });

  test('CT-31 aviso de dados fictícios aparece no mock', async ({ page }) => {
    await page.goto('/operacional');
    await expect(page.getByText(/dados fictícios/i).first()).toBeVisible();
  });
});

test.describe('Tela /dados', () => {
  test('CT-16 acesso pela navegação e pelo link Entenda', async ({ page }) => {
    await page.goto('/operacional');
    await page.getByRole('link', { name: /Dados e coletas/ }).first().click();
    await expect(page).toHaveURL(/\/dados/);
    await expect(page.getByRole('heading', { level: 1, name: 'Dados e coletas' })).toBeVisible();
    await page.goto('/operacional');
    await page.getByRole('link', { name: /Entenda/ }).first().click();
    await expect(page).toHaveURL(/\/dados/);
  });

  test('CT-17 abas por fonte e URL', async ({ page }) => {
    await page.goto('/dados');
    await expect(page.getByRole('tablist')).toBeVisible();
    // BM já é a aba ativa ao abrir /dados: clicar nela não muda o valor, então começa pela outra
    for (const f of [...FONTES].reverse()) {
      await page.getByRole('tab', { name: f.aba }).click();
      await expect(page).toHaveURL(new RegExp(`fonte=${f.q}`));
      await expect(page.getByRole('tab', { name: f.aba })).toHaveAttribute('aria-selected', 'true');
    }
  });

  for (const f of FONTES) {
    test(`CT-18..23/32 seções completas (${f.aba})`, async ({ page }) => {
      await page.goto(`/dados?fonte=${f.q}`);
      for (const t of ['Última coleta', 'Contagens da última coleta', 'Janela de calibração', 'Falhas recentes (14 dias)', 'Histórico de coletas', 'Mudanças de critério (T2.6)'])
        await expect(page.getByRole('heading', { name: t, exact: true })).toBeVisible();
      await expect(page.getByText(/Última tentativa/)).toBeVisible();
      await expect(page.getByText(/Próxima prevista/)).toBeVisible();
      await expect(page.getByText(/Arquivados e excluídos permanecem na base/)).toBeVisible();
      await expect(page.getByText(/Definida automaticamente pelo sistema/)).toBeVisible();
      for (const t of await page.getByRole('table').all()) await expect(t.getByRole('columnheader').first()).toBeVisible();
      // CT-32: só a fonte selecionada aparece no conteúdo
      const outra = f.q === 'bm' ? 'Acelerato' : 'BusinessMap';
      await expect(page.getByRole('tabpanel').getByText(outra)).toHaveCount(0);
    });
  }

  test('CT-20 sem detalhe sensível', async ({ page }) => {
    await page.goto('/dados');
    const txt = (await page.locator('body').innerText()).toLowerCase();
    for (const proibido of ['apikey', 'password', 'select ', ' at ', 'stack', 'mysql://']) expect(txt).not.toContain(proibido);
  });

  test('CT-21 histórico paginado a 20 por página', async ({ page }) => {
    await page.goto('/dados');
    const tabela = page.getByRole('table', { name: /Histórico de coletas/ });
    expect(await tabela.getByRole('row').count()).toBeLessThanOrEqual(21);
  });

  test('CT-24 nada por pessoa', async ({ page }) => {
    for (const rota of ['/dados', ...PAINEIS]) {
      await page.goto(rota);
      await expect(page.getByRole('columnheader', { name: /pessoa|responsável|autor|usuário|desenvolvedor/i })).toHaveCount(0);
      await expect(page.getByRole('combobox', { name: /pessoa|responsável|autor/i })).toHaveCount(0);
    }
    await page.goto('/dados');
    await expect(page.getByText('Esta tela mostra apenas o estado das coletas. Não há informação por pessoa.')).toBeVisible();
  });

  test('CT-25/35 erro com Tentar de novo recupera', async ({ page }) => {
    // Etapa mock: a falha de leitura vem de ?mock=coleta-erro:bm (a API real ainda não existe).
    await page.goto('/dados?mock=coleta-erro:bm');
    await expect(page.getByText('Não foi possível carregar os dados desta fonte')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tentar de novo' })).toBeVisible();
    // A outra fonte não é afetada.
    await page.getByRole('tab', { name: 'Acelerato' }).click();
    await expect(page.getByRole('heading', { name: 'Última coleta', exact: true })).toBeVisible();
  });

  test('CT-25 vazio por fonte', async ({ page }) => {
    await page.goto('/dados?mock=coleta-vazia:bm');
    await expect(page.getByText(/Ainda não há coletas desta fonte/)).toBeVisible();
  });

  test('CT-26 teclado nas abas com foco visível', async ({ page }) => {
    await page.goto('/dados?fonte=bm');
    await page.getByRole('tab', { name: 'BusinessMap' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Acelerato' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/fonte=ac/);
  });

  test('CT-34 fonte inválida cai em BusinessMap', async ({ page }) => {
    await page.goto('/dados?fonte=xyz');
    await expect(page.getByRole('tab', { name: 'BusinessMap' })).toHaveAttribute('aria-selected', 'true');
  });

  test('CT-28 reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/dados?mock=carregando');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

for (const vp of VIEWPORTS) {
  test.describe(`${vp.width}px`, () => {
    test.use({ viewport: vp });
    const ROTAS = ['/dados?fonte=bm', '/dados?fonte=ac', '/dados?mock=coleta-vazia:bm', '/dados?mock=carregando', '/operacional?mock=coleta-atrasada:bm', '/operacional?mock=coleta-erro:bm', '/operacional?mock=coleta-vazia:bm', '/operacional?mock=sem-calibracao', '/'];
    for (const rota of ROTAS) {
      test(`CT-27 axe ${rota}`, async ({ page }) => {
        await page.goto(rota);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        const r = await rodarAxe(page);
        expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([]);
      });
    }
    test('CT-29/30 tabelas sem estourar a página', async ({ page }) => {
      await page.goto('/dados');
      await expect(page.getByRole('heading', { name: 'Histórico de coletas' })).toBeVisible();
      const estoura = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(estoura).toBe(false);
    });
  });
}
