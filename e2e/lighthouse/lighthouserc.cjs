// Lighthouse CI (ADR 0003, F10): Performance >= 90 e Acessibilidade >= 95, perfil desktop, as 6 rotas, sobre `vite preview`.
// Uso: `npm run lighthouse` (usa scripts/lighthouse.sh: faz build, descobre o Chromium do Playwright e roda o lhci).
// Chrome: variável CHROME_PATH (o script a preenche com o Chromium do Playwright).
const PORTA = process.env.LHCI_PORTA || '4175'; // porta própria para não colidir com o preview dos testes (4173/4174)
const rotas = ['/', '/operacional', '/tatico', '/estrategico', '/sustentacao', '/espera-invisivel'];

module.exports = {
  ci: {
    collect: {
      url: rotas.map((r) => `http://localhost:${PORTA}${r}`),
      numberOfRuns: Number(process.env.LHCI_RUNS || 3), // mediana de 3 execuções por rota
      startServerCommand: `npm --prefix ../web exec -- vite preview --port ${PORTA} --strictPort`,
      startServerReadyPattern: 'Local',
      startServerReadyTimeout: 60000,
      settings: {
        preset: 'desktop', // 1350x940, sem limitação de CPU e rede "desktop"
        chromeFlags: '--no-sandbox --headless=new',
        onlyCategories: ['performance', 'accessibility'],
      },
    },
    assert: {
      // média por URL das execuções (aggregationMethod padrão = pessimistic; usamos a mediana para reduzir ruído)
      assertions: {
        'categories:performance': ['error', { minScore: 0.9, aggregationMethod: 'median-run' }],
        'categories:accessibility': ['error', { minScore: 0.95, aggregationMethod: 'median-run' }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2000, aggregationMethod: 'median-run' }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1, aggregationMethod: 'median-run' }],
      },
    },
    upload: { target: 'filesystem', outputDir: './lighthouse/relatorios' },
  },
};
