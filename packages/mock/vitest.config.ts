import { defineConfig } from 'vitest/config'

// fileParallelism desligado: o teste de desempenho mede tempo e não pode competir com outros arquivos.
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    testTimeout: 15000,
    fileParallelism: false,
  },
})
