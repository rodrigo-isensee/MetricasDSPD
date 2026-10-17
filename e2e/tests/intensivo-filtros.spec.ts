import type { Browser, Page } from '@playwright/test';
import { test, expect, rodarAxe } from '../fixtures/base';
import { PainelPage } from '../pages/PainelPage';

/**
 * QA intensivo de FILTROS (docs/qa/intensivo-filtros.md). Versão da `main`.
 *
 * Combinatória pairwise determinística (gerador guloso, sem aleatoriedade em tempo de execução) dos
 * filtros de cada painel, mais ida e volta da URL, Voltar/Avançar, recarga, invariantes de tela
 * (filtrar nunca aumenta a base, "Não afetado por" é verdade, sem dado individual) e interação.
 * Os casos de borda de URL ficam em `intensivo-filtros-bordas.spec.ts`.
 */

test.use({ viewport: { width: 1280, height: 800 } });

// ---------------------------------------------------------------------------------------------
// Dados do mock (os ids vêm de `opcoesFiltro`; conferidos em IF-00)
// ---------------------------------------------------------------------------------------------
const EQUIPES = ['erp-protheus', 'fluig', 'senior', 'marketing-e-vendas', 'dados', 'plataforma-5g'];
const SISTEMAS = ['protheus', 'fluig', 'senior', 'crm', 'site-marketing', 'data-lake', 'core-5g', 'portal-do-cliente'];
const TIPOS = ['incidente', 'requisicao', 'melhoria', 'bug-interno', 'defeito-producao', 'divida-tecnica'];
const SSSC = ['totvs', 'senior', 'fluig'];
const PRIORIDADES = ['p1', 'p2', 'p3', 'p4', 'p5'];
const CUSTOM = { periodo: 'custom', de: '2026-06-01', ate: '2026-08-31' };

/** Proibido em qualquer tela, com qualquer filtro (regra inviolável: nada individual). */
const PROIBIDO_PESSOA = [/\bPessoa \d+\b/, /\brespons[aá]ve(l|is)\b/i, /\bassignee\b/i, /@[a-z0-9.-]+\.[a-z]{2,}/i];

// ---------------------------------------------------------------------------------------------
// Gerador pairwise determinístico
// ---------------------------------------------------------------------------------------------
type Dim = { nome: string; valores: Record<string, string>[] };

/** Gera combinações que cobrem todos os pares de valores entre dimensões (guloso, determinístico). */
export function pairwise(dims: Dim[]): Record<string, string>[][] {
  const chave = (i: number, a: number, j: number, b: number) => `${i}:${a}|${j}:${b}`;
  const faltam = new Set<string>();
  for (let i = 0; i < dims.length; i++)
    for (let j = i + 1; j < dims.length; j++)
      for (let a = 0; a < dims[i]!.valores.length; a++)
        for (let b = 0; b < dims[j]!.valores.length; b++) faltam.add(chave(i, a, j, b));
  const todas: number[][] = [[]];
  for (const d of dims) {
    const prox: number[][] = [];
    for (const t of todas) for (let v = 0; v < d.valores.length; v++) prox.push([...t, v]);
    todas.splice(0, todas.length, ...prox);
  }
  const escolhidas: number[][] = [];
  while (faltam.size > 0) {
    let melhor: number[] = todas[0]!;
    let ganho = -1;
    for (const t of todas) {
      let g = 0;
      for (let i = 0; i < t.length; i++) for (let j = i + 1; j < t.length; j++) if (faltam.has(chave(i, t[i]!, j, t[j]!))) g++;
      if (g > ganho) {
        ganho = g;
        melhor = t;
      }
    }
    for (let i = 0; i < melhor.length; i++) for (let j = i + 1; j < melhor.length; j++) faltam.delete(chave(i, melhor[i]!, j, melhor[j]!));
    escolhidas.push(melhor);
  }
  return escolhidas.map((t) => t.map((v, i) => dims[i]!.valores[v]!));
}

/**
 * `rota` pode já trazer a visão (`?cadencia=...`). Na Sustentação os filtros vivem com o prefixo `sust_` (CA-5, CA-6):
 * `prefixo` vale para todo parâmetro de filtro, nunca para `cadencia`.
 */
const urlDe = (rota: string, partes: Record<string, string>[], prefixo = ''): string => {
  const [caminho = '', busca = ''] = rota.split('?');
  const p = new URLSearchParams(busca);
  for (const parte of partes) for (const [k, v] of Object.entries(parte)) if (v !== '') p.set(k === 'cadencia' ? k : `${prefixo}${k}`, v);
  const s = p.toString().replaceAll('%2C', ',');
  return s ? `${caminho}?${s}` : caminho;
};

const dimEquipe: Dim = {
  nome: 'equipe',
  valores: [{}, { equipe: 'fluig' }, { equipe: 'erp-protheus,dados' }, { equipe: 'marketing-e-vendas,plataforma-5g,senior' }],
};
const dimTipo: Dim = { nome: 'tipo', valores: [{}, { tipo: 'incidente' }, { tipo: 'melhoria,divida-tecnica,requisicao' }] };
const dimSistema: Dim = { nome: 'sistema', valores: [{}, { sistema: 'fluig' }, { sistema: 'crm,core-5g' }] };
const dimPeriodoFluxo: Dim = { nome: 'periodo', valores: [{}, { periodo: '4s' }, { periodo: '6m' }, { periodo: '12m' }, CUSTOM] };

/** Cenários por painel: rota, dimensões e o que esperar da barra. */
const PAINEIS: { id: string; rota: string; dims: Dim[]; filtros: string[]; periodoPadrao: string; prefixo?: string }[] = [
  {
    id: 'operacional-diaria',
    rota: '/operacional?cadencia=diaria',
    dims: [dimEquipe, dimTipo, dimSistema, dimPeriodoFluxo],
    filtros: ['equipe', 'tipo', 'sistema', 'periodo'],
    periodoPadrao: '12s',
  },
  {
    id: 'operacional-semanal',
    rota: '/operacional',
    dims: [dimEquipe, dimTipo, dimSistema, dimPeriodoFluxo, { nome: 'cadencia', valores: [{ cadencia: 'semanal' }] }],
    filtros: ['equipe', 'tipo', 'sistema', 'periodo'],
    periodoPadrao: '12s',
  },
  { id: 'tatico', rota: '/tatico', dims: [dimEquipe, dimTipo, dimSistema, dimPeriodoFluxo], filtros: ['equipe', 'tipo', 'sistema', 'periodo'], periodoPadrao: '12s' },
  {
    id: 'estrategico',
    rota: '/estrategico',
    dims: [
      { nome: 'sistema', valores: [{}, { sistema: 'protheus' }, { sistema: 'data-lake,portal-do-cliente' }, { sistema: 'senior,fluig,crm' }] },
      { nome: 'periodo', valores: [{}, { periodo: '6m' }] },
    ],
    filtros: ['sistema', 'periodo'],
    periodoPadrao: '12m',
  },
  {
    id: 'sustentacao',
    rota: '/operacional?cadencia=sustentacao',
    dims: [
      { nome: 'equipe', valores: [{}, { equipe: 'totvs' }, { equipe: 'senior,fluig' }] },
      { nome: 'prioridade', valores: [{}, { prioridade: 'p1' }, { prioridade: 'p2,p3' }, { prioridade: 'p3,p4,p5' }] },
      { nome: 'periodo', valores: [{}, { periodo: '4s' }, { periodo: '12s' }, { periodo: '12m' }, CUSTOM] },
    ],
    filtros: ['equipe', 'prioridade', 'periodo'],
    periodoPadrao: '6m',
    prefixo: 'sust_',
  },
];

// ---------------------------------------------------------------------------------------------
// Leitura do estado da tela
// ---------------------------------------------------------------------------------------------
interface Cartao {
  codigo: string;
  estado: string | null;
  base: string | null;
  n: number | null;
  naoAfetado: string | null;
}
interface Retrato {
  botoes: Record<string, string>;
  chips: string[];
  cartoes: Cartao[];
}

async function esperarPronto(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('[data-testid^="metrica-"]').first().or(page.getByTestId('painel-visao-geral')).or(page.getByTestId('painel-dados')).or(page.locator('h1')).first()).toBeVisible();
  await expect(page.locator('[data-testid^="metrica-"][aria-busy="true"]')).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator('[data-testid^="estado-carregando-"]')).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator('[data-testid^="metrica-"][data-estado="carregando"], [data-testid^="metrica-"][data-estado="atualizando"]')).toHaveCount(0, { timeout: 30_000 });
}

async function retrato(page: Page): Promise<Retrato> {
  await esperarPronto(page);
  // Estável = duas leituras seguidas iguais, sem cartão ocupado (a troca de filtro dispara a recarga
  // um pouco depois da URL mudar; ler na hora pegaria o estado anterior).
  let anterior = '';
  let atual: Retrato | null = null;
  await expect
    .poll(
      async () => {
        atual = await lerRetrato(page);
        const s = JSON.stringify(atual);
        const ocupado = atual.cartoes.some((c) => c.estado === 'carregando' || c.estado === 'atualizando');
        const estavel = s === anterior && !ocupado;
        anterior = s;
        return estavel;
      },
      { timeout: 30_000, intervals: [300, 300, 500, 500, 1000] },
    )
    .toBe(true);
  return atual as unknown as Retrato;
}

async function lerRetrato(page: Page): Promise<Retrato> {
  return page.evaluate(() => {
    const botoes: Record<string, string> = {};
    for (const b of document.querySelectorAll('[data-testid="barra-filtros"] [role="group"] [data-testid^="filtro-"]'))
      botoes[b.getAttribute('data-testid') as string] = b.getAttribute('aria-label') ?? '';
    const chips = [...document.querySelectorAll('[data-testid^="chip-filtro-"]')].map((c) => (c.textContent ?? '').trim());
    const cartoes = [...document.querySelectorAll('[data-testid^="metrica-"]')].map((el) => {
      const codigo = (el.getAttribute('data-testid') as string).replace(/^metrica-/, '');
      const baseEl = document.querySelector(`[data-testid="base-${codigo}"]`);
      const base = baseEl ? (baseEl.textContent ?? '').trim() : null;
      const m = base?.replace(/\./g, '').match(/(?:Base|insuficiente):\s*(\d+)/);
      const na = [...el.querySelectorAll('span')].map((s) => (s.textContent ?? '').trim()).find((t) => t.startsWith('Não afetado por:')) ?? null;
      return { codigo, estado: el.getAttribute('data-estado'), base, n: m ? Number(m[1]) : null, naoAfetado: na };
    });
    return { botoes, chips, cartoes };
  });
}

const paramsOrdenados = (url: string): string =>
  [...new URL(url).searchParams.entries()]
    .map(([k, v]) => `${k}=${v.split(',').sort().join(',')}`)
    .sort()
    .join('&');

/** Linha de base (sem filtros) por rota + cadência + período: cacheada no worker. */
const LINHA_BASE = new Map<string, Retrato>();
async function linhaBase(browser: Browser, rota: string, extras: Record<string, string>, prefixo = ''): Promise<Retrato> {
  const url = urlDe(rota, [extras], prefixo);
  const salvo = LINHA_BASE.get(url);
  if (salvo) return salvo;
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' });
  const p = await ctx.newPage();
  await p.goto(url);
  const r = await retrato(p);
  await ctx.close();
  LINHA_BASE.set(url, r);
  return r;
}

function verificarSemPessoa(texto: string): string[] {
  const achados = PROIBIDO_PESSOA.filter((re) => re.test(texto)).map((re) => re.source);
  // "ranking" só é aceito negado ("Não é um ranking", "nunca em ranking", "Sem ... ranking").
  for (const m of texto.matchAll(/\branking\b/gi)) {
    const antes = texto.slice(Math.max(0, (m.index ?? 0) - 60), m.index);
    if (!/\b(n[ãa]o|nunca|sem|nem)\b/i.test(antes)) achados.push(`ranking: "...${antes}${m[0]}"`);
  }
  return achados;
}

// ---------------------------------------------------------------------------------------------
// IF-00: opções do mock conferem com as constantes deste arquivo
// ---------------------------------------------------------------------------------------------
test('IF-00 ids das opções de filtro conferem com o mock', async ({ page }) => {
  await page.goto('/operacional?cadencia=diaria');
  await page.getByTestId('filtro-equipe').click();
  const eq = await page.locator('[data-testid^="equipe-opcao-"]').evaluateAll((es) => es.map((e) => e.getAttribute('data-testid')!.replace('equipe-opcao-', '')));
  expect([...eq].sort()).toEqual([...EQUIPES].sort()); // as opções vêm em ordem alfabética (API), a ordem não é contrato
  await page.keyboard.press('Escape');
  await page.getByTestId('filtro-sistema').click();
  const si = await page.locator('[data-testid^="sistema-opcao-"]').evaluateAll((es) => es.map((e) => e.getAttribute('data-testid')!.replace('sistema-opcao-', '')));
  expect(si).toEqual(SISTEMAS);
  await page.keyboard.press('Escape');
  await page.getByTestId('filtro-tipo').click();
  const ti = await page.locator('[data-testid^="tipo-opcao-"]').evaluateAll((es) => es.map((e) => e.getAttribute('data-testid')!.replace('tipo-opcao-', '')));
  expect(ti).toEqual(TIPOS);
  await page.keyboard.press('Escape');
  await page.goto('/operacional?cadencia=sustentacao');
  await page.getByTestId('filtro-equipe').click();
  expect(await page.locator('[data-testid^="equipe-opcao-"]').evaluateAll((es) => es.map((e) => e.getAttribute('data-testid')!.replace('equipe-opcao-', '')))).toEqual(SSSC);
  await page.keyboard.press('Escape');
  await page.getByTestId('filtro-prioridade').click();
  expect(await page.locator('[data-testid^="prioridade-opcao-"]').evaluateAll((es) => es.map((e) => e.getAttribute('data-testid')!.replace('prioridade-opcao-', '')))).toEqual(PRIORIDADES);
});

// ---------------------------------------------------------------------------------------------
// IF-C: combinatória pairwise por painel
// ---------------------------------------------------------------------------------------------
for (const painelCfg of PAINEIS) {
  const combos = pairwise(painelCfg.dims);
  test.describe(`IF-C ${painelCfg.id}: ${combos.length} combinações pairwise`, () => {
    combos.forEach((partes, i) => {
      const url = urlDe(painelCfg.rota, partes, painelCfg.prefixo);
      test(`IF-C-${painelCfg.id}-${String(i + 1).padStart(2, '0')} ${url}`, async ({ page, browser, problemas }) => {
        await page.goto(url);
        const r = await retrato(page);
        const painel = new PainelPage(page);
        await expect(painel.erroDePainel).toHaveCount(0);

        // 1) URL reflete exatamente o estado (já normalizada: nada a corrigir em combinações válidas).
        expect(paramsOrdenados(page.url())).toBe(paramsOrdenados(new URL(url, 'http://x').toString()));
        await expect(page.getByTestId('aviso-filtros-invalidos')).toHaveCount(0);

        // 2) Barra: só os filtros do painel; rótulo de cada botão espelha a seleção; um chip por valor.
        expect(Object.keys(r.botoes).sort()).toEqual(painelCfg.filtros.map((f) => `filtro-${f}`).sort());
        const sel = Object.assign({}, ...partes) as Record<string, string>;
        let chipsEsperados = 0;
        for (const f of painelCfg.filtros.filter((x) => x !== 'periodo')) {
          const n = sel[f] ? sel[f].split(',').length : 0;
          chipsEsperados += n;
          const rot = r.botoes[`filtro-${f}`];
          if (n === 0) expect(rot, f).toMatch(/: Tod[ao]s$/);
          else if (n > 1) expect(rot, f).toMatch(new RegExp(`: ${n} selecionad[ao]s$`));
          else expect(rot, f).not.toMatch(/: Tod[ao]s$|selecionad/);
        }
        if (sel.periodo && sel.periodo !== painelCfg.periodoPadrao) chipsEsperados += 1;
        expect(r.chips.length, `chips: ${r.chips.join(' | ')}`).toBe(chipsEsperados);
        if (chipsEsperados > 0) await expect(page.getByTestId('limpar-filtros')).toBeVisible();
        else await expect(page.getByTestId('limpar-filtros')).toHaveCount(0);

        // 3) Cartões: os mesmos da linha de base (filtro não some cartão); nenhum em erro.
        const extras: Record<string, string> = {};
        for (const k of ['cadencia', 'periodo', 'de', 'ate']) if (sel[k]) extras[k] = sel[k];
        const base = await linhaBase(browser, painelCfg.rota, extras, painelCfg.prefixo);
        expect(r.cartoes.map((c) => c.codigo)).toEqual(base.cartoes.map((c) => c.codigo));
        for (const c of r.cartoes) expect(['ok', 'vazio', 'insuficiente', 'pronto'], `${c.codigo} em ${c.estado}`).toContain(c.estado);

        // 4) Filtrar nunca aumenta a base além do total sem filtro (mesmo período e cadência).
        for (const c of r.cartoes) {
          const b = base.cartoes.find((x) => x.codigo === c.codigo);
          if (c.n !== null && b?.n != null) expect(c.n, `${c.codigo}: "${c.base}" > sem filtro "${b.base}"`).toBeLessThanOrEqual(b.n);
        }

        // 5) Nenhum dado individual na tela.
        expect(verificarSemPessoa(await page.locator('main').innerText())).toEqual([]);

        // 6) Recarregar reproduz o mesmo estado.
        await page.reload();
        const r2 = await retrato(page);
        expect(paramsOrdenados(page.url())).toBe(paramsOrdenados(new URL(url, 'http://x').toString()));
        expect(r2).toEqual(r);

        expect(problemas).toEqual([]);
      });
    });
  });
}

// ---------------------------------------------------------------------------------------------
// IF-U: ida e volta construída pela interface + Voltar/Avançar + abrir a URL em outra aba
// ---------------------------------------------------------------------------------------------
async function marcar(page: Page, filtro: string, ids: string[]): Promise<void> {
  await page.getByTestId(`filtro-${filtro}`).click();
  for (const id of ids) await page.getByTestId(`${filtro}-opcao-${id}`).click();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId(`filtro-${filtro}`)).toBeFocused();
}
async function escolherPeriodo(page: Page, rotulo: string): Promise<void> {
  await page.getByTestId('filtro-periodo').click();
  await page.getByRole('radio', { name: rotulo }).click();
  await page.keyboard.press('Escape');
}

const SEQUENCIAS: { id: string; rota: string; passos: ((p: Page) => Promise<void>)[] }[] = [
  {
    id: 'operacional',
    rota: '/operacional?cadencia=semanal',
    passos: [
      (p) => marcar(p, 'equipe', ['fluig', 'dados']),
      (p) => marcar(p, 'tipo', ['melhoria']),
      (p) => escolherPeriodo(p, 'Últimas 4 semanas'),
      (p) => marcar(p, 'sistema', ['fluig']),
    ],
  },
  {
    id: 'tatico',
    rota: '/tatico',
    passos: [(p) => marcar(p, 'sistema', ['crm', 'site-marketing']), (p) => escolherPeriodo(p, 'Últimos 6 meses'), (p) => marcar(p, 'equipe', ['marketing-e-vendas'])],
  },
  {
    id: 'estrategico',
    rota: '/estrategico',
    passos: [(p) => marcar(p, 'sistema', ['protheus']), (p) => escolherPeriodo(p, 'Últimos 6 meses'), (p) => marcar(p, 'sistema', ['senior'])],
  },
  {
    id: 'sustentacao',
    rota: '/operacional?cadencia=sustentacao',
    passos: [(p) => marcar(p, 'prioridade', ['p1', 'p2']), (p) => marcar(p, 'equipe', ['totvs']), (p) => escolherPeriodo(p, 'Últimas 12 semanas')],
  },
];

for (const s of SEQUENCIAS) {
  test(`IF-U-${s.id} estado montado na interface: URL ida e volta, Voltar/Avançar, outra aba`, async ({ page, browser, problemas }) => {
    await page.goto(s.rota);
    const estados: { url: string; r: Retrato }[] = [{ url: page.url(), r: await retrato(page) }];
    for (const passo of s.passos) {
      await passo(page);
      await expect.poll(() => page.url()).not.toBe(estados[estados.length - 1]!.url);
      estados.push({ url: page.url(), r: await retrato(page) });
    }
    // cada ação = exatamente uma entrada no histórico: Voltar percorre os estados na ordem inversa
    for (let i = estados.length - 2; i >= 0; i--) {
      await page.goBack();
      await expect.poll(() => page.url()).toBe(estados[i]!.url);
      expect(await retrato(page), `Voltar até o estado ${i}`).toEqual(estados[i]!.r);
    }
    for (let i = 1; i < estados.length; i++) {
      await page.goForward();
      await expect.poll(() => page.url()).toBe(estados[i]!.url);
      expect(await retrato(page), `Avançar até o estado ${i}`).toEqual(estados[i]!.r);
    }
    // abrir a URL final em um contexto novo (sem memória de sessão) reproduz o mesmo estado
    const final = estados[estados.length - 1]!;
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' });
    const outra = await ctx.newPage();
    await outra.goto(final.url);
    expect(await retrato(outra)).toEqual(final.r);
    expect(outra.url()).toBe(final.url);
    await ctx.close();
    expect(problemas).toEqual([]);
  });
}

// ---------------------------------------------------------------------------------------------
// IF-A: "Não afetado por" precisa ser verdade (tabela 2.2 x cálculo), inclusive nas complementares
// ---------------------------------------------------------------------------------------------
const ROTAS_APLIC: { rota: string; filtros: Record<string, string> }[] = [
  { rota: '/operacional?cadencia=diaria', filtros: { equipe: 'fluig,dados', tipo: 'melhoria,divida-tecnica', sistema: 'fluig,data-lake' } },
  { rota: '/operacional?cadencia=semanal', filtros: { equipe: 'fluig,dados', tipo: 'melhoria,divida-tecnica', sistema: 'fluig,data-lake' } },
  { rota: '/tatico', filtros: { equipe: 'fluig,dados', tipo: 'melhoria,divida-tecnica', sistema: 'fluig,data-lake' } },
  { rota: '/estrategico', filtros: { sistema: 'protheus,crm' } },
];
const PARAM_DO_ROTULO: Record<string, string> = { 'Tipo de demanda': 'tipo', Equipe: 'equipe', Sistema: 'sistema', Período: 'periodo' };

async function abrirComplementares(page: Page): Promise<void> {
  await retrato(page); // a seção "Mais métricas" só existe depois que o painel montou
  const det = page.getByTestId('mais-metricas');
  if (!(await det.count())) return;
  if ((await det.getAttribute('open')) === null) await det.locator('summary').first().click();
  await expect(det).toHaveAttribute('open', '');
  await expect(det.locator('[data-testid^="metrica-"]').first()).toBeVisible({ timeout: 30_000 });
  await esperarPronto(page);
}

for (const caso of ROTAS_APLIC) {
  test(`IF-A ${caso.rota}: cartão que diz "Não afetado por X" não muda quando X sai`, async ({ page }) => {
    // O teste navega uma vez por cartão "Não afetado por" (cada página espera o painel assentar): o orçamento
    // padrão de 30 s vale para o teste inteiro, não para a asserção; na CI /tatico levou 25 s e a semanal estourou em 31 s.
    test.setTimeout(120_000);
    const u = new URL(caso.rota, 'http://x');
    for (const [k, v] of Object.entries(caso.filtros)) u.searchParams.set(k, v);
    await page.goto(u.pathname + u.search.replaceAll('%2C', ','));
    await abrirComplementares(page);
    const com = await retrato(page);
    const divergentes: string[] = [];
    const verificados: string[] = [];
    for (const c of com.cartoes.filter((x) => x.naoAfetado)) {
      const rotulos = c.naoAfetado!.replace('Não afetado por:', '').split(',').map((s) => s.trim());
      const sem = new URL(u.toString());
      for (const r of rotulos) sem.searchParams.delete(PARAM_DO_ROTULO[r] ?? r);
      await page.goto(sem.pathname + sem.search.replaceAll('%2C', ','));
      await abrirComplementares(page);
      const outro = (await retrato(page)).cartoes.find((x) => x.codigo === c.codigo);
      verificados.push(`${c.codigo} (${rotulos.join('/')})`);
      if (outro?.base !== c.base) divergentes.push(`${c.codigo} diz "Não afetado por: ${rotulos.join(', ')}", mas a base muda: "${c.base}" com o filtro x "${outro?.base}" sem`);
    }
    test.info().annotations.push({ type: 'verificados', description: verificados.join('; ') || 'nenhum cartão com "Não afetado por"' });
    expect(divergentes).toEqual([]);
  });
}

// ---------------------------------------------------------------------------------------------
// IF-D: domínios separados na tela
// ---------------------------------------------------------------------------------------------
test('IF-D1 filtros de fluxo na URL da Sustentação ficam guardados e não mudam nenhum cartão', async ({ page }) => {
  await page.goto('/operacional?cadencia=sustentacao');
  const limpo = await retrato(page);
  // CA-6: os filtros do fluxo ficam guardados na URL (voltam nas visões Diária e Semanal) e não tocam nenhum cartão da Sustentação
  await page.goto('/operacional?cadencia=sustentacao&tipo=incidente&sistema=protheus');
  const sujo = await retrato(page);
  expect(paramsOrdenados(page.url())).toBe('cadencia=sustentacao&sistema=protheus&tipo=incidente');
  expect(sujo.chips).toEqual([]);
  expect(sujo).toEqual(limpo);
});

test('IF-D2 prioridade na URL de painéis de fluxo é removida e não muda nenhum cartão', async ({ page }) => {
  for (const rota of ['/operacional?cadencia=diaria', '/tatico', '/estrategico']) {
    await page.goto(rota);
    const limpo = await retrato(page);
    await page.goto(`${rota}${rota.includes('?') ? '&' : '?'}prioridade=p1,p2`);
    const sujo = await retrato(page);
    await expect.poll(() => new URL(page.url()).searchParams.has('prioridade'), rota).toBe(false);
    expect(sujo, rota).toEqual(limpo);
  }
});

test('IF-D3 equipe de sustentação (totvs) não vaza para o fluxo e equipe do fluxo não vaza para a sustentação', async ({ page }) => {
  await page.goto('/operacional?cadencia=sustentacao&equipe=totvs');
  await retrato(page);
  await page.getByRole('navigation').first().getByRole('link', { name: 'Operacional' }).click();
  await expect(page).toHaveURL(/\/operacional$/);
  await page.goto('/operacional?cadencia=diaria&equipe=fluig');
  await retrato(page);
  await page.getByRole('radio', { name: 'Sustentação' }).click({ force: true });
  await expect(page).toHaveURL(/cadencia=sustentacao/);
  const r = await retrato(page);
  expect(r.chips).toEqual([]);
});

test('IF-D4 Estratégico: equipe e tipo guardados aparecem como "não se aplica" e voltam no Tático', async ({ page }) => {
  await page.goto('/operacional?cadencia=diaria&equipe=fluig&tipo=incidente&periodo=4s');
  await retrato(page);
  await page.getByRole('navigation').first().getByRole('link', { name: 'Estratégico' }).click();
  await expect(page).toHaveURL(/\/estrategico/);
  await retrato(page);
  await expect(page.getByTestId('aviso-filtros-nao-aplicaveis')).toContainText('Equipe e Tipo de demanda não se aplicam ao nível estratégico');
  expect(new URL(page.url()).searchParams.has('equipe')).toBe(false);
  expect(new URL(page.url()).searchParams.has('periodo')).toBe(false); // 4s não existe no Estratégico
  await expect(page.getByTestId('filtro-periodo')).toHaveAttribute('aria-label', /Últimos 12 meses/);
  await page.getByRole('navigation').first().getByRole('link', { name: 'Tático' }).click();
  await expect(page).toHaveURL(/\/tatico\?/);
  const p = new URL(page.url()).searchParams;
  expect([p.get('equipe'), p.get('tipo'), p.get('periodo')]).toEqual(['fluig', 'incidente', '4s']);
});

test('IF-D5 Visão geral, catálogo e dados aceitam parâmetros de filtro sem erro e sem quebrar a memória', async ({ page, problemas }) => {
  await page.goto('/operacional?cadencia=diaria&equipe=dados&sistema=data-lake');
  await retrato(page);
  for (const rota of ['/?equipe=fluig&prioridade=p1&periodo=4s', '/metricas?equipe=fluig&tipo=xyz', '/dados?fonte=ac&equipe=fluig&periodo=99', '/dados?fonte=zz']) {
    await page.goto(rota);
    await esperarPronto(page);
    await expect(page.getByRole('heading', { name: 'Não foi possível abrir este painel' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toHaveCount(0);
    expect(verificarSemPessoa(await page.locator('main').innerText()), rota).toEqual([]);
  }
  expect(problemas).toEqual([]);
});

// ---------------------------------------------------------------------------------------------
// IF-I: interação
// ---------------------------------------------------------------------------------------------
test('IF-I01 marcar todas (uma a uma) e desmarcar todas, em cada filtro múltiplo', async ({ page }) => {
  // Cinco rotas, cada uma com navegação, assentar do painel e dezenas de cliques: o teto padrão de 30 s vale para o teste
  // inteiro e estourava na suíte completa local (bug 011F-002); mesmo padrão do IF-A (K-083).
  test.setTimeout(120_000);
  const casos: [string, string, string[]][] = [
    ['/operacional?cadencia=diaria', 'equipe', EQUIPES],
    ['/operacional?cadencia=diaria', 'tipo', TIPOS],
    ['/operacional?cadencia=diaria', 'sistema', SISTEMAS],
    ['/operacional?cadencia=sustentacao', 'equipe', SSSC],
    ['/operacional?cadencia=sustentacao', 'prioridade', PRIORIDADES],
  ];
  for (const [rota, filtro, ids] of casos) {
    const chave = rota.includes('sustentacao') ? `sust_${filtro}` : filtro; // parâmetro da URL (a Sustentação prefixa)
    await page.goto(rota);
    await retrato(page);
    await page.getByTestId(`filtro-${filtro}`).click();
    for (const id of ids) await page.getByTestId(`${filtro}-opcao-${id}`).click();
    await expect.poll(() => new URL(page.url()).searchParams.has(chave), `${rota} ${filtro}: todas marcadas = Todos`).toBe(false);
    await expect(page.getByTestId(`filtro-${filtro}`)).toHaveAttribute('aria-label', /: Tod[ao]s$/);
    // depois de "todas" (que vira Todos e desmarca as caixas), marcar uma volta a filtrar só por ela
    await page.getByTestId(`${filtro}-opcao-${ids[0]}`).click();
    await expect.poll(() => new URL(page.url()).searchParams.get(chave)).toBe(ids[0]);
    await page.getByTestId(`${filtro}-opcao-${ids[0]}`).click();
    await expect.poll(() => new URL(page.url()).searchParams.has(chave)).toBe(false);
    // botão "Limpar" do popover
    await page.getByTestId(`${filtro}-opcao-${ids[1]}`).click();
    await expect.poll(() => new URL(page.url()).searchParams.get(chave)).toBe(ids[1]);
    await page.getByRole('button', { name: 'Limpar', exact: true }).click();
    await expect.poll(() => new URL(page.url()).searchParams.has(chave)).toBe(false);
    await page.keyboard.press('Escape');
  }
});

test('IF-I02 "Limpar filtros" zera tudo e preserva cadência e abas locais', async ({ page }) => {
  await page.goto('/operacional?cadencia=semanal&o3=melhoria&equipe=fluig&tipo=incidente&sistema=fluig&periodo=4s');
  await retrato(page);
  await page.getByTestId('limpar-filtros').click();
  await expect.poll(() => paramsOrdenados(page.url())).toBe('cadencia=semanal&o3=melhoria');
  const r = await retrato(page);
  expect(r.chips).toEqual([]);
  await page.goBack();
  await expect.poll(() => new URL(page.url()).searchParams.get('equipe')).toBe('fluig');
});

test('IF-I03 cliques rápidos em sequência no mesmo popover (FIL-04), 5 rodadas', async ({ page }) => {
  await page.goto('/operacional?cadencia=diaria');
  await retrato(page);
  for (let rodada = 0; rodada < 5; rodada++) {
    await page.getByTestId('filtro-equipe').click();
    const alvo = EQUIPES.slice(0, 2 + (rodada % 4)); // 2 a 5 equipes
    for (const id of alvo) await page.getByTestId(`equipe-opcao-${id}`).click({ delay: 0 });
    await page.keyboard.press('Escape');
    await expect.poll(() => (new URL(page.url()).searchParams.get('equipe') ?? '').split(',').sort().join(',')).toBe([...alvo].sort().join(','));
    await page.getByTestId('limpar-filtros').click();
    await expect.poll(() => new URL(page.url()).searchParams.has('equipe')).toBe(false);
  }
});

test('IF-I04 cliques no mesmo tick (dispatch síncrono) não perdem marcação', async ({ page }) => {
  await page.goto('/operacional?cadencia=diaria');
  await retrato(page);
  await page.getByTestId('filtro-equipe').click();
  await page.evaluate(() => {
    for (const id of ['fluig', 'dados', 'senior']) (document.querySelector(`[data-testid="equipe-opcao-${id}"]`) as HTMLInputElement).click();
  });
  await expect.poll(() => (new URL(page.url()).searchParams.get('equipe') ?? '').split(',').sort().join(',')).toBe('dados,fluig,senior');
});

test('IF-I05 sob CPU 6x mais lenta: filtro seguido de troca de cadência não perde o filtro', async ({ page }) => {
  await page.goto('/operacional?cadencia=diaria');
  await retrato(page);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  await page.getByTestId('filtro-equipe').click();
  await page.getByTestId('equipe-opcao-fluig').click();
  await page.keyboard.press('Escape');
  await page.getByTestId('seletor-cadencia').getByText('Semanal', { exact: true }).click();
  await expect.poll(() => paramsOrdenados(page.url()), { timeout: 30_000 }).toBe('cadencia=semanal&equipe=fluig');
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
});

test('IF-I06 sob CPU 6x mais lenta: remover dois chips em sequência remove os dois', async ({ page }) => {
  await page.goto('/operacional?cadencia=diaria&equipe=fluig,dados&tipo=incidente');
  await retrato(page);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  await page.getByRole('button', { name: 'Remover filtro Equipe: Fluig' }).click();
  await page.getByRole('button', { name: 'Remover filtro Tipo de demanda: Incidente' }).click();
  await expect.poll(() => paramsOrdenados(page.url()), { timeout: 30_000 }).toBe('cadencia=diaria&equipe=dados');
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
});

test('IF-I07 mesmo tick, filtros diferentes (equipe e depois tipo) na folha de 375 px: os dois ficam', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/operacional?cadencia=diaria');
  await retrato(page);
  await page.getByTestId('abrir-filtros').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.evaluate(() => {
    (document.querySelector('[role="dialog"] [data-testid="equipe-opcao-fluig"]') as HTMLInputElement).click();
    (document.querySelector('[role="dialog"] [data-testid="tipo-opcao-incidente"]') as HTMLInputElement).click();
  });
  await expect.poll(() => paramsOrdenados(page.url())).toBe('cadencia=diaria&equipe=fluig&tipo=incidente');
});

test('IF-I08 teclado: Tab até o filtro, Espaço abre, Tab/Espaço marca, Esc fecha e devolve o foco', async ({ page }) => {
  await page.goto('/operacional?cadencia=sustentacao');
  await retrato(page);
  await page.getByTestId('filtro-prioridade').focus();
  await page.keyboard.press('Space');
  const p1 = page.getByTestId('prioridade-opcao-p1');
  await expect(p1).toBeVisible();
  // o foco vai para dentro do popover; Tab até a P1 e Espaço marca
  for (let i = 0; i < 6 && !(await p1.evaluate((e) => e === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(p1).toBeFocused();
  await page.keyboard.press('Space');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Space'); // P2
  await expect.poll(() => new URL(page.url()).searchParams.get('sust_prioridade')).toBe('p1,p2');
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('filtro-prioridade')).toBeFocused();
  await expect(page.getByTestId('filtro-prioridade')).toHaveAttribute('aria-label', 'Prioridade: 2 selecionadas');
  // Tab até "Limpar filtros" e Enter
  await page.getByTestId('limpar-filtros').focus();
  await page.keyboard.press('Enter');
  await expect.poll(() => new URL(page.url()).search).toBe('?cadencia=sustentacao');
  // período por teclado: setas no grupo de rádio
  await page.getByTestId('filtro-periodo').focus();
  await page.keyboard.press('Enter');
  await page.getByRole('radio', { name: 'Últimos 6 meses' }).focus();
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => new URL(page.url()).searchParams.get('sust_periodo')).toBe('12m');
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('filtro-periodo')).toBeFocused();
});

for (const tela of [{ w: 375, h: 812 }, { w: 1280, h: 800 }]) {
  for (const tema of ['claro', 'escuro'] as const) {
    test(`IF-I09 ${tela.w} px, tema ${tema}: filtros aplicados, axe sem violações sérias, sem rolagem horizontal`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('metricas-dspd:tema', t), tema);
      await page.setViewportSize({ width: tela.w, height: tela.h });
      await page.goto('/tatico');
      await retrato(page);
      if (tela.w < 768) {
        await page.getByTestId('abrir-filtros').click();
        const folha = page.getByRole('dialog');
        await folha.getByTestId('equipe-opcao-fluig').click();
        await folha.getByTestId('tipo-opcao-melhoria').click();
        await folha.getByRole('radio', { name: 'Últimas 4 semanas' }).click();
        const a = await rodarAxe(page, { incluir: '[role="dialog"]' }); // o fundo fica sob o véu do diálogo
        await expect.poll(() => paramsOrdenados(page.url()), 'os três filtros marcados na folha').toBe('equipe=fluig&periodo=4s&tipo=melhoria');
        expect(a.bloqueantes, JSON.stringify(a.bloqueantes)).toEqual([]);
        await folha.getByRole('button', { name: 'Ver resultados' }).click();
        await expect(page.getByTestId('abrir-filtros')).toHaveText(/Filtros \(3\)/);
        // a folha inteira é uma entrada de histórico: Voltar volta para sem filtro
        await expect.poll(() => paramsOrdenados(page.url())).toBe('equipe=fluig&periodo=4s&tipo=melhoria');
        await page.goBack();
        await expect.poll(() => new URL(page.url()).search).toBe('');
        await page.goForward();
      } else {
        await marcar(page, 'equipe', ['fluig']);
        await marcar(page, 'tipo', ['melhoria']);
        await escolherPeriodo(page, 'Últimas 4 semanas');
      }
      await retrato(page);
      const a = await rodarAxe(page);
      expect(a.bloqueantes, JSON.stringify(a.bloqueantes)).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    });
  }
}

test('IF-I10 preferências ocultando cartões + filtros: ocultos continuam ocultos, visíveis filtram, URL não muda', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'metricas-dspd:preferencias:v1',
      JSON.stringify({ versao: 1, paineis: { operacional: { ocultar: ['o9', 'o10'] }, sustentacao: { ocultar: ['s1'] } }, atualizadoEm: '2026-10-10T00:00:00.000Z' }),
    ),
  );
  await page.goto('/operacional?cadencia=semanal');
  const sem = await retrato(page);
  expect(sem.cartoes.map((c) => c.codigo)).not.toContain('O9');
  expect(sem.cartoes.map((c) => c.codigo)).not.toContain('O10');
  await marcar(page, 'equipe', ['senior']);
  await marcar(page, 'sistema', ['senior']);
  const com = await retrato(page);
  expect(com.cartoes.map((c) => c.codigo)).toEqual(sem.cartoes.map((c) => c.codigo));
  await expect(page.getByTestId('faixa-ocultas')).toContainText('O9');
  expect(paramsOrdenados(page.url())).toBe('cadencia=semanal&equipe=senior&sistema=senior');
  // ocultar mais um com filtro ativo: a URL de filtros não muda
  await page.getByTestId('ocultar-O4').click();
  await expect(page.getByTestId('metrica-O4')).toHaveCount(0);
  expect(paramsOrdenados(page.url())).toBe('cadencia=semanal&equipe=senior&sistema=senior');
  await page.goto('/operacional?cadencia=sustentacao&sust_prioridade=p1');
  const s = await retrato(page);
  expect(s.cartoes.map((c) => c.codigo)).not.toContain('S1');
});

test('IF-I11 compartilhar link: "Copiar link" leva os filtros (sem `mock`) e abre o mesmo estado', async ({ page, browser, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/operacional?cadencia=semanal&mock=sem-calibracao');
  await retrato(page);
  await marcar(page, 'equipe', ['erp-protheus', 'fluig']);
  await marcar(page, 'tipo', ['defeito-producao']);
  const r = await retrato(page);
  await page.getByTestId('copiar-link').click();
  await expect(page.getByText('Link copiado.')).toBeVisible();
  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(new URL(link).searchParams.has('mock')).toBe(false);
  expect(paramsOrdenados(link)).toBe('cadencia=semanal&equipe=erp-protheus,fluig&tipo=defeito-producao');
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' });
  const outra = await ctx.newPage();
  await outra.goto(link);
  const r2 = await retrato(outra);
  expect(r2.botoes).toEqual(r.botoes);
  expect(r2.chips).toEqual(r.chips);
  expect(r2.cartoes.map((c) => c.codigo)).toEqual(r.cartoes.map((c) => c.codigo));
  await ctx.close();
});

test('IF-I12 combinações sem dados: estado vazio/insuficiente correto, nunca erro', async ({ page, problemas }) => {
  // equipe e sistema sem interseção (cada sistema pertence a uma equipe no mock)
  for (const url of [
    '/operacional?cadencia=diaria&equipe=fluig&sistema=protheus',
    '/operacional?cadencia=semanal&equipe=fluig&sistema=protheus',
    '/tatico?equipe=dados&sistema=crm',
    '/espera-invisivel?equipe=senior&sistema=core-5g',
    '/estrategico?sistema=portal-do-cliente&periodo=6m',
    '/operacional?cadencia=sustentacao&sust_equipe=fluig&sust_prioridade=p1&sust_periodo=4s',
  ]) {
    await page.goto(url);
    const r = await retrato(page);
    for (const c of r.cartoes) expect(['ok', 'vazio', 'insuficiente'], `${url} ${c.codigo}=${c.estado}`).toContain(c.estado);
    // percentual/percentil nunca aparece em cartão com amostra insuficiente
    for (const c of r.cartoes.filter((x) => x.estado === 'insuficiente')) {
      const txt = await page.getByTestId(`metrica-${c.codigo}`).innerText();
      expect(txt, `${url} ${c.codigo}`).not.toMatch(/\bP(50|85|95)\b[^\n]*\d/);
    }
    const textoMain = await page.locator('main').innerText();
    expect(verificarSemPessoa(textoMain), url).toEqual([]);
  }
  expect(problemas).toEqual([]);
});

test('IF-I13 dois filtros diferentes em sequência na barra (sem esperar o painel) mantêm os dois', async ({ page }) => {
  // Uso comum: marcar Equipe, fechar e já abrir Tipo de demanda. Sem esperar o painel recarregar.
  for (const rota of ['/operacional?cadencia=semanal', '/tatico', '/operacional?cadencia=sustentacao']) {
    await page.goto(rota);
    await retrato(page);
    const sust = rota.startsWith('/operacional?cadencia=sustentacao');
    await marcar(page, 'equipe', [sust ? 'senior' : 'fluig']);
    await marcar(page, sust ? 'prioridade' : 'tipo', [sust ? 'p2' : 'incidente']);
    const esperado = new URL(rota, 'http://x').searchParams;
    esperado.set(sust ? 'sust_equipe' : 'equipe', sust ? 'senior' : 'fluig');
    esperado.set(sust ? 'sust_prioridade' : 'tipo', sust ? 'p2' : 'incidente');
    await expect.poll(() => paramsOrdenados(page.url()), rota).toBe(paramsOrdenados(`http://x/?${esperado.toString()}`));
  }
});
