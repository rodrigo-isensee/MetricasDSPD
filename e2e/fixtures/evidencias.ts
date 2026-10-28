import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

// Pasta das evidências (PNG, PDF, JSON) que alguns specs gravam.
// Padrão: `e2e/evidencias-local/<sub>`, ignorada pelo git, para que rodar a E2E não suje a pasta versionada de evidências do QA.
// Só uma execução explícita de QA (`E2E_EVIDENCIAS=qa`, ou `pnpm run test:evidencias-qa`) grava no caminho versionado.
const RAIZ_E2E = resolve(import.meta.dirname, '..');

export function pastaEvidencias(sub: string): string {
  const base =
    process.env.E2E_EVIDENCIAS === 'qa'
      ? resolve(RAIZ_E2E, '../docs/qa/evidencias')
      : resolve(RAIZ_E2E, 'evidencias-local');
  const dir = resolve(base, sub);
  mkdirSync(dir, { recursive: true });
  return dir;
}
