// Orçamento de bundle (ADR 0003, F6 a F9). Rode depois do `pnpm run build`.
// Classifica os chunks de dist/assets (gzip) em inicial, rota, gráficos e mock/biblioteca.
import { readdirSync, readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'
import { calcularF9 } from './f9.mjs'

const dir = new URL('../dist/assets/', import.meta.url).pathname
const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8')
const iniciais = new Set([...html.matchAll(/assets\/([^"']+\.js)/g)].map((m) => m[1]))
const KB = 1024
const limites = { inicial: 200, rota: 60, graficos: 130, mock: 120, exportar: 150 }

const arquivos = readdirSync(dir).filter((f) => f.endsWith('.js'))
const linhas = arquivos.map((f) => {
  const codigo = readFileSync(join(dir, f), 'utf8')
  const gz = gzipSync(codigo).length / KB
  let tipo = 'rota'
  if (iniciais.has(f)) tipo = 'inicial'
  else if (/^graficos-/.test(f)) tipo = 'graficos'
  else if (/^(exportar-pdf|desenhista)-/.test(f)) tipo = 'exportar'
  // Dependências opcionais do jsPDF (html(), SVG): nunca pedidas pelo app; só informativas.
  else if (/^(purify\.es|html2canvas|index\.es)-/.test(f)) tipo = 'opcional'
  // O núcleo do mock (chunk do Worker e fallback em processo, ADR 0021) é mock/biblioteca (F9), nunca inicial (F6).
  else if (
    /^(mock|metrics|nucleoMock(\.worker)?)-/.test(f) ||
    /gerarBaseMock|mulberry32/.test(codigo)
  )
    tipo = 'mock'
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
const x = soma('exportar')
console.log(
  `F11 exportar-pdf (jsPDF + desenhista): ${x.toFixed(2)} KB (< ${limites.exportar}; só sob demanda) ${x < limites.exportar ? 'ok' : 'FALHOU'}`,
)
if (x >= limites.exportar || linhas.some((l) => l.tipo === 'exportar' && iniciais.has(l.f))) {
  console.log('F11 FALHOU: chunk acima do orçamento ou no bundle inicial')
  falhou = true
}
// F9 (ADR 0021 §8): maior caminho baixado (Worker ou processo), nunca a soma dos dois.
const f9 = calcularF9({ linhas, iniciais, lerCodigo: (f) => readFileSync(join(dir, f), 'utf8') })
for (const aviso of f9.avisos) console.log(aviso)
if (f9.worker)
  console.log(`F9 caminho worker: ${f9.worker.chunks.join(', ')} = ${f9.worker.soma.toFixed(2)} KB`)
if (f9.processo)
  console.log(
    `F9 caminho processo: ${f9.processo.chunks.join(', ')} = ${f9.processo.soma.toFixed(2)} KB`,
  )
console.log(
  `F9 mock + biblioteca (maior caminho: ${f9.caminho}): ${f9.max.toFixed(2)} KB (< ${limites.mock}; fora do inicial, alerta de tamanho) ${f9.max < limites.mock ? 'ok' : 'alerta'}`,
)
console.log(
  `F9 informativo: soma de todos os chunks mock (medida anterior a 2026-10-29): ${f9.somaTodos.toFixed(2)} KB`,
)
if (f9.falhaInicial) {
  console.log('F9 FALHOU: mock no bundle inicial')
  falhou = true
}
process.exit(falhou ? 1 : 0)
