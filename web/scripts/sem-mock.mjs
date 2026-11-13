// Guarda G1 (ADR 0030, D6): o build `api` não leva o código do mock. Rode depois do `build` (`pnpm run pronto`).
// Falha com chunk `nucleoMock*` ou `mock-*`, com a sentinela do mock, ou com os textos "Simulado" ou "Dados de exemplo".
// Uso: node scripts/sem-mock.mjs [pasta do build]   (padrão: dist, o build sem VITE_FONTE, que é `api`)
import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
// Importada, não copiada: o script e o mock partilham a mesma cadeia, sem deriva (o Node tira os tipos do .ts).
import { SENTINELA_MOCK as SENTINELA } from '../src/data/mock/sentinela.ts'

const raiz = process.argv[2]
  ? resolve(process.argv[2])
  : fileURLToPath(new URL('../dist/', import.meta.url))
const dir = join(raiz, 'assets')

// Chunk do núcleo (`nucleoMock*`), do pacote (`mock-*`) ou da fonte (`MockFonteMetricas-*`): qualquer nome com "mock".
const NOME_DO_MOCK = /mock/i
// "Simulado" como texto da interface; identificadores como `ErroSimulado` não contam.
const TEXTOS = [SENTINELA, /\bSimulado\b/, 'Dados de exemplo']

const problemas = []
for (const f of readdirSync(dir)) {
  if (NOME_DO_MOCK.test(f)) problemas.push(`${f}: chunk do mock no build api`)
  if (!/\.(js|mjs|css)$/.test(f)) continue
  const codigo = readFileSync(join(dir, f), 'utf8')
  for (const t of TEXTOS) {
    const achou = typeof t === 'string' ? codigo.includes(t) : t.test(codigo)
    if (achou) problemas.push(`${f}: contém ${typeof t === 'string' ? `"${t}"` : String(t)}`)
  }
}

if (problemas.length > 0) {
  console.error('G1 FALHOU: o build api traz código ou texto do mock (ADR 0030):')
  for (const p of problemas) console.error(`  - ${p}`)
  process.exit(1)
}
console.log(`G1 ok: sem chunk, sentinela ou texto do mock em ${dir}`)
