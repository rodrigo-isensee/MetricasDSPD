import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures/base';

/**
 * QA intensivo de FILTROS: casos de borda de URL (docs/qa/intensivo-filtros.md, seção IF-B).
 * Valores inexistentes, URL malformada, períodos fora da base, datas futuras, parâmetros repetidos,
 * maiúsculas/espaços, injeção de marcação e combinação com `?mock=`.
 */

test.use({ viewport: { width: 1280, height: 800 } });

async function pronto(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('[data-testid^="metrica-"][aria-busy="true"]')).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator('[data-testid^="estado-carregando-"]')).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator('[data-testid^="metrica-"][data-estado="carregando"], [data-testid^="metrica-"][data-estado="atualizando"]')).toHaveCount(0, { timeout: 30_000 });
}

async function estados(page: Page): Promise<Record<string, string | null>> {
  return page.locator('[data-testid^="metrica-"]').evaluateAll((es) =>
    Object.fromEntries(es.map((e) => [e.getAttribute('data-testid')!.replace('metrica-', ''), e.getAttribute('data-estado')])),
  );
}

const busca = (page: Page): string => {
  const bruto = new URL(page.url()).search.replace(/^\?/, '');
  try {
    return decodeURIComponent(bruto);
  } catch {
    return bruto; // a própria URL tem codificação malformada (caso B30)
  }
};

interface Caso {
  id: string;
  url: string;
  /** Busca esperada depois da normalização (sem `?`, vírgulas legíveis). */
  esperado: string | RegExp;
  /** Texto esperado no aviso de filtros ignorados; `null` = sem aviso. */
  aviso: string | RegExp | null;
  /** Rótulo esperado de um botão de filtro. */
  botao?: [string, string | RegExp];
}

const CASOS: Caso[] = [
  // valores inexistentes
  { id: 'B01 equipe inexistente', url: '/operacional?cadencia=diaria&equipe=xyz', esperado: '', aviso: /equipe "xyz"/ },
  { id: 'B02 só o inválido sai', url: '/operacional?cadencia=diaria&equipe=fluig,xyz,dados', esperado: 'equipe=fluig,dados', aviso: /equipe "xyz"/, botao: ['filtro-equipe', 'Equipe: 2 selecionadas'] },
  { id: 'B03 tipo e sistema inexistentes', url: '/tatico?tipo=story&sistema=sap', esperado: '', aviso: /tipo "story".*sistema "sap"|sistema "sap".*tipo "story"/ },
  { id: 'B04 prioridade inexistente', url: '/operacional?cadencia=sustentacao&prioridade=p9,p1', esperado: 'prioridade=p1', aviso: /prioridade "p9"/ },
  { id: 'B05 equipe do fluxo na sustentação', url: '/operacional?cadencia=sustentacao&equipe=erp-protheus', esperado: '', aviso: /equipe "erp-protheus"/ },
  { id: 'B06 equipe da sustentação no fluxo', url: '/operacional?cadencia=diaria&equipe=totvs', esperado: '', aviso: /equipe "totvs"/ },
  { id: 'B07 período inexistente', url: '/operacional?cadencia=diaria&periodo=99', esperado: '', aviso: /período "99"/ },
  { id: 'B08 período em maiúsculas', url: '/operacional?cadencia=diaria&periodo=4S', esperado: '', aviso: /período "4S"/ },
  // período personalizado
  { id: 'B09 custom sem datas', url: '/operacional?cadencia=diaria&periodo=custom', esperado: '', aviso: /período personalizado/ },
  { id: 'B10 custom invertido', url: '/operacional?cadencia=diaria&periodo=custom&de=2026-08-31&ate=2026-06-01', esperado: '', aviso: /período personalizado/ },
  { id: 'B11 custom menor que 7 dias', url: '/operacional?cadencia=diaria&periodo=custom&de=2026-08-01&ate=2026-08-05', esperado: '', aviso: /período personalizado/ },
  { id: 'B12 custom com data futura', url: '/operacional?cadencia=diaria&periodo=custom&de=2026-09-01&ate=2027-01-31', esperado: '', aviso: /período personalizado/ },
  { id: 'B13 custom um dia depois da data dos dados', url: '/tatico?periodo=custom&de=2026-09-01&ate=2026-10-10', esperado: '', aviso: /período personalizado/ },
  { id: 'B14 custom até a data dos dados (limite válido)', url: '/tatico?periodo=custom&de=2026-09-01&ate=2026-10-09', esperado: 'periodo=custom&de=2026-09-01&ate=2026-10-09', aviso: null, botao: ['filtro-periodo', /01\/09\/2026 a 09\/10\/2026/] },
  { id: 'B15 custom antes do início da base', url: '/operacional?cadencia=diaria&periodo=custom&de=2000-01-01&ate=2026-06-30', esperado: '', aviso: /período personalizado/ },
  { id: 'B16 custom com data impossível', url: '/operacional?cadencia=sustentacao&periodo=custom&de=2026-02-30&ate=2026-03-31', esperado: '', aviso: /período personalizado/ },
  { id: 'B17 custom com texto', url: '/operacional?cadencia=sustentacao&periodo=custom&de=ontem&ate=hoje', esperado: '', aviso: /período personalizado/ },
  // não aplicáveis no painel (silêncio, sem aviso)
  { id: 'B18 Estratégico com 4 semanas', url: '/estrategico?periodo=4s', esperado: '', aviso: null, botao: ['filtro-periodo', /Últimos 12 meses/] },
  { id: 'B19 Estratégico com personalizado', url: '/estrategico?periodo=custom&de=2026-06-01&ate=2026-08-31', esperado: '', aviso: null },
  { id: 'B20 Estratégico com equipe e tipo', url: '/estrategico?equipe=fluig&tipo=incidente&sistema=fluig', esperado: 'sistema=fluig', aviso: null },
  { id: 'B21 Estratégico com o período padrão explícito', url: '/estrategico?periodo=12m', esperado: '', aviso: null },
  { id: 'B22 Operacional com o período padrão explícito', url: '/operacional?cadencia=diaria&periodo=12s', esperado: '', aviso: null },
  // forma da URL
  { id: 'B23 maiúsculas e espaços nos valores', url: '/operacional?cadencia=diaria&equipe=%20FLUIG%20,Dados', esperado: /^equipe=/, aviso: null, botao: ['filtro-equipe', 'Equipe: 2 selecionadas'] },
  { id: 'B24 valor repetido', url: '/operacional?cadencia=diaria&equipe=fluig,fluig', esperado: /^equipe=fluig/, aviso: null, botao: ['filtro-equipe', 'Equipe: Fluig'] },
  { id: 'B25 parâmetro repetido', url: '/operacional?cadencia=diaria&equipe=fluig&equipe=dados', esperado: /equipe=/, aviso: null },
  { id: 'B26 vírgulas vazias', url: '/operacional?cadencia=diaria&equipe=,,,&tipo=,', esperado: /.*/, aviso: null, botao: ['filtro-equipe', 'Equipe: Todas'] },
  { id: 'B27 todas as equipes pela URL', url: '/operacional?cadencia=diaria&equipe=erp-protheus,fluig,senior,marketing-e-vendas,dados,plataforma-5g', esperado: /.*/, aviso: null, botao: ['filtro-equipe', 'Equipe: Todas'] },
  { id: 'B28 de/ate sem periodo=custom', url: '/operacional?cadencia=diaria&de=2026-06-01&ate=2026-08-31', esperado: /.*/, aviso: null, botao: ['filtro-periodo', /Últimas 12 semanas/] },
  { id: 'B29 codificação malformada no valor', url: '/operacional?cadencia=diaria&equipe=%E0%A4%A', esperado: '', aviso: /equipe/ },
  { id: 'B30 codificação malformada na chave', url: '/operacional?cadencia=diaria&%E0%A4%A=1&equipe=fluig', esperado: /equipe=fluig/, aviso: null },
  { id: 'B31 injeção de marcação no valor', url: '/operacional?cadencia=diaria&equipe=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E', esperado: '', aviso: /equipe "<img src=x onerror=alert\(1\)>"/ },
  { id: 'B32 valor muito longo', url: `/operacional?equipe=${'a'.repeat(4000)}`, esperado: '', aviso: /equipe/ },
  { id: 'B33 hash preservado na normalização', url: '/operacional?equipe=xyz&cadencia=semanal#o4', esperado: 'cadencia=semanal', aviso: /equipe "xyz"/ },
  { id: 'B34 cadência inválida com filtro válido', url: '/operacional?cadencia=mensal&equipe=fluig', esperado: /equipe=fluig/, aviso: null },
  { id: 'B35 sustentação com período de 12 meses e personalizado no limite', url: '/operacional?cadencia=sustentacao&periodo=custom&de=2026-04-01&ate=2026-10-09', esperado: 'periodo=custom&de=2026-04-01&ate=2026-10-09', aviso: null },
];

for (const c of CASOS) {
  test(`IF-${c.id}`, async ({ page, problemas }) => {
    let dialogo = false;
    page.on('dialog', async (d) => {
      dialogo = true;
      await d.dismiss();
    });
    await page.goto(c.url);
    await pronto(page);
    await expect(page.getByRole('heading', { name: 'Não foi possível abrir este painel' })).toHaveCount(0);
    if (c.aviso === null) await expect(page.getByTestId('aviso-filtros-invalidos')).toHaveCount(0);
    else {
      await expect(page.getByTestId('aviso-filtros-invalidos')).toBeVisible();
      await expect(page.getByTestId('aviso-filtros-invalidos')).toContainText(c.aviso);
    }
    if (typeof c.esperado === 'string') await expect.poll(() => busca(page)).toBe(c.esperado);
    else await expect.poll(() => busca(page)).toMatch(c.esperado);
    if (c.botao) await expect(page.getByTestId(c.botao[0])).toHaveAttribute('aria-label', c.botao[1]);
    if (c.url.includes('#')) expect(new URL(page.url()).hash).toBe(new URL(c.url, 'http://x').hash);
    // a correção da URL (replace) recarrega os cartões: espera assentar e nenhum pode terminar em erro
    await expect
      .poll(async () => Object.entries(await estados(page)).filter(([, e]) => e === 'carregando' || e === 'atualizando').length, { timeout: 30_000 })
      .toBe(0);
    for (const [cod, est] of Object.entries(await estados(page))) expect(['ok', 'vazio', 'insuficiente'], `${cod}=${est}`).toContain(est);
    expect(dialogo).toBe(false);
    expect(problemas).toEqual([]);
  });
}

test('IF-B40 a correção da URL inválida não cria entrada de histórico (Voltar sai da página)', async ({ page }) => {
  await page.goto('/ajuda');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.goto('/operacional?cadencia=diaria&equipe=xyz');
  await pronto(page);
  await expect.poll(() => busca(page)).toBe('');
  await page.goBack();
  await expect(page).toHaveURL(/\/ajuda$/);
});

test('IF-B41 "Entendi" some com o aviso e recarregar não o traz de volta', async ({ page }) => {
  await page.goto('/operacional?cadencia=sustentacao&prioridade=zz');
  await pronto(page);
  await page.getByRole('button', { name: 'Entendi' }).click();
  await expect(page.getByTestId('aviso-filtros-invalidos')).toHaveCount(0);
  await page.reload();
  await pronto(page);
  await expect(page.getByTestId('aviso-filtros-invalidos')).toHaveCount(0);
});

test('IF-B42 estado consistente entre URL e tela quando o parâmetro vem repetido', async ({ page }) => {
  // `equipe=fluig&equipe=dados`: a tela usa só o primeiro; a URL deveria ficar igual ao estado.
  await page.goto('/operacional?cadencia=diaria&equipe=fluig&equipe=dados');
  await pronto(page);
  await expect(page.getByTestId('filtro-equipe')).toHaveAttribute('aria-label', 'Equipe: Fluig');
  await expect.poll(() => new URL(page.url()).searchParams.getAll('equipe')).toEqual(['fluig']);
});

test('IF-B43 todas as equipes pela URL: a URL fica limpa como quando se marca tudo na tela (FIL-04)', async ({ page }) => {
  await page.goto('/operacional?cadencia=diaria&equipe=erp-protheus,fluig,senior,marketing-e-vendas,dados,plataforma-5g');
  await pronto(page);
  await expect(page.getByTestId('filtro-equipe')).toHaveAttribute('aria-label', 'Equipe: Todas');
  await expect.poll(() => new URL(page.url()).searchParams.has('equipe')).toBe(false);
});

test('IF-B44 maiúsculas, espaços e duplicatas são canonizados na URL', async ({ page }) => {
  await page.goto('/operacional?cadencia=diaria&equipe=%20FLUIG%20,fluig,Dados');
  await pronto(page);
  await expect(page.getByTestId('filtro-equipe')).toHaveAttribute('aria-label', 'Equipe: 2 selecionadas');
  await expect.poll(() => busca(page)).toBe('equipe=fluig,dados');
});

test('IF-B45 Estratégico: o período padrão explícito sai da URL (URL limpa no padrão)', async ({ page }) => {
  await page.goto('/operacional?cadencia=diaria&periodo=12m');
  await pronto(page);
  await page.getByRole('navigation').first().getByRole('link', { name: 'Estratégico' }).click();
  await pronto(page);
  await expect(page.getByTestId('filtro-periodo')).toHaveAttribute('aria-label', /Últimos 12 meses/);
  await expect(page.getByTestId('limpar-filtros')).toHaveCount(0);
  await expect.poll(() => busca(page)).toBe('');
});

test('IF-B46 de/ate soltos (sem periodo=custom) saem da URL', async ({ page }) => {
  await page.goto('/operacional?cadencia=diaria&de=2026-06-01&ate=2026-08-31');
  await pronto(page);
  await expect.poll(() => busca(page)).toBe('');
});

test('IF-B47 mock=vazio e mock=erro:o2 com filtros: estados forçados, filtros preservados', async ({ page }) => {
  await page.goto('/operacional?cadencia=diaria&equipe=fluig&periodo=4s&mock=vazio');
  await pronto(page);
  // BLOQUEADOS vazio é estado positivo ("Nenhum item bloqueado hoje."), exibido como ok (OP-06)
  for (const [cod, est] of Object.entries(await estados(page))) expect(est, cod).toBe(cod === 'BLOQUEADOS' ? 'ok' : 'vazio');
  await expect(page.getByTestId('metrica-BLOQUEADOS')).toContainText('Nenhum item bloqueado hoje.');
  await expect(page.getByTestId('filtro-equipe')).toHaveAttribute('aria-label', 'Equipe: Fluig');
  await page.goto('/operacional?cadencia=diaria&equipe=fluig&mock=erro:o2');
  await pronto(page);
  const e = await estados(page);
  expect(e.O2).toBe('erro');
  for (const [cod, est] of Object.entries(e)) if (cod !== 'O2') expect(['ok', 'vazio', 'insuficiente'], cod).toContain(est);
  expect(busca(page)).toBe('equipe=fluig&mock=erro:o2');
});

test('IF-B48 período personalizado pela interface: datas fora da base e futuras são recusadas com mensagem', async ({ page }) => {
  await page.goto('/operacional?cadencia=diaria');
  await pronto(page);
  await page.getByTestId('filtro-periodo').click();
  await page.getByRole('radio', { name: 'Personalizado' }).check();
  const de = page.getByLabel('De', { exact: true });
  const ate = page.getByLabel('Até', { exact: true });
  const aplicar = page.getByRole('button', { name: 'Aplicar período' });
  const casos: [string, string, RegExp][] = [
    ['', '', /Informe as duas datas/],
    ['2026-08-31', '2026-06-01', /anterior à data final/],
    ['2026-09-01', '2027-01-01', /não pode passar de 09\/10\/2026/],
    ['2000-01-01', '2026-06-01', /Há dados a partir de/],
    ['2026-08-01', '2026-08-03', /pelo menos 7 dias/],
  ];
  for (const [d, a, msg] of casos) {
    await de.fill(d);
    await ate.fill(a);
    await aplicar.click();
    await expect(page.getByRole('alert')).toContainText(msg);
    expect(new URL(page.url()).searchParams.has('periodo')).toBe(false);
  }
  await de.fill('2026-06-01');
  await ate.fill('2026-08-31');
  await aplicar.click();
  await expect.poll(() => busca(page)).toBe('periodo=custom&de=2026-06-01&ate=2026-08-31');
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('filtro-periodo')).toHaveAttribute('aria-label', /01\/06\/2026 a 31\/08\/2026/);
});

test('IF-B49 rota inexistente com filtros mostra "Página não encontrada" sem erro de console', async ({ page, problemas }) => {
  await page.goto('/operacionall?equipe=fluig');
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
  expect(problemas).toEqual([]);
});
