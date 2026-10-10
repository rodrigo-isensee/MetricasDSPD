// Orçamento de bundle (ADR 0003, F6 a F9). Rode depois do `npm run build`.
// Classifica os chunks de dist/assets (gzip) em inicial, rota, gráficos e mock/biblioteca.
import { readdirSync, readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'

const dir = new URL('../dist/assets/', import.meta.url).pathname
const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8')
const iniciais = new Set([...html.matchAll(/assets\/([^"']+\.js)/g)].map((m) => m[1]))
const KB = 1024
const limites = { inicial: 200, rota: 60, graficos: 130, mock: 120 }

const arquivos = readdirSync(dir).filter((f) => f.endsWith('.js'))
const linhas = arquivos.map((f) => {
  const codigo = readFileSync(join(dir, f), 'utf8')
  const gz = gzipSync(codigo).length / KB
  let tipo = 'rota'
  if (iniciais.has(f)) tipo = 'inicial'
  else if (/^graficos-/.test(f)) tipo = 'graficos'
  else if (/^(mock|metrics)-/.test(f) || /gerarBaseMock|mulberry32/.test(codigo)) tipo = 'mock'
  return { f, tipo, gz }
})
const soma = (t) => linhas.filter((l) => l.tipo === t).reduce((s, l) => s + l.gz, 0)

let falhou = false
console.log('Chunk'.padEnd(44), 'Tipo'.padEnd(9), 'gzip (KB)')
for (const l of linhas.sort((a, b) => a.tipo.localeCompare(b.tipo)))
  console.log(l.f.padEnd(44), l.tipo.padEnd(9), l.gz.toFixed(2))
const ini = soma('inicial')
console.log(
  `\nF6 inicial (todos os chunks do index.html): ${ini.toFixed(2)} KB (< ${limites.inicial}) ${ini < limites.inicial ? 'ok' : 'FALHOU'}`,
)
if (ini >= limites.inicial) falhou = true
for (const l of linhas.filter((x) => x.tipo === 'rota')) {
  const alerta = l.gz >= limites.rota
  if (alerta) console.log(`F7 alerta: ${l.f} ${l.gz.toFixed(2)} KB (>= ${limites.rota})`)
}
const g = soma('graficos')
console.log(
  `F8 gráficos: ${g.toFixed(2)} KB (< ${limites.graficos}) ${g < limites.graficos ? 'ok' : 'FALHOU'}`,
)
if (g >= limites.graficos) falhou = true
const m = soma('mock')
console.log(
  `F9 mock + biblioteca: ${m.toFixed(2)} KB (< ${limites.mock}; fora do inicial, alerta de tamanho) ${m < limites.mock ? 'ok' : 'alerta'}`,
)
if (linhas.some((l) => l.tipo === 'mock' && iniciais.has(l.f))) {
  console.log('F9 FALHOU: mock no bundle inicial')
  falhou = true
}
process.exit(falhou ? 1 : 0)
