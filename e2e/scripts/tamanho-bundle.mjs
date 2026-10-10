#!/usr/bin/env node
// Tamanho gzip do bundle por chunk (ADR 0003, F6 a F9). Node puro, sem dependências.
// Uso: node scripts/tamanho-bundle.mjs [--dist ../web/dist] [--json saida.json]
// Código de saída: 1 se algum item que BLOQUEIA (F6, F8, F9-fora-do-inicial) estourar; alertas (F7, tamanho de F9) não falham.
//
// Classificação (nesta ordem):
//  1. Inicial: arquivos .js ligados ao index.html (script module + modulepreload) e, transitivamente, as importações
//     ESTÁTICAS entre eles. Importações dinâmicas (`import("./x.js")`) NÃO são iniciais.
//  2. Gráficos: chunk que contém código do Recharts/d3 (assinaturas) ou cujo nome tem "chart"/"recharts".
//  3. Mock + biblioteca: nome com "mock", "metrics", "metricas" ou "modelo", ou assinatura do gerador (constantes do PRNG/hash).
//  4. Demais chunks de rota (nome termina em "Page-<hash>") e compartilhados.
// Se houver `.vite/manifest.json`, o nome lógico dos chunks vem dele (preferido); senão vale o nome do arquivo.
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { join, basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (nome, padrao) => {
  const i = args.indexOf(nome);
  return i >= 0 ? args[i + 1] : padrao;
};
const dist = resolve(opt('--dist', join(aqui, '..', '..', 'web', 'dist')));
const saidaJson = opt('--json', null);

const LIMITE = { F6: 200, F7: 60, F8: 130, F9: 120 }; // KB gzip (ADR 0003)

if (!existsSync(join(dist, 'index.html'))) {
  console.error(`Sem build em ${dist}. Rode "npm run build" na raiz antes.`);
  process.exit(2);
}

const arquivos = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? arquivos(join(dir, e.name)).map((f) => join(e.name, f)) : [e.name]));
const todos = arquivos(dist);
const js = todos.filter((f) => f.endsWith('.js') || f.endsWith('.mjs'));
const css = todos.filter((f) => f.endsWith('.css'));
const gz = (buf) => gzipSync(buf, { level: 9 }).length;
const kb = (n) => Math.round((n / 1024) * 100) / 100;

const conteudo = new Map(js.map((f) => [f, readFileSync(join(dist, f), 'utf8')]));

// 1. conjunto inicial
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const refs = [...html.matchAll(/(?:src|href)="([^"]+\.(?:m?js|css))"/g)].map((m) => m[1].replace(/^\//, '').replace(/^\.\//, ''));
const inicial = new Set();
const fila = refs.filter((r) => r.endsWith('.js') || r.endsWith('.mjs'));
const estaticas = (texto) => [...texto.matchAll(/(?:^|[;}\s,])(?:import|export)\s*(?:[^'"()]*?\sfrom\s*)?["']\.{1,2}\/([^"']+\.m?js)["']/g)].map((m) => m[1]);
while (fila.length) {
  const f = fila.pop();
  const chave = js.find((j) => j === f || j.endsWith('/' + basename(f)) || basename(j) === basename(f));
  if (!chave || inicial.has(chave)) continue;
  inicial.add(chave);
  for (const dep of estaticas(conteudo.get(chave))) fila.push(join(dirname(chave), dep).replace(/\\/g, '/'));
}
const cssInicial = new Set(refs.filter((r) => r.endsWith('.css')).map((r) => basename(r)));

const reGraficos = /recharts|d3-scale|d3-shape|victory-vendor|CartesianGrid|ResponsiveContainer/;
const reMock = /1831565813|2166136261|mulberry32/; // assinaturas do PRNG/hash do gerador (não use nomes de função: o app os cita em import dinâmico)
const classificar = (f) => {
  const nome = basename(f);
  if (inicial.has(f)) return 'inicial';
  if (/chart|recharts/i.test(nome) || reGraficos.test(conteudo.get(f))) return 'graficos';
  if (/mock|metrics|metricas|modelo/i.test(nome) || reMock.test(conteudo.get(f))) return 'mock';
  if (/Page-[\w-]+\.m?js$/.test(nome)) return 'rota';
  return 'compartilhado';
};

const linhas = js.map((f) => {
  const buf = readFileSync(join(dist, f));
  return { arquivo: f, classe: classificar(f), bytes: buf.length, gzip: gz(buf), brotli: brotliCompressSync(buf).length };
});
const soma = (classe) => linhas.filter((l) => l.classe === classe).reduce((s, l) => s + l.gzip, 0);
const cssGzip = css.reduce((s, f) => s + gz(readFileSync(join(dist, f))), 0);
const cssIni = css.filter((f) => cssInicial.has(basename(f))).reduce((s, f) => s + gz(readFileSync(join(dist, f))), 0);

const itens = [];
const item = (id, nome, valorKB, limite, bloqueia, extra = '') =>
  itens.push({ id, nome, valorKB: kb(valorKB), limiteKB: limite, bloqueia, ok: valorKB / 1024 < limite, extra });

item('F6', 'Bundle JS inicial (gzip)', soma('inicial'), LIMITE.F6, true);
for (const l of linhas.filter((x) => x.classe === 'rota')) item('F7', `Chunk de rota ${basename(l.arquivo)}`, l.gzip, LIMITE.F7, false, 'alerta');
const graficos = linhas.filter((l) => l.classe === 'graficos');
item('F8', 'Chunk de gráficos (gzip, soma)', soma('graficos'), LIMITE.F8, true, graficos.length ? '' : 'nenhum chunk de gráficos identificado (esperado só quando os painéis existirem)');
item('F9', 'Chunk do mock + biblioteca (gzip, soma)', soma('mock'), LIMITE.F9, false, 'tamanho: alerta');
// F9 bloqueia se mock/biblioteca estiver no inicial
const mockNoInicial = linhas.filter((l) => l.classe === 'inicial' && reMock.test(conteudo.get(l.arquivo)));
itens.push({ id: 'F9-inicial', nome: 'Mock/biblioteca fora do chunk inicial', valorKB: 0, limiteKB: 0, bloqueia: true, ok: mockNoInicial.length === 0, extra: mockNoInicial.map((l) => l.arquivo).join(', ') || 'ok' });

console.log(`Dist: ${dist}`);
console.log('\nChunk                                        classe          bytes     gzip(KB)  brotli(KB)');
for (const l of [...linhas].sort((a, b) => b.gzip - a.gzip))
  console.log(`${l.arquivo.padEnd(44)} ${l.classe.padEnd(14)} ${String(l.bytes).padStart(8)} ${String(kb(l.gzip)).padStart(10)} ${String(kb(l.brotli)).padStart(10)}`);
console.log(`\nCSS total gzip: ${kb(cssGzip)} KB (inicial: ${kb(cssIni)} KB). JS inicial + CSS inicial: ${kb(soma('inicial') + cssIni)} KB`);
console.log('\nOrçamento (ADR 0003)');
for (const i of itens) {
  const situacao = i.ok ? 'ok' : i.bloqueia ? 'FORA (bloqueia)' : 'FORA (alerta)';
  const limite = i.limiteKB ? `< ${i.limiteKB} KB` : '';
  console.log(`${i.id.padEnd(10)} ${i.nome.padEnd(46)} ${String(i.valorKB).padStart(8)} KB ${limite.padEnd(10)} ${situacao}${i.extra ? '  (' + i.extra + ')' : ''}`);
}

const resultado = { dist, geradoEm: new Date().toISOString(), jsInicialMaisCssInicialKB: kb(soma('inicial') + cssIni), chunks: linhas, itens };
if (saidaJson) writeFileSync(saidaJson, JSON.stringify(resultado, null, 2));
process.exit(itens.some((i) => i.bloqueia && !i.ok) ? 1 : 0);
