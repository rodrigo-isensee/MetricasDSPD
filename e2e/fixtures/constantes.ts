// Constantes compartilhadas pelos testes. Ver docs/qa/plano-testes-dashboard-mock.md.
export const ROTAS = {
  visaoGeral: '/',
  operacional: '/operacional',
  operacionalSemanal: '/operacional?cadencia=semanal',
  tatico: '/tatico',
  estrategico: '/estrategico',
  sustentacao: '/sustentacao',
  esperaInvisivel: '/espera-invisivel',
  ajuda: '/ajuda',
  naoEncontrada: '/rota-inexistente',
} as const;

export const TEMAS = ['light', 'dark'] as const; // valor de `colorScheme` do Playwright

export const VIEWPORTS = [
  { nome: '320', width: 320, height: 568 },
  { nome: '375', width: 375, height: 812 },
  { nome: '640', width: 640, height: 900 },
  { nome: '768', width: 768, height: 1024 },
  { nome: '1024', width: 1024, height: 768 },
  { nome: '1280', width: 1280, height: 800 },
  { nome: '1440', width: 1440, height: 900 },
  { nome: '1920', width: 1920, height: 1080 },
] as const;

export const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa'];

// Núcleo de métricas por rota (critério C93). Bloqueados agora e EI: ids a definir (lacuna L5).
export const METRICAS_POR_ROTA = {
  operacionalDiaria: ['O2', 'O1'],
  operacionalSemanal: ['O3', 'O9', 'O4', 'O12', 'O10', 'O7', 'O15', 'O18'],
  tatico: ['T2', 'T1', 'T5', 'T4', 'T3', 'T9', 'T7'],
  estrategico: ['E1', 'E2', 'E3'],
  sustentacao: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'],
} as const;

// Termos que não podem aparecer em nenhuma tela (INV-01, INV-04). Listas brancas por caso.
export const TERMOS_PROIBIDOS_PESSOA = [/Pessoa \d+/i, /respons[aá]ve(l|is)/i, /\bagentes?\b/i, /\branking\b/i, /assignee/i];

export const DATA_CORTE = '09/10/2026';

// ---------------------------------------------------------------------------
// Revisão 2 do plano (spec rev. 2): rotas, testids, ids de `?mock=` e orçamento.
// ---------------------------------------------------------------------------

/** As 6 rotas de painel (Lighthouse, perf, axe, varreduras). */
export const ROTAS_PAINEL = [
  ROTAS.visaoGeral,
  ROTAS.operacional,
  ROTAS.tatico,
  ROTAS.estrategico,
  ROTAS.sustentacao,
  ROTAS.esperaInvisivel,
] as const;

/** Slug de `painel-{slug}` por rota (spec 10, convenção L5). */
export const SLUG_PAINEL = {
  [ROTAS.visaoGeral]: 'visao-geral',
  [ROTAS.operacional]: 'operacional',
  [ROTAS.tatico]: 'tatico',
  [ROTAS.estrategico]: 'estrategico',
  [ROTAS.sustentacao]: 'sustentacao',
  [ROTAS.esperaInvisivel]: 'espera-invisivel',
  [ROTAS.ajuda]: 'ajuda',
} as const;

/** Códigos de cartão (maiúsculas, como em `metrica-{codigo}`), incluindo BLOQUEADOS e EI-* (critério 110). */
export const CARTOES_POR_ROTA = {
  operacionalDiaria: ['O2', 'BLOQUEADOS', 'O1'],
  operacionalSemanal: ['O3', 'O9', 'EI-FL1', 'O4', 'O12', 'O10', 'O7', 'O15', 'O18'],
  tatico: ['T2', 'T1', 'T5', 'T4', 'T3', 'T9', 'T7', 'EI-FL2'],
  estrategico: ['E1', 'E2', 'E3', 'EI-FL3'],
  sustentacao: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'EI-SUST'],
  esperaInvisivel: ['EI-FL1', 'EI-FL2', 'EI-FL3', 'EI-SUST'],
} as const;

/** Seções da cadência semanal e ordem (critério 31). */
export const SECOES_SEMANAL = ['tempo', 'fluxo', 'compromissos', 'backlog', 'qualidade'] as const;
export const NIVEIS_EI = ['fl1', 'fl2', 'fl3', 'sust'] as const;

/** Ids válidos de `?mock=erro:{id}` (spec 6.6). */
export const IDS_MOCK = {
  fluxo: ['o1', 'o2', 'o3', 'o4', 'o7', 'o9', 'o10', 'o12', 'o15', 'o18', 't1', 't2', 't3', 't4', 't5', 't7', 't9', 'e1', 'e2', 'e3', 'bloqueados', 'ei-fl1', 'ei-fl2', 'ei-fl3'],
  sustentacao: ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 'ei-sust'],
  visaoGeral: ['atencao', 'nivel-operacional', 'nivel-tatico', 'nivel-estrategico', 'nivel-sustentacao'],
} as const;

/** Slugs do mock (spec 2.5). A lista real vem da fonte; os testes comparam com `opcoesFiltro` quando possível. */
export const SLUGS = {
  equipesFluxo: ['erp-protheus', 'fluig', 'senior', 'marketing-vendas', 'dados', 'plataforma-5g'],
  sistemas: ['protheus', 'fluig', 'senior', 'crm', 'site-marketing', 'data-lake', 'core-5g', 'portal-cliente'],
  equipesSssc: ['totvs', 'senior', 'fluig'],
  tipos: ['incidente', 'requisicao', 'melhoria', 'bug-interno', 'defeito-producao', 'divida-tecnica'],
} as const;

export const TEMA = { chave: 'metricas-dspd:tema', valores: ['claro', 'escuro', 'sistema'] } as const;

/** Orçamento do ADR 0003 (somente os itens medidos pelo E2E e pelos scripts de `e2e/`). */
export const ORCAMENTO = {
  F1_lcpMs: 2000,
  F2_cls: 0.1,
  F3_inpMs: 200,
  F4_respostaVisualMs: 100,
  F5_painelMs: 500,
  F6_inicialGzipKB: 200,
  F7_rotaGzipKB: 60,
  F8_graficosGzipKB: 130,
  F9_mockGzipKB: 120,
  F10_lighthousePerformance: 90,
  F10_lighthouseAcessibilidade: 95,
  C5_heapMB: 150,
  C6_tarefaLongaMs: 200,
  repeticoes: 20,
} as const;
