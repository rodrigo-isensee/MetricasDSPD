import { defineConfig } from 'vitest/config'

// FA-4: paridade mock x API. Fora do `vitest run` padrão (precisa da API de pé): rode por `scripts/com-api-mock.sh`.
// Sem `API_URL`, falha em vez de terminar verde com tudo pulado (falsa aprovação).
if (!process.env.API_URL) {
  throw new Error(
    'API_URL ausente: use `bash scripts/com-api-mock.sh pnpm --dir web run test:paridade`',
  )
}
export default defineConfig({
  test: { environment: 'node', include: ['paridade/**/*.test.ts'], testTimeout: 120_000 },
})
