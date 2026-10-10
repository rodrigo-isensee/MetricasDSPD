#!/usr/bin/env node
// Gate do autor: fronteiras + hash da base mock (vs fase A) + tamanho do bundle. Node puro.
// Pré-requisito: na raiz, npm run pronto (ou npm run check e npm run build). Uso: cd e2e && npm run gate
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const ref = resolve(aqui, '..', '..', 'docs/qa/evidencias/hash-base-fase-a.json');
const etapas = [
  ['fronteiras', 'verificar-fronteiras.mjs', []],
  ['hash da base mock (vs fase A)', 'hash-base-mock.mjs', ['--comparar', ref]],
  ['tamanho do bundle', 'tamanho-bundle.mjs', []],
];
const res = [];
for (const [nome, arq, args] of etapas) {
  const r = spawnSync(process.execPath, [join(aqui, arq), ...args], { encoding: 'utf8' });
  const ok = r.status === 0;
  const linhas = `${r.stdout || ''}${r.stderr || ''}`.trim().split('\n').filter(Boolean);
  res.push({ nome, ok });
  console.log(`\n## ${nome}: ${ok ? 'APROVADO' : 'REPROVADO'}`);
  for (const l of ok ? linhas.slice(-6) : linhas.slice(-25)) console.log(`   ${l}`);
}
const falhas = res.filter((x) => !x.ok);
console.log(`\nGATE DO AUTOR: ${falhas.length ? 'REPROVADO (' + falhas.map((f) => f.nome).join(', ') + ')' : 'APROVADO'}`);
process.exit(falhas.length ? 1 : 0);
