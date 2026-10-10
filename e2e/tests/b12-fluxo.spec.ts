import { test, expect } from '../fixtures/base';

// QA B12 (K-039, K-006, K-023, K-007, K-024): casos do plano para Operacional (diária e semanal), Tático e Estratégico.
test.use({ viewport: { width: 1280, height: 800 } });

const FOCO_TEXTOS_PESSOA = /respons[aá]vel|assignee|\branking\b|Pessoa \d+/i;

test.describe('K-006 Operacional diário', () => {
  test('OP-01 abre na cadência Diária, ordem O2, Bloqueados, O1, link para a semanal', async ({ painel, page }) => {
    await painel.ir('/operacional');
    await painel.esperarCartoesProntos();
    await expect.poll(() => painel.codigosDosCartoes()).toEqual(['O2', 'BLOQUEADOS', 'O1']);
    await expect(page.getByTestId('pergunta-cadencia')).toContainText('Qual item mais velho não andou desde ontem?');
    await expect(page.getByRole('link', { name: /Ver também a visão semanal/ })).toBeVisible();
    await expect(page.getByTestId('metrica-O4')).toHaveCount(0);
  });

  test('OP-02 seletor de cadência alterna, grava e remove o parâmetro e mantém o foco', async ({ painel, page }) => {
    await painel.ir('/operacional');
    await painel.cadencia.getByText('Semanal', { exact: true }).click();
    await expect(page).toHaveURL(/cadencia=semanal/);
    await painel.esperarCartoesProntos();
    await expect.poll(() => painel.codigosDosCartoes()).toEqual(['O3', 'O9', 'EI-FL1', 'O4', 'O12', 'O10', 'O7', 'O15', 'O18']);
    await painel.cadencia.getByText('Diária', { exact: true }).click();
    await expect(page).not.toHaveURL(/cadencia=/);
    await expect(painel.cadencia.getByRole('radio', { name: 'Diária' })).toBeFocused();
  });

  test('OP-03 faixa "Pede atenção" com itens que levam aos cartões de origem', async ({ painel, page }) => {
    await painel.ir('/operacional');
    await painel.esperarCartoesProntos();
    await expect(painel.faixaAtencao).toContainText(/acima do P95/);
    for (const [nome, id] of [[/Ver O2/, 'o2'], [/Ver BLOQUEADOS/, 'bloqueados'], [/Ver O1/, 'o1']] as const) {
      const link = painel.faixaAtencao.getByRole('link', { name: nome });
      await expect(link).toHaveAttribute('href', new RegExp(`#${id}$`));
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test('OP-04 O2 sem pessoa, máximo 10 itens, aba de tipo insuficiente sinalizada', async ({ painel }) => {
    await painel.ir('/operacional');
    const o2 = painel.cartao('O2');
    await o2.esperarPronto();
    const linhas = o2.raiz.locator('tbody tr');
    expect(await linhas.count()).toBeLessThanOrEqual(10);
    await expect(o2.raiz.getByRole('columnheader', { name: /Card/ })).toBeVisible();
    await expect(o2.raiz.getByRole('columnheader', { name: /Sem mover há/ })).toBeVisible();
    await expect(o2.raiz).toContainText('(amostra insuficiente)');
    await expect(o2.raiz).toContainText('Sem referência');
    expect(await o2.raiz.innerText()).not.toMatch(FOCO_TEXTOS_PESSOA);
  });

  test('OP-21 O2 ordena por "Sem mover há" e seleciona tipo gravando o2=', async ({ painel, page }) => {
    await painel.ir('/operacional');
    const o2 = painel.cartao('O2');
    await o2.esperarPronto();
    await o2.raiz.getByRole('button', { name: 'Sem mover há', exact: true }).click();
    await expect(o2.raiz.getByRole('button', { name: 'Sem mover há', exact: true })).toHaveAttribute('aria-pressed', 'true');
    const valores = await o2.raiz.locator('tbody tr').evaluateAll((trs) => trs.map((t) => Number(t.querySelectorAll('td')[4]?.textContent)));
    expect(valores).toEqual([...valores].sort((a, b) => b - a));
    await o2.raiz.getByRole('tab', { name: /Incidente/ }).click();
    await expect(page).toHaveURL(/o2=/);
  });

  test('OP-05/24 Bloqueados: colunas do domínio, sem responsável, base = linhas, sem agregação por motivo', async ({ painel }) => {
    await painel.ir('/operacional');
    const b = painel.cartao('BLOQUEADOS');
    await b.esperarPronto();
    for (const c of ['Card', 'Tipo', 'Motivo', 'Fornecedor']) await expect(b.raiz.getByRole('columnheader', { name: new RegExp(c) })).toBeVisible();
    const n = await b.raiz.locator('tbody tr').count();
    await expect(b.raiz).toContainText(`Base: ${n} itens bloqueados`);
    expect(await b.raiz.innerText()).not.toMatch(FOCO_TEXTOS_PESSOA);
    await expect(b.raiz.locator('svg[role="application"], svg[role="img"], canvas')).toHaveCount(0);
  });

  test('OP-06 Bloqueados vazio é estado positivo', async ({ painel }) => {
    await painel.ir('/operacional', { mock: 'vazio' });
    const b = painel.cartao('BLOQUEADOS');
    await b.esperarPronto();
    await expect(b.raiz).toContainText('Nenhum item bloqueado hoje.');
    await expect(b.raiz.getByRole('alert')).toHaveCount(0);
  });

  test('OP-07 O1: sem equipe única só Fila x Execução; com uma equipe barras por coluna', async ({ painel }) => {
    await painel.ir('/operacional');
    const o1 = painel.cartao('O1');
    await o1.esperarPronto();
    await expect(o1.raiz).toContainText('Selecione uma equipe para ver por coluna.');
    await expect(o1.raiz).toContainText(/Limite somado de \d+ equipes/);
    await painel.ir('/operacional?equipe=erp-protheus');
    await o1.esperarPronto();
    await expect(o1.raiz).not.toContainText('Selecione uma equipe para ver por coluna.');
    await expect(o1.raiz).toContainText(/Fila/);
  });

  test('OP-09 O1 "k de n dias" e KPI coerentes', async ({ painel }) => {
    await painel.ir('/operacional');
    const o1 = painel.cartao('O1');
    await o1.esperarPronto();
    const t = await o1.raiz.innerText();
    const m = t.match(/Dias dentro do limite: (\d+) de (\d+) dias úteis/);
    expect(m).not.toBeNull();
    const [k, n] = [Number(m![1]), Number(m![2])];
    if (n >= 20) expect(t).toContain(`${Math.round((k / n) * 100)}%`);
  });

  test('ST-03 erro:o2 isola o erro no cartão e os demais seguem', async ({ painel }) => {
    await painel.ir('/operacional', { mock: 'erro:o2' });
    await expect(painel.cartao('O2').erro).toBeVisible();
    await painel.cartao('O1').esperarEstado('ok');
    await painel.cartao('BLOQUEADOS').esperarPronto();
  });

  test('NAV-07 âncoras #o2 e #bloqueados existem e levam ao cartão', async ({ painel, page }) => {
    for (const id of ['o2', 'bloqueados', 'o1']) {
      await painel.ir(`/operacional#${id}`);
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });

  test('FIL-12 diária: filtro de equipe recorta O2/O1 e informa filtros aplicados', async ({ painel }) => {
    await painel.ir('/operacional?equipe=erp-protheus');
    await painel.esperarCartoesProntos();
    for (const c of ['O2', 'O1']) await expect(painel.cartao(c).raiz).toContainText(/Filtros|Equipe/);
  });
});

test.describe('K-023 Operacional semanal', () => {
  const SEM = '/operacional?cadencia=semanal';

  test('OP-22 âncoras "Ir para" levam às seções', async ({ painel, page }) => {
    await painel.ir(SEM);
    const nav = page.getByRole('navigation', { name: 'Ir para' });
    for (const s of ['Tempo', 'Fluxo', 'Compromissos', 'Backlog', 'Qualidade']) {
      await nav.getByRole('link', { name: s }).click();
      await expect(page).toHaveURL(new RegExp('#' + s.toLowerCase()));
    }
  });

  test('OP-10/11 O3: P50/P85/P95 juntos, tipo < 20 mostra meter e sem percentis', async ({ painel }) => {
    await painel.ir(SEM);
    const o3 = painel.cartao('O3');
    await o3.esperarPronto();
    await expect(o3.raiz).toContainText('(amostra insuficiente)');
    for (const p of ['P50', 'P85', 'P95']) await expect(o3.raiz).toContainText(p);
    await o3.raiz.getByRole('tab', { name: /Dívida técnica/ }).click();
    const meter = o3.raiz.getByRole('meter');
    await expect(meter).toBeVisible();
    await expect(meter).toHaveAttribute('aria-valuemax', '20');
    await expect(o3.raiz).toContainText(/Amostra insuficiente/);
  });

  test('OP-13 O4: semana em andamento rotulada e faixa/mediana só com >= 20', async ({ painel }) => {
    await painel.ir(SEM);
    const o4 = painel.cartao('O4');
    await o4.esperarPronto();
    await o4.verComoTabela.click();
    await expect(painel.cartao('O4').tabela).toContainText(/\(em andamento\)/);
    await painel.ir('/operacional?cadencia=semanal&tipo=divida-tecnica&equipe=plataforma-5g');
    await o4.esperarPronto();
    await expect(o4.raiz).toContainText(/Faixa e mediana indisponíveis: \d+ de 20 itens mínimos\./);
  });

  test('OP-14 O7: um pequeno múltiplo por tipo, escala própria, mês corrente em andamento, 4 semanas avisa', async ({ painel }) => {
    await painel.ir(SEM);
    const o7 = painel.cartao('O7');
    await o7.esperarPronto();
    expect(await o7.raiz.getByText(/\(escala própria\)/).count()).toBe(6);
    await expect(o7.raiz).toContainText(/em andamento/i);
    await painel.ir(SEM + '&periodo=4s');
    await o7.esperarPronto();
    await expect(o7.raiz).toContainText('Este gráfico mostra no mínimo 6 meses.');
  });

  test('OP-15 O9 um tipo por vez (o9=)', async ({ painel, page }) => {
    await painel.ir(SEM);
    const o9 = painel.cartao('O9');
    await o9.esperarPronto();
    const abas = o9.raiz.getByRole('tab');
    await abas.nth(1).click();
    await expect(page).toHaveURL(/o9=/);
  });

  test('OP-16 O10: contador > 180 dias, dois histogramas (time e cliente)', async ({ painel }) => {
    await painel.ir(SEM);
    const o10 = painel.cartao('O10');
    await o10.esperarPronto();
    await expect(o10.raiz).toContainText(/\d+ itens? com mais de 180 dias/);
    await expect(o10.raiz).toContainText(/time/i);
    await expect(o10.raiz).toContainText(/cliente/i);
  });

  test('OP-17 O12: vencidos por causa interna com meta zero; % só com >= 20 acordos', async ({ painel }) => {
    await painel.ir(SEM);
    const o12 = painel.cartao('O12');
    await o12.esperarPronto();
    await expect(o12.raiz).toContainText('Meta: Zero vencidos por causa interna');
    await expect(o12.raiz).toContainText(/Vencidos por causa interna: \d+/);
    await expect(o12.raiz).toContainText(/Em andamento \(fora das estatísticas\)/);
  });

  test('OP-18 O15: frase da taxa de escape e sem status sobre volume', async ({ painel }) => {
    await painel.ir(SEM);
    const o15 = painel.cartao('O15');
    await o15.esperarPronto();
    await expect(o15.raiz).toContainText('O que se cobra é a taxa de escape, não o volume de bugs internos.');
    await expect(o15.raiz).toContainText(/contenção/i);
    await expect(o15.raiz).toContainText(/escape/i);
  });

  test('OP-19/23 O18: em apuração e link "Ver vazão (O4)" preserva filtros', async ({ painel, page }) => {
    await painel.ir(SEM + '&equipe=erp-protheus');
    const o18 = painel.cartao('O18');
    await o18.esperarPronto();
    await expect(o18.raiz).toContainText(/em apuração até \d{2}\/\d{2}/i);
    await o18.raiz.getByRole('link', { name: /Ver vazão \(O4\)/ }).click();
    await expect(page).toHaveURL(/equipe=erp-protheus/);
    await expect(page).toHaveURL(/#o4/);
  });

  test('ST-03 erro:o3 isola o erro no O3', async ({ painel }) => {
    await painel.ir(SEM, { mock: 'erro:o3' });
    await expect(painel.cartao('O3').erro).toBeVisible();
    await painel.cartao('O4').esperarEstado('ok');
  });

  test('B3-002 #o12 existe no painel semanal e a faixa leva a ele', async ({ painel, page }) => {
    await painel.ir(SEM);
    await painel.esperarCartoesProntos();
    await expect(page.locator('#o12')).toHaveCount(1);
    await expect(painel.faixaAtencao.getByRole('link', { name: /Ver O12/ })).toHaveAttribute('href', /cadencia=semanal.*#o12|#o12/);
    await painel.ir('/operacional#o12');
    await painel.esperarCartoesProntos();
    expect(await painel.codigosDosCartoes()).not.toContain('O12');
  });

  test('FIL-14/FIL-12 filtro de sistema/tipo atua e informa nos cartões semanais', async ({ painel }) => {
    await painel.ir(SEM + '&equipe=erp-protheus');
    await painel.esperarCartoesProntos();
    await expect(painel.cartao('O3').raiz).toContainText(/Filtros|Equipe/);
  });
});

test.describe('K-007 Tático', () => {
  test('TAT-01 seções e ordem; faixa Pede atenção', async ({ painel }) => {
    await painel.ir('/tatico');
    await painel.esperarCartoesProntos();
    await expect.poll(() => painel.codigosDosCartoes()).toEqual(['T2', 'T1', 'T5', 'T4', 'T3', 'T9', 'T7', 'EI-FL2']);
    await expect(painel.faixaAtencao).toBeVisible();
  });

  test('TAT-02/03 T1 por classe, Intangível sem SLE/insuficiente, links cruzados T1/T4', async ({ painel, page }) => {
    await painel.ir('/tatico');
    await painel.esperarCartoesProntos();
    await expect(painel.cartao('T2').raiz).toContainText('Sem SLE');
    await expect(painel.cartao('T1').raiz).toContainText(/Intangível: Amostra insuficiente \(\d+ de 20 itens mínimos\), sem barra\./);
    await painel.cartao('T1').raiz.getByRole('link', { name: /Demanda × capacidade \(T4\)/ }).click();
    await expect(page).toHaveURL(/#t4/);
    await painel.cartao('T4').raiz.getByRole('link', { name: /lead time \(T1\)/ }).click();
    await expect(page).toHaveURL(/#t1/);
  });

  test('TAT-05 T3: selo de desvio só quando > 10 p.p. (consistência com os números)', async ({ painel }) => {
    await painel.ir('/tatico');
    const t3 = painel.cartao('T3');
    await t3.esperarPronto();
    const txt = await t3.raiz.innerText();
    const desvios = [...txt.matchAll(/desvio ([+-−]?\d+,\d) p\.p\./g)].map((m) => Math.abs(Number(m[1]!.replace('−', '-').replace(',', '.'))));
    const selos = (txt.match(/Desvio acima de 10 p\.p\./g) ?? []).length;
    expect(desvios.length).toBeGreaterThan(0);
    expect(selos).toBe(desvios.filter((d) => d > 10).length);
  });

  test('TAT-06 T4 por classe: "A fila cresce" sem "semanas para zerar" numérico', async ({ painel }) => {
    await painel.ir('/tatico');
    const t4 = painel.cartao('T4');
    await t4.esperarPronto();
    await expect(t4.raiz).toContainText('A fila cresce: chegam mais itens do que saem');
    await expect(t4.raiz).toContainText(/16 de 20 itens mínimos|\d+ de 20 itens mínimos/);
  });

  test('TAT-08 T5: sistemas insuficientes listados com base e filtro Sistema não afeta', async ({ painel }) => {
    await painel.ir('/tatico?sistema=fluig');
    const t5 = painel.cartao('T5');
    await t5.esperarPronto();
    await expect(t5.raiz).toContainText('Sem amostra suficiente');
    await expect(t5.raiz).toContainText(/\d+ de 20 itens mínimos/);
    await expect(t5.raiz.getByRole('tab', { name: /Por área/ })).toBeVisible();
    await expect(t5.raiz).toContainText(/Não afetado/i);
  });

  test('TAT-09 T7: granularidade frente, sem mistura com story/projeto', async ({ painel }) => {
    await painel.ir('/tatico');
    const t7 = painel.cartao('T7');
    await t7.esperarPronto();
    await expect(t7.raiz).toContainText(/frente/i);
    await expect(t7.raiz).toContainText('Granularidade: frente');
    await expect(t7.raiz).not.toContainText(/Granularidade: (story|projeto|demanda)/i);
  });

  test('TAT-10 T9: k de n frentes, escopo cresceu, ordenado por crescimento, sem controle de avanço manual', async ({ painel }) => {
    await painel.ir('/tatico');
    const t9 = painel.cartao('T9');
    await t9.esperarPronto();
    const txt = await t9.raiz.innerText();
    const cresc = [...txt.matchAll(/Escopo cresceu (\d+)%/g)].map((m) => Number(m[1]));
    expect(cresc.length).toBeGreaterThan(1);
    expect(cresc).toEqual([...cresc].sort((a, b) => b - a));
    await expect(t9.raiz).toContainText(/\d+ de \d+ frentes \(\d+%\)/);
    await expect(t9.raiz.locator('input[type="range"], input[type="number"], [role="slider"]')).toHaveCount(0);
  });

  test('ST-03 erro:t2 isola o cartão', async ({ painel }) => {
    await painel.ir('/tatico', { mock: 'erro:t2' });
    await expect(painel.cartao('T2').erro).toBeVisible();
    await painel.cartao('T1').esperarEstado('ok');
  });

  test('Tático sem pessoa nem comparação entre equipes', async ({ painel, page }) => {
    await painel.ir('/tatico');
    await painel.esperarCartoesProntos();
    expect((await page.getByRole('main').innerText()).replace(/Não é um ranking\./g, '')).not.toMatch(FOCO_TEXTOS_PESSOA);
  });
});

test.describe('K-024 Estratégico', () => {
  test('EST-01 E1, E2, E3, EI e faixa; sem filtros de Equipe e Tipo', async ({ painel }) => {
    await painel.ir('/estrategico');
    await painel.esperarCartoesProntos();
    await expect.poll(() => painel.codigosDosCartoes()).toEqual(['E1', 'E2', 'E3', 'EI-FL3']);
    await expect(painel.faixaAtencao).toBeVisible();
    await expect(painel.filtros.botao('equipe')).toHaveCount(0);
    await expect(painel.filtros.botao('tipo')).toHaveCount(0);
    await expect(painel.filtros.botao('sistema')).toBeVisible();
  });

  test('EST-02 E1 < 20 projetos oculta percentis, sem selo provisória, mostra base', async ({ painel }) => {
    await painel.ir('/estrategico');
    const e1 = painel.cartao('E1');
    await e1.esperarPronto();
    await expect(e1.raiz).toContainText(/Amostra insuficiente/);
    await expect(e1.raiz).toContainText(/0 de 20 projetos mínimos/);
    await expect(e1.raiz).not.toContainText(/provisória/i);
    await expect(e1.raiz).toContainText('Comparação indisponível');
  });

  test('EST-03 E2: meta de 60% e status', async ({ painel }) => {
    await painel.ir('/estrategico');
    const e2 = painel.cartao('E2');
    await e2.esperarPronto();
    await expect(e2.raiz).toContainText(/Fora de objetivo/);
    await expect(e2.raiz).toContainText('Meta: ≥ 60% da evolução vinculada a objetivos declarados');
  });

  test('EST-04 E3: "Sem resultado declarado" primeiro e contador k de n', async ({ painel }) => {
    await painel.ir('/estrategico');
    const e3 = painel.cartao('E3');
    await e3.esperarPronto();
    const linhas = await e3.raiz.locator('tbody tr').allInnerTexts();
    const idxUlt = linhas.map((l) => l.includes('Sem resultado declarado')).lastIndexOf(true);
    const idxPrim = linhas.findIndex((l) => !l.includes('Sem resultado declarado'));
    expect(idxUlt).toBeGreaterThanOrEqual(0);
    expect(idxUlt).toBeLessThan(idxPrim);
    await expect(e3.raiz).toContainText(/\d+ de \d+/);
  });

  test('EST-05 filtro Sistema atua em E1 a E3; período padrão 12m', async ({ painel }) => {
    await painel.ir('/estrategico?sistema=fluig');
    await painel.esperarCartoesProntos();
    for (const c of ['E1', 'E2', 'E3']) await expect(painel.cartao(c).raiz).toContainText(/Sistema/);
    await expect(page_periodo(painel)).toContainText(/12 meses/);
  });

  test('NAV-06 ida e volta Estratégico <-> Tático preserva filtro de sistema', async ({ painel, page }) => {
    await painel.ir('/estrategico?sistema=fluig');
    await painel.cabecalho.linkPara('Tático').click();
    await expect(page).toHaveURL(/sistema=fluig/);
    await painel.cabecalho.linkPara('Estratégico').click();
    await expect(page).toHaveURL(/sistema=fluig/);
  });
});

function page_periodo(painel: { filtros: { botao: (n: 'periodo') => import('@playwright/test').Locator } }) {
  return painel.filtros.botao('periodo');
}
