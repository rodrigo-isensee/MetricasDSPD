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
