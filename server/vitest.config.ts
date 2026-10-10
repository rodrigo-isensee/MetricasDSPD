import { defineConfig } from 'vitest/config'

// Dois projetos: `unit` (sem banco, sempre roda) e `pg` (contra o Postgres do Compose; sem PG_TESTE_URL fica pulado).
// `pg` roda um conjunto de schemas por execução (globalSetup/globalTeardown) e sem paralelismo de arquivos.
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 30000,
    projects: [
      { extends: true, test: { name: 'unit', include: ['tests/**/*.test.ts'], exclude: ['tests/**/*.pg.test.ts'] } },
      {
        extends: true,
        test: {
          name: 'pg',
          include: ['tests/**/*.pg.test.ts'],
          globalSetup: ['tests/pg/global-setup.ts'],
          fileParallelism: false,
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.d.ts'],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
})
