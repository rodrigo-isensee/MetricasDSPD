import { readFile } from 'node:fs/promises';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { Download, Locator, Page } from '@playwright/test';
import { test, expect, rodarAxe } from '../fixtures/base';

/**
 * Testes SISTÊMICOS intensivos (QA, docs/qa/intensivo-sistemico.md): consistência entre telas, regras invioláveis
 * vistas pela interface e robustez (estados, navegação, recarga, tema, largura, axe). Dados: o mock do build.
 */

const ROTAS_TODAS = ['/', '/operacional?cadencia=diaria', '/operacional?cadencia=semanal', '/tatico', '/estrategico', '/operacional?cadencia=sustentacao', '/espera-invisivel', '/metricas', '/dados', '/preferencias', '/ajuda'] as const;
const PAINEIS = ['/operacional?cadencia=diaria', '/operacional?cadencia=semanal', '/tatico', '/estrategico', '/operacional?cadencia=sustentacao'] as const; // a página /espera-invisivel foi removida: só redireciona (coberta em espera-invisivel-nos-paineis.spec.ts)
const PESSOA = /Pessoa \d{2}|[\w.+-]+@[\w-]+\.[a-z]{2,}/;

const ROTAS_COM_CARTOES = /^\/(operacional|tatico|estrategico|sustentacao|espera-invisivel)(\?|#|$)/;

/**
 * Espera a rota ficar pronta. Nos painéis o conteúdo fica retido até o estado das fontes chegar (IR-001), então "nenhum
 * cartão ocupado" não basta: é preciso haver cartões e nenhum em carregando/atualizando. Na Visão geral, os indicadores.
 */
async function prontos(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const caminho = new URL(page.url()).pathname + new URL(page.url()).search;
  if (ROTAS_COM_CARTOES.test(caminho)) {
    await expect
      .poll(
        () =>
          page.locator('[data-testid^="metrica-"]').evaluateAll((els) =>
            els.length > 0 && els.every((e) => !['carregando', 'atualizando'].includes(e.getAttribute('data-estado') ?? '') && e.getAttribute('aria-busy') !== 'true'),
          ),
        { timeout: 30_000 },
      )
      .toBe(true);
  } else if (caminho === '/') {
    await expect(page.getByTestId('indicador-O2')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('ei-resumo-fl1')).toBeVisible({ timeout: 30_000 });
  }
  await expect(page.locator('[data-testid^="estado-carregando-"]')).toHaveCount(0, { timeout: 30_000 });
}

/** Abre todas as seções "Mais métricas deste painel" (details) para que os complementares rendam. */
async function abrirMaisMetricas(page: Page): Promise<void> {
  const fechados = page.locator('details:not([open]) > summary');
  for (let i = await fechados.count(); i > 0; i--) await fechados.first().click();
  await prontos(page);
}

const codigos = (page: Page): Promise<string[]> =>
  page.locator('[data-testid^="metrica-"]').evaluateAll((els) => els.map((e) => (e.getAttribute('data-testid') ?? '').replace(/^metrica-/, '')));

/* ======================================================================================== */
/* Consistência entre telas                                                                   */
/* ======================================================================================== */

test.describe('SIS-CONS consistência entre painéis, catálogo e exportação', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('SIS-CONS-01 catálogo: cada uma das 46 linhas leva a um cartão existente, com o mesmo código, nome e fonte', async ({ page }) => {
    test.setTimeout(400_000);
    await page.goto('/metricas');
    const linhas = page.locator('[data-testid="tabela-catalogo"] tbody tr, table tbody tr');
    await expect(linhas.first()).toBeVisible();
    const dados = await linhas.evaluateAll((trs) =>
      trs.map((tr) => {
        const td = [...tr.querySelectorAll('td,th')].map((c) => (c.textContent ?? '').trim());
        const a = tr.querySelector('a');
        return { codigo: td[0] ?? '', nome: td[1] ?? '', painel: td[2] ?? '', fonte: td[4] ?? '', gran: td[5] ?? '', href: a?.getAttribute('href') ?? '' };
      }),
    );
    expect(dados).toHaveLength(49);
    const problemas: string[] = [];
    for (const d of dados) {
      await page.goto(d.href);
      await prontos(page);
      const ancora = d.href.includes('#') ? d.href.split('#')[1]! : d.codigo.toLowerCase().replace('_', '-');
      if (!d.href.includes('#')) problemas.push(`${d.codigo}: "Ir ao painel" sem âncora do cartão (${d.href})`);
      // EI do catálogo = os quatro níveis; o primeiro (ei-fl1) representa a linha
      const alvo = page.locator(`[id="${ancora === 'ei' ? 'ei-fl1' : ancora}"]`);
      if ((await alvo.count()) === 0) { problemas.push(`${d.codigo}: o destino ${d.href} não tem o cartão #${ancora}`); continue; }
      await alvo.first().scrollIntoViewIfNeeded();
      await expect(alvo.first(), d.codigo).toBeVisible();
      const texto = (await alvo.first().innerText()).replace(/\s+/g, ' ');
      if (!texto.includes(d.codigo.replace('_', '-'))) problemas.push(`${d.codigo}: cartão #${ancora} não mostra o código`);
      if (!texto.toLowerCase().includes(d.nome.toLowerCase().slice(0, 18))) problemas.push(`${d.codigo}: nome "${d.nome}" ausente no cartão`);
      const outra = d.fonte.includes('Acelerato') ? 'BusinessMap' : d.fonte.includes('BusinessMap') ? 'Acelerato' : null;
      if (outra && texto.includes(`Fonte: ${outra}`)) problemas.push(`${d.codigo}: catálogo diz ${d.fonte}, cartão diz ${outra}`);
      const grans = [...new Set((await alvo.first().locator('span').filter({ hasText: /^Granularidade: / }).allInnerTexts()).map((g) => g.replace('Granularidade: ', '').trim()))];
      if (new Set(grans).size > 1) problemas.push(`${d.codigo}: cartão com mais de uma granularidade (${grans.join(', ')})`);
      if (grans.length && d.gran && !d.gran.toLowerCase().includes(grans[0]!)) problemas.push(`${d.codigo}: catálogo diz granularidade "${d.gran}", cartão diz "${grans[0]}"`);
    }
    expect(problemas).toEqual([]);
  });

  test('SIS-CONS-02 "Leia junto": todos os links dos quatro painéis levam ao cartão certo, visível', async ({ page }) => {
    test.setTimeout(300_000);
    const problemas: string[] = [];
    let total = 0;
    for (const rota of ['/operacional?cadencia=diaria', '/operacional?cadencia=semanal', '/tatico', '/estrategico', '/operacional?cadencia=sustentacao']) {
      await page.goto(rota);
      await prontos(page);
      const links = await page.locator('[data-testid^="leia-junto-"] a').evaluateAll((as) =>
        as.map((a) => ({ origem: a.closest('[data-testid^="leia-junto-"]')!.getAttribute('data-testid')!.replace('leia-junto-', ''), texto: (a.textContent ?? '').trim(), href: a.getAttribute('href') ?? '' })),
      );
      for (const l of links) {
        total++;
        await page.goto(rota);
        await prontos(page);
        await page.getByTestId(`leia-junto-${l.origem}`).getByRole('link', { name: l.texto }).click();
        const codigo = l.texto.split(' ')[0]!;
        const alvo = page.getByTestId(`metrica-${codigo}`);
        try {
          await expect(alvo, `${rota} ${l.origem} -> ${codigo}`).toBeVisible();
          await expect(alvo).toBeInViewport();
        } catch {
          problemas.push(`${rota}: ${l.origem} -> ${l.texto} (${l.href}) não mostra o cartão ${codigo}`);
        }
      }
    }
    expect(total).toBeGreaterThan(10);
    expect(problemas).toEqual([]);
  });

  test('SIS-CONS-03 Visão geral x origem: espera invisível do resumo = cartão de destino, no mesmo segmento (cliente, time, índice ou n de 20)', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/');
    await prontos(page);
    const problemas: string[] = [];
    for (const nivel of ['fl1', 'fl2', 'fl3', 'sust']) {
      await page.goto('/');
      await prontos(page);
      const linha = page.getByTestId(`ei-resumo-${nivel}`);
      const texto = (await linha.innerText()).replace(/\s+/g, ' ');
      const ok = texto.match(/: (?:([^:]+): )?cliente ([\d.,]+) .*?, time ([\d.,]+) .*?espera invisível ([\d.,]+ ?%) \(([\d.]+)/);
      const ins = texto.match(/Amostra insuficiente \(([\d.]+) de 20 [^,)]+(?:, no maior segmento: ([^)]+))?\)/);
      expect(ok ?? ins, texto).not.toBeNull();
      await linha.getByRole('link').click();
      await page.waitForURL(/\/(operacional|tatico|estrategico|sustentacao)/); // o resumo leva ao cartão no painel de origem
      await prontos(page);
      const cartao = page.getByTestId(`metrica-EI-${nivel.toUpperCase()}`);
      await expect(cartao).toBeVisible();
      const segmento = ok ? ok[1] : ins![2];
      if (segmento) {
        const aba = cartao.getByRole('tab', { name: new RegExp(`^${segmento.trim()}`) });
        if ((await aba.count()) === 0) { problemas.push(`EI-${nivel.toUpperCase()}: o cartão de destino não tem a aba "${segmento}" citada na Visão geral`); continue; }
        await aba.click();
        await expect(aba).toHaveAttribute('aria-selected', 'true');
        await prontos(page);
        if (ok) await expect(cartao.getByTestId(`leitura-EI-${nivel.toUpperCase()}`)).toContainText(`${segmento.trim()}:`);
      }
      const alvo = (await cartao.innerText()).replace(/\s+/g, ' ');
      const destino = page.url().replace(/^https?:\/\/[^/]+/, '');
      const esperados = ok ? [['cliente', ok[2]], ['time', ok[3]], ['índice', ok[4]!.replace(' ', '')], ['n', ok[5]]] : [['n de 20', `${ins![1]} de 20`]];
      for (const [rot, v] of esperados) if (!alvo.replace(/ %/g, '%').includes(v!)) problemas.push(`EI-${nivel.toUpperCase()}${segmento ? ` (${segmento})` : ''}: Visão geral mostra ${rot} ${v} e o cartão de destino (${destino}) não`);
    }
    expect(problemas).toEqual([]);
  });

  test('SIS-CONS-04 Visão geral x origem: indicadores de contagem (BLOQUEADOS, O2, T9, E3) batem com o cartão do painel', async ({ page }) => {
    await page.goto('/');
    await prontos(page);
    const ind = async (c: string) => (await page.getByTestId(`indicador-${c}`).innerText()).replace(/\s+/g, ' ');
    const vg = { BLOQUEADOS: await ind('BLOQUEADOS'), O2: await ind('O2'), T9: await ind('T9'), E3: await ind('E3') };
    const problemas: string[] = [];
    const casos: [keyof typeof vg, string][] = [['BLOQUEADOS', '/operacional?cadencia=diaria'], ['O2', '/operacional?cadencia=diaria'], ['E3', '/estrategico']];
    for (const [c, rota] of casos) {
      if (/insuficiente/i.test(vg[c])) continue;
      const n = vg[c].match(/^([\d.]+)(?: de ([\d.]+))?/);
      expect(n, vg[c]).not.toBeNull();
      await page.goto(rota);
      await prontos(page);
      const cartao = (await page.getByTestId(`metrica-${c}`).innerText()).replace(/\s+/g, ' ');
      for (const x of [n![1], n![2]].filter(Boolean)) if (!new RegExp(`(^|[^\\d.,])${x!.replace('.', '\\.')}([^\\d,]|$)`).test(cartao)) problemas.push(`${c}: Visão geral "${vg[c]}" e o cartão não mostra ${x}`);
    }
    // T9: "k de n projetos com escopo crescido" = linhas da tabela do cartão (n) e linhas com escopo > 0% (k)
    const t9 = vg.T9.match(/^([\d.]+) de ([\d.]+)/);
    if (t9) {
      await page.goto('/tatico');
      await prontos(page);
      const txt = (await page.getByTestId('metrica-T9').innerText()).replace(/\s+/g, ' ');
      const linhas = [...txt.matchAll(/Escopo cresceu (\d+)%/g)].map((m) => Number(m[1]));
      if (String(linhas.length) !== t9[2]) problemas.push(`T9: Visão geral fala em ${t9[2]} projetos e o cartão lista ${linhas.length}`);
      if (String(linhas.filter((x) => x > 0).length) !== t9[1]) problemas.push(`T9: Visão geral fala em ${t9[1]} com escopo crescido e o cartão mostra ${linhas.filter((x) => x > 0).length}`);
    }
    expect(problemas).toEqual([]);
  });

  test('SIS-CONS-05 PDF x tela: a base de cada cartão exportado é a mesma da tela, em cada painel', async ({ page }) => {
    test.setTimeout(180_000);
    const problemas: string[] = [];
    for (const rota of ['/operacional?cadencia=semanal', '/tatico', '/estrategico', '/operacional?cadencia=sustentacao', '/espera-invisivel']) {
      await page.goto(rota);
      await prontos(page);
      const bases = await page.locator('[data-testid^="base-"]').evaluateAll((els) =>
        els.map((e) => ({ codigo: (e.getAttribute('data-testid') ?? '').replace('base-', ''), texto: (e.textContent ?? '').replace(/\s+/g, ' ').trim() })),
      );
      await page.getByRole('button', { name: 'Exportar', exact: true }).click();
      const dlg = page.getByRole('dialog');
      await dlg.getByRole('button', { name: 'Gerar arquivo' }).click();
      const baixar = dlg.getByRole('link', { name: 'Baixar' });
      await expect(baixar).toBeVisible({ timeout: 30_000 });
      const [download] = await Promise.all([page.waitForEvent('download'), baixar.click()]);
      const pdf = (await lerPdf(download)).replace(/\s+/g, ' ');
      expect(pdf).not.toMatch(PESSOA);
      for (const b of bases) {
        const numeros = b.texto.match(/\d[\d.]*/g) ?? [];
        if (!pdf.includes(`${b.codigo.replace('-', '_')} `) && !pdf.includes(`${b.codigo} `)) continue; // cartão fora do PDF (limite de 12)
        const bloco = trechoDoBloco(pdf, b.codigo);
        for (const n of numeros) if (!bloco.includes(n)) problemas.push(`${rota} ${b.codigo}: tela "${b.texto}" e o PDF não traz ${n}`);
      }
      await page.keyboard.press('Escape');
    }
    expect(problemas).toEqual([]);
  });

  test('SIS-CONS-06 mudança de critério (T2.6): aviso só nos cartões afetados e só com a data da própria fonte', async ({ page }) => {
    test.setTimeout(300_000);
    const FLUXO = new Set(['O7', 'O9', 'O10', 'T1', 'EI-FL1', 'EI-FL2', 'EI-FL3']);
    const SUST = new Set(['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'EI-SUST']);
    const problemas: string[] = [];
    const comAviso = new Set<string>();
    for (const rota of ['/operacional?cadencia=semanal&periodo=12m', '/tatico?periodo=12m', '/estrategico?periodo=12m', '/operacional?cadencia=sustentacao&periodo=12m', '/espera-invisivel?periodo=12m&sust_periodo=12m']) {
      await page.goto(rota);
      await prontos(page);
      await abrirMaisMetricas(page);
      for (const c of await codigos(page)) {
        const avisos = page.getByTestId(`metrica-${c}`).getByTestId('aviso-criterio');
        const n = await avisos.count();
        if (n === 0) continue;
        comAviso.add(c);
        const t = (await avisos.allInnerTexts()).join(' ');
        if (c === 'PV1') { if (/02\/03\/2026|01\/06\/2026/.test(t)) problemas.push(`${rota} PV1: pesquisa com critério do BusinessMap ou do Acelerato`); continue; }
        if (!FLUXO.has(c) && !SUST.has(c)) problemas.push(`${rota} ${c}: aviso de critério em métrica não afetada`);
        if (FLUXO.has(c) && /01\/06\/2026/.test(t)) problemas.push(`${rota} ${c}: métrica do BusinessMap com critério do Acelerato`);
        if (SUST.has(c) && /02\/03\/2026/.test(t)) problemas.push(`${rota} ${c}: métrica do Acelerato com critério do BusinessMap`);
      }
    }
    // Em 12 meses toda série afetada atravessa a mudança: a marcação tem de aparecer.
    for (const c of [...FLUXO, ...SUST]) if (!comAviso.has(c)) problemas.push(`${c}: afetada pela mudança de critério e sem aviso em 12 meses`);
    // Em 4 semanas nenhuma série nem janela de 12 semanas cruza março ou junho: nenhum aviso.
    for (const rota of ['/operacional?cadencia=semanal&periodo=4s', '/tatico?periodo=4s', '/operacional?cadencia=sustentacao&periodo=4s']) {
      await page.goto(rota);
      await prontos(page);
      const donos = await page.getByTestId('aviso-criterio').evaluateAll((els) => els.map((e) => e.closest('[data-testid^="metrica-"]')?.getAttribute('data-testid') ?? 'fora'));
      const indevidos = donos.filter((d) => d !== 'metrica-PV1');
      if (indevidos.length > 0) problemas.push(`${rota}: avisos de critério com período que não cruza mudança em ${indevidos.join(', ')}`);
    }
    expect(problemas).toEqual([]);
  });
});

async function lerPdf(download: Download): Promise<string> {
  const pdf = await getDocument({ data: new Uint8Array(await readFile(await download.path())), useSystemFonts: true }).promise;
  const paginas: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const c = await (await pdf.getPage(i)).getTextContent();
    paginas.push(c.items.map((x) => ('str' in x ? x.str : '')).join(' '));
  }
  return paginas.join('\n');
}

/** Trecho do PDF do bloco de uma métrica: do título ("O3 · ") até o próximo título. */
function trechoDoBloco(pdf: string, codigo: string): string {
  const i = pdf.search(new RegExp(`${codigo.replace('-', '[-_]')} · `));
  if (i < 0) return '';
  const resto = pdf.slice(i + 3);
  const fim = resto.search(/(?:^| )(?:[OTES]\d{1,2}|BLOQUEADOS|EI[-_](?:FL[123]|SUST)) · /);
  return fim < 0 ? resto : resto.slice(0, fim);
}

/* ======================================================================================== */
/* Regras invioláveis vistas pela interface                                                   */
/* ======================================================================================== */

test.describe('SIS-INV regras invioláveis na interface', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('SIS-INV-01 nenhuma tela, tabela ou nota expõe pessoa (todas as rotas, complementares abertos, tabelas ligadas)', async ({ page }) => {
    test.setTimeout(180_000);
    const achados: string[] = [];
    for (const rota of ROTAS_TODAS) {
      await page.goto(rota);
      await prontos(page);
      await abrirMaisMetricas(page);
      const tabelas = page.getByRole('button', { name: /Ver (como|dados em) tabela/ });
      for (let i = 0; i < (await tabelas.count()); i++) await tabelas.nth(i).click();
      const notas = page.getByRole('button', { name: 'Como ler e como é calculado' });
      for (let i = 0; i < (await notas.count()); i++) await notas.nth(i).click();
      const texto = await page.locator('body').innerText();
      const m = texto.match(PESSOA);
      if (m) achados.push(`${rota}: "${m[0]}"`);
      const ths = await page.locator('th').allInnerTexts();
      // "Falta de treinamento do usuário" é uma categoria de origem (T5), não uma pessoa
      for (const th of ths) if (/respons|analista|atendente|pessoa|usu[aá]rio|assignee|agente|autor/i.test(th.replace('Falta de treinamento do usuário', ''))) achados.push(`${rota}: coluna "${th}"`);
    }
    expect(achados).toEqual([]);
  });

  test('SIS-INV-02 regra dos 20: recorte estreito; todo cartão insuficiente diz "n de 20" e nenhum mostra percentil', async ({ page }) => {
    test.setTimeout(120_000);
    const problemas: string[] = [];
    let insuficientes = 0;
    for (const rota of ['/operacional?cadencia=semanal&periodo=4s&tipo=divida-tecnica', '/tatico?periodo=4s&tipo=divida-tecnica', '/estrategico?periodo=6m', '/operacional?cadencia=sustentacao&periodo=4s&prioridade=p1', '/espera-invisivel?periodo=4s&tipo=divida-tecnica&sust_periodo=4s&sust_prioridade=p1']) {
      await page.goto(rota);
      await prontos(page);
      await abrirMaisMetricas(page);
      const blocos = page.locator('[data-testid^="amostra-insuficiente-"]');
      const n = await blocos.count();
      insuficientes += n;
      for (let i = 0; i < n; i++) {
        const b = blocos.nth(i);
        const t = (await b.innerText()).replace(/\s+/g, ' ');
        const id = await b.getAttribute('data-testid');
        if (!/\d+ de 20/.test(t)) problemas.push(`${rota} ${id}: sem "n de 20"`);
        const m = t.match(/(\d+) de 20/);
        if (m && Number(m[1]) >= 20) problemas.push(`${rota} ${id}: insuficiente com ${m[1]}`);
      }
      for (const c of await codigos(page)) {
        const cartao = page.getByTestId(`metrica-${c}`);
        if ((await cartao.getAttribute('data-estado')) !== 'insuficiente') continue;
        const t = (await cartao.innerText()).replace(/\s+/g, ' ');
        if (/P(50|85|95):? ?[\d,]+/.test(t)) problemas.push(`${rota} ${c}: cartão insuficiente publica percentil ("${t.match(/P(50|85|95):? ?[\d,]+/)![0]}")`);
      }
    }
    expect(insuficientes, 'o recorte estreito deveria produzir amostras insuficientes').toBeGreaterThan(0);
    expect(problemas).toEqual([]);
  });

  test('SIS-INV-03 BusinessMap x Acelerato: cada painel mostra só a sua fonte; filtro do fluxo não muda a Sustentação', async ({ page }) => {
    const problemas: string[] = [];
    for (const [rota, fonte, outra] of [['/operacional?cadencia=semanal', 'BusinessMap', 'Acelerato'], ['/tatico', 'BusinessMap', 'Acelerato'], ['/estrategico', 'BusinessMap', 'Acelerato'], ['/operacional?cadencia=sustentacao', 'Acelerato', 'BusinessMap']] as const) {
      await page.goto(rota);
      await prontos(page);
      await abrirMaisMetricas(page);
      for (const c of await codigos(page)) {
        const t = await page.getByTestId(`metrica-${c}`).innerText();
        if (t.includes(`Fonte: ${outra}`)) problemas.push(`${rota} ${c}: Fonte ${outra} num painel de ${fonte}`);
      }
    }
    // Espera invisível: o bloco da Sustentação ignora os filtros do fluxo (números e texto do cartão)
    const numeros = (t: string) => (t.match(/\d[\d.,]*/g) ?? []).join(' ');
    await page.goto('/espera-invisivel#ei-sust'); // a página antiga redireciona: o EI-SUST vive na Sustentação
    await prontos(page);
    const antes = await page.getByTestId('metrica-EI-SUST').innerText();
    await page.goto('/espera-invisivel?periodo=4s&tipo=divida-tecnica&sistema=protheus#ei-sust');
    await prontos(page);
    const depois = await page.getByTestId('metrica-EI-SUST').innerText();
    const semChips = (t: string) => t.split('\n').filter((l) => !/Filtros aplicados|Remover filtro|Para chegar a 20|sem filtros/.test(l)).join('\n');
    expect(numeros(semChips(depois)), 'números do EI-SUST mudaram com filtro do fluxo').toBe(numeros(semChips(antes)));
    for (const termo of ['Tipo de demanda', 'Sistema', 'Dívida técnica', 'Últimas 4 semanas'])
      if (depois.includes(termo)) problemas.push(`EI-SUST (Acelerato) mostra o filtro do fluxo "${termo}" como aplicado ou sugere removê-lo`);
    expect(problemas).toEqual([]);
  });
});

/* ======================================================================================== */
/* Robustez                                                                                   */
/* ======================================================================================== */

test.describe('SIS-ROB robustez', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  for (const rota of PAINEIS) {
    test(`SIS-ROB-01 ${rota}: ?mock=carregando, vazio e erro mostram o estado certo em todos os cartões`, async ({ page, problemas }) => {
      const sep = rota.includes('?') ? '&' : '?';
      await page.goto(`${rota}${sep}mock=carregando`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const cartoes = page.locator('[data-testid^="metrica-"]');
      await expect(cartoes.first()).toBeVisible();
      const n = await cartoes.count();
      await expect(page.locator('[data-testid^="metrica-"][aria-busy="true"]')).toHaveCount(n);

      await page.goto(`${rota}${sep}mock=vazio`);
      await prontos(page);
      for (const c of await codigos(page)) {
        const e = await page.getByTestId(`metrica-${c}`).getAttribute('data-estado');
        expect(['vazio', 'pronto', 'ok'], `${c} em mock=vazio: ${e}`).toContain(e);
        const listaVazia = c === 'BLOQUEADOS' && (await page.getByTestId('metrica-BLOQUEADOS').innerText()).includes('Nenhum item bloqueado');
        expect(e === 'vazio' || c === 'PV1' || listaVazia, `${c} em mock=vazio ficou ${e}`).toBe(true);
      }

      await page.goto(`${rota}${sep}mock=erro`);
      await expect(page.getByRole('heading', { name: 'Não foi possível abrir este painel' })).toBeVisible();
      await expect(page.getByRole('navigation').first()).toBeVisible();
      expect(problemas.filter((p) => !/Erro simulado|MOCK_ERRO_SIMULADO/.test(p))).toEqual([]);
    });

    test(`SIS-ROB-02 ${rota}: ?mock=erro:<id> derruba só o cartão indicado, para cada cartão`, async ({ page }) => {
      test.setTimeout(180_000);
      await page.goto(rota);
      await prontos(page);
      const todos = await codigos(page);
      const sep = rota.includes('?') ? '&' : '?';
      const falhas: string[] = [];
      for (const c of todos) {
        await page.goto(`${rota}${sep}mock=erro:${c.toLowerCase()}`);
        await prontos(page);
        if ((await page.getByTestId(`metrica-${c}`).getAttribute('data-estado')) !== 'erro') falhas.push(`${c}: não ficou em erro`);
        const outros = await page.locator('[data-testid^="metrica-"][data-estado="erro"]').count();
        if (outros !== 1) falhas.push(`${c}: ${outros} cartões em erro`);
      }
      expect(falhas).toEqual([]);
    });
  }

  test('SIS-ROB-03 navegação rápida: 4 voltas pelos 8 destinos sem esperar carregar; termina íntegro e sem erro de página', async ({ page, problemas }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Navegação principal' }).first();
    await expect(nav.getByRole('link').first()).toBeVisible();
    const destinos = await nav.getByRole('link').evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? '').filter((h) => h.startsWith('/')));
    expect(destinos.length).toBeGreaterThanOrEqual(7);
    for (let volta = 0; volta < 4; volta++) for (const d of destinos) await nav.locator(`a[href="${d}"]`).first().click({ noWaitAfter: true });
    await expect(page).toHaveURL(new RegExp(`${destinos.at(-1)!.replace('?', '\\?')}$`));
    await prontos(page);
    await page.goto('/operacional?cadencia=semanal');
    await prontos(page);
    expect(await page.locator('[data-estado="erro"]').count()).toBe(0);
    expect(problemas).toEqual([]);
  });

  test('SIS-ROB-04 recarregar no meio do carregamento, em cada painel, termina pronto e sem erro', async ({ page, problemas }) => {
    for (const rota of PAINEIS) {
      // recarrega com o app já montado e os cartões ainda buscando dados (latência simulada de 150 a 400 ms);
      // recarregar durante o "commit" da navegação esbarra no CDP ("Not attached to an active page"), não no app
      await page.goto(rota, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-testid^="metrica-"]').first()).toBeAttached();
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.reload();
      await prontos(page);
      expect(await page.locator('[data-estado="erro"]').count(), rota).toBe(0);
    }
    expect(problemas).toEqual([]);
  });

  test('SIS-ROB-05 voltar e avançar no histórico preserva filtros e conteúdo', async ({ page }) => {
    await page.goto('/operacional?cadencia=semanal&periodo=4s');
    await prontos(page);
    const base4s = await page.getByTestId('base-O3').innerText();
    await page.goto('/operacional?cadencia=sustentacao');
    await prontos(page);
    await page.goBack();
    await prontos(page);
    expect(page.url()).toContain('periodo=4s');
    expect(await page.getByTestId('base-O3').innerText()).toBe(base4s);
    await page.goForward();
    await prontos(page);
    await expect(page.getByTestId('metrica-S1')).toBeVisible();
  });
});

test.describe('SIS-VIS tema, largura e acessibilidade em todas as rotas', () => {
  for (const tema of ['light', 'dark'] as const) {
    for (const vp of [{ width: 375, height: 812 }, { width: 1280, height: 800 }]) {
      test.describe(`${tema} ${vp.width}`, () => {
        test.use({ colorScheme: tema, viewport: vp });
        for (const rota of ROTAS_TODAS) {
          test(`SIS-VIS ${tema} ${vp.width} ${rota}: sem rolagem horizontal e axe sem violação séria ou crítica`, async ({ page, problemas }) => {
            await page.addInitScript((t) => localStorage.setItem('metricas-dspd:tema', t === 'dark' ? 'escuro' : 'claro'), tema);
            await page.goto(rota);
            await prontos(page);
            await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
            const rola = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
            expect(rola, `${rota} rola ${rola}px na horizontal`).toBeLessThanOrEqual(0);
            const axe = await rodarAxe(page);
            expect(axe.bloqueantes, JSON.stringify(axe.bloqueantes)).toEqual([]);
            expect(problemas).toEqual([]);
          });
        }
      });
    }
  }
});

export type { Locator };
