#!/usr/bin/env node
// Hash da base mock (decisão D3 / ADR 0002, passo 1 e 4): antes e depois da extração para pacotes o hash TEM de ser igual.
// Uso:
//   node scripts/hash-base-mock.mjs --salvar ../docs/qa/evidencias/hash-base-antes.json   (antes da extração)
//   node scripts/hash-base-mock.mjs --comparar ../docs/qa/evidencias/hash-base-antes.json (depois; sai com 1 se diferir)
//   node scripts/hash-base-mock.mjs                                                       (só imprime)
// Localiza o gerador sozinho: packages/mock/src/index.ts (depois) ou web/src/mock/index.ts (antes). `--mock <caminho>` força.
// Carrega o TypeScript com o Vite de web/ (mesmos aliases do app), sem escrever nada em web/ nem em packages/.
// O hash usa EXATAMENTE a função do teste de determinismo (`hashJson` de prng.ts): FNV-1a de JSON.stringify.
// Também imprime o hash por domínio (BM e AC), para localizar de onde veio uma divergência.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(aqui, '..', '..');
const args = process.argv.slice(2);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : null);

const mockIndex = opt('--mock')
  ? resolve(opt('--mock'))
  : existsSync(join(raiz, 'packages/mock/src/index.ts'))
    ? join(raiz, 'packages/mock/src/index.ts')
    : join(raiz, 'web/src/mock/index.ts');
const prngPath = join(dirname(mockIndex), 'prng.ts');
const layout = mockIndex.includes('packages/mock') ? 'pacotes' : 'web';

// o Vite vem de web/ (ou da raiz, após a extração com hoisting)
const requireDe = (base) => createRequire(pathToFileURL(join(base, 'package.json')));
let vite;
for (const base of [join(raiz, 'web'), raiz, join(raiz, 'packages/mock')]) {
  try {
    vite = await import(pathToFileURL(requireDe(base).resolve('vite')).href);
    break;
  } catch {
    /* tenta o próximo */
  }
}
if (!vite) {
  console.error('Vite não encontrado (rode npm install em web/ ou na raiz).');
  process.exit(2);
}

const servidor = await vite.createServer({
  root: raiz,
  configFile: false,
  logLevel: 'silent',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, watch: null },
  optimizeDeps: { noDiscovery: true, include: [] },
  resolve: { alias: { '@': join(raiz, 'web/src') } },
});

try {
  const mod = await servidor.ssrLoadModule(mockIndex);
  const prng = await servidor.ssrLoadModule(prngPath);
  const t0 = performance.now();
  const base = mod.gerarBaseMock(); // semente e `hoje` padrão (CONFIG_PADRAO)
  const geracaoMs = Math.round(performance.now() - t0);
  const r = {
    layout,
    mock: mockIndex.replace(raiz + '/', ''),
    semente: base.config?.semente,
    hashBase: prng.hashJson(base),
    hashBusinessMap: prng.hashJson(base.bm),
    hashAcelerato: prng.hashJson(base.ac),
    cards: base.bm?.cards?.length ?? base.bm?.dimCard?.length ?? null,
    chamados: base.ac?.chamados?.length ?? null,
    geracaoMs,
  };
  console.log(JSON.stringify(r, null, 2));

  const salvar = opt('--salvar');
  if (salvar) {
    mkdirSync(dirname(resolve(salvar)), { recursive: true });
    writeFileSync(resolve(salvar), JSON.stringify(r, null, 2) + '\n');
    console.error(`Salvo em ${salvar}`);
  }
  const comparar = opt('--comparar');
  if (comparar) {
    const antes = JSON.parse(readFileSync(resolve(comparar), 'utf8'));
    const campos = ['hashBase', 'hashBusinessMap', 'hashAcelerato', 'cards', 'chamados', 'semente'];
    const difere = campos.filter((c) => antes[c] !== r[c]);
    if (difere.length) {
      console.error(`FALHOU: difere em ${difere.join(', ')} (antes: ${difere.map((c) => antes[c]).join(', ')}; agora: ${difere.map((c) => r[c]).join(', ')}).`);
      process.exitCode = 1;
    } else console.error('OK: base mock idêntica à linha de base.');
  }
} finally {
  await servidor.close();
}
