import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { buildApp } from '../app.js';
import { gerarOpenapi } from '../plataforma/openapi.js';

// `openapi:gerar` grava docs/api/openapi.json; `--verificar` só compara (job de CI). Sem `listen` e sem banco.
const ARQUIVO = fileURLToPath(new URL('../../../docs/api/openapi.json', import.meta.url));
const semBanco = { query: () => Promise.reject(new Error('sem banco')) };
const pool = { ...semBanco, connect: () => Promise.reject(new Error('sem banco')), end: () => Promise.resolve() };
// O webhook entra no contrato mesmo sem credencial: o pool e o segredo abaixo nunca são usados.
const app = await buildApp({ db: semBanco, agora: () => new Date(0), nivelLog: 'silent', webhook: { pool, segredo: 'so-para-gerar-o-contrato' } });
const gerado = await gerarOpenapi(app);
await app.close();
if (process.argv.includes('--verificar')) {
  const versionado = await readFile(ARQUIVO, 'utf8').catch(() => '');
  if (versionado !== gerado) {
    console.error('docs/api/openapi.json desatualizado: rode `pnpm --filter @metricas-dspd/server run openapi:gerar`');
    process.exit(1);
  }
  console.log('openapi.json em dia');
} else {
  await writeFile(ARQUIVO, gerado);
  console.log(`gravado ${ARQUIVO}`);
}
