import { test, expect, rodarAxe } from '../fixtures/base';
import type { Page } from '@playwright/test';

// Sustentação dentro do Operacional (docs/ux/sustentacao-no-operacional/especificacao.md, critérios 1 a 31).
// Um `test` por critério; 375 e 1280 onde o critério pede. O mock fictício é a única fonte.
const PREFS = 'metricas-dspd:preferencias:v1';
const VISOES = [
  ['resumo', '/operacional'],
  ['diaria', '/operacional?cadencia=diaria'],
  ['semanal', '/operacional?cadencia=semanal'],
  ['sustentacao', '/operacional?cadencia=sustentacao'],
] as const;

const grupoVisao = (page: Page) => page.getByRole('radiogroup', { name: 'Visão' });
const aguardar = async (page: Page) => {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 30_000 });
};
const aguardarResumo = async (page: Page) => {
  await aguardar(page);
  await expect(page.getByTestId('tendencia-fluxo')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('tendencia-sustentacao')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
};
const guardarPrefs = (page: Page, paineis: Record<string, string[]>) =>
  page.addInitScript(
    ([chave, valor]) => localStorage.setItem(chave as string, valor as string),
    [PREFS, JSON.stringify({ versao: 1, paineis: Object.fromEntries(Object.entries(paineis).map(([k, v]) => [k, { ocultar: v }])), atualizadoEm: '2026-10-10T00:00:00.000Z' })],
  );
const busca = (page: Page) => new URL(page.url()).searchParams;

test.describe('Sustentação no Operacional: menu, seletor e fontes', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('CA-1 o menu não tem o item Sustentação, em 1280 e em 375', async ({ page, painel }) => {
    await painel.ir('/operacional');
    expect(await painel.cabecalho.destinos()).toEqual(['Visão geral', 'Operacional', 'Tático', 'Estratégico', 'Catálogo de métricas', 'Dados e coletas']);
    await expect(painel.cabecalho.linkPara('Sustentação')).toHaveCount(0);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByTestId('abrir-menu').click();
    const gaveta = page.getByRole('dialog').getByRole('navigation', { name: 'Navegação principal' });
    await expect(gaveta.getByRole('link', { name: 'Operacional' })).toBeVisible();
    await expect(gaveta.getByRole('link', { name: 'Sustentação' })).toHaveCount(0);
  });

  test('CA-2 seletor Visão com as quatro opções; Resumo marcado; Sustentação grava cadencia com entrada no histórico', async ({ page, painel }) => {
    await painel.ir('/operacional');
    await expect(grupoVisao(page).getByRole('radio')).toHaveCount(4);
    await expect(grupoVisao(page).locator('label')).toHaveText(['Resumo', 'Diária', 'Semanal', 'Sustentação']);
    await expect(grupoVisao(page).getByRole('radio', { name: 'Resumo' })).toBeChecked();
    await page.getByRole('radio', { name: 'Sustentação' }).click({ force: true });
    await expect(page).toHaveURL(/cadencia=sustentacao/);
    await expect(page.getByTestId('recorte-sustentacao')).toBeVisible();
    for (const s of ['prazos', 'volume', 'causas', 'espera', 'percepcao']) await expect(page.locator(`#${s}`)).toBeAttached();
    await page.goBack();
    await expect(page).not.toHaveURL(/cadencia/);
    await expect(grupoVisao(page).getByRole('radio', { name: 'Resumo' })).toBeChecked();
  });

  test('CA-3 uma fonte por visão: só cartões do Acelerato (e O17) na Sustentação; nenhum S, EI-SUST ou PV1 no fluxo', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=sustentacao');
    await aguardar(page);
    await page.getByTestId('mais-metricas').locator('summary').click();
    await expect(page.getByTestId('metrica-O17')).toBeVisible();
    const ids = await page.locator('[data-testid^="metrica-"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')!.replace('metrica-', '')));
    expect(ids.filter((i) => /^O\d/.test(i))).toEqual(['O17']);
    expect(ids.filter((i) => /^[TE]\d|^BLOQUEADOS|^EI-FL/.test(i))).toEqual([]);
    for (const url of ['/operacional?cadencia=diaria', '/operacional?cadencia=semanal']) {
      await painel.ir(url);
      await aguardar(page);
      await expect(page.locator('[data-testid^="metrica-S"]')).toHaveCount(0);
      await expect(page.getByTestId('metrica-EI-SUST')).toHaveCount(0);
      await expect(page.getByTestId('metrica-PV1')).toHaveCount(0);
    }
  });

  test('CA-4 todo cartão visível de cada visão tem o selo de fonte coerente', async ({ page, painel }) => {
    const esperado = (id: string, visao: string) => (id === 'PV1' ? 'Fonte: Pesquisa de percepção' : visao === 'sustentacao' ? 'Fonte: Acelerato' : 'Fonte: BusinessMap');
    for (const [visao, url] of VISOES.slice(1)) {
      await painel.ir(url);
      await aguardar(page);
      const mais = page.getByTestId('mais-metricas');
      if (await mais.count()) {
        await mais.locator('summary').click();
        await aguardar(page);
      }
      const cartoes = await page.locator('[data-testid^="metrica-"]').evaluateAll((els) => els.map((e) => ({ id: e.getAttribute('data-testid')!.replace('metrica-', ''), texto: e.textContent ?? '' })));
      expect(cartoes.length, visao).toBeGreaterThan(2);
      for (const c of cartoes) expect(c.texto, `${visao} ${c.id}`).toContain(esperado(c.id, visao));
    }
  });

  test('CA-5 filtros por visão: legenda da fonte e só os controles dela, com o período padrão', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=sustentacao');
    await expect(page.getByTestId('legenda-filtros')).toHaveText('Filtros da Sustentação · Acelerato:');
    await expect(painel.filtros.botao('equipe')).toContainText('Equipe de sustentação');
    await expect(painel.filtros.botao('prioridade')).toBeVisible();
    await expect(painel.filtros.botao('periodo')).toContainText('6 meses');
    await expect(painel.filtros.botao('tipo')).toHaveCount(0);
    await expect(painel.filtros.botao('sistema')).toHaveCount(0);
    await painel.ir('/operacional?cadencia=semanal');
    await expect(page.getByTestId('legenda-filtros')).toHaveText('Filtros do fluxo de projeto · BusinessMap:');
    for (const f of ['equipe', 'tipo', 'sistema', 'periodo'] as const) await expect(painel.filtros.botao(f)).toBeVisible();
    await expect(painel.filtros.botao('equipe')).not.toContainText('sustentação');
    await expect(painel.filtros.botao('periodo')).toContainText('12 semanas');
    await expect(painel.filtros.botao('prioridade')).toHaveCount(0);
  });

  test('CA-6 filtros guardados ao trocar de visão; limpar numa visão não altera a outra', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=semanal&equipe=erp-protheus&periodo=4s');
    await expect(painel.filtros.chip('ERP Protheus')).toBeVisible();
    await page.getByRole('radio', { name: 'Sustentação' }).click({ force: true });
    await painel.filtros.alternar('prioridade', ['P1']);
    await expect.poll(() => busca(page).get('sust_prioridade')).toBe('p1');
    expect(busca(page).get('equipe')).toBe('erp-protheus');
    expect(busca(page).get('periodo')).toBe('4s');
    await expect(page.getByTestId('filtros-guardados')).toContainText('Os filtros do fluxo de projeto (2 ativos) continuam guardados para as visões Diária e Semanal.');
    await page.getByRole('radio', { name: 'Semanal' }).click({ force: true });
    await expect(painel.filtros.chip('ERP Protheus')).toBeVisible();
    await expect(painel.filtros.chip('Últimas 4 semanas')).toBeVisible();
    await expect(page.getByTestId('filtros-guardados')).toContainText('Os filtros da Sustentação (1 ativo)');
    await painel.filtros.limpar.click();
    await expect.poll(() => busca(page).has('equipe')).toBe(false);
    expect(busca(page).get('sust_prioridade')).toBe('p1');
    await page.getByRole('radio', { name: 'Sustentação' }).click({ force: true });
    await expect(painel.filtros.chip('P1')).toBeVisible();
  });

  test('CA-7 o rodapé do cartão só cita filtros da própria fonte', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=sustentacao&sust_prioridade=p1');
    await aguardar(page);
    const rodape = (c: string) => page.getByTestId(`metrica-${c}`).locator('span').filter({ hasText: /^(Filtros aplicados|Não afetado por):/ }).allInnerTexts();
    for (const c of ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7']) {
      const t = (await rodape(c)).join(' | ');
      expect(t, c).not.toMatch(/tipo|sistema/i);
    }
    expect((await rodape('S2')).join(' ')).toContain('Prioridade');
    await painel.ir('/operacional?cadencia=semanal&tipo=incidente');
    await aguardar(page);
    for (const c of ['O3', 'O4', 'O12']) expect((await rodape(c)).join(' | '), c).not.toMatch(/prioridade/i);
  });

  test('CA-8 Pede atenção separado por fonte', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=sustentacao&mock=sem-calibracao');
    await expect(painel.faixaAtencao.getByRole('heading')).toHaveText('Pede atenção no período · Sustentação (Acelerato)');
    await expect(painel.faixaAtencao.getByTestId('faixa-atencao-janela')).toHaveText('Período do filtro: 6 meses');
    await expect(painel.faixaAtencao.getByRole('link').first()).toBeVisible();
    const sust = await painel.faixaAtencao.getByRole('link').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
    for (const h of sust) expect(h).toMatch(/^#s[12]$/);
    await painel.ir('/operacional?cadencia=semanal&mock=sem-calibracao');
    await expect(painel.faixaAtencao.getByRole('heading')).toContainText('Fluxo de projeto (BusinessMap)');
    await expect(painel.faixaAtencao.getByRole('link').first()).toBeVisible();
    for (const h of await painel.faixaAtencao.getByRole('link').evaluateAll((els) => els.map((e) => e.getAttribute('href')))) expect(h).toMatch(/^#o(3|10|12)$/);
  });

  test('CA-9 não existe a linha "Também nesta aba" em nenhuma visão', async ({ page, painel }) => {
    for (const [, url] of VISOES) {
      await painel.ir(url);
      await aguardar(page);
      await expect(page.getByText('Também nesta aba')).toHaveCount(0);
    }
  });

  test('CA-10 índice da visão: seções na ordem; ocultar S3 e S4 retira Volume e resolução', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=sustentacao');
    const nav = page.getByRole('navigation', { name: 'Ir para' });
    await expect(nav.getByRole('link')).toHaveText(['Prazos', 'Volume e resolução', 'Escalação, encerramento e reclassificação', 'Espera invisível', 'Mais métricas', 'Percepção de valor']);
    await guardarPrefs(page, { sustentacao: ['s3', 's4'] });
    await page.reload();
    await expect(nav.getByRole('link', { name: 'Volume e resolução' })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: 'Prazos' })).toBeVisible();
    // 375: o índice segue na página, sem estourar a largura
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(nav).toBeVisible();
  });
});

test.describe('Sustentação no Operacional: redirecionamentos, hash, preferências e exportação', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('CA-11 /sustentacao redireciona com os filtros convertidos, hash intacto, cartão focado e sem laço no Voltar', async ({ page }) => {
    await page.goto('/ajuda');
    await page.goto('/sustentacao?prioridade=P1&periodo=12m&equipe=totvs&tipo=Bug#s2');
    await expect(page).toHaveURL(/\/operacional\?/);
    const p = busca(page);
    expect(p.get('cadencia')).toBe('sustentacao');
    await expect.poll(() => busca(page).get('sust_prioridade')).toBe('p1');
    expect(p.get('sust_periodo')).toBe('12m');
    expect(p.get('sust_equipe')).toBe('totvs');
    expect(p.has('tipo')).toBe(false);
    expect(new URL(page.url()).hash).toBe('#s2');
    await expect(page.getByTestId('metrica-S2')).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.activeElement?.closest('[data-testid="metrica-S2"]') !== null)).toBe(true);
    await page.goBack();
    await expect(page).toHaveURL(/\/ajuda$/);
    await page.goto('/sustentacao');
    await expect(page).toHaveURL(/\/operacional\?cadencia=sustentacao$/);
    await page.goto('/sustentacao#compl-qualidade');
    await expect(page).toHaveURL(/#compl-sust-qualidade$/);
    await expect(page.getByTestId('mais-metricas')).toHaveJSProperty('open', true);
  });

  test('CA-12 o hash decide a visão', async ({ page }) => {
    await page.goto('/operacional?cadencia=diaria#s1');
    await expect(page).toHaveURL(/cadencia=sustentacao/);
    await expect(page.getByTestId('metrica-S1')).toBeVisible();
    await page.goto('/operacional?cadencia=sustentacao#o3');
    await expect(page).toHaveURL(/cadencia=semanal/);
    await expect(page.getByTestId('metrica-O3')).toBeVisible();
  });

  test('CA-13 /espera-invisivel#ei-sust vai direto à visão, só com os filtros da Sustentação', async ({ page }) => {
    await page.goto('/espera-invisivel?sust_prioridade=P2&equipe=X#ei-sust');
    await expect(page).toHaveURL(/\/operacional\?cadencia=sustentacao&sust_prioridade=P2#ei-sust$/);
    await expect(page.getByTestId('metrica-EI-SUST')).toBeVisible();
  });

  test('CA-14 preferências sem perda: o perfil antigo vale, ocultar grava na mesma chave e a página Preferências ordena', async ({ page }) => {
    await guardarPrefs(page, { sustentacao: ['s3', 'pv1'] });
    await page.goto('/operacional?cadencia=sustentacao');
    await aguardar(page);
    await expect(page.getByTestId('metrica-S3')).toHaveCount(0);
    await expect(page.getByTestId('metrica-PV1')).toHaveCount(0);
    await expect(page.getByTestId('secao-oculta').or(page.getByTestId('faixa-ocultas'))).not.toHaveCount(0);
    await page.goto('/preferencias');
    const grupos = page.locator('[data-testid^="grupo-"]');
    await grupos.nth(1).getByRole('checkbox', { name: /^S5 / }).uncheck();
    await expect(page.getByText('Salvo neste navegador')).toBeVisible();
    const gravado = JSON.parse((await page.evaluate((k) => localStorage.getItem(k), PREFS)) ?? 'null') as { paineis: { sustentacao?: { ocultar: string[] } } };
    expect(gravado.paineis.sustentacao?.ocultar).toEqual(expect.arrayContaining(['s3', 'pv1', 's5']));
    await expect(grupos.nth(1)).toHaveAttribute('data-testid', 'grupo-sustentacao');
    await expect(grupos.nth(1)).toContainText('Operacional · Sustentação');
  });

  test('CA-15 exportação: a visão exporta só a fonte dela; vários painéis mostra Operacional · Sustentação', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=sustentacao&sust_prioridade=p1');
    await aguardar(page);
    await page.getByTestId('botao-exportar').click();
    const d = page.getByTestId('dialogo-exportar');
    await expect(d.getByRole('heading', { name: 'Exportar · Operacional · Sustentação' })).toBeVisible();
    await expect(d.getByRole('checkbox').first()).toBeChecked();
    expect(await d.getByRole('checkbox').count()).toBeGreaterThan(0);
    await expect(d).not.toContainText('BusinessMap)');
    await expect(d).toContainText('(Acelerato)');
    await expect(d.getByTestId('exportar-previa')).toContainText('sustentacao');
    await page.keyboard.press('Escape');
    await painel.ir('/operacional?cadencia=semanal');
    await aguardar(page);
    await page.getByTestId('botao-exportar').click();
    await expect(page.getByTestId('dialogo-exportar')).not.toContainText('(Acelerato)');
    await page.keyboard.press('Escape');
    await page.getByTestId('botao-exportar-personalizada').click();
    await expect(page.getByTestId('dialogo-exportar').getByText('Operacional · Sustentação', { exact: true })).toBeVisible();
  });

  test('CA-16 Visão geral: os links vão à visão certa, sem parâmetro do fluxo e sem cair no Resumo', async ({ page, painel }) => {
    await painel.ir('/');
    await expect(page.getByTestId('nivel-sustentacao')).toBeVisible();
    await expect(page.getByTestId('nivel-sustentacao').getByRole('link', { name: 'Abrir Operacional · Sustentação' })).toHaveAttribute('href', '/operacional?cadencia=sustentacao');
    await expect(page.getByTestId('ei-resumo-sust').getByRole('link')).toHaveAttribute('href', '/operacional?cadencia=sustentacao#ei-sust');
    await expect(page.getByRole('link', { name: 'Revisão da sustentação · semanal' })).toHaveAttribute('href', '/operacional?cadencia=sustentacao');
    const hrefs = await page.getByRole('main').locator('a[href^="/operacional"]').evaluateAll((els) => els.map((e) => e.getAttribute('href')!));
    for (const h of hrefs) expect(h, h).toMatch(/cadencia=(diaria|semanal|sustentacao)/);
    await page.getByRole('link', { name: 'Revisão da sustentação · semanal' }).click();
    await expect(page.getByTestId('recorte-sustentacao')).toBeVisible();
    expect([...busca(page).keys()]).toEqual(['cadencia']);
  });

  test('CA-17 catálogo: S1 a S12, O17, EI-SUST e PV1 com painel Operacional · Sustentação e destino na visão', async ({ page, painel }) => {
    await painel.ir('/metricas');
    const select = page.getByRole('combobox', { name: 'Painel' });
    expect(await select.locator('option').allInnerTexts()).toContain('Operacional · Sustentação');
    expect(await select.locator('option').allInnerTexts()).not.toContain('Sustentação');
    await select.selectOption('sustentacao');
    for (const c of ['S1', 'S5', 'S12', 'O17', 'PV1']) {
      const linha = page.getByRole('row', { name: new RegExp(`^${c} `) });
      await expect(linha).toContainText('Operacional · Sustentação');
      await expect(linha.getByRole('link')).toHaveAttribute('href', `/operacional?cadencia=sustentacao#${c.toLowerCase()}`);
    }
  });

  test('CA-18 Leia junto cruzado: O15 para O17 diz a visão e a fonte, troca a visão, abre Mais métricas e foca o cartão', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=semanal');
    await aguardar(page);
    const link = page.getByTestId('leia-junto-o15').getByRole('link', { name: /O17/ });
    await expect(link).toContainText('visão Sustentação, fonte Acelerato');
    await link.click();
    await expect(page).toHaveURL(/cadencia=sustentacao.*#o17$/);
    await expect(page.getByTestId('mais-metricas')).toHaveJSProperty('open', true);
    await expect(page.getByTestId('metrica-O17')).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.activeElement?.closest('[data-testid="metrica-O17"]') !== null)).toBe(true);
  });
});

test.describe('Sustentação no Operacional: acessibilidade, layout e desempenho', () => {
  for (const largura of [375, 1280] as const) {
    test(`CA-19 axe sem violações sérias nas quatro visões a ${largura} px`, async ({ page, painel }) => {
      await page.setViewportSize({ width: largura, height: 900 });
      for (const [visao, url] of VISOES) {
        await painel.ir(url);
        if (visao === 'resumo') await aguardarResumo(page);
        else await aguardar(page);
        const r = await rodarAxe(page);
        expect(r.bloqueantes, `${visao} @${largura}: ${JSON.stringify(r.bloqueantes)}`).toEqual([]);
      }
    });

    test(`CA-20 sem rolagem horizontal e seletor com alvos de 44 px a 375 (${largura} px)`, async ({ page, painel }) => {
      await page.setViewportSize({ width: largura, height: 900 });
      for (const [visao, url] of VISOES) {
        await painel.ir(url);
        await aguardar(page);
        const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(sobra, `${visao} @${largura}`).toBeLessThanOrEqual(0);
        if (largura === 375) {
          const alturas = await grupoVisao(page).locator('label').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
          for (const a of alturas) expect(a, visao).toBeGreaterThanOrEqual(43.5);
        }
      }
    });
  }

  test('CA-19 trocar a visão anuncia a fonte, muda o título, e o foco fica no rádio', async ({ page, painel }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await painel.ir('/operacional');
    await expect(page).toHaveTitle(/^Operacional · Resumo · Métricas DSPD/);
    await page.getByRole('radio', { name: 'Sustentação' }).click({ force: true });
    await expect(page.getByTestId('anuncio-visao')).toHaveText('Visão Sustentação. Fonte: Acelerato.');
    await expect(page).toHaveTitle(/^Operacional · Sustentação · Métricas DSPD/);
    await expect(page.getByRole('radio', { name: 'Sustentação' })).toBeFocused();
    await page.getByRole('radio', { name: 'Semanal' }).click({ force: true });
    await expect(page).toHaveTitle(/^Operacional · Semanal/);
    await page.getByRole('radio', { name: 'Diária' }).click({ force: true });
    await expect(page).toHaveTitle(/^Operacional · Diária/);
  });

  test('CA-21 a Diária e a Semanal não baixam o chunk da Sustentação; a pré-carga acontece na intenção', async ({ page, painel }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const baixados: string[] = [];
    page.on('request', (r) => {
      if (/\/assets\/.*VisaoSustentacao/.test(r.url())) baixados.push(r.url());
    });
    for (const url of ['/operacional?cadencia=diaria', '/operacional?cadencia=semanal', '/operacional']) {
      await painel.ir(url);
      await aguardar(page);
    }
    expect(baixados).toEqual([]);
    await grupoVisao(page).locator('label', { hasText: 'Sustentação' }).hover();
    await expect.poll(() => baixados.length).toBeGreaterThan(0);
  });

  test('CA-22 sem coleta do Acelerato: SemDadosDaFonte na Sustentação e as visões do fluxo funcionam', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=sustentacao&mock=coleta-vazia:ac');
    await expect(page.getByTestId('sem-dados-acelerato')).toBeVisible();
    for (const url of ['/operacional?cadencia=diaria&mock=coleta-vazia:ac', '/operacional?cadencia=semanal&mock=coleta-vazia:ac']) {
      await painel.ir(url);
      await aguardar(page);
      await expect(page.getByTestId('sem-dados-acelerato')).toHaveCount(0);
      await expect(page.getByTestId('metrica-O2').or(page.getByTestId('metrica-O3')).first()).toBeVisible();
    }
  });
});

test.describe('Visão Resumo', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('CA-23 padrão: Resumo marcado, dois blocos na ordem, URL sem cadencia; cadencia=resumo é normalizado', async ({ page, painel }) => {
    await painel.ir('/operacional');
    await expect(grupoVisao(page).getByRole('radio', { name: 'Resumo' })).toBeChecked();
    const blocos = await page.locator('[data-testid^="resumo-"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')).filter((t) => t === 'resumo-fluxo' || t === 'resumo-sustentacao'));
    expect(blocos).toEqual(['resumo-fluxo', 'resumo-sustentacao']);
    expect(page.url()).not.toContain('cadencia');
    await page.goto('/operacional?cadencia=resumo');
    await expect.poll(() => page.url()).not.toContain('cadencia');
  });

  test('CA-24 compatibilidade: cadencia e hashes abrem a visão e o cartão como antes; links internos não caem no Resumo', async ({ page, painel }) => {
    for (const [url, cartao] of [['/operacional?cadencia=diaria', 'O2'], ['/operacional?cadencia=semanal', 'O3'], ['/operacional?cadencia=sustentacao', 'S2'], ['/operacional#o3', 'O3'], ['/operacional#s2', 'S2']] as const) {
      await painel.ir(url);
      await expect(page.getByTestId(`metrica-${cartao}`)).toBeVisible();
    }
    await painel.ir('/metricas');
    const destinos = await page.getByRole('table').getByRole('link').evaluateAll((els) => els.map((e) => e.getAttribute('href')!));
    for (const h of destinos.filter((h) => h.startsWith('/operacional'))) expect(h).toMatch(/cadencia=(diaria|semanal|sustentacao)/);
  });

  test('CA-25 fontes separadas: selo e frescor por bloco, nenhum código da outra fonte, nenhum total e blocos empilhados', async ({ page, painel }) => {
    await painel.ir('/operacional');
    await aguardarResumo(page);
    const fluxo = page.getByTestId('resumo-fluxo');
    const sust = page.getByTestId('resumo-sustentacao');
    await expect(fluxo.getByTestId('resumo-fluxo-fonte')).toContainText('Fonte: BusinessMap · Dados até');
    await expect(sust.getByTestId('resumo-sustentacao-fonte')).toContainText('Fonte: Acelerato · Dados até');
    expect(await fluxo.innerText()).not.toMatch(/\bS\d{1,2}\b|EI-SUST|PV1|Acelerato/);
    expect(await sust.innerText()).not.toMatch(/\bO\d{1,2}\b|BusinessMap|BLOQUEADOS/);
    await expect(page.getByText(/total geral/i)).toHaveCount(0);
    const [a, b] = await Promise.all([fluxo.boundingBox(), sust.boundingBox()]);
    expect(b!.y, 'o bloco da Sustentação vem abaixo do fluxo').toBeGreaterThanOrEqual(a!.y + a!.height - 1);
    expect(a!.width).toBeGreaterThan(900);
    expect(b!.width).toBeGreaterThan(900);
  });

  test('CA-26 números-chave: O3, O4, O2 e O12; S2, S1 e S3; base, unidade e link; com n menor que 20, sem valor', async ({ page, painel }) => {
    await painel.ir('/operacional');
    await aguardarResumo(page);
    const esperados: [string, string, string][] = [
      ['p85', 'Ver O3 na Semanal', 'dias úteis'],
      ['vazao', 'Ver O4 na Semanal', 'itens'],
      ['acima-p95', 'Ver O2 na Diária', 'itens'],
      ['vencidos-internos', 'Ver O12 na Semanal', 'itens'],
      ['s2', 'Ver S2 na Sustentação', 'prioridades avaliadas'],
      ['s1', 'Ver S1 na Sustentação', 'prioridades avaliadas'],
      ['volume', 'Ver S3 na Sustentação', 'chamados abertos'],
    ];
    for (const [id, link, unidade] of esperados) {
      const n = page.getByTestId(`numero-${id}`);
      await expect(n, id).toContainText('Base:');
      await expect(n, id).toContainText(unidade);
      await expect(n.getByRole('link', { name: link })).toBeVisible();
    }
    await expect(page.getByTestId('numero-p85')).toContainText('P85 do tempo de ciclo · Melhoria');
    await page.getByTestId('numero-p85').getByRole('link').click();
    await expect(page).toHaveURL(/cadencia=semanal.*#o3$/);
    await expect(page.getByTestId('metrica-O3')).toBeVisible();
  });

  test('CA-27 tendência: 6 meses fechados, mês com poucos itens sem valor e com marcador vazado, tabela e janela escrita', async ({ page, painel }) => {
    await painel.ir('/operacional', { mock: 'tendencia-poucos' });
    await aguardarResumo(page);
    const p85 = page.getByTestId('tendencia-fluxo-p85');
    await expect(p85).toContainText('janela de 12 semanas até o fim do mês');
    await expect(page.getByTestId('tendencia-sustentacao-sla')).toContainText('janela de 12 semanas até o fim do mês');
    await expect(p85.getByTestId('marcador-vazado')).toHaveCount(1);
    await expect(p85.getByTestId('tendencia-fluxo-p85-sem-valor')).toContainText('jun/2026 · poucos itens (n=14)');
    await p85.getByRole('button', { name: 'Ver como tabela' }).click();
    const linhas = p85.getByRole('table').getByRole('row');
    await expect(linhas).toHaveCount(7);
    await expect(p85.getByRole('row', { name: /jun\/2026/ })).toContainText('n=14 · não publicado');
    const meses = await p85.getByRole('table').getByRole('rowheader').allInnerTexts();
    expect(meses).toEqual(['abr/2026', 'mai/2026', 'jun/2026', 'jul/2026', 'ago/2026', 'set/2026']);
    const sla = page.getByTestId('tendencia-sustentacao-sla');
    await expect(sla.getByTestId('tendencia-sustentacao-sla-sem-valor')).toContainText('jul/2026 · não publicado');
  });

  test('CA-28 alertas por fonte, com título da fonte; cada link leva à visão dona com o cartão', async ({ page, painel }) => {
    await painel.ir('/operacional', { mock: 'sem-calibracao' });
    await aguardarResumo(page);
    await expect(page.getByRole('region', { name: 'Pede atenção · Fluxo de projeto (BusinessMap)' })).toBeVisible();
    const faixaS = page.getByRole('region', { name: 'Pede atenção · Sustentação (Acelerato)' });
    await expect(faixaS).toBeVisible();
    await expect(faixaS.getByTestId('faixa-atencao-janela')).toHaveText('Janela: últimas 12 semanas');
    await expect(page.getByTestId('nota-janelas-alerta')).toContainText('Mesmo alerta, janelas diferentes');
    await expect(faixaS.getByRole('link').first()).toHaveAttribute('href', /cadencia=sustentacao.*#s[12]$/);
    await faixaS.getByRole('link').first().click();
    await expect(page).toHaveURL(/cadencia=sustentacao/);
    await expect(page.getByTestId('metrica-S2').or(page.getByTestId('metrica-S1')).first()).toBeVisible();
  });

  test('CA-29 sem barra de filtros; guardados avisados; O3 oculto vira marcador e a série P85 some; nenhuma chave nova', async ({ page, painel }) => {
    await guardarPrefs(page, { operacional: ['o3'] });
    await painel.ir('/operacional?equipe=erp-protheus&sust_prioridade=p1');
    await aguardarResumo(page);
    await expect(page.getByTestId('barra-filtros')).toHaveCount(0);
    await expect(page.getByTestId('filtros-guardados')).toContainText('não se aplicam ao Resumo');
    await expect(page.getByTestId('numero-p85-oculto')).toContainText('O3 oculta nas suas preferências');
    await expect(page.getByTestId('tendencia-fluxo-p85')).toHaveCount(0);
    await expect(page.getByTestId('tendencia-fluxo-concluidos')).toBeVisible();
    expect(await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('metricas-dspd:preferencias')))).toEqual([PREFS]);
  });

  test('CA-30 exportação do Resumo: só "Exportar vários", com os níveis Operacional e Operacional · Sustentação pré-selecionados', async ({ page, painel }) => {
    await painel.ir('/operacional');
    await aguardarResumo(page);
    await expect(page.getByTestId('botao-exportar')).toHaveCount(0);
    await page.getByTestId('botao-exportar-personalizada').click();
    const d = page.getByTestId('dialogo-exportar');
    for (const c of [/O3 /, /O4 /, /O2 /, /O12 /, /S2 /, /S1 /, /S3 /]) await expect(d.getByRole('checkbox', { name: c })).toBeChecked();
    await expect(d.getByRole('checkbox', { name: /O9 / })).not.toBeChecked();
    await expect(d.getByTestId('exportar-previa')).toContainText('BusinessMap');
    await expect(d.getByTestId('exportar-previa')).toContainText('Acelerato');
  });

  test('CA-31 estados independentes por bloco, anúncio e título', async ({ page, painel }) => {
    await painel.ir('/operacional', { mock: 'erro-uma-vez:s2' });
    await expect(page.getByTestId('numero-s2-erro')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('numero-p85-valor')).toBeVisible();
    await page.getByTestId('numero-s2-erro').getByRole('button', { name: 'Tentar de novo' }).click();
    await expect(page.getByTestId('numero-s2-valor')).toBeVisible();
    await painel.ir('/operacional', { mock: 'coleta-vazia:ac' });
    await expect(page.getByTestId('resumo-sustentacao').getByTestId('sem-dados-acelerato')).toBeVisible();
    await expect(page.getByTestId('resumo-fluxo').getByTestId('sem-dados-businessmap')).toHaveCount(0);
    await expect(page.getByTestId('numero-p85-valor')).toBeVisible({ timeout: 30_000 });
    await painel.ir('/operacional?cadencia=semanal');
    await page.getByRole('radio', { name: 'Resumo' }).click({ force: true });
    await expect(page.getByTestId('anuncio-visao')).toHaveText('Visão Resumo. Fontes: BusinessMap e Acelerato, em blocos separados.');
    await expect(page).toHaveTitle(/^Operacional · Resumo/);
  });
});
