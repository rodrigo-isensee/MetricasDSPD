import { readFile } from 'node:fs/promises';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { Download, Page } from '@playwright/test';
import { test, expect, rodarAxe } from '../fixtures/base';

// Pedido 008: exportar métricas em PDF. O E2E baixa o arquivo de verdade e lê o texto com pdfjs-dist.
const CHAVE = 'metricas-dspd:preferencias:v1';
const TEMAS = ['light', 'dark'] as const;
const TELAS = [
  { nome: '1280', width: 1280, height: 800 },
  { nome: '375', width: 375, height: 812 },
] as const;

async function preparar(page: Page, tema: (typeof TEMAS)[number] = 'light', ocultar: Record<string, string[]> = {}) {
  await page.addInitScript(
    ([t, chave, o]) => {
      localStorage.setItem('metricas-dspd:tema', t === 'dark' ? 'escuro' : 'claro');
      if (Object.keys(o).length)
        localStorage.setItem(
          chave,
          JSON.stringify({
            versao: 1,
            paineis: Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { ocultar: v }])),
            atualizadoEm: '2026-10-10T00:00:00.000Z',
          }),
        );
    },
    [tema, CHAVE, ocultar] as const,
  );
}

interface PdfLido {
  titulo: string;
  paginas: string[];
  texto: string;
}

async function lerPdf(download: Download): Promise<PdfLido> {
  const caminho = await download.path();
  const pdf = await getDocument({ data: new Uint8Array(await readFile(caminho)), useSystemFonts: true }).promise;
  const paginas: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const conteudo = await (await pdf.getPage(i)).getTextContent();
    paginas.push(conteudo.items.map((x) => ('str' in x ? x.str : '')).join(' '));
  }
  const meta = await pdf.getMetadata();
  const titulo = String((meta.info as { Title?: string }).Title ?? '');
  return { titulo, paginas, texto: paginas.join('\n') };
}

async function aguardarPainel(page: Page) {
  await expect(page.getByRole('button', { name: 'Exportar', exact: true })).toBeVisible();
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
}

async function gerarEBaixar(page: Page): Promise<{ download: Download; pdf: PdfLido }> {
  const dlg = page.getByRole('dialog');
  await dlg.getByRole('button', { name: 'Gerar arquivo' }).click();
  const baixar = dlg.getByRole('link', { name: 'Baixar' });
  await expect(baixar).toBeVisible({ timeout: 20_000 });
  const [download] = await Promise.all([page.waitForEvent('download'), baixar.click()]);
  return { download, pdf: await lerPdf(download) };
}

const semRolagemHorizontal = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test.describe('conteúdo do PDF (1280 px)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('EXP-01 painel Operacional: PDF com os campos obrigatórios e Dados fictícios em todas as páginas', async ({ page }) => {
    await preparar(page);
    await page.goto('/operacional?cadencia=semanal&periodo=4s');
    await aguardarPainel(page);
    await page.getByRole('button', { name: 'Exportar', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Exportar métricas' })).toBeVisible();
    const { download, pdf } = await gerarEBaixar(page);
    expect(download.suggestedFilename()).toMatch(/^metricas-dspd_fluxo-operacional_\d{4}-\d{2}-\d{2}_ficticio\.pdf$/);
    expect(pdf.titulo).toContain('Métricas DSPD · Operacional');
    for (const trecho of [
      'Métricas DSPD',
      'Fonte: BusinessMap',
      'Filtros:',
      'Últimas 4 semanas',
      'Janela dos dados:',
      'Base:',
      'Nota metodológica (resumo):',
      'Dados até',
      'Gerado em',
      'O sistema não compara equipes nem avalia pessoas.',
      'O3 · Tempo de ciclo',
    ])
      expect(pdf.texto, trecho).toContain(trecho);
    expect(pdf.texto).not.toContain('Fonte: Acelerato');
    expect(pdf.paginas.length).toBeGreaterThan(1);
    for (const [i, pagina] of pdf.paginas.entries()) expect(pagina, `página ${i + 1}`).toContain('Dados fictícios');
    expect(pdf.texto).toContain(`Página ${pdf.paginas.length} de ${pdf.paginas.length}`);
  });

  test('EXP-02 métrica oculta não entra no diálogo nem no PDF', async ({ page }) => {
    await preparar(page, 'light', { operacional: ['o9', 'o10'] });
    await page.goto('/operacional?cadencia=semanal');
    await aguardarPainel(page);
    await page.getByRole('button', { name: 'Exportar', exact: true }).click();
    const dlg = page.getByRole('dialog');
    await expect(dlg.getByRole('checkbox', { name: /O9 /, includeHidden: false })).toHaveCount(0);
    await expect(dlg.getByRole('checkbox', { name: /O3 / })).toBeChecked();
    const { pdf } = await gerarEBaixar(page);
    expect(pdf.texto).toContain('O3 · Tempo de ciclo');
    expect(pdf.texto).not.toContain('O9 · ');
    expect(pdf.texto).not.toContain('Os três relógios do pedido');
    expect(pdf.texto).not.toContain('O10 · ');
  });

  test('EXP-02b a 375x667 o botão Gerar arquivo está visível sem rolar', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await preparar(page, 'light');
    await page.goto('/operacional');
    await aguardarPainel(page);
    await page.getByRole('button', { name: 'Exportação personalizada' }).click();
    const dlg = page.getByRole('dialog');
    const gerar = dlg.getByRole('button', { name: 'Gerar arquivo' });
    await expect(gerar).toBeInViewport({ ratio: 1 });
    const caixa = await gerar.boundingBox();
    expect(caixa!.height).toBeGreaterThanOrEqual(24);
    expect(caixa!.y + caixa!.height).toBeLessThanOrEqual(667);
  });

  test('EXP-03 exportação personalizada: um PDF, BusinessMap antes de Acelerato, cada métrica com a sua fonte', async ({ page }) => {
    await preparar(page);
    await page.goto('/operacional');
    await aguardarPainel(page);
    await page.getByRole('button', { name: 'Exportação personalizada' }).click();
    const dlg = page.getByRole('dialog', { name: 'Exportação personalizada' });
    await expect(dlg.getByRole('button', { name: 'Gerar arquivo' })).toBeDisabled();
    await dlg.getByRole('checkbox', { name: /S1 .*Acelerato/ }).check();
    await dlg.getByRole('checkbox', { name: /T2 .*BusinessMap/ }).check();
    await dlg.getByRole('checkbox', { name: /O3 .*BusinessMap/ }).check();
    await expect(dlg.getByTestId('exportar-previa')).toContainText('BusinessMap (2): O3, T2');
    await expect(dlg.getByTestId('exportar-previa')).toContainText('Acelerato (1): S1');
    const { download, pdf } = await gerarEBaixar(page);
    expect(download.suggestedFilename()).toMatch(/^metricas-dspd_personalizada_\d{4}-\d{2}-\d{2}_ficticio\.pdf$/);
    const bm = pdf.texto.indexOf('Fonte: BusinessMap');
    const ac = pdf.texto.indexOf('Fonte: Acelerato');
    expect(bm).toBeGreaterThanOrEqual(0);
    expect(ac).toBeGreaterThan(bm);
    expect(pdf.texto.indexOf('O3 · Tempo de ciclo')).toBeLessThan(ac);
    expect(pdf.texto.indexOf('T2 · Aderência ao SLE')).toBeLessThan(ac);
    expect(pdf.texto.indexOf('S1 · ')).toBeGreaterThan(ac);
  });

  test('EXP-04 Visão geral: níveis de BusinessMap e Sustentação (Acelerato) em seções separadas', async ({ page }) => {
    await preparar(page);
    await page.goto('/');
    await aguardarPainel(page);
    await page.getByRole('button', { name: 'Exportar', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Exportar a Visão geral' })).toBeVisible();
    const { download, pdf } = await gerarEBaixar(page);
    expect(download.suggestedFilename()).toMatch(/^metricas-dspd_visao-geral_\d{4}-\d{2}-\d{2}_ficticio\.pdf$/);
    const ac = pdf.texto.indexOf('Fonte: Acelerato');
    expect(pdf.texto.indexOf('Fonte: BusinessMap')).toBeGreaterThanOrEqual(0);
    expect(ac).toBeGreaterThan(pdf.texto.indexOf('Fonte: BusinessMap'));
    expect(pdf.texto.indexOf('Visão geral · Operacional')).toBeLessThan(ac);
    expect(pdf.texto.indexOf('Visão geral · Sustentação')).toBeGreaterThan(ac);
  });

  test('EXP-05 Sustentação: só Acelerato, sem nenhum nome de pessoa nos campos', async ({ page }) => {
    await preparar(page);
    await page.goto('/sustentacao');
    await aguardarPainel(page);
    await page.getByRole('button', { name: 'Exportar', exact: true }).click();
    const { pdf } = await gerarEBaixar(page);
    expect(pdf.texto).toContain('Fonte: Acelerato');
    expect(pdf.texto).not.toContain('Fonte: BusinessMap');
    expect(pdf.texto).not.toMatch(/Responsável|Agente|Analista/);
  });

  test('EXP-06 teclado: Esc fecha, o foco volta ao botão e o limite de 12 desabilita o excedente', async ({ page }) => {
    await preparar(page);
    await page.goto('/operacional');
    await aguardarPainel(page);
    const botao = page.getByRole('button', { name: 'Exportação personalizada' });
    await botao.focus();
    await page.keyboard.press('Enter');
    const dlg = page.getByRole('dialog');
    await expect(dlg).toBeVisible();
    const caixas = dlg.getByRole('checkbox');
    for (let i = 0; i < 12; i++) await caixas.nth(i).check();
    await expect(dlg.getByText(/Limite de 12 métricas por arquivo/)).toBeVisible();
    await expect(caixas.nth(12)).toBeDisabled();
    await page.keyboard.press('Escape');
    await expect(dlg).toBeHidden();
    await expect(botao).toBeFocused();
  });
});

for (const tela of TELAS) {
  for (const tema of TEMAS) {
    test.describe(`diálogo de exportação a ${tela.nome} px, tema ${tema}`, () => {
      test.use({ viewport: { width: tela.width, height: tela.height } });

      test('EXP-07 axe no diálogo (painel, personalizada, pronto), sem rolagem horizontal', async ({ page }) => {
        test.setTimeout(120_000); // quatro varreduras do axe e a geração do PDF
        await preparar(page, tema);
        await page.goto('/operacional?cadencia=semanal');
        await aguardarPainel(page);
        let r = await rodarAxe(page);
        expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([]);
        expect(await semRolagemHorizontal(page)).toBe(true);

        await page.getByRole('button', { name: 'Exportar', exact: true }).click();
        const dlg = page.getByRole('dialog', { name: 'Exportar métricas' });
        await expect(dlg).toBeVisible();
        r = await rodarAxe(page);
        expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([]);
        expect(await semRolagemHorizontal(page)).toBe(true);

        await dlg.getByRole('button', { name: 'Gerar arquivo' }).click();
        await expect(dlg.getByRole('link', { name: 'Baixar' })).toBeFocused({ timeout: 20_000 });
        r = await rodarAxe(page);
        expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([]);
        await page.keyboard.press('Escape');
        await expect(page.getByRole('button', { name: 'Exportar', exact: true })).toBeFocused();

        await page.getByRole('button', { name: 'Exportação personalizada' }).click();
        await expect(page.getByRole('dialog', { name: 'Exportação personalizada' })).toBeVisible();
        r = await rodarAxe(page);
        expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([]);
        expect(await semRolagemHorizontal(page)).toBe(true);
      });

      test('EXP-08 axe na Visão geral com o diálogo aberto', async ({ page }) => {
        await preparar(page, tema);
        await page.goto('/');
        await aguardarPainel(page);
        await page.getByRole('button', { name: 'Exportar', exact: true }).click();
        await expect(page.getByRole('dialog', { name: 'Exportar a Visão geral' })).toBeVisible();
        const r = await rodarAxe(page);
        expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([]);
        expect(await semRolagemHorizontal(page)).toBe(true);
      });
    });
  }
}
