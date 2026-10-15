import { test, expect } from '../fixtures/base';

// QA B3: K-008 (Sustentacao), K-025 (Espera invisivel), K-026 (Visao geral). Ver docs/qa/001-B3.md.
const SUST = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'EI-SUST'];

test.describe('K-008 Sustentacao', () => {
  test.beforeEach(async ({ painel, page }) => {
    await painel.ir('/operacional?cadencia=sustentacao');
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
  });

  test('SUS-01 recorte, cartoes S1..S7 e EI com selo de fonte e atencao', async ({ page, painel }) => {
    await expect(page.getByTestId('recorte-sustentacao')).toContainText('SSSC');
    for (const c of SUST) {
      const cartao = painel.cartao(c);
      await expect(cartao.raiz, c).toBeVisible();
      await expect(cartao.raiz.getByText(/Fonte: Acelerato|Fonte diferente/).first(), `selo de fonte ${c}`).toBeVisible();
    }
    await expect(painel.faixaAtencao, 'SUS-01 faixa "Pede atencao"').toBeVisible();
  });

  test('SUS-02 isolamento de fontes', async ({ page }) => {
    await expect(page.locator('[data-testid^="metrica-O"], [data-testid^="metrica-T"], [data-testid^="metrica-E"]:not([data-testid="metrica-EI-SUST"])')).toHaveCount(0);
    await expect(page.getByTestId('filtro-tipo')).toHaveCount(0);
    await expect(page.getByTestId('filtro-sistema')).toHaveCount(0);
  });

  test('SUS-04 S1 por prioridade; P1 insuficiente', async ({ page }) => {
    await expect(page.getByTestId('s1-insuficiente-mtta-p1')).toBeVisible();
    await expect(page.getByTestId('s1-insuficiente-mtta-p1')).toContainText(/Amostra insuficiente/);
    for (const p of ['p2', 'p3', 'p4', 'p5']) await expect(page.getByTestId(`s1-mtta`)).toContainText(p.toUpperCase());
  });

  test('SUS-05/14 unidades em horas uteis e sem "dias"', async ({ page }) => {
    const texto = await page.getByRole('main').innerText();
    // L2 fechada: exibição por prioridade (P4/P5 em dias úteis). Proibidos: minutos e tempo corrido.
    expect(texto).not.toMatch(/\bmin\b|minutos?|horas corridas|h corridas|dias corridos/i);
    await expect(page.getByTestId('metrica-S1')).toContainText(/h úteis/);
    await expect(page.getByTestId('metrica-S1')).toContainText(/P4 · alvo 5 dias úteis/);
  });

  test('SUS-07 alternador S3 grava s3=prop', async ({ page, painel }) => {
    const s3 = painel.cartao('S3').raiz;
    await s3.getByRole('button', { name: 'Proporção', exact: true }).click();
    await expect(page).toHaveURL(/s3=prop/);
    await page.reload();
    await expect(page).toHaveURL(/s3=prop/);
  });

  test('SUS-08 S4 barras de cor unica', async ({ page }) => {
    const fills = await page.getByTestId('metrica-S4').locator('svg rect[fill], svg path[fill]').evaluateAll((els) =>
      [...new Set(els.map((e) => getComputedStyle(e).fill).filter((f) => f !== 'none' && f !== 'rgba(0, 0, 0, 0)'))]);
    expect(fills.length, JSON.stringify(fills)).toBeLessThanOrEqual(2);
    await expect(page.getByTestId('metrica-S4')).toContainText(/sem meta isolada/i);
  });

  test('SUS-09/10 S6 taxa de contorno; S7 dois blocos sem total conjunto', async ({ page }) => {
    await expect(page.getByTestId('s6-taxa-contorno')).toContainText(/Taxa de contorno/);
    await expect(page.getByTestId('s7-prioridade')).toBeVisible();
    await expect(page.getByTestId('s7-tipo')).toBeVisible();
    await expect(page.getByTestId('s7-justificados')).toContainText(/\d+ de \d+/);
  });

  test('INV-02 tabelas sem coluna de pessoa', async ({ page }) => {
    const ths = await page.locator('table th').allInnerTexts();
    expect(ths.filter((t) => /respons|analista|pessoa|atendente|assignee|usuário/i.test(t))).toEqual([]);
  });

  test('SUS-17 recorte visivel com filtro aplicado', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=sustentacao&periodo=30d');
    await expect(page.getByTestId('recorte-sustentacao')).toBeVisible();
  });
});

test.describe('K-025 Espera invisivel dentro de cada painel', () => {
  const PAINEIS_EI = [
    ['EI-FL1', '/operacional?cadencia=semanal'],
    ['EI-FL2', '/tatico'],
    ['EI-FL3', '/estrategico'],
    ['EI-SUST', '/operacional?cadencia=sustentacao'],
  ] as const;

  test('EI-02 cada painel traz so o cartao do proprio nivel', async ({ page, painel }) => {
    for (const [c, rota] of PAINEIS_EI) {
      await painel.ir(rota);
      await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
      await expect(page.getByTestId(`metrica-${c}`)).toBeVisible();
      for (const [outro] of PAINEIS_EI.filter(([x]) => x !== c)) await expect(page.getByTestId(`metrica-${outro}`)).toHaveCount(0);
    }
  });

  test('EI-01 cliente e time sempre em par; insuficiente some com os dois', async ({ page, painel }) => {
    for (const [c, rota] of PAINEIS_EI) {
      await painel.ir(rota);
      await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
      const cartao = page.getByTestId(`metrica-${c}`);
      const cli = await cartao.locator('[data-testid^="ei-cliente-"]').count();
      const tim = await cartao.locator('[data-testid^="ei-time-"]').count();
      expect(cli, `${c} cliente x time`).toBe(tim);
      if (await cartao.locator('[data-testid^="amostra-insuficiente"]').count()) await expect(cartao.locator('[data-testid^="amostra-insuficiente"]').first()).toContainText(/Amostra insuficiente/);
    }
  });

  // EI-03 (índice confere com as medianas) mudou para e2e/tests-api/api.spec.ts: no mock embutido não há resposta HTTP
  // para comparar nem para adulterar (page.route), e a tolerância derivada da tela deixava o teste sem dentes.

  test('EI-09 texto da Sustentacao: nao compare com BusinessMap', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=sustentacao');
    await expect(page.getByTestId('metrica-EI-SUST')).toContainText(/não comparável com os níveis do BusinessMap/i);
  });

  test('EI-05 a Sustentacao nao herda filtro de fluxo', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=sustentacao');
    await expect(page.getByTestId('metrica-EI-SUST')).toBeVisible();
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
    const base = await page.getByTestId('base-EI-SUST').innerText();
    await painel.ir('/operacional?cadencia=sustentacao&tipo=incidente&equipe=fl1');
    await expect(page.getByTestId('metrica-EI-SUST')).toBeVisible();
    expect(await page.getByTestId('base-EI-SUST').innerText()).toBe(base);
  });
});

test.describe('K-026 Visao geral', () => {
  test.beforeEach(async ({ painel, page }) => {
    await painel.ir('/');
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
  });

  test('VG-01/11 secoes, recorte e ausencia de filtros', async ({ page, painel }) => {
    await expect(painel.faixaAtencao).toBeVisible();
    for (const n of ['operacional', 'tatico', 'estrategico', 'sustentacao']) await expect(page.getByTestId(`nivel-${n}`)).toBeVisible();
    await expect(page.getByTestId('ei-resumo')).toBeVisible();
    await expect(page.getByTestId('recorte-visao-geral')).toContainText(/Recorte fixo/);
    await expect(page.getByTestId('barra-filtros')).toHaveCount(0);
  });

  test('VG-02 ate 3 indicadores por nivel e link Abrir painel', async ({ page }) => {
    const alvo: Record<string, string> = { operacional: '/operacional?cadencia=diaria', tatico: '/tatico', estrategico: '/estrategico', sustentacao: '/operacional?cadencia=sustentacao' };
    for (const [n, rota] of Object.entries(alvo)) {
      const nivel = page.getByTestId(`nivel-${n}`);
      expect(await nivel.locator('[data-testid^="indicador-"]').count()).toBeLessThanOrEqual(3);
      await expect(nivel.getByRole('link', { name: /^Abrir / })).toHaveAttribute('href', new RegExp(`${rota.replace('?', '\\?')}$`));
    }
  });

  test('VG-03 alertas levam ao cartao de origem', async ({ page }) => {
    const links = await page.getByTestId('faixa-atencao').getByRole('link').evaluateAll((a) => a.map((x) => x.getAttribute('href')));
    expect(links.length).toBeGreaterThan(0);
    for (const href of links) {
      await page.goto(href!);
      const ancora = new URL(href!, 'http://x').hash.slice(1);
      await expect(page.locator(`[id="${ancora}"]`), href!).toBeVisible();
    }
  });

  test('VG-05 EI com as duas medianas e indice; Sustentacao separada', async ({ page }) => {
    for (const n of ['fl1', 'fl2', 'fl3', 'sust']) {
      const r = page.getByTestId(`ei-resumo-${n}`);
      await expect(r).toBeVisible();
      const t = await r.innerText();
      if (!/Amostra insuficiente/i.test(t)) expect(t, n).toMatch(/cliente/i), expect(t, n).toMatch(/time/i);
    }
    await expect(page.getByTestId('ei-fonte-sust')).toContainText(/Fonte diferente/);
  });

  test('VG-06 tabela Por reuniao com 7 linhas e links', async ({ page }) => {
    const sec = page.getByRole('region', { name: 'Por reunião' });
    const hrefs = await sec.getByRole('link').evaluateAll((a) => a.map((x) => x.getAttribute('href')));
    // 7 reuniões: a Revisão da sustentação · semanal entrou na demanda da Sustentação no Operacional (CA-16)
    for (const h of ['/operacional?cadencia=diaria', '/operacional?cadencia=semanal', '/operacional?cadencia=sustentacao', '/tatico#t2', '/tatico#t4', '/estrategico#e1', '/estrategico#e3']) expect(hrefs).toContain(h);
    await expect(sec.getByRole('listitem')).toHaveCount(7);
  });

  test('VG-07 no maximo 6 alertas visiveis; expandir confere N', async ({ page }) => {
    const itens = page.getByTestId('faixa-atencao').getByRole('listitem');
    expect(await itens.count()).toBeLessThanOrEqual(6);
    const ver = page.getByTestId('faixa-atencao').getByRole('button', { name: /Ver todos os alertas \((\d+)\)/ });
    if (await ver.count()) {
      const n = Number((await ver.innerText()).match(/\((\d+)\)/)![1]);
      await ver.click();
      await expect(itens).toHaveCount(n);
    }
  });

  test('VG-10 consistencia: indicador O2 igual ao cartao do painel', async ({ page }) => {
    const vg = (await page.getByTestId('indicador-O2').innerText()).match(/\d+(?:,\d+)?/g) ?? [];
    await page.goto('/operacional?cadencia=diaria');
    await expect(page.getByTestId('metrica-O2')).toBeVisible();
    await expect(page.getByTestId('metrica-O2')).not.toHaveAttribute('aria-busy', 'true');
    const painelTxt = await page.getByTestId('metrica-O2').innerText();
    expect(vg.length).toBeGreaterThan(0);
    expect(painelTxt).toContain(vg[0]);
  });
});
