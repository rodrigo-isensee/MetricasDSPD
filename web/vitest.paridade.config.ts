import { defineConfig } from 'vitest/config'

// FA-4: paridade mock x API. Fora do `vitest run` padrão (precisa da API de pé); sem `API_URL` os testes ficam pulados.
export default defineConfig({
  test: { environment: 'node', include: ['paridade/**/*.test.ts'], testTimeout: 120_000 },
})
