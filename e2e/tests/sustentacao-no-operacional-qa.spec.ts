import { readFile } from 'node:fs/promises';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { Download, Page } from '@playwright/test';
import { test, expect, rodarAxe } from '../fixtures/base';

// QA da Sustentação no Operacional (docs/qa/sustentacao-no-operacional-plano.md, casos "a escrever (QA)").
// Complementa `sustentacao-no-operacional.spec.ts` (um teste por CA, dos autores): aqui ficam teclado, abuso do
// redirecionador, hashes `sust-*`, perfil do localStorage, conteúdo do arquivo, zoom, erros e regras invioláveis.
const PREFS = 'metricas-dspd:preferencias:v1';
const VISOES = [
  ['resumo', '/operacional'],
  ['diaria', '/operacional?cadencia=diaria'],
  ['semanal', '/operacional?cadencia=semanal'],
  ['sustentacao', '/operacional?cadencia=sustentacao'],
] as const;

const grupoVisao = (page: Page) => page.getByRole('radiogroup', { name: 'Visão' });
const busca = (page: Page) => new URL(page.url()).searchParams;
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
const perfil = (ocultar: Record<string, string[]>) =>
  JSON.stringify({
    versao: 1,
    paineis: Object.fromEntries(Object.entries(ocultar).map(([k, v]) => [k, { ocultar: v }])),
    atualizadoEm: '2026-10-10T00:00:00.000Z',
  });
const guardarBruto = (page: Page, valor: string) =>
  page.addInitScript(([k, v]) => {
    // só na primeira carga: o teste relê o valor depois, e recarregar não pode desfazer o que a página gravou
    if (localStorage.getItem('qa-semeado') === null) {
      localStorage.setItem(k as string, v as string);
      localStorage.setItem('qa-semeado', '1');
    }
  }, [PREFS, valor]);
const lerPrefs = (page: Page) => page.evaluate((k) => localStorage.getItem(k), PREFS);

test.describe('CT-03 teclado no seletor de visão', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('Tab chega ao grupo, setas trocam a visão (um push por seta) e o foco fica no rádio', async ({ page, painel }) => {
    await painel.ir('/operacional');
    await aguardarResumo(page);
    // Tab real: percorre a página até o grupo "Visão" receber o foco (no máximo 40 tabulações)
    let chegou = false;
    for (let i = 0; i < 40 && !chegou; i++) {
      await page.keyboard.press('Tab');
      chegou = await page.evaluate(() => !!document.activeElement?.matches('input[type=radio]') && !!document.activeElement.closest('[role="radiogroup"]'));
    }
    expect(chegou, 'o grupo Visão é alcançável por Tab').toBe(true);
    await expect(grupoVisao(page).getByRole('radio', { name: 'Resumo' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(grupoVisao(page).getByRole('radio', { name: 'Diária' })).toBeChecked();
    await expect(page).toHaveURL(/cadencia=diaria/);
    await expect(grupoVisao(page).getByRole('radio', { name: 'Diária' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(/cadencia=semanal/);
    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(/cadencia=sustentacao/);
    await expect(page.getByTestId('recorte-sustentacao')).toBeVisible();
    await expect(page.getByTestId('anuncio-visao')).toHaveText('Visão Sustentação. Fonte: Acelerato.');
    await expect(grupoVisao(page).getByRole('radio', { name: 'Sustentação' })).toBeFocused();
    // A7: cada seta é uma entrada de histórico
    await page.goBack();
    await expect(page).toHaveURL(/cadencia=semanal/);
    await expect(grupoVisao(page).getByRole('radio', { name: 'Semanal' })).toBeChecked();
    await grupoVisao(page).getByRole('radio', { name: 'Semanal' }).focus(); // o Voltar do navegador não devolve o foco ao rádio
    await page.keyboard.press('ArrowLeft');
    await expect(grupoVisao(page).getByRole('radio', { name: 'Diária' })).toBeChecked();
    // fim do grupo: a seta à direita da última dá a volta (comportamento nativo do rádio), sem sair do grupo
    await page.keyboard.press('ArrowLeft');
    await expect(grupoVisao(page).getByRole('radio', { name: 'Resumo' })).toBeChecked();
    await expect(page).not.toHaveURL(/cadencia/);
  });
});

test.describe('CT-10 e A8: valores inválidos na URL', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('sust_prioridade=P9 é ignorada com aviso que cita a Sustentação; a URL é corrigida', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=sustentacao&sust_prioridade=P9');
    await aguardar(page);
    await expect(painel.filtros.invalidos).toContainText('Sustentação');
    await expect(painel.filtros.invalidos).toContainText(/p9/i);
    await expect.poll(() => busca(page).has('sust_prioridade')).toBe(false);
    await expect(page.getByTestId('metrica-S2')).toBeVisible();
  });

  test('cadencia desconhecida cai no Resumo com aviso, sem entrada no histórico, hash desconhecido preservado (A8)', async ({ page, painel }) => {
    await page.goto('/ajuda');
    await painel.ir('/operacional?cadencia=xyz&equipe=erp-protheus#nao-existe');
    await expect(grupoVisao(page).getByRole('radio', { name: 'Resumo' })).toBeChecked();
    await expect.poll(() => busca(page).has('cadencia')).toBe(false);
    expect(new URL(page.url()).hash).toBe('#nao-existe');
    await expect(page.getByText('xyz').first()).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/\/ajuda$/);
  });

  test('cadencia=RESUMO (maiúsculas) não derruba a tela', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=RESUMO');
    await expect(grupoVisao(page).getByRole('radio', { name: 'Resumo' })).toBeChecked();
    await expect.poll(() => busca(page).has('cadencia')).toBe(false);
  });

  test('hash em maiúsculas (#S2) abre a Sustentação com S2', async ({ page }) => {
    await page.goto('/operacional?cadencia=semanal#S2');
    await expect(page.getByTestId('metrica-S2')).toBeVisible();
    await expect(page).toHaveURL(/cadencia=sustentacao/);
  });
});

test.describe('CT-17 e CT-18: hashes sust-* e abuso do redirecionador', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  for (const [antigo, novo] of [
    ['#compl-por-que-demora', '#compl-sust-por-que-demora'],
    ['#compl-o-que-entra', '#compl-sust-o-que-entra'],
    ['#compl-qualidade', '#compl-sust-qualidade'],
  ] as const) {
    test(`/sustentacao${antigo} vira ${novo}, abre Mais métricas e leva o destino à tela`, async ({ page }) => {
      await page.goto(`/sustentacao${antigo}`);
      await expect(page).toHaveURL(new RegExp(`/operacional\\?cadencia=sustentacao${novo}$`));
      await expect(page.getByTestId('mais-metricas')).toHaveJSProperty('open', true);
      const alvo = page.locator(novo);
      await expect(alvo).toBeAttached();
      await expect(alvo).toBeInViewport();
    });
  }

  test('hash dentro de /operacional (id novo) é estável: cada id sust-* existe em Mais métricas aberto', async ({ page }) => {
    await page.goto('/operacional?cadencia=sustentacao');
    await aguardar(page);
    await page.getByTestId('mais-metricas').locator('summary').click();
    const ids = await page.locator('[id^="compl-sust-"]').evaluateAll((els) => els.map((e) => e.id));
    expect(ids.length, 'ids compl-sust-* encontrados').toBeGreaterThanOrEqual(3);
    expect(ids).toEqual(expect.arrayContaining(['compl-sust-por-que-demora', 'compl-sust-o-que-entra', 'compl-sust-qualidade']));
    // unicidade: nenhum id repetido na página
    const todos = await page.locator('[id]').evaluateAll((els) => els.map((e) => e.id));
    expect(new Set(todos).size).toBe(todos.length);
  });

  const ABUSOS: [string, string][] = [
    ['next externo', '/sustentacao?next=//evil.com&equipe=totvs'],
    ['next com esquema', '/sustentacao?next=https://evil.com/x&redirect=//evil.com&url=//evil.com'],
    ['CRLF em equipe', '/sustentacao?equipe=%0d%0aLocation:%20//evil.com&prioridade=P1%0d%0a'],
    ['barra dupla no hash', '/sustentacao#//evil.com'],
    ['barra invertida no hash', '/sustentacao#/\\evil.com'],
    ['cadencia como URL', '/sustentacao?cadencia=//evil.com&mock=//evil.com'],
    ['esquema javascript', '/sustentacao?equipe=javascript:alert(1)&periodo=%22%3E%3Cscript%3Ealert(1)%3C/script%3E'],
    ['prefixo sust_ forjado', '/sustentacao?sust_equipe=//evil.com&sust_prioridade=%2e%2e%2f%2e%2e'],
  ];
  for (const [nome, url] of ABUSOS) {
    test(`abuso: ${nome} termina em /operacional, na mesma origem, sem tráfego para fora nem script`, async ({ page, baseURL }) => {
      const fora: string[] = [];
      const dialogos: string[] = [];
      page.on('request', (r) => {
        if (new URL(r.url()).origin !== new URL(baseURL!).origin) fora.push(r.url());
      });
      page.on('dialog', (d) => {
        dialogos.push(d.message());
        void d.dismiss();
      });
      await page.goto(url);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const u = new URL(page.url());
      expect(u.origin).toBe(new URL(baseURL!).origin);
      expect(u.pathname).toBe('/operacional');
      expect(u.searchParams.get('cadencia')).toBe('sustentacao');
      expect(u.searchParams.has('next') && u.searchParams.get('next')?.includes('evil')).toBe(false);
      expect(fora, 'requisições para outra origem').toEqual([]);
      expect(dialogos, 'diálogos de script').toEqual([]);
      expect(await page.locator('script', { hasText: 'alert(1)' }).count()).toBe(0);
    });
  }
});

test.describe('CT-23 perfil do localStorage: antigo, novo, corrompido e versão futura', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('perfil gravado pela versão nova mantém o formato v1 e não apaga outros painéis (volta ao schema antigo)', async ({ page }) => {
    await guardarBruto(page, perfil({ operacional: ['o9'], tatico: ['t1'], sustentacao: ['s3'] }));
    await page.goto('/preferencias');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.locator('[data-testid="grupo-sustentacao"]').getByRole('checkbox', { name: /^S5 / }).uncheck();
    await expect(page.getByText('Salvo neste navegador')).toBeVisible();
    const g = JSON.parse((await lerPrefs(page))!) as Record<string, unknown> & { paineis: Record<string, { ocultar: string[] }> };
    // schema antigo (007): só estas três chaves, versão 1, painéis com `ocultar`
    expect(Object.keys(g).sort()).toEqual(['atualizadoEm', 'paineis', 'versao']);
    expect(g.versao).toBe(1);
    expect(Object.keys(g.paineis).sort()).toEqual(['operacional', 'sustentacao', 'tatico']);
    expect(g.paineis.operacional!.ocultar).toEqual(['o9']);
    expect(g.paineis.tatico!.ocultar).toEqual(['t1']);
    expect(g.paineis.sustentacao!.ocultar).toEqual(expect.arrayContaining(['s3', 's5']));
    for (const p of Object.values(g.paineis)) expect(Object.keys(p)).toEqual(['ocultar']);
    expect(await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('metricas-dspd:preferencias')))).toEqual([PREFS]);
  });

  test('perfil corrompido (JSON inválido): padrões, sem erro na tela e valor guardado intacto', async ({ page, problemas }) => {
    const lixo = '{"versao":1,"paineis":{';
    await guardarBruto(page, lixo);
    await page.goto('/operacional?cadencia=sustentacao');
    await aguardar(page);
    await expect(page.getByTestId('metrica-S3')).toBeVisible();
    await expect(page.getByTestId('metrica-PV1')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Não foi possível abrir este painel' })).toHaveCount(0);
    expect(await lerPrefs(page)).toBe(lixo);
    expect(problemas.filter((p) => p.startsWith('pageerror'))).toEqual([]);
  });

  test('perfil de versão futura (versao 2): padrões, nada oculto e nada gravado, nem ao mudar uma preferência', async ({ page }) => {
    const futuro = JSON.stringify({ versao: 2, paineis: { sustentacao: { ocultar: ['s3'] } }, extra: { x: 1 } });
    await guardarBruto(page, futuro);
    await page.goto('/operacional?cadencia=sustentacao');
    await aguardar(page);
    await expect(page.getByTestId('metrica-S3')).toBeVisible();
    expect(await lerPrefs(page)).toBe(futuro);
    await page.goto('/preferencias');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.locator('[data-testid="grupo-sustentacao"]').getByRole('checkbox', { name: /^S5 / }).uncheck();
    expect(await lerPrefs(page), 'A6: versao maior que 1 não é sobrescrita').toBe(futuro);
  });

  test('perfil vazio e perfil com painel desconhecido não derrubam a tela', async ({ page }) => {
    await guardarBruto(page, JSON.stringify({ versao: 1, paineis: { inexistente: { ocultar: ['x9'] } }, atualizadoEm: '2026-10-10T00:00:00.000Z' }));
    await page.goto('/operacional?cadencia=sustentacao');
    await aguardar(page);
    await expect(page.getByTestId('metrica-S2')).toBeVisible();
  });
});

test.describe('CT-25 e CT-63: conteúdo do arquivo exportado', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  async function lerPdf(download: Download): Promise<string> {
    const pdf = await getDocument({ data: new Uint8Array(await readFile((await download.path())!)), useSystemFonts: true }).promise;
    const paginas: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) paginas.push((await (await pdf.getPage(i)).getTextContent()).items.map((x) => ('str' in x ? x.str : '')).join(' '));
    return paginas.join('\n');
  }
  async function baixar(page: Page): Promise<string> {
    const dlg = page.getByRole('dialog');
    await dlg.getByRole('button', { name: 'Gerar arquivo' }).click();
    const link = dlg.getByRole('link', { name: 'Baixar' });
    await expect(link).toBeVisible({ timeout: 30_000 });
    const [d] = await Promise.all([page.waitForEvent('download'), link.click()]);
    return lerPdf(d);
  }

  test('Sustentação: o PDF traz só o Acelerato, S2 sim e S3/PV1 ocultos não, sem pessoa', async ({ page, painel }) => {
    await page.addInitScript(([k, v]) => localStorage.setItem(k as string, v as string), [PREFS, perfil({ sustentacao: ['s3', 'pv1'] })]);
    await painel.ir('/operacional?cadencia=sustentacao&sust_prioridade=p1');
    await aguardar(page);
    await page.getByTestId('botao-exportar').click();
    const texto = await baixar(page);
    expect(texto).toContain('Fonte: Acelerato');
    expect(texto).not.toContain('Fonte: BusinessMap');
    expect(texto).toMatch(/S2 · /);
    expect(texto).not.toMatch(/S3 · /);
    expect(texto).not.toMatch(/PV1 · /);
    expect(texto).toContain('Prioridade');
    expect(texto).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
    expect(texto).not.toMatch(/usuarioKey|Pessoa \d+|ranking/i);
    expect(texto).toContain('O sistema não compara equipes nem avalia pessoas.');
  });

  test('Semanal: o PDF traz só o BusinessMap, sem nenhum código S*', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=semanal');
    await aguardar(page);
    await page.getByTestId('botao-exportar').click();
    const texto = await baixar(page);
    expect(texto).toContain('Fonte: BusinessMap');
    expect(texto).not.toContain('Fonte: Acelerato');
    expect(texto).not.toMatch(/\bS\d{1,2} · /);
  });

  test('Resumo: PDF de vários painéis com as duas fontes em seções separadas, sem tendência', async ({ page, painel }) => {
    await painel.ir('/operacional');
    await aguardarResumo(page);
    await page.getByTestId('botao-exportar-personalizada').click();
    const texto = await baixar(page);
    const bm = texto.indexOf('Fonte: BusinessMap');
    const ac = texto.indexOf('Fonte: Acelerato');
    expect(bm).toBeGreaterThanOrEqual(0);
    expect(ac).toBeGreaterThan(bm);
    expect(texto.indexOf('O3 · ')).toBeLessThan(ac);
    expect(texto.indexOf('S2 · ')).toBeGreaterThan(ac);
    expect(texto).not.toMatch(/TENDENCIA|Tendência mês a mês/i);
    expect(texto).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
  });
});

test.describe('CT-29 axe com Mais métricas aberto e com cartão oculto', () => {
  for (const largura of [375, 1280] as const) {
    test(`Sustentação e Semanal: Mais métricas aberto e marcador de oculto sem violações sérias (${largura} px)`, async ({ page, painel }) => {
      await page.setViewportSize({ width: largura, height: 900 });
      for (const url of ['/operacional?cadencia=sustentacao', '/operacional?cadencia=semanal']) {
        await painel.ir(url);
        await aguardar(page);
        await page.getByTestId('mais-metricas').locator('summary').click();
        await aguardar(page);
        const r = await rodarAxe(page);
        expect(r.bloqueantes, `${url} aberto @${largura}`).toEqual([]);
      }
    });

    test(`cartão oculto (marcador "Mostrar") sem violações sérias (${largura} px)`, async ({ page, painel }) => {
      await page.setViewportSize({ width: largura, height: 900 });
      await page.addInitScript(([k, v]) => localStorage.setItem(k as string, v as string), [PREFS, perfil({ sustentacao: ['s1', 's3', 'pv1'], operacional: ['o3'] })]);
      for (const [visao, url] of VISOES) {
        await painel.ir(url);
        if (visao === 'resumo') await aguardarResumo(page);
        else await aguardar(page);
        const r = await rodarAxe(page);
        expect(r.bloqueantes, `${visao} oculto @${largura}`).toEqual([]);
      }
      await painel.ir('/operacional?cadencia=sustentacao');
      await aguardar(page);
      await expect(page.getByTestId('metrica-S1')).toHaveCount(0);
      await expect(page.getByTestId('faixa-ocultas')).toContainText('3 métricas ocultas: S1, S3, PV1');
    });
  }
});

test.describe('CT-31 foco por hash e movimento reduzido', () => {
  for (const largura of [375, 1280] as const) {
    test(`chegada por #s2 deixa o foco visível e não encoberto pela barra fixa (2.4.11, ${largura} px)`, async ({ page }) => {
      await page.setViewportSize({ width: largura, height: 800 });
      await page.goto('/operacional?cadencia=sustentacao#s2');
      await expect(page.getByTestId('metrica-S2')).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.activeElement?.closest('[data-testid="metrica-S2"]') !== null)).toBe(true);
      await expect.poll(() => page.evaluate(() => {
        const a = document.activeElement as HTMLElement;
        const r = a.getBoundingClientRect();
        if (r.bottom <= 0 || r.top >= innerHeight) return 'fora da tela';
        // o ponto central do elemento focado pertence a ele (nada fixo por cima)
        const topo = document.elementFromPoint(r.left + Math.min(r.width, 40) / 2, Math.max(r.top, 0) + Math.min(r.height, 20) / 2);
        return topo !== null && (a === topo || a.contains(topo) || topo.contains(a)) ? 'visivel' : `encoberto por ${topo?.tagName}.${topo?.className}`;
      })).toBe('visivel');
    });
  }

  test('prefers-reduced-motion: rolagem do documento sem animação', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/operacional?cadencia=sustentacao#s2');
    await expect(page.getByTestId('metrica-S2')).toBeVisible();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
    const segundos = await page.evaluate(() => parseFloat(getComputedStyle(document.body).transitionDuration));
    expect(segundos).toBeLessThan(0.01);
  });
});

test.describe('CT-32 zoom de 200% e reflow', () => {
  // 200% de zoom em 1280 px = 640 px CSS; 400% = 320 px (reflow, 1.4.10)
  for (const largura of [640, 320] as const) {
    test(`sem rolagem horizontal nas quatro visões a ${largura} px CSS`, async ({ page, painel }) => {
      await page.setViewportSize({ width: largura, height: 900 });
      for (const [visao, url] of VISOES) {
        await painel.ir(url);
        if (visao === 'resumo') await aguardarResumo(page);
        else await aguardar(page);
        const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(sobra, `${visao} @${largura}`).toBeLessThanOrEqual(0);
      }
    });
  }

  test('fonte ampliada a 200% em 375 px: seletor em até 2 linhas, alvos de 44 px e cabe no recipiente', async ({ page, painel }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await painel.ir('/operacional?cadencia=sustentacao');
    await aguardar(page);
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    const rotulos = grupoVisao(page).locator('label');
    await expect(rotulos).toHaveCount(4);
    const caixas = await rotulos.evaluateAll((els) => els.map((e) => {
      const r = e.getBoundingClientRect();
      return { top: Math.round(r.top), h: r.height };
    }));
    expect(new Set(caixas.map((c) => c.top)).size, 'linhas do seletor com fonte 200%').toBeLessThanOrEqual(2);
    for (const c of caixas) expect(c.h).toBeGreaterThanOrEqual(43.5);
    // o seletor cabe no próprio recipiente (a largura da página inteira com fonte 200% depende do cabeçalho global: bug BUG-SNO-QA-01)
    const cabe = await grupoVisao(page).evaluate((g) => {
      const pai = g.parentElement!.getBoundingClientRect();
      return [...g.querySelectorAll('label')].every((l) => l.getBoundingClientRect().right <= pai.right + 0.5);
    });
    expect(cabe).toBe(true);
  });

  test('seletor a 375 px (fonte normal) cabe em até 2 linhas', async ({ page, painel }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await painel.ir('/operacional');
    const tops = await grupoVisao(page).locator('label').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(new Set(tops).size).toBeLessThanOrEqual(2);
  });
});

test.describe('CT-36 e CT-50 erro isolado', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('CT-36 mock=erro:s2 na Sustentação: só o S2 falha, com "Tentar de novo"; a seção e a visão ficam de pé', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=sustentacao', { mock: 'erro:s2' });
    await expect(page.getByTestId('recorte-sustentacao')).toBeVisible();
    await expect(page.locator('[data-testid="metrica-S2"]').getByRole('button', { name: 'Tentar de novo' })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('metrica-S1')).toBeVisible();
    await expect(page.locator('#prazos')).toBeAttached();
    await expect(page.getByTestId('metrica-S3')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Não foi possível abrir este painel' })).toHaveCount(0);
  });

  test('CT-50 mock=erro:o3 no Resumo: a série P85 não afirma "nenhum dos últimos 6 meses atinge 20 itens"; estado próprio com "Tentar de novo"', async ({ page, painel }) => {
    await painel.ir('/operacional', { mock: 'erro:o3' });
    await aguardar(page);
    const erro = page.getByTestId('tendencia-fluxo-p85-erro');
    await expect(erro).toBeVisible({ timeout: 30_000 });
    await expect(erro.getByRole('button', { name: 'Tentar de novo' })).toBeVisible();
    await expect(page.getByText(/nenhum dos últimos 6 meses atinge 20 itens/)).toHaveCount(0);
    await expect(page.getByTestId('tendencia-fluxo-p85-vazio')).toHaveCount(0);
    // a outra série do mesmo bloco e o bloco da Sustentação continuam
    await expect(page.getByTestId('tendencia-fluxo-concluidos')).toBeVisible();
    await expect(page.getByTestId('resumo-sustentacao')).toBeVisible();
    await expect(page.getByTestId('numero-s2-valor')).toBeVisible();
  });
});

test.describe('CT-51 gráficos e tabela alternativa do Resumo', () => {
  for (const largura of [375, 1280] as const) {
    test(`gráfico role=img com aria-label; tabela alternativa recolhida e alvos adequados (${largura} px)`, async ({ page, painel }) => {
      await page.setViewportSize({ width: largura, height: 900 });
      await painel.ir('/operacional');
      await aguardarResumo(page);
      const graficos = page.locator('[role="img"][data-testid$="-grafico"]');
      expect(await graficos.count(), 'gráficos do Resumo').toBeGreaterThanOrEqual(3);
      for (const label of await graficos.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') ?? ''))) expect(label.length).toBeGreaterThan(15);
      await expect(page.getByRole('table')).toHaveCount(0); // tabelas só quando a pessoa pede
      const botao = page.getByTestId('tendencia-fluxo-p85-alternar');
      const caixa = await botao.boundingBox();
      expect(caixa!.height).toBeGreaterThanOrEqual(largura === 375 ? 43.5 : 23.5);
      await botao.click();
      await expect(page.getByTestId('tendencia-fluxo-p85').getByRole('table')).toBeVisible();
      await expect(botao).toHaveAttribute('aria-pressed', 'true');
      const r = await rodarAxe(page);
      expect(r.bloqueantes).toEqual([]);
    });
  }
});

test.describe('CT-63, CT-64, CT-65 regras invioláveis na tela', () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  const PROIBIDO_PESSOA = [/[\w.+-]+@[\w-]+\.[\w.]+/, /usuarioKey/i, /Pessoa \d+/i, /respons[aá]vel/i, /\bassignee\b/i, /\branking\b/i, /\bmeta (por|individual|da pessoa)/i];
  const PROIBIDO_METRICA = [/produtividade individual/i, /velocidade em pontos/i, /story points?/i, /horas apontadas/i, /\b% de conclus[aã]o\b/i, /m[eé]dia (do )?tempo de ciclo/i];
  const COMPARACAO = [/\branking\b/i, /melhor equipe/i, /pior equipe/i, /equipes? (mais|menos) (r[aá]pid|produtiv)/i, /comparar (as )?equipes/i];

  test('nenhuma das quatro visões traz pessoa, ranking, comparação de equipes ou métrica proibida (varredura do DOM)', async ({ page, painel }) => {
    for (const [visao, url] of VISOES) {
      await painel.ir(url);
      if (visao === 'resumo') await aguardarResumo(page);
      else await aguardar(page);
      const mais = page.getByTestId('mais-metricas');
      if (await mais.count()) {
        await mais.locator('summary').click();
        await aguardar(page);
      }
      // frases que negam ("Não é um ranking", "nunca em ranking") são a própria regra escrita na tela: ficam fora
      const texto = (await page.locator('body').innerText()).split(/(?<=[.!?\n])/).filter((f) => !/\b(n[aã]o|nunca|sem)\b/i.test(f)).join(' ');
      expect(texto.length, `${visao}: texto lido`).toBeGreaterThan(500); // guarda contra varredura vazia
      for (const re of [...PROIBIDO_PESSOA, ...PROIBIDO_METRICA, ...COMPARACAO]) expect(texto, `${visao} ${re}`).not.toMatch(re);
    }
  });

  test('BM e Acelerato nunca se misturam no Resumo: sem total, sem soma e sem selo trocado; leia junto sem número', async ({ page, painel }) => {
    await painel.ir('/operacional');
    await aguardarResumo(page);
    const fluxo = page.getByTestId('resumo-fluxo');
    const sust = page.getByTestId('resumo-sustentacao');
    await expect(fluxo.getByText(/Fonte: Acelerato/)).toHaveCount(0);
    await expect(sust.getByText(/Fonte: BusinessMap/)).toHaveCount(0);
    for (const re of [/total geral/i, /\btotal combinado/i, /somados?/i, /ambas as fontes/i]) await expect(page.locator('main').getByText(re)).toHaveCount(0);
    // filtro de equipe da Sustentação nunca vira ordem de equipes: sem lista ordenada de equipes no Resumo
    expect(await page.locator('main table, main ol').filter({ hasText: /equipe/i }).count()).toBe(0);
    await painel.ir('/operacional?cadencia=semanal');
    await aguardar(page);
    const leia = await page.getByTestId('leia-junto-o15').innerText();
    expect(leia).toContain('Acelerato');
    expect(leia.replace(/O17|O15|\b12\b|visão|fonte/gi, '')).not.toMatch(/\d+[,.]?\d*\s*(%|dias|horas|itens|chamados)/i);
  });

  test('nenhuma chamada de rede de método diferente de GET parte da SPA ao abrir as quatro visões', async ({ page, painel }) => {
    const nao_get: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('/api/') && r.method() !== 'GET') nao_get.push(`${r.method()} ${r.url()}`);
    });
    for (const [, url] of VISOES) {
      await painel.ir(url);
      await aguardar(page);
    }
    expect(nao_get).toEqual([]);
  });
});

test.describe('CT-45 a CT-44 data de referência na tendência (mock)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('mês em curso fora do eixo: a série vai de abr a set/2026 e nunca traz out/2026', async ({ page, painel }) => {
    await painel.ir('/operacional');
    await aguardarResumo(page);
    await page.getByTestId('tendencia-fluxo-concluidos-alternar').click();
    const meses = await page.getByTestId('tendencia-fluxo-concluidos').getByRole('table').getByRole('rowheader').allInnerTexts();
    expect(meses.length).toBe(6);
    expect(meses).not.toContain('out/2026');
    expect(meses.at(-1)).toBe('set/2026');
  });
});
