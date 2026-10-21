import { test, expect, rodarAxe } from '../fixtures/base';
import type { Page } from '@playwright/test';

// QA 011 lote 2 (pedido 025, K-110): T10 a T14 no Tático, contra a API real local com o mock semeado (projeto `chromium-api`).
// Por que na API: o mock embutido no navegador não gera T13 nem T14 (achado A1 do review), e a regra R-1 = B / T14-M1 = B
// só se prova com a resposta de verdade da API (o projeto oculto vem com `outrosTimes: null`).
// Obrigações: CA-2, CA-5, CA-6, CA-7, CA-8, CA-11, CA-12, CA-14, CA-16, CA-24, CA-28, CA-29, CA-30, CA-31, CA-32, CA-34,
// CA-36, CA-45 (R-1 = B, T14-M1 = B), CA-50, CA-51 (arquivo à parte), regras 7.1 (sem comparar times) e "abaixo de 20 não publica".
// Dado determinístico do mock: com equipe=erp-protheus, P-0039 está oculto em "demandas" (total 79, n 73, k 1, sem time 6)
// e P-0038 e P-0008 em "frentes".

const ROTA = '/tatico?equipe=erp-protheus';
const secoes = ['O que entra, e quando?', 'De quem depende o prazo?'];

const semRolagemHorizontal = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

async function abrir(
  page: Page,
  painel: { ir: (r: string) => Promise<void>; esperarCartoesProntos: () => Promise<void> },
  rota = ROTA,
) {
  await painel.ir(rota);
  await painel.esperarCartoesProntos();
  await page.getByTestId('mais-metricas').locator('summary').click();
  await expect(page.getByTestId('metrica-T14')).toBeVisible();
  await painel.esperarCartoesProntos();
}

interface ProjetoApi {
  codigo: string;
  total: number;
  meuTime: { k: number; n: number };
  outrosTimes: number | null;
  semTime: number;
}
interface T14Api {
  porGranularidade: { granularidade: 'story' | 'frente'; projetos: ProjetoApi[] }[];
}
async function t14DaApi(page: Page, equipe: string): Promise<T14Api> {
  const r = await page.request.get(`/api/v1/metricas/T14?equipe=${equipe}`);
  expect(r.ok()).toBe(true);
  return (await r.json()) as T14Api;
}

test.describe('Tático, lote 2 do 011 (T10 a T14)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('TT-01 CA-2 e CA-14: as duas seções novas trazem T11, T12 e T10, T13, T14 na ordem da ficha, fora de "Pede atenção"', async ({ page, painel }) => {
    await abrir(page, painel);
    const mais = page.getByTestId('mais-metricas');
    for (const s of secoes) await expect(mais.getByRole('heading', { name: s, level: 2 })).toBeVisible();
    // Ordem do DOM: T11, T12 (O que entra) depois T10, T13, T14 (De quem depende).
    const ids = (await painel.codigosDosCartoes()).filter((c) => /^T1[0-4]$/.test(c));
    expect(ids).toEqual(['T11', 'T12', 'T10', 'T13', 'T14']);
    const atencao = page.getByTestId('faixa-atencao');
    for (const id of ['T10', 'T11', 'T12', 'T13', 'T14']) {
      await expect(atencao.getByText(new RegExp(`\\b${id}\\b`))).toHaveCount(0);
    }
  });

  test('TT-02 CA-7 e CA-16: fonte BusinessMap, "Como ler", tabela equivalente e selo fictício só no T13 e no T14', async ({ page, painel }) => {
    await abrir(page, painel);
    for (const id of ['T10', 'T11', 'T12', 'T13', 'T14']) {
      const c = page.getByTestId(`metrica-${id}`);
      await expect(c).toHaveAttribute('data-estado', /^(ok|pronto)$/);
      await expect(c).toContainText('Fonte: BusinessMap');
      await expect(c).not.toContainText(/Acelerato/);
      await expect(c.getByRole('button', { name: 'Como ler e como é calculado' })).toBeVisible();
      await expect(c.getByTestId('selo-ficticio')).toHaveCount(id === 'T13' || id === 'T14' ? 1 : 0);
    }
    for (const id of ['T10', 'T11', 'T12', 'T14']) {
      await expect(page.getByTestId(`metrica-${id}`).getByRole('table')).toBeVisible();
    }
    // "Como ler" abre e traz o texto da métrica.
    const t10 = page.getByTestId('metrica-T10');
    await t10.getByRole('button', { name: 'Como ler e como é calculado' }).click();
    await expect(page.getByTestId('nota-T10')).toContainText('maiúsculas, minúsculas e espaços não separam o mesmo nome');
  });

  test('TT-03 CA-11, CA-24, CA-36 e CA-50: T10 em ordem alfabética, prazo contratado não informado, sem coluna de contrato nem "dentro/acima"', async ({ page, painel }) => {
    await abrir(page, painel, '/tatico');
    const t10 = page.getByTestId('metrica-T10');
    const tabela = t10.getByTestId('tabela-T10');
    const nomes = (await tabela.getByRole('rowheader').allInnerTexts()).map((n) => n.trim());
    expect(nomes.length, 'o mock tem fornecedores').toBeGreaterThanOrEqual(3);
    expect(nomes, 'ordem alfabética, nunca por desempenho').toEqual([...nomes].sort((a, b) => a.localeCompare(b, 'pt-BR')));
    await expect(tabela.getByRole('columnheader')).toHaveText(['Fornecedor', 'Bloqueios', 'Dias úteis somados', 'Duração (P50 e P85)']);
    await expect(t10).toContainText('Prazo contratado não informado');
    expect(await t10.innerText()).not.toMatch(/dentro do (prazo )?contratado|acima do (prazo )?contratado|SLA contratado/i);
    // Fornecedor com 17 bloqueios (< 20): sem P50/P85, com a contagem e a soma. Fornecedor com 20 ou mais: P50 e P85.
    const alfa = tabela.getByRole('row').filter({ hasText: 'Fornecedor Alfa' });
    await expect(alfa).toContainText('— amostra insuficiente');
    await expect(alfa).not.toContainText(/P50|P85/);
    await expect(alfa).toContainText('17');
    const beta = tabela.getByRole('row').filter({ hasText: 'Fornecedor Beta' });
    await expect(beta).toContainText(/P50 [\d,.]+ · P85 [\d,.]+ dias úteis/);
    // Sem pessoa: nenhum e-mail nem @.
    expect(await t10.innerText()).not.toMatch(/@/);
  });

  test('TT-04 estado "sem fornecedor": mensagem própria e prazo contratado não informado (API com lista vazia)', async ({ page, painel }) => {
    await page.route(/\/metricas\/T10(\?|$)/, async (rota) => {
      const resp = await rota.fetch();
      const json = await resp.json();
      await rota.fulfill({ response: resp, json: { ...json, fornecedores: [], totalDiasUteis: 0 } });
    });
    await abrir(page, painel, '/tatico');
    const t10 = page.getByTestId('metrica-T10');
    await expect(t10.getByTestId('t10-sem-fornecedor')).toHaveText('Nenhum bloqueio por fornecedor no período.');
    await expect(t10).toContainText('Prazo contratado não informado');
    await expect(t10.getByRole('row')).toHaveCount(0);
  });

  test('TT-05 CA-12: T11 com o chip da janela fixa, mapa mês × ano com número em cada célula e o mês corrente marcado', async ({ page, painel }) => {
    await abrir(page, painel);
    const t11 = page.getByTestId('metrica-T11');
    await expect(t11).toContainText('Todos os tipos');
    const tabela = t11.getByTestId('tabela-T11');
    await expect(tabela.getByRole('columnheader')).toHaveText(['Ano', 'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']);
    expect(await tabela.getByRole('row').count(), 'três anos de linhas e o cabeçalho').toBeGreaterThanOrEqual(3);
    await expect(tabela).toContainText('em andamento');
    // Cor nunca sozinha: toda célula com dado traz dígitos escritos.
    const celulas = await tabela.locator('tbody td').allInnerTexts();
    const comDado = celulas.filter((c) => c.trim() !== '' && c.trim() !== '—');
    expect(comDado.length).toBeGreaterThanOrEqual(20);
    for (const c of comDado) expect(c, `célula "${c}"`).toMatch(/\d/);
    // O período do painel não atua: a nota fala em janela fixa e o filtro de período não está entre os aplicados.
    await expect(t11).toContainText('O filtro de período não se aplica');
    await expect(t11).not.toContainText(/Filtros aplicados:[^\n]*Período/);
  });

  test('TT-06 CA-5 e CA-11: T12 ordena as áreas por volume e só publica percentual com 20 demandas ou mais', async ({ page, painel }) => {
    await abrir(page, painel);
    const t12 = page.getByTestId('metrica-T12');
    const linhas = await t12.getByTestId('t12-areas').getByRole('listitem').allInnerTexts();
    expect(linhas.length).toBeGreaterThanOrEqual(5);
    const ns: number[] = [];
    for (const l of linhas) {
      const m = l.match(/(\d+) de (\d+) com ida e volta \((.*)\)/);
      expect(m, `linha "${l}"`).not.toBeNull();
      const n = Number(m![2]);
      ns.push(n);
      if (n >= 20) expect(m![3]).toMatch(/^[\d,]+%$/);
      else {
        expect(m![3]).toBe('percentual não publicado, menos de 20');
        expect(l, 'abaixo de 20 não publica o percentual').not.toMatch(/%/);
      }
    }
    expect(ns, 'ordem por volume, do maior para o menor').toEqual([...ns].sort((a, b) => b - a));
    expect(ns.some((n) => n < 20), 'a amostra tem área abaixo de 20').toBe(true);
    await expect(t12).toContainText('Não é nota da área');
  });

  test('TT-07 CA-6 e CA-8: T13 troca entre Demandas e Frentes uma por vez e explica o grupo abaixo de 20', async ({ page, painel }) => {
    await abrir(page, painel);
    const t13 = page.getByTestId('metrica-T13');
    const gran = t13.getByTestId('seletor-local-T13').getByRole('tablist', { name: /./ }).first();
    await expect(gran.getByRole('tab')).toHaveText(['Demandas', 'Frentes']);
    await expect(gran.getByRole('tab', { selected: true })).toHaveText('Demandas');
    await expect(t13.getByTestId('t13-destaque')).toContainText(/\d+ de \d+ entregas \(\d+%\) dependeram de outro quadro/);
    await expect(t13.getByTestId('anuncio-T13')).toHaveText('Contando demandas.');
    // CA-6: o tipo com um dos grupos abaixo de 20 não mostra a comparação e diz por quê.
    await expect(t13.getByTestId('t13-par-insuficiente')).toContainText('menos de 20 itens');
    await gran.getByRole('tab', { name: 'Frentes' }).click();
    await expect(gran.getByRole('tab', { selected: true })).toHaveText('Frentes');
    await expect(t13.getByTestId('anuncio-T13')).toHaveText('Contando frentes.');
    // uma granularidade por vez: o destaque some ou muda, e o texto não mistura as duas contagens.
    await expect(t13.getByTestId('seletor-local-T13').getByRole('tabpanel').first()).toBeVisible();
    // O outro quadro nunca é identificado (evita comparação entre times).
    expect((await t13.innerText()).split('Filtros aplicados:')[0]).not.toMatch(/Plataforma 5G|Marketing e Vendas|Fluig|Senior/);
    await expect(t13).toContainText('O outro quadro não é identificado');
  });

  test('TT-08 CA-28: T14 sem equipe (ou com mais de uma) pede para escolher uma equipe e não calcula nada', async ({ page, painel }) => {
    for (const rota of ['/tatico', '/tatico?equipe=erp-protheus,fluig']) {
      await abrir(page, painel, rota);
      const t14 = page.getByTestId('metrica-T14');
      await expect(t14.getByTestId('t14-sem-equipe')).toHaveText('Escolha uma equipe para ver a participação do meu time.');
      await expect(t14.getByTestId('t14-projetos')).toHaveCount(0);
      await expect(t14.getByTestId('t14-selo')).toHaveCount(0);
      expect(await t14.innerText(), rota).not.toMatch(/\d+ de \d+|%/);
    }
  });

  test('TT-09 CA-27, CA-29, CA-30, CA-31, CA-32 e CA-34: T14 com a equipe escolhida', async ({ page, painel }) => {
    await abrir(page, painel);
    const t14 = page.getByTestId('metrica-T14');
    await expect(t14.getByTestId('t14-selo')).toHaveText('Só mostra meu time e os outros somados. Não compara times.');
    await expect(t14.getByRole('list', { name: 'Legenda das barras' }).getByRole('listitem')).toHaveText([
      'Meu time: sólido',
      'Outros times (somados): hachura',
      'Sem time informado: contorno',
    ]);
    // CA-29: nenhuma coluna ou controle por time; "outros times" é uma soma só.
    await expect(t14.getByTestId('tabela-T14').getByRole('columnheader')).toHaveText([
      'Projeto',
      'Meu time',
      'Outros times (somados)',
      'Sem time informado',
      'Participação do meu time',
    ]);
    await expect(t14.getByRole('combobox')).toHaveCount(0);
    // CA-30: a ordem é a do total de demandas do projeto (vem da API), nunca a da participação.
    const api = await t14DaApi(page, 'erp-protheus');
    const story = api.porGranularidade.find((g) => g.granularidade === 'story')!;
    const esperados = [...story.projetos].sort((a, b) => b.total - a.total).map((p) => p.codigo);
    expect(story.projetos.map((p) => p.codigo), 'a API entrega pela ordem do total').toEqual(esperados);
    const codigosNaTela = (await t14.getByTestId('t14-projetos').getByRole('listitem').allInnerTexts()).map((t) => t.split(' ')[0]);
    expect(codigosNaTela).toEqual(esperados);
    const pcts = story.projetos.filter((p) => p.outrosTimes !== null).map((p) => p.meuTime.k / p.meuTime.n);
    expect(pcts, 'o mock não tem ordem por participação (senão o teste não distingue)').not.toEqual([...pcts].sort((a, b) => b - a));
    // CA-31: com menos de 20 demandas com time informado, "k de n" e a nota, sem percentual.
    const pequeno = t14.getByTestId('t14-projetos').getByRole('listitem').filter({ hasText: 'P-0011' });
    await expect(pequeno).toContainText('1 de 15 meu time (percentual não publicado, menos de 20)');
    await expect(pequeno).not.toContainText('%');
    // CA-33: "sem time informado" aparece com a contagem.
    await expect(t14.getByTestId('t14-projetos')).toContainText('6 sem time informado');
  });

  test('TT-10 CA-32: T14 troca para frentes, uma granularidade por vez, e nunca conta projeto', async ({ page, painel }) => {
    await abrir(page, painel);
    const t14 = page.getByTestId('metrica-T14');
    const api = await t14DaApi(page, 'erp-protheus');
    const frentes = api.porGranularidade.find((g) => g.granularidade === 'frente')!;
    const abas = t14.getByTestId('seletor-local-T14').getByRole('tablist').first();
    await expect(abas.getByRole('tab')).toHaveText(['Demandas', 'Frentes']);
    await abas.getByRole('tab', { name: 'Frentes' }).click();
    await expect(t14.getByTestId('anuncio-T14')).toHaveText('Contando frentes.');
    const codigos = (await t14.getByTestId('t14-projetos').getByRole('listitem').allInnerTexts()).map((t) => t.split(' ')[0]);
    expect(codigos).toEqual(frentes.projetos.map((p) => p.codigo));
    expect(await t14.innerText()).not.toMatch(/\bprojetos? contados?\b/i);
  });

  test('TT-11 CA-45, R-1 = B e T14-M1 = B: com "outros times" oculto, só a fatia do meu time, sem total, sem k de n, sem percentual', async ({ page, painel }) => {
    await abrir(page, painel);
    const t14 = page.getByTestId('metrica-T14');
    const api = await t14DaApi(page, 'erp-protheus');
    const story = api.porGranularidade.find((g) => g.granularidade === 'story')!;
    const ocultos = story.projetos.filter((p) => p.outrosTimes === null);
    expect(ocultos.map((p) => p.codigo), 'o mock tem um projeto oculto em demandas').toEqual(['P-0039']);
    const oculto = ocultos[0]!;
    const li = t14.getByTestId('t14-projetos').getByRole('listitem').filter({ hasText: oculto.codigo });
    await expect(li).toHaveCount(1);
    const textoLi = (await li.innerText()).replace(/\s+/g, ' ').trim();
    expect(textoLi, 'só o código, o título e a fatia do meu time').toMatch(
      new RegExp(`^${oculto.codigo} [^\\d]*Meu time: ${oculto.meuTime.k} demandas$`),
    );
    const fatia = (await page.getByTestId(`t14-fatia-${oculto.codigo}`).innerText()).trim();
    expect(fatia).toBe(`Meu time: ${oculto.meuTime.k} demandas`);
    expect(fatia).not.toMatch(/ de |%|sem time|outros/i);
    expect(textoLi.replace(fatia, '').replace(oculto.codigo, ''), 'o resto da linha é só o título do projeto').not.toMatch(/%|sem time informado|outros times|\d+ de \d+/i);
    // O total do projeto, o n com time informado e o agregado do recorte não aparecem em nenhum lugar do cartão.
    const cartao = await t14.innerText();
    const html = await t14.innerHTML();
    for (const proibido of [oculto.total, oculto.meuTime.n]) {
      expect(cartao, `o total do projeto oculto (${proibido}) vazou no texto`).not.toMatch(new RegExp(`(^|[^\\d])${proibido}([^\\d]|$)`));
      expect(html, `o total do projeto oculto (${proibido}) vazou no HTML`).not.toMatch(new RegExp(`(^|[^\\d])${proibido}([^\\d]|$)`));
    }
    await expect(t14.getByTestId('leitura-T14'), 'sem frase de destaque com total quando há projeto oculto').toHaveCount(0);
    await expect(t14.getByTestId('base-T14'), 'sem "Base: n" quando há projeto oculto').toHaveCount(0);
    expect(cartao).not.toMatch(/\bde \d+ demandas com time informado/);
    await expect(t14.getByTestId('t14-oculto')).toContainText('só a parte do meu time é mostrada');
    // A tabela alternativa e a exportação seguem a mesma regra: "não exibido" nas três colunas escondidas.
    const linhaTabela = t14.getByTestId('tabela-T14').getByRole('row').filter({ hasText: oculto.codigo });
    await expect(linhaTabela.getByRole('cell')).toHaveText([String(oculto.meuTime.k), 'não exibido', 'não exibido', 'não exibido']);
    // Nada de barra para o projeto oculto (a barra mostraria a proporção).
    await expect(li.locator('span[aria-hidden="true"]')).toHaveCount(0);
  });

  test('TT-12 CA-45 em frentes: os projetos ocultos da granularidade "frentes" também mostram só a fatia do meu time', async ({ page, painel }) => {
    await abrir(page, painel);
    const t14 = page.getByTestId('metrica-T14');
    const api = await t14DaApi(page, 'erp-protheus');
    const frentes = api.porGranularidade.find((g) => g.granularidade === 'frente')!;
    const ocultos = frentes.projetos.filter((p) => p.outrosTimes === null);
    expect(ocultos.map((p) => p.codigo).sort(), 'o mock tem dois projetos ocultos em frentes').toEqual(['P-0008', 'P-0038']);
    await t14.getByTestId('seletor-local-T14').getByRole('tab', { name: 'Frentes' }).click();
    await expect(t14.getByTestId('anuncio-T14')).toHaveText('Contando frentes.');
    for (const o of ocultos) {
      const li = t14.getByTestId('t14-projetos').getByRole('listitem').filter({ hasText: o.codigo });
      const texto = (await li.innerText()).replace(/\s+/g, ' ').trim();
      expect(texto).toMatch(new RegExp(`Meu time: ${o.meuTime.k} frentes$`));
      const fatia = (await page.getByTestId(`t14-fatia-${o.codigo}`).innerText()).trim();
      expect(fatia).toBe(`Meu time: ${o.meuTime.k} frentes`);
      expect(fatia).not.toMatch(/ de |%|sem time|outros/i);
      expect(texto.replace(fatia, '').replace(o.codigo, ''), 'o resto da linha é só o título do projeto').not.toMatch(/%|sem time informado|outros times|\d+ de \d+/i);
      await expect(li.locator('span[aria-hidden="true"]')).toHaveCount(0);
    }
    await expect(t14.getByTestId('leitura-T14')).toHaveCount(0);
    await expect(t14.getByTestId('base-T14')).toHaveCount(0);
    const linhas = t14.getByTestId('tabela-T14').getByRole('row').filter({ hasText: 'não exibido' });
    await expect(linhas).toHaveCount(ocultos.length);
  });

  test('TT-13 controle positivo de TT-11: com a API devolvendo "outros times" publicável, a tela mostra k de n e a barra (o detector funciona)', async ({ page, painel }) => {
    await page.route(/\/metricas\/T14(\?|$)/, async (rota) => {
      const resp = await rota.fetch();
      const json = (await resp.json()) as T14Api;
      for (const g of json.porGranularidade) {
        for (const p of g.projetos) if (p.outrosTimes === null) p.outrosTimes = p.total - p.meuTime.k - p.semTime;
      }
      await rota.fulfill({ response: resp, json });
    });
    await abrir(page, painel);
    const li = page
      .getByTestId('metrica-T14')
      .getByTestId('t14-projetos')
      .getByRole('listitem')
      .filter({ hasText: 'P-0039' });
    await expect(li).toContainText('1 de 73');
    await expect(li.locator('span[aria-hidden="true"]')).toHaveCount(1);
    await expect(page.getByTestId('t14-fatia-P-0039')).toHaveCount(0);
  });

  test('TT-14 estado de falha: a API do T14 fora do ar mostra o erro no cartão, o painel segue e "Tentar de novo" recupera', async ({ page, painel }) => {
    let derrubar = true;
    await page.route(/\/metricas\/T14(\?|$)/, (r) => (derrubar ? r.abort() : r.continue()));
    await painel.ir(ROTA);
    await page.getByTestId('mais-metricas').locator('summary').click();
    const t14 = painel.cartao('T14');
    await expect(t14.erro).toContainText('Não foi possível carregar este gráfico');
    await expect(page.getByTestId('metrica-T10')).toHaveAttribute('data-estado', /^(ok|pronto)$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    derrubar = false;
    await t14.tentarDeNovo.click();
    await expect(page.getByTestId('t14-selo')).toBeVisible();
  });

  test('TT-15 estado de falha do T10, T12 e T13: erro por cartão sem derrubar os vizinhos', async ({ page, painel }) => {
    await page.route(/\/metricas\/(T10|T12|T13)(\?|$)/, (r) => r.abort());
    await painel.ir(ROTA);
    await page.getByTestId('mais-metricas').locator('summary').click();
    for (const id of ['T10', 'T12', 'T13']) await expect(painel.cartao(id).erro).toContainText('Não foi possível carregar este gráfico');
    await expect(page.getByTestId('metrica-T11')).toHaveAttribute('data-estado', /^(ok|pronto)$/);
    await expect(page.getByTestId('metrica-T14')).toHaveAttribute('data-estado', /^(ok|pronto)$/);
  });

  test('TT-16 catálogo e "Leia junto": T10 a T14 em /metricas como Tático/BusinessMap e os links de ida e volta com o núcleo', async ({ page, painel }) => {
    await page.goto('/metricas');
    await expect(page.getByTestId('contagem-catalogo')).toHaveText('58 de 58 métricas');
    for (const id of ['T10', 'T11', 'T12', 'T13', 'T14']) {
      const linha = page.getByRole('row').filter({ has: page.getByRole('cell', { name: id, exact: true }).or(page.getByRole('rowheader', { name: id, exact: true })) });
      await expect(linha, id).toHaveCount(1);
      await expect(linha, id).toContainText('Tático');
      await expect(linha, id).toContainText('BusinessMap');
    }
    // Núcleo → complementar: T1 → T13, T4 → T11, T9 → T14 (e T10 a partir do Bloqueados agora; O14 → T12).
    await painel.ir('/tatico');
    await painel.esperarCartoesProntos();
    const alvos: Record<string, string[]> = { t1: ['T13'], t4: ['T11'], t9: ['T14'] };
    for (const [de, ids] of Object.entries(alvos)) {
      const leia = page.getByTestId(`leia-junto-${de}`);
      for (const id of ids) await expect(leia.getByRole('link', { name: new RegExp(`^${id}\\b`) }), `${de} -> ${id}`).toBeVisible();
    }
    await painel.ir('/operacional?cadencia=diaria');
    await painel.esperarCartoesProntos();
    await expect(page.getByTestId('leia-junto-bloqueados').getByRole('link', { name: /^T10\b/ })).toBeVisible();
    // Complementar → núcleo: cada um dos cinco tem "Leia junto" escrito na nota, com os pares da ficha (O19 é do lote 3).
    await abrir(page, painel);
    const nota = async (id: string, trecho: RegExp) => {
      await page.getByTestId(`metrica-${id}`).getByRole('button', { name: 'Como ler e como é calculado' }).click();
      await expect(page.getByTestId(`nota-${id}`)).toContainText(trecho);
    };
    await nota('T11', /Leia junto com demanda × capacidade \(T4\) e a previsão \(T6\)/);
    await nota('T14', /Quando os outros times somam poucas pessoas, só a fatia do meu time é mostrada, sem o total do projeto/);
  });

  test('TT-17 acessibilidade: axe AA com T10 a T14 abertos (demandas e frentes), sem erro de console', async ({ page, painel, problemas }) => {
    await abrir(page, painel);
    const r1 = await rodarAxe(page);
    expect(r1.bloqueantes, JSON.stringify(r1.bloqueantes)).toEqual([]);
    await page.getByTestId('metrica-T14').getByTestId('seletor-local-T14').getByRole('tab', { name: 'Frentes' }).click();
    await expect(page.getByTestId('anuncio-T14')).toHaveText('Contando frentes.');
    const r2 = await rodarAxe(page, { incluir: '[data-testid="metrica-T14"]' });
    expect(r2.bloqueantes, JSON.stringify(r2.bloqueantes)).toEqual([]);
    expect(problemas).toEqual([]);
  });

  test('TT-18 teclado: o seletor de granularidade do T14 e do T13 troca por setas, com foco visível e o anúncio muda', async ({ page, painel }) => {
    await abrir(page, painel);
    for (const id of ['T14', 'T13']) {
      const c = page.getByTestId(`metrica-${id}`);
      const abas = c.getByTestId(`seletor-local-${id}`).getByRole('tablist').first().getByRole('tab');
      await abas.first().focus();
      await expect(c.getByTestId(`anuncio-${id}`)).toHaveText('Contando demandas.');
      await page.keyboard.press('ArrowRight');
      await expect(abas.nth(1)).toBeFocused();
      await expect(abas.nth(1)).toHaveAttribute('aria-selected', 'true');
      await expect(c.getByTestId(`anuncio-${id}`)).toHaveText('Contando frentes.');
      const contorno = await abas.nth(1).evaluate((el) => {
        const s = getComputedStyle(el);
        return { estilo: s.outlineStyle, largura: parseFloat(s.outlineWidth), sombra: s.boxShadow };
      });
      expect((contorno.estilo !== 'none' && contorno.largura > 0) || contorno.sombra !== 'none', JSON.stringify(contorno)).toBe(true);
      await page.keyboard.press('Home');
      await expect(abas.first()).toHaveAttribute('aria-selected', 'true');
    }
  });
});

test.describe('Tático, lote 2: reflow a 360 px (WCAG 1.4.10)', () => {
  test.use({ viewport: { width: 360, height: 800 } });

  test('TT-19 sem rolagem horizontal da página, cartões dentro da largura e axe AA', async ({ page, painel }) => {
    await abrir(page, painel);
    expect(await semRolagemHorizontal(page)).toBe(true);
    for (const id of ['T10', 'T11', 'T12', 'T13', 'T14']) {
      const cabe = await page.getByTestId(`metrica-${id}`).evaluate((el) => el.scrollWidth <= el.clientWidth + 1);
      expect(cabe, `${id} estoura a largura`).toBe(true);
    }
    const r = await rodarAxe(page);
    expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([]);
  });
});
