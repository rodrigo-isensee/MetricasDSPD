#!/usr/bin/env node
// Verificação independente (do lint) da separação BusinessMap x Acelerato e das fronteiras do ADR 0001/0002.
// Lê só texto (imports estáticos, dinâmicos e `export ... from`), sem executar nada. Sai com 1 se achar violação.
// Funciona nos dois layouts: antes da extração (web/src/...) e depois (packages/*/src/...).
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const caminhos = (...c) => c.map((p) => join(raiz, p)).filter(existsSync);

const listar = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? (e.name === 'node_modules' ? [] : listar(join(dir, e.name))) : /\.(ts|tsx|mts)$/.test(e.name) ? [join(dir, e.name)] : [],
  );
const importsDe = (arq) => {
  const t = readFileSync(arq, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  return [...t.matchAll(/(?:from\s*|import\s*\(\s*|import\s+)["']([^"']+)["']/g)].map((m) => m[1]);
};
const resolveAlvo = (arq, spec) => {
  if (spec.startsWith('.')) return resolve(dirname(arq), spec);
  if (spec.startsWith('@/')) return join(raiz, 'web/src', spec.slice(2));
  return spec; // nome de pacote
};

const violacoes = [];
// [rótulo, pastas do lado A, pastas do lado B, padrões de pacote proibidos de A->B e B->A]
const pares = [
  ['metricas: businessmap x acelerato', ['web/src/lib/metrics/businessmap', 'packages/metricas/src/businessmap'], ['web/src/lib/metrics/acelerato', 'packages/metricas/src/acelerato'], [/@metricas-dspd\/metricas\/(businessmap|acelerato)/]],
  ['mock: businessmap x acelerato', ['web/src/mock/businessmap', 'packages/mock/src/businessmap'], ['web/src/mock/acelerato', 'packages/mock/src/acelerato'], []],
];
for (const [rotulo, ladoA, ladoB, pacotes] of pares) {
  const A = caminhos(...ladoA);
  const B = caminhos(...ladoB);
  const checar = (de, para, nomeDe, nomePara) => {
    for (const dir of de) for (const arq of listar(dir)) for (const spec of importsDe(arq)) {
      const alvo = resolveAlvo(arq, spec);
      const cruza = para.some((p) => alvo === p || alvo.startsWith(p + '/')) || pacotes.some((re) => re.test(spec) && spec.includes(nomeDe === 'businessmap' ? 'acelerato' : 'businessmap'));
      if (cruza) violacoes.push(`${rotulo}: ${relative(raiz, arq)} importa "${spec}" (${nomeDe} -> ${nomePara})`);
    }
  };
  checar(A, B, 'businessmap', 'acelerato');
  checar(B, A, 'acelerato', 'businessmap');
}

// Arquivos de acelerato que importam QUALQUER arquivo de businessmap (ex.: ../businessmap/catalogos), mesmo fora das pastas acima.
for (const base of caminhos('web/src', 'packages')) for (const arq of listar(base)) {
  const rel = relative(raiz, arq);
  const ehAc = /\/acelerato\//.test(rel) && !/\/businessmap\//.test(rel);
  const ehBm = /\/businessmap\//.test(rel) && !/\/acelerato\//.test(rel);
  if (!ehAc && !ehBm) continue;
  for (const spec of importsDe(arq)) {
    const alvo = resolveAlvo(arq, spec);
    const texto = typeof alvo === 'string' ? alvo.replace(raiz, '') : '';
    if (ehAc && /\/businessmap(\/|$)/.test(texto) && !violacoes.some((v) => v.includes(rel) && v.includes(spec))) violacoes.push(`acelerato -> businessmap: ${rel} importa "${spec}"`);
    if (ehBm && /\/acelerato(\/|$)/.test(texto) && !violacoes.some((v) => v.includes(rel) && v.includes(spec))) violacoes.push(`businessmap -> acelerato: ${rel} importa "${spec}"`);
  }
}

// Painel não calcula: web/src fora de data/mock não importa metricas nem mock.
for (const arq of listar(join(raiz, 'web/src'))) {
  const rel = relative(raiz, arq);
  if (/web\/src\/(data\/mock|lib\/metrics|mock|contracts)\//.test(rel) || /\.test\.tsx?$/.test(rel) || /web\/src\/test\//.test(rel)) continue;
  for (const spec of importsDe(arq)) {
    if (/^@\/(lib\/metrics|mock)(\/|$)/.test(spec) || /^@metricas-dspd\/(metricas|mock)/.test(spec)) violacoes.push(`painel calcula: ${rel} importa "${spec}"`);
  }
}

// Globals proibidos em metricas/mock (aleatoriedade e tempo injetados).
const proibidos = /\bMath\.random\b|\bDate\.now\b|\bnew Date\(\s*\)|\.(getHours|getDay|getDate|getMonth|getFullYear|getMinutes)\(/;
for (const base of caminhos('web/src/lib/metrics', 'web/src/mock', 'packages/metricas/src', 'packages/mock/src'))
  for (const arq of listar(base)) {
    if (/\.test\.ts$/.test(arq)) continue;
    readFileSync(arq, 'utf8').split('\n').forEach((l, i) => {
      if (!/^\s*(\*|\/\*)/.test(l) && proibidos.test(l.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, ''))) violacoes.push(`global proibido: ${relative(raiz, arq)}:${i + 1}  ${l.trim()}`);
    });
  }

if (violacoes.length) {
  console.log(`FALHOU: ${violacoes.length} violação(ões)`);
  for (const v of violacoes) console.log(' - ' + v);
  process.exit(1);
}
console.log('OK: nenhuma violação de fronteira (BM x AC, painel não calcula, globais proibidos).');
