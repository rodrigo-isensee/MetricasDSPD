import { defineConfig, devices } from '@playwright/test';

// E2E contra `vite preview` de ../web (ADR 0001). Nada de dados reais: o app usa o mock.
const PORTA = 4173;
const PORTA_ALT = 4174; // build com outra semente (critério C80)
const CI = !!process.env.CI;
// FA-5: com E2E_API_URL (API real local, `scripts/com-api-mock.sh`) a suíte roda só os projetos `*-api`, contra a SPA
// buildada com VITE_FONTE=api, servida pelo `vite preview` com /api encaminhado à API (mesma origem, sem CORS).
// Sem essa variável nada muda: os demais projetos são o grupo @mock (SPA com o mock embutido).
const API_URL = process.env.E2E_API_URL;
const PORTA_API = 4175;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORTA}`,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: API_URL ? [
    {
      // outDir próprio: não sobrescreve o build do mock
      command:
        `cd ../web && VITE_FONTE=api pnpm exec vite build --outDir dist-api --emptyOutDir && ` +
        `VITE_API_PROXY=${API_URL} pnpm exec vite preview --outDir dist-api --port ${PORTA_API} --strictPort`,
      url: `http://localhost:${PORTA_API}`,
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ] : [
    {
      command: `pnpm --dir ../web run build && pnpm --dir ../web run preview --port ${PORTA} --strictPort`,
      url: `http://localhost:${PORTA}`,
      reuseExistingServer: !CI,
      timeout: 180_000,
    },
    ...(process.env.E2E_SEM_ALT
      ? []
      : [{
      // semente alternativa: o diretório de saída é separado para não sobrescrever o build padrão
      command:
        `cd ../web && VITE_MOCK_SEMENTE=7 pnpm exec vite build --outDir dist-alt --emptyOutDir && ` +
        `pnpm exec vite preview --outDir dist-alt --port ${PORTA_ALT} --strictPort`,
      url: `http://localhost:${PORTA_ALT}`,
      reuseExistingServer: !CI,
      timeout: 180_000,
    }]),
  ],
  projects: API_URL ? [
    {
      name: 'chromium-api',
      testDir: './tests-api',
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${PORTA_API}` },
    },
    {
      // Desempenho pela API (ADR 0003: F1 a F5 no navegador, A1 por requisição). Rode com `pnpm run test:perf:api`.
      name: 'perf-api',
      testDir: './perf',
      testMatch: /(perf|perf-api)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 }, baseURL: `http://localhost:${PORTA_API}`, trace: 'off', screenshot: 'off' },
      fullyParallel: false,
      workers: 1,
      timeout: 120_000,
    },
  ] : [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /semente-alt\.spec\.ts/,
    },
    {
      // Medição de performance (ADR 0003): desktop 1366x768, build de produção. Rode com `pnpm run test:perf`.
      name: 'perf',
      testDir: './perf',
      testIgnore: /perf-api\.spec\.ts/, // A1 pela API só existe no projeto `perf-api` (exige E2E_API_URL)
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 }, trace: 'off', screenshot: 'off' },
      fullyParallel: false,
      workers: 1,
      timeout: 120_000,
    },
    {
      name: 'chromium-semente-alt',
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${PORTA_ALT}` },
      testMatch: /semente-alt\.spec\.ts/,
    },
    // Firefox e WebKit só no CI e só para os casos @smoke (XBR-01)
    ...(CI
      ? [
          { name: 'firefox', use: { ...devices['Desktop Firefox'] }, grep: /@smoke/, testIgnore: /semente-alt\.spec\.ts/ },
          { name: 'webkit', use: { ...devices['Desktop Safari'] }, grep: /@smoke/, testIgnore: /semente-alt\.spec\.ts/ },
        ]
      : []),
  ],
});
