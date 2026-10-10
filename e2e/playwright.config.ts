import { defineConfig, devices } from '@playwright/test';

// E2E contra `vite preview` de ../web (ADR 0001). Nada de dados reais: o app usa o mock.
const PORTA = 4173;
const PORTA_ALT = 4174; // build com outra semente (critério C80)
const CI = !!process.env.CI;

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
  webServer: [
    {
      command: `npm --prefix ../web run build && npm --prefix ../web run preview -- --port ${PORTA} --strictPort`,
      url: `http://localhost:${PORTA}`,
      reuseExistingServer: !CI,
      timeout: 180_000,
    },
    ...(process.env.E2E_SEM_ALT
      ? []
      : [{
      // semente alternativa: o diretório de saída é separado para não sobrescrever o build padrão
      command:
        `cd ../web && VITE_MOCK_SEMENTE=7 npx vite build --outDir dist-alt --emptyOutDir && ` +
        `npx vite preview --outDir dist-alt --port ${PORTA_ALT} --strictPort`,
      url: `http://localhost:${PORTA_ALT}`,
      reuseExistingServer: !CI,
      timeout: 180_000,
    }]),
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /semente-alt\.spec\.ts/,
    },
    {
      // Medição de performance (ADR 0003): desktop 1366x768, build de produção. Rode com `npm run test:perf`.
      name: 'perf',
      testDir: './perf',
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
