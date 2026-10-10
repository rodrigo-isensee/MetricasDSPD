import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { buildApp } from '../app.js';
import { gerarOpenapi } from '../plataforma/openapi.js';

// `openapi:gerar` grava docs/api/openapi.json; `--verificar` só compara (job de CI). Sem `listen` e sem banco.
const ARQUIVO = fileURLToPath(new URL('../../../docs/api/openapi.json', import.meta.url));
const semBanco = { query: () => Promise.reject(new Error('sem banco')) };
const app = await buildApp({ db: semBanco, agora: () => new Date(0), nivelLog: 'silent' });
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
